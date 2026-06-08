import type { Metadata } from "next";
import "./globals.css";

import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "Freight Team",
  description: "Freight Team Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
