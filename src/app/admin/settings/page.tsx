import { Title, Stack, Paper, TextInput, Button, Group } from "@mantine/core";
import PasswordUpdateForm from "@/components/PasswordUpdateForm";

export default function AdminSettingsPage() {
  return (
    <Stack gap="xl">
      <Title order={1} c="#293674" fw={700}>Admin Settings</Title>

      <Paper withBorder radius="md" p="xl" style={{ maxWidth: 600 }}>
        <Stack gap="lg">
          <Title order={3} c="#293674">Global Settings</Title>
          <TextInput label="Site Name" placeholder="Freight Team" />
          <Group justify="flex-end">
            <Button color="#EA4745">Save Global Settings</Button>
          </Group>
        </Stack>
      </Paper>

      <PasswordUpdateForm />
    </Stack>
  );
}

