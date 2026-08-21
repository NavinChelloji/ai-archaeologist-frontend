import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Input, Button, ChatMessage, type ChatMessageProps, ErrorState } from "../../shared/components";
import { useSendChatMessage } from "../../shared/hooks/useChat";
import styles from "./ChatPage.module.css";

interface Message extends ChatMessageProps {
  id: string;
}

export function ChatPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const { sendMessage, isPending, error, streamingMessage, isStreaming } = useSendChatMessage(repoId ?? "");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm AI Archaeologist. I can help you understand this codebase. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    try {
      sendMessage(inputValue);
      // When the streaming finishes, add the message
      if (!isStreaming && streamingMessage) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: streamingMessage,
          citations: [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const suggestedQuestions = [
    "What does the main.ts file do?",
    "Show me the entry points of this application",
    "Which files import the app.module?",
    "Explain the dependency structure",
  ];

  if (!repoId) {
    return (
      <ErrorState
        title="Repository not found"
        message="Please navigate to a repository first"
      />
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chat</h1>
        <p className={styles.subtitle}>Ask questions about this repository</p>
      </div>

      <div className={styles.content}>
        {/* Messages Area */}
        <div className={styles.messagesContainer}>
          {messages.length === 1 && (
            <div className={styles.suggestedQuestions}>
              <p className={styles.suggestedTitle}>Suggested Questions:</p>
              <div className={styles.questionGrid}>
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    className={styles.questionButton}
                    onClick={() => {
                      setInputValue(question);
                    }}
                    disabled={isPending}
                  >
                    <span className={styles.questionIcon}>💭</span>
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Card>
              <ErrorState
                title="Chat Error"
                message={error instanceof Error ? error.message : "Failed to send message"}
              />
            </Card>
          )}

          <div className={styles.messages}>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} {...msg} onCitationClick={() => {}} />
            ))}

            {(isPending || isStreaming) && (
              <ChatMessage
                role="assistant"
                content={streamingMessage}
                loading={!streamingMessage && isPending}
                timestamp={new Date()}
              />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <Card className={styles.inputCard}>
          <form onSubmit={handleSendMessage} className={styles.form}>
            <Input
              placeholder="Ask a question about the repository..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isPending || isStreaming}
              icon="🔍"
            />
            <Button
              variant="primary"
              type="submit"
              disabled={isPending || isStreaming || !inputValue.trim()}
            >
              {isPending || isStreaming ? "Sending..." : "Send"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
