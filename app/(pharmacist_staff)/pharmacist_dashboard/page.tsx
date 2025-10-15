import DashboardHearder from "@/app/components/DashboardHearder";
import ExpiryProducts from "@/app/components/ExpiryProducts";
import ManagerDashboardCards from "@/app/components/ManagerDashboardCards";
import ManagerRecentReqTable from "@/app/components/PharmacistRecentReqTable";
import SalesByCategory from "@/app/components/SalesByCategory";
import TopSellingProducts from "@/app/components/TopSellingProductChart";
import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();
  const userRole = session?.user.role;

  return (
    <div className="h-full flex flex-col gap-5 mb-4">
      <DashboardHearder session={session} />
      <ManagerDashboardCards userRole={userRole} />
      <div className="h-96 flex gap-x-4 w-full">
        <div className="bg-white w-[40%] rounded-md shadow-md">
          <ExpiryProducts />
        </div>
        <div className="w-[70%] bg-white rounded-md shadow-md">
          <ManagerRecentReqTable userRole={userRole} />
        </div>
      </div>
      <div className=" h-[28rem] flex gap-x-4 w-full">
        <div className="w-[65%]">
          <TopSellingProducts />
        </div>
        <div className="bg-white w-[35%] rounded-md shadow-md">
          <SalesByCategory />
        </div>
      </div>
    </div>
  );
}
