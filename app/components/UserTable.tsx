import React from "react";
import TableComponent from "./TableComponent";
import { Column, UserFormValues } from "@/lib/interfaces";
import { TableRowSkeleton } from "./Skeleton";

const columns: Column[] = [
  { label: "User Name", accessor: "username" },
  { label: "Password", accessor: "password" },
  { label: "User Type", accessor: "userType" },
  { label: "Action", accessor: "action" },
];

const UserTable = ({
  isLoading,
  usersData,
}: {
  isLoading: boolean;
  usersData: UserFormValues[];
}) => {
  if (isLoading) return <TableRowSkeleton />;

  return (
    <TableComponent
      columns={columns}
      data={usersData}
      interactiveRows={false}
      noDataMessage={usersData.length === 0 ? "No users found" : undefined}
    />
  );
};

export default UserTable;
