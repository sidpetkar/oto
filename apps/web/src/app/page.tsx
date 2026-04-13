"use client";

import dynamic from "next/dynamic";

const AppClient = dynamic(() => import("./app-client"), { ssr: false });

export default function Home() {
  return <AppClient />;
}
