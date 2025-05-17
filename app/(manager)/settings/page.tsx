import AddUser from "@/app/components/AddUser";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";

const Settings = () => {
  return (
    <>
      <div className="h-full bg-white rounded-md">
        <p className="text-center pt-10 text-2xl">User Management</p>
        <div className="flex items-center justify-between my-16 mx-32">
          <p>
            All Users <span>5</span>
          </p>
          <div className="border p-2 rounded-full flex items-center w-96 bg-background">
            <HiOutlineMagnifyingGlass className="text-xl mx-2" />
            <input
              type="search"
              placeholder="Search"
              className="w-full outline-none bg-background"
            />
          </div>
          <AddUser />
        </div>
      </div>
    </>
  );
};

export default Settings;
