"use client";

import { useState, useRef, useEffect, useCallback, type ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Welcome to **The Context assistant**.\n\nAsk me anything about MOI's technology, tokenomics, roadmap, or any document in the data room.",
};

/* ------------------------------------------------------------------ */
/*  Markdown component overrides for the chat bubble                  */
/* ------------------------------------------------------------------ */

const mdComponents: ComponentPropsWithoutRef<typeof ReactMarkdown>["components"] = {
  p: ({ children }) => <p style={{ margin: "8px 0", lineHeight: 1.65 }}>{children}</p>,

  strong: ({ children }) => (
    <strong style={{ color: "#c4b5fd", fontWeight: 600 }}>{children}</strong>
  ),

  em: ({ children }) => (
    <em style={{ color: "var(--text-dim)", fontStyle: "italic" }}>{children}</em>
  ),

  ul: ({ children }) => (
    <ul style={{ margin: "8px 0", paddingLeft: 20, listStyleType: "none" }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: "8px 0", paddingLeft: 20, listStyleType: "decimal" }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{
      margin: "6px 0",
      lineHeight: 1.55,
      position: "relative",
      paddingLeft: 16,
    }}>
      <span style={{
        position: "absolute",
        left: 0,
        top: 2,
        color: "#7b61ff",
        fontSize: 10,
        fontWeight: 700,
      }}>▸</span>
      {children}
    </li>
  ),

  h1: ({ children }) => (
    <h3 style={{
      fontSize: 15,
      fontWeight: 700,
      margin: "14px 0 6px",
      color: "#e2d9ff",
      borderBottom: "1px solid rgba(123,97,255,0.2)",
      paddingBottom: 4,
    }}>
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 style={{
      fontSize: 14,
      fontWeight: 700,
      margin: "12px 0 4px",
      color: "#d4c8ff",
    }}>
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 style={{
      fontSize: 13,
      fontWeight: 700,
      margin: "10px 0 4px",
      color: "#c4b5fd",
    }}>
      {children}
    </h5>
  ),

  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          style={{
            background: "rgba(123,97,255,0.15)",
            color: "#c4b5fd",
            padding: "2px 6px",
            borderRadius: 5,
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
          }}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        style={{
          display: "block",
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(123,97,255,0.15)",
          borderRadius: 8,
          padding: "10px 12px",
          margin: "8px 0",
          fontSize: 11.5,
          lineHeight: 1.5,
          fontFamily: "'JetBrains Mono', monospace",
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        className={className}
        {...props}
      >
        {children}
      </code>
    );
  },

  pre: ({ children }) => <>{children}</>,

  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: "3px solid #7b61ff",
        paddingLeft: 14,
        margin: "10px 0",
        color: "var(--text-dim)",
        fontStyle: "italic",
        background: "rgba(123,97,255,0.05)",
        padding: "8px 14px",
        borderRadius: "0 8px 8px 0",
      }}
    >
      {children}
    </blockquote>
  ),

  hr: () => (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid rgba(123,97,255,0.2)",
        margin: "12px 0",
      }}
    />
  ),

  a: ({ href, children }) => {
    const isDocLink = href?.startsWith("/doc/");
    const handleDocClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!href) return;
      const docId = href.replace("/doc/", "");
      try {
        const res = await fetch("/api/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ documentId: docId }),
        });
        const data = await res.json();
        if (res.ok && data.url) {
          window.open(data.url, "_blank");
        }
      } catch {
        // silent
      }
    };

    return (
      <a
        href={href}
        onClick={isDocLink ? handleDocClick : undefined}
        target={isDocLink ? undefined : "_blank"}
        rel={isDocLink ? undefined : "noopener noreferrer"}
        style={{
          color: isDocLink ? "#c4b5fd" : "#a78bfa",
          textDecoration: "underline",
          textDecorationStyle: isDocLink ? "dotted" as const : "solid" as const,
          textUnderlineOffset: 2,
          cursor: "pointer",
          transition: "color 0.2s",
          fontWeight: isDocLink ? 500 : undefined,
        }}
        title={isDocLink ? "Open document" : undefined}
      >
        {children}
        {isDocLink && " ↗"}
      </a>
    );
  },

  table: ({ children }) => (
    <div style={{ overflowX: "auto", margin: "10px 0", borderRadius: 8, border: "1px solid rgba(123,97,255,0.15)" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12,
        }}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th
      style={{
        textAlign: "left",
        padding: "8px 10px",
        borderBottom: "1px solid rgba(123,97,255,0.2)",
        fontWeight: 600,
        color: "#c4b5fd",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        background: "rgba(123,97,255,0.06)",
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      style={{
        padding: "6px 10px",
        borderBottom: "1px solid var(--border)",
        color: "var(--text)",
      }}
    >
      {children}
    </td>
  ),
};

/* ------------------------------------------------------------------ */
/*  MOI mark for header + assistant bubbles                             */
/* ------------------------------------------------------------------ */

function AssistantAvatar({ size, radius }: { size: number; radius: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "rgba(18,18,22,0.95)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: size <= 28 ? 2 : 0,
        boxShadow: "0 2px 8px rgba(123,97,255,0.2)",
        border: "1px solid rgba(123,97,255,0.12)",
        overflow: "hidden",
      }}
    >
      <img
        src="/logo-moi-dark.svg"
        alt=""
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.58)}
        style={{ objectFit: "contain", display: "block" }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Assistant bubble with markdown                                     */
/* ------------------------------------------------------------------ */

function AssistantBubble({ content }: { content: string }) {
  return (
    <div style={{ display: "flex", gap: 10, alignSelf: "flex-start", maxWidth: "92%" }}>
      <AssistantAvatar size={28} radius={8} />
      {/* Bubble */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "4px 14px 14px 14px",
          background: "linear-gradient(135deg, rgba(30,28,38,0.95) 0%, rgba(26,26,30,0.95) 100%)",
          border: "1px solid rgba(123,97,255,0.1)",
          color: "var(--text)",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  User bubble                                                        */
/* ------------------------------------------------------------------ */

function UserBubble({ content }: { content: string }) {
  return (
    <div
      style={{
        alignSelf: "flex-end",
        maxWidth: "82%",
        padding: "10px 16px",
        borderRadius: "14px 14px 4px 14px",
        background: "linear-gradient(135deg, #7b61ff 0%, #6d4fef 100%)",
        color: "#fff",
        fontSize: 13,
        lineHeight: 1.6,
        boxShadow: "0 2px 12px rgba(123,97,255,0.25)",
      }}
    >
      {content}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Typing indicator                                                   */
/* ------------------------------------------------------------------ */

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 10, alignSelf: "flex-start" }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "linear-gradient(135deg, #7b61ff 0%, #a78bfa 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 12,
          color: "#fff",
          fontWeight: 700,
          boxShadow: "0 2px 8px rgba(123,97,255,0.3)",
        }}
      >
        M
      </div>
      <div
        style={{
          padding: "14px 18px",
          borderRadius: "4px 14px 14px 14px",
          background: "linear-gradient(135deg, rgba(30,28,38,0.95) 0%, rgba(26,26,30,0.95) 100%)",
          border: "1px solid rgba(123,97,255,0.1)",
        }}
      >
        <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7b61ff, #a78bfa)",
                opacity: 0.6,
                animation: `dotPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Suggested questions                                                */
/* ------------------------------------------------------------------ */

const SUGGESTIONS = [
  "What is MOI?",
  "How does PoXt consensus work?",
  "Tell me about tokenomics",
];

/* ------------------------------------------------------------------ */
/*  Main ChatBot component                                             */
/* ------------------------------------------------------------------ */

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput("");
    setError(null);

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMsg },
    ];
    setMessages(newMessages);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.filter((m) => m !== WELCOME_MESSAGE),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`Chat failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        const snapshot = assistantContent;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: snapshot,
          };
          return updated;
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content) return prev.slice(0, -1);
        return prev;
      });
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  }, [loading, messages]);

  const send = useCallback(() => sendMessage(input), [sendMessage, input]);

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <>
      {/* FAB */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          width: 48,
          height: 48,
          borderRadius: 16,
          background: "linear-gradient(135deg, #7b61ff 0%, #6d4fef 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(123,97,255,0.4), 0 0 40px rgba(123,97,255,0.15)",
          zIndex: 999,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: open ? "rotate(135deg) scale(0.9)" : "none",
        }}
      >
        <span style={{ fontSize: 22, color: "#fff", lineHeight: 1 }}>
          {open ? "+" : "✦"}
        </span>
      </div>

      {/* Chat Window */}
      {open && (
        <div
          className="chat-window-mobile"
          style={{
            position: "fixed",
            bottom: 72,
            right: 16,
            width: 420,
            maxWidth: "calc(100vw - 32px)",
            height: 580,
            maxHeight: "calc(100vh - 100px)",
            borderRadius: 20,
            overflow: "hidden",
            background: "#0f0f12",
            border: "1px solid rgba(123,97,255,0.15)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            boxShadow:
              "0 20px 80px rgba(0,0,0,0.6), 0 0 60px rgba(123,97,255,0.08), inset 0 1px 0 rgba(123,97,255,0.1)",
            animation: "fadeSlideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid rgba(123,97,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
              background: "linear-gradient(180deg, rgba(123,97,255,0.06) 0%, transparent 100%)",
            }}
          >
            <AssistantAvatar size={32} radius={10} />
            <div style={{ flex: 1 }}>
              <div
                style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}
              >
                The Context assistant
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  background: "#34D399",
                  boxShadow: "0 0 6px rgba(52,211,153,0.5)",
                  display: "inline-block",
                }} />
                Online
              </div>
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
              gap: 14,
            }}
          >
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <UserBubble key={i} content={msg.content} />
              ) : (
                <AssistantBubble key={i} content={msg.content} />
              )
            )}

            {/* Suggested questions */}
            {showSuggestions && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginTop: 4,
                animation: "fadeSlideUp 0.4s ease",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2, paddingLeft: 38 }}>
                  Try asking:
                </div>
                {SUGGESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    style={{
                      marginLeft: 38,
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(123,97,255,0.2)",
                      background: "rgba(123,97,255,0.06)",
                      color: "#c4b5fd",
                      fontSize: 12,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(123,97,255,0.12)";
                      e.currentTarget.style.borderColor = "rgba(123,97,255,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(123,97,255,0.06)";
                      e.currentTarget.style.borderColor = "rgba(123,97,255,0.2)";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {loading && !messages[messages.length - 1]?.content && <TypingDots />}
            {error && (
              <div
                style={{
                  alignSelf: "flex-start",
                  marginLeft: 38,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  fontSize: 13,
                  color: "#f87171",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: 14,
              borderTop: "1px solid rgba(123,97,255,0.1)",
              display: "flex",
              gap: 8,
              flexShrink: 0,
              background: "rgba(123,97,255,0.02)",
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
                padding: "11px 16px",
                borderRadius: 12,
                border: "1px solid rgba(123,97,255,0.15)",
                background: "rgba(20,20,24,0.8)",
                color: "var(--text)",
                fontSize: 13,
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(123,97,255,0.4)";
                e.target.style.boxShadow = "0 0 0 3px rgba(123,97,255,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(123,97,255,0.15)";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={loading ? stop : send}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "none",
                background: loading
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : "linear-gradient(135deg, #7b61ff 0%, #6d4fef 100%)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.2s",
                boxShadow: loading
                  ? "0 2px 8px rgba(239,68,68,0.3)"
                  : "0 2px 8px rgba(123,97,255,0.3)",
              }}
              title={loading ? "Stop generating" : "Send"}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {loading ? "■" : "↑"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
