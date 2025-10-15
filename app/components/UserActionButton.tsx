"use client";

import { CiEdit } from "react-icons/ci";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserEditModal from "./UserEditModal";
import { useModal } from "../hooks/useModal";
import { UserFormValues } from "@/lib/interfaces";
import { GoCheckCircle } from "react-icons/go";
import { IoBanOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import UserStatusConfirmDialog from "./UserStatusConfirmDialog";
import toast from "react-hot-toast";
import LoadingButton from "@/components/loading-button";
import { useTransition } from "react";
import { updateUserStatus } from "@/lib/action/user";

const UserActionButton = ({ user }: { user: UserFormValues }) => {
  const { close, open, isOpen } = useModal();

  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: "ACTIVE" | "DISABLE") => {
    startTransition(async () => {
      const result = await updateUserStatus({ userId: user.id!, status });

      if (result.success) {
        toast.success(`User "${user.username}" ${result.message}`, {
          icon: "✅",
        });
      } else {
        toast.error(
          `Failed to update user ${user.username}: ${result.message}`,
          { icon: "❌" }
        );
      }
    });
  };

  const handleBan = () => handleStatusChange("DISABLE");
  const handleActivate = () => handleStatusChange("ACTIVE");

  return (
    <>
      {isOpen && <UserEditModal user={user} setIsModalOpen={close} />}

      <div className="flex text-xl gap-2 justify-end">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={open}>
                <p>Edit</p>
                <CiEdit />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit User</p>
            </TooltipContent>
          </Tooltip>

          {user.status === "ACTIVE" ? (
            <UserStatusConfirmDialog
              modalButtonLabel={
                isPending ? <LoadingButton color="text-white" /> : "Confirm"
              }
              buttonWidth="w-[110px] flex justify-evenly"
              iconColor="text-red-500"
              buttonLabel="Ban"
              icon={IoBanOutline}
              title="Ban User"
              description="Are you sure you want to ban this user?  
                They will no longer be able to log in."
              confirmButton={handleBan}
            />
          ) : (
            <UserStatusConfirmDialog
              modalButtonLabel={
                isPending ? <LoadingButton color="text-white" /> : "Confirm"
              }
              iconColor="text-green-500"
              buttonLabel="Activate"
              icon={GoCheckCircle}
              title="Activate User"
              description="Are you sure you want to
                activate this user? They
                will regain full access to their account."
              confirmButton={handleActivate}
            />
          )}
        </TooltipProvider>
      </div>
    </>
  );
};

export default UserActionButton;
