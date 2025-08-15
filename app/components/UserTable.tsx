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

const sortableHeaders = [
  { label: "Username", key: "username" },
  { label: "User Type", key: "role" },
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
        <EmptyTable content="No Product Available" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              {sortableHeaders.map(({ key, label }) => (
                <TableHead key={key} className="text-black font-semibold">
                  <button className="flex gap-2 items-center">{label}</button>
                </TableHead>
              ))}
              <TableHead className="text-black font-semibold">
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
