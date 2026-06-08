"use client";

import React, { useState } from "react";
import {
  MantineProvider,
  createTheme,
  type MantineThemeOverride,
} from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { AxiosError } from "axios";
import { LiveChatWidget } from "@/components/LiveChatWidget";

const theme: MantineThemeOverride = createTheme({
  defaultRadius: "lg",
  colors: {
    navy: [
      "#293674",
      "#293674",
      "#293674",
      "#293674",
      "#293674",
      "#293674",
      "#293674",
      "#293674",
      "#293674",
      "#293674",
    ],
  },
  components: {
    Title: { defaultProps: { c: "navy" } },
    Anchor: { defaultProps: { c: "black" } },
    Select: { defaultProps: { size: "md" } },
    TextInput: { defaultProps: { size: "md" } },
    Button: { defaultProps: { size: "md" } },
    Text: { defaultProps: { c: "navy" } },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (
                (error instanceof AxiosError &&
                  error?.response?.status === 401) ||
                (error instanceof AxiosError && error?.response?.status === 403)
              ) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MantineProvider theme={theme}>
          <DatesProvider settings={{ firstDayOfWeek: 0 }}>
            <ModalsProvider>
              <Notifications
                withinPortal
                style={{ position: "fixed", top: 24, right: 24, zIndex: 1000 }}
              />
              {children}
              <LiveChatWidget />
            </ModalsProvider>
          </DatesProvider>
        </MantineProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
