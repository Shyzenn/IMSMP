import CashierDashboardCards from "@/app/components/CashierDashboardCards";
import DashboardHearder from "@/app/components/DashboardHearder";
import ManagerRecentReqTable from "@/app/components/PharmacistRecentReqTable";
import SalesByCategory from "@/app/components/SalesByCategory";
import SalesGraph from "@/app/components/SalesGraph";
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

      <div className="h-auto lg:h-96 flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="w-full lg:w-[70%] bg-white rounded-md shadow-md overflow-hidden flex flex-col h-96">
          <ManagerRecentReqTable userRole={userRole} />
        </div>
        <div className="w-full lg:w-[30%] bg-white rounded-md shadow-md overflow-hidden flex flex-col h-96">
          <SalesByCategory />
        </div>
      </div>

      <div className="h-auto lg:h-[30rem] flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="bg-white lg:w-[50%] rounded-md shadow-md w-full">
          <TopSellingProducts />
        </div>
        <div className="w-full lg:w-[50%] h-[30rem]">
          <SalesGraph username={username} />
        </div>
      </div>
    </div>
  );
}
