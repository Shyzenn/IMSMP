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
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const UserActionButton = ({ user }: { user: UserFormValues }) => {
  const { close, open, isOpen } = useModal();
  const queryClient = useQueryClient();

  const updateUserStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await axios.patch(`/api/user/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(
        `User "${user.username}" has been ${
          variables.status === "ACTIVE" ? "activated" : "banned"
        } successfully`,
        { icon: "✅" }
      );
    },
    onError: () => {
      toast.error(`Failed to update user ${user.username}`, { icon: "❌" });
    },
  });

  const handleBan = () => {
    updateUserStatus.mutate({ id: user.id, status: "DISABLE" });
  };

  const handleActivate = () => {
    updateUserStatus.mutate({ id: user.id, status: "ACTIVE" });
  };

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
