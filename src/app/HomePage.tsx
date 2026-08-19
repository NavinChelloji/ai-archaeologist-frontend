import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../shared/api/client";

interface DependencyStatus {
  status: "ok" | "error";
  error?: string;
}

interface ReadyResponse {
  status: "ok" | "error";
  dependencies: Record<string, DependencyStatus>;
}

/** Confirms the web app can reach api and shows what api itself reports as ready — the Stage 1 smoke test made visible. */
export function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["api-health"],
    queryFn: () => apiFetch<ReadyResponse>("/health/ready"),
    refetchInterval: 5000,
  });

  return (
    <main>
      <h1>AI Code Archaeologist</h1>
      <p>Pre-implementation scaffold — Stage 1: monorepo and infrastructure.</p>
      <section>
        <h2>api /health/ready</h2>
        {isLoading && <p>Checking…</p>}
        {isError && <p>Could not reach the api service.</p>}
        {data && (
          <ul>
            {Object.entries(data.dependencies).map(([name, dep]) => (
              <li key={name}>
                {name}: {dep.status}
                {dep.error ? ` (${dep.error})` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
