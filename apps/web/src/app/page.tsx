"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "../lib/theme";

const AppClient = dynamic(() => import("./app-client"), { ssr: false });

export default function Home() {
  return (
    <ThemeProvider>
      <AppClient />
    </ThemeProvider>
  );
}
