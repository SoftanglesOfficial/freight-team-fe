"use client";

import React from "react";

import {
  Title,
  SimpleGrid,
  Paper,
  Group,
  Text,
  ThemeIcon,
  Stack,
  Badge,
  Box,
} from "@mantine/core";
import { IconPackage, IconTruck, IconClock, IconFileText } from "@tabler/icons-react";
import { useGetShipmentsQuery } from "@/hooks/shipments.hooks";
import { useGetQuoteRequestsQuery } from "@/hooks/quote-request.hooks";
import { QuoteRequestStatus } from "@/hooks/Api";
import { useRouter } from "next/navigation";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { data: shipmentsData, isLoading } = useGetShipmentsQuery();
  const { data: pendingQuotesData, isLoading: quotesLoading } =
    useGetQuoteRequestsQuery({
      page: 1,
      pageSize: 1,
      status: QuoteRequestStatus.PendingQuote,
    });

  const pendingQuotesCount = pendingQuotesData?.pagination?.totalRecords ?? 0;
  const shipments = shipmentsData?.records || [];

  const inTransitCount = shipments.filter(
    (s: any) => s.status === "in-transit"
  ).length;
  const deliveredCount = shipments.filter(
    (s: any) => s.status === "delivered"
  ).length;

  const recentUpdates = shipments.slice(0, 5).map((s: any) => ({
    id: s._id,
    tracking: s.proNumber,
    description: `Shipment ${s.proNumber} ${s.status === 'delivered' ? 'delivered in New York' : 'is currently ' + s.status}`,
    time: "Recently updated",
    status: s.status,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "cancelled": return "red";
      case "delivered": return "blue";
      case "pending": return "yellow";
      case "active":
      case "in_transit": return "green";
      default: return "gray";
    }
  };

  return (
    <Stack gap="xl">
      <Title order={1} c="#293674" fw={700}>Dashboard</Title>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Paper withBorder p="xl" radius="md" style={{ borderLeft: '4px solid #EA4745' }}>
          <Group justify="space-between" align="flex-start">
            <Stack gap={0}>
              <Text size="sm" c="dimmed" fw={500}>In Transit</Text>
              <Text size="xl" fw={700} style={{ fontSize: '2rem' }}>{isLoading ? '...' : inTransitCount}</Text>
            </Stack>
            <ThemeIcon size={48} radius="md" color="orange" variant="light">
              <IconPackage size={28} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper withBorder p="xl" radius="md" style={{ borderLeft: '4px solid #EA4745' }}>
          <Group justify="space-between" align="flex-start">
            <Stack gap={0}>
              <Text size="sm" c="dimmed" fw={500}>Delivered</Text>
              <Text size="xl" fw={700} style={{ fontSize: '2rem' }}>{isLoading ? '...' : deliveredCount}</Text>
            </Stack>
            <ThemeIcon size={48} radius="md" color="orange" variant="light">
              <IconTruck size={28} />
            </ThemeIcon>
          </Group>
        </Paper>

        <Paper
          withBorder
          p="xl"
          radius="md"
          style={{ borderLeft: '4px solid #F59F00', cursor: 'pointer' }}
          onClick={() => router.push('/customer/quotes')}
        >
          <Group justify="space-between" align="flex-start">
            <Stack gap={0}>
              <Text size="sm" c="dimmed" fw={500}>Pending Quotes</Text>
              <Text size="xl" fw={700} style={{ fontSize: '2rem' }}>
                {quotesLoading ? '...' : pendingQuotesCount}
              </Text>
            </Stack>
            <ThemeIcon size={48} radius="md" color="yellow" variant="light">
              <IconFileText size={28} />
            </ThemeIcon>
          </Group>
        </Paper>
      </SimpleGrid>

      <Paper withBorder radius="md" p="md">
        <Stack gap="md">
          <Text fw={700} c="#293674">Recent Updates</Text>
          <Stack gap="xs">
            {recentUpdates.length > 0 ? recentUpdates.map((update) => (
              <Box 
                key={update.id} 
                p="md" 
                style={{ 
                  borderBottom: '1px solid #eee', 
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f9f9f9' }
                } as any}
                onClick={() => router.push(`/customer/freights/${update.id}`)}
              >
                <Group justify="space-between">
                  <Group gap="md">
                    <IconClock size={18} color="gray" />
                    <Stack gap={2}>
                      <Text size="sm" fw={500}>
                        Shipment {update.tracking} {update.status === 'delivered' ? 'delivered' : 'status updated to ' + update.status}
                      </Text>
                      <Text size="xs" c="dimmed">{update.time}</Text>
                    </Stack>
                  </Group>
                  <Badge color={getStatusColor(update.status)} variant="light" size="sm">
                    {update.status.toUpperCase()}
                  </Badge>
                </Group>
              </Box>
            )) : (
              <Text size="sm" c="dimmed" ta="center" py="xl">No recent updates found.</Text>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

