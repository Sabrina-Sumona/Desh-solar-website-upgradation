import type { Metadata } from "next";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import "./globals.css";
import "@/styles/site-shell.css";

export const metadata: Metadata = {
  title: {
    default: "Desh Solar",
    template: "%s | Desh Solar",
  },

  description:
    "Solar products and complete solar energy solutions for homes, businesses, industries and agriculture in Bangladesh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}