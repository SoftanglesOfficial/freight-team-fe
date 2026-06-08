import React from "react";
import { Box, Group, Title } from "@mantine/core";
import Link from "next/link";
import AuthLayoutClient from "./AuthLayoutClient";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Freight Team | Auth",
  description: "Access your Freight Team account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLayoutClient>
      <Box
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f7f7f8 0%, #eef0f2 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 16px",
        }}
      >
        {/* <Link href="/" style={{ textDecoration: "none", marginBottom: "32px" }}>
          <Group gap="sm">
            <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">FTL</span>
            </div>
            <Title order={4} c="dark">
              FTL Warehouse, Inc.
            </Title>
          </Group>
        </Link> */}
        <Logo />
        {children}
      </Box>
    </AuthLayoutClient>
  );
}