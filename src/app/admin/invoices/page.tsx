"use client";

import React, { useState, useEffect } from "react";
import {
  Title,
  Card,
  Table,
  Badge,
  Box,
  Group,
  TextInput,
  Select,
  Text,
  ActionIcon,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Modal,
  Button,
  Pagination,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";
import {
  IconSearch,
  IconUpload,
  IconFile,
  IconEdit,
  IconTrash,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useUploadFileMutation } from "@/hooks/file-upload.hooks";
import {
  useCreateDocumentMutation,
  useGetDocumentsQuery,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} from "@/hooks/documents.hooks";
import { DocumentCategory, Document, Role } from "@/hooks/Api";
import { useGetUsersQuery } from "@/hooks/users.hooks";
import { useAdminContext } from "@/contexts/AdminContext";

const dateOptions = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

export default function AdminInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string | null>("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { selectedCustomer } = useAdminContext();

  useEffect(() => {
    if (selectedCustomer) {
      setSelectedCustomerId(selectedCustomer._id);
    }
  }, [selectedCustomer]);

  // Fetch customers for assignment dropdown
  const { data: customersData } = useGetUsersQuery({
    page: 1,
    pageSize: 100,
    role: Role.StandardUser,
  });
  const customerOptions = (customersData?.records || []).map((u) => ({
    value: u._id,
    label: `${u.first_name}${u.last_name ? " " + u.last_name : ""} (${u.email})`,
  }));

  // Hooks
  const uploadFileMutation = useUploadFileMutation();
  const createDocumentMutation = useCreateDocumentMutation();
  const updateDocumentMutation = useUpdateDocumentMutation();
  const deleteDocumentMutation = useDeleteDocumentMutation();
  const { data: documentsData, isLoading } = useGetDocumentsQuery({
    page: currentPage,
    pageSize: 10,
    search: searchQuery || undefined,
    category: DocumentCategory.Invoice,
    customer_id: selectedCustomer?._id,
  });

  const documents = documentsData?.records || [];

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        // Upload file first
        const uploadResult = await uploadFileMutation.mutateAsync(file);

        // Create document record
        await createDocumentMutation.mutateAsync({
          name: file.name,
          size: file.size,
          type: file.type,
          url: uploadResult.url,
          file_id: uploadResult.fileId,
          category: DocumentCategory.Invoice,
          customer_id: selectedCustomer?._id || selectedCustomerId || undefined,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }
  };

  // Handle edit start
  const handleEditStart = (document: Document) => {
    setSelectedDocument(document);
    setIsEditModalOpen(true);
  };

  // Handle edit save
  const handleEditSave = async (newName: string, customerId?: string) => {
    if (selectedDocument && (newName.trim() || customerId !== undefined)) {
      try {
        await updateDocumentMutation.mutateAsync({
          id: selectedDocument._id,
          data: {
            name: newName.trim(),
            customer_id: customerId || undefined,
          },
        });
        setIsEditModalOpen(false);
        setSelectedDocument(null);
      } catch (error) {
        console.error("Update failed:", error);
      }
    }
  };

  // Handle delete
  const handleDelete = (document: Document) => {
    modals.openConfirmModal({
      title: "Delete Document",
      children: (
        <Text size="sm">
          Are you sure you want to delete document{" "}
          <Text span fw={700}>
            {document.name}
          </Text>
          ? This action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete Document", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteDocumentMutation.mutateAsync(document._id);
        } catch (error) {
          console.error("Delete failed:", error);
        }
      },
    });
  };

  // Filter documents based on search
  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      searchQuery === "" ||
      document.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.internal_id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Edit Name Modal Component
  const EditNameModal = () => {
    const [newName, setNewName] = useState(selectedDocument?.name || "");
    const [customerId, setCustomerId] = useState<string | null>(
      (typeof selectedDocument?.customer === "object"
        ? selectedDocument.customer?._id
        : selectedDocument?.customer) || null
    );
    const handleSave = () => {
      handleEditSave(newName, customerId || undefined);
      setNewName("");
    };

    const handleClose = () => {
      setIsEditModalOpen(false);
      setSelectedDocument(null);
      setNewName("");
    };

    return (
      <Modal
        opened={isEditModalOpen}
        onClose={handleClose}
        title="Edit Document"
        size="md"
      >
        <Box>
          <TextInput
            label="Document Name"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            placeholder="Enter document name"
            mb="md"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleClose();
            }}
          />
          <Select
            label="Assign to Customer"
            placeholder="Select a customer..."
            data={customerOptions}
            value={customerId}
            onChange={setCustomerId}
            clearable
            searchable
            mb="md"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={updateDocumentMutation.isPending}
              disabled={!newName.trim()}
            >
              Save
            </Button>
          </Group>
        </Box>
      </Modal>
    );
  };

  return (
    <Box>
      {/* Title */}
      <Title order={1} c="gray.8" mb="xl" style={{ margin: 0 }}>
        Invoice Manager
      </Title>

      {/* Search and Filter Bar */}
      <Group mb="xl" gap="md">
        <TextInput
          placeholder="Search..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Date Added"
          data={dateOptions}
          value={dateFilter}
          onChange={setDateFilter}
          style={{ width: 200 }}
        />
      </Group>


      {/* File Upload Section */}
      <Dropzone
        onDrop={handleFileUpload}
        accept={[...PDF_MIME_TYPE, ...IMAGE_MIME_TYPE, "application/json"]}
        maxSize={100 * 1024 * 1024} // 100MB
        loading={
          uploadFileMutation.isPending || createDocumentMutation.isPending
        }
        styles={{
          root: {
            borderColor: "#51cf66",
            borderStyle: "dashed",
            borderWidth: 2,
            background: "linear-gradient(to right, #d3f9d8, #ffe3e3)",
            padding: "3rem",
            borderRadius: "1rem",
            marginBottom: "2rem",
          },
        }}
      >
        <Group justify="center" gap="xl" style={{ pointerEvents: "none" }}>
          <Dropzone.Accept>
            <IconUpload size={52} color="green" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconUpload size={52} color="red" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFile size={52} color="green" />
          </Dropzone.Idle>

          <div style={{ textAlign: "center" }}>
            <Dropzone.Idle>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 500,
                  marginBottom: "0.5rem",
                }}
              >
                Drag and drop files here or click to upload
              </div>
              <div style={{ fontSize: "0.9rem", color: "gray" }}>
                Supported formats: PDF, JSON, Images (Max 100MB)
              </div>
            </Dropzone.Idle>
          </div>
        </Group>
      </Dropzone>

      {/* Invoice List Table */}
      <Card shadow="sm" padding="lg" withBorder>
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Customer</Table.Th>
                <Table.Th>Shipment</Table.Th>
                <Table.Th>Size</Table.Th>
                <Table.Th>Date Added</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={8} style={{ textAlign: "center" }}>
                    <Text>Loading documents...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : filteredDocuments.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8} style={{ textAlign: "center" }}>
                    <Text>No documents found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredDocuments.map((document) => (
                  <Table.Tr key={document._id}>
                    <Table.Td>
                      <Group gap="xs">
                        <Box
                          style={{
                            width: 24,
                            height: 24,
                            backgroundColor: "#ff6b6b",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconFile size={14} color="white" />
                        </Box>
                        <Text>{document.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      {document.customer &&
                        typeof document.customer === "object" ? (
                        <Box>
                          <Text size="sm" fw={500}>
                            {document.customer.first_name}{" "}
                            {document.customer.last_name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {document.customer.email}
                          </Text>
                        </Box>
                      ) : (
                        <Text size="sm" c="dimmed">
                          Unassigned
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      {document.shipment_id && typeof document.shipment_id !== "string" ? (
                        <Badge variant="light" color="orange">
                          PRO: {(document.shipment_id as any).proNumber}
                        </Badge>
                      ) : (
                        <Text size="sm" c="dimmed">-</Text>
                      )}
                    </Table.Td>
                    <Table.Td>{formatFileSize(document.size)}</Table.Td>
                    <Table.Td>{formatDate(document.createdAt)}</Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="gray" radius="xl" size="md">
                        {document.type.split("/")[1]?.toUpperCase() ||
                          document.type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{document.internal_id}</Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <MenuTarget>
                          <ActionIcon variant="subtle" size="sm">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </MenuTarget>
                        <MenuDropdown>
                          <MenuItem
                            leftSection={<IconEdit size={14} />}
                            onClick={() => handleEditStart(document)}
                          >
                            Edit Name
                          </MenuItem>
                          <MenuItem
                            leftSection={<IconFile size={14} />}
                            component="a"
                            href={document.url}
                            download={document.name}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </MenuItem>
                          <Menu.Divider />
                          <MenuItem
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleDelete(document)}
                          >
                            Delete Document
                          </MenuItem>
                        </MenuDropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        {/* Pagination */}
        {documentsData?.pagination && (
          <Group justify="flex-end" mt="md">
            <Pagination
              total={documentsData.pagination.totalPages}
              value={currentPage}
              onChange={setCurrentPage}
            />
          </Group>
        )}
      </Card>

      {/* Edit Name Modal */}
      <EditNameModal />
    </Box>
  );
}
