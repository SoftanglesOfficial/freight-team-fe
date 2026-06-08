"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Anchor,
  Button,
  Card,
  PasswordInput,
  Stack,
  Text,
  Title,
  ThemeIcon,
  rem,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import * as yup from "yup";
import { yupResolver } from "mantine-form-yup-resolver";
import { useResetPasswordMutation } from "@/hooks/auth.hooks";

const schema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

function PasswordRequirement({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) {
  return (
    <Text
      c={meets ? "teal" : "dimmed"}
      size="sm"
      style={{ display: "flex", alignItems: "center" }}
      mt={7}
    >
      <ThemeIcon
        variant="light"
        color={meets ? "teal" : "gray"}
        size="xs"
        mr={5}
      >
        {meets ? (
          <IconCheck style={{ width: rem(14), height: rem(14) }} />
        ) : (
          <IconX style={{ width: rem(14), height: rem(14) }} />
        )}
      </ThemeIcon>
      {label}
    </Text>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { mutate: resetPassword, isPending } = useResetPasswordMutation();
  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState<string | null>(null);

  const form = useForm({
    initialValues: { password: "", confirmPassword: "" },
    validate: yupResolver(schema),
  });

  useEffect(() => {
    const storedEmail =
      typeof window !== "undefined"
        ? sessionStorage.getItem("resetEmail")
        : null;
    const storedOtp =
      typeof window !== "undefined" ? sessionStorage.getItem("resetOtp") : null;

    if (!storedEmail || !storedOtp) {
      router.replace("/auth/forgot-password");
      return;
    }

    setEmail(storedEmail);
    setOtp(storedOtp);
  }, [router]);

  const handleSubmit = form.onSubmit((values) => {
    if (!email || !otp) return;
    resetPassword(
      {
        email,
        password: values.password,
        confirm_password: values.confirmPassword,
        secret: otp,
      },
      {
        onSuccess: () => {
          sessionStorage.removeItem("resetEmail");
          sessionStorage.removeItem("resetOtp");
          router.push("/auth/login");
        },
      }
    );
  });

  const { password } = form.values;
  const requirements = [
    { re: /[0-9]/, label: "Includes number" },
    { re: /[a-z]/, label: "Includes lowercase letter" },
    { re: /[A-Z]/, label: "Includes uppercase letter" },
    { re: /.{8,}/, label: "At least 8 characters" },
  ];

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(password)}
    />
  ));

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
            Choose a strong password to secure your account
          </Text>
          <Title order={2} fw={700} mt="xs">
            Set new password
          </Title>
          <Text c="dimmed" size="sm" mt={4}>
            Your new password must be different from previous passwords.
          </Text>
        </div>

        <Stack gap="md" mt="sm">
          <Stack gap={0}>
            <PasswordInput
              label="Password"
              placeholder="******************"
              {...form.getInputProps("password")}
            />
            {password.length > 0 && <div>{checks}</div>}
          </Stack>

          <PasswordInput
            label="Confirm Password"
            placeholder="******************"
            {...form.getInputProps("confirmPassword")}
          />

          <Button
            type="submit"
            variant="gradient"
            gradient={{ from: "#EA4745", to: "#FF9200" }}
            radius="md"
            fullWidth
            loading={isPending}
          >
            Reset Password
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
