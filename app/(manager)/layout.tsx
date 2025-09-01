import type { Metadata } from "next";
import "../globals.css";
import Header from "../components/Header";
import { SidebarProvider } from "../(manager)/SidebarContext";
import ReactQueryProvider from "./QueryClientProvider";
import Sidebar from "../components/Sidebar";
import { managerLinks } from "@/lib/links";

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
          <div className="flex">
            <Sidebar links={managerLinks} />
            <div className="flex-1 flex flex-col h-svh overflow-y-auto">
              <Header />
              <div className="flex-1 mx-10">
                <div className="w-full h-full"> {children}</div>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </ReactQueryProvider>
  );
}
