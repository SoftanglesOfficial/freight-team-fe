"use client";

import React, { useState } from "react";
import {
  Title,
  Table,
  Paper,
  Group,
  Text,
  Badge,
  Button,
  Stack,
  Loader,
  Center,
  TextInput,
} from "@mantine/core";
import { IconSearch, IconFileText, IconClock } from "@tabler/icons-react";
import { useGetQuoteRequestsQuery } from "@/hooks/quote-request.hooks";
import type { QuoteRequest } from "@/hooks/Api";
import dayjs from "dayjs";

export default function CustomerQuotesPage() {
  const [search, setSearch] = useState("");

  const { data: quotesData, isLoading } = useGetQuoteRequestsQuery({
    // Pattern: Backend will filter by user email automatically now
  });

  const quotes = quotesData?.records || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "yellow";
      case "quoted": return "blue";
      case "approved": return "green";
      case "rejected": return "red";
      default: return "gray";
    }
  };

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      <Title order={1} c="#293674" fw={700}>My Quotes</Title>

      <Group justify="space-between">
        <TextInput
          placeholder="Search by tracing/details..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ width: 300 }}
        />
        <Button 
          variant="light" 
          component="a" 
          href="/customer/request-quote"
          leftSection={<IconFileText size={16} />}
        >
          Request New Quote
        </Button>
      </Group>

      <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
        <Table verticalSpacing="md" horizontalSpacing="lg">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>Tracking ID</Table.Th>
              <Table.Th>Route</Table.Th>
              <Table.Th>Requested At</Table.Th>
              <Table.Th>Items</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {quotes.length > 0 ? quotes.map((quote: QuoteRequest) => (
              <Table.Tr key={quote._id}>
                <Table.Td>
                  <Text fw={600}>{quote.tracking_id || 'Pending...'}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{quote.origin_zip_code} → {quote.destination_zip_code}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{dayjs(quote.createdAt).format('MMM DD, YYYY')}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{quote.pallets?.length || 0} Pallets</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(quote.status || "pending")} variant="light">
                    {quote.status || "pending"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <Button
                      variant="outline"
                      size="xs"
                    >
                      View Details
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            )) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" py="xl" c="dimmed">No quote requests found.</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
