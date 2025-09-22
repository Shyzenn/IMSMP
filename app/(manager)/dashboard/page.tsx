import ExpiryProducts from "@/app/components/ExpiryProducts";
import ManagerDashboardCards from "@/app/components/ManagerDashboardCards";
import ManagerRecentReqTable from "@/app/components/PharmacistRecentReqTable";
import SalesByCategory from "@/app/components/SalesByCategory";
import SalesGraph from "@/app/components/SalesGraph";

export default async function Dashboard() {
  return (
    <div className="h-full flex flex-col gap-5 mb-4">
      <ManagerDashboardCards />
      <div className="h-80 flex gap-x-4 w-full">
        <div className="w-[60%]">
          <SalesGraph />
        </div>
        <div className="bg-white w-[40%] rounded-md shadow-md">
          <SalesGraph />
        </div>
      </div>
      <div className="h-96 flex gap-x-4 w-full">
        <div className="bg-white w-[40%] rounded-md shadow-md">
          <ExpiryProducts />
        </div>
        <div className="w-[60%] h-full bg-white rounded-md shadow-md">
          <SalesByCategory />
        </div>
      </div>
      <div className="bg-white h-[40%] rounded-md shadow-md">
        <ManagerRecentReqTable />
      </div>
    </div>
  );
}
