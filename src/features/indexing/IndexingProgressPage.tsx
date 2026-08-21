import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { JobStage, JobStatus } from "@aca/contracts";
import { Badge, Card, ErrorState, LoadingState } from "../../shared/components";
import { useJobProgress } from "../../shared/hooks/useJobProgress";
import styles from "./IndexingProgressPage.module.css";

const STAGE_LABELS: Record<JobStage, string> = {
  queued: "Queued",
  snapshotting: "Downloading repository snapshot",
  extracting: "Extracting files",
  parsing: "Parsing symbols and imports",
  graphing: "Building graphs",
  embedding: "Generating embeddings",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

/** The five stages that do real work (JOB_ORCHESTRATOR_SERVICE_PLAN.md "Stage Machine") — the timeline shown below the progress bar. */
const TIMELINE_STAGES: JobStage[] = ["snapshotting", "extracting", "parsing", "graphing", "embedding"];

const COMPLETED_REDIRECT_DELAY_MS = 1200;

function badgeVariantForStatus(status: JobStatus): "primary" | "success" | "danger" | "warning" | "neutral" {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "danger";
    case "cancelled":
      return "warning";
    case "running":
      return "primary";
    default:
      return "neutral";
  }
}

function timelineState(stage: JobStage, currentStage: JobStage, status: JobStatus): "done" | "active" | "pending" {
  if (status === "completed") return "done";
  if (stage === currentStage) return "active";
  const currentIndex = TIMELINE_STAGES.indexOf(currentStage);
  const stageIndex = TIMELINE_STAGES.indexOf(stage);
  return currentIndex > stageIndex ? "done" : "pending";
}

/**
 * Live indexing progress (DEVELOPMENT_STAGES.md Stage 4, REACT_UI_PLAN.md
 * "Indexing Progress"). No fake percentages: everything shown here comes
 * straight from `processing_jobs`, substantiated by real batch counts
 * server-side (JOB_ORCHESTRATOR_SERVICE_PLAN.md).
 */
export function IndexingProgressPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const navigate = useNavigate();
  const { job, connection, connectionError } = useJobProgress(repoId ?? "");

  useEffect(() => {
    if (job?.status === "completed" && repoId) {
      const timer = setTimeout(() => navigate(`/repositories/${repoId}`), COMPLETED_REDIRECT_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [job?.status, repoId, navigate]);

  if (!repoId) {
    return <ErrorState title="Missing repository" message="No repository was specified." />;
  }

  if (!job) {
    return <LoadingState message="Connecting to indexing status..." />;
  }

  if (job.status === "failed") {
    return (
      <div className={styles.container}>
        <ErrorState
          title="Indexing failed"
          message={job.message ?? "This repository could not be indexed."}
          details={job.errorCode ?? undefined}
          onRetry={() => navigate("/repositories")}
        />
      </div>
    );
  }

  if (job.status === "cancelled") {
    return (
      <div className={styles.container}>
        <ErrorState title="Indexing cancelled" message="This indexing run was cancelled." onRetry={() => navigate("/repositories")} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Indexing your repository</h1>
          <p className={styles.subtitle} role="status" aria-live="polite">
            {job.status === "completed"
              ? "Done — taking you to the workspace."
              : "This runs in the background — you can leave this page and come back."}
          </p>
        </div>
        <Badge variant={badgeVariantForStatus(job.status)}>{STAGE_LABELS[job.stage]}</Badge>
      </div>

      <Card className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>{job.message ?? STAGE_LABELS[job.stage]}</span>
          <span className={styles.progressPercent}>{job.progressPercent}%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${job.progressPercent}%` }} />
        </div>

        <ol className={styles.stages}>
          {TIMELINE_STAGES.map((stage) => (
            <li key={stage} className={[styles.stageStep, styles[timelineState(stage, job.stage, job.status)]].join(" ")}>
              <span className={styles.stageDot} aria-hidden="true" />
              <span className={styles.stageName}>{STAGE_LABELS[stage]}</span>
            </li>
          ))}
        </ol>
      </Card>

      {connection === "polling" && (
        <p className={styles.connectionNote}>{connectionError?.message ?? "Using periodic status checks."}</p>
      )}
    </div>
  );
}
