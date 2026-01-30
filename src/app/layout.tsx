import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SidebarMenu from "@/components/SidebarMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Laundry Terdekat",
  description: "Temukan jasa laundry terbaik di sekitarmu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <SidebarMenu />
        {children}
      </body>
    </html>
  );
}

