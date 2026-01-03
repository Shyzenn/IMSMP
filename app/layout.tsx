import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Macoleen's Pharmacy",
  icons: {
    icon: [{ url: "nmc.png", type: "image/png", sizes: "16x16" }],
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <SessionProvider>
        <body className={`antialiased font-sans `}>
          <Toaster position="bottom-right" />
          {children}
        </body>
      </SessionProvider>
    </html>
  );
}
