import type { Metadata } from "next";
import "../globals.css";
import Header from "../components/Header";
import NurseSidebar from "@/app/components/NurseSidebar";
import { SidebarProvider } from "../(manager)/SidebarContext";

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
    <div className={`antialiased bg-background`}>
      <SidebarProvider>
        <div className="flex h-screen w-screen">
          <NurseSidebar />
          <div className="flex-1 flex flex-col ">
            <Header />
            <div className="flex-1 m-3">
              <div className="w-full h-full "> {children}</div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
