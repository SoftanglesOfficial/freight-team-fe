"use client";

import React from "react";
import Link from "next/link";
import {
  Title,
  Table,
  Paper,
  Group,
  Text,
  ActionIcon,
  Badge,
  Button,
  Stack,
  Loader,
  Center,
} from "@mantine/core";
import { IconFileInvoice, IconDownload, IconFileTypePdf, IconFiles } from "@tabler/icons-react";
import { useGetDocumentsQuery } from "@/hooks/documents.hooks";
import { DocumentCategory } from "@/hooks/Api";
import dayjs from "dayjs";

export default function CustomerDocumentsPage() {
  const { data: documentsData, isLoading } = useGetDocumentsQuery({} as any);
  const documents = documentsData?.records || [];

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <Title order={1} c="#293674" fw={700}>My Documents (Invoices & BOLs)</Title>
      </Group>

      <Paper withBorder radius="md" p={0} style={{ overflow: 'hidden' }}>
        <Table verticalSpacing="md" horizontalSpacing="lg">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th w={40}></Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Date Added</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>ID</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {documents.length > 0 ? documents.map((doc: any) => (
              <Table.Tr key={doc._id}>
                <Table.Td>
                  <ThemeIcon variant="transparent" color="red">
                    <IconFileTypePdf size={24} />
                  </ThemeIcon>
                </Table.Td>
                <Table.Td>
                  <Text fw={600}>{doc.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">{doc.size ? (doc.size / 1024 / 1024).toFixed(1) + 'mb' : 'N/A'}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{dayjs(doc.createdAt).format('YYYY-MM-DD')}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color="gray">PDF</Badge>
                </Table.Td>
                <Table.Td>
                  {doc.shipment_id ? (
                    <Text 
                      size="sm" 
                      ff="monospace" 
                      c="blue" 
                      component={Link} 
                      href={`/customer/freights/${doc.shipment_id}`}
                      style={{ cursor: 'pointer', textDecoration: 'none' }}
                    >
                      {doc.shipment_id}
                    </Text>
                  ) : (
                    <Text size="sm" ff="monospace">N/A</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Button
                      variant="outline"
                      size="xs"
                      leftSection={<IconDownload size={14} />}
                      component="a"
                      href={doc.url}
                      target="_blank"
                    >
                      Download / View
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            )) : (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" py="xl" c="dimmed">No invoices found.</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}

// We need ThemeIcon from mantine core which was missing in previous import if used
import { ThemeIcon } from "@mantine/core";

