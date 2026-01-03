import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import ExpiryProducts from "@/app/components/dashboard/ExpiryProducts";
import SalesGraph from "@/app/components/dashboard/SalesGraph";
import MTDashboardCards from "@/app/components/medtech/MTDashboardCards";
import MTTopRequestedProducts from "@/app/components/medtech/MTTopRequestedProduct";
import RecentMedTechRequestTable from "@/app/components/medtech/RecentMTRequestTable";
import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();
  const userRole = session?.user.role;
  const username = session?.user.username;

  return (
    <div className="h-full flex flex-col gap-5 mb-4">
      <DashboardHeader session={session} />

      <MTDashboardCards />

      <div className="h-auto lg:h-96 flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="w-full lg:w-[70%] bg-white rounded-md shadow-md overflow-hidden flex flex-col h-96">
          <RecentMedTechRequestTable userRole={userRole} />
        </div>
        <div className="w-full lg:w-[30%] bg-white rounded-md shadow-md overflow-hidden flex flex-col h-96">
          <ExpiryProducts />
        </div>
      </div>

      <div className="h-auto lg:h-[30rem] flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="w-full lg:w-[50%] h-full bg-white rounded-md shadow-md">
          <MTTopRequestedProducts />
        </div>
        <div className="w-full lg:w-[50%] h-[30rem]">
          <SalesGraph username={username} userRole={userRole} />
        </div>
      </div>
    </div>
  );
}
