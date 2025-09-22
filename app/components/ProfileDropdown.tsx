import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { capitalLetter } from "@/lib/utils";
import DefaultUserImage from "@/public/defaultUserImg.jpg";
import Image from "next/image";
import { Session } from "next-auth";
import Link from "next/link";
import { handleSignOut } from "../authActions";
import { useModal } from "../hooks/useModal";
import EditProfileModal from "./EditProfileModal";

const ProfileDropdown = ({ session }: { session: Session | null }) => {
  const { open, close, isOpen } = useModal();

  return (
    <div>
      {isOpen && <EditProfileModal close={close} />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-10 h-10 p-2 rounded-full bg-white relative">
            <Image
              src={session?.user?.profileImage || DefaultUserImage}
              alt="User Profile Image"
              fill
              className="object-cover rounded-full"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel>
            {session?.user.username
              ? capitalLetter(session.user.username)
              : "Unknown"}
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={open}>Profile</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {session?.user === "Manager" && (
            <Link href={"/user_management"}>
              <DropdownMenuItem>User Management</DropdownMenuItem>
            </Link>
          )}
          <Link href={"/manager_archive"}>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <form
            action={handleSignOut}
            className=" px-2 py-[4px] hover:bg-gray-100 rounded-sm"
          >
            <button
              type="submit"
              className="w-full text-left text-sm flex justify-between cursor-default"
            >
              Log out
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileDropdown;
