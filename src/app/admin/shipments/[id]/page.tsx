"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  Title,
  Card,
  Text,
  Group,
  Button,
  Box,
  Stack,
  Badge,
  LoadingOverlay,
  Grid,
  Divider,
  ActionIcon,
  Menu,
  Modal,
  Timeline,
  Paper,
  ThemeIcon,
  Textarea,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconArrowLeft,
  IconEdit,
  IconMapPin,
  IconTruck,
  IconCalendar,
  IconPackage,
  IconLocation,
  IconFileText,
  IconEye,
  IconDownload,
  IconHistory,
  IconClock,
  IconAlertCircle,
  IconTrash,
} from "@tabler/icons-react";

const shipmentStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in-transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
];
import {
  useGetShipmentQuery,
  useUpdateShipmentMutation,
  useUpdateShipmentLocationMutation,
  useAddShipmentNoteMutation,
} from "@/hooks/shipments.hooks";
import {
  useGetDocumentsByShipmentIdQuery,
  useDeleteDocumentMutation,
} from "@/hooks/documents.hooks";
import ShipmentTrackingMap from "@/components/ShipmentTrackingMap";
import { locationNotesFromHistory } from "@/lib/location-notes";
import http from "@/hooks/Http";
import dayjs from "dayjs";

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "pending":
      return "yellow";
    case "in-transit":
      return "blue";
    case "delivered":
      return "green";
    case "completed":
      return "green";
    default:
      return "gray";
  }
};

export default function ShipmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const shipmentId = params.id as string;
  const [isUpdateLocationMode, setIsUpdateLocationMode] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{ url: string; name: string; type: string } | null>(null);

  const { data: shipment, isLoading, error } = useGetShipmentQuery(shipmentId);
  const { mutate: updateShipment } = useUpdateShipmentMutation();
  const { mutate: updateLocation, isPending: isUpdatingLocation } =
    useUpdateShipmentLocationMutation();
  const { mutate: addNote, isPending: isAddingNote } = useAddShipmentNoteMutation();
  const { data: documents } = useGetDocumentsByShipmentIdQuery(shipmentId);
  const { mutate: deleteDocument } = useDeleteDocumentMutation();

  const sendStatusEmailMutation = useMutation({
    mutationFn: (status: string) =>
      http.instance.post(`/shipment/${shipmentId}/send-status-email`, { status }),
    onSuccess: () =>
      notifications.show({
        title: 'Email Sent',
        message: 'Status email sent to customer.',
        color: 'green',
      }),
    onError: () =>
      notifications.show({
        title: 'Error',
        message: 'Failed to send email.',
        color: 'red',
      }),
  });

  const sendBolMutation = useMutation({
    mutationFn: (documentId: string) =>
      http.instance.post(`/document/${documentId}/send-bol`),
    onSuccess: () =>
      notifications.show({
        title: 'BOL Sent',
        message: 'BOL email sent to customer.',
        color: 'green',
      }),
    onError: () =>
      notifications.show({
        title: 'Error',
        message: 'Failed to send BOL email.',
        color: 'red',
      }),
  });

  const [locationNote, setLocationNote] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  const handleStatusChange = (newStatus: string | null) => {
    if (!newStatus || !shipment) return;
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

  const handleLocationClick = (lat: number, lng: number) => {
    if (!isUpdateLocationMode || !shipment) return;
    setPendingLocation({ lat, lng });
    setShowConfirmModal(true);
  };

  const handleConfirmLocationUpdate = () => {
    if (!pendingLocation || !shipment) return;
    updateLocation({
      id: shipment._id,
      latitude: pendingLocation.lat,
      longitude: pendingLocation.lng,
      note: locationNote,
    });
    setShowConfirmModal(false);
    setPendingLocation(null);
    setIsUpdateLocationMode(false);
    setLocationNote("");
  };

  const handleCancelLocationUpdate = () => {
    setShowConfirmModal(false);
    setPendingLocation(null);
    setLocationNote("");
  };

  const handleAddNote = () => {
    if (!manualNote || !shipment) return;
    addNote({
      id: shipment._id,
      note: manualNote,
    });
    setManualNote("");
    setShowAddNoteModal(false);
  };

  const handleDeleteDocument = (doc: { _id: string, name: string }) => {
    modals.openConfirmModal({
      title: "Delete Document",
      children: (
        <Text size="sm">
          Are you sure you want to delete document{" "}
          <Text span fw={700}>
            {doc.name}
          </Text>
          ? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete Document", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteDocument(doc._id);
      },
    });
  };

  if (error) {
    return (
      <Box>
        <Title order={1} c="gray.8" mb="xl">
          Shipment Details
        </Title>
        <Card shadow="sm" padding="lg" withBorder>
          <Text c="red" ta="center">
            Failed to load shipment details. Please try again.
          </Text>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <LoadingOverlay visible={isLoading} overlayProps={{ radius: "sm", blur: 2 }} />

      {/* Header */}
      <Group mb="xl" justify="space-between" align="center">
        <Group>
          <ActionIcon
            variant="light"
            onClick={() => router.push("/admin/shipments")}
            title="Back to Shipments"
          >
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Title order={1} c="gray.8" style={{ margin: 0 }}>
            Shipment Details
          </Title>
        </Group>
        <Button
          leftSection={<IconEdit size={16} />}
          variant="light"
          onClick={() => router.push(`/admin/shipments/${shipmentId}/edit`)}
        >
          Edit Shipment
        </Button>
      </Group>

      {shipment && (
        <Stack gap="xl">
          {/* Row 1: Shipment Details | Customer Info */}
          <Grid align="stretch">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" withBorder h="100%">
                <Group justify="space-between" mb="md">
                  <Title order={3} c="gray.8">
                    <Group gap={0}>
                      <IconTruck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                      <div>Shipment Details</div>
                    </Group>
                  </Title>
                  <Menu shadow="md" width={180} position="bottom-end">
                    <Menu.Target>
                      <Badge
                        color={getStatusBadgeColor(shipment.status || "pending")}
                        variant="light"
                        radius="xl"
                        size="lg"
                        style={{ cursor: "pointer" }}
                      >
                        {shipmentStatusOptions.find(
                          (opt) => opt.value === (shipment.status || "pending")
                        )?.label || "Pending"}
                      </Badge>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {shipmentStatusOptions.map((option) => (
                        <Menu.Item
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                        >
                          <Badge
                            color={getStatusBadgeColor(option.value)}
                            variant="light"
                            radius="xl"
                            size="lg"
                          >
                            {option.label}
                          </Badge>
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                </Group>
                <Divider mb="lg" />
                <Grid>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" fw={500}>Carrier</Text>
                    <Text size="sm" fw={600}>{shipment.carrierName}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" fw={500}>PRO Number</Text>
                    <Text size="sm" fw={600}>{shipment.proNumber}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" fw={500}>FTL Warehouse ID</Text>
                    <Text size="sm" fw={600}>{shipment.ftlWareHouseId}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" fw={500}>PO Number</Text>
                    <Text size="sm" fw={600}>{shipment.poNumber || "N/A"}</Text>
                  </Grid.Col>
                </Grid>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" withBorder h="100%">
                <Title order={3} c="gray.8" mb="md">
                  <Group gap={0}>
                    <IconPackage size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    <div>Customer Information</div>
                  </Group>
                </Title>
                <Divider mb="lg" />
                <Stack gap="md">
                  <Box>
                    <Text size="xs" c="dimmed" fw={500}>Company / Contact Name</Text>
                    <Text size="sm">{shipment.customer?.name || "N/A"}</Text>
                  </Box>
                  {shipment.customer?.email && (
                    <Box>
                      <Text size="xs" c="dimmed" fw={500}>Email Address</Text>
                      <Text size="sm">{shipment.customer.email}</Text>
                    </Box>
                  )}
                  {shipment.customer?.phone && (
                    <Box>
                      <Text size="xs" c="dimmed" fw={500}>Phone Number</Text>
                      <Text size="sm">{shipment.customer.phone}</Text>
                    </Box>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Row 2: Route Info | Tracking Map */}
          <Grid align="stretch">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card shadow="sm" padding="lg" withBorder h="100%">
                <Title order={3} c="gray.8" mb="md">
                  <Group gap={0}>
                    <IconMapPin size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    <div>Route Information</div>
                  </Group>
                </Title>
                <Divider mb="lg" />
                <Stack gap="xl">
                  <Box>
                    <Group gap="xs" mb={4}>
                      <Badge color="blue" variant="filled" size="xs">ORIGIN</Badge>
                      {shipment.origin_address?.businessName && (
                        <Text size="sm" fw={700}>{shipment.origin_address.businessName}</Text>
                      )}
                    </Group>
                    <Text size="sm" c="gray.7">{shipment.origin_address?.formatted_address}</Text>
                  </Box>

                  <Box style={{ position: 'relative', height: '20px' }}>
                    <Divider orientation="vertical" style={{ position: 'absolute', left: '10px', height: '100%' }} />
                  </Box>

                  <Box>
                    <Group gap="xs" mb={4}>
                      <Badge color="red" variant="filled" size="xs">DESTINATION</Badge>
                      {shipment.destination_address?.businessName && (
                        <Text size="sm" fw={700}>{shipment.destination_address.businessName}</Text>
                      )}
                    </Group>
                    <Text size="sm" c="gray.7">{shipment.destination_address?.formatted_address}</Text>
                  </Box>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Card shadow="sm" padding="lg" withBorder h="100%">
                <Group justify="space-between" mb="md">
                  <Title order={3} c="gray.8">
                    <Group gap={0}>
                      <IconLocation size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                      <div>Live Tracking</div>
                    </Group>
                  </Title>
                  <Button
                    variant={isUpdateLocationMode ? "filled" : "light"}
                    color={isUpdateLocationMode ? "orange" : "blue"}
                    size="xs"
                    leftSection={<IconMapPin size={14} />}
                    onClick={() => setIsUpdateLocationMode(!isUpdateLocationMode)}
                  >
                    {isUpdateLocationMode ? "Cancel Selection" : "Update Location"}
                  </Button>
                </Group>
                {isUpdateLocationMode && (
                  <Box mb="sm" p="xs" style={{ backgroundColor: "#fff3cd", borderRadius: "4px" }}>
                    <Text size="xs" c="orange.9">Click map to set new coordinates</Text>
                  </Box>
                )}
                <Box h={400} style={{ borderRadius: '8px', overflow: 'hidden' }}>
                  <ShipmentTrackingMap
                    origin={{
                      latitude: shipment.origin_address?.latitude || 0,
                      longitude: shipment.origin_address?.longitude || 0,
                    }}
                    destination={{
                      latitude: shipment.destination_address?.latitude || 0,
                      longitude: shipment.destination_address?.longitude || 0,
                    }}
                    currentLocation={
                      shipment.current_location
                        ? {
                          latitude: shipment.current_location.latitude,
                          longitude: shipment.current_location.longitude,
                        }
                        : undefined
                    }
                    originAddress={shipment.origin_address?.formatted_address}
                    destinationAddress={shipment.destination_address?.formatted_address}
                    onLocationUpdate={isUpdateLocationMode ? handleLocationClick : undefined}
                    lastNote={shipment.status_history?.[shipment.status_history.length - 1]?.note}
                    lastUpdate={shipment.status_history?.[shipment.status_history.length - 1]?.timestamp}
                    locationNotes={locationNotesFromHistory(shipment.status_history)}
                    height="100%"
                  />
                </Box>
              </Card>
            </Grid.Col>
          </Grid>

          {/* Row 3: Documents (BOL) */}
          <Grid align="stretch">
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" withBorder h="100%">
                <Title order={3} c="gray.8" mb="md">
                  <Group gap={0}>
                    <IconFileText size={20} style={{ marginRight: 8, verticalAlign: 'middle', color: '#E94646' }} />
                    <div>Bill of Loading</div>
                  </Group>
                </Title>
                <Divider mb="lg" />
                {documents?.filter(d => d.category === "BOL").length ? (
                  <Stack gap="sm">
                    {documents.filter(d => d.category === "BOL").map(doc => (
                      <Paper key={doc._id} withBorder p="xs" radius="md">
                        <Group justify="space-between" gap="sm">
                          <Group gap="sm" style={{ flex: 1 }}>
                            <ThemeIcon size="md" variant="light" color="red">
                              <IconFileText size={16} />
                            </ThemeIcon>
                            <Text size="sm" fw={600} truncate maw={300}>{doc.name}</Text>
                          </Group>
                          <Group gap="xs">
                            <Button
                              size="xs"
                              variant="light"
                              color="blue"
                              loading={sendBolMutation.isPending}
                              onClick={() => sendBolMutation.mutate(doc._id)}
                            >
                              Send BOL
                            </Button>
                            <ActionIcon variant="light" color="blue" onClick={() => setViewingDoc({ url: doc.url, name: doc.name, type: doc.type })}>
                              <IconEye size={14} />
                            </ActionIcon>
                            <ActionIcon variant="light" color="gray" component="a" href={doc.url} target="_blank">
                              <IconDownload size={14} />
                            </ActionIcon>
                            <ActionIcon variant="light" color="red" onClick={() => handleDeleteDocument({ _id: doc._id, name: doc.name })}>
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed" fs="italic">No BOL attached.</Text>
                )}
              </Card>
            </Grid.Col>
          </Grid>

          <Card withBorder p="md">
            <Text fw={500} mb="sm">Manual Customer Notifications</Text>
            <Group>
              <Button
                size="xs"
                variant="light"
                color="blue"
                loading={sendStatusEmailMutation.isPending}
                onClick={() => sendStatusEmailMutation.mutate('in-transit')}
              >
                Email: In Transit
              </Button>
              <Button
                size="xs"
                variant="light"
                color="green"
                loading={sendStatusEmailMutation.isPending}
                onClick={() => sendStatusEmailMutation.mutate('delivered')}
              >
                Email: Delivered
              </Button>
            </Group>
          </Card>

          {/* Row 4: Schedule | History */}
          <Grid align="stretch">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" withBorder h="100%">
                <Title order={3} c="gray.8" mb="md">
                  <Group gap={0}>
                    <IconCalendar size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    <div>Schedule & Timing</div>
                  </Group>
                </Title>
                <Divider mb="lg" />
                <Grid gutter="lg">
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" fw={500}>Order Date</Text>
                    <Text size="sm" fw={600}>{dayjs(shipment.dateOfOrder).format("MMM DD, YYYY")}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" fw={500}>Pickup Date</Text>
                    <Text size="sm" fw={600}>
                      {shipment.pickupDate
                        ? dayjs(shipment.pickupDate).format("MMM DD, YYYY")
                        : "N/A"}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" fw={500}>Est. Delivery</Text>
                    <Text size="sm" fw={600}>{dayjs(shipment.estimatedDeliveryDate).format("MMM DD, YYYY")}</Text>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Text size="xs" c="dimmed" fw={500}>Actual Delivery</Text>
                    <Text size="sm" fw={600}>{shipment.deliveryDate ? dayjs(shipment.deliveryDate).format("MMM DD, YYYY") : "Pending"}</Text>
                  </Grid.Col>
                  {shipment.timeSensitive === "yes" && (
                    <Grid.Col span={12}>
                      <Paper p="sm" withBorder style={{ backgroundColor: '#fff5f5', borderLeft: '4px solid #fa5252' }}>
                        <Group gap="xs">
                          <IconAlertCircle size={16} color="#fa5252" />
                          <Text size="sm" fw={700} c="red.9">Time Sensitive</Text>
                        </Group>
                        {shipment.mustArriveByDate && (
                          <Text size="xs" mt={4}>Must Arrive By: {dayjs(shipment.mustArriveByDate).format("MMMM DD, YYYY")}</Text>
                        )}
                        {shipment.timeSensitiveNotes && (
                          <Text size="xs" mt={4} fs="italic">{shipment.timeSensitiveNotes}</Text>
                        )}
                      </Paper>
                    </Grid.Col>
                  )}
                </Grid>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" withBorder h="100%">
                <Group justify="space-between" mb="md">
                  <Title order={3} c="gray.8">
                    <Group gap={0}>
                      <IconHistory size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                      <div>Shipment History</div>
                    </Group>
                  </Title>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => setShowAddNoteModal(true)}
                  >
                    Add Note
                  </Button>
                </Group>
                <Divider mb="lg" />
                <Box h={300} style={{ overflowY: 'auto', paddingRight: '10px' }}>
                  {shipment.status_history && shipment.status_history.length > 0 ? (
                    <Timeline active={0} bulletSize={24} lineWidth={2}>
                      {[...shipment.status_history].reverse().map((entry: any, index: number) => (
                        <Timeline.Item
                          key={index}
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
                            <Text size="sm" mt={4}>{entry.note}</Text>
                          ) : (
                            <Text size="xs" mt={4} fs="italic" c="dimmed">No note provided</Text>
                          )}
                          {entry.location && (
                            <Text size="xs" c="dimmed" mt={2}>
                              Location: {entry.location.latitude.toFixed(4)}, {entry.location.longitude.toFixed(4)}
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
            </Grid.Col>
          </Grid>
        </Stack>
      )}

      {/* Location Update Confirmation Modal */}
      <Modal
        opened={showConfirmModal}
        onClose={handleCancelLocationUpdate}
        title="Confirm Location Update"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to update the shipment location to the selected coordinates?
          </Text>
          {pendingLocation && (
            <Box p="md" style={{ backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
              <Text size="sm" fw={500} mb="xs">
                New Location:
              </Text>
              <Text size="sm">
                Latitude: {pendingLocation.lat.toFixed(6)}
              </Text>
              <Text size="sm">
                Longitude: {pendingLocation.lng.toFixed(6)}
              </Text>
            </Box>
          )}
          <Textarea
            label="Optional Note"
            placeholder="e.g., Arrived at distribution center"
            value={locationNote}
            onChange={(e) => setLocationNote(e.currentTarget.value)}
            rows={3}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={handleCancelLocationUpdate}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLocationUpdate}
              loading={isUpdatingLocation}
              color="blue"
            >
              Confirm Update
            </Button>
          </Group>
        </Stack>
      </Modal>
      {/* Document Viewer Modal */}
      <Modal
        opened={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title={viewingDoc?.name}
        size="70vw"
        radius="md"
        padding="xs"
      >
        {viewingDoc && (
          <Box h="80vh">
            {viewingDoc.type.includes("image") ? (
              <Box style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img
                  src={viewingDoc.url}
                  alt={viewingDoc.name}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>
            ) : (
              <iframe
                src={viewingDoc.url}
                width="100%"
                height="100%"
                style={{ border: "none", borderRadius: "8px" }}
                title="Document Preview"
              />
            )}
          </Box>
        )}
      </Modal>
      {/* Add Manual Note Modal */}
      <Modal
        opened={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        title="Add Shipment Note"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Enter a note to add to the shipment history history. This will be visible in the tracking timeline.
          </Text>
          <Textarea
            placeholder="Type your note here..."
            value={manualNote}
            onChange={(e) => setManualNote(e.currentTarget.value)}
            minRows={4}
            autosize
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setShowAddNoteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              loading={isAddingNote}
              color="blue"
              disabled={!manualNote.trim()}
            >
              Add Note
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
