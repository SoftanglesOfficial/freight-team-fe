"use client";

import React, { useMemo } from "react";
import { AppShell, Group, Burger, Title, Button, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();

  const { targetPath, ctaLabel } = useMemo(() => {
    if (!isAuthenticated) {
      return { targetPath: "/auth/login", ctaLabel: "Login" };
    } else {
      const path = isAdmin ? "/admin/dashboard" : "/customer/dashboard";
      return { targetPath: path, ctaLabel: "Dashboard" };
    }
  }, [isAuthenticated, isAdmin]);

  const handleCtaClick = () => {
    router.push(targetPath);
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { desktop: true, mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header className="bg-white border-b border-gray-200">
        <Group h="100%" px="md" className="max-w-7xl mx-auto w-full">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Group justify="space-between" style={{ flex: 1 }}>
            <Group gap="sm">
              <div>
                <img src="/logo.png" alt="Logo" width={70} />
              </div>
            </Group>
            <Group ml="xl" visibleFrom="sm" gap="lg">
              <Link
                className="text-gray-700 text-sm hover:text-gray-900 transition"
                href="/"
              >
                Home
              </Link>
              <Link
                className="text-gray-700 text-sm hover:text-gray-900 transition"
                href="/track-shipment"
              >
                Track Shipment
              </Link>
              <Link
                className="text-gray-700 text-sm hover:text-gray-900 transition"
                href="/request-quote"
              >
                Request quote
              </Link>
              <Link
                className="text-gray-700 text-sm hover:text-gray-900 transition"
                href="/about"
              >
                About
              </Link>
              <Link
                className="text-gray-700 text-sm hover:text-gray-900 transition"
                href="/contact"
              >
                Contact
              </Link>
              <Link
                className="text-gray-700 text-sm hover:text-gray-900 transition"
                href="/faqs"
              >
                FAQs
              </Link>
              <Button
                variant="gradient"
                gradient={{ from: "#EA4745", to: "#FF9200" }}
                radius="md"
                onClick={handleCtaClick}
              >
                {ctaLabel}
              </Button>
            </Group>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar py="md" px={4}>
        <NavLink component={Link} href="/" label="Home" onClick={toggle} />
        <NavLink
          component={Link}
          href="/track-shipment"
          label="Track Shipment"
          onClick={toggle}
        />
        <NavLink component={Link} href="/request-quote" label="Request Quote" onClick={toggle} />
        <NavLink component={Link} href="/about" label="About" onClick={toggle} />
        <NavLink component={Link} href="/contact" label="Contact" onClick={toggle} />
        <NavLink component={Link} href="/faqs" label="FAQs" onClick={toggle} />
        <NavLink
          component="button"
          onClick={() => { handleCtaClick(); toggle(); }}
          label={ctaLabel}
          style={{ textAlign: "left" }}
        />
      </AppShell.Navbar>

      <AppShell.Main p="0" pt="60px">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
