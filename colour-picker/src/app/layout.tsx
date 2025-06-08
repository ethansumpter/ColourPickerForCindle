import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BrowserCheck } from "@/components/BrowserCheck";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Colour Picker",
  description: "A tool for finding and mixing Winsor & Newton colors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BrowserCheck>
          {children}
        </BrowserCheck>
      </body>
    </html>
  );
}
