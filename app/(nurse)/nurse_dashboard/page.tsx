import NurseCards from "@/app/components/NurseCards";
import { auth } from "@/auth";
import ExpiryProducts from "@/app/components/ExpiryProducts";
import InventoryByCategoryChart from "@/app/components/InventoryByCategoryChart";
import OrderTypePieChart from "@/app/components/OrderTypeChart";
import TopRequestedProducts from "@/app/components/TopRequestedProduct";
import DashboardAuditLog from "@/app/components/DashboardActivities";
import DashboardHeader from "@/app/components/DashboardHeader";
import RecentRequestTable from "@/app/components/RecentRequestTable";

export default async function Dashboard() {
  const session = await auth();
  const userRole = session?.user.role;
  return (
    <div className="h-full flex flex-col gap-5 mb-4">
      <DashboardHeader session={session} />

      <NurseCards />
      <div className="h-auto lg:h-96 flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="w-full lg:w-[70%] bg-white rounded-md shadow-md overflow-hidden flex flex-col h-96">
          <RecentRequestTable userRole={userRole} />
        </div>
        <div className="w-full lg:w-[30%] bg-white rounded-md shadow-md overflow-hidden flex flex-col h-96">
          <ExpiryProducts />
        </div>
      </div>

      <div className="h-auto lg:h-[30rem] flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="bg-white lg:w-[40%] rounded-md shadow-md w-full">
          <DashboardAuditLog role="nurse" />
        </div>
        <div className="w-full lg:w-[60%] h-auto">
          <InventoryByCategoryChart />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="w-full lg:w-[65%] bg-white rounded-md shadow-md">
          <TopRequestedProducts />
        </div>
        <div className="bg-white w-full lg:w-[35%] rounded-md shadow-md">
          <OrderTypePieChart />
        </div>
      </div>
    </div>
  );
}
