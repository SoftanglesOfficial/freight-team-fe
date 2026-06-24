"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Title,
  Card,
  Table,
  Badge,
  Box,
  Group,
  TextInput,
  Select,
  Modal,
  Text,
  Stack,
  Grid,
  Divider,
  ActionIcon,
  Tooltip,
  Button,
  NumberInput,
  Menu,
} from "@mantine/core";
import {
  IconSearch,
  IconCopy,
  IconCheck,
  IconTruck,
  IconUserPlus,
  IconPlus,
  IconDotsVertical,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { useForm } from "@mantine/form";
import CustomerSearchSelect from "@/components/CustomerSearchSelect";
import {
  useGetUsersQuery,
  useCreateCustomerMutation,
} from "@/hooks/users.hooks";
import {
  useGetQuoteRequestsQuery,
  useUpdateQuoteRequestMutation,
  useSendQuoteEmailMutation,
  useDeleteQuoteRequestMutation,
} from "@/hooks/quote-request.hooks";
import type { QuoteRequest, QuoteRequestStatus } from "@/hooks/Api";
import { QuoteRequestStatus as QuoteRequestStatusEnum } from "@/hooks/Api";
import { useAdminContext } from "@/contexts/AdminContext";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: QuoteRequestStatusEnum.PendingQuote, label: "Pending Quote" },
  { value: QuoteRequestStatusEnum.Quoted, label: "Quoted" },
  { value: QuoteRequestStatusEnum.ActiveShipment, label: "Active Shipment" },
  { value: QuoteRequestStatusEnum.Delivered, label: "Delivered" },
  { value: QuoteRequestStatusEnum.Cancelled, label: "Cancelled" },
  { value: QuoteRequestStatusEnum.NotAccepted, label: "Not accepted" },
];

const carrierOptions = [
  "XPO Logistics",
  "Old Dominion Freight Line",
  "Estes Express",
  "Saia LTL Freight",
  "ABF Freight",
  "R+L Carriers",
  "Southeastern Freight Lines",
  "Averitt Express",
  "Forward Air",
  "Other",
];

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case QuoteRequestStatusEnum.PendingQuote:
      return "yellow";
    case QuoteRequestStatusEnum.Quoted:
      return "blue";
    case QuoteRequestStatusEnum.ActiveShipment:
      return "indigo";
    case QuoteRequestStatusEnum.Delivered:
      return "green";
    case QuoteRequestStatusEnum.Cancelled:
      return "red";
    case QuoteRequestStatusEnum.NotAccepted:
      return "orange";
    default:
      return "gray";
  }
};

export default function AdminQuotesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>("all");
  const [viewModalOpened, setViewModalOpened] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [copiedQuoteNumber, setCopiedQuoteNumber] = useState<string | null>(
    null
  );
  const [editableQuoteAmount, setEditableQuoteAmount] = useState<
    number | undefined
  >(undefined);
  const [editableCarrierQuoteNumber, setEditableCarrierQuoteNumber] =
    useState<string>("");
  const [editableCarrier, setEditableCarrier] = useState<string>("");
  const [editableEstimatedTransitDays, setEditableEstimatedTransitDays] =
    useState<number | undefined>(undefined);
  // Email quote modal state
  const [emailModalOpened, setEmailModalOpened] = useState(false);
  const [emailQuoteAmount, setEmailQuoteAmount] = useState<number | undefined>(undefined);
  const [emailCarrier, setEmailCarrier] = useState("");
  const [emailTransitDays, setEmailTransitDays] = useState<number | undefined>(undefined);
  const [emailNotes, setEmailNotes] = useState("");
  
  // Editable customer info
  const [editableFullName, setEditableFullName] = useState("");
  const [editableEmail, setEditableEmail] = useState("");
  const [editablePhone, setEditablePhone] = useState("");
  const [editableCompanyName, setEditableCompanyName] = useState("");

  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);

  const { selectedCustomer } = useAdminContext();

  // Fetch quotes data
  const { data: quoteRequestsData, isLoading } = useGetQuoteRequestsQuery({
    page: 1,
    pageSize: 50, // Get more data for admin view
    customer_id: selectedCustomer?._id,
  });

  // Update quote mutation
  const updateQuoteMutation = useUpdateQuoteRequestMutation();
  const sendQuoteEmailMutation = useSendQuoteEmailMutation();
  const deleteQuoteMutation = useDeleteQuoteRequestMutation();
  const createCustomerMutation = useCreateCustomerMutation();

  // Check if customer exists for the selected quote
  const { data: customerLookupData, isLoading: isCustomerLookupLoading } = useGetUsersQuery({
    page: 1,
    pageSize: 1,
    search: selectedQuote?.email || "",
  });

  const existingCustomer = (customerLookupData?.records || []).find(
    (u) => u.email.toLowerCase() === selectedQuote?.email?.toLowerCase()
  );

  // Sync editable values when selectedQuote changes
  useEffect(() => {
    if (selectedQuote) {
      setEditableQuoteAmount(
        typeof selectedQuote.quoteAmount === "number"
          ? selectedQuote.quoteAmount
          : undefined
      );
      setEditableCarrierQuoteNumber(
        typeof selectedQuote.carrierQuoteNumber === "string"
          ? selectedQuote.carrierQuoteNumber
          : ""
      );
      setEditableCarrier(
        typeof selectedQuote.carrier === "string" ? selectedQuote.carrier : ""
      );
      setEditableEstimatedTransitDays(
        typeof selectedQuote.estimatedTransitDays === "number"
          ? selectedQuote.estimatedTransitDays
          : undefined
      );
      setEditableFullName(selectedQuote.full_name || "");
      setEditableEmail(selectedQuote.email || "");
      setEditablePhone(selectedQuote.phone || "");
      setEditableCompanyName(selectedQuote.company_name || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedQuote?._id]);

  // Filter quotes based on search and status
  const filteredQuotes = (quoteRequestsData?.records || []).filter((quote) => {
    const matchesSearch =
      searchQuery === "" ||
      quote.tracking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${quote.origin_zip_code} to ${quote.destination_zip_code}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      statusFilter === null ||
      quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleCopyQuoteNumber = async (quoteNumber: string) => {
    try {
      await navigator.clipboard.writeText(quoteNumber);
      setCopiedQuoteNumber(quoteNumber);
      setTimeout(() => setCopiedQuoteNumber(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleViewQuote = (quote: QuoteRequest) => {
    setSelectedQuote(quote);
    setViewModalOpened(true);
  };

  const handleStatusUpdate = async (
    quoteId: string,
    newStatus: string | null
  ) => {
    if (!newStatus) return;

    await updateQuoteMutation.mutateAsync({
      id: quoteId,
      data: { status: newStatus as QuoteRequestStatus },
    });
    // Close modal after successful update
    setViewModalOpened(false);
  };

  const handleSaveQuoteFields = async () => {
    if (!selectedQuote) return;

    await updateQuoteMutation.mutateAsync({
      id: selectedQuote._id,
      data: {
        status: selectedQuote.status,
        // @ts-expect-error - API accepts null for empty values
        quoteAmount: editableQuoteAmount ?? null,
        // @ts-expect-error - API accepts null for empty values
        carrierQuoteNumber: editableCarrierQuoteNumber.trim() || null,
        // @ts-expect-error - API accepts null for empty values
        carrier: editableCarrier.trim() || null,
        // @ts-expect-error - API accepts null for empty values
        estimatedTransitDays: editableEstimatedTransitDays ?? null,
        full_name: editableFullName,
        email: editableEmail,
        phone: editablePhone,
        company_name: editableCompanyName,
      },
    });
  };

  // Check if values have changed from original
  const hasChanges = selectedQuote
    ? (editableQuoteAmount ?? undefined) !==
    (selectedQuote.quoteAmount ?? undefined) ||
    (editableCarrierQuoteNumber || "") !==
    (selectedQuote.carrierQuoteNumber || "") ||
    (editableCarrier || "") !==
    (typeof selectedQuote.carrier === "string" ? selectedQuote.carrier : "") ||
    (editableEstimatedTransitDays ?? undefined) !==
    (typeof selectedQuote.estimatedTransitDays === "number"
      ? selectedQuote.estimatedTransitDays
      : undefined) ||
    editableFullName !== selectedQuote.full_name ||
    editableEmail !== selectedQuote.email ||
    editablePhone !== selectedQuote.phone ||
    editableCompanyName !== (selectedQuote.company_name || "")
    : false;

  const handleConvertToShipment = (quote: QuoteRequest) => {
    router.push(`/admin/shipments/create?quoteId=${quote._id}`);
  };

  const handleOpenEmailModal = () => {
    if (!selectedQuote) return;
    setEmailQuoteAmount(
      typeof selectedQuote.quoteAmount === "number" ? selectedQuote.quoteAmount : undefined
    );
    setEmailCarrier("");
    setEmailTransitDays(undefined);
    setEmailNotes("");
    setEmailModalOpened(true);
  };

  const handleSendQuoteEmail = async () => {
    if (!selectedQuote || !emailQuoteAmount || !emailCarrier || !emailTransitDays) return;
    await sendQuoteEmailMutation.mutateAsync({
      id: selectedQuote._id,
      data: {
        quoteAmount: emailQuoteAmount,
        carrier: emailCarrier,
        estimatedTransitDays: emailTransitDays,
        notes: emailNotes || undefined,
      },
    });
    setEmailModalOpened(false);
  };

  const handleDeleteQuote = (quote: QuoteRequest) => {
    modals.openConfirmModal({
      title: "Delete Quote",
      children: (
        <Text size="sm">
          Are you sure you want to delete quote{" "}
          <Text span fw={700}>
            {quote.tracking_id}
          </Text>
          ? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete Quote", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteQuoteMutation.mutate(quote._id);
      },
    });
  };

  const CreateCustomerModal = () => {
    const form = useForm({
      initialValues: {
        first_name: selectedQuote?.full_name?.split(" ")[0] || "",
        last_name: selectedQuote?.full_name?.split(" ").slice(1).join(" ") || "",
        email: selectedQuote?.email || "",
        phone: selectedQuote?.phone || "",
        company_name: selectedQuote?.company_name || "",
      },
      validate: {
        first_name: (val) =>
          val.length < 2 ? "First name must be at least 2 characters" : null,
        email: (val) =>
          /^\S+@\S+$/.test(val) ? null : "Invalid email address",
      },
    });

    const handleSubmit = async (values: typeof form.values) => {
      await createCustomerMutation.mutateAsync({
        first_name: values.first_name,
        last_name: values.last_name || undefined,
        email: values.email,
        phone: values.phone || undefined,
        company_name: values.company_name || undefined,
      });
      setIsCreateCustomerModalOpen(false);
      form.reset();
    };

    return (
      <Modal
        opened={isCreateCustomerModalOpen}
        onClose={() => setIsCreateCustomerModalOpen(false)}
        title="Create New Customer"
        size="md"
        zIndex={1001} // Ensure it's above the quote details modal
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Group grow>
              <TextInput
                label="First Name"
                placeholder="John"
                required
                {...form.getInputProps("first_name")}
              />
              <TextInput
                label="Last Name"
                placeholder="Doe"
                {...form.getInputProps("last_name")}
              />
            </Group>
            <TextInput
              label="Email"
              placeholder="customer@example.com"
              required
              {...form.getInputProps("email")}
            />
            <TextInput
              label="Phone"
              placeholder="(555) 123-4567"
              {...form.getInputProps("phone")}
            />
            <TextInput
              label="Company Name"
              placeholder="ABC Logistics"
              {...form.getInputProps("company_name")}
            />
            <Text size="sm" c="dimmed">
              A random password will be generated and sent to the customer via
              email.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => setIsCreateCustomerModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createCustomerMutation.isPending}
                style={{
                  background:
                    "linear-gradient(135deg, #ff6b35 0%, #E94646 100%)",
                }}
              >
                Create Customer
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    );
  };

  return (
    <>
      {/* View Quote Modal */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title={`Quote Details - ${selectedQuote?.tracking_id || ""}`}
        size="lg"
        centered
      >
        {selectedQuote && (
          <Stack gap="md">
            {/* Status and Basic Info */}
            <Box>
              <Text fw={600} mb="sm" c="gray.7">
                Status
              </Text>
              <Select
                data={statusOptions.filter((option) => option.value !== "all")}
                value={selectedQuote.status}
                onChange={(value) =>
                  handleStatusUpdate(selectedQuote._id, value)
                }
                placeholder="Select status"
                style={{ maxWidth: 200 }}
              />
            </Box>

            <Divider />

            {/* Customer Information */}
            <Box>
              <Text fw={600} mb="sm" c="gray.7">
                Customer Information
              </Text>
              <Box mb="md">
                <CustomerSearchSelect
                  label="Update Customer from Existing Record"
                  placeholder="Re-assign customer..."
                  onSelect={(customer) => {
                    if (customer) {
                      setEditableFullName(`${customer.first_name} ${customer.last_name || ""}`.trim());
                      setEditableEmail(customer.email);
                      setEditablePhone((customer as any).phone || "");
                      setEditableCompanyName((customer as any).company_name || "");
                    }
                  }}
                />
              </Box>
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Full Name"
                    value={editableFullName}
                    onChange={(e) => setEditableFullName(e.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Company"
                    value={editableCompanyName}
                    onChange={(e) => setEditableCompanyName(e.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Email"
                    value={editableEmail}
                    onChange={(e) => setEditableEmail(e.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Phone"
                    value={editablePhone}
                    onChange={(e) => setEditablePhone(e.currentTarget.value)}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Divider label="Customer Account" labelPosition="center" />
                  <Group justify="space-between" mt="xs">
                    {isCustomerLookupLoading ? (
                      <Text size="sm" c="dimmed">Checking for customer account...</Text>
                    ) : existingCustomer ? (
                      <Badge color="green" variant="light" size="lg">Customer Account Exists</Badge>
                    ) : (
                      <>
                        <Text size="sm" c="orange" fw={500}>No customer account found for this email.</Text>
                        <Button
                          size="xs"
                          leftSection={<IconUserPlus size={14} />}
                          variant="light"
                          color="orange"
                          onClick={() => setIsCreateCustomerModalOpen(true)}
                        >
                          Create Customer Account
                        </Button>
                      </>
                    )}
                  </Group>
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* Quote Information */}
            <Box>
              <Text fw={600} mb="sm" c="gray.7">
                Quote Information
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed" mb={4}>
                    Quote Amount
                  </Text>
                  <NumberInput
                    value={editableQuoteAmount}
                    onChange={(value) =>
                      setEditableQuoteAmount(
                        typeof value === "number" ? value : undefined
                      )
                    }
                    placeholder="Enter quote amount"
                    prefix="$"
                    size="md"
                    decimalScale={2}
                    min={0}
                    step={0.01}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed" mb={4}>
                    Carrier Quote Number
                  </Text>
                  <Group gap="xs" align="flex-start">
                    <TextInput
                      value={editableCarrierQuoteNumber}
                      onChange={(e) =>
                        setEditableCarrierQuoteNumber(e.currentTarget.value)
                      }
                      placeholder="Enter carrier quote number"
                      style={{ flex: 1 }}
                    />
                    {editableCarrierQuoteNumber && (
                      <Tooltip
                        label={
                          copiedQuoteNumber === editableCarrierQuoteNumber
                            ? "Copied!"
                            : "Copy to clipboard"
                        }
                      >
                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyQuoteNumber(editableCarrierQuoteNumber);
                          }}
                        >
                          {copiedQuoteNumber === editableCarrierQuoteNumber ? (
                            <IconCheck size={16} />
                          ) : (
                            <IconCopy size={16} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Carrier"
                    placeholder="Select carrier"
                    data={carrierOptions}
                    searchable
                    clearable
                    value={editableCarrier || null}
                    onChange={(value) => setEditableCarrier(value || "")}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Estimated Transit Days"
                    placeholder="e.g. 3"
                    min={1}
                    max={30}
                    suffix=" business days"
                    value={editableEstimatedTransitDays}
                    onChange={(value) =>
                      setEditableEstimatedTransitDays(
                        typeof value === "number" ? value : undefined
                      )
                    }
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Converted to Shipment
                  </Text>
                  <Badge
                    color={selectedQuote.convertedToShipment ? "green" : "gray"}
                    variant="light"
                  >
                    {selectedQuote.convertedToShipment ? "Yes" : "No"}
                  </Badge>
                </Grid.Col>
                {hasChanges && (
                  <Grid.Col span={12}>
                    <Button
                      onClick={handleSaveQuoteFields}
                      loading={updateQuoteMutation.isPending}
                      mt="sm"
                    >
                      Save Changes
                    </Button>
                  </Grid.Col>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Route Information */}
            <Box>
              <Text fw={600} mb="sm" c="gray.7">
                Route Information
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Origin ZIP Code
                  </Text>
                  <Text>{selectedQuote.origin_zip_code}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Destination ZIP Code
                  </Text>
                  <Text>{selectedQuote.destination_zip_code}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Delivery Date
                  </Text>
                  <Text>{formatDate(selectedQuote.delivery_date)}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Time Sensitive
                  </Text>
                  <Text>{selectedQuote.is_time_sensitive ? "Yes" : "No"}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Residential Delivery
                  </Text>
                  <Text>{selectedQuote.is_residential ? "Yes" : "No"}</Text>
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* Pallets Information */}
            <Box>
              <Text fw={600} mb="sm" c="gray.7">
                Cargo Information
              </Text>
              {selectedQuote.pallets && selectedQuote.pallets.length > 0 ? (
                <Stack gap="xs">
                  {selectedQuote.pallets.map((pallet, index: number) => (
                    <Card key={index} withBorder p="sm">
                      <Text fw={500} size="sm">
                        Pallet {index + 1}
                      </Text>
                      <Grid>
                        <Grid.Col span={3}>
                          <Text size="xs" c="dimmed">
                            Weight (lbs)
                          </Text>
                          <Text size="sm">{pallet.weight}</Text>
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <Text size="xs" c="dimmed">
                            Length (in)
                          </Text>
                          <Text size="sm">{pallet.length}</Text>
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <Text size="xs" c="dimmed">
                            Width (in)
                          </Text>
                          <Text size="sm">{pallet.width}</Text>
                        </Grid.Col>
                        <Grid.Col span={3}>
                          <Text size="xs" c="dimmed">
                            Height (in)
                          </Text>
                          <Text size="sm">{pallet.height}</Text>
                        </Grid.Col>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed">No pallet information available</Text>
              )}
            </Box>

            {/* Special Instructions */}
            {selectedQuote.special_instructions && (
              <>
                <Divider />
                <Box>
                  <Text fw={600} mb="sm" c="gray.7">
                    Special Instructions
                  </Text>
                  <Text>{selectedQuote.special_instructions}</Text>
                </Box>
              </>
            )}

            {/* Metadata */}
            <Divider />
            <Box>
              <Text fw={600} mb="sm" c="gray.7">
                Metadata
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Created
                  </Text>
                  <Text size="sm">{formatDate(selectedQuote.createdAt)}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">
                    Last Updated
                  </Text>
                  <Text size="sm">{formatDate(selectedQuote.updatedAt)}</Text>
                </Grid.Col>
              </Grid>
            </Box>

            {/* Actions */}
            <Divider />
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                color="blue"
                onClick={handleOpenEmailModal}
              >
                Email Quote
              </Button>
              <Button
                leftSection={<IconTruck size={16} />}
                onClick={() => {
                  if (selectedQuote) {
                    handleConvertToShipment(selectedQuote);
                  }
                }}
                disabled={selectedQuote.convertedToShipment}
                style={{
                  background:
                    "linear-gradient(135deg, #ff6b35 0%, #E94646 100%)",
                }}
              >
                {selectedQuote.convertedToShipment
                  ? "Already Converted"
                  : "Convert to Shipment"}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Email Quote Modal */}
      <Modal
        opened={emailModalOpened}
        onClose={() => setEmailModalOpened(false)}
        title={`Email Quote to ${selectedQuote?.email}`}
        size="md"
        centered
      >
        <Stack gap="md">
          <NumberInput
            label="Quote Amount ($)"
            placeholder="e.g. 1250.00"
            prefix="$"
            decimalScale={2}
            min={0}
            value={emailQuoteAmount}
            onChange={(v) => setEmailQuoteAmount(typeof v === "number" ? v : undefined)}
            required
          />
          <TextInput
            label="Carrier"
            placeholder="e.g. XPO Logistics"
            value={emailCarrier}
            onChange={(e) => setEmailCarrier(e.currentTarget.value)}
            required
          />
          <NumberInput
            label="Estimated Transit Days"
            placeholder="e.g. 3"
            min={1}
            value={emailTransitDays}
            onChange={(v) => setEmailTransitDays(typeof v === "number" ? v : undefined)}
            required
          />
          <TextInput
            label="Additional Notes (optional)"
            placeholder="Any extra info for the customer..."
            value={emailNotes}
            onChange={(e) => setEmailNotes(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="light" onClick={() => setEmailModalOpened(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendQuoteEmail}
              loading={sendQuoteEmailMutation.isPending}
              disabled={!emailQuoteAmount || !emailCarrier || !emailTransitDays}
              color="blue"
            >
              Send Email
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Box>
        <Title order={1} mb="xl" c="gray.8">
          Quote Management
        </Title>

        {/* Filters */}
        <Group mb="xl" gap="md">
          <TextInput
            placeholder="Search by tracking ID, company, name, email, or route..."
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
          <Button
            leftSection={<IconPlus size={16} />}
            color="blue"
            onClick={() => router.push("/admin/quotes/create")}
          >
            Create Quote
          </Button>
        </Group>

        {/* Quotes Table */}
        <Card shadow="sm" padding="lg" withBorder>
          <Table.ScrollContainer minWidth={1200}>
            <Table verticalSpacing="md" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Quote ID</Table.Th>
                  <Table.Th>Company</Table.Th>
                  <Table.Th>Route</Table.Th>
                  <Table.Th>Quote Amount</Table.Th>
                  <Table.Th>Carrier Quote #</Table.Th>
                  <Table.Th>Converted</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>ETA</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {isLoading ? (
                  <Table.Tr>
                    <Table.Td colSpan={9} style={{ textAlign: "center" }}>
                      Loading quotes...
                    </Table.Td>
                  </Table.Tr>
                ) : filteredQuotes.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={9} style={{ textAlign: "center" }}>
                      No quotes found
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredQuotes.map((quote) => (
                    <Table.Tr
                      key={quote._id}
                    >
                      <Table.Td>
                        <Text
                          variant="link"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleViewQuote(quote)}
                        >
                          {quote.tracking_id}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {quote.company_name || quote.full_name}
                      </Table.Td>
                      <Table.Td>{`${quote.origin_zip_code} → ${quote.destination_zip_code}`}</Table.Td>
                      <Table.Td>
                        {formatCurrency(
                          typeof quote.quoteAmount === "number"
                            ? quote.quoteAmount
                            : undefined
                        )}
                      </Table.Td>
                      <Table.Td>
                        {typeof quote.carrierQuoteNumber === "string" &&
                          quote.carrierQuoteNumber ? (
                          <Group gap={4}>
                            <Text size="sm">{quote.carrierQuoteNumber}</Text>
                            <ActionIcon
                              variant="subtle"
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  typeof quote.carrierQuoteNumber === "string"
                                ) {
                                  handleCopyQuoteNumber(
                                    quote.carrierQuoteNumber
                                  );
                                }
                              }}
                            >
                              {copiedQuoteNumber ===
                                quote.carrierQuoteNumber ? (
                                <IconCheck size={14} />
                              ) : (
                                <IconCopy size={14} />
                              )}
                            </ActionIcon>
                          </Group>
                        ) : (
                          "N/A"
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={quote.convertedToShipment ? "green" : "gray"}
                          variant="light"
                          size="sm"
                        >
                          {quote.convertedToShipment ? "Yes" : "No"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={getStatusBadgeColor(quote.status)}
                          variant="light"
                          radius="xl"
                          size="md"
                        >
                          {quote.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(quote.delivery_date)}</Table.Td>
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
                              onClick={() => handleViewQuote(quote)}
                            >
                              View Details
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconTruck size={14} />}
                              onClick={() => handleConvertToShipment(quote)}
                              disabled={quote.convertedToShipment}
                              color={quote.convertedToShipment ? "gray" : "orange"}
                            >
                              {quote.convertedToShipment ? "Already Converted" : "Convert to Shipment"}
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => handleDeleteQuote(quote)}
                            >
                              Delete Quote
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      </Box>

      <CreateCustomerModal />
    </>
  );
}
