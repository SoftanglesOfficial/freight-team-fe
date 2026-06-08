import React from 'react';
import {
  Modal,
  Timeline,
  Text,
  Group,
  Badge,
  Paper,
  Stack,
  Divider,
  ThemeIcon,
  Box,
  ScrollArea,
} from '@mantine/core';
import {
  IconSettings,
  IconMapPin,
  IconCheck,
  IconTruckDelivery,
  IconNote,
  IconPackage,
  IconClock,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { Shipment, StatusHistoryEntry } from '@/hooks/Api';

dayjs.extend(relativeTime);

interface ShipmentTimelineModalProps {
  opened: boolean;
  onClose: () => void;
  shipment: Shipment | null;
  hideCoordinates?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'yellow';
    case 'in-transit':
      return 'blue';
    case 'delivered':
      return 'green';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <IconClock size={16} />;
    case 'in-transit':
      return <IconTruckDelivery size={16} />;
    case 'delivered':
      return <IconCheck size={16} />;
    case 'location_updated':
    case 'location updated':
      return <IconMapPin size={16} />;
    default:
      return <IconSettings size={16} />;
  }
};

export const ShipmentTimelineModal: React.FC<ShipmentTimelineModalProps> = ({
  opened,
  onClose,
  shipment,
  hideCoordinates = false,
}) => {
  if (!shipment) return null;

  // Sort history from latest to oldest
  const history = [...(shipment.status_history || [])].sort(
    (a, b) => dayjs(b.timestamp).valueOf() - dayjs(a.timestamp).valueOf()
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconPackage size={20} color="#E94646" />
          <Text fw={700} size="lg">
            Shipment Tracking: {shipment.proNumber}
          </Text>
        </Group>
      }
      size="lg"
      radius="md"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      } as any}
    >
      <Stack gap="xl">
        {/* Quick Stats */}
        <Group grow>
          <Paper withBorder p="sm" radius="md" bg="gray.0">
            <Stack gap={2}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Current Status
              </Text>
              <Badge
                color={getStatusColor(shipment.status || 'pending')}
                variant="filled"
                size="lg"
              >
                {shipment.status || 'Pending'}
              </Badge>
            </Stack>
          </Paper>
          <Paper withBorder p="sm" radius="md" bg="gray.0">
            <Stack gap={2}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Carrier
              </Text>
              <Text fw={600}>{shipment.carrierName}</Text>
            </Stack>
          </Paper>
        </Group>

        <Divider label="Timeline" labelPosition="center" />

        <ScrollArea h={400} offsetScrollbars>
          <Box px="md">
            {history.length > 0 ? (
              <Timeline active={0} bulletSize={30} lineWidth={2} color="red">
                {history.map((entry, index) => (
                  <Timeline.Item
                    key={index}
                    bullet={getStatusIcon(entry.status)}
                    title={
                      <Group justify="space-between" align="flex-start">
                        <Text fw={700} size="sm">
                          {entry.status.toUpperCase()}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {dayjs(entry.timestamp).format('MMM DD, YYYY HH:mm')}
                        </Text>
                      </Group>
                    }
                  >
                    <Stack gap="xs" mt={4}>
                      {entry.note && (
                        <Text size="sm" c="gray.7">
                          {entry.note}
                        </Text>
                      )}
                      {entry.location && !hideCoordinates && (
                        <Group gap={4}>
                          <IconMapPin size={12} color="#E94646" />
                          <Text size="xs" c="dimmed">
                            {(entry.location as any).latitude.toFixed(4)}, {(entry.location as any).longitude.toFixed(4)}
                          </Text>
                        </Group>
                      )}
                      {entry.updatedBy && (
                        <Text size="xs" c="dimmed">
                          Updated by: {entry.updatedBy}
                        </Text>
                      )}
                    </Stack>
                  </Timeline.Item>
                ))}
              </Timeline>
            ) : (
              <Stack align="center" py="xl" gap="xs">
                <ThemeIcon size={40} radius="xl" color="gray" variant="light">
                  <IconNote size={20} />
                </ThemeIcon>
                <Text c="dimmed" size="sm">No tracking updates yet</Text>
              </Stack>
            )}
          </Box>
        </ScrollArea>

        <Group justify="flex-end">
          <Text size="xs" c="dimmed">
            Last updated {dayjs(shipment.updatedAt).fromNow()}
          </Text>
        </Group>
      </Stack>
    </Modal>
  );
};
