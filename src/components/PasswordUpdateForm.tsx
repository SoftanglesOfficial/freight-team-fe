"use client";

import React, { useState } from "react";
import { PasswordInput, Button, Stack, Paper, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useUpdatePasswordMutation } from "@/hooks/auth.hooks";

export default function PasswordUpdateForm() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const updatePasswordMutation = useUpdatePasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            notifications.show({
                title: "Error",
                message: "New passwords do not match",
                color: "red",
            });
            return;
        }

        if (newPassword.length < 6) {
            notifications.show({
                title: "Error",
                message: "Password must be at least 6 characters",
                color: "red",
            });
            return;
        }

        updatePasswordMutation.mutate(
            {
                old_password: oldPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            },
            {
                onSuccess: () => {
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                },
            }
        );
    };

    return (
        <Paper withBorder radius="md" p="xl" style={{ maxWidth: 600 }}>
            <Stack gap="lg">
                <Title order={3} c="#293674">Update Password</Title>
                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <PasswordInput
                            label="Current Password"
                            placeholder="Enter current password"
                            value={oldPassword}
                            onChange={(event) => setOldPassword(event.currentTarget.value)}
                            required
                        />
                        <PasswordInput
                            label="New Password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.currentTarget.value)}
                            required
                        />
                        <PasswordInput
                            label="Confirm New Password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                            required
                        />
                        <Button type="submit" loading={updatePasswordMutation.isPending} color="#EA4745">
                            Update Password
                        </Button>
                    </Stack>
                </form>
            </Stack>
        </Paper>
    );
}
