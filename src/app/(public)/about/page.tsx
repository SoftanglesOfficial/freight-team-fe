import { Button, Container, Group, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AboutPage() {
  return (
    <div>
      <div className="relative w-full h-[200px] md:h-[300px]">
        <Image src="/truck.png" alt="About Us" fill objectFit="cover" />
      </div>

      <Container mt="xl">
        <Stack gap="lg">
          <Title order={2}>About Us</Title>
          <Text fw={500} size="lg">
            We&apos;re a family-owned business that treats your freight like it&apos;s our
            own.
          </Text>
          <Text>
            FTL Warehouse was built by a husband-and-wife team and is run today
            by a tight-knit group of long-time employees, friends, and trusted
            colleagues. We are not a revolving-door operation. We are a freight
            family that has grown together over time, and that consistency shows
            up in how we handle your shipments.
          </Text>
          <Text>
            We operate with the efficiency of a large logistics company, while
            delivering the attention, care, and accountability of a boutique
            partner.
          </Text>
          <Text>
            We combine highly competitive market rates with long-standing
            carrier relationships to keep your shipping costs low. At the same
            time, we treat every shipment as if it is the most important freight
            on the trailer, because to you, it is.
          </Text>
          <Text>
            While others lean heavily on automation, we rely on something
            stronger: real people who pay attention. We make the calls, confirm
            the details, and handle issues before they become problems. No vague
            updates. No guessing. If something is off, we are already fixing it.
          </Text>
          <Text>
            This website gives you visibility into the technology behind our
            operation, but the backbone of our business is still human. Real
            tracking. Real communication. Real accountability.
          </Text>
          <Text>
            With years of experience and deep industry relationships, we tailor
            each shipment to your exact needs. Whether you are shipping a single
            pallet or managing a national program, we handle the details so you
            can stay focused on growing your business.
          </Text>
          <Text>
            We regularly ship into major retailers like CVS, Target, The Home
            Depot, and Costco, and we understand the precision those deliveries
            require.
          </Text>
          <Text>
            Most of our customers have been with us for over 14 years. That kind
            of loyalty does not happen by accident. It comes from honest
            communication, predictable billing, and standing up for our
            customers when it counts. If a charge is not right, we push back. If
            there is a problem, we own it.
          </Text>
          <Text>
            We do not just move freight. We learn your business, anticipate
            challenges, and clear the path ahead.
          </Text>
          <Text fw={700} size="lg">
            That is the difference.
          </Text>
        </Stack>
      </Container>

      <div className="mt-16 bg-gradient-to-r from-[#0E336C] to-[#02947F] text-white py-16 relative overflow-hidden">
        <Stack gap="md">
          <Title order={3} fz={32} c="white" fw={600} ta="center">
            Real logistics. Real people.
          </Title>

          <Text c="white" ta="center" fz="lg" fw={500}>
            Technology where it helps. People where it matters.
          </Text>
          <Group justify="center" mt="md">
            <Link href="/request-quote">
              <Button
                radius="lg"
                size="lg"
                variant="gradient"
                gradient={{ from: "#EA4745", to: "#FF9200" }}
              >
                Get Started
              </Button>
            </Link>
          </Group>
        </Stack>
      </div>
    </div>
  );
}
