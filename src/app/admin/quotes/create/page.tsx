"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Title,
  Box,
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  SimpleGrid,
  Card,
  Text,
  ActionIcon,
  NumberInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import * as yup from "yup";
import { yupResolver } from "mantine-form-yup-resolver";
import { useCreateQuoteRequestMutation } from "@/hooks/quote-request.hooks";
import type { CreateQuoteRequestDto, Pallet } from "@/hooks/Api";
import dayjs from "dayjs";
import CustomerSearchSelect from "@/components/CustomerSearchSelect";
import { useAdminContext } from "@/contexts/AdminContext";

const palletSchema = yup.object().shape({
  weight: yup.number().required("Weight is required").min(1, "Weight must be positive"),
  length: yup.number().required("Length is required").min(1, "Length must be positive"),
  width: yup.number().required("Width is required").min(1, "Width must be positive"),
  height: yup.number().required("Height is required").min(1, "Height must be positive"),
});

const schema = yup.object().shape({
  full_name: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  company_name: yup.string(),
  origin_zip_code: yup.string().required("Origin zip code is required"),
  destination_zip_code: yup.string().required("Destination zip code is required"),
  is_time_sensitive: yup.boolean().required(),
  delivery_date: yup.date().when("is_time_sensitive", {
    is: true,
    then: (schema) => schema.required("Delivery date is required for time sensitive quotes"),
    otherwise: (schema) => schema.nullable(),
  }),
  pallets: yup.array().of(palletSchema).min(1, "At least one pallet is required"),
  special_instructions: yup.string(),
  is_residential: yup.boolean().required(),
});

export default function AdminCreateQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutate: createQuote, isPending } = useCreateQuoteRequestMutation();
  const { selectedCustomer } = useAdminContext();

  const form = useForm({
    initialValues: {
      full_name: "",
      email: "",
      phone: "",
      company_name: "",
      origin_zip_code: "",
      destination_zip_code: "",
      is_time_sensitive: false,
      delivery_date: null as Date | null,
      pallets: [{ weight: 0, length: 0, width: 0, height: 0 }] as Pallet[],
      special_instructions: "",
      is_residential: false,
    },
    validate: yupResolver(schema),
  });

  // Pre-fill from query params
  useEffect(() => {
    const fullName = searchParams.get("fullName");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const company = searchParams.get("company");

    if (fullName) form.setFieldValue("full_name", fullName);
    if (email) form.setFieldValue("email", email);
    if (phone) form.setFieldValue("phone", phone);
    if (company) form.setFieldValue("company_name", company);

    // If no params, check global focus
    if (!fullName && !email && selectedCustomer) {
      form.setFieldValue("full_name", `${selectedCustomer.first_name} ${selectedCustomer.last_name || ""}`.trim());
      form.setFieldValue("email", selectedCustomer.email);
      form.setFieldValue("phone", (selectedCustomer as any).phone || "");
      form.setFieldValue("company_name", (selectedCustomer as any).company_name || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = form.onSubmit((values) => {
    const quoteData: CreateQuoteRequestDto = {
      ...values,
      delivery_date: values.delivery_date ? dayjs(values.delivery_date).toISOString() : undefined,
    };

    createQuote(quoteData, {
      onSuccess: () => {
        router.push("/admin/quotes");
      },
    });
  });

  return (
    <Box>
      <Title order={1} c="gray.8" mb="xl">
        Create New Quote Request
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="xl">
          {/* Customer Information */}
          <Card shadow="sm" padding="lg" withBorder>
            <Stack gap="md">
              <Title order={3} c="gray.8" fw={600}>
                Customer Information
              </Title>
              <CustomerSearchSelect
                label="Search Existing Customer"
                onSelect={(customer) => {
                  if (customer) {
                    form.setFieldValue("full_name", `${customer.first_name} ${customer.last_name || ""}`.trim());
                    form.setFieldValue("email", customer.email);
                    form.setFieldValue("phone", customer.phone || "");
                    form.setFieldValue("company_name", customer.company_name || "");
                  }
                }}
              />
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="Full Name"
                  placeholder="John Doe"
                  {...form.getInputProps("full_name")}
                />
                <TextInput
                  label="Email"
                  placeholder="john@example.com"
                  {...form.getInputProps("email")}
                />
                <TextInput
                  label="Phone"
                  placeholder="+1234567890"
                  {...form.getInputProps("phone")}
                />
                <TextInput
                  label="Company Name"
                  placeholder="Example Inc."
                  {...form.getInputProps("company_name")}
                />
              </SimpleGrid>
            </Stack>
          </Card>

          {/* Shipment Details */}
          <Card shadow="sm" padding="lg" withBorder>
            <Stack gap="md">
              <Title order={3} c="gray.8" fw={600}>
                Shipment Details
              </Title>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="Origin Zip Code"
                  placeholder="10001"
                  {...form.getInputProps("origin_zip_code")}
                />
                <TextInput
                  label="Destination Zip Code"
                  placeholder="90210"
                  {...form.getInputProps("destination_zip_code")}
                />
              </SimpleGrid>

              <Group grow>
                <Select
                  label="Is Time Sensitive?"
                  data={[
                    { value: "true", label: "Yes" },
                    { value: "false", label: "No" },
                  ]}
                  value={form.values.is_time_sensitive ? "true" : "false"}
                  onChange={(v) => form.setFieldValue("is_time_sensitive", v === "true")}
                />
                {form.values.is_time_sensitive && (
                  <DatePickerInput
                    label="Delivery Date"
                    placeholder="Select date"
                    {...form.getInputProps("delivery_date")}
                  />
                )}
              </Group>

              <Select
                label="Residential Delivery?"
                data={[
                  { value: "true", label: "Yes" },
                  { value: "false", label: "No" },
                ]}
                value={form.values.is_residential ? "true" : "false"}
                onChange={(v) => form.setFieldValue("is_residential", v === "true")}
              />
            </Stack>
          </Card>

          {/* Pallets */}
          <Card shadow="sm" padding="lg" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3} c="gray.8" fw={600}>
                  Items / Pallets
                </Title>
                <Button
                  variant="light"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => form.insertListItem("pallets", { weight: 0, length: 0, width: 0, height: 0 })}
                >
                  Add Item
                </Button>
              </Group>

              {form.values.pallets.map((_, index) => (
                <Card key={index} withBorder shadow="none" padding="sm">
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>Item #{index + 1}</Text>
                    <ActionIcon color="red" onClick={() => form.removeListItem("pallets", index)} disabled={form.values.pallets.length === 1}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                  <SimpleGrid cols={{ base: 2, md: 4 }} spacing="sm">
                    <NumberInput label="Weight (lbs)" {...form.getInputProps(`pallets.${index}.weight`)} />
                    <NumberInput label="Length (in)" {...form.getInputProps(`pallets.${index}.length`)} />
                    <NumberInput label="Width (in)" {...form.getInputProps(`pallets.${index}.width`)} />
                    <NumberInput label="Height (in)" {...form.getInputProps(`pallets.${index}.height`)} />
                  </SimpleGrid>
                </Card>
              ))}
            </Stack>
          </Card>

          <Card shadow="sm" padding="lg" withBorder>
            <Textarea
              label="Special Instructions"
              placeholder="Any additional info..."
              minRows={3}
              {...form.getInputProps("special_instructions")}
            />
          </Card>

          <Group justify="flex-end">
            <Button variant="light" color="gray" onClick={() => router.push("/admin/quotes")}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending} color="blue">
              Create Quote Request
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
