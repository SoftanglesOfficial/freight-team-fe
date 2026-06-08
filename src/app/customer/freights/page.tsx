"use client";

import React, { useState } from "react";
import {
  Title,
  Table,
  Paper,
  Group,
  Text,
  TextInput,
  Select,
  Badge,
  Button,
  Stack,
  Loader,
  Center,
} from "@mantine/core";
import { IconSearch, IconChevronDown, IconEye } from "@tabler/icons-react";
import { useGetShipmentsQuery } from "@/hooks/shipments.hooks";
import type { Shipment } from "@/hooks/Api";
import { useRouter } from "next/navigation";

export default function CustomerFreightsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const { data: shipmentsData, isLoading } = useGetShipmentsQuery({
    proNumber: search || undefined,
    // Add other filters as needed if supported by backend pattern
  });

  const shipments = shipmentsData?.records || [];

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

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      <Title order={1} c="#293674" fw={700}>Shipments</Title>

      <Group justify="space-between">
        <TextInput
          placeholder="Search..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="All Status"
          data={[
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          value={status}
          onChange={setStatus}
          rightSection={<IconChevronDown size={16} />}
          clearable
        />
      </Group>

      <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
        <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>Tracking #</Table.Th>
              <Table.Th>From</Table.Th>
              <Table.Th>To</Table.Th>
              <Table.Th>Consignee</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {shipments.length > 0 ? shipments.map((shipment: Shipment) => (
              <Table.Tr
                key={shipment._id}
                onClick={() => router.push(`/customer/freights/${shipment._id}`)}
                style={{ cursor: "pointer" }}
              >
                <Table.Td>
                  <Text fw={600}>{shipment.proNumber}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{shipment.origin_address.city}, {shipment.origin_address.state}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{shipment.destination_address.city}, {shipment.destination_address.state}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{shipment.customer.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(shipment.status || "pending")} variant="light">
                    {(shipment.status || "pending").toUpperCase()}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconEye size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/customer/freights/${shipment._id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            )) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" py="xl" c="dimmed">No shipments found.</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}


