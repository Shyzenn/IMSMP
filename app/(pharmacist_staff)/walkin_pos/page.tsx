import WalkInPOS from "@/app/components/walkin_pos/WalkInPOS";

const page = () => {
  return (
    <div className="fixed inset-0 top-[73px] bg-gray-100">
      <div className="h-full flex">
        <WalkInPOS />
      </div>
    </div>
  );
};

export default page;
