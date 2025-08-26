import React from "react";
import { UserFormValues } from "@/lib/interfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyTable from "./EmptyTable";
import UserActionButton from "./UserActionButton";
import clsx from "clsx";

const sortableHeaders = [
  { label: "Username", key: "username" },
  { label: "User Type", key: "role" },
  { label: "Status", key: "status" },
];

const UserTable = ({
  isLoading,
  usersData,
}: {
  isLoading: boolean;
  usersData: UserFormValues[];
}) => {
  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      {usersData.length === 0 ? (
        <EmptyTable content="No Users Available" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              {sortableHeaders.map(({ key, label }) => (
                <TableHead key={key} className="text-black font-semibold">
                  <p className="flex gap-2 items-center">{label}</p>
                </TableHead>
              ))}
              <TableHead className="text-black font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersData.map((user, i) => (
              <TableRow key={i}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "h-3 w-3 rounded-full",
                        user.isOnline
                          ? "bg-green-500 animate-pulse"
                          : "bg-gray-400"
                      )}
                    />
                    <span className="text-sm">
                      {user.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <UserActionButton user={user} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default UserTable;
