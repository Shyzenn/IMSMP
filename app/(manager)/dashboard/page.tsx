import ExpiryProducts from "@/app/components/ExpiryProducts";
import ManagerDashboardCards from "@/app/components/ManagerDashboardCards";
import ManagerRecentReqTable from "@/app/components/ManagerRecentReqTable";
import SalesGraph from "@/app/components/SalesGraph";

export default async function Dashboard() {
  return (
    <div className="h-full flex flex-col gap-5">
      <ManagerDashboardCards />
      <div className="h-[35%] flex gap-x-4 w-full">
        <SalesGraph />
        <div className="bg-white w-[45%] rounded-md">
          <ExpiryProducts />
        </div>
      </div>
      <div className="bg-white h-[45%] rounded-md">
        <ManagerRecentReqTable />
      </div>
    </div>
  );
}
