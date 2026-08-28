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
  Text,
  ActionIcon,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Pagination,
  Tabs,
  Divider,
  Modal,
  Button,
  Stack,
  PasswordInput,
  Switch,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { useRouter } from "next/navigation";
import { Dropzone, IMAGE_MIME_TYPE, PDF_MIME_TYPE } from "@mantine/dropzone";
import {
  IconSearch,
  IconEdit,
  IconFiles,
  IconUpload,
  IconFile,
  IconPlus,
  IconTruck,
  IconFileText,
  IconKey,
  IconUserPlus,
  IconDotsVertical,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import {
  useGetUsersQuery,
  useMakeUserPasswordMutation,
  useUpdateUserMutation,
  useCreateCustomerMutation,
  useDeleteUserMutation,
} from "@/hooks/users.hooks";
import {
  useCreateDocumentMutation,
} from "@/hooks/documents.hooks";
import { useUploadFileMutation } from "@/hooks/file-upload.hooks";
import { Role, User } from "@/hooks/Api";
import { useForm } from "@mantine/form";
import { useGetShipmentsQuery } from "@/hooks/shipments.hooks";
import { useGetQuoteRequestsQuery } from "@/hooks/quote-request.hooks";
import { useGetDocumentsQuery } from "@/hooks/documents.hooks";
import { DocumentCategory } from "@/hooks/Api";
import dayjs from "dayjs";
import { useAdminContext } from "@/contexts/AdminContext";

export default function AdminCustomersPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState<User | null>(null);

  const { setSelectedCustomer } = useAdminContext();

  // Hooks
  const { data: usersData, isLoading } = useGetUsersQuery({
    page: currentPage,
    pageSize: 10,
    search: searchQuery || undefined,
    role: Role.StandardUser,
  });

  const users = usersData?.records || [];

  // Mutations
  const updateUserMutation = useUpdateUserMutation();
  const makeUserPasswordMutation = useMakeUserPasswordMutation();
  const createCustomerMutation = useCreateCustomerMutation();
  const deleteUserMutation = useDeleteUserMutation();

  // Handlers
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setIsPasswordModalOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setDetailsUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    modals.openConfirmModal({
      title: "Delete Customer",
      children: (
        <Text size="sm">
          Are you sure you want to delete customer{" "}
          <Text span fw={700}>
            {user.first_name} {user.last_name || ""}
          </Text>
          ? This action cannot be undone and will remove all associated data.
        </Text>
      ),
      labels: { confirm: "Delete Customer", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        deleteUserMutation.mutate(user._id);
      },
    });
  };

  // Components
  const UserStatusBadge = ({ isActive }: { isActive: boolean }) => {
    return (
      <Badge color={isActive ? "green" : "red"} variant="light">
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const CreateCustomerModal = () => {
    const form = useForm({
      initialValues: {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company_name: "",
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
      setIsCreateModalOpen(false);
      form.reset();
    };

    return (
      <Modal
        opened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Customer"
        size="md"
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
                onClick={() => setIsCreateModalOpen(false)}
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

  const EditUserModal = () => {
    const [firstName, setFirstName] = useState(selectedUser?.first_name || "");
    const [lastName, setLastName] = useState(selectedUser?.last_name || "");
    const [isActive, setIsActive] = useState(selectedUser?.is_active ?? true);
    const [phone, setPhone] = useState((selectedUser as any)?.phone || "");
    const [companyName, setCompanyName] = useState((selectedUser as any)?.company_name || "");

    useEffect(() => {
      if (selectedUser) {
        setFirstName(selectedUser.first_name);
        setLastName(selectedUser.last_name || "");
        setIsActive(selectedUser.is_active);
        setPhone((selectedUser as any).phone || "");
        setCompanyName((selectedUser as any).company_name || "");
      }
    }, [selectedUser]);

    const handleSave = async () => {
      if (!selectedUser) return;
      await updateUserMutation.mutateAsync({
        id: selectedUser._id,
        data: {
          first_name: firstName,
          last_name: lastName,
          is_active: isActive,
          phone: phone || undefined,
          company_name: companyName || undefined,
        },
      });
      setIsEditModalOpen(false);
      setSelectedUser(null);
    };

    return (
      <Modal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        <Stack>
          <TextInput
            label="First Name"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.currentTarget.value)}
          />
          <TextInput
            label="Last Name"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.currentTarget.value)}
          />
          <TextInput
            label="Phone"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.currentTarget.value)}
          />
          <TextInput
            label="Company Name"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.currentTarget.value)}
          />
          <Switch
            label="Active Account"
            checked={isActive}
            onChange={(e) => setIsActive(e.currentTarget.checked)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={updateUserMutation.isPending}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>
    );
  };

  const ChangePasswordModal = () => {
    const form = useForm({
      initialValues: {
        new_password: "",
        confirm_password: "",
      },
      validate: {
        new_password: (val) =>
          val.length < 6 ? "Password must be at least 6 characters" : null,
        confirm_password: (val, values) =>
          val !== values.new_password ? "Passwords do not match" : null,
      },
    });

    const handleSubmit = async (values: typeof form.values) => {
      if (!selectedUser) return;
      await makeUserPasswordMutation.mutateAsync({
        id: selectedUser._id,
        data: values,
      });
      setIsPasswordModalOpen(false);
      setSelectedUser(null);
      form.reset();
    };

    return (
      <Modal
        opened={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Reset Password"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              {...form.getInputProps("new_password")}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              {...form.getInputProps("confirm_password")}
            />
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => setIsPasswordModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={makeUserPasswordMutation.isPending}
              >
                Update Password
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    );
  };

  const CustomerDetailsModal = () => {
    if (!detailsUser) return null;

    // Use hooks inside the component
    const { data: shipmentsData, isLoading: isLoadingShipments } = useGetShipmentsQuery({
      customer_email: detailsUser.email,
      pageSize: 50,
    });

    const { data: quotesData, isLoading: isLoadingQuotes } = useGetQuoteRequestsQuery({
      email: detailsUser.email,
      pageSize: 50,
    });

    const { data: bolData, isLoading: isLoadingBOL } = useGetDocumentsQuery({
      customer_id: detailsUser._id,
      category: DocumentCategory.BOL,
      pageSize: 50,
    });

    const uploadFileMutation = useUploadFileMutation();
    const createDocumentMutation = useCreateDocumentMutation();

    const handleFileUpload = async (files: File[], category: DocumentCategory) => {
      for (const file of files) {
        try {
          const uploadResult = await uploadFileMutation.mutateAsync(file);
          await createDocumentMutation.mutateAsync({
            name: file.name,
            size: file.size,
            type: file.type,
            url: uploadResult.url,
            file_id: uploadResult.fileId,
            category: category,
            customer_id: detailsUser._id,
          } as any);
        } catch (error) {
          console.error("Upload failed", error);
        }
      }
    };

    const TabHeader = ({ title, actionLabel, onAction, icon: Icon }: any) => (
      <Group justify="space-between" mb="lg" mt="md">
        <Group gap="sm">
          <Title order={3} c="gray.8" fw={600}>
            {title}
          </Title>
        </Group>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={onAction}
          style={{
            background: "linear-gradient(135deg, #ff6b35 0%, #E94646 100%)",
          }}
        >
          {actionLabel}
        </Button>
      </Group>
    );

    return (
      <Modal
        opened={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={
          <Group gap="xs">
            <Text fw={700} size="lg">Customer Hub:</Text>
            <Text size="lg">{detailsUser.first_name} {detailsUser.last_name || ""}</Text>
            <Badge variant="light" color="blue">{detailsUser.email}</Badge>
            {((detailsUser as any).phone || (detailsUser as any).company_name) && (
              <Group gap="xs">
                <Divider orientation="vertical" />
                {(detailsUser as any).company_name && (
                  <Badge variant="outline" color="gray">{(detailsUser as any).company_name}</Badge>
                )}
                {(detailsUser as any).phone && (
                  <Text size="sm" c="dimmed">{(detailsUser as any).phone}</Text>
                )}
              </Group>
            )}
          </Group>
        }
        size="80%"

        centered
        padding="xl"
        styles={{
          header: { borderBottom: "1px solid var(--mantine-color-gray-2)", marginBottom: "xl" },
          content: { borderRadius: "1rem" }
        }}
      >
        <Tabs mih="100vh" defaultValue="shipments" variant="pills" color="red" radius="md" mt="md">
          <Tabs.List mb="xl">
            <Tabs.Tab value="shipments" leftSection={<IconTruck size={16} />}>
              Shipments
            </Tabs.Tab>
            <Tabs.Tab value="quotes" leftSection={<IconFileText size={16} />}>
              Quotes
            </Tabs.Tab>
            <Tabs.Tab value="bol" leftSection={<IconFiles size={16} />}>
              BOL
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="shipments">
            <TabHeader
              title="Shipments"
              actionLabel="Create Shipment"
              onAction={() => {
                const params = new URLSearchParams({
                  customerName: `${detailsUser.first_name} ${detailsUser.last_name || ""}`.trim(),
                  customerEmail: detailsUser.email,
                  customerPhone: (detailsUser as any).phone || "",
                  customerCompany: (detailsUser as any).company_name || "",
                });
                router.push(`/admin/shipments/create?${params.toString()}`);
              }}
            />
            <Table.ScrollContainer minWidth={600}>
              <Table verticalSpacing="sm" highlightOnHover withColumnBorders={false} withTableBorder={false}>
                <Table.Thead>
                  <Table.Tr bg="gray.0">
                    <Table.Th>FTL Warehouse ID</Table.Th>
                    <Table.Th>Route</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Date of Order</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isLoadingShipments ? (
                    <Table.Tr><Table.Td colSpan={4}><Text ta="center" py="xl">Loading...</Text></Table.Td></Table.Tr>
                  ) : shipmentsData?.records.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={4}><Text ta="center" py="xl" c="dimmed">No shipments found for this customer.</Text></Table.Td></Table.Tr>
                  ) : (
                    shipmentsData?.records.map((shipment) => (
                      <Table.Tr key={shipment._id}>
                        <Table.Td>
                          <Text
                            fw={500}
                            variant="link"
                            style={{ cursor: "pointer" }}
                            onClick={() => router.push(`/admin/shipments/${shipment._id}`)}
                          >
                            {shipment.ftlWareHouseId}
                          </Text>
                        </Table.Td>
                        <Table.Td>{shipment.origin_address.city}, {shipment.origin_address.state} → {shipment.destination_address.city}, {shipment.destination_address.state}</Table.Td>
                        <Table.Td><Badge color={shipment.status === "in-transit" ? "blue" : "gray"}>{shipment.status}</Badge></Table.Td>
                        <Table.Td c="dimmed">{dayjs(shipment.dateOfOrder).format("MMM DD, YYYY")}</Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Tabs.Panel>

          <Tabs.Panel value="quotes">
            <TabHeader
              title="Quotes"
              actionLabel="Create Quote"
              onAction={() => {
                const params = new URLSearchParams({
                  fullName: `${detailsUser.first_name} ${detailsUser.last_name || ""}`.trim(),
                  email: detailsUser.email,
                  phone: (detailsUser as any).phone || "",
                  company: (detailsUser as any).company_name || "",
                });
                router.push(`/admin/quotes/create?${params.toString()}`);
              }}
            />
            <Table.ScrollContainer minWidth={600}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr bg="gray.0">
                    <Table.Th>Quote Reference</Table.Th>
                    <Table.Th>Route (Zip)</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Requested On</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isLoadingQuotes ? (
                    <Table.Tr><Table.Td colSpan={4}><Text ta="center" py="xl">Loading...</Text></Table.Td></Table.Tr>
                  ) : quotesData?.records.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={4}><Text ta="center" py="xl" c="dimmed">No quotes found for this customer.</Text></Table.Td></Table.Tr>
                  ) : (
                    quotesData?.records.map((quote) => (
                      <Table.Tr key={quote._id}>
                        <Table.Td>
                          <Text
                            fw={500}
                            variant="link"
                            style={{ cursor: "pointer" }}
                            onClick={() => router.push(`/admin/quotes?search=${quote.tracking_id}`)}
                          >
                            {quote.tracking_id}
                          </Text>
                        </Table.Td>
                        <Table.Td>{quote.origin_zip_code} → {quote.destination_zip_code}</Table.Td>
                        <Table.Td><Badge variant="light">{quote.status}</Badge></Table.Td>
                        <Table.Td c="dimmed">{dayjs(quote.createdAt).format("MMM DD, YYYY")}</Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Tabs.Panel>

          <Tabs.Panel value="bol">
            <Group justify="space-between" mb="lg" mt="md">
              <Group gap="sm">
                <Title order={3} c="gray.8" fw={600}>BOL</Title>
              </Group>
            </Group>
            <Dropzone
              onDrop={(files) => handleFileUpload(files, DocumentCategory.BOL)}
              accept={[...PDF_MIME_TYPE, ...IMAGE_MIME_TYPE]}
              maxSize={30 * 1024 * 1024}
              loading={uploadFileMutation.isPending || createDocumentMutation.isPending}
              mb="xl"
              styles={{
                root: {
                  borderColor: "var(--mantine-color-blue-4)",
                  borderStyle: "dashed",
                  background: "var(--mantine-color-blue-0)",
                  padding: "2rem",
                  borderRadius: "0.5rem"
                }
              }}
            >
              <Group justify="center" gap="xs">
                <IconUpload size={20} />
                <Text size="sm">Drag BOL or documents here to upload for this customer</Text>
              </Group>
            </Dropzone>
            <Table.ScrollContainer minWidth={600}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr bg="gray.0">
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Internal ID</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th px="xl">Action</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isLoadingBOL ? (
                    <Table.Tr><Table.Td colSpan={4}><Text ta="center" py="xl">Loading...</Text></Table.Td></Table.Tr>
                  ) : bolData?.records.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={4}><Text ta="center" py="xl" c="dimmed">No documents linked.</Text></Table.Td></Table.Tr>
                  ) : (
                    bolData?.records.map((doc) => (
                      <Table.Tr key={doc._id}>
                        <Table.Td>{doc.name}</Table.Td>
                        <Table.Td c="dimmed">{doc.internal_id}</Table.Td>
                        <Table.Td>{dayjs(doc.createdAt).format("MMM DD, YYYY")}</Table.Td>
                        <Table.Td px="xl">
                          <Button variant="subtle" size="xs" component="a" href={doc.url} target="_blank">View</Button>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Tabs.Panel>
        </Tabs>
      </Modal>
    );
  };

  return (
    <Box>
      <Title order={1} c="gray.8" mb="xl">
        Customer Management
      </Title>

      <Group mb="xl" justify="space-between">
        <TextInput
          placeholder="Search customers..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ width: 300 }}
        />
        <Button
          leftSection={<IconUserPlus size={18} />}
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            background: "linear-gradient(135deg, #ff6b35 0%, #E94646 100%)",
          }}
        >
          Create Customer
        </Button>
      </Group>

      <Card shadow="sm" padding="lg" withBorder>
        <Table.ScrollContainer minWidth={800}>
          <Table verticalSpacing="md" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: "center" }}>
                    Loading...
                  </Table.Td>
                </Table.Tr>
              ) : users.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: "center" }}>
                    No customers found
                  </Table.Td>
                </Table.Tr>
              ) : (
                users.map((user) => (
                  <Table.Tr key={user._id}>
                    <Table.Td>
                      <Text 
                        fw={500}
                        variant="link"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedCustomer(user);
                          router.push("/admin/dashboard");
                        }}
                      >
                        {user.first_name} {user.last_name}
                      </Text>
                    </Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="dot">
                            {role}
                          </Badge>
                        ))}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <UserStatusBadge isActive={user.is_active} />
                    </Table.Td>
                    <Table.Td>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <MenuTarget>
                          <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </MenuTarget>
                        <MenuDropdown>
                          <MenuItem
                            leftSection={<IconEye size={14} />}
                            onClick={() => handleViewDetails(user)}
                          >
                            View Details / Hub
                          </MenuItem>
                          <MenuItem
                            leftSection={<IconEdit size={14} />}
                            onClick={() => handleEditUser(user)}
                          >
                            Edit Details
                          </MenuItem>
                          <MenuItem
                            leftSection={<IconKey size={14} />}
                            onClick={() => handleChangePassword(user)}
                          >
                            Reset Password
                          </MenuItem>
                          <Menu.Divider />
                          <MenuItem
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleDeleteUser(user)}
                          >
                            Delete Customer
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
        {usersData?.pagination && (
          <Group justify="flex-end" mt="md">
            <Pagination
              total={usersData.pagination.totalPages}
              value={currentPage}
              onChange={setCurrentPage}
            />
          </Group>
        )}
      </Card>

      <CreateCustomerModal />
      <EditUserModal />
      <ChangePasswordModal />
      <CustomerDetailsModal />
    </Box>
  );
}
