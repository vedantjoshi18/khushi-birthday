import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Playfair_Display, EB_Garamond } from "next/font/google";
import AppShell from "@/components/ui/AppShell";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Khushi Birthday",
  description: "An intimate, editorial birthday experience for Khushi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${inter.variable} ${playfair.variable} ${garamond.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
