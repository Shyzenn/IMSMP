import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { capitalLetter } from "@/lib/utils";
import DefaultUserImage from "@/public/defaultUserImg.jpg";
import Image from "next/image";
import { Session } from "next-auth";
import Link from "next/link";
import { handleSignOut } from "../authActions";

const ProfileDropdown = ({ session }: { session: Session | null }) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-9 h-9 p-2 rounded-full bg-white relative">
            <Image
              src={DefaultUserImage}
              alt="Default User Image"
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
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <Link href={"/pharmacist_settings"}>
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>

          <DropdownMenuItem>Support</DropdownMenuItem>
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
              <DropdownMenuShortcut>⇧⌘L</DropdownMenuShortcut>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileDropdown;
