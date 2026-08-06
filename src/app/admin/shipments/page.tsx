"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Title,
  Card,
  Table,
  Badge,
  Button,
  Box,
  Group,
  TextInput,
  Select,
  LoadingOverlay,
  ActionIcon,
  Modal,
  Text,
  Menu,
} from "@mantine/core";
import { IconSearch, IconPlus, IconEye, IconTrash, IconDotsVertical, IconEdit } from "@tabler/icons-react";
import {
  useGetShipmentsQuery,
  useDeleteShipmentMutation,
  useUpdateShipmentMutation,
} from "@/hooks/shipments.hooks";
import type { Shipment } from "@/hooks/Api";
import dayjs from "dayjs";
import { ShipmentTimelineModal } from "@/components/ShipmentTimelineModal";
import { useAdminContext } from "@/contexts/AdminContext";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "in-transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
];

const shipmentStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
];

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

const getRouteFromShipment = (shipment: Shipment) => {
  const origin =
    shipment.origin_address?.city ||
    shipment.origin_address?.state ||
    "Unknown";
  const destination =
    shipment.destination_address?.city ||
    shipment.destination_address?.state ||
    "Unknown";
  return `${origin}-${destination}`;
};

export default function AdminShipmentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<Shipment | null>(
    null
  );
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [timelineOpened, setTimelineOpened] = useState(false);

  const { selectedCustomer } = useAdminContext();

  const { data: shipmentsData, isLoading } = useGetShipmentsQuery({
    page: 1,
    pageSize: 100, // Get more shipments for better UX
    customer_id: selectedCustomer?._id,
  });

  const { mutate: deleteShipment, isPending: isDeleting } =
    useDeleteShipmentMutation();

  const { mutate: updateShipment } = useUpdateShipmentMutation();

  // Filter shipments based on search and status
  const filteredShipments =
    shipmentsData?.records.filter((shipment: Shipment) => {
      const matchesSearch =
        searchQuery === "" ||
        (shipment.ftlWareHouseId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shipment.poNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shipment.proNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (shipment.customer?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        getRouteFromShipment(shipment)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (shipment.carrierName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const shipmentStatus = shipment.status || "pending";
      const matchesStatus =
        statusFilter === "all" ||
        statusFilter === null ||
        statusFilter === shipmentStatus;

      return matchesSearch && matchesStatus;
    }) || [];

  const handleDeleteClick = (shipment: Shipment) => {
    setShipmentToDelete(shipment);
    setDeleteModalOpened(true);
  };

  const handleConfirmDelete = () => {
    if (shipmentToDelete) {
      deleteShipment(shipmentToDelete._id, {
        onSuccess: () => {
          setDeleteModalOpened(false);
          setShipmentToDelete(null);
        },
      });
    }
  };

  const handleViewShipment = (shipment: Shipment) => {
    router.push(`/admin/shipments/${shipment._id}`);
  };

  const handleStatusChange = (shipment: Shipment, newStatus: string | null) => {
    if (!newStatus) return;
    updateShipment({
      id: shipment._id,
      data: {
        status: newStatus as
          | "pending"
          | "in-transit"
          | "delivered",
      },
    });
  };

  return (
    <Box>
      {/* Title and Create Button */}
      <Group mb="xl" justify="space-between" align="center">
        <Title order={1} c="gray.8" style={{ margin: 0 }}>
          Tracking Management
        </Title>
        <Button
          leftSection={<IconPlus size={16} />}
          color="red"
          radius="md"
          onClick={() => router.push("/admin/shipments/create")}
        >
          Create Shipment
        </Button>
      </Group>

      {/* Filters */}
      <Group mb="xl" gap="md">
        <TextInput
          placeholder="Search by FTL Warehouse ID, PO, PRO, customer, route, or carrier..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="All Status"
          data={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200 }}
        />
      </Group>

      {/* Shipments Table */}
      <Card shadow="sm" padding="lg" withBorder pos="relative">
        <LoadingOverlay
          visible={isLoading}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>FTL Warehouse ID</Table.Th>
                <Table.Th>PO Number</Table.Th>
                <Table.Th>Route</Table.Th>
                <Table.Th>Carrier</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Date of Order</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredShipments.map((shipment) => (
                <Table.Tr
                  key={shipment._id}
                >
                  <Table.Td>
                    <Text
                      size="sm"
                      fw={500}
                      variant="link"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleViewShipment(shipment)}
                    >
                      {shipment.ftlWareHouseId}
                    </Text>
                  </Table.Td>
                  <Table.Td>{shipment.poNumber || "N/A"}</Table.Td>
                  <Table.Td>{getRouteFromShipment(shipment)}</Table.Td>
                  <Table.Td>{shipment.carrierName}</Table.Td>
                  <Table.Td>
                    <Menu shadow="md" width={150} position="bottom-end">
                      <Menu.Target>
                        <Badge
                          color={getStatusBadgeColor(
                            shipment.status || "pending"
                          )}
                          variant="light"
                          radius="xl"
                          size="md"
                          style={{ cursor: "pointer" }}
                        >
                          {shipmentStatusOptions.find(
                            (opt) =>
                              opt.value === (shipment.status || "pending")
                          )?.label || "Pending"}
                        </Badge>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {shipmentStatusOptions.map((option) => (
                          <Menu.Item
                            key={option.value}
                            onClick={() =>
                              handleStatusChange(shipment, option.value)
                            }
                          >
                            <Badge
                              color={getStatusBadgeColor(option.value)}
                              variant="light"
                              radius="xl"
                              size="md"
                            >
                              {option.label}
                            </Badge>
                          </Menu.Item>
                        ))}
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                  <Table.Td>
                    {dayjs(shipment.dateOfOrder).format("MMM DD, YYYY")}
                  </Table.Td>
                  <Table.Td>
                    <Menu shadow="md" width={200} position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEye size={14} />}
                          onClick={() => handleViewShipment(shipment)}
                        >
                          View Details
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => router.push(`/admin/shipments/${shipment._id}/edit`)}
                        >
                          Edit Shipment
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => handleDeleteClick(shipment)}
                        >
                          Delete Shipment
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {filteredShipments.length === 0 && !isLoading && (
          <Box ta="center" py="xl">
            <Text c="dimmed">No shipments found</Text>
          </Box>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Delete Shipment"
        centered
      >
        <Text>
          Are you sure you want to delete shipment &ldquo;
          {shipmentToDelete?.ftlWareHouseId}&rdquo;? This action cannot be undone.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="light" onClick={() => setDeleteModalOpened(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={isDeleting}
            onClick={handleConfirmDelete}
          >
            Delete
          </Button>
        </Group>
      </Modal>

      <ShipmentTimelineModal
        opened={timelineOpened}
        onClose={() => setTimelineOpened(false)}
        shipment={selectedShipment}
      />
    </Box>
  );
}
