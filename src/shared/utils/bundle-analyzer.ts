/**
 * Bundle analyzer utilities for development
 * Run: npm run build -- --analyze
 */

export interface BundleMetrics {
  name: string;
  size: number;
  gzip: number;
  percentage: number;
}

export function analyzeBundleSize(): void {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.group("Bundle Size Analysis");

    // Get all script tags
    const scripts = document.querySelectorAll("script[src]");
    const totalSize = Array.from(scripts).reduce((sum, script) => {
      const src = script.getAttribute("src");
      if (!src) return sum;
      // Note: This is approximate and requires server headers
      return sum;
    }, 0);

    console.log("Scripts loaded:", scripts.length);
    console.log("For detailed analysis, use: npm run build -- --analyze");
    console.groupEnd();
  }
}

export function getResourceTiming(): Array<{ name: string; duration: number; size: number }> {
  if (typeof window === "undefined") return [];

  return performance
    .getEntriesByType("resource")
    .filter((entry) => entry instanceof PerformanceResourceTiming)
    .map((entry: any) => ({
      name: entry.name.split("/").pop() || entry.name,
      duration: entry.duration,
      size: entry.transferSize || 0,
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 10);
}

export function reportResourceMetrics(): void {
  if (process.env.NODE_ENV === "development") {
    const resources = getResourceTiming();
    if (resources.length > 0) {
      console.group("Top 10 Resources by Size");
      resources.forEach((r) => {
        console.log(`${r.name}: ${(r.size / 1024).toFixed(2)}KB (${r.duration.toFixed(0)}ms)`);
      });
      console.groupEnd();
    }
  }
}
