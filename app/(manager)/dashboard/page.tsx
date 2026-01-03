import DashboardAuditLog from "@/app/components/dashboard/DashboardActivities";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import ExpiryProducts from "@/app/components/dashboard/ExpiryProducts";
import ManagerDashboardCards from "@/app/components/dashboard/ManagerDashboardCards";
import SalesByOrderTypePie from "@/app/components/dashboard/SalesByCategory";
import SalesGraph from "@/app/components/dashboard/SalesGraph";
import TopSellingProducts from "@/app/components/dashboard/TopSellingProductChart";
import RequestTableTab from "@/app/components/request_order/RequestTableTab";
import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();
  const userRole = session?.user.role;
  const username = session?.user.username;

  return (
    <div className="h-full flex flex-col gap-5 mb-4">
      <DashboardHeader session={session} />

      <ManagerDashboardCards userRole={userRole} />

      <div className="h-auto flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="w-full lg:w-[70%] bg-white rounded-md shadow-md overflow-hidden flex flex-col h-[27rem]">
          <RequestTableTab userRole={userRole} />
        </div>
        <div className="w-full lg:w-[30%] bg-white rounded-md shadow-md overflow-hidden flex flex-col h-[27rem]">
          <ExpiryProducts />
        </div>
      </div>

      <div className="h-auto flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="bg-white lg:w-[40%] rounded-md shadow-md w-full">
          <DashboardAuditLog role="manager" />
        </div>
        <div className="w-full lg:w-[60%] h-[30rem]">
          <SalesGraph username={username} />
        </div>
      </div>

      <div className="h-auto flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="w-full lg:w-[65%] h-full bg-white rounded-md shadow-md">
          <TopSellingProducts />
        </div>
        <div className="bg-white w-full lg:w-[35%] rounded-md shadow-md">
          <SalesByOrderTypePie />
        </div>
      </div>
    </div>
  );
}
