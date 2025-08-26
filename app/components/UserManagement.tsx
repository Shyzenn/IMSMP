"use client";

import React from "react";
import AddUser from "./AddUser";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import UserTable from "./UserTable";

const UserManagement = () => {
  const fetchUser = async () => {
    const { data } = await axios.get("/api/user/get");
    return Array.isArray(data) ? data : [];
  };

  const { data: usersData = [], isLoading } = useQuery({
    queryFn: fetchUser,
    queryKey: ["users"],
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="mx-32 my-16">
      <div className="flex items-center justify-between mb-6">
        <p>
          All Users{" "}
          <span className="text-lg font-medium">{usersData.length}</span>
        </p>

        <AddUser />
      </div>
      <UserTable isLoading={isLoading} usersData={usersData} />
    </div>
  );
};

export default UserManagement;
