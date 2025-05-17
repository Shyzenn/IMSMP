"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { GrTransaction } from "react-icons/gr";
import { TbSettings2 } from "react-icons/tb";
import { PiSignOutThin } from "react-icons/pi";
import { useSidebar } from "@/app/(manager)/SidebarContext";
import PharmacyIcon from "@/public/macoleens_logo.jpg";
import Image from "next/image";
import { handleSignOut } from "../authActions";

const links = [
  {
    name: "Request Order",
    href: "/request-order",
    icon: <RiDashboardHorizontalLine />,
  },
  {
    name: "Transaction",
    href: "/(nurse)/transaction",
    icon: <GrTransaction />,
  },
];

const Sidebar = () => {
  const { isOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  const isActive = (hrefs?: string | string[]) => {
    if (Array.isArray(hrefs)) {
      return hrefs.some((href) => pathname.startsWith(href));
    }
    return pathname === hrefs;
  };

  return (
    <div
      className={clsx(
        "bg-white px-10 py-8 border-r h-svh fixed top-0 left-0 w-64 xl:relative xl:transform-none 2xl:w-64 transform transition-transform duration-500 ease-in-out xl:translate-x-0 z-30 2xl:px-8",
        {
          "translate-x-0": isOpen, // Open sidebar
          "-translate-x-full": !isOpen, // Close sidebar
          "xl:w-64 xl:fixed": isHovered,
          "xl:w-20 xl:px-0": !isHovered,
        }
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transition: " 0.3s ease",
      }}
    >
      <div className=" h-[15%] flex flex-col items-center">
        <div
          className={clsx(
            "hidden xl:block text-2xl xl:text-center 2xl:hidden",
            {
              "xl:block": !isHovered,
              "xl:hidden": isHovered,
            }
          )}
        >
          <Image
            src={PharmacyIcon}
            alt="Macoleen's Pharmacy Icon"
            width={50}
            height={50}
          />
        </div>
        <div
          className={clsx("text-2xl 2xl:block ", {
            "xl:block": isHovered,
            "xl:hidden": !isHovered,
          })}
        >
          <Image
            src={PharmacyIcon}
            alt="Macoleen's Pharmacy Icon"
            width={150}
            height={150}
          />
        </div>
      </div>

      <div
        className={clsx("flex flex-col gap-6 h-[60%] 2xl:items-baseline ", {
          "xl:items-center": !isHovered,
          "xl:items-baseline": isHovered,
        })}
      >
        {links.map((link) => {
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex items-center gap-2 rounded-md p-3 text-sm hover:bg-green-50 2xl:w-full",
                {
                  "bg-green-500 hover:bg-green-500 text-white": isActive(
                    link.href
                  ),
                  "xl:w-full": isHovered,
                }
              )}
            >
              {link.icon}
              <p
                className={clsx("2xl:block", {
                  "xl:block": isHovered,
                  "xl:hidden": !isHovered,
                })}
              >
                {link.name}
              </p>
            </Link>
          );
        })}
      </div>

      <Link
        href="/settings"
        className={clsx(
          "flex items-center gap-2 rounded-md p-3 text-sm hover:bg-green-50 2xl:w-full mr-5 mb-5",
          {
            "bg-green-500 hover:bg-green-500 text-white ":
              pathname === "/settings",
            "xl:w-full": isHovered,
            "xl:ml-5 2xl:ml-0": !isHovered,
          }
        )}
      >
        <TbSettings2 />
        <p
          className={clsx(" 2xl:block", {
            "xl:block": isHovered,
            "xl:hidden": !isHovered,
          })}
        >
          Settings
        </p>
      </Link>

      <form action={handleSignOut}>
        <button
          className={clsx(
            "flex items-center gap-2 rounded-md p-3 text-sm hover:bg-green-50 2xl:w-full",
            {
              "xl:w-full": isHovered,
              "xl:ml-5 2xl:ml-0": !isHovered,
            }
          )}
        >
          <PiSignOutThin />
          <p
            className={clsx("2xl:block", {
              "xl:block": isHovered,
              "xl:hidden ": !isHovered,
            })}
          >
            Sign Out
          </p>
        </button>
      </form>
    </div>
  );
};

export default Sidebar;
