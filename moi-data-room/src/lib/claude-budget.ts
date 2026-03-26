/**
 * Claude API usage budget tracker.
 *
 * Enforces two limits on Anthropic API usage:
 *   1. Per-IP request limit   — prevents individual abuse
 *   2. Global daily token budget — caps total spend across all users
 *
 * All state is in-memory. Resets on server restart.
 * For persistent tracking, store counters in Supabase.
 */

// ---------------------------------------------------------------------------
// Configuration (override via environment variables)
// ---------------------------------------------------------------------------

/** Max Claude requests per IP per hour */
const PER_IP_HOURLY_LIMIT = parseInt(process.env.CLAUDE_PER_IP_HOURLY_LIMIT ?? "30", 10);

/** Global daily token budget (input + output combined). Default: 500 000 tokens ≈ $1.50/day on Sonnet */
const DAILY_TOKEN_BUDGET = parseInt(process.env.CLAUDE_DAILY_TOKEN_BUDGET ?? "500000", 10);

/** Max input tokens allowed per single request (prevents giant payloads) */
const MAX_INPUT_TOKENS_PER_REQUEST = parseInt(process.env.CLAUDE_MAX_INPUT_TOKENS ?? "8000", 10);

/** Max output tokens to request from Claude */
const MAX_OUTPUT_TOKENS = parseInt(process.env.CLAUDE_MAX_OUTPUT_TOKENS ?? "2048", 10);

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface IPRecord {
  count: number;
  resetTime: number;
}

const ipUsage = new Map<string, IPRecord>();

let dailyTokensUsed = 0;
let dailyResetTime = getNextMidnightUTC();

function getNextMidnightUTC(): number {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tomorrow.getTime();
}

// Cleanup stale IP records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of ipUsage) {
    if (now > record.resetTime) ipUsage.delete(key);
  }
}, 10 * 60 * 1000);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number;
  dailyTokensRemaining: number;
  ipRequestsRemaining: number;
}

/**
 * Check whether a Claude API call should be allowed.
 * Call this BEFORE making the Anthropic API request.
 */
export function checkClaudeBudget(clientIP: string): BudgetCheckResult {
  const now = Date.now();

  // Reset daily budget at midnight UTC
  if (now > dailyResetTime) {
    dailyTokensUsed = 0;
    dailyResetTime = getNextMidnightUTC();
  }

  // Check global daily token budget
  if (dailyTokensUsed >= DAILY_TOKEN_BUDGET) {
    const retryAfter = Math.ceil((dailyResetTime - now) / 1000);
    return {
      allowed: false,
      reason: "Daily AI usage limit reached. Please try again tomorrow.",
      retryAfter,
      dailyTokensRemaining: 0,
      ipRequestsRemaining: 0,
    };
  }

  // Check per-IP hourly limit
  const ipRecord = ipUsage.get(clientIP);
  if (ipRecord && now <= ipRecord.resetTime) {
    if (ipRecord.count >= PER_IP_HOURLY_LIMIT) {
      const retryAfter = Math.ceil((ipRecord.resetTime - now) / 1000);
      return {
        allowed: false,
        reason: "You've reached the hourly chat limit. Please try again later.",
        retryAfter,
        dailyTokensRemaining: DAILY_TOKEN_BUDGET - dailyTokensUsed,
        ipRequestsRemaining: 0,
      };
    }
    ipRecord.count++;
  } else {
    ipUsage.set(clientIP, { count: 1, resetTime: now + 60 * 60 * 1000 });
  }

  const currentIPRecord = ipUsage.get(clientIP)!;
  return {
    allowed: true,
    dailyTokensRemaining: DAILY_TOKEN_BUDGET - dailyTokensUsed,
    ipRequestsRemaining: PER_IP_HOURLY_LIMIT - currentIPRecord.count,
  };
}

/**
 * Record tokens consumed after a successful Claude API call.
 * Call this AFTER the stream completes or the response is received.
 */
export function recordTokenUsage(inputTokens: number, outputTokens: number): void {
  dailyTokensUsed += inputTokens + outputTokens;
}

/**
 * Get current budget status (for admin stats or monitoring).
 */
export function getBudgetStatus() {
  const now = Date.now();
  if (now > dailyResetTime) {
    dailyTokensUsed = 0;
    dailyResetTime = getNextMidnightUTC();
  }
  return {
    dailyTokensUsed,
    dailyTokenBudget: DAILY_TOKEN_BUDGET,
    dailyTokensRemaining: DAILY_TOKEN_BUDGET - dailyTokensUsed,
    resetsAt: new Date(dailyResetTime).toISOString(),
    perIpHourlyLimit: PER_IP_HOURLY_LIMIT,
    maxInputTokensPerRequest: MAX_INPUT_TOKENS_PER_REQUEST,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  };
}

export { MAX_INPUT_TOKENS_PER_REQUEST, MAX_OUTPUT_TOKENS };
