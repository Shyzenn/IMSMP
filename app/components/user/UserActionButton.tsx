"use client";

import { useState } from "react";
import { CiEdit } from "react-icons/ci";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useModal } from "../../hooks/useModal";
import { UserFormValues } from "@/lib/interfaces";
import { Button } from "@/components/ui/button";
import UserStatusConfirmDialog from "./UserStatusConfirmDialog";
import toast from "react-hot-toast";
import { updateUserStatus } from "@/lib/action/user";
import LoadingButton from "@/components/loading-button";
import { IoBanOutline } from "react-icons/io5";
import { GoCheckCircle } from "react-icons/go";
import { useQueryClient } from "@tanstack/react-query";
import UserEditModal from "./UserEditModal";

const UserActionButton = ({ user }: { user: UserFormValues }) => {
  const queryClient = useQueryClient();
  const { close, open, isOpen } = useModal();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleStatusChange = async (
    status: "ACTIVE" | "DISABLE",
    bannedReason?: string
  ) => {
    {
      try {
        setIsPending(true);
        const sanitizedReason = bannedReason?.trim().replace(/\s+/g, " ") || "";

        if (
          status === "DISABLE" &&
          (!sanitizedReason || sanitizedReason.length < 5)
        ) {
          toast.error("Reason must be at least 5 characters", {
            duration: 5000,
          });
          return;
        }

        const result = await updateUserStatus({
          userId: user.id!,
          status,
          bannedReason: sanitizedReason ?? "No reason provided",
        });

        if (result.success) {
          toast.success(`User "${user.username}" ${result.message}`, {
            icon: "✅",
            duration: 10000,
          });
          queryClient.invalidateQueries({ queryKey: ["users"] });
        } else {
          toast.error(
            `Failed to update user ${user.username}: ${result.message}`,
            { icon: "❌" }
          );
        }
      } finally {
        setIsPending(false);
        setIsDialogOpen(false);
      }
    }
  };

  const handleBan = (bannedReason?: string) =>
    handleStatusChange("DISABLE", bannedReason);
  const handleActivate = () => handleStatusChange("ACTIVE");

  return (
    <>
      {/* Edit Modal */}
      {isOpen && <UserEditModal user={user} setIsModalOpen={close} />}

      {/* Confirm Ban/Activate Modal */}
      {isDialogOpen &&
        (user.status === "ACTIVE" ? (
          <UserStatusConfirmDialog
            hasReason
            isPending={isPending}
            bgRedButton
            modalButtonLabel={
              isPending ? <LoadingButton color="text-white" /> : "Confirm"
            }
            title={`Ban User "${user.username}"`}
            description="Are you sure you want to ban this user? They will no longer be able to log in."
            confirmButton={handleBan}
            closeModal={() => setIsDialogOpen(false)}
          />
        ) : (
          <UserStatusConfirmDialog
            hasReason
            isPending={isPending}
            readReason
            reasonValue={user.bannedReason}
            modalButtonLabel={
              isPending ? <LoadingButton color="text-white" /> : "Confirm"
            }
            title={`Activate User "${user.username}"`}
            description="Are you sure you want to activate this user? They will regain full access to their account."
            confirmButton={handleActivate}
            closeModal={() => setIsDialogOpen(false)}
          />
        ))}

      <div className="flex text-xl gap-2 justify-end">
        <TooltipProvider>
          {/* Edit Button */}
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

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(true)}
                className={`flex items-center gap-1 ${
                  user.status === "ACTIVE"
                    ? "text-red-600 "
                    : "text-buttonBgColor"
                }`}
              >
                {user.status === "ACTIVE" ? (
                  <>
                    <p>Ban</p>
                    <IoBanOutline />
                  </>
                ) : (
                  <>
                    <p>Activate</p>
                    <GoCheckCircle />
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{user.status === "ACTIVE" ? "Ban User" : "Activate User"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default UserActionButton;
