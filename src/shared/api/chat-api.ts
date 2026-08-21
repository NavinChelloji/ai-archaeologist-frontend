import { apiFetch } from "./client";

export interface Citation {
  fileId: string;
  filePath: string;
  startLine: number;
  endLine: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

export interface ChatMessageRequest {
  message: string;
  conversationId?: string;
}

export interface ChatMessageResponse {
  id: string;
  content: string;
  citations: Citation[];
  createdAt: string;
}

export interface ConversationResponse {
  id: string;
  repoId: string;
  messages: ChatMessage[];
  createdAt: string;
}

export async function* sendChatMessage(repoId: string, request: ChatMessageRequest): AsyncGenerator<string> {
  const response = await fetch(`http://localhost:3000/api/v1/chat/${repoId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Chat error: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              yield data.content;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }

    if (buffer.startsWith("data: ")) {
      try {
        const data = JSON.parse(buffer.slice(6));
        if (data.content) {
          yield data.content;
        }
      } catch {
        // Skip invalid JSON
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function getConversation(repoId: string, conversationId: string): Promise<ConversationResponse> {
  return apiFetch<ConversationResponse>(`/api/v1/chat/${repoId}/${conversationId}`);
}

export function getConversationHistory(repoId: string): Promise<ConversationResponse[]> {
  return apiFetch<ConversationResponse[]>(`/api/v1/chat/${repoId}/history`);
}
