import type { Metadata } from "next";
import "../globals.css";
import Header from "../components/Header";
import { SidebarProvider } from "../(manager)/SidebarContext";
import ReactQueryProvider from "./QueryClientProvider";
import Sidebar from "../components/Sidebar";
import { medTechLinks } from "@/lib/links";
import ModalPortal from "../components/OrderModalPortal";

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
            <ModalPortal />
          </div>
        </SidebarProvider>
      </div>
    </ReactQueryProvider>
  );
}
