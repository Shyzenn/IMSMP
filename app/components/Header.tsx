"use client";

import { PiBellThin } from "react-icons/pi";
import { AiOutlineUser } from "react-icons/ai";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import { useSession } from "next-auth/react";
import { capitalLetter } from "@/lib/utils";

const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/inventory": "Inventory",
    "/transaction": "Transaction",
    "/add-product": "Add New Product",
    "/order": "Order",
    "/settings": "Settings",
    "/request-order": "Request Order",
  };

  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <>
      <div className="flex justify-between items-center shadow-md px-3 py-4 bg-white">
        <p className="hidden xl:block">{pageTitle}</p>
        <MobileMenu />
        <div className="flex items-center relative">
          {session?.user.role === "Admin" && (
            <div className="relative cursor-pointer">
              <PiBellThin className="mr-8 text-2xl" />
            </div>
          )}
          <div className="flex items-center gap-1">
            <AiOutlineUser className="text-2xl " />
            {session?.user.username
              ? capitalLetter(session.user.username)
              : "Unknown User"}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
