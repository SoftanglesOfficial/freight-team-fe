"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Button,
  Card,
  Group,
  Stack,
  Text,
  Title,
  PinInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import * as yup from "yup";
import { yupResolver } from "mantine-form-yup-resolver";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
} from "@/hooks/auth.hooks";

const schema = yup.object().shape({
  otp: yup
    .string()
    .required("OTP is required")
    .length(6, "OTP must be 6 digits"),
});

export default function VerifyOtpPage() {
  const router = useRouter();
  const verifyOtpMutation = useVerifyOtpMutation();
  const { mutate: resendOtp, isPending: isResending } =
    useForgotPasswordMutation();
  const [email, setEmail] = useState<string | null>(null);

  const form = useForm({
    initialValues: { otp: "" },
    validate: yupResolver(schema),
  });

  useEffect(() => {
    const storedEmail =
      typeof window !== "undefined"
        ? sessionStorage.getItem("resetEmail")
        : null;

    if (!storedEmail) {
      router.replace("/auth/forgot-password");
      return;
    }

    setEmail(storedEmail);
  }, [router]);

  const handleSubmit = form.onSubmit((values) => {
    if (!email) return;
    verifyOtpMutation.mutate(
      { email, secret: values.otp, intent: "reset-password" },
      {
        onSuccess: () => {
          sessionStorage.setItem("resetOtp", values.otp);
          router.push("/auth/reset-password");
        },
      }
    );
  });

  const handleResend = () => {
    if (!email) return;
    resendOtp({ email, intent: "reset-password", type: "Otp" });
  };

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
          <Text size="sm" c="dimmed">
            We&apos;ve sent a 6 digit code to your email.
          </Text>
          <Title order={2} fw={700} mt="xs">
            Verify email
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Enter the code to continue resetting your password.
          </Text>
        </div>

        <Stack gap="md" mt="sm" align="center">
          <Group justify="center">
            <PinInput
              length={6}
              type="number"
              size="md"
              aria-label="otp"
              {...form.getInputProps("otp")}
            />
          </Group>
          {form.errors.otp && (
            <Text c="red" size="sm">
              {form.errors.otp}
            </Text>
          )}

          <Button
            type="submit"
            variant="gradient"
            gradient={{ from: "#EA4745", to: "#FF9200" }}
            radius="md"
            fullWidth
            loading={verifyOtpMutation.isPending}
          >
            Verify code
          </Button>

          <Text ta="center" size="sm">
            Didn&apos;t get the code?{" "}
            <Anchor component="button" onClick={handleResend} fw={600}>
              {isResending ? "Resending..." : "Resend"}
            </Anchor>
          </Text>
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
