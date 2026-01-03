import { auth } from "@/auth";
import RecentRequestTable from "@/app/components/request_order/RecentRequestTable";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import NurseCards from "@/app/components/dashboard/NurseCards";
import ExpiryProducts from "@/app/components/dashboard/ExpiryProducts";
import DashboardAuditLog from "@/app/components/dashboard/DashboardActivities";
import InventoryByCategoryChart from "@/app/components/dashboard/InventoryByCategoryChart";
import Top5RequestedProducts from "@/app/components/dashboard/Top5RequestedProduct";
import SalesByOrderTypePie from "@/app/components/dashboard/SalesByCategory";

export default async function Dashboard() {
  const session = await auth();
  const userRole = session?.user.role;
  return (
    <div className="h-full flex flex-col gap-5 mb-4">
      <DashboardHeader session={session} />

      <NurseCards />
      <div className="h-auto lg:h-96 flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="w-full lg:w-[70%] bg-white rounded-md shadow-md overflow-hidden flex flex-col">
          <RecentRequestTable userRole={userRole} />
        </div>
        <div className="w-full lg:w-[30%] bg-white rounded-md shadow-md overflow-hidden flex flex-col">
          <ExpiryProducts />
        </div>
      </div>

      <div className="h-auto lg:h-[30rem] flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="bg-white lg:w-[40%] rounded-md shadow-md w-full h-full">
          <DashboardAuditLog role="nurse" />
        </div>
        <div className="w-full lg:w-[60%] h-full">
          <InventoryByCategoryChart />
        </div>
      </div>

      <div className="h-auto lg:h-[30rem] flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="bg-white lg:w-[65%] rounded-md shadow-md w-full h-full">
          <Top5RequestedProducts />
        </div>
        <div className="bg-white w-full lg:w-[35%] rounded-md shadow-md h-full">
          <SalesByOrderTypePie />
        </div>
      </div>
    </div>
  );
}
