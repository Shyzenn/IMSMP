import type { Metadata } from "next";
import "../globals.css";
import Header from "../components/header/Header";
import { SidebarProvider } from "../(manager)/SidebarContext";
import ReactQueryProvider from "./QueryClientProvider";
import { medTechLinks } from "@/lib/links";
import Sidebar from "../components/ui/Sidebar";

export const metadata: Metadata = {
  title: "Macoleen's Pharmacy",
  description: "Macoleen's Pharmacy Inventory Management",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <div className={`antialiased bg-background bg-gray-100`}>
        <SidebarProvider>
          <Sidebar links={medTechLinks} />
          <Header />

          <div className="mx-auto w-full max-w-screen-3xl mt-24 px-4 md:px-6 lg:px-16">
            {children}
          </div>
        </SidebarProvider>
      </div>
    </ReactQueryProvider>
  );
}
