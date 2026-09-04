"use client";

import React, { useState } from "react";
import { FileInput, Group, Loader, Paper, Stack, Text } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export interface ParsedBolData {
  shipper_zip?: string;
  shipper_address?: string;
  shipper_city?: string;
  shipper_state?: string;
  shipper_business_name?: string;
  consignee_zip?: string;
  consignee_address?: string;
  consignee_city?: string;
  consignee_state?: string;
  consignee_business_name?: string;
  carrier_name?: string;
  special_instructions?: string;
  weight?: string | number;
  pallet_length?: string | number;
  pallet_width?: string | number;
  pallet_height?: string | number;
  [key: string]: unknown;
}

interface BolPdfAutofillProps {
  /** Called with the extracted fields once parsing succeeds; the caller maps them onto its own form. */
  onParsed: (data: ParsedBolData, file: File) => void;
  title?: string;
  description?: string;
}

/**
 * Drop this on any form that captures shipment-shaped data (shipments,
 * quotes, etc.) to let staff upload a BOL/order PDF and have the AI-extracted
 * fields populate the form instead of typing everything by hand.
 */
export default function BolPdfAutofill({
  onParsed,
  title = "Auto-fill from PDF",
  description = "Upload a BOL or order PDF to automatically populate the fields below. You can review and edit everything after extraction.",
}: BolPdfAutofillProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleUpload = async (selected: File | null) => {
    setFile(selected);
    if (!selected) return;
    setParsing(true);

    try {
      const formData = new FormData();
      formData.append("file", selected);

      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("auth_token") ||
        "";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/document/parse-bol`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (result.success && result.data) {
        onParsed(result.data, selected);
        notifications.show({
          title: "PDF Parsed Successfully",
          message: "Fields have been extracted. Please review before saving.",
          color: "green",
          autoClose: 6000,
        });
      } else {
        notifications.show({
          title: "Could Not Parse PDF",
          message: result.error || "Please fill in the form manually.",
          color: "orange",
          autoClose: 5000,
        });
      }
    } catch {
      notifications.show({
        title: "Upload Failed",
        message: "Could not process the PDF. Please fill in the form manually.",
        color: "red",
      });
    } finally {
      setParsing(false);
    }
  };

  return (
    <Paper withBorder p="lg" radius="md" style={{ borderLeft: "4px solid #293674" }}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Stack gap={4}>
          <Text fw={600} c="#293674" size="md">
            {title}
          </Text>
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        </Stack>
        <FileInput
          placeholder="Upload PDF"
          accept="application/pdf"
          leftSection={<IconUpload size={16} />}
          onChange={handleUpload}
          value={file}
          w={220}
          clearable
        />
      </Group>
      {parsing && (
        <Group mt="sm" gap="xs">
          <Loader size="xs" />
          <Text size="sm" c="blue">
            Extracting data from PDF using AI... this may take a few seconds
          </Text>
        </Group>
      )}
    </Paper>
  );
}
