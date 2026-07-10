"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
  LoadingOverlay,
  Loader,
  FileInput,
  Paper,
  Text,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useJsApiLoader } from "@react-google-maps/api";
import { IconUpload } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import * as yup from "yup";
import { yupResolver } from "mantine-form-yup-resolver";
import {
  useGetShipmentQuery,
  useUpdateShipmentMutation,
} from "@/hooks/shipments.hooks";
import type { UpdateShipmentDto, Address } from "@/hooks/Api";
import dayjs from "dayjs";
import CarrierSelect from "@/components/CarrierSelect";
import CustomerSearchSelect from "@/components/CustomerSearchSelect";
import { ShipmentDocumentsCard } from "@/components/ShipmentDocumentsCard";
import { useAuth } from "@/contexts/AuthContext";

// Helper function to create Address from form values
const createAddressFromForm = (
  streetAddress: string,
  city: string,
  state: string,
  zipCode: string,
  businessName: string,
  country: string
): Address => {
  return {
    formatted_address: `${streetAddress ? streetAddress + ", " : ""}${city ? city + ", " : ""}${state ? state + ", " : ""}${zipCode}${country ? ", " + country : ""}`,
    street_address: streetAddress,
    city: city,
    state: state,
    zip_code: zipCode,
    country: country,
    latitude: 0,
    longitude: 0,
    businessName: businessName,
  };
};

const schema = yup.object().shape({
  customerName: yup.string().required("Customer name is required"),
  customerPhone: yup.string().optional(),
  customerCompanyName: yup.string().optional(),
  customer_id: yup.string().optional(),
  status: yup
    .string()
    .oneOf(["pending", "in-transit", "delivered"], "Invalid status")
    .required("Status is required"),
  originCountry: yup.string().required("Origin country is required"),
  originStreetAddress: yup.string().optional(),
  originCity: yup.string().optional(),
  originState: yup.string().optional(),
  originZipCode: yup.string().required("Origin zip code is required"),
  originBusinessName: yup.string().optional(),
  destinationCountry: yup.string().required("Destination country is required"),
  destinationStreetAddress: yup.string().optional(),
  destinationCity: yup.string().optional(),
  destinationState: yup.string().optional(),
  destinationZipCode: yup.string().required("Destination zip code is required"),
  destinationBusinessName: yup.string().optional(),
  quote_tracking_id: yup.string().optional(),
  ftlWareHouseId: yup.string().required("FTL Warehouse ID is required"),
  proNumber: yup.string().required("PRO Number is required"),
  documents: yup.array().min(1, "At least a BOL document is required").required("BOL is required"),
  carrierName: yup.string().required("Carrier name is required"),
  dateOfOrder: yup.date().required("Date of order is required"),
  pickupDate: yup.date().nullable().optional(),
  estimatedDeliveryDate: yup
    .date()
    .required("Estimated delivery date is required"),
  deliveryDate: yup.date().nullable(),
  notes: yup.string(),
  timeSensitive: yup
    .string()
    .oneOf(["yes", "no"], "Time sensitive must be yes or no")
    .required("Time sensitive is required"),
  mustArriveByDate: yup.date().when("timeSensitive", {
    is: "yes",
    then: (schema) =>
      schema.required("Must arrive by date is required when time sensitive"),
    otherwise: (schema) => schema.nullable(),
  }),
  timeSensitiveNotes: yup.string(),
});

export default function EditShipmentPage() {
  const router = useRouter();
  const params = useParams();
  const shipmentId = params.id as string;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
    libraries: ["places"],
  });

  const [isOriginLoading, setIsOriginLoading] = useState(false);
  const [isDestinationLoading, setIsDestinationLoading] = useState(false);
  const [bolParsing, setBolParsing] = useState(false);
  const [bolFile, setBolFile] = useState<File | null>(null);
  const { token } = useAuth();

  const { data: shipment, isLoading: isLoadingShipment } =
    useGetShipmentQuery(shipmentId);
  const { mutate: updateShipment, isPending: isUpdating } =
    useUpdateShipmentMutation();

  const form = useForm({
    initialValues: {
      customerName: "",
      customer_id: "",
      customerPhone: "",
      customerCompanyName: "",
      status: "pending" as "pending" | "in-transit" | "delivered",
      originCountry: "US",
      originStreetAddress: "",
      originCity: "",
      originState: "",
      originZipCode: "",
      originBusinessName: "",
      destinationCountry: "US",
      destinationStreetAddress: "",
      destinationCity: "",
      destinationState: "",
      destinationZipCode: "",
      destinationBusinessName: "",
      quote_tracking_id: "",
      ftlWareHouseId: "",
      proNumber: "",
      carrierName: "",
      dateOfOrder: null as Date | null,
      pickupDate: null as Date | null,
      estimatedDeliveryDate: null as Date | null,
      deliveryDate: null as Date | null,
      notes: "",
      documents: [] as string[],
      timeSensitive: "no" as "yes" | "no",
      mustArriveByDate: null as Date | null,
      timeSensitiveNotes: "",
    },
    validate: yupResolver(schema),
  });

  // Populate form when shipment data is loaded
  React.useEffect(() => {
    if (shipment) {
      form.setValues({
        customerName: shipment.customer?.name || "",
        customer_id:
          typeof (shipment as any).customer_id === "object" &&
          (shipment as any).customer_id?._id
            ? String((shipment as any).customer_id._id)
            : (shipment as any).customer_id || "",
        customerPhone: shipment.customer?.phone || "",
        customerCompanyName: (shipment.customer as any)?.company_name || "",
        status: (shipment.status || "pending") as "pending" | "in-transit" | "delivered",
        originCountry: shipment.origin_address?.country || "US",
        originStreetAddress: shipment.origin_address?.street_address || "",
        originCity: shipment.origin_address?.city || "",
        originState: shipment.origin_address?.state || "",
        originZipCode: shipment.origin_address?.zip_code || "",
        originBusinessName: shipment.origin_address?.businessName || "",
        destinationCountry: shipment.destination_address?.country || "US",
        destinationStreetAddress:
          shipment.destination_address?.street_address || "",
        destinationCity: shipment.destination_address?.city || "",
        destinationState: shipment.destination_address?.state || "",
        destinationZipCode: shipment.destination_address?.zip_code || "",
        destinationBusinessName:
          shipment.destination_address?.businessName || "",
        quote_tracking_id: shipment.quote_tracking_id || "",
        ftlWareHouseId: shipment.ftlWareHouseId || "",
        proNumber: shipment.proNumber || "",
        carrierName: shipment.carrierName || "",
        dateOfOrder: shipment.dateOfOrder
          ? dayjs(shipment.dateOfOrder).toDate()
          : null,
        pickupDate: shipment.pickupDate
          ? dayjs(shipment.pickupDate).toDate()
          : null,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate
          ? dayjs(shipment.estimatedDeliveryDate).toDate()
          : null,
        deliveryDate: shipment.deliveryDate
          ? dayjs(shipment.deliveryDate).toDate()
          : null,
        notes: shipment.notes || "",
        timeSensitive: shipment.timeSensitive || "no",
        mustArriveByDate: shipment.mustArriveByDate
          ? dayjs(shipment.mustArriveByDate).toDate()
          : null,
        timeSensitiveNotes: shipment.timeSensitiveNotes || "",
        documents: shipment.documents || [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipment]);

  const handleZipCodeLookup = async (zipCode: string, type: "origin" | "destination") => {
    if (!isLoaded || !zipCode || zipCode.length < 5) return;

    const countryCode = type === "origin" ? form.values.originCountry : form.values.destinationCountry;
    const setLoading = type === "origin" ? setIsOriginLoading : setIsDestinationLoading;
    setLoading(true);

    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({
        address: zipCode,
        componentRestrictions: { 
          postalCode: zipCode,
          ...(countryCode && { country: countryCode })
        }
      });

      if (response.results && response.results.length > 0) {
        const result = response.results[0];
        const addressComponents = result.address_components;

        let city = "";
        let state = "";

        addressComponents.forEach((component) => {
          const types = component.types;
          if (types.includes("locality") || types.includes("sublocality") || types.includes("neighborhood")) {
            if (!city) city = component.long_name;
          } else if (types.includes("administrative_area_level_2")) {
            if (!city) city = component.long_name;
          } else if (types.includes("administrative_area_level_1")) {
            state = component.short_name;
          }
        });

        if (type === "origin") {
          if (city) form.setFieldValue("originCity", city);
          if (state) form.setFieldValue("originState", state);
        } else {
          if (city) form.setFieldValue("destinationCity", city);
          if (state) form.setFieldValue("destinationState", state);
        }
      }
    } catch (error) {
      console.error("Zip code lookup failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = form.onSubmit((values) => {
    const shipmentData: UpdateShipmentDto = {
      customer: {
        name: values.customerName,
        phone: values.customerPhone,
        company_name: values.customerCompanyName,
      },
      customer_id: values.customer_id || undefined,
      status: values.status,
      origin_address: createAddressFromForm(
        values.originStreetAddress,
        values.originCity,
        values.originState,
        values.originZipCode,
        values.originBusinessName,
        values.originCountry
      ),
      destination_address: createAddressFromForm(
        values.destinationStreetAddress,
        values.destinationCity,
        values.destinationState,
        values.destinationZipCode,
        values.destinationBusinessName,
        values.destinationCountry
      ),
      quote_tracking_id: values.quote_tracking_id || undefined,
      ftlWareHouseId: values.ftlWareHouseId,
      carrierName: values.carrierName,
      dateOfOrder: dayjs(values.dateOfOrder).toISOString(),
      pickupDate: values.pickupDate ? dayjs(values.pickupDate).toISOString() : undefined,
      estimatedDeliveryDate: dayjs(values.estimatedDeliveryDate).toISOString(),
      deliveryDate: values.deliveryDate
        ? dayjs(values.deliveryDate).toISOString()
        : undefined,
      notes: values.notes || undefined,
      documents: values.documents,
      timeSensitive: values.timeSensitive,
      mustArriveByDate:
        values.timeSensitive === "yes" && values.mustArriveByDate
          ? dayjs(values.mustArriveByDate).toISOString()
          : undefined,
      timeSensitiveNotes:
        values.timeSensitive === "yes" && values.timeSensitiveNotes
          ? values.timeSensitiveNotes
          : undefined,
    };

    updateShipment(
      { id: shipmentId, data: shipmentData },
      {
        onSuccess: () => {
          router.push(`/admin/shipments/${shipmentId}`);
        },
      }
    );
  });

  const handleCancel = () => {
    router.push(`/admin/shipments/${shipmentId}`);
  };

  const handleBolUpload = async (file: File | null) => {
    setBolFile(file);
    if (!file) return;
    setBolParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/document/parse-bol`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
          body: formData,
        }
      );

      const result = await res.json();

      if (result.success && result.data) {
        const d = result.data;

        const updates: Record<string, any> = {};

        // Origin (shipper = pickup location)
        if (d.shipper_zip) updates.originZipCode = d.shipper_zip;
        if (d.shipper_address) updates.originStreetAddress = d.shipper_address;
        if (d.shipper_city) updates.originCity = d.shipper_city;
        if (d.shipper_state) updates.originState = d.shipper_state;
        if (d.shipper_business_name) updates.originBusinessName = d.shipper_business_name;

        // Destination (consignee = delivery location)
        if (d.consignee_zip) updates.destinationZipCode = d.consignee_zip;
        if (d.consignee_address) updates.destinationStreetAddress = d.consignee_address;
        if (d.consignee_city) updates.destinationCity = d.consignee_city;
        if (d.consignee_state) updates.destinationState = d.consignee_state;
        if (d.consignee_business_name) updates.destinationBusinessName = d.consignee_business_name;

        // Shipment details
        if (d.carrier_name) updates.carrierName = d.carrier_name;
        if (d.pro_number) updates.proNumber = d.pro_number;
        if (d.special_instructions) updates.notes = d.special_instructions;

        // Dates (MM/DD/YYYY from BOL parser)
        if (d.pickup_date) {
          const parts = d.pickup_date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          let parsed: Date | null = null;
          if (parts) {
            parsed = new Date(Number(parts[3]), Number(parts[1]) - 1, Number(parts[2]));
          } else {
            const fallback = new Date(d.pickup_date);
            if (!isNaN(fallback.getTime())) parsed = fallback;
          }
          if (parsed && !isNaN(parsed.getTime())) updates.pickupDate = parsed;
        }

        // Pallets — update first pallet with weight and dimensions
        const pallets = (form.values as any).pallets || [];
        if (pallets.length > 0) {
          const weightNum = d.weight ? parseFloat(d.weight.toString().replace(/[^\d.]/g, "")) : null;
          const lengthNum = d.pallet_length ? parseFloat(d.pallet_length.toString().replace(/[^\d.]/g, "")) : null;
          const widthNum = d.pallet_width ? parseFloat(d.pallet_width.toString().replace(/[^\d.]/g, "")) : null;
          const heightNum = d.pallet_height ? parseFloat(d.pallet_height.toString().replace(/[^\d.]/g, "")) : null;

          updates.pallets = pallets.map((p: any, i: number) => {
            if (i !== 0) return p;
            return {
              ...p,
              ...(weightNum && !isNaN(weightNum) ? { weight: weightNum } : {}),
              ...(lengthNum && !isNaN(lengthNum) ? { length: lengthNum } : {}),
              ...(widthNum && !isNaN(widthNum) ? { width: widthNum } : {}),
              ...(heightNum && !isNaN(heightNum) ? { height: heightNum } : {}),
            };
          });
        }

        // Customer name from consignee
        if (d.consignee_business_name) updates.customerName = d.consignee_business_name;

        form.setValues({ ...form.values, ...updates });

        notifications.show({
          title: "BOL Parsed Successfully",
          message: `Extracted ${Object.keys(updates).length} fields. Please review and complete any missing information before saving.`,
          color: "green",
          autoClose: 6000,
        });
      } else {
        notifications.show({
          title: "Could Not Parse BOL",
          message: result.error || "Please fill in the form manually.",
          color: "orange",
          autoClose: 5000,
        });
      }
    } catch {
      notifications.show({
        title: "Parse Failed",
        message: "Something went wrong. Please fill in the form manually.",
        color: "red",
      });
    } finally {
      setBolParsing(false);
    }
  };

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={isLoadingShipment}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Title order={1} c="gray.8" mb="xl">
        Edit Shipment
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="xl">
          <Paper withBorder p="lg" radius="md" mb="lg" style={{ borderLeft: "4px solid #293674" }}>
            <Group justify="space-between" align="center" wrap="nowrap">
              <Stack gap={4}>
                <Text fw={600} c="#293674" size="md">
                  Auto-fill from BOL PDF
                </Text>
                <Text size="sm" c="dimmed">
                  Upload a BOL PDF to automatically populate shipment fields.
                  You can review and edit all fields after extraction.
                </Text>
              </Stack>
              <FileInput
                placeholder="Upload BOL PDF"
                accept="application/pdf"
                leftSection={<IconUpload size={16} />}
                onChange={handleBolUpload}
                value={bolFile}
                w={220}
                clearable
              />
            </Group>
            {bolParsing && (
              <Group mt="sm" gap="xs">
                <Loader size="xs" />
                <Text size="sm" c="blue">
                  Extracting data from BOL using AI... this may take a few seconds
                </Text>
              </Group>
            )}
          </Paper>

          {/* Customer Information Section */}
          <Card shadow="sm" padding="lg" withBorder>
            <Stack gap="md">
              <Title order={3} c="gray.8" fw={600}>
                Customer Information
              </Title>
              <CustomerSearchSelect
                label="Search Existing Customer"
                placeholder="Type name or email to search..."
                onSelect={(customer) => {
                  if (customer) {
                    form.setFieldValue("customerName", `${customer.first_name} ${customer.last_name || ""}`.trim());
                    form.setFieldValue("customer_id", customer._id);
                  } else {
                    form.setFieldValue("customer_id", "");
                  }
                }}
              />
              <TextInput
                label="Customer Name"
                placeholder="John Doe"
                {...form.getInputProps("customerName")}
              />
              <Select
                label="Status"
                placeholder="Select status"
                data={[
                  { value: "pending", label: "Pending" },
                  { value: "in-transit", label: "In Transit" },
                  { value: "delivered", label: "Delivered" },
                ]}
                {...form.getInputProps("status")}
              />
            </Stack>
          </Card>

          {/* Origin and Destination Addresses Side-by-Side */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            {/* Origin Address Section */}
            <Card shadow="sm" padding="lg" withBorder>
              <Stack gap="md">
                <Title order={3} c="gray.8" fw={600}>
                  Origin Address
                </Title>
                <Select
                  label="Country"
                  placeholder="Select country"
                  required
                  data={[
                    { value: "US", label: "United States" },
                    { value: "PK", label: "Pakistan" },
                    { value: "MY", label: "Malaysia" },
                    { value: "CA", label: "Canada" },
                    { value: "GB", label: "United Kingdom" },
                    { value: "AU", label: "Australia" },
                  ]}
                  {...form.getInputProps("originCountry")}
                />
                <TextInput
                  label="Zip Code"
                  placeholder="10001"
                  required
                  rightSection={isOriginLoading ? <Loader size="xs" /> : null}
                  {...form.getInputProps("originZipCode")}
                  onChange={(e) => {
                    const val = e.currentTarget.value;
                    form.setFieldValue("originZipCode", val);
                    // Clear other fields when zip changes
                    form.setFieldValue("originStreetAddress", "");
                    form.setFieldValue("originCity", "");
                    form.setFieldValue("originState", "");
                  }}
                  onBlur={(e) => {
                    form.getInputProps("originZipCode").onBlur(e);
                    handleZipCodeLookup(e.currentTarget.value, "origin");
                  }}
                />
                <TextInput
                  label="Street Address"
                  placeholder="123 Main Street"
                  {...form.getInputProps("originStreetAddress")}
                />
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
                  <TextInput
                    label="City"
                    placeholder="New York"
                    {...form.getInputProps("originCity")}
                  />
                  <TextInput
                    label="State"
                    placeholder="NY"
                    {...form.getInputProps("originState")}
                  />
                </SimpleGrid>
                <TextInput
                  label="Business Name"
                  placeholder="ABC Company"
                  {...form.getInputProps("originBusinessName")}
                />
              </Stack>
            </Card>

            {/* Destination Address Section */}
            <Card shadow="sm" padding="lg" withBorder>
              <Stack gap="md">
                <Title order={3} c="gray.8" fw={600}>
                  Destination Address
                </Title>
                <Select
                  label="Country"
                  placeholder="Select country"
                  required
                  data={[
                    { value: "US", label: "United States" },
                    { value: "PK", label: "Pakistan" },
                    { value: "MY", label: "Malaysia" },
                    { value: "CA", label: "Canada" },
                    { value: "GB", label: "United Kingdom" },
                    { value: "AU", label: "Australia" },
                  ]}
                  {...form.getInputProps("destinationCountry")}
                />
                <TextInput
                  label="Zip Code"
                  placeholder="90210"
                  required
                  rightSection={isDestinationLoading ? <Loader size="xs" /> : null}
                  {...form.getInputProps("destinationZipCode")}
                  onChange={(e) => {
                    const val = e.currentTarget.value;
                    form.setFieldValue("destinationZipCode", val);
                    // Clear other fields when zip changes
                    form.setFieldValue("destinationStreetAddress", "");
                    form.setFieldValue("destinationCity", "");
                    form.setFieldValue("destinationState", "");
                  }}
                  onBlur={(e) => {
                    form.getInputProps("destinationZipCode").onBlur(e);
                    handleZipCodeLookup(e.currentTarget.value, "destination");
                  }}
                />
                <TextInput
                  label="Street Address"
                  placeholder="456 Oak Avenue"
                  {...form.getInputProps("destinationStreetAddress")}
                />
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
                  <TextInput
                    label="City"
                    placeholder="Los Angeles"
                    {...form.getInputProps("destinationCity")}
                  />
                  <TextInput
                    label="State"
                    placeholder="CA"
                    {...form.getInputProps("destinationState")}
                  />
                </SimpleGrid>
                <TextInput
                  label="Business Name"
                  placeholder="XYZ Corporation"
                  {...form.getInputProps("destinationBusinessName")}
                />
              </Stack>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            {/* Shipment Details Section */}
            <Card shadow="sm" padding="lg" withBorder>
              <Stack gap="md">
                <Title order={3} c="gray.8" fw={600}>
                  Shipment Details
                </Title>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <TextInput
                    label="Quote Tracking ID"
                    placeholder="e.g. Q-123456"
                    {...form.getInputProps("quote_tracking_id")}
                  />
                  <TextInput
                    label="PRO #"
                    placeholder="#123123124"
                    {...form.getInputProps("ftlWareHouseId")}
                  />
                  <TextInput
                    label="RTL Number"
                    value={form.values.proNumber}
                    readOnly
                    disabled
                    description="Auto-generated, cannot be changed"
                  />
                  <CarrierSelect
                    label="Carrier Name"
                    placeholder="Select Carrier"
                    {...form.getInputProps("carrierName")}
                  />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  <DatePickerInput
                    size="md"
                    label="Date of Order"
                    placeholder="mm / dd / yyyy"
                    valueFormat="MM / DD / YYYY"
                    {...form.getInputProps("dateOfOrder")}
                  />
                  <DatePickerInput
                    size="md"
                    label="Pickup Date (Opt.)"
                    placeholder="mm / dd / yyyy"
                    valueFormat="MM / DD / YYYY"
                    {...form.getInputProps("pickupDate")}
                  />
                  <DatePickerInput
                    size="md"
                    label="Est. Delivery Date"
                    placeholder="mm / dd / yyyy"
                    valueFormat="MM / DD / YYYY"
                    {...form.getInputProps("estimatedDeliveryDate")}
                  />
                  <DatePickerInput
                    size="md"
                    label="Delivery Date (Opt.)"
                    placeholder="mm / dd / yyyy"
                    valueFormat="MM / DD / YYYY"
                    {...form.getInputProps("deliveryDate")}
                  />
                </SimpleGrid>
                <Textarea
                  label="Special Notes"
                  placeholder="Any Special Handling Requirements"
                  minRows={2}
                  {...form.getInputProps("notes")}
                />
              </Stack>
            </Card>

            {/* Documents Section */}
            <ShipmentDocumentsCard
              documents={form.values.documents}
              onChange={(ids) => form.setFieldValue("documents", ids)}
              shipmentId={shipmentId}
              customerId={form.values.customer_id}
              error={form.errors.documents as string}
              isEdit
            />
          </SimpleGrid>

          {/* Action Buttons */}
          <Group justify="flex-end" mt="md">
            <Button
              variant="light"
              color="gray"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isUpdating}
              style={{
                background: "linear-gradient(135deg, #ff6b35 0%, #E94646 100%)",
              }}
            >
              Update Shipment
            </Button>
          </Group>
        </Stack>
      </form>
    </Box>
  );
}
