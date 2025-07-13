import ExpiryProducts from "@/app/components/ExpiryProducts";
import ManagerDashboardCards from "@/app/components/ManagerDashboardCards";
import ManagerRecentReqTable from "@/app/components/PharmacistRecentReqTable";
import Top5RequestedProducts from "@/app/components/Top5RequestedProduct";

export default async function Dashboard() {
  return (
    <div className="h-full flex flex-col gap-5">
      <ManagerDashboardCards />
      <div className="h-[35%] flex gap-x-4 w-full">
        <Top5RequestedProducts />
        <div className="bg-white w-[45%] rounded-md shadow-md">
          <ExpiryProducts />
        </div>
      </div>
      <div className="bg-white h-[40%] rounded-md shadow-md">
        <ManagerRecentReqTable />
      </div>
    </div>
  );
}
