"use client";

import React from "react";
import InventoryFilter from "./InventoryFilter";
import AddProductForm from "./AddProductform";
import Search from "../Search";
import { useSession } from "next-auth/react";

const InventoryHeader = () => {
  const { data: session } = useSession();

  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-2xl font-semibold">Inventory</p>
      <div className="w-[30rem] border px-6 rounded-full flex items-center gap-2 bg-gray-50">
        <Search placeholder="Search..." />
      </div>
      <div>
        <InventoryFilter />
      </div>

      {(session?.user.role === "Manager" ||
        session?.user.role === "Pharmacist_Staff") && (
        <div>
          <AddProductForm />
        </div>
      )}
    </div>
  );
};

export default InventoryHeader;
