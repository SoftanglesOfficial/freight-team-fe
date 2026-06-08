"use client";

import React from "react";
import { Button } from "@mantine/core";
import { useLogout } from "@/hooks/auth.hooks";

type Props = {
  label?: string;
};

export function LogoutButton({ label = "Logout" }: Props) {
  const logout = useLogout();

  return (
    <Button
      variant="light"
      color="red"
      radius="sm"
      size="sm"
      fullWidth
      onClick={logout}
    >
      {label}
    </Button>
  );
}
