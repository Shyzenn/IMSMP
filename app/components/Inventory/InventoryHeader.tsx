import React from "react";
import Search from "../../ui/Search";
import InventoryFilter from "./InventoryFilter";
import AddProductForm from "./AddProductform";

const InventoryHeader = () => {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-2xl font-semibold">Inventory</p>
      <div className="w-[30rem] border px-6 rounded-full flex items-center gap-2">
        <Search placeholder="Search..." />
      </div>
      <div>
        <InventoryFilter />
      </div>
      <div>
        <AddProductForm />
      </div>
    </div>
  );
};

export default InventoryHeader;
