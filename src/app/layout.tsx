import type { Metadata } from "next";
import StoreProvider from "@/lib/storeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LawBot",
  description: "Next.js with Redux Setup",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}