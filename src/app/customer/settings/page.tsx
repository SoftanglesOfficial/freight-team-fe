"use client";

import {
  Title,
  Paper,
  Switch,
  Stack,
  Button,
  Group,
  Text,
} from "@mantine/core";
import PasswordUpdateForm from "@/components/PasswordUpdateForm";

export default function CustomerSettingsPage() {
  return (
    <Stack gap="xl">
      <Title order={1} c="#293674" fw={700}>Settings</Title>

      <Paper withBorder radius="md" p="xl" style={{ maxWidth: 600 }}>
        <Stack gap="lg">
          <Text fw={600} size="lg">Notification Preferences</Text>
          <Switch
            label="Email Notifications"
            description="Receive updates about your shipments via email"
            defaultChecked
          />
          <Switch
            label="SMS Notifications"
            description="Get real-time tracking alerts on your phone"
          />

          <Group justify="flex-end" mt="md">
            <Button variant="filled" color="#EA4745">Save Changes</Button>
          </Group>
        </Stack>
      </Paper>

      <PasswordUpdateForm />
    </Stack>
  );
}

