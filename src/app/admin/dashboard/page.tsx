"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Title,
  Card,
  Group,
  Text,
  SimpleGrid,
  Table,
  Badge,
  Button,
  Box,
  Stack,
  ThemeIcon,
  Skeleton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconFileText,
  IconTruck,
  IconUsers,
  IconClockHour4,
  IconPlus,
  IconArrowRight,
  IconMessageCircle,
  IconRefresh,
} from "@tabler/icons-react";
import { useGetQuoteRequestsQuery } from "@/hooks/quote-request.hooks";
import { useGetShipmentsQuery } from "@/hooks/shipments.hooks";
import { useGetUsersQuery } from "@/hooks/users.hooks";
import { useGetLiveChatsQuery } from "@/hooks/live-chat.hooks";
import {
  QuoteRequestStatus,
  Role,
  type Shipment,
  type QuoteRequest,
} from "@/hooks/Api";
import dayjs from "dayjs";
import { useAdminContext } from "@/contexts/AdminContext";
import { BASE_URL } from "@/constants/URLS";

// --- Stat Card ---

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isLoading: boolean;
  onClick?: () => void;
}

function StatCard({ label, value, icon, color, isLoading, onClick }: StatCardProps) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      withBorder
      radius="md"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="sm" c="dimmed" fw={500}>
            {label}
          </Text>
          {isLoading ? (
            <Skeleton height={32} width={60} />
          ) : (
            <Text size="xl" fw={700} style={{ fontSize: "1.75rem" }}>
              {value}
            </Text>
          )}
        </Stack>
        <ThemeIcon
          size={48}
          radius="md"
          variant="light"
          color={color}
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}22 100%)`,
          }}
        >
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}

// --- Status Badge Helpers ---

const getQuoteStatusColor = (status: string) => {
  switch (status) {
    case QuoteRequestStatus.PendingQuote:
      return "yellow";
    case QuoteRequestStatus.Quoted:
      return "blue";
    case QuoteRequestStatus.ActiveShipment:
      return "indigo";
    case QuoteRequestStatus.Delivered:
      return "green";
    case QuoteRequestStatus.Cancelled:
      return "red";
    case QuoteRequestStatus.NotAccepted:
      return "orange";
    default:
      return "gray";
  }
};

const getShipmentStatusColor = (status: string) => {
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

const getShipmentStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "in-transit":
      return "In Transit";
    case "delivered":
      return "Delivered";
    default:
      return status;
  }
};

const getRouteFromShipment = (shipment: Shipment) => {
  const origin =
    shipment.origin_address?.city ||
    shipment.origin_address?.state ||
    "Unknown";
  const destination =
    shipment.destination_address?.city ||
    shipment.destination_address?.state ||
    "Unknown";
  return `${origin} → ${destination}`;
};

const formatCurrency = (amount?: number | object | null) => {
  if (amount === undefined || amount === null) return "N/A";
  if (typeof amount !== "number") return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// --- Dashboard Page ---

export default function AdminDashboardPage() {
  const router = useRouter();
  const { selectedCustomer } = useAdminContext();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || BASE_URL}/webhooks/google-sheets/sync-now`,
      );
      const data = await res.json();
      setSyncResult(`Synced: ${data.updated} updated, ${data.skipped} skipped`);
      notifications.show({
        title: "Sync Complete",
        message: `${data.updated} shipments updated from Google Sheets`,
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Sync Failed",
        message: "Could not sync from Google Sheets",
        color: "red",
      });
    } finally {
      setSyncing(false);
    }
  };

  const customerFilter = selectedCustomer ? {
    customer_id: selectedCustomer._id,
    email: selectedCustomer.email
  } : {};

  // Fetch data for stats
  const { data: allQuotes, isLoading: quotesLoading } =
    useGetQuoteRequestsQuery({
      page: 1,
      pageSize: 5,
      customer_id: customerFilter.customer_id
    });

  const { data: pendingQuotes, isLoading: pendingLoading } =
    useGetQuoteRequestsQuery({
      page: 1,
      pageSize: 1,
      status: QuoteRequestStatus.PendingQuote,
      customer_id: customerFilter.customer_id
    });

  const { data: activeShipments, isLoading: activeShipmentsLoading } =
    useGetShipmentsQuery({
      page: 1,
      pageSize: 1,
      status: "pending,in-transit",
      customer_id: customerFilter.customer_id
    });

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
    page: 1,
    pageSize: 1,
    role: Role.StandardUser,
  });

  const { data: liveChats, isLoading: liveChatsLoading } =
    useGetLiveChatsQuery(false);

  // Derived stats
  const pendingCount = pendingQuotes?.pagination?.totalRecords ?? 0;
  const activeShipmentsCount = activeShipments?.pagination?.totalRecords ?? 0;
  const totalCustomers = usersData?.pagination?.totalRecords ?? 0;

  const activeChats = Array.isArray(liveChats)
    ? liveChats.filter((c: any) => {
      const isClosed = c.is_archived;
      if (isClosed) return false;

      // Filter by customer email if focused
      if (selectedCustomer) {
        return c.customer_email === selectedCustomer.email;
      }
      return true;
    }).length
    : 0;

  // Recent data (fetch 5 most recent for tables)
  const { data: recentShipmentsData, isLoading: recentShipmentsLoading } =
    useGetShipmentsQuery({
      page: 1,
      pageSize: 5,
      customer_id: customerFilter.customer_id
    });
  const recentShipments = recentShipmentsData?.records || [];
  const recentQuotes = allQuotes?.records?.slice(0, 5) || [];

  return (
    <Box>
      <Group justify="space-between" align="center" mb="xl">
        <Title order={1} c="gray.8">
          Dashboard
        </Title>
        <Group gap="sm">
          {syncResult && (
            <Text size="sm" c="dimmed">
              {syncResult}
            </Text>
          )}
          <Button
            variant="light"
            color="blue"
            size="sm"
            leftSection={<IconRefresh size={16} />}
            loading={syncing}
            onClick={handleSyncNow}
          >
            Sync from Google Sheets
          </Button>
        </Group>
      </Group>

      {/* Summary Stat Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
        <StatCard
          label="Pending Quotes"
          value={pendingCount}
          icon={<IconClockHour4 size={24} color="white" />}
          color="#E94646"
          isLoading={pendingLoading}
          onClick={() => router.push("/admin/quotes")}
        />
        <StatCard
          label="Active Shipments"
          value={activeShipmentsCount}
          icon={<IconTruck size={24} color="white" />}
          color="#293674"
          isLoading={activeShipmentsLoading}
          onClick={() => router.push("/admin/shipments")}
        />
        <StatCard
          label="Active Chats"
          value={activeChats}
          icon={<IconMessageCircle size={24} color="white" />}
          color="#6741d9"
          isLoading={liveChatsLoading}
          onClick={() => router.push("/admin/livechat")}
        />
        <StatCard
          label="Total Customers"
          value={totalCustomers}
          icon={<IconUsers size={24} color="white" />}
          color="#2e7d32"
          isLoading={usersLoading}
          onClick={() => router.push("/admin/customers")}
        />
      </SimpleGrid>

      {/* Quick Actions */}
      {/* <Group mb="xl" gap="sm">
        <Button
          leftSection={<IconPlus size={16} />}
          variant="filled"
          style={{
            background: "linear-gradient(135deg, #ff6b35 0%, #E94646 100%)",
          }}
          radius="md"
          onClick={() => router.push("/admin/shipments/create")}
        >
          Create Shipment
        </Button>
        <Button
          leftSection={<IconFileText size={16} />}
          variant="light"
          color="orange"
          radius="md"
          onClick={() => router.push("/admin/quotes")}
        >
          View Quotes
        </Button>
        <Button
          leftSection={<IconUsers size={16} />}
          variant="light"
          color="blue"
          radius="md"
          onClick={() => router.push("/admin/customers")}
        >
          Manage Customers
        </Button>
        <Button
          leftSection={<IconMessageCircle size={16} />}
          variant="light"
          color="violet"
          radius="md"
          onClick={() => router.push("/admin/livechat")}
        >
          Live Chat{" "}
          {!liveChatsLoading && activeChats > 0 && (
            <Badge size="xs" color="red" variant="filled" ml={4}>
              {activeChats}
            </Badge>
          )}
        </Button>
      </Group> */}

      {/* Two-column layout for tables */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Recent Shipments */}
        <Card shadow="sm" padding="lg" withBorder radius="md">
          <Group justify="space-between" mb="md">
            <Title order={3} c="gray.8">
              Recent Shipments
            </Title>
            <Button
              variant="filled"
              size="xs"
              color="red"
              leftSection={<IconPlus size={14} />}
              onClick={() => router.push("/admin/shipments/create")}
            >
              Create Shipment
            </Button>
          </Group>
          <Table.ScrollContainer minWidth={400}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>FTL Number</Table.Th>
                  <Table.Th>Customer</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentShipmentsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Table.Tr key={i}>
                      <Table.Td>
                        <Skeleton height={16} />
                      </Table.Td>
                      <Table.Td>
                        <Skeleton height={16} />
                      </Table.Td>
                      <Table.Td>
                        <Skeleton height={16} />
                      </Table.Td>
                      <Table.Td>
                        <Skeleton height={16} />
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : recentShipments.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text ta="center" c="dimmed" py="md">
                        No shipments yet
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  recentShipments.map((shipment: Shipment) => (
                    <Table.Tr
                      key={shipment._id}
                    >
                      <Table.Td>
                        <Text
                          size="sm"
                          fw={500}
                          variant="link"
                          style={{ cursor: "pointer" }}
                          onClick={() => router.push(`/admin/shipments/${shipment._id}`)}
                        >
                          {shipment.proNumber}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {shipment.customer?.name || "N/A"}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getShipmentStatusColor(
                            shipment.status || "pending"
                          )}
                          variant="light"
                          radius="xl"
                          size="sm"
                        >
                          {getShipmentStatusLabel(
                            shipment.status || "pending"
                          )}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {dayjs(shipment.dateOfOrder).format("MMM DD, YYYY")}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>

        {/* Recent Quotes */}
        <Card shadow="sm" padding="lg" withBorder radius="md">
          <Group justify="space-between" mb="md">
            <Title order={3} c="gray.8">
              Recent Quotes
            </Title>
            <Button
              variant="filled"
              size="xs"
              color="orange"
              leftSection={<IconPlus size={14} />}
              onClick={() => router.push("/admin/quotes/create")}
            >
              Create Quote
            </Button>
          </Group>
          <Table.ScrollContainer minWidth={400}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Tracking ID</Table.Th>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Amount</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {quotesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Table.Tr key={i}>
                      <Table.Td>
                        <Skeleton height={16} />
                      </Table.Td>
                      <Table.Td>
                        <Skeleton height={16} />
                      </Table.Td>
                      <Table.Td>
                        <Skeleton height={16} />
                      </Table.Td>
                      <Table.Td>
                        <Skeleton height={16} />
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : recentQuotes.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text ta="center" c="dimmed" py="md">
                        No quotes yet
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  recentQuotes.map((quote: QuoteRequest) => (
                    <Table.Tr key={quote._id}>
                      <Table.Td>
                        <Text
                          size="sm"
                          fw={500}
                          variant="link"
                          style={{ cursor: "pointer" }}
                          onClick={() => router.push(`/admin/quotes?search=${quote.tracking_id}`)}
                        >
                          {quote.tracking_id}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {quote.company_name || quote.full_name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getQuoteStatusColor(quote.status)}
                          variant="light"
                          radius="xl"
                          size="sm"
                        >
                          {quote.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {formatCurrency(quote.quoteAmount)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      </SimpleGrid>
    </Box>
  );
}
