import DashboardCards from "@/app/components/DashboardCards";
import SalesGraph from "@/app/components/SalesGraph";

export default function Dashboard() {
  return (
    <div className="h-full flex flex-col gap-5">
      <div className="h-[15%]">
        <DashboardCards />
      </div>
      <div className="h-[35%] flex gap-x-4 w-full">
        <SalesGraph />
        <div className="bg-white w-[45%] rounded-md">Content 2</div>
      </div>
      <div className="bg-white h-[45%] rounded-md">
        <div className=""></div>
      </div>
    </div>
  );
}
