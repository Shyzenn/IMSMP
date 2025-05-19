import type { Metadata } from "next";
import "../globals.css";
import Header from "../components/Header";
import AdminSidebar from "@/app/components/AdminSidebar";
import { SidebarProvider } from "./SidebarContext";
import ReactQueryProvider from "./QueryClientProvider";

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
          <div className="flex h-screen w-screen">
            <AdminSidebar />
            <div className="flex-1 flex flex-col ">
              <Header />
              <div className="flex-1 m-3">
                <div className="w-full h-full"> {children}</div>
              </div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </ReactQueryProvider>
  );
}
