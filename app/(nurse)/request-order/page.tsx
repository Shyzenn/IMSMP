import NurseCards from "@/app/components/NurseCards";
import NurseLowStockList from "@/app/components/NurseLowStockList";
import RecentRequestOrder from "@/app/components/RecentRequestOrder";
import SalesGraph from "@/app/components/Top5RequestedProduct";

export default function Dashboard() {
  return (
    <div className="h-full flex flex-col gap-5">
      <NurseCards />
      <div className="h-[35%] flex gap-x-4 w-full">
        <SalesGraph />
        <NurseLowStockList />
      </div>
      <div className="bg-white h-[45%] rounded-md">
        <RecentRequestOrder />
      </div>
    </div>
  );
}
