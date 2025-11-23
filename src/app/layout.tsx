import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import '@rolemodel/optics/dist/css/optics.css'
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoleModel AI Leads",
  description: "RoleModel AI Leads is a platform that helps you generate leads for your business using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
