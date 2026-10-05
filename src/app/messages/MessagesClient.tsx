"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Paperclip,
  Sparkles,
  ExternalLink,
  CheckCheck,
  User,
  Package,
  Wrench
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface MessagesClientProps {
  currentUser: any;
  initialConversations: any[];
}

export const MessagesClient: React.FC<MessagesClientProps> = ({
  currentUser,
  initialConversations,
}) => {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<any[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    preselectedId || (initialConversations.length > 0 ? initialConversations[0].id : null)
  );
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch full conversation details when active changes
  useEffect(() => {
    if (!activeConversationId) return;

    fetch(`/api/chat/messages?conversationId=${activeConversationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.conversation) {
          setActiveChat(data.conversation);
        }
      })
      .catch((e) => console.error("Error loading chat:", e));
  }, [activeConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          content: messageInput.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessageInput("");
        setActiveChat((prev: any) => ({
          ...prev,
          messages: [...(prev?.messages || []), data.message],
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: "30px 0 60px 0" }}>
      <div className="container">
        <div style={{ marginBottom: "24px" }}>
          <Badge variant="cyan">Private Encrypted Messaging</Badge>
          <h1 style={{ fontSize: "28px", fontWeight: 800, fontFamily: "var(--font-display)", marginTop: "6px" }}>
            Marketplace Communications
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Direct one-to-one workspace between Requirement Owners and prospective Vendors.
          </p>
        </div>

        {conversations.length === 0 ? (
          <EmptyState
            icon={<MessageSquare size={32} />}
            title="No Active Conversations"
            description="Your direct vendor communications will appear here when you connect via a requirement or offer."
            actionText="Browse Demands"
            actionHref="/requirements"
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "320px 1fr",
              gap: "24px",
              minHeight: "600px",
            }}
            className="chat-layout"
          >
            <style jsx>{`
              @media (max-width: 860px) {
                .chat-layout {
                  grid-template-columns: 1fr !important;
                }
              }
            `}</style>

            {/* Left: Conversation List */}
            <Card style={{ padding: "16px", display: "flex", flexDirection: "column", height: "600px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, paddingBottom: "12px", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}>
                Conversations ({conversations.length})
              </div>
              <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {conversations.map((c) => {
                  const isActive = c.id === activeConversationId;
                  const lastMsg = c.messages?.[0];
                  return (
                    <div
                      key={c.id}
                      onClick={() => setActiveConversationId(c.id)}
                      style={{
                        padding: "12px",
                        borderRadius: "var(--radius-sm)",
                        background: isActive ? "rgba(0, 242, 254, 0.08)" : "transparent",
                        border: isActive ? "1px solid var(--border-glow)" : "1px solid transparent",
                        cursor: "pointer",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {c.requirement?.title?.substring(0, 24)}...
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {new Date(c.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {lastMsg ? `${lastMsg.sender?.name}: ${lastMsg.content}` : "Conversation initiated"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Right: Active Chat Thread */}
            <Card style={{ padding: "0", display: "flex", flexDirection: "column", height: "600px", overflow: "hidden" }}>
              {activeChat ? (
                <>
                  {/* Chat Top Reference Bar */}
                  <div
                    style={{
                      padding: "16px 20px",
                      background: "var(--bg-tertiary)",
                      borderBottom: "1px solid var(--border-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Badge variant={activeChat.requirement?.type === "PRODUCT" ? "cyan" : "purple"} size="sm">
                          {activeChat.requirement?.type}
                        </Badge>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
                          {activeChat.requirement?.title}
                        </span>
                      </div>
                      {activeChat.offer && (
                        <span style={{ fontSize: "12px", color: "var(--accent-cyan)", marginTop: "2px", display: "block" }}>
                          Linked Offer: ₹{activeChat.offer.offeredPrice.toLocaleString()} ({activeChat.offer.status})
                        </span>
                      )}
                    </div>

                    <Link href={`/requirements/${activeChat.requirement?.id}`}>
                      <Button size="sm" variant="outline" rightIcon={<ExternalLink size={13} />}>
                        Inspect Listing
                      </Button>
                    </Link>
                  </div>

                  {/* Messages Feed */}
                  <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {activeChat.messages?.map((msg: any) => {
                      const isMe = msg.senderId === currentUser?.id;
                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isMe ? "flex-end" : "flex-start",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
                            <span>{msg.sender?.name}</span>
                            <span>·</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>

                          <div
                            style={{
                              maxWidth: "75%",
                              padding: "10px 16px",
                              borderRadius: "14px",
                              borderBottomRightRadius: isMe ? "2px" : "14px",
                              borderBottomLeftRadius: !isMe ? "2px" : "14px",
                              background: isMe ? "var(--grad-primary)" : "var(--bg-tertiary)",
                              color: isMe ? "#06090f" : "var(--text-primary)",
                              fontWeight: isMe ? 500 : 400,
                              fontSize: "14px",
                              lineHeight: 1.5,
                              boxShadow: isMe ? "0 2px 10px rgba(0, 242, 254, 0.2)" : "none",
                            }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input Box */}
                  <form
                    onSubmit={handleSendMessage}
                    style={{
                      padding: "16px 20px",
                      borderTop: "1px solid var(--border-subtle)",
                      display: "flex",
                      gap: "10px",
                      background: "var(--bg-card)",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Type your message, query or clarification..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        background: "var(--bg-input)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    />
                    <Button
                      type="submit"
                      variant="glow"
                      isLoading={sending}
                      disabled={!messageInput.trim()}
                      leftIcon={<Send size={15} />}
                    >
                      Send
                    </Button>
                  </form>
                </>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                  Select a conversation to start messaging.
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
