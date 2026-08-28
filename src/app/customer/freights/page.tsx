"use client";

import React, { useEffect, useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";

const getStatusColor = (status: string) => {
  switch (status) {
    case "cancelled":
      return "red";
    case "delivered":
      return "blue";
    case "pending":
      return "yellow";
    case "in-transit":
      return "green";
    default:
      return "gray";
  }
};

const formatStatusLabel = (status: string) =>
  status.replace("-", " ").toUpperCase();

export default function CustomerFreightsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(
    searchParams.get("status")
  );

  useEffect(() => {
    setStatus(searchParams.get("status"));
  }, [searchParams]);

  const { data: shipmentsData, isLoading } = useGetShipmentsQuery({
    ftlWareHouseId: search || undefined,
    status: status || undefined,
    pageSize: 50,
  });

  const shipments = shipmentsData?.records || [];

  const handleStatusChange = (value: string | null) => {
    setStatus(value);
    if (value) {
      router.replace(`/customer/freights?status=${value}`);
    } else {
      router.replace("/customer/freights");
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
      <Title order={1} c="#293674" fw={700}>
        Shipments
      </Title>

      <Group justify="space-between">
        <TextInput
          placeholder="Search by FTL Warehouse ID..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="All Status"
          data={[
            { value: "pending", label: "Pending" },
            { value: "in-transit", label: "In Transit" },
            { value: "delivered", label: "Delivered" },
          ]}
          value={status}
          onChange={handleStatusChange}
          rightSection={<IconChevronDown size={16} />}
          clearable
        />
      </Group>

      <Paper withBorder radius="md" p={0} style={{ overflow: "hidden" }}>
        <Table verticalSpacing="md" horizontalSpacing="lg" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>FTL Warehouse ID</Table.Th>
              <Table.Th>From</Table.Th>
              <Table.Th>To</Table.Th>
              <Table.Th>PO Number</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {shipments.length > 0 ? (
              shipments.map((shipment: Shipment) => (
                <Table.Tr
                  key={shipment._id}
                  onClick={() => router.push(`/customer/freights/${shipment._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Td>
                    <Text fw={600}>{shipment.ftlWareHouseId || "N/A"}</Text>

                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {shipment.origin_address.city},{" "}
                      {shipment.origin_address.state}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {shipment.destination_address.city},{" "}
                      {shipment.destination_address.state}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{shipment.poNumber || "N/A"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={getStatusColor(shipment.status || "pending")}
                      variant="light"
                    >
                      {formatStatusLabel(shipment.status || "pending")}
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
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" py="xl" c="dimmed">
                    No shipments found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
