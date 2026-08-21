import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { JobProgressEvent } from "@aca/contracts";
import { getRepositoryJob } from "../api/repositories-api";
import { getAccessToken } from "../api/token-store";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
const SSE_FAILURE_THRESHOLD = 2;
const POLL_INTERVAL_MS = 3000;

function isTerminal(status: string): boolean {
  return status === "completed" || status === "failed" || status === "cancelled";
}

export type JobProgressConnection = "connecting" | "live" | "polling";

export interface JobProgressState {
  job: JobProgressEvent | null;
  connection: JobProgressConnection;
  /** Set only while falling back — the job data itself still comes through, this is informational. */
  connectionError: Error | null;
}

/**
 * Live indexing progress (REACT_UI_PLAN.md "Indexing Progress"): subscribes
 * to `GET /api/v1/repositories/:repoId/events` via `EventSource`, and falls
 * back to polling `GET /api/v1/repositories/:repoId/job` after
 * `SSE_FAILURE_THRESHOLD` consecutive SSE failures.
 *
 * `EventSource` can't set an `Authorization` header, so the access token
 * rides as a query parameter for this one connection (see the backend's
 * `SseAuthGuard`). The connection is always closed on unmount or once the
 * job reaches a terminal state — a leaked SSE connection per navigation is
 * the most likely resource bug in this app (REACT_UI_PLAN.md).
 */
export function useJobProgress(repoId: string): JobProgressState {
  const [job, setJob] = useState<JobProgressEvent | null>(null);
  const [usePolling, setUsePolling] = useState(false);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const failureCountRef = useRef(0);

  useEffect(() => {
    if (!repoId || usePolling) return;

    const url = new URL(`${API_BASE_URL}/api/v1/repositories/${repoId}/events`);
    const token = getAccessToken();
    if (token) url.searchParams.set("access_token", token);

    const source = new EventSource(url.toString());

    source.onmessage = (event: MessageEvent<string>) => {
      failureCountRef.current = 0;
      try {
        const parsed = JSON.parse(event.data) as JobProgressEvent;
        setJob(parsed);
        if (isTerminal(parsed.status)) {
          source.close();
        }
      } catch {
        // Malformed message — ignore; the next message (or heartbeat) recovers on its own.
      }
    };

    source.onerror = () => {
      failureCountRef.current += 1;
      if (failureCountRef.current >= SSE_FAILURE_THRESHOLD) {
        setConnectionError(new Error("Live updates are unavailable right now; switched to polling."));
        source.close();
        setUsePolling(true);
      }
    };

    return () => {
      source.close();
    };
  }, [repoId, usePolling]);

  const pollQuery = useQuery({
    queryKey: ["repository", repoId, "job"],
    queryFn: () => getRepositoryJob(repoId),
    enabled: Boolean(repoId) && usePolling,
    refetchInterval: (query) => (query.state.data && isTerminal(query.state.data.status) ? false : POLL_INTERVAL_MS),
  });

  if (usePolling && pollQuery.data) {
    const dto = pollQuery.data;
    return {
      job: {
        repoId: dto.repoId,
        jobId: dto.jobId,
        status: dto.status,
        stage: dto.stage,
        progressPercent: dto.progressPercent,
        message: dto.message,
        errorCode: dto.errorCode,
        occurredAt: dto.updatedAt,
      },
      connection: "polling",
      connectionError,
    };
  }

  return {
    job,
    connection: job ? "live" : "connecting",
    connectionError,
  };
}
