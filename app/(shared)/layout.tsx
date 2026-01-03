import { auth } from "@/auth";
import { SidebarProvider } from "../(manager)/SidebarContext";
import Header from "../components/header/Header";
import ReactQueryProvider from "../(manager)/QueryClientProvider";
import {
  managerLinks,
  nurseLinks,
  pharmacistLinks,
  cashierLinks,
} from "@/lib/links";
import Sidebar from "../components/ui/Sidebar";

export default async function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user?.role;

  const roleLinks =
    role === "Manager"
      ? managerLinks
      : role === "Nurse"
      ? nurseLinks
      : role === "Pharmacist_Staff"
      ? pharmacistLinks
      : role === "Cashier"
      ? cashierLinks
      : [];

  return (
    <ReactQueryProvider>
      <div className="antialiased bg-gray-100">
        <SidebarProvider>
          <Sidebar links={roleLinks} />
          <Header />
          <main className="mx-auto w-full max-w-screen-3xl mt-24 px-4 md:px-6 lg:px-16">
            {children}
          </main>
        </SidebarProvider>
      </div>
    </ReactQueryProvider>
  );
}
