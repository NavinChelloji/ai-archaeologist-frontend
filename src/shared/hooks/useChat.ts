import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CitationDto } from "@aca/contracts";
import { createConversation, listConversations, listMessages, streamMessage } from "../api/chat-api";

export function useConversations(repoId: string) {
  return useQuery({
    queryKey: ["conversations", repoId],
    queryFn: () => listConversations(repoId),
    enabled: !!repoId,
  });
}

export function useCreateConversation(repoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (title?: string) => createConversation(repoId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", repoId] });
    },
  });
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => listMessages(conversationId!),
    enabled: !!conversationId,
  });
}

/** Streams one turn of a conversation, buffering tokens/citations locally, then invalidating the message list once the server has the authoritative stored message. */
export function useSendChatMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingCitations, setStreamingCitations] = useState<CitationDto[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) return;

      setIsStreaming(true);
      setStreamingContent("");
      setStreamingCitations([]);
      setError(null);

      try {
        await streamMessage(conversationId, content, {
          onToken: (delta) => setStreamingContent((prev) => prev + delta),
          onCitation: (citation) => setStreamingCitations((prev) => [...prev, citation]),
          onError: (err) => setError(new Error(err.code)),
        });
        await queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to send message"));
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        setStreamingCitations([]);
      }
    },
    [conversationId, queryClient]
  );

  return { sendMessage, isStreaming, streamingContent, streamingCitations, error };
}
