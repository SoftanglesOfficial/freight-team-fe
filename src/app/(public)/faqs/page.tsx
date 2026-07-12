import { Container, Stack, Text, Title } from "@mantine/core";
import Image from "next/image";

export default function FaqsPage() {
  return (
    <div>
      <div className="relative w-full h-[200px] md:h-[300px]">
        <Image src="/truck.png" alt="About Us" fill objectFit="cover" />
      </div>
      <Container>
        <Stack gap="xl">
          <Title my="62px">Frequently Asked Questions</Title>

          <Stack gap="xl">
            <Stack gap="xs">
              <Title order={4}>How often are shipment statuses updated?</Title>
              <Text>
                We update shipment statuses daily. Our goal is to keep your
                tracking page accurate, simple, and easy to follow without you
                having to chase anyone down.
              </Text>
            </Stack>

            <Stack gap="xs">
              <Title order={4}>What if I&apos;m having trouble logging in?</Title>
              <Text>
                Email{" "}
                <a
                  href="mailto:sales@ftlwarehouse.com"
                  className="text-[#0E336C] hover:underline fw-500"
                >
                  sales@ftlwarehouse.com
                </a>{" "}
                and we&apos;ll help you get back in. Please include your company
                name and the email address you use to log in so we can find your
                account quickly.
              </Text>
            </Stack>

            <Stack gap="xs">
              <Title order={4}>What should I do if my shipment is delayed?</Title>
              <Text>
                Email{" "}
                <a
                  href="mailto:sales@ftlwarehouse.com"
                  className="text-[#0E336C] hover:underline fw-500"
                >
                  sales@ftlwarehouse.com
                </a>{" "}
                with your shipment number, PRO number, or company name. Freight
                delays happen for real-world reasons: missed appointments,
                weather, driver delays, reconsignment issues, limited access,
                inspections, or carrier terminal backups. We&apos;ll check with
                the carrier and give you the clearest update available.
              </Text>
            </Stack>

            <Stack gap="xs">
              <Title order={4}>How do I submit a claim?</Title>
              <Text>
                Email{" "}
                <a
                  href="mailto:sales@ftlwarehouse.com"
                  className="text-[#0E336C] hover:underline fw-500"
                >
                  sales@ftlwarehouse.com
                </a>{" "}
                and we&apos;ll send you the list of required documents. We help
                file the claim for you, but the stronger the documentation, the
                better. Photos, delivery notes, packing lists, commercial
                documentation, and written damage notations all matter.
              </Text>
            </Stack>

            <Stack gap="xs">
              <Title order={4}>How do I get a proof of delivery?</Title>
              <Text>
                Email{" "}
                <a
                  href="mailto:sales@ftlwarehouse.com"
                  className="text-[#0E336C] hover:underline fw-500"
                >
                  sales@ftlwarehouse.com
                </a>{" "}
                with your shipment number, PRO number, or customer name.
                We&apos;ll send the POD once it is available from the carrier.
                Some carriers post PODs quickly, while others take a little
                longer after delivery.
              </Text>
            </Stack>

            <Stack gap="xs">
              <Title order={4}>
                How do I request a quote or book a shipment off of the website?
              </Title>
              <Text>
                Email{" "}
                <a
                  href="mailto:sales@ftlwarehouse.com"
                  className="text-[#0E336C] hover:underline fw-500"
                >
                  sales@ftlwarehouse.com
                </a>{" "}
                with your shipment details.
                <br />
                <strong>For both pickup and delivery, include:</strong>
              </Text>
              <ul className="list-disc pl-5">
                <li>Business name & address</li>
                <li>
                  Location type (dock or non-dock). If no dock, include details
                  to avoid additional charges
                </li>
                <li>Contact name & phone number</li>
                <li>Hours (and note if an appointment is required)</li>
              </ul>
              <Text fw={700}>Shipment details:</Text>
              <ul className="list-disc pl-5">
                <li>Piece count / pallet count</li>
                <li>Weight & dimensions</li>
                <li>Commodity description</li>
                <li>Any PO #s, reference #s, or release #s</li>
              </ul>
              <Text fw={700}>Timing:</Text>
              <ul className="list-disc pl-5">
                <li>
                  Let us know if the shipment is time-sensitive (trade show,
                  must-arrive-by date, etc.)
                </li>
              </ul>
              <Text>
                Once we have everything, we&apos;ll send a quote or prepare the
                BOL and book your shipment.
              </Text>
            </Stack>

            <Stack gap="xs">
              <Title order={4}>
                What if I can&apos;t track my shipment on this website?
              </Title>
              <Text>
                You can also track directly on the carrier&apos;s website using
                the PRO number. For example, you can search &quot;R+L Carriers
                tracking&quot; or &quot;Saia tracking&quot; and enter the PRO
                number there. If you still can&apos;t find it, email{" "}
                <a
                  href="mailto:sales@ftlwarehouse.com"
                  className="text-[#0E336C] hover:underline fw-500"
                >
                  sales@ftlwarehouse.com
                </a>{" "}
                and we&apos;ll help track it down.
              </Text>
            </Stack>

            <Stack gap="xs">
              <Title order={4}>What makes FTL different?</Title>
              <Text>
                We are a small family business that takes freight seriously. We
                believe in clear communication, honest billing, and helping
                customers understand what is actually happening with their
                shipments.
                <br />
                <br />
                Freight is not perfect, but we do not disappear when something
                gets messy. We help quote, book, track, problem-solve, dispute,
                claim, and follow through. That is the difference.
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </div>
  );
}
