"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  TextInput,
  SimpleGrid,
  Button,
  Group,
  Box,
  Divider,
  Alert,
  Loader,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCheck, IconTruck, IconArrowLeft, IconInfoCircle } from "@tabler/icons-react";
import { useGetQuoteRequestQuery } from "@/hooks/quote-request.hooks";
import http from "@/hooks/Http";
import { notifications } from "@mantine/notifications";

export default function AcceptQuotePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: quote, isLoading: isLoadingQuote } = useGetQuoteRequestQuery(id as string);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    origin_street: "",
    origin_city: "",
    origin_state: "",
    origin_business_name: "",
    origin_country: "US",
    destination_street: "",
    destination_city: "",
    destination_state: "",
    destination_business_name: "",
    destination_country: "US",
    pickupDate: null as Date | null,
    estimatedDeliveryDate: null as Date | null,
    notes: "",
  });

  useEffect(() => {
    if (quote) {
      setFormData((prev) => ({
        ...prev,
        notes: quote.special_instructions || "",
        estimatedDeliveryDate: quote.delivery_date ? new Date(quote.delivery_date) : null,
      }));
    }
  }, [quote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await http.instance.post(`/quote-request/${id}/accept`, {
        ...formData,
        pickupDate: formData.pickupDate?.toISOString(),
        estimatedDeliveryDate: formData.estimatedDeliveryDate?.toISOString(),
      });
      setSuccess(true);
      notifications.show({
        title: "Success!",
        message: "Your shipment has been booked. Our team will contact you shortly.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to process acceptance. Please try again.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingQuote) return <Container py="xl"><Loader /></Container>;
  if (!quote) return <Container py="xl"><Text>Quote not found.</Text></Container>;

  if (success) {
    return (
      <Container size="sm" py={100}>
        <Card withBorder padding="xl" radius="md" shadow="sm">
          <Stack align="center" gap="lg">
            <Box style={{ backgroundColor: '#e6fcf5', borderRadius: '50%', padding: '20px' }}>
              <IconCheck size={48} color="#099268" />
            </Box>
            <Title order={2}>Shipment Booked!</Title>
            <Text ta="center" c="dimmed">
              Thank you for choosing Freight Team Logistics. Your quote <b>{quote.tracking_id}</b> has been converted to a shipment.
            </Text>
            <Alert icon={<IconInfoCircle size={16} />} color="blue">
              Our team will review the details and reach out to you via email with your final confirmation and BOL.
            </Alert>
            <Button variant="light" color="orange" onClick={() => router.push('/track-shipment')}>
              Back to Tracking
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="md" py="xl">
      <Button 
        variant="subtle" 
        color="gray" 
        leftSection={<IconArrowLeft size={16} />} 
        mb="lg"
        onClick={() => router.back()}
      >
        Back to Tracking
      </Button>

      <Stack gap="xl">
        <Box>
          <Title order={1} c="gray.8">Complete Your Booking</Title>
          <Text c="dimmed">Quote Request: {quote.tracking_id}</Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack gap="lg">
            {/* Origin Card */}
            <Card withBorder radius="md" p="lg">
              <Title order={3} size="h4" mb="md" c="gray.8">Origin Details (Pickup)</Title>
              <Stack gap="sm">
                <TextInput
                  label="Business Name / Contact Name"
                  placeholder="e.g. ABC Corp"
                  required
                  value={formData.origin_business_name}
                  onChange={(e) => setFormData({ ...formData, origin_business_name: e.target.value })}
                />
                <TextInput
                  label="Street Address"
                  placeholder="123 Main St"
                  required
                  value={formData.origin_street}
                  onChange={(e) => setFormData({ ...formData, origin_street: e.target.value })}
                />
                <SimpleGrid cols={2}>
                  <TextInput
                    label="City"
                    placeholder="New York"
                    required
                    value={formData.origin_city}
                    onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                  />
                  <TextInput
                    label="State"
                    placeholder="NY"
                    required
                    value={formData.origin_state}
                    onChange={(e) => setFormData({ ...formData, origin_state: e.target.value })}
                  />
                </SimpleGrid>
                <TextInput
                  label="Zip Code"
                  value={quote.origin_zip_code}
                  disabled
                  description="From original quote"
                />
              </Stack>
            </Card>

            {/* Destination Card */}
            <Card withBorder radius="md" p="lg">
              <Title order={3} size="h4" mb="md" c="gray.8">Destination Details (Delivery)</Title>
              <Stack gap="sm">
                <TextInput
                  label="Business Name / Contact Name"
                  placeholder="e.g. XYZ Warehouse"
                  required
                  value={formData.destination_business_name}
                  onChange={(e) => setFormData({ ...formData, destination_business_name: e.target.value })}
                />
                <TextInput
                  label="Street Address"
                  placeholder="456 Oak Ave"
                  required
                  value={formData.destination_street}
                  onChange={(e) => setFormData({ ...formData, destination_street: e.target.value })}
                />
                <SimpleGrid cols={2}>
                  <TextInput
                    label="City"
                    placeholder="Los Angeles"
                    required
                    value={formData.destination_city}
                    onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                  />
                  <TextInput
                    label="State"
                    placeholder="CA"
                    required
                    value={formData.destination_state}
                    onChange={(e) => setFormData({ ...formData, destination_state: e.target.value })}
                  />
                </SimpleGrid>
                <TextInput
                  label="Zip Code"
                  value={quote.destination_zip_code}
                  disabled
                  description="From original quote"
                />
              </Stack>
            </Card>

            {/* Logistics Card */}
            <Card withBorder radius="md" p="lg">
              <Title order={3} size="h4" mb="md" c="gray.8">Logistics & Schedule</Title>
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <DatePickerInput
                  label="Preferred Pickup Date"
                  placeholder="Select date"
                  value={formData.pickupDate}
                  onChange={(val: any) => setFormData({ ...formData, pickupDate: val })}
                  clearable
                />
                <DatePickerInput
                  label="Estimated Delivery Date"
                  placeholder="Select date"
                  value={formData.estimatedDeliveryDate}
                  onChange={(val: any) => setFormData({ ...formData, estimatedDeliveryDate: val })}
                />
              </SimpleGrid>
              <Divider my="lg" />
              <TextInput
                label="Additional Instructions"
                placeholder="e.g. Liftgate required, call before delivery"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Card>

            <Group justify="flex-end" mt="xl">
              <Button variant="subtle" color="gray" onClick={() => router.back()}>Cancel</Button>
              <Button 
                type="submit" 
                size="lg" 
                color="orange"
                loading={loading}
                leftSection={<IconTruck size={20} />}
              >
                Finalize Booking
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  );
}
