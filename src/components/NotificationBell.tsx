"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Indicator,
  Menu,
  ScrollArea,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { IconBell, IconChevronRight, IconCheck, IconTrash } from "@tabler/icons-react";
import {
  notificationKeys,
  useClearAllNotificationsMutation,
  useMarkAllNotificationsSeenMutation,
  useMarkNotificationSeenMutation,
  useUnseenNotificationsQuery,
} from "@/hooks/notification.hooks";
import { getSocket } from "@/lib/socket";
import type { Notification } from "@/hooks/Api";

export default function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useUnseenNotificationsQuery();
  const markSeen = useMarkNotificationSeenMutation();
  const markAllSeen = useMarkAllNotificationsSeenMutation();
  const clearAll = useClearAllNotificationsMutation();

  const records = data?.records ?? [];
  const count = data?.pagination?.totalRecords ?? records.length;

  useEffect(() => {
    const socket = getSocket();

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    };

    socket.on("new_notification", invalidate);
    socket.on("notification_count_update", invalidate);

    return () => {
      socket.off("new_notification", invalidate);
      socket.off("notification_count_update", invalidate);
    };
  }, [queryClient]);

  const handleClick = async (notification: Notification) => {
    if (!notification.seen) {
      try {
        await markSeen.mutateAsync({
          id: notification._id,
          data: { seen: true },
        });
      } catch {
        // still navigate even if mark-seen fails
      }
    }

    if (notification.url) {
      router.push(notification.url);
    }
  };

  return (
    <Menu shadow="md" width={320} position="bottom-end" withinPortal>
      <Menu.Target>
        <Indicator
          inline
          label={count > 99 ? "99+" : count}
          size={16}
          color="#ff6b35"
          disabled={count < 1}
          processing={count > 0}
        >
          <ActionIcon
            variant="subtle"
            color="gray.2"
            size="lg"
            aria-label="Notifications"
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        <Group justify="space-between" align="center" px="sm" py={4} wrap="nowrap">
          <Menu.Label p={0}>Notifications</Menu.Label>
          {records.length > 0 && (
            <Group gap={4} wrap="nowrap">
              <Button
                variant="subtle"
                size="compact-xs"
                leftSection={<IconCheck size={12} />}
                loading={markAllSeen.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  markAllSeen.mutate();
                }}
              >
                Mark all read
              </Button>
              <Button
                variant="subtle"
                color="red"
                size="compact-xs"
                leftSection={<IconTrash size={12} />}
                loading={clearAll.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll.mutate();
                }}
              >
                Clear
              </Button>
            </Group>
          )}
        </Group>
        {records.length === 0 ? (
          <Text size="sm" c="dimmed" px="sm" py="md">
            No new notifications
          </Text>
        ) : (
          <ScrollArea.Autosize mah={320}>
            {records.map((notification) => (
              <Menu.Item key={notification._id} p={0} closeMenuOnClick>
                <UnstyledButton
                  onClick={() => handleClick(notification)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 12px",
                    textAlign: "left",
                    cursor: notification.url ? "pointer" : "default",
                    opacity: notification.seen ? 0.75 : 1,
                  }}
                >
                  <Group gap="xs" wrap="nowrap" justify="space-between" align="flex-start">
                    <Text size="sm" lineClamp={2} style={{ flex: 1 }}>
                      {notification.message}
                    </Text>
                    <Group gap={4} wrap="nowrap" align="center">
                      {!notification.seen && (
                        <Badge size="xs" color="#ff6b35" variant="filled" circle>
                          {" "}
                        </Badge>
                      )}
                      {notification.url && (
                        <IconChevronRight size={14} style={{ opacity: 0.5, flexShrink: 0 }} />
                      )}
                    </Group>
                  </Group>
                </UnstyledButton>
              </Menu.Item>
            ))}
          </ScrollArea.Autosize>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
