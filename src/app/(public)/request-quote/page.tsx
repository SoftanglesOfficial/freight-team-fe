"use client";

import React, { useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Container,
  Grid,
  GridCol,
  Group,
  InputLabel,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
  Title,
  Text,
  Box,
} from "@mantine/core";
import { IconPlus, IconTrash, IconCheck } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "@mantine/form";
import * as yup from "yup";
import { yupResolver } from "mantine-form-yup-resolver";
import { DatePickerInput } from "@mantine/dates";
import { useCreateQuoteRequestMutation } from "@/hooks/quote-request.hooks";
import type { CreateQuoteRequestDto, Pallet } from "@/hooks/Api";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const palletSchema = yup.object().shape({
  weight: yup
    .mixed()
    .test("is-number", "Weight must be a number", (value) => {
      if (value === "" || value === null || value === undefined) return false;
      const num = Number(value);
      return !isNaN(num) && num > 0;
    })
    .required("Weight is required"),
  length: yup
    .mixed()
    .test("is-number", "Length must be a number", (value) => {
      if (value === "" || value === null || value === undefined) return false;
      const num = Number(value);
      return !isNaN(num) && num > 0;
    })
    .required("Length is required"),
  width: yup
    .mixed()
    .test("is-number", "Width must be a number", (value) => {
      if (value === "" || value === null || value === undefined) return false;
      const num = Number(value);
      return !isNaN(num) && num > 0;
    })
    .required("Width is required"),
  height: yup
    .mixed()
    .test("is-number", "Height must be a number", (value) => {
      if (value === "" || value === null || value === undefined) return false;
      const num = Number(value);
      return !isNaN(num) && num > 0;
    })
    .required("Height is required"),
});

const schema = yup.object().shape({
  is_time_sensitive: yup.boolean().required(),
  delivery_date: yup.date().when("is_time_sensitive", {
    is: true,
    then: (schema) =>
      schema.required("Delivery date is required when time sensitive"),
    otherwise: (schema) => schema.nullable(),
  }),
  origin_zip_code: yup
    .string()
    .required("Origin zip code is required")
    .matches(/^\d{5}(-\d{4})?$/, "Invalid zip code format"),
  destination_zip_code: yup
    .string()
    .required("Destination zip code is required")
    .matches(/^\d{5}(-\d{4})?$/, "Invalid zip code format"),
  pallets: yup
    .array()
    .of(palletSchema)
    .min(1, "At least one pallet is required")
    .required("Pallets are required"),
  special_instructions: yup.string(),
  is_residential: yup.boolean().required(),
  full_name: yup.string().required("Full name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"),
  company_name: yup.string(),
});

type FormValues = {
  is_time_sensitive: boolean;
  delivery_date: Date | null;
  origin_zip_code: string;
  destination_zip_code: string;
  pallets: Array<{
    weight: number | "";
    length: number | "";
    width: number | "";
    height: number | "";
  }>;
  special_instructions: string;
  is_residential: boolean;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
};

export default function RequestQuotePage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const { mutate: createQuoteRequest, isPending } =
    useCreateQuoteRequestMutation();

  const form = useForm<FormValues>({
    initialValues: {
      is_time_sensitive: false,
      delivery_date: null,
      origin_zip_code: "",
      destination_zip_code: "",
      pallets: [
        {
          weight: "",
          length: "",
          width: "",
          height: "",
        },
      ],
      special_instructions: "",
      is_residential: false,
      full_name: "",
      email: "",
      phone: "",
      company_name: "",
    },
    validate: yupResolver(schema),
  });

  const { user, isAuthenticated } = useAuth();

  // Pre-fill user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      form.setFieldValue("full_name", `${user.first_name} ${user.last_name || ""}`.trim());
      form.setFieldValue("email", user.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const addPallet = () => {
    form.insertListItem("pallets", {
      weight: "",
      length: "",
      width: "",
      height: "",
    });
  };

  const removePallet = (index: number) => {
    if (form.values.pallets.length > 1) {
      form.removeListItem("pallets", index);
    }
  };

  const handleSubmit = form.onSubmit((values) => {
    const pallets: Pallet[] = values.pallets.map((pallet) => ({
      weight: Number(pallet.weight),
      length: Number(pallet.length),
      width: Number(pallet.width),
      height: Number(pallet.height),
    }));

    const quoteData: CreateQuoteRequestDto = {
      is_time_sensitive: values.is_time_sensitive,
      delivery_date: values.delivery_date
        ? dayjs(values.delivery_date).toISOString()
        : undefined,
      origin_zip_code: values.origin_zip_code,
      destination_zip_code: values.destination_zip_code,
      pallets,
      special_instructions: values.special_instructions || undefined,
      is_residential: values.is_residential,
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      company_name: values.company_name || undefined,
    };

    createQuoteRequest(quoteData, {
      onSuccess: () => {
        setIsSubmitted(true);
      },
    });
  });

  // Success view
  if (isSubmitted) {
    return (
      <Container mt="lg">
        <Grid>
          <GridCol
            span={{ base: 12, md: 8 }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Card
              shadow="md"
              withBorder
              padding="xl"
              style={{ width: "100%", maxWidth: 600 }}
            >
              <Stack
                gap="xl"
                align="center"
                style={{ minHeight: 400, justifyContent: "center" }}
              >
                <Box
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background: "#FF9200",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 30px rgba(255, 146, 0, 0.4)",
                    position: "relative",
                  }}
                >
                  <IconCheck size={50} stroke={3} color="white" />
                  <Box
                    style={{
                      position: "absolute",
                      inset: -10,
                      borderRadius: "50%",
                      background: "rgba(255, 146, 0, 0.2)",
                      filter: "blur(15px)",
                      zIndex: -1,
                    }}
                  />
                </Box>
                <Stack gap="xs" align="center">
                  <Title order={2} fw={700} c="gray.8" ta="center">
                    Quote Submitted!
                  </Title>
                  <Text c="dimmed" size="md" ta="center">
                    We&apos;ll review your request and send you a quote shortly.
                  </Text>
                </Stack>
                <Button
                  component={Link}
                  href="/"
                  variant="gradient"
                  gradient={{ from: "#EA4745", to: "#FF9200" }}
                  size="md"
                  mt="md"
                >
                  Return to Home
                </Button>
              </Stack>
            </Card>
          </GridCol>
          <GridCol span={{ base: 12, md: 4 }}>
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <Image src="/truck.png" alt="truck" fill objectFit="cover" />
            </div>
          </GridCol>
        </Grid>
      </Container>
    );
  }

  // Form view
  return (
    <Container mt="lg">
      <Stack gap="lg">
        <Title c="navy">Request Quotation</Title>
        <Grid>
          <GridCol span={{ base: 12, md: 8 }}>
            <Card
              shadow="md"
              withBorder
              component="form"
              onSubmit={handleSubmit}
            >
              <Stack gap="xl">
                <Title order={3} fw={600}>
                  Shipment Details
                </Title>

                <Stack gap="md">
                  <Select
                    label="Does this need to deliver or ship by a certain date/ time sensitive?"
                    data={[
                      { value: "true", label: "Yes" },
                      { value: "false", label: "No" },
                    ]}
                    value={form.values.is_time_sensitive ? "true" : "false"}
                    onChange={(value) =>
                      form.setFieldValue("is_time_sensitive", value === "true")
                    }
                    error={form.errors.is_time_sensitive}
                  />

                  {form.values.is_time_sensitive && (
                    <DatePickerInput
                      size="md"
                      label="Delivery Date"
                      placeholder="Select delivery date"
                      valueFormat="MM / DD / YYYY"
                      minDate={dayjs().add(1, "day").toDate()}
                      {...form.getInputProps("delivery_date")}
                    />
                  )}

                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                    <TextInput
                      label="Origin Zip Code"
                      placeholder="10001"
                      {...form.getInputProps("origin_zip_code")}
                    />
                    <TextInput
                      label="Destination Zip Code"
                      placeholder="10002"
                      {...form.getInputProps("destination_zip_code")}
                    />
                  </SimpleGrid>

                  <Group justify="space-between" align="center">
                    <InputLabel size="md">
                      Pallets {form.values.pallets.length}/10
                    </InputLabel>

                    <Button
                      type="button"
                      size="sm"
                      leftSection={<IconPlus size={16} />}
                      color="red.6"
                      radius="xl"
                      onClick={addPallet}
                      disabled={form.values.pallets.length >= 10}
                    >
                      Add Pallet
                    </Button>
                  </Group>

                  {form.values.pallets.map((pallet, index) => (
                    <Card key={index} shadow="none" withBorder>
                      <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-start md:items-center">
                        <div className="flex rounded-full bg-blue-900 text-white w-10 h-10 items-center justify-center flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 w-full md:w-auto grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                          <TextInput
                            label="Weight (lbs)"
                            placeholder="220"
                            type="number"
                            className="w-full"
                            {...form.getInputProps(`pallets.${index}.weight`)}
                          />
                          <TextInput
                            label="Length (ft)"
                            placeholder="4"
                            type="number"
                            className="w-full"
                            {...form.getInputProps(`pallets.${index}.length`)}
                          />
                          <TextInput
                            label="Width (ft)"
                            placeholder="4"
                            type="number"
                            className="w-full"
                            {...form.getInputProps(`pallets.${index}.width`)}
                          />
                          <TextInput
                            label="Height (ft)"
                            placeholder="4"
                            type="number"
                            className="w-full"
                            {...form.getInputProps(`pallets.${index}.height`)}
                          />
                        </div>
                        <ActionIcon
                          type="button"
                          variant="transparent"
                          size="xl"
                          c="red"
                          className="flex-shrink-0 self-start md:self-center"
                          onClick={() => removePallet(index)}
                          disabled={form.values.pallets.length === 1}
                        >
                          <IconTrash />
                        </ActionIcon>
                      </div>
                    </Card>
                  ))}

                  {form.errors.pallets && (
                    <Text c="red" size="sm">
                      {form.errors.pallets as string}
                    </Text>
                  )}

                  <Textarea
                    label="Special Instructions"
                    rows={6}
                    placeholder="Any special requirements...appointment, liftgate needed, tradeshow, etc?:"
                    {...form.getInputProps("special_instructions")}
                  />

                  <Select
                    label="Residential or non-commercial delivery"
                    data={[
                      { value: "true", label: "Yes" },
                      { value: "false", label: "No" },
                    ]}
                    value={form.values.is_residential ? "true" : "false"}
                    onChange={(value) =>
                      form.setFieldValue("is_residential", value === "true")
                    }
                    error={form.errors.is_residential}
                  />
                </Stack>

                <Title order={3} fw={600}>
                  Contact Information
                </Title>

                <Stack gap="md">
                  <TextInput
                    label="Full Name"
                    placeholder="John Doe"
                    {...form.getInputProps("full_name")}
                  />
                  <TextInput
                    label="Email Address"
                    placeholder="john.doe@example.com"
                    type="email"
                    {...form.getInputProps("email")}
                  />
                  <TextInput
                    label="Phone #"
                    placeholder="+1234567890"
                    {...form.getInputProps("phone")}
                  />
                  <TextInput
                    label="Company Name"
                    placeholder="Example Inc."
                    {...form.getInputProps("company_name")}
                  />
                </Stack>

                <Checkbox
                  label="I agree to receive emails and communications from Freight Team Logistics and consent to the processing of my information."
                  checked={agreeToTerms}
                  onChange={(event) => setAgreeToTerms(event.currentTarget.checked)}
                  styles={{
                    label: { fontSize: "0.8rem", color: "#555" },
                  }}
                />

                <Button
                  type="submit"
                  variant="gradient"
                  gradient={{ from: "#EA4745", to: "#FF9200" }}
                  loading={isPending}
                  fullWidth
                  disabled={!agreeToTerms}
                >
                  Request Quote
                </Button>
              </Stack>
            </Card>
          </GridCol>
          <GridCol span={{ base: 12, md: 4 }}>
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              <Image src="/truck.png" alt="truck" fill objectFit="cover" />
            </div>
          </GridCol>
        </Grid>
      </Stack>
    </Container>
  );
}
