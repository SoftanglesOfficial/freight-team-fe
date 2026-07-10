import React, { useState } from 'react';
import {
  Card,
  Stack,
  Title,
  Group,
  Text,
  Button,
  FileButton,
  List,
  ActionIcon,
  Tooltip,
  Paper,
  Badge,
  Loader,
} from '@mantine/core';
import { IconUpload, IconFileText, IconTrash, IconChevronRight, IconAlertCircle } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useUploadFileMutation } from '@/hooks/file-upload.hooks';
import { useCreateDocumentMutation, useGetDocumentsByShipmentIdQuery } from '@/hooks/documents.hooks';
import { DocumentCategory } from '@/hooks/Api';
import http from '@/hooks/Http';

interface ShipmentDocumentsCardProps {
  documents: string[];
  onChange: (documentIds: string[]) => void;
  shipmentId?: string;
  customerId?: string;
  error?: string;
  isEdit?: boolean;
}

interface DocumentInfo {
  id: string;
  name: string;
  category: DocumentCategory;
}

function normalizeObjectId(value: unknown): string | undefined {
  if (!value) return undefined;

  const id =
    typeof value === 'string'
      ? value
      : typeof value === 'object' && value !== null && '_id' in value
        ? String((value as { _id: unknown })._id)
        : String(value);

  return /^[a-f\d]{24}$/i.test(id) ? id : undefined;
}

export const ShipmentDocumentsCard: React.FC<ShipmentDocumentsCardProps> = ({
  documents,
  onChange,
  shipmentId,
  customerId,
  error,
  isEdit = false,
}) => {
  const [localDocs, setLocalDocs] = useState<DocumentInfo[]>([]);
  const { data: existingDocs } = useGetDocumentsByShipmentIdQuery(shipmentId || '');

  React.useEffect(() => {
    if (existingDocs && localDocs.length === 0) {
      const formatted = existingDocs.map(d => ({
        id: d._id,
        name: d.name,
        category: d.category as DocumentCategory,
      }));
      setLocalDocs(formatted);
    }
  }, [existingDocs, localDocs.length]);

  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFileMutation();
  const { mutateAsync: createDocument, isPending: isCreatingDoc } = useCreateDocumentMutation();

  const sendBolMutation = useMutation({
    mutationFn: (documentId: string) =>
      http.instance.post(`/document/${documentId}/send-bol`),
    onSuccess: () =>
      notifications.show({
        title: 'BOL Sent',
        message: 'BOL email sent to customer.',
        color: 'green',
      }),
    onError: () =>
      notifications.show({
        title: 'Error',
        message: 'Failed to send BOL email.',
        color: 'red',
      }),
  });

  const handleUpload = async (file: File | null, category: DocumentCategory) => {
    if (!file) return;

    try {
      // 1. Upload to storage
      const uploadRes = await uploadFile(file);
      
      // 2. Create document record
      const normalizedShipmentId = normalizeObjectId(shipmentId);
      const normalizedCustomerId = normalizeObjectId(customerId);

      const docRes = await createDocument({
        name: file.name,
        size: file.size,
        type: file.type,
        url: uploadRes.url,
        file_id: uploadRes.fileId,
        category: category,
        ...(normalizedShipmentId ? { shipment_id: normalizedShipmentId } : {}),
        ...(normalizedCustomerId ? { customer_id: normalizedCustomerId } : {}),
      });

      // 3. Update state
      const newDoc: DocumentInfo = {
        id: docRes._id,
        name: docRes.name,
        category: category,
      };

      if (category === DocumentCategory.BOL) {
        // Enforce SINGLE BOL
        const nextDocs = [
          ...localDocs.filter(d => d.category !== DocumentCategory.BOL),
          newDoc
        ];
        setLocalDocs(nextDocs);
        onChange(nextDocs.map(d => d.id));
      }
    } catch (err) {
      // Error handled by mutation hooks
    }
  };

  const removeDoc = (id: string) => {
    const nextDocs = localDocs.filter((d) => d.id !== id);
    setLocalDocs(nextDocs);
    onChange(nextDocs.map(d => d.id));
  };

  const bolDocs = localDocs.filter(d => d.category === DocumentCategory.BOL);

  return (
    <Card shadow="sm" padding="lg" withBorder h="100%">
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={3} c="gray.8" fw={600}>
            Documents
          </Title>
          {(isUploading || isCreatingDoc) && <Loader size="sm" color="red" />}
        </Group>

        <Stack gap="xs">
          <Text size="sm" fw={600} c="gray.7">BOL (Bill of Loading) <Text span c="red">*</Text></Text>
          <FileButton onChange={(f) => handleUpload(f, DocumentCategory.BOL)} accept="application/pdf,image/*">
            {(props) => (
              <Button
                {...props}
                variant="light"
                color="red"
                leftSection={<IconUpload size={16} />}
                fullWidth
                disabled={isUploading || isCreatingDoc}
              >
                Upload BOL (Bill of Loading)
              </Button>
            )}
          </FileButton>
          {bolDocs.length > 0 && (
            <List spacing="xs" size="sm" mt="xs">
              {bolDocs.map((doc) => (
                <List.Item
                  key={doc.id}
                  icon={<IconFileText size={16} color="blue" />}
                  styles={{ itemWrapper: { width: '100%' } }}
                >
                  <Group justify="space-between">
                    <Text size="xs" truncate maw={150}>{doc.name}</Text>
                    <Group gap={4}>
                      {doc.category === DocumentCategory.BOL && shipmentId && (
                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          loading={sendBolMutation.isPending}
                          onClick={() => sendBolMutation.mutate(doc.id)}
                        >
                          Send BOL
                        </Button>
                      )}
                      <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeDoc(doc.id)}>
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </List.Item>
              ))}
            </List>
          )}
          {error && !bolDocs.length && (
            <Group gap={4} c="red">
              <IconAlertCircle size={14} />
              <Text size="xs">{error}</Text>
            </Group>
          )}
        </Stack>

        <Paper withBorder p="xs" radius="md" bg="gray.0" mt="auto">
          <Group gap="xs">
            <IconAlertCircle size={16} color="#E94646" />
            <Text size="xs" c="dimmed">
              Ensure all uploads are clear and legible. PDF or Image formats only.
            </Text>
          </Group>
        </Paper>
      </Stack>
    </Card>
  );
};
