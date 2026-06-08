"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Button,
  Card,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import * as yup from "yup";
import { yupResolver } from "mantine-form-yup-resolver";
import { useForgotPasswordMutation } from "@/hooks/auth.hooks";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();

  const form = useForm({
    initialValues: { email: "" },
    validate: yupResolver(schema),
  });

  const handleSubmit = form.onSubmit((values) => {
    forgotPassword(
      { email: values.email, intent: "reset-password", type: "Otp" },
      {
        onSuccess: () => {
          sessionStorage.setItem("resetEmail", values.email);
          router.push("/auth/verify-otp");
        },
      }
    );
  });

  return (
    <Card
      shadow="xl"
      padding="xl"
      radius="lg"
      withBorder
      style={{ width: "100%", maxWidth: 420 }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Stack gap="sm">
        <div>
          <Title order={2} fw={700} mt="xs">
            Forgot password?
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            We&apos;ll send a one-time code to reset your password
          </Text>
        </div>

        <Stack gap="md" mt="sm">
          <TextInput
            label="Email"
            placeholder="name@company.com"
            type="email"
            {...form.getInputProps("email")}
          />

          <Button
            type="submit"
            variant="gradient"
            gradient={{ from: "#EA4745", to: "#FF9200" }}
            radius="md"
            fullWidth
            loading={isPending}
          >
            Send verification code
          </Button>
        </Stack>

        <Text ta="center" size="sm" mt="md">
          Remembered it?{" "}
          <Anchor component={Link} href="/auth/login" c="navy">
            Back to login
          </Anchor>
        </Text>
      </Stack>
    </Card>
  );
}
