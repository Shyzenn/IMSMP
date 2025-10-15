import type { Metadata } from "next";
import "../globals.css";
import Header from "../components/Header";
import { SidebarProvider } from "../(manager)/SidebarContext";
import Sidebar from "../components/Sidebar";
import { pharmacistLinks } from "@/lib/links";
import ReactQueryProvider from "../(manager)/QueryClientProvider";

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
          <div className="mx-auto w-full max-w-screen-3xl px-4 sm:px-6 lg:px-8">
            <div className=" mx-10 mt-24">
              <div>{children}</div>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </ReactQueryProvider>
  );
}
