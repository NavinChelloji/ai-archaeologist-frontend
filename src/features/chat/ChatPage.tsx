import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Input, Button, ChatMessage, LoadingState, ErrorState } from "../../shared/components";
import { useConversations, useCreateConversation, useMessages, useSendChatMessage } from "../../shared/hooks/useChat";
import styles from "./ChatPage.module.css";

const SUGGESTED_QUESTIONS = [
  "What does this repository do?",
  "Show me the entry points of this application",
  "Which files import the app module?",
  "Explain the dependency structure",
];

export function ChatPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const { data: conversationsData, isLoading: conversationsLoading } = useConversations(repoId ?? "");
  const createConversation = useCreateConversation(repoId ?? "");
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  // Defaults to the most recent conversation until the user explicitly picks one — derived during
  // render rather than synced via an effect, so there's no extra render/flash on first load.
  const activeConversationId = selectedConversationId ?? conversationsData?.conversations[0]?.conversationId;

  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useMessages(activeConversationId);
  const { sendMessage, isStreaming, streamingContent, streamingCitations, error: sendError } = useSendChatMessage(activeConversationId);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData, streamingContent]);

  async function handleNewConversation() {
    const conversation = await createConversation.mutateAsync(undefined);
    setSelectedConversationId(conversation.conversationId);
  }

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;
    const content = inputValue;
    setInputValue("");
    void sendMessage(content);
  }

  if (!repoId) {
    return <ErrorState title="Repository not found" message="Please navigate to a repository first" />;
  }

  const messages = messagesData?.messages.filter((m) => m.role !== "system") ?? [];
  const hasNoMessages = messages.length === 0 && !isStreaming;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Chat</h1>
          <p className={styles.subtitle}>Ask questions about this repository</p>
        </div>
        <Button variant="neutral" onClick={handleNewConversation} disabled={createConversation.isPending}>
          + New chat
        </Button>
      </div>

      {conversationsLoading ? (
        <LoadingState message="Loading conversations..." />
      ) : (
        conversationsData && conversationsData.conversations.length > 0 && (
          <div className={styles.conversationBar}>
            {conversationsData.conversations.map((conversation) => (
              <button
                key={conversation.conversationId}
                className={[styles.conversationChip, conversation.conversationId === activeConversationId && styles.active]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedConversationId(conversation.conversationId)}
              >
                {conversation.title ?? "Untitled conversation"}
              </button>
            ))}
          </div>
        )
      )}

      <div className={styles.content}>
        <div className={styles.messagesContainer}>
          {!activeConversationId && !conversationsLoading ? (
            <div className={styles.suggestedQuestions}>
              <p className={styles.suggestedTitle}>Start a new conversation to ask about this repository.</p>
            </div>
          ) : (
            <>
              {messagesLoading ? (
                <LoadingState message="Loading messages..." />
              ) : messagesError ? (
                <ErrorState
                  title="Failed to load messages"
                  message={messagesError instanceof Error ? messagesError.message : "Could not load messages"}
                  onRetry={() => refetchMessages()}
                />
              ) : (
                <>
                  {hasNoMessages && (
                    <div className={styles.suggestedQuestions}>
                      <p className={styles.suggestedTitle}>Suggested Questions:</p>
                      <div className={styles.questionGrid}>
                        {SUGGESTED_QUESTIONS.map((question) => (
                          <button
                            key={question}
                            className={styles.questionButton}
                            onClick={() => setInputValue(question)}
                            disabled={isStreaming}
                          >
                            <span className={styles.questionIcon}>💭</span>
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {sendError && (
                    <Card>
                      <ErrorState title="Chat Error" message={sendError.message} />
                    </Card>
                  )}

                  <div className={styles.messages}>
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.messageId}
                        role={message.role === "assistant" ? "assistant" : "user"}
                        content={message.content}
                        citations={message.citations}
                        timestamp={new Date(message.createdAt)}
                        onCitationClick={() => {}}
                      />
                    ))}

                    {isStreaming && (
                      <ChatMessage
                        role="assistant"
                        content={streamingContent}
                        citations={streamingCitations}
                        loading={!streamingContent}
                        timestamp={new Date()}
                        onCitationClick={() => {}}
                      />
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <Card className={styles.inputCard}>
          <form onSubmit={handleSendMessage} className={styles.form}>
            <Input
              placeholder="Ask a question about the repository..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isStreaming || !activeConversationId}
              icon="🔍"
            />
            <Button variant="primary" type="submit" disabled={isStreaming || !inputValue.trim() || !activeConversationId}>
              {isStreaming ? "Sending..." : "Send"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
