import CashierDashboardCards from "@/app/components/CashierDashboardCards";
import DashboardHearder from "@/app/components/DashboardHearder";
import ExpiryProducts from "@/app/components/ExpiryProducts";
import ManagerRecentReqTable from "@/app/components/PharmacistRecentReqTable";
import SalesByCategory from "@/app/components/SalesByCategory";
import SalesGraph from "@/app/components/SalesGraph";
import TopRequestedProducts from "@/app/components/OrderTypeChart";
import TopSellingProducts from "@/app/components/TopSellingProductChart";
import { auth } from "@/auth";

export default async function Dashboard() {
  const session = await auth();
  const userRole = session?.user.role;
  const username = session?.user.username;

  return (
    <div className="h-full flex flex-col gap-5 mb-4">
      <DashboardHearder session={session} />
      <CashierDashboardCards />
      <div className="h-96 flex gap-x-4 w-full">
        <div className="w-[70%] bg-white rounded-md shadow-md">
          <ManagerRecentReqTable userRole={userRole} />
        </div>
        <div className="bg-white w-[40%] rounded-md shadow-md">
          <ExpiryProducts />
        </div>
      </div>

      <div className="h-[30rem] flex gap-x-4 w-full">
        <div className="bg-white w-[40%] rounded-md shadow-md">
          <TopRequestedProducts />
        </div>
        <div className="w-[60%] h-full bg-white rounded-md shadow-md">
          <TopSellingProducts />
        </div>
      </div>
      <div className="h-[28rem] flex gap-x-4 w-full">
        <div className="w-[65%]">
          <SalesGraph username={username} />
        </div>
        <div className="bg-white w-[35%] rounded-md shadow-md">
          <SalesByCategory />
        </div>
      </div>
    </div>
  );
}
