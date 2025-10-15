import NurseCards from "@/app/components/NurseCards";
import { auth } from "@/auth";
import DashboardHearder from "@/app/components/DashboardHearder";
import ExpiryProducts from "@/app/components/ExpiryProducts";
import InventoryByCategoryChart from "@/app/components/InventoryByCategoryChart";
import ManagerRecentReqTable from "@/app/components/PharmacistRecentReqTable";
import OrderTypePieChart from "@/app/components/OrderTypeChart";
import TopRequestedProducts from "@/app/components/TopRequestedProduct";
import DashboardAuditLog from "@/app/components/DashboardActivities";

export default async function Dashboard() {
  const session = await auth();
  const userRole = session?.user.role;
  return (
    <div className="h-full flex flex-col gap-5 mb-4">
      <DashboardHearder session={session} />
      <NurseCards />
      <div className="h-96 flex gap-x-4 w-full">
        <div className="bg-white w-[40%] rounded-md shadow-md">
          <ExpiryProducts />
        </div>
        <div className="w-[70%] bg-white rounded-md shadow-md">
          <ManagerRecentReqTable userRole={userRole} />
        </div>
      </div>
      <div className="h-[30rem] flex gap-x-4 w-full">
        <div className="w-[60%] h-full bg-white rounded-md shadow-md">
          <InventoryByCategoryChart />
        </div>
        <div className="bg-white w-[40%] rounded-md shadow-md">
          <DashboardAuditLog role="nurse" entityType="ORDER_REQUEST" />
        </div>
      </div>
      <div className="h-[28rem] flex gap-x-4 w-full">
        <div className="bg-white w-[40%] rounded-md shadow-md">
          {" "}
          <OrderTypePieChart />
        </div>
        <div className="w-[60%] bg-white rounded-md shadow-md">
          <TopRequestedProducts />
        </div>
      </div>
    </div>
  );
}
