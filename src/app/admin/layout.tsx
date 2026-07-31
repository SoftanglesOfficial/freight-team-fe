"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
  IconFileText,
  IconTruck,
  IconMessage,
  IconUsers,
  IconSettings,
  IconLogout,
  IconFiles,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Badge, Card } from "@mantine/core";
import { useLogout } from "@/hooks/auth.hooks";
import { useRequireAdmin } from "@/contexts/AuthContext";
import { useGetTotalUnreadForAdminQuery } from "@/hooks/live-chat.hooks";
import { getSocket } from "@/lib/socket";
import { AdminProvider, useAdminContext } from "@/contexts/AdminContext";
import CustomerSearchSelect from "@/components/CustomerSearchSelect";
import NotificationBell from "@/components/NotificationBell";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/admin/quotes", label: "Quotes", icon: IconFileText },
  { href: "/admin/shipments", label: "Tracking", icon: IconTruck },
  { href: "/admin/documents", label: "BOL", icon: IconFiles },
  // { href: "/admin/messages", label: "Conversations", icon: IconMessage },
  { href: "/admin/livechat", label: "Livechat", icon: IconMessageCircle, isLiveChat: true },
  { href: "/admin/customers", label: "Customers", icon: IconUsers },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useRequireAdmin();
  const { selectedCustomer, setSelectedCustomer, clearCustomer } = useAdminContext();
  const pathname = usePathname();
  const logout = useLogout();
  const queryClient = useQueryClient();
  const { data: totalUnread, refetch: refetchTotalUnread } = useGetTotalUnreadForAdminQuery();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const socket = getSocket();

      socket.on('live_chat_updated', (data: any) => {
        console.log("Real-time Stats Update:", data);
        if (typeof data.total_unread_for_admin === 'number') {
          queryClient.setQueryData(["live-chat-total-unread"], data.total_unread_for_admin);
        }
      });

      socket.on('live_chat_message', () => {
        refetchTotalUnread();
      });

      return () => {
        socket.off('live_chat_updated');
        socket.off('live_chat_message');
      };
    }
  }, [isAuthenticated, isAdmin, queryClient, refetchTotalUnread]);

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

  if (!isAuthenticated || !isAdmin) {
    return null; // useRequireAdmin will handle redirect
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
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Header / Customer Selector */}
        <Stack gap="xs" p="md">
          <Group justify="space-between" align="center">
            <Text size="xs" fw={700} c="rgba(255, 255, 255, 0.5)" tt="uppercase" lts="1px">
              Global Focus
            </Text>
            <NotificationBell />
          </Group>

          {!selectedCustomer ? (
            <CustomerSearchSelect
              onSelect={(customer) => setSelectedCustomer(customer)}
              placeholder="Filter by Customer..."
              styles={{
                input: {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  border: "none",
                  color: "white",
                  "&::placeholder": {
                    color: "rgba(255, 255, 255, 0.4)",
                  },
                },
              }}
            />
          ) : (
            <Card
              p="xs"
              radius="md"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <Group justify="space-between" wrap="nowrap" gap="xs">
                <Box style={{ flex: 1, overflow: "hidden" }}>
                  <Text size="sm" fw={600} c="white" truncate>
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </Text>
                  <Text size="xs" c="rgba(255, 255, 255, 0.6)" truncate>
                    {selectedCustomer.email}
                  </Text>
                </Box>
                <Tooltip label="Clear Filter">
                  <ActionIcon
                    variant="subtle"
                    color="gray.4"
                    size="sm"
                    onClick={clearCustomer}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Card>
          )}
        </Stack>

        <Divider color="rgba(255, 255, 255, 0.1)" mx="md" mb="md" />

        {/* Main Navigation */}
        <Stack gap={4} px="md" style={{ flex: 1, overflowY: "auto" }}>
          {navItems
            .filter((item) => {
              if (selectedCustomer) {
                return item.label !== "Customers" && item.label !== "Livechat";
              }
              return true;
            })
            .map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                leftSection={<Icon size={20} />}
                rightSection={item.isLiveChat && (totalUnread || 0) > 0 ? (
                  <Badge size="xs" color="#ff6b35" variant="filled" style={{ border: 'none' }}>
                    {totalUnread}
                  </Badge>
                ) : null}
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
            component={Link}
            href="/admin/settings"
            label="Settings"
            leftSection={<IconSettings size={20} />}
            active={pathname === "/admin/settings"}
            variant="light"
            style={{
              borderRadius: "8px",
            }}
            styles={{
              root: {
                backgroundColor:
                  pathname === "/admin/settings" ? "#ef4444" : "transparent",
                "&:hover": {
                  backgroundColor:
                    pathname === "/admin/settings"
                      ? "#ef4444"
                      : "rgba(255, 255, 255, 0.1)",
                },
              },
              label: {
                color: pathname === "/admin/settings" ? "white" : "#d1d5db",
                fontWeight: pathname === "/admin/settings" ? 500 : 400,
              },
              section: {
                color: pathname === "/admin/settings" ? "white" : "#d1d5db",
              },
            }}
          />
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
