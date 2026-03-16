"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const MOCK_RESPONSES = [
  "MOI is a contextual compute network built around interactions (not transactions), TESSERACTs (stateful containers), and the CoCo programming language. It offers a fundamentally different execution model from traditional blockchains.",
  "MOI currently has 4.3K accounts, 14.4K interactions processed, 100 active consensus nodes, 50K+ community members, and $79M in KMOI TVL. You can find detailed metrics in the Overview section.",
  "CoCo (Cocolang) is MOI's smart contract programming language. It's designed specifically for context-aware execution, allowing developers to write logic that responds to the full context of an interaction rather than isolated transactions.",
  "I'd recommend checking the Yellow Paper v2.4 in the Engineering section for the formal protocol specification, or the Architecture Deep Dive for a more accessible technical overview.",
  "The tokenomics model covers supply schedule, utility, staking, and governance mechanics. You'll find the complete Token Economics Paper in the Tokenomics section of the data room.",
];

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Welcome to the MOI Data Room assistant. Ask me anything about MOI's technology, tokenomics, roadmap, or any document in the data room.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const send = useCallback(() => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    // Mock response with delay
    setTimeout(() => {
      const response =
        MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, 1200);
  }, [input, loading]);

  return (
    <>
      {/* FAB */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: 16,
          background: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 24px var(--accent-glow)",
          zIndex: 999,
          transition: "all 0.3s ease",
          transform: open ? "rotate(45deg)" : "none",
        }}
      >
        <span style={{ fontSize: 22, color: "#fff", lineHeight: 1 }}>
          {open ? "+" : "✦"}
        </span>
      </div>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 88,
            right: 24,
            width: 380,
            maxWidth: "calc(100vw - 48px)",
            height: 520,
            maxHeight: "calc(100vh - 120px)",
            borderRadius: 16,
            overflow: "hidden",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            boxShadow:
              "0 16px 64px rgba(0,0,0,0.5), 0 0 40px rgba(123,97,255,0.08)",
            animation: "fadeSlideUp 0.25s ease",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: "#34D399",
              }}
            />
            <div
              style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}
            >
              MOI Data Room AI
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background:
                    msg.role === "user"
                      ? "var(--accent)"
                      : "var(--surface-2)",
                  color: msg.role === "user" ? "#fff" : "var(--text)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  borderBottomRightRadius: msg.role === "user" ? 4 : 12,
                  borderBottomLeftRadius: msg.role === "user" ? 12 : 4,
                }}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "var(--surface-2)",
                  fontSize: 13,
                  color: "var(--text-dim)",
                }}
              >
                <span style={{ display: "inline-flex", gap: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        background: "var(--text-muted)",
                        animation: `dotPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: 12,
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about MOI..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              onClick={send}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "none",
                background: "var(--accent)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}
