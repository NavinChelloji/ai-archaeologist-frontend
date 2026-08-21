import type { ReactElement } from "react";
import { Providers } from "./providers";
import { AppRoutes } from "./routes";
import { ThemeToggle } from "../shared/components/ThemeToggle";

export function App(): ReactElement {
  return (
    <Providers>
      <ThemeToggle />
      <AppRoutes />
    </Providers>
  );
}
