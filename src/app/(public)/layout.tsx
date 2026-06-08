import { PublicShell } from "@/components/PublicShell";
import React from "react";

export const metadata = {
  title: "Freight Team",
  description: "Freight Team Public Page",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
