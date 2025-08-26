import React from "react";
import Search from "../Search";
import InventoryFilter from "../Inventory/InventoryFilter";

const Header = () => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-2xl font-semibold">Audit Log</p>
      <div className="w-[30rem] border px-6 rounded-full flex items-center gap-2 bg-gray-50">
        <Search placeholder="Search..." />
      </div>
      <div>
        <InventoryFilter />
      </div>
    </div>
  );
};

export default Header;
