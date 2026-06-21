"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Stack,
  Title,
  Text,
  Badge,
  Paper,
  Grid,
  Group,
  Button,
  Loader,
  Center,
  Alert,
  Table,
} from "@mantine/core";
import { IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import { useGetQuoteRequestQuery } from "@/hooks/quote-request.hooks";
import dayjs from "dayjs";

const statusColor: Record<string, string> = {
  "Pending Quote": "yellow",
  "In Progress": "orange",
  Quoted: "blue",
  Declined: "red",
  Accepted: "green",
  "Active Shipment": "green",
  Delivered: "teal",
  Cancelled: "gray",
  "Not accepted": "gray",
};

type QuoteFeedback = {
  reason?: string;
  paidPrice?: number | string;
  chosenCarrier?: string;
  otherReason?: string;
  targetPrice?: number | string;
};

function formatCurrency(value: unknown): string {
  if (value == null || value === "") return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return String(value);
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function CustomerQuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: quote, isLoading, isError } = useGetQuoteRequestQuery(id);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (isError || !quote) {
    return (
      <Alert icon={<IconAlertCircle />} color="red" title="Quote Not Found">
        This quote could not be found. It may have been removed or the link is invalid.
      </Alert>
    );
  }

  const feedback = quote.feedback as QuoteFeedback | undefined;
  const isQuoted = ["Quoted", "Accepted", "Active Shipment", "Delivered"].includes(
    quote.status
  );
  const isDeclined = quote.status === "Declined";
  const canActOnQuote = quote.status === "Quoted";

  const totalWeight = quote.pallets?.reduce((sum, p) => sum + p.weight, 0) ?? 0;

  return (
    <Stack gap="xl">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => router.push("/customer/quotes")}
        w="fit-content"
        color="gray"
      >
        Back to My Quotes
      </Button>

      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={1} c="#293674" fw={700}>
            Quote {quote.tracking_id}
          </Title>
          <Text c="dimmed" size="sm">
            Submitted {dayjs(quote.createdAt).format("MMM DD, YYYY")}
          </Text>
        </Stack>
        <Group>
          {quote.is_time_sensitive && (
            <Badge color="red" variant="filled">
              Time Sensitive
            </Badge>
          )}
          <Badge
            color={statusColor[quote.status] ?? "gray"}
            variant="light"
            size="lg"
          >
            {quote.status}
          </Badge>
        </Group>
      </Group>

      <Paper withBorder p="lg" radius="md">
        <Title order={4} c="#293674" mb="md">
          Contact Information
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">
              Full Name
            </Text>
            <Text fw={500}>{quote.full_name}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">
              Email
            </Text>
            <Text fw={500}>{quote.email}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">
              Phone
            </Text>
            <Text fw={500}>{quote.phone || "—"}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">
              Company
            </Text>
            <Text fw={500}>{quote.company_name || "—"}</Text>
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper withBorder p="lg" radius="md">
        <Title order={4} c="#293674" mb="md">
          Shipment Route
        </Title>
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">
              Origin Zip Code
            </Text>
            <Text fw={500}>{quote.origin_zip_code}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">
              Destination Zip Code
            </Text>
            <Text fw={500}>{quote.destination_zip_code}</Text>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">
              Residential Delivery
            </Text>
            <Badge color={quote.is_residential ? "orange" : "gray"} variant="light">
              {quote.is_residential ? "Yes" : "No"}
            </Badge>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Text size="sm" c="dimmed">
              Requested Delivery Date
            </Text>
            <Text fw={500}>
              {quote.delivery_date
                ? dayjs(quote.delivery_date).format("MMM DD, YYYY")
                : "Not specified"}
            </Text>
          </Grid.Col>
          <Grid.Col span={12}>
            <Text size="sm" c="dimmed">
              Special Instructions
            </Text>
            <Text fw={500}>{quote.special_instructions || "None"}</Text>
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper withBorder p="lg" radius="md">
        <Title order={4} c="#293674" mb="md">
          Pallet Details ({quote.pallets?.length ?? 0} pallets)
        </Title>
        <Table withColumnBorders withTableBorder>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>#</Table.Th>
              <Table.Th>Weight (lbs)</Table.Th>
              <Table.Th>Length (in)</Table.Th>
              <Table.Th>Width (in)</Table.Th>
              <Table.Th>Height (in)</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {quote.pallets?.map((pallet, index) => (
              <Table.Tr key={index}>
                <Table.Td>{index + 1}</Table.Td>
                <Table.Td>{pallet.weight}</Table.Td>
                <Table.Td>{pallet.length}</Table.Td>
                <Table.Td>{pallet.width}</Table.Td>
                <Table.Td>{pallet.height}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot>
            <Table.Tr>
              <Table.Td fw={600}>Total</Table.Td>
              <Table.Td fw={600}>{totalWeight} lbs</Table.Td>
              <Table.Td colSpan={3} />
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </Paper>

      {isQuoted && (
        <Paper withBorder p="lg" radius="md">
          <Title order={4} c="#293674" mb="md">
            Quote Details
          </Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">
                Quote Amount
              </Text>
              <Text fw={700} size="xl" c="green">
                {formatCurrency(quote.quoteAmount)}
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">
                Estimated Transit Days
              </Text>
              <Text fw={500}>
                {quote.estimatedTransitDays != null
                  ? `${quote.estimatedTransitDays} days`
                  : "—"}
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">
                Carrier
              </Text>
              <Text fw={500}>{quote.carrier != null ? String(quote.carrier) : "—"}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Text size="sm" c="dimmed">
                Carrier Quote Number
              </Text>
              <Text fw={500}>
                {quote.carrierQuoteNumber != null ? String(quote.carrierQuoteNumber) : "—"}
              </Text>
            </Grid.Col>
            {quote.target_price != null && (
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">
                  Target Price
                </Text>
                <Text fw={500}>{formatCurrency(quote.target_price)}</Text>
              </Grid.Col>
            )}
          </Grid>
        </Paper>
      )}

      {isDeclined && feedback && (
        <Paper withBorder p="lg" radius="md" style={{ borderLeft: "4px solid red" }}>
          <Title order={4} c="red" mb="md">
            Decline Feedback
          </Title>
          <Grid>
            {feedback.reason && (
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">
                  Reason
                </Text>
                <Text fw={500}>{feedback.reason}</Text>
              </Grid.Col>
            )}
            {feedback.paidPrice != null && feedback.paidPrice !== "" && (
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">
                  Price They Paid
                </Text>
                <Text fw={500}>{formatCurrency(feedback.paidPrice)}</Text>
              </Grid.Col>
            )}
            {feedback.chosenCarrier && (
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">
                  Carrier They Chose
                </Text>
                <Text fw={500}>{feedback.chosenCarrier}</Text>
              </Grid.Col>
            )}
            {feedback.targetPrice != null && feedback.targetPrice !== "" && (
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text size="sm" c="dimmed">
                  Target / Counteroffer Price
                </Text>
                <Text fw={500}>{formatCurrency(feedback.targetPrice)}</Text>
              </Grid.Col>
            )}
            {feedback.otherReason && (
              <Grid.Col span={12}>
                <Text size="sm" c="dimmed">
                  Additional Notes
                </Text>
                <Text fw={500}>{feedback.otherReason}</Text>
              </Grid.Col>
            )}
          </Grid>
        </Paper>
      )}

      {canActOnQuote && (
        <Paper withBorder p="lg" radius="md" bg="blue.0">
          <Title order={4} c="#293674" mb="xs">
            Ready to decide?
          </Title>
          <Text c="dimmed" size="sm" mb="md">
            Your quote is ready. Accept to book your shipment or decline and let us know why.
          </Text>
          <Group>
            <Button
              color="green"
              size="md"
              component="a"
              href={`/track-shipment/accept/${quote._id}`}
            >
              Accept Quote
            </Button>
            <Button
              variant="outline"
              color="red"
              size="md"
              component="a"
              href={`/track-shipment?ftl-id=${quote.tracking_id}`}
            >
              Decline Quote
            </Button>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}
