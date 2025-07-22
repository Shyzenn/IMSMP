"use client";

import React from "react";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import AddUser from "./AddUser";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import UserTable from "./UserTable";

const UserManagement = () => {
  const fetchUser = async () => {
    const { data } = await axios.get("/api/manager/user");
    return Array.isArray(data) ? data : [];
  };

  const { data: usersData = [], isLoading } = useQuery({
    queryFn: fetchUser,
    queryKey: ["users"],
  });

  return (
    <div className="mx-32 my-16">
      <div className="flex items-center justify-between mb-6">
        <p>
          All Users{" "}
          <span className="text-lg font-medium">{usersData.length}</span>
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
      <UserTable isLoading={isLoading} usersData={usersData} />
    </div>
  );
};

export default UserManagement;
