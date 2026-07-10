"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Container,
  Title,
  Card,
  TextInput,
  Button,
  Stack,
  Text,
  Box,
  Alert,
  LoadingOverlay,
  Grid,
  Group,
  Badge,
  Stepper,
  Modal,
  Radio,
  NumberInput,
  Textarea,
  ActionIcon,
  Table,
} from "@mantine/core";
import {
  IconSearch,
  IconAlertCircle,
  IconTruck,
  IconMapPin,
  IconCheck,
  IconX,
  IconArrowRight,
  IconInfoCircle,
  IconSettings,
} from "@tabler/icons-react";
import { useTrackShipmentQuery } from "@/hooks/shipments.hooks";
import ShipmentTrackingMap from "@/components/ShipmentTrackingMap";
import dayjs from "dayjs";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { BASE_URL } from "@/constants/URLS";

const TrackShipmentContent = () => {
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [searchProNumber, setSearchProNumber] = useState("");
  const [declineOpened, { open: setDeclineOpened, close: closeDecline }] = useDisclosure(false);
  const [acceptOpened, { open: setAcceptOpened, close: closeAccept }] = useDisclosure(false);
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [otherReason, setOtherReason] = useState("");
  const [paidPrice, setPaidPrice] = useState<number | string>("");
  const [chosenCarrier, setChosenCarrier] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [declineLoading, setDeclineLoading] = useState(false);

  const router = useRouter();

  // Check for ftl-id query parameter on mount
  useEffect(() => {
    const ftlId = searchParams.get("ftl-id");
    if (ftlId) {
      setTrackingId(ftlId);
      setSearchProNumber(ftlId);
    }
  }, [searchParams]);

  const { data: trackingInfo, isLoading, error, refetch } = useTrackShipmentQuery(searchProNumber);

  const handleSearch = () => {
    if (trackingId.trim()) {
      setSearchProNumber(trackingId.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDecline = async () => {
    if (!trackingInfo?.quote) return;
    setDeclineLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || BASE_URL}/quote-request/${trackingInfo.quote._id}/decline`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            feedback: {
              reason: declineReason,
              paidPrice,
              chosenCarrier,
              otherReason,
              targetPrice,
            },
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      closeDecline();
      refetch();
    } catch {
      notifications.show({
        title: "Error",
        message: "Failed to submit feedback. Please try again.",
        color: "red",
      });
    } finally {
      setDeclineLoading(false);
    }
  };

  return (
    <Container size="xl" py="xl">
      {/* Decline Modal */}
      <Modal
        opened={declineOpened}
        onClose={closeDecline}
        title={<Text fw={700} size="lg">We&apos;re sorry this quote didn&apos;t fit</Text>}
        radius="md"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Your feedback helps us improve our carrier selection and pricing for your future shipments.
            Would you mind telling us why you declined?
          </Text>

          <Radio.Group
            label="Reason for declining"
            value={declineReason || ""}
            onChange={setDeclineReason}
            withAsterisk
          >
            <Stack gap="xs" mt="xs">
              <Radio value="Price too high" label="Price too high" />
              <Radio value="Transit too long" label="Transit too long" />
              <Radio value="Carrier preference" label="Carrier preference" />
              <Radio value="Counteroffer / Target Price" label="I have a target price / counteroffer" />
              <Radio value="Other" label="Other" />
            </Stack>
          </Radio.Group>

          {declineReason === "Price too high" && (
            <NumberInput
              label="What price did you end up paying? (Optional)"
              placeholder="e.g. 1200"
              prefix="$"
              value={paidPrice}
              onChange={setPaidPrice}
              hideControls
            />
          )}

          {(declineReason === "Transit too long" || declineReason === "Carrier preference") && (
            <TextInput
              label="Which carrier did you choose instead? (Optional)"
              placeholder="e.g. XPO, Estes"
              value={chosenCarrier}
              onChange={(e) => setChosenCarrier(e.currentTarget.value)}
            />
          )}

          {declineReason === "Counteroffer / Target Price" && (
            <Textarea
              label="Can you hit $X? Enter your target price or details"
              placeholder='e.g. "$300 from xxx logistics so your quote is out of budget"'
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.currentTarget.value)}
              minRows={3}
              description="Our team will review this and see if we can match it."
            />
          )}

          {declineReason === "Other" && (
            <Textarea
              label="Please tell us more"
              placeholder="Details..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.currentTarget.value)}
            />
          )}

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" color="gray" onClick={closeDecline}>Cancel</Button>
            <Button
              color="red"
              onClick={handleDecline}
              loading={declineLoading}
              disabled={!declineReason}
            >
              Submit Feedback
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Accept Modal */}
      <Modal
        opened={acceptOpened}
        onClose={closeAccept}
        title={<Text fw={700} size="lg">Ready to Book!</Text>}
        radius="md"
        size="md"
      >
        <Stack gap="lg">
          <Text size="sm">
            Great! How would you like to proceed with booking this shipment?
          </Text>

          <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }} onClick={() => router.push(`/track-shipment/accept/${trackingInfo?.quote?._id}`)}>
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={2}>
                <Text fw={600}>Option A: Book Online</Text>
                <Text size="xs" c="dimmed">Fill out the final details and book instantly. Takes under 2 minutes.</Text>
              </Stack>
              <IconArrowRight size={20} color="#FF6B35" />
            </Group>
          </Card>

          <Card withBorder radius="md" p="md" style={{ cursor: 'pointer' }} onClick={() => {
            window.location.href = `mailto:Sales@FTLwarehouse.com?subject=Accept Quote ${trackingInfo?.quote?.tracking_id}&body=I would like to accept this quote. Please handle the booking for me.`;
            closeAccept();
          }}>
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={2}>
                <Text fw={600}>Option B: Prefer to email?</Text>
                <Text size="xs" c="dimmed">Skip the form and reply to your email. Our team will take care of it.</Text>
              </Stack>
              <IconArrowRight size={20} color="#FF6B35" />
            </Group>
          </Card>

          <Button fullWidth variant="subtle" color="gray" onClick={closeAccept}>Maybe Later</Button>
        </Stack>
      </Modal>
      <Stack gap="xl">
        <Box>
          <Title order={1} c="gray.8" mb="md">
            Where&apos;s my Freight?
          </Title>
          <Text c="dimmed" size="lg">
            Enter your tracking number to track your shipment
          </Text>
        </Box>

        {/* Search Card */}
        <Card shadow="sm" padding="lg" withBorder radius="md">
          <Stack gap="md">
            <Text fw={600} size="lg" c="gray.8">
              Enter Tracking Number
            </Text>
            <Group gap="sm" align="flex-end">
              <TextInput
                placeholder="e.g., RT-2025-001233"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ flex: 1 }}
                size="md"
              />
              <Button
                leftSection={<IconSearch size={16} />}
                onClick={handleSearch}
                size="md"
                style={{
                  background: "linear-gradient(90deg, #EA4745 0%, #FF9200 100%)",
                }}
              >
                Track Shipment
              </Button>
            </Group>
          </Stack>
        </Card>

        {/* Results */}
        {searchProNumber && (
          <Card shadow="sm" padding="lg" withBorder radius="md" pos="relative">
            <LoadingOverlay visible={isLoading} overlayProps={{ radius: "sm", blur: 2 }} />

            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Tracking Error"
                color="red"
                variant="light"
                mb="md"
              >
                Shipment not found. Please check your tracking number and try again.
              </Alert>
            )}

            {trackingInfo && !error && (
              <Stack gap="xl">
                {/* Shipment Details */}
                {trackingInfo.shipment && (
                  <Box>
                    <Title order={2} c="gray.8" mb="md">
                      Order ID: {trackingInfo.shipment.proNumber}
                    </Title>

                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Card withBorder p="md" h="100%">
                          <Group gap="xs" mb="sm">
                            <IconTruck size={20} />
                            <Text fw={600} size="sm" c="dimmed">
                              Tracking Information
                            </Text>
                          </Group>
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text size="sm" c="dimmed">
                                Tracking Number:
                              </Text>
                              <Text fw={500}>{trackingInfo?.shipment?.proNumber}</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="sm" c="dimmed">
                                Carrier:
                              </Text>
                              <Text fw={500}>{trackingInfo.shipment.carrierName}</Text>
                            </Group>
                            <Group justify="space-between">
                              <Text size="sm" c="dimmed">
                                Status:
                              </Text>
                              <Badge color={
                                trackingInfo.shipment.status === 'delivered' ? 'green' :
                                  trackingInfo.shipment.status === 'in-transit' ? 'blue' : 'yellow'
                              } variant="light">
                                {trackingInfo.shipment.status || 'Pending'}
                              </Badge>
                            </Group>
                          </Stack>
                        </Card>
                      </Grid.Col>

                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Card withBorder p="md" h="100%">
                          <Group gap="xs" mb="sm">
                            <IconMapPin size={20} />
                            <Text fw={600} size="sm" c="dimmed">
                              Route Information
                            </Text>
                          </Group>
                          <Stack gap="xs">
                            <Box>
                              <Text size="sm" c="dimmed" mb={4}>
                                From:
                              </Text>
                              <Text fw={500}>
                                {trackingInfo.shipment.origin_address.city}, {trackingInfo.shipment.origin_address.state}
                              </Text>
                            </Box>
                            <Box>
                              <Text size="sm" c="dimmed" mb={4}>
                                To:
                              </Text>
                              <Text fw={500}>
                                {trackingInfo.shipment.destination_address.city},{" "}
                                {trackingInfo.shipment.destination_address.state}
                              </Text>
                            </Box>
                            <Box>
                              <Text size="sm" c="dimmed" mb={4}>
                                Est. Delivery:
                              </Text>
                              <Text fw={500}>
                                {dayjs(trackingInfo.shipment.estimatedDeliveryDate).format("YYYY-MM-DD")}
                              </Text>
                            </Box>
                          </Stack>
                        </Card>
                      </Grid.Col>
                    </Grid>

                {trackingInfo?.shipment?.origin_address &&
                  trackingInfo?.shipment?.destination_address && (
                    <Box mt="xl">
                      <Title order={3} c="gray.8" mb="md">
                        Shipment Location
                      </Title>
                      <ShipmentTrackingMap
                        origin={{
                          latitude: trackingInfo.shipment.origin_address.latitude || 0,
                          longitude: trackingInfo.shipment.origin_address.longitude || 0,
                        }}
                        destination={{
                          latitude: trackingInfo.shipment.destination_address.latitude || 0,
                          longitude: trackingInfo.shipment.destination_address.longitude || 0,
                        }}
                        currentLocation={
                          trackingInfo.shipment.current_location
                            ? {
                              latitude: trackingInfo.shipment.current_location.latitude || 0,
                              longitude: trackingInfo.shipment.current_location.longitude || 0,
                            }
                            : undefined
                        }
                        originAddress={trackingInfo.shipment.origin_address?.formatted_address}
                        destinationAddress={trackingInfo.shipment.destination_address?.formatted_address}
                        height="600px"
                        hideCoordinates={true}
                      />
                      {trackingInfo.shipment.current_location && (
                        <Box mt="md" p="md" style={{ backgroundColor: "#e0f2fe", borderRadius: "8px" }}>
                          <Group gap="xs">
                            <IconTruck size={20} color="#f97316" />
                            <Box>
                              <Text fw={600} size="sm">
                                Currently In Transit
                              </Text>
                              <Text size="xs" c="dimmed">
                                Location updated:{" "}
                                {trackingInfo.shipment.current_location.updatedAt
                                  ? dayjs(trackingInfo.shipment.current_location.updatedAt).format(
                                    "MMM DD, YYYY HH:mm"
                                  )
                                  : "Recently"}
                              </Text>
                            </Box>
                          </Group>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}

            {/* Quote Details */}
            {trackingInfo?.quote && (
              <Box>
                <Title order={2} c="gray.8" mb="lg">
                  Quote Request: {trackingInfo.quote.tracking_id}
                </Title>

                {/* Quote Stepper */}
                <Stepper
                  active={
                    trackingInfo.quote.status === "Pending Quote" ? 0 :
                      trackingInfo.quote.status === "In Progress" ? 1 :
                        trackingInfo.quote.status === "Quoted" ? 2 : 3
                  }
                  mb="xl"
                  color="orange"
                >
                  <Stepper.Step label="Received" description="Request submitted" />
                  <Stepper.Step label="In Progress" description="Team is reviewing" />
                  <Stepper.Step label="Complete" description="Quote is ready" />
                </Stepper>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="md" h="100%" radius="md">
                      <Group gap="xs" mb="sm">
                        <IconInfoCircle size={20} color="#FF6B35" />
                        <Text fw={600} size="sm" c="dimmed">
                          Quote Status
                        </Text>
                      </Group>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Current Status:
                          </Text>
                          <Badge color={
                            trackingInfo.quote.status === 'Quoted' ? 'green' :
                              trackingInfo.quote.status === 'In Progress' ? 'blue' :
                                trackingInfo.quote.status === 'Declined' ? 'red' : 'orange'
                          } variant="light">
                            {trackingInfo.quote.status}
                          </Badge>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Submitted On:
                          </Text>
                          <Text fw={500}>
                            {dayjs(trackingInfo.quote.createdAt).format("MMM DD, YYYY")}
                          </Text>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card withBorder p="md" h="100%" radius="md">
                      <Group gap="xs" mb="sm">
                        <IconMapPin size={20} color="#FF6B35" />
                        <Text fw={600} size="sm" c="dimmed">
                          Route Summary
                        </Text>
                      </Group>
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Origin (Zip):
                          </Text>
                          <Text fw={500}>{trackingInfo.quote.origin_zip_code}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Destination (Zip):
                          </Text>
                          <Text fw={500}>{trackingInfo.quote.destination_zip_code}</Text>
                        </Group>
                      </Stack>
                    </Card>
                  </Grid.Col>
                </Grid>

                {trackingInfo.quote.status === "Quoted" && (
                  <Stack gap="lg" mt="xl">
                    <Alert icon={<IconCheck size={16} />} title="Your Quote is Ready!" color="green" radius="md">
                      <Stack gap="xs">
                        <Text size="sm">
                          We have analyzed carrier performance and market conditions to build the best option for your shipment.
                        </Text>
                        <Grid mt="xs">
                          <Grid.Col span={4}>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Amount</Text>
                            <Text fw={700} size="xl" c="green.7">${(trackingInfo?.quote?.quoteAmount as any)?.toLocaleString()}</Text>
                          </Grid.Col>
                          <Grid.Col span={4}>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Carrier</Text>
                            <Text fw={600}>{(trackingInfo.quote.carrier as any) || 'Standard LTL'}</Text>
                          </Grid.Col>
                          <Grid.Col span={4}>
                            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Transit</Text>
                            <Text fw={600}>{(trackingInfo.quote.estimatedTransitDays as any) || '--'} Days (Est.)</Text>
                          </Grid.Col>
                        </Grid>
                      </Stack>
                    </Alert>

                    <Group grow>
                      <Button
                        size="lg"
                        color="green"
                        leftSection={<IconCheck size={18} />}
                        onClick={() => setAcceptOpened()}
                      >
                        Accept & Book
                      </Button>
                      <Button
                        size="lg"
                        variant="light"
                        color="gray"
                        leftSection={<IconX size={18} />}
                        onClick={() => setDeclineOpened()}
                      >
                        Decline Quote
                      </Button>
                    </Group>
                  </Stack>
                )}

                {trackingInfo.quote.status === "Pending Quote" && (
                  <Alert icon={<IconTruck size={16} />} title="Request Received" color="blue" mt="xl" radius="md">
                    <Text size="sm">
                      We have received your details. Our team is building your quote now.
                      You will receive an email as soon as it is complete.
                    </Text>
                  </Alert>
                )}

                {trackingInfo.quote.status === "In Progress" && (
                  <Alert icon={<IconSettings size={16} />} title="Quote In Progress" color="orange" mt="xl" radius="md">
                    <Text size="sm">
                      Our team is currently negotiating with carriers for this shipment to find the most reliable and cost-effective option.
                    </Text>
                  </Alert>
                )}

                {trackingInfo.quote.status === "Declined" && (
                  <Alert icon={<IconX size={16} />} title="Quote Declined" color="gray" mt="xl" radius="md">
                    <Text size="sm">
                      This quote has been marked as declined. If you would like to revisit this or provide more details, please reply to our original email.
                    </Text>
                  </Alert>
                )}
              </Box>
            )}
          </Stack>
        )}
      </Card>
        )}
    </Stack>
    </Container >
  );
};

const TrackShipmentPage = () => {
  return (
    <Suspense
      fallback={
        <Container size="xl" py="xl">
          <Stack gap="xl">
            <Box>
              <Title order={1} c="gray.8" mb="md">
                Where&apos;s my Freight?
              </Title>
              <Text c="dimmed" size="lg">
                Enter your tracking number to track your shipment
              </Text>
            </Box>
            <Card shadow="sm" padding="lg" withBorder radius="md">
              <Text c="dimmed">Loading...</Text>
            </Card>
          </Stack>
        </Container>
      }
    >
      <TrackShipmentContent />
    </Suspense>
  );
};

export default TrackShipmentPage;
