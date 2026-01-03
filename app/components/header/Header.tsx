"use client";

import MobileMenu from "./MobileMenu";
import { useSession } from "next-auth/react";
import { memo } from "react";
import Image from "next/image";
import PharmacyIcon from "@/public/macoleens_logo.png";
import HeaderLinks from "./HeaderLinks";
import ProfileDropdown from "./ProfileDropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HeaderLinksSkeleton } from "../ui/Skeleton";
import Link from "next/link";
import { getLogoLink } from "@/lib/links";
import StaffNotificationBell from "./StaffNotificationBell";
import EmergencyOrderModal from "../order/EmergencyModal";

const Header = () => {
  const { data: session, status } = useSession();
  const userRole = session?.user.role;
  const MemoMobileMenu = memo(MobileMenu);

  return (
    <div className="fixed top-0 w-full bg-white mb-5 shadow-md z-20">
      <div className="flex justify-between items-center px-4 lg:px-10 2xl:max-w-screen-3xl mx-auto w-full">
        <Link href={getLogoLink(userRole)} className="hidden lg:block">
          <Image
            src={PharmacyIcon}
            alt="Macoleen's Pharmacy Icon"
            width={150}
            height={150}
          />
        </Link>

        <MemoMobileMenu />

        {status === "loading" ? (
          <HeaderLinksSkeleton />
        ) : (
          <HeaderLinks userRole={userRole} />
        )}

        <div className="flex items-center relative gap-2">
          {status === "authenticated" && (
            <>
              {/* <div className="hidden md:block">
                {userRole === "Pharmacist_Staff" && <WalkInOrder />}
              </div> */}
              {userRole !== "SuperAdmin" && (
                <StaffNotificationBell
                  userId={session?.user.id}
                  userRole={userRole}
                />
              )}
            </>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ProfileDropdown session={session} />
              </TooltipTrigger>
              <TooltipContent>
                <p>Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <EmergencyOrderModal />
        </div>
      </div>
    </div>
  );
};

export default Header;
