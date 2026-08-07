"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Badge,
  Group,
  Indicator,
  Menu,
  ScrollArea,
  Text,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import {
  notificationKeys,
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
        <Menu.Label>Notifications</Menu.Label>
        {records.length === 0 ? (
          <Text size="sm" c="dimmed" px="sm" py="md">
            No new notifications
          </Text>
        ) : (
          <ScrollArea.Autosize mah={320}>
            {records.map((notification) => (
              <Menu.Item
                key={notification._id}
                closeMenuOnClick
                onClick={() => handleClick(notification)}
                style={{
                  cursor: notification.url ? "pointer" : "default",
                  opacity: notification.seen ? 0.75 : 1,
                }}
              >
                <Group gap="xs" wrap="nowrap" justify="space-between" align="flex-start">
                  <Text size="sm" lineClamp={2} style={{ flex: 1 }}>
                    {notification.message}
                  </Text>
                  {!notification.seen && (
                    <Badge size="xs" color="#ff6b35" variant="filled" circle>
                      {" "}
                    </Badge>
                  )}
                </Group>
              </Menu.Item>
            ))}
          </ScrollArea.Autosize>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
