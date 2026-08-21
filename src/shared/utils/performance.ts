interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

const metrics: PerformanceMetric[] = [];

export function recordMetric(name: string, value: number, unit = "ms"): void {
  metrics.push({
    name,
    value,
    unit,
    timestamp: Date.now(),
  });

  if (process.env.NODE_ENV === "development") {
    console.log(`[Performance] ${name}: ${value}${unit}`);
  }
}

export function measureTime(label: string, fn: () => void): number {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  recordMetric(label, duration);
  return duration;
}

export async function measureAsyncTime(label: string, fn: () => Promise<void>): Promise<number> {
  const start = performance.now();
  await fn();
  const duration = performance.now() - start;
  recordMetric(label, duration);
  return duration;
}

export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

export function clearMetrics(): void {
  metrics.length = 0;
}

export function reportWebVitals(): void {
  if ("web-vital" in window) {
    return;
  }

  // Report paint timings
  const paintEntries = performance.getEntriesByType("paint");
  paintEntries.forEach((entry) => {
    recordMetric(entry.name, entry.duration);
  });

  // Report largest contentful paint
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          recordMetric("LCP", entry.startTime);
        });
      });
      observer.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch {
      // LCP not supported
    }
  }

  // Report cumulative layout shift
  if ("PerformanceObserver" in window) {
    try {
      let cls = 0;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
            recordMetric("CLS", cls);
          }
        });
      });
      observer.observe({ entryTypes: ["layout-shift"] });
    } catch {
      // CLS not supported
    }
  }
}

export function logMetricsSummary(): void {
  if (metrics.length === 0) {
    console.log("No performance metrics recorded");
    return;
  }

  const avgMetric = (name: string): number | null => {
    const values = metrics.filter((m) => m.name === name).map((m) => m.value);
    return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : null;
  };

  const uniqueMetrics = new Set(metrics.map((m) => m.name));
  console.group("Performance Summary");
  uniqueMetrics.forEach((name) => {
    const avg = avgMetric(name);
    if (avg !== null) {
      console.log(`${name}: ${avg.toFixed(2)}ms`);
    }
  });
  console.groupEnd();
}
