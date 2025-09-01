import NurseCards from "@/app/components/NurseCards";
import NurseLowStockList from "@/app/components/NurseLowStockList";
import RecentRequestOrder from "@/app/components/RecentRequestOrder";
import SalesGraph from "@/app/components/Top5RequestedProduct";

export default async function Dashboard() {
  return (
    <div className="h-full flex flex-col gap-5">
      <NurseCards />
      <div className="h-[35%] flex gap-x-4 w-full">
        <SalesGraph />
        <div className="bg-white w-[45%] rounded-md shadow-md">
          <NurseLowStockList />
        </div>
      </div>
      <div className="bg-white h-[40%] rounded-md shadow-md">
        <RecentRequestOrder />
      </div>
    </div>
  );
}
