import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ChatMessage } from "../api/chat-api";
import { sendChatMessage, getConversationHistory } from "../api/chat-api";

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
}

export function useChatMessages(repoId: string) {
  return useQuery({
    queryKey: ["chat", repoId, "history"],
    queryFn: () => getConversationHistory(repoId),
    enabled: !!repoId,
  });
}

export function useSendChatMessage(repoId: string) {
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      setIsStreaming(true);
      setStreamingMessage("");

      try {
        for await (const chunk of sendChatMessage(repoId, { message })) {
          setStreamingMessage((prev) => prev + chunk);
        }
      } finally {
        setIsStreaming(false);
      }
    },
  });

  return {
    sendMessage: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
    streamingMessage,
    isStreaming,
  };
}
