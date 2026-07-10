"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Loader,
  NavLink,
  Stack,
  Text,
  Group,
  Divider,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconTruck,
  IconLogout,
  IconFileText,
} from "@tabler/icons-react";
import { useLogout } from "@/hooks/auth.hooks";
import { useRequireAuth } from "@/contexts/AuthContext";

const navItems = [
  {
    href: "/customer/dashboard",
    label: "Dashboard",
    icon: IconLayoutDashboard,
  },
  { href: "/customer/freights", label: "Where's my Freight", icon: IconTruck },
  {
    href: "/customer/quotes",
    label: "My Quotes",
    icon: IconFileText,
  },
  { href: "/customer/settings", label: "Settings", icon: IconLayoutDashboard },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useRequireAuth();
  const pathname = usePathname();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Loader size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // useRequireAuth will handle redirect
  }

  return (
    <Box style={{ display: "flex", minHeight: "100vh" }}>
      <Box
        style={{
          width: "250px",
          backgroundColor: "#293674",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
        }}
      >
        {/* Header */}
        <Stack gap="md" p="md">
          <Group gap="sm">

            <Text fw={700} c="white" size="sm">
              Hi, {user?.first_name || "Guest"}
            </Text>
          </Group>
          <Divider color="rgba(255, 255, 255, 0.2)" />
        </Stack>

        {/* Main Navigation */}
        <Stack gap={4} px="md" style={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<Icon size={20} />}
                active={isActive}
                variant="light"
                style={{
                  borderRadius: "8px",
                }}
                styles={{
                  root: {
                    backgroundColor: isActive ? "#E94646" : "transparent",
                    "&:hover": {
                      backgroundColor: isActive
                        ? "#ef4444"
                        : "rgba(255, 255, 255, 0.1)",
                    },
                  },
                  label: {
                    color: isActive ? "white" : "#d1d5db",
                    fontWeight: isActive ? 500 : 400,
                  },
                  section: {
                    color: isActive ? "white" : "#d1d5db",
                  },
                }}
              />
            );
          })}
        </Stack>

        {/* Bottom Navigation */}
        <Stack gap={4} px="md" pb="md">
          <NavLink
            component="button"
            onClick={logout}
            label="Logout"
            leftSection={<IconLogout size={20} />}
            variant="light"
            style={{
              borderRadius: "8px",
            }}
            styles={{
              root: {
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              },
              label: {
                color: "#d1d5db",
                fontWeight: 400,
              },
              section: {
                color: "#d1d5db",
              },
            }}
          />
        </Stack>
      </Box>
      <Box component="main" style={{ flex: 1, padding: "2rem" }}>
        {children}
      </Box>
    </Box>
  );
}
