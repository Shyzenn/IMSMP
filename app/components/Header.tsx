"use client";

import MobileMenu from "./MobileMenu";
import { useSession } from "next-auth/react";
import { memo } from "react";
import WalkInOrder from "./WalkInOrder";
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
import NotificationBell from "./NotificationBell";

const Header = () => {
  const { data: session } = useSession();
  const userRole = session?.user.role;
  const MemoMobileMenu = memo(MobileMenu);

  return (
    <div className="flex justify-between items-center mx-10 py-8 relative">
      <Image
        src={PharmacyIcon}
        alt="Macoleen's Pharmacy Icon"
        width={150}
        height={150}
        className="hidden xl:block"
      />
      <MemoMobileMenu />
      <HeaderLinks session={session} />
      <div className="flex items-center relative">
        {userRole === "Pharmacist_Staff" && <WalkInOrder />}

        {(userRole === "Pharmacist_Staff" || userRole === "Manager") && (
          <NotificationBell
            userId={session?.user.id}
            userRole={session?.user.role}
          />
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
      </div>
    </div>
  );
};

export default Header;
