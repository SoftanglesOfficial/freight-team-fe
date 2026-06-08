import {
  Button,
  Card,
  Container,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconMail, IconPackage, IconPhone } from "@tabler/icons-react";
import Image from "next/image";

export default function ContactPage() {
  return (
    <div>
      <div className="relative w-full h-[200px] md:h-[300px]">
        <Image src="/truck.png" alt="About Us" fill objectFit="cover" />
      </div>
      <Container size="xl" my="xl">
        <SimpleGrid cols={{ base: 1, md: 3 }}>
          <Card shadow="sm" withBorder radius="lg">
            <Stack>
              <Group>
                <ThemeIcon
                  size="xl"
                  variant="gradient"
                  gradient={{ from: "#EA4745", to: "#FF9200" }}
                >
                  <IconPackage />
                </ThemeIcon>

                <Title order={4} fw={600}>
                  Business Hours
                </Title>
              </Group>
              <Text>
                8am to 4PM Pacific Standard Time, Mon-Friday except holidays.
              </Text>
            </Stack>
          </Card>
          <Card shadow="sm" withBorder radius="lg">
            <Stack>
              <Group>
                <ThemeIcon
                  size="xl"
                  variant="gradient"
                  gradient={{ from: "#EA4745", to: "#FF9200" }}
                >
                  <IconPhone />
                </ThemeIcon>

                <Title order={4} fw={600}>
                  Phone
                </Title>
              </Group>
              <Text>626-765-6175</Text>
            </Stack>
          </Card>
          <Card shadow="sm" withBorder radius="lg">
            <Stack>
              <Group>
                <ThemeIcon
                  size="xl"
                  variant="gradient"
                  gradient={{ from: "#EA4745", to: "#FF9200" }}
                >
                  <IconMail />
                </ThemeIcon>

                <Title order={4} fw={600}>
                  Email
                </Title>
              </Group>
              <Text>sales@ftlwarehouse.com</Text>
            </Stack>
          </Card>
        </SimpleGrid>
      </Container>

      <Container size="sm" my="100px">
        <Stack gap="xl">
          <Title ta="center" order={2}>
            Send us a message
          </Title>

          <Stack>
            <TextInput label="Your Name" placeholder="John Doe" />
            <TextInput label="Your Email" placeholder="john.doe@example.com" />
            <TextInput label="Your Phone #" placeholder="123-456-7890" />
            <Select
              label="Subject"
              data={["General Inquiry", "Shipping", "Other"]}
              placeholder="General Inquiry"
            />
            <Textarea
              label="Your Message"
              rows={5}
              placeholder="Your message here..."
            />
            <Button
              variant="gradient"
              gradient={{ from: "#EA4745", to: "#FF9200" }}
            >
              Send Message
            </Button>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
