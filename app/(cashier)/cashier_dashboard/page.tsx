import CashierDashboardCards from "@/app/components/CashierDashboardCards";
import ManagerRecentReqTable from "@/app/components/PharmacistRecentReqTable";
import SalesGraph from "@/app/components/SalesGraph";
import TopMedicine from "@/app/components/TopMedicine";

export default async function Dashboard() {
  return (
    <div className="h-full flex flex-col gap-5">
      <CashierDashboardCards />
      <div className="h-[35%] flex gap-x-4 w-full">
        <SalesGraph />
        <div className="bg-white w-[45%] rounded-md shadow-md">
          <TopMedicine />
        </div>
      </div>
      <div className="bg-white h-[40%] rounded-md shadow-md">
        <ManagerRecentReqTable />
      </div>
    </div>
  );
}
