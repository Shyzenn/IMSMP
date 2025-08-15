"use client";

import { CiEdit } from "react-icons/ci";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoArchiveOutline } from "react-icons/io5";
import UserEditModal from "./UserEditModal";
import { useModal } from "../hooks/useModal";
import { UserFormValues } from "@/lib/interfaces";

const UserActionButton = ({ user }: { user: UserFormValues }) => {
  const { close, open, isOpen } = useModal();

  return (
    <>
      {isOpen && <UserEditModal user={user} setIsModalOpen={close} />}

      <div className="flex text-xl gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={open}>
                <CiEdit />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit User</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button>
                <IoArchiveOutline />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Archive User</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default UserActionButton;
