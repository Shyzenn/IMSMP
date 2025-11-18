import DashboardHeader from "@/app/components/DashboardHeader";
import ExpiryProducts from "@/app/components/ExpiryProducts";
import ManagerDashboardCards from "@/app/components/ManagerDashboardCards";
import SalesByCategory from "@/app/components/SalesByCategory";
import TopSellingProducts from "@/app/components/TopSellingProductChart";
import { auth } from "@/auth";
import RequestTableTab from "@/app/components/RequestTableTab";

export default async function Dashboard() {
  const session = await auth();
  const userRole = session?.user.role;

  return (
    <div className="h-full flex flex-col gap-5 mb-4">
      <DashboardHeader session={session} />
      <ManagerDashboardCards userRole={userRole} />
      <div className="h-auto flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="w-full lg:w-[70%] bg-white rounded-md shadow-md overflow-hidden flex flex-col h-[30rem]">
          <RequestTableTab userRole={userRole} />
        </div>
        <div className="w-full lg:w-[30%] bg-white rounded-md shadow-md overflow-hidden flex flex-col h-[30rem]">
          <ExpiryProducts />
        </div>
      </div>
      <div className="h-auto flex flex-col lg:flex-row gap-x-4 w-full gap-y-6 lg:gap-y-0">
        <div className="w-full lg:w-[65%] h-full bg-white rounded-md shadow-md">
          <TopSellingProducts />
        </div>
        <div className="bg-white w-full lg:w-[35%] rounded-md shadow-md">
          <SalesByCategory />
        </div>
      </div>
    </div>
  );
}
