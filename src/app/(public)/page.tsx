import {
  Button,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative">
      <section className="bg-gradient-to-r from-[#0E336C] to-[#02947F] text-white py-20 md:py-32 relative overflow-hidden">
        <Container size="xl">
          <SimpleGrid
            cols={{ base: 1, md: 2 }}
            spacing="xl"
            className="items-center"
          >
            <Stack gap="md" className="z-10">
              <Stack gap={0}>
                <Title
                  c="white"
                  order={1}
                  fz={{ base: 36, md: 48 }}
                  fw={700}
                  lh={1.2}
                >
                  FTL Warehouse, Inc.
                </Title>
                <Title
                  c="white"
                  order={2}
                  fz={{ base: 36, md: 48 }}
                  fw={700}
                  lh={1.2}
                >
                  Freight Team Logistics
                </Title>
              </Stack>
              <Text c="white" size="lg" className="max-w-lg" fw={500}>
                Real logistics. Real people. <br />
                Technology where it helps. People where it matters.
              </Text>

              <Group gap="md" mt="md">
                <Link href="/track-shipment">
                  <Button
                    radius="lg"
                    size="lg"
                    variant="gradient"
                    gradient={{ from: "#EA4745", to: "#FF9200" }}
                    rightSection={<span>→</span>}
                  >
                    Where&apos;s my freight
                  </Button></Link>
                <Link href="/request-quote">
                  <Button
                    variant="filled"
                    bg="#398391"
                    radius="lg"
                    size="lg"
                    className="text-white"
                  >
                    Request Quote
                  </Button>
                </Link>
              </Group>
            </Stack>
            <div className="relative z-10">
              <div className="relative w-full h-[400px] md:h-[500px]">
                <Image
                  src="/truck.png"
                  alt="Truck on highway"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </SimpleGrid>
        </Container>
      </section>

      <section className="bg-white py-16 md:py-24">
        <Container size="lg">
          <Stack align="center" gap="lg">
            <Title
              order={2}
              fz={{ base: 32, md: 42 }}
              fw={700}
              c="dark"
              ta="center"
            >
              Ready to ship smarter?
            </Title>
            <Text size="lg" c="dark" ta="center" className="max-w-2xl">
              From quote to delivery, we manage every detail. Carrier selection,
              scheduling, BOL creation, tracking, and PODs are all handled by
              our experienced team. <br />
              Clear communication. Accurate billing. No surprises.
            </Text>
            <Group gap="md" mt="md">
              <Link href="/track-shipment">
                <Button radius="lg" size="lg" c="white" bg="red.6">
                  Track Shipment
                </Button></Link>
              <Link href="/request-quote">
                <Button radius="lg" size="lg" c="black" bg="gray.2">
                  Get Your Quote
                </Button></Link>
            </Group>
          </Stack>
        </Container>
      </section>
    </div>
  );
}
