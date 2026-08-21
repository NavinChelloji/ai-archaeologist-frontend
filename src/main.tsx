import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/styles/global.css";
import { App } from "./app/App";
import { reportWebVitals, logMetricsSummary } from "./shared/utils/performance";
import { reportResourceMetrics } from "./shared/utils/bundle-analyzer";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element #root not found");
}

// Initialize performance monitoring
reportWebVitals();

if (process.env.NODE_ENV === "development") {
  // Report metrics on page unload
  window.addEventListener("beforeunload", () => {
    logMetricsSummary();
    reportResourceMetrics();
  });
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
