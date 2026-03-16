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
    "Welcome to the **MOI Data Room** assistant. Ask me anything about MOI's technology, tokenomics, roadmap, or any document in the data room.",
};

/* ------------------------------------------------------------------ */
/*  Markdown component overrides for the chat bubble                  */
/* ------------------------------------------------------------------ */

const mdComponents: ComponentPropsWithoutRef<typeof ReactMarkdown>["components"] = {
  p: ({ children }) => <p style={{ margin: "6px 0" }}>{children}</p>,

  strong: ({ children }) => (
    <strong style={{ color: "var(--accent-2)", fontWeight: 600 }}>{children}</strong>
  ),

  em: ({ children }) => (
    <em style={{ color: "var(--text-dim)", fontStyle: "italic" }}>{children}</em>
  ),

  ul: ({ children }) => (
    <ul style={{ margin: "6px 0", paddingLeft: 18, listStyleType: "disc" }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: "6px 0", paddingLeft: 18, listStyleType: "decimal" }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ margin: "3px 0", lineHeight: 1.5 }}>{children}</li>
  ),

  h1: ({ children }) => (
    <h3 style={{ fontSize: 15, fontWeight: 700, margin: "10px 0 4px", color: "var(--text)" }}>
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h4 style={{ fontSize: 14, fontWeight: 700, margin: "10px 0 4px", color: "var(--text)" }}>
      {children}
    </h4>
  ),
  h3: ({ children }) => (
    <h5 style={{ fontSize: 13, fontWeight: 700, margin: "8px 0 4px", color: "var(--text)" }}>
      {children}
    </h5>
  ),

  code: ({ className, children, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          style={{
            background: "rgba(123,97,255,0.12)",
            color: "var(--accent-2)",
            padding: "1px 5px",
            borderRadius: 4,
            fontSize: 12,
            fontFamily: "monospace",
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
          background: "rgba(0,0,0,0.3)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "10px 12px",
          margin: "6px 0",
          fontSize: 11.5,
          lineHeight: 1.5,
          fontFamily: "monospace",
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
        borderLeft: "3px solid var(--accent)",
        paddingLeft: 12,
        margin: "8px 0",
        color: "var(--text-dim)",
        fontStyle: "italic",
      }}
    >
      {children}
    </blockquote>
  ),

  hr: () => (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid var(--border)",
        margin: "10px 0",
      }}
    />
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "var(--accent-2)",
        textDecoration: "underline",
        textUnderlineOffset: 2,
      }}
    >
      {children}
    </a>
  ),

  table: ({ children }) => (
    <div style={{ overflowX: "auto", margin: "8px 0" }}>
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
        padding: "6px 8px",
        borderBottom: "1px solid var(--border-bright)",
        fontWeight: 600,
        color: "var(--accent-2)",
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
      }}
    >
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td
      style={{
        padding: "5px 8px",
        borderBottom: "1px solid var(--border)",
        color: "var(--text)",
      }}
    >
      {children}
    </td>
  ),
};

/* ------------------------------------------------------------------ */
/*  Assistant bubble with markdown                                     */
/* ------------------------------------------------------------------ */

function AssistantBubble({ content }: { content: string }) {
  return (
    <div
      style={{
        alignSelf: "flex-start",
        maxWidth: "90%",
        padding: "10px 14px",
        borderRadius: 12,
        background: "var(--surface-2)",
        color: "var(--text)",
        fontSize: 13,
        lineHeight: 1.6,
        borderBottomLeftRadius: 4,
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {content}
      </ReactMarkdown>
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
        maxWidth: "85%",
        padding: "10px 14px",
        borderRadius: 12,
        background: "var(--accent)",
        color: "#fff",
        fontSize: 13,
        lineHeight: 1.6,
        borderBottomRightRadius: 4,
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
    <div
      style={{
        alignSelf: "flex-start",
        padding: "12px 16px",
        borderRadius: 12,
        background: "var(--surface-2)",
        borderBottomLeftRadius: 4,
      }}
    >
      <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--accent)",
              opacity: 0.5,
              animation: `dotPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </span>
    </div>
  );
}

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

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
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
  }, [input, loading, messages]);

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
            width: 420,
            maxWidth: "calc(100vw - 48px)",
            height: 560,
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
              padding: "14px 20px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              background: "var(--surface)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: "#34D399",
                boxShadow: "0 0 6px rgba(52,211,153,0.5)",
              }}
            />
            <div
              style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", flex: 1 }}
            >
              MOI Data Room AI
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                background: "var(--surface-2)",
                padding: "3px 8px",
                borderRadius: 6,
                letterSpacing: "0.02em",
              }}
            >
              Claude
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
              gap: 10,
            }}
          >
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <UserBubble key={i} content={msg.content} />
              ) : (
                <AssistantBubble key={i} content={msg.content} />
              )
            )}
            {loading && !messages[messages.length - 1]?.content && <TypingDots />}
            {error && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  fontSize: 13,
                  color: "#f87171",
                  borderBottomLeftRadius: 4,
                }}
              >
                {error}
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
              background: "var(--surface)",
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
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <button
              onClick={loading ? stop : send}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: "none",
                background: loading ? "#ef4444" : "var(--accent)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s, transform 0.1s",
              }}
              title={loading ? "Stop generating" : "Send"}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
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
