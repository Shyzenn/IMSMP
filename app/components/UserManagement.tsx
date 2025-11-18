"use client";

import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import AddUser from "@/app/components/AddUser";
import UserTable from "@/app/components/UserTable";
import Search from "@/app/components/Search";
import { useSearchParams } from "next/navigation";

const UserManagement = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const fetchUser = async () => {
    const { data } = await axios.get("/api/user/get", {
      params: { query },
    });
    return Array.isArray(data) ? data : [];
  };

  const { data: usersData = [], isLoading } = useQuery({
    queryFn: fetchUser,
    queryKey: ["users", query],
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  return (
    <div
      className="p-6 bg-white overflow-auto rounded-md"
      style={{ height: "calc(94vh - 70px)" }}
    >
      <div className="flex items-center justify-between mb-6 flex-col gap-8 md:flex-row">
        <p>
          All Users{" "}
          <span className="text-lg font-medium">{usersData.length}</span>
        </p>
        <div className="w-auto md:w-[20rem] lg:w-[30rem] border px-6 rounded-full flex items-center gap-2 bg-gray-50">
          <Search placeholder="Search name..." />
        </div>
        <AddUser />
      </div>
      <UserTable isLoading={isLoading} usersData={usersData} />
    </div>
  );
};

export default UserManagement;
