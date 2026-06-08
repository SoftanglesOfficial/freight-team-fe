"use client";

import React, { useState } from "react";
import { Autocomplete, Loader, Group, Text, Stack } from "@mantine/core";
import { useGetUsersQuery } from "@/hooks/users.hooks";
import { Role, User } from "@/hooks/Api";
import { useDebouncedValue } from "@mantine/hooks";

interface CustomerSearchSelectProps {
  label?: string;
  placeholder?: string;
  onSelect: (user: User | null) => void;
  error?: string;
  styles?: any;
}

export default function CustomerSearchSelect({
  label,
  placeholder = "Search by name or email...",
  onSelect,
  error,
  styles,
}: CustomerSearchSelectProps) {
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchValue, 300);

  const { data, isLoading } = useGetUsersQuery({
    page: 1,
    pageSize: 20,
    search: debouncedSearch,
    role: Role.StandardUser,
    is_active: true,
  });

  const users = data?.records || [];

  const handleOptionSubmit = (value: string) => {
    const selectedUser = users.find(
      (u) => `${u.first_name} ${u.last_name || ""} (${u.email})`.trim() === value
    );
    if (selectedUser) {
      onSelect(selectedUser);
    } else {
      onSelect(null);
    }
  };

  return (
    <Autocomplete
      label={label}
      placeholder={placeholder}
      data={users.map((u) => ({
        value: `${u.first_name} ${u.last_name || ""} (${u.email})`.trim(),
        label: `${u.first_name} ${u.last_name || ""} (${u.email})`,
      }))}
      value={searchValue}
      onChange={setSearchValue}
      onOptionSubmit={handleOptionSubmit}
      rightSection={isLoading ? <Loader size="xs" /> : null}
      error={error}
      maxDropdownHeight={300}
      styles={styles}
    />
  );
}
