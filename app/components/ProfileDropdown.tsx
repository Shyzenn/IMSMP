import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { capitalLetter, toTitleCase } from "@/lib/utils";
import DefaultUserImage from "@/public/defaultUserImg.jpg";
import Image from "next/image";
import { Session } from "next-auth";
import Link from "next/link";
import { handleSignOut } from "../authActions";
import { useModal } from "../hooks/useModal";
import EditProfileModal from "./EditProfileModal";
import { FaCircleUser, FaUserGear, FaBoxArchive } from "react-icons/fa6";
import { BiLogOut } from "react-icons/bi";
import { useSession } from "next-auth/react";
import { ProfileSkeleton } from "./Skeleton";

const ProfileDropdown = ({ session }: { session: Session | null }) => {
  const { open, close, isOpen } = useModal();
  const { status } = useSession();

  return (
    <div>
      {isOpen && <EditProfileModal close={close} />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center bg-slate-100 py-4 px-6 gap-4 cursor-pointer">
            <div>
              <button className="w-10 h-10 p-2 rounded-full bg-white relative">
                <Image
                  src={session?.user?.profileImage || DefaultUserImage}
                  alt="User Profile Image"
                  fill
                  className="object-cover rounded-full"
                />
              </button>
            </div>
            <div>
              {status === "loading" ? (
                <ProfileSkeleton />
              ) : (
                <>
                  <p className="font-medium text-[15px]">
                    {toTitleCase(session?.user.username)}
                  </p>
                  <p className="text-[12px] text-slate-500 font-medium">
                    {session?.user.role}
                  </p>
                </>
              )}
            </div>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel className="text-[12px] text-slate-500 font-medium">
            Welcome{" "}
            {session?.user.username
              ? capitalLetter(session.user.username)
              : "Unknown"}
            !
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={open}>
              <FaCircleUser className="text-gray-400" />
              Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {session?.user.role === "Manager" && (
            <Link href={"/user_management"}>
              <DropdownMenuItem>
                <FaUserGear className="text-gray-400" />
                User Management
              </DropdownMenuItem>
            </Link>
          )}
          {session?.user.role !== "Cashier" && (
            <Link href={"/archive"}>
              <DropdownMenuItem>
                <FaBoxArchive className="text-gray-400" />
                Archive
              </DropdownMenuItem>
            </Link>
          )}

          <DropdownMenuSeparator />
          <form
            action={handleSignOut}
            className=" px-2 py-[4px] hover:bg-gray-100 rounded-sm"
          >
            <button
              type="submit"
              className="w-full text-left text-sm flex gap-[6px] cursor-default"
            >
              <BiLogOut className="text-lg text-gray-400" /> Log out{" "}
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProfileDropdown;
