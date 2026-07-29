import type { ReactNode } from "react";

/** Root layout must exist; html/body live in `[locale]/layout` for correct `lang`. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
