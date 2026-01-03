import type { Metadata } from "next";
import "../globals.css";
import Header from "../components/header/Header";
import { SidebarProvider } from "../(manager)/SidebarContext";
import { pharmacistLinks } from "@/lib/links";
import ReactQueryProvider from "../(manager)/QueryClientProvider";
import ModalPortal from "../components/order/OrderModalPortal";
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
          <Sidebar links={pharmacistLinks} />
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
