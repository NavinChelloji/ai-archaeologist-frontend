import type {
  ChatCitationEvent,
  ChatDoneEvent,
  ChatErrorEvent,
  ChatUsageEvent,
  ConversationDto,
  ConversationsListResponse,
  MessagesListResponse,
} from "@aca/contracts";
import { apiFetch, apiFetchStream } from "./client";

export function createConversation(repoId: string, title?: string): Promise<ConversationDto> {
  return apiFetch<ConversationDto>(`/api/v1/repositories/${repoId}/conversations`, {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export function listConversations(repoId: string, cursor?: string, pageSize = 20): Promise<ConversationsListResponse> {
  const params = new URLSearchParams({ pageSize: String(pageSize) });
  if (cursor) params.set("cursor", cursor);
  return apiFetch<ConversationsListResponse>(`/api/v1/repositories/${repoId}/conversations?${params}`);
}

export function listMessages(conversationId: string, cursor?: string, pageSize = 50): Promise<MessagesListResponse> {
  const params = new URLSearchParams({ pageSize: String(pageSize) });
  if (cursor) params.set("cursor", cursor);
  return apiFetch<MessagesListResponse>(`/api/v1/conversations/${conversationId}/messages?${params}`);
}

export interface ChatStreamHandlers {
  onToken?: (delta: string) => void;
  onCitation?: (citation: ChatCitationEvent) => void;
  onUsage?: (usage: ChatUsageEvent) => void;
  onDone?: (data: ChatDoneEvent) => void;
  onError?: (err: ChatErrorEvent) => void;
}

/**
 * POSTs the user's message and reads the SSE token stream back
 * (CHAT_SERVICE_PLAN.md "SSE event types"). Native `EventSource` can't POST
 * or set headers, so this is a manual `fetch` + `ReadableStream` reader —
 * the same workaround every browser-based SSE-over-POST client needs.
 */
export async function streamMessage(conversationId: string, content: string, handlers: ChatStreamHandlers, signal?: AbortSignal): Promise<void> {
  const response = await apiFetchStream(`/api/v1/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
    signal,
  });

  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const raw of events) {
      const eventMatch = raw.match(/^event: (\w+)/m);
      const dataMatch = raw.match(/^data: (.*)$/m);
      if (!eventMatch || !dataMatch) continue;

      let data: unknown;
      try {
        data = JSON.parse(dataMatch[1]!);
      } catch {
        continue;
      }

      switch (eventMatch[1]) {
        case "token":
          handlers.onToken?.((data as { delta: string }).delta);
          break;
        case "citation":
          handlers.onCitation?.(data as ChatCitationEvent);
          break;
        case "usage":
          handlers.onUsage?.(data as ChatUsageEvent);
          break;
        case "done":
          handlers.onDone?.(data as ChatDoneEvent);
          break;
        case "error":
          handlers.onError?.(data as ChatErrorEvent);
          break;
      }
    }
  }
}
