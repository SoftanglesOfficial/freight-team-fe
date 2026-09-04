"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Combobox,
  Group,
  Loader,
  Text,
  TextInput,
  useCombobox,
} from "@mantine/core";
import { IconSearch, IconTruck, IconFileText, IconUser } from "@tabler/icons-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useGetShipmentsQuery } from "@/hooks/shipments.hooks";
import { useGetQuoteRequestsQuery } from "@/hooks/quote-request.hooks";
import { useGetUsersQuery } from "@/hooks/users.hooks";
import { Role, User } from "@/hooks/Api";

interface GlobalSearchBoxProps {
  onSelectCustomer: (user: User) => void;
  placeholder?: string;
  styles?: Record<string, unknown>;
}

/**
 * Sidebar-wide search: finds shipments, quotes, and customers in one box.
 * Picking a shipment/quote jumps straight to it; picking a customer applies
 * the existing "Global Focus" customer filter across the admin dashboard.
 */
export default function GlobalSearchBox({
  onSelectCustomer,
  placeholder = "Search shipments, quotes, customers...",
  styles,
}: GlobalSearchBoxProps) {
  const router = useRouter();
  const combobox = useCombobox();
  const [value, setValue] = useState("");
  const [debounced] = useDebouncedValue(value, 300);
  const enabled = debounced.trim().length >= 2;

  const { data: shipmentsData, isFetching: shipmentsLoading } = useGetShipmentsQuery({
    page: 1,
    pageSize: 5,
    search: enabled ? debounced : undefined,
  });
  const { data: quotesData, isFetching: quotesLoading } = useGetQuoteRequestsQuery({
    page: 1,
    pageSize: 5,
    search: enabled ? debounced : undefined,
  });
  const { data: customersData, isFetching: customersLoading } = useGetUsersQuery({
    page: 1,
    pageSize: 5,
    search: enabled ? debounced : "",
    role: Role.StandardUser,
  });

  const shipments = enabled ? shipmentsData?.records || [] : [];
  const quotes = enabled ? quotesData?.records || [] : [];
  const customers = enabled ? customersData?.records || [] : [];
  const isLoading = enabled && (shipmentsLoading || quotesLoading || customersLoading);
  const hasResults = shipments.length + quotes.length + customers.length > 0;

  const handleSelect = (optionValue: string) => {
    const [type, id] = optionValue.split(":");
    if (type === "shipment") {
      router.push(`/admin/shipments/${id}`);
    } else if (type === "quote") {
      router.push(`/admin/quotes?open=${id}`);
    } else if (type === "customer") {
      const customer = customers.find((c) => c._id === id);
      if (customer) onSelectCustomer(customer);
    }
    setValue("");
    combobox.closeDropdown();
  };

  return (
    <Combobox store={combobox} onOptionSubmit={handleSelect} withinPortal>
      <Combobox.Target>
        <TextInput
          placeholder={placeholder}
          leftSection={<IconSearch size={14} />}
          rightSection={isLoading ? <Loader size="xs" /> : null}
          value={value}
          onChange={(e) => {
            setValue(e.currentTarget.value);
            combobox.openDropdown();
          }}
          onFocus={() => combobox.openDropdown()}
          styles={styles}
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={340} style={{ overflowY: "auto" }}>
          {!enabled ? (
            <Combobox.Empty>Type at least 2 characters...</Combobox.Empty>
          ) : !hasResults && !isLoading ? (
            <Combobox.Empty>No matches found</Combobox.Empty>
          ) : (
            <>
              {shipments.length > 0 && (
                <Combobox.Group label="Shipments">
                  {shipments.map((s) => (
                    <Combobox.Option value={`shipment:${s._id}`} key={s._id}>
                      <Group gap="xs" wrap="nowrap">
                        <IconTruck size={14} />
                        <div>
                          <Text size="sm">{s.ftlWareHouseId || s.proNumber || "Untitled"}</Text>
                          <Text size="xs" c="dimmed">
                            {s.origin_address?.city} → {s.destination_address?.city}
                          </Text>
                        </div>
                      </Group>
                    </Combobox.Option>
                  ))}
                </Combobox.Group>
              )}

              {quotes.length > 0 && (
                <Combobox.Group label="Quotes">
                  {quotes.map((q) => (
                    <Combobox.Option value={`quote:${q._id}`} key={q._id}>
                      <Group gap="xs" wrap="nowrap">
                        <IconFileText size={14} />
                        <div>
                          <Text size="sm">{q.tracking_id}</Text>
                          <Text size="xs" c="dimmed">
                            {q.full_name} {q.company_name ? `— ${q.company_name}` : ""}
                          </Text>
                        </div>
                      </Group>
                    </Combobox.Option>
                  ))}
                </Combobox.Group>
              )}

              {customers.length > 0 && (
                <Combobox.Group label="Customers">
                  {customers.map((c) => (
                    <Combobox.Option value={`customer:${c._id}`} key={c._id}>
                      <Group gap="xs" wrap="nowrap">
                        <IconUser size={14} />
                        <div>
                          <Text size="sm">
                            {c.first_name} {c.last_name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {c.email}
                          </Text>
                        </div>
                      </Group>
                    </Combobox.Option>
                  ))}
                </Combobox.Group>
              )}
            </>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
