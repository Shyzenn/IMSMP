"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PiSignOutThin } from "react-icons/pi";
import { useSidebar } from "@/app/(manager)/SidebarContext";
import PharmacyIcon from "@/public/macoleens_logo.png";
import Image from "next/image";
import { Links } from "@/lib/interfaces";
import { isActive } from "@/lib/utils";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { handleSignOut } from "@/app/authActions";

const Sidebar = ({ links }: { links?: Links[] }) => {
  const { isOpen } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div
      className={clsx(
        "bg-white px-10 py-8 border-r h-svh fixed top-0 left-0 w-64 xl:hidden xl:transform-none 2xl:w-64 transform transition-transform duration-500 ease-in-out xl:translate-x-0 z-40 2xl:px-8",
        {
          "translate-x-0": isOpen,
          "-translate-x-full": !isOpen,
          "xl:w-64 xl:fixed": isHovered,
          "xl:w-20 xl:px-0": !isHovered,
        }
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ transition: "0.3s ease" }}
    >
      {/* Logo */}
      <div className="h-[15%] flex flex-col items-center justify-center">
        <Image
          src={PharmacyIcon}
          alt="Macoleen's Pharmacy Icon"
          width={150}
          height={150}
        />
      </div>

      {/* Links */}
      <div
        className={clsx("flex flex-col gap-4 h-[65%]", {
          "xl:items-center": !isHovered,
          "xl:items-baseline": isHovered,
        })}
      >
        {links?.map((link) => {
          const isDropdownOpen = openDropdown === link.name;

          if (link.subLinks) {
            return (
              <div key={link.name} className="w-full">
                <button
                  onClick={() => toggleDropdown(link.name)}
                  className={clsx(
                    "flex items-center justify-between gap-2 w-full rounded-md p-3 text-sm hover:bg-green-50 2xl:w-full",
                    {
                      "bg-green-500 text-white hover:bg-green-500":
                        link.subLinks.some((s) =>
                          isActive(pathname, s.href ?? "")
                        ),
                      "xl:w-full": isHovered,
                    }
                  )}
                >
                  <div className="flex items-center gap-2">
                    <link.icon />
                    <p
                      className={clsx("2xl:block", {
                        "xl:block": isHovered,
                        "xl:hidden": !isHovered,
                      })}
                    >
                      {link.name}
                    </p>
                  </div>
                  {isDropdownOpen ? (
                    <IoIosArrowUp className="text-green-500" />
                  ) : (
                    <IoIosArrowDown className="text-gray-500" />
                  )}
                </button>

                {/* Dropdown Items */}
                <div
                  className={clsx(
                    "ml-4 pl-4 overflow-hidden transition-all duration-300 ease-in-out",
                    isDropdownOpen
                      ? "border-l max-h-40 opacity-100 translate-y-0"
                      : "max-h-0 opacity-0 -translate-y-2"
                  )}
                >
                  <div className="flex flex-col gap-2 mt-2">
                    {link.subLinks.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={clsx(
                          "block text-sm px-2 py-3 rounded-md hover:bg-green-50 transition-colors duration-150",
                          {
                            "text-green-600 font-semibold": isActive(
                              pathname,
                              sub.href ?? ""
                            ),
                          }
                        )}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={link.name}
              href={link.href || "/"}
              className={clsx(
                "flex items-center gap-2 rounded-md p-3 text-sm hover:bg-green-50 2xl:w-full",
                {
                  "bg-green-500 hover:bg-green-500 text-white": isActive(
                    pathname,
                    link.href ?? ""
                  ),
                  "xl:w-full": isHovered,
                }
              )}
            >
              <link.icon />
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

      {/* Logout Button */}
      <form action={handleSignOut}>
        <button
          className={clsx(
            "flex items-center gap-2 rounded-md p-3 text-sm hover:bg-green-50 2xl:w-full mt-auto",
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
              "xl:hidden": !isHovered,
            })}
          >
            Log Out
          </p>
        </button>
      </form>
    </div>
  );
};

export default Sidebar;
