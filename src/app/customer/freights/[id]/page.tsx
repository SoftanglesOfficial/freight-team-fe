"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Timeline,
  Paper,
  ThemeIcon,
  Modal,
} from "@mantine/core";
import {
  IconArrowLeft,
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
} from "@tabler/icons-react";
import {
  useGetShipmentQuery,
} from "@/hooks/shipments.hooks";
import {
  useGetDocumentsByShipmentIdQuery,
} from "@/hooks/documents.hooks";
import ShipmentTrackingMap from "@/components/ShipmentTrackingMap";
import { locationNotesFromHistory } from "@/lib/location-notes";
import dayjs from "dayjs";

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

export default function CustomerShipmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const shipmentId = params.id as string;
  const [viewingDoc, setViewingDoc] = useState<{ url: string; name: string; type: string } | null>(null);

  const { data: shipment, isLoading, error } = useGetShipmentQuery(shipmentId);
  const { data: documents } = useGetDocumentsByShipmentIdQuery(shipmentId);

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
            onClick={() => router.push("/customer/freights")}
            title="Back to Shipments"
          >
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Title order={1} c="#293674" style={{ margin: 0 }}>
            Shipment Details
          </Title>
        </Group>
      </Group>

      {shipment && (
        <Stack gap="xl">
          {/* Row 1: Shipment Details */}
          <Grid align="stretch">
            <Grid.Col span={12}>
              <Card shadow="sm" padding="lg" withBorder h="100%">
                <Group justify="space-between" mb="md">
                  <Title order={3} c="gray.8">
                    <Group gap={0}>
                      <IconTruck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                      <div>Shipment Summary</div>
                    </Group>
                  </Title>
                  <Badge
                    color={getStatusBadgeColor(shipment.status || "pending")}
                    variant="light"
                    radius="xl"
                    size="lg"
                  >
                    {(shipment.status || "pending").toUpperCase()}
                  </Badge>
                </Group>
                <Divider mb="lg" />
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Text size="xs" c="dimmed" fw={500}>Carrier</Text>
                    <Text size="sm" fw={600}>{shipment.carrierName}</Text>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Text size="xs" c="dimmed" fw={500}>PRO Number</Text>
                    <Text size="sm" fw={600}>{shipment.proNumber}</Text>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Text size="xs" c="dimmed" fw={500}>Warehouse ID</Text>
                    <Text size="sm" fw={600}>{shipment.ftlWareHouseId}</Text>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                    <Text size="xs" c="dimmed" fw={500}>Order Date</Text>
                    <Text size="sm" fw={600}>{dayjs(shipment.dateOfOrder).format("MMM DD, YYYY")}</Text>
                  </Grid.Col>
                  {shipment.quote && (
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                      <Text size="xs" c="dimmed" fw={500}>Associated Quote</Text>
                      <Text 
                        size="sm" 
                        fw={600} 
                        c="blue" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const quoteId = typeof shipment.quote === 'string' ? shipment.quote : (shipment.quote as any)._id;
                          // In the future we can navigate to quote details
                          // router.push(`/customer/quotes/${quoteId}`);
                        }}
                      >
                        {typeof shipment.quote === 'string' 
                          ? shipment.quote.slice(-8).toUpperCase() 
                          : (shipment.quote as any).tracking_id || (shipment.quote as any)._id.slice(-8).toUpperCase()}
                      </Text>
                    </Grid.Col>
                  )}
                </Grid>
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
                <Title order={3} c="gray.8" mb="md">
                  <Group gap={0}>
                    <IconLocation size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    <div>Live Tracking</div>
                  </Group>
                </Title>
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
                    lastNote={shipment.status_history?.[shipment.status_history.length - 1]?.note}
                    lastUpdate={shipment.status_history?.[shipment.status_history.length - 1]?.timestamp}
                    locationNotes={locationNotesFromHistory(shipment.status_history)}
                    height="100%"
                    hideCoordinates={true}
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
                            <ActionIcon variant="light" color="blue" onClick={() => setViewingDoc({ url: doc.url, name: doc.name, type: doc.type })}>
                              <IconEye size={14} />
                            </ActionIcon>
                            <ActionIcon variant="light" color="gray" component="a" href={doc.url} target="_blank">
                              <IconDownload size={14} />
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
                <Title order={3} c="gray.8" mb="md">
                  <Group gap={0}>
                    <IconHistory size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    <div>Shipment History</div>
                  </Group>
                </Title>
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
                          {/* Coordinates removed on customer side */}
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
    </Box>
  );
}
