import React from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Box,
  Timeline,
  Divider,
  Stack,
} from "@mantine/core";
import { IconHistory, IconClock, IconBellRinging } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { StatusHistoryEntry } from "@/hooks/Api";

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "in-transit":
      return "blue";
    case "delivered":
      return "green";
    default:
      return "gray";
  }
};

function publicHistory(statusHistory?: StatusHistoryEntry[] | null): StatusHistoryEntry[] {
  return (statusHistory ?? []).filter((entry) => !entry.internal);
}

export { publicHistory };

interface ShipmentHistorySectionProps {
  statusHistory?: StatusHistoryEntry[] | null;
}

export default function ShipmentHistorySection({
  statusHistory,
}: ShipmentHistorySectionProps) {
  const history = publicHistory(statusHistory);
  const latestUpdate = history.length > 0 ? history[history.length - 1] : null;

  return (
    <Stack gap="lg" mt="xl">
      {latestUpdate && (
        <Card withBorder p="lg" radius="md" style={{ borderLeft: "4px solid #FF9200" }}>
          <Group gap="xs" mb="sm">
            <IconBellRinging size={20} color="#FF9200" />
            <Title order={3} c="gray.8" style={{ margin: 0 }}>
              Latest Update
            </Title>
          </Group>
          <Group gap="xs" mb="xs">
            <Badge color={getStatusBadgeColor(latestUpdate.status)} size="sm">
              {latestUpdate.status.toUpperCase()}
            </Badge>
            <Text size="sm" c="dimmed">
              {dayjs(latestUpdate.timestamp).format("MMM DD, YYYY HH:mm")}
            </Text>
          </Group>
          {latestUpdate.note ? (
            <Text size="md" fw={500}>
              {latestUpdate.note}
            </Text>
          ) : (
            <Text size="sm" c="dimmed" fs="italic">
              No additional details provided.
            </Text>
          )}
        </Card>
      )}

      <Card shadow="sm" padding="lg" withBorder radius="md">
        <Title order={3} c="gray.8" mb="md">
          <Group gap={0}>
            <IconHistory size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
            <span>Shipment History</span>
          </Group>
        </Title>
        <Divider mb="lg" />
        <Box style={{ maxHeight: 400, overflowY: "auto", paddingRight: 10 }}>
          {history.length > 0 ? (
            <Timeline active={0} bulletSize={24} lineWidth={2}>
              {[...history].reverse().map((entry, index) => (
                <Timeline.Item
                  key={`${entry.timestamp}-${index}`}
                  bullet={<IconClock size={12} />}
                  title={
                    <Group gap="xs">
                      <Badge color={getStatusBadgeColor(entry.status)} size="xs">
                        {entry.status.toUpperCase()}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {dayjs(entry.timestamp).format("MMM DD, YYYY HH:mm")}
                      </Text>
                    </Group>
                  }
                >
                  {entry.note ? (
                    <Text size="sm" mt={4}>
                      {entry.note}
                    </Text>
                  ) : (
                    <Text size="xs" mt={4} fs="italic" c="dimmed">
                      No note provided
                    </Text>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Text size="sm" c="dimmed" fs="italic" ta="center" mt="xl">
              No tracking history available yet.
            </Text>
          )}
        </Box>
      </Card>
    </Stack>
  );
}
