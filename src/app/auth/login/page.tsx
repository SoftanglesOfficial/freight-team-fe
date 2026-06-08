"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Button,
  Card,
  Checkbox,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import * as yup from "yup";
import { yupResolver } from "mantine-form-yup-resolver";
import { useLoginMutation } from "@/hooks/auth.hooks";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  rememberMe: yup.boolean(),
});

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending } = useLoginMutation();

  const form = useForm({
    initialValues: { email: "", password: "", rememberMe: false },
    validate: yupResolver(schema),
  });

  const handleSubmit = form.onSubmit((values) => {
    login(values);
  });

  return (
    <Card
      shadow="xl"
      padding="xl"
      radius="lg"
      withBorder
      style={{ width: "100%", maxWidth: 440 }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Stack gap="sm">
        <div>
          <Title order={2} fw={700} mt="xs">
            Sign in
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Enter your credentials to access your account
          </Text>
        </div>

        <Stack gap="md" mt="sm">
          <TextInput
            label="Email"
            placeholder="name@company.com"
            type="email"
            {...form.getInputProps("email")}
          />
          <PasswordInput
            label="Password"
            placeholder="******************"
            aria-label="Password"
            {...form.getInputProps("password")}
          />

          <Group justify="space-between" align="center">
            <Checkbox
              label="Remember me for 30 days"
              radius="sm"
              {...form.getInputProps("rememberMe", { type: "checkbox" })}
            />
            <Anchor component={Link} href="/auth/forgot-password" c="navy">
              Forgot password?
            </Anchor>
          </Group>

          <Button
            type="submit"
            variant="gradient"
            gradient={{ from: "#EA4745", to: "#FF9200" }}
            radius="md"
            fullWidth
            loading={isPending}
          >
            Sign In
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
