import {
  cashierLinks,
  managerLinks,
  pharmacistLinks,
  nurseLinks,
} from "@/lib/links";
import { isActive } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Links } from "@/lib/interfaces";

const roleLinksMap: Record<string, Links[]> = {
  Pharmacist_Staff: pharmacistLinks,
  Nurse: nurseLinks,
  Cashier: cashierLinks,
  Manager: managerLinks,
};

const HeaderLinks = ({ userRole }: { userRole: string | null }) => {
  const pathname = usePathname();

  const links = userRole ? roleLinksMap[userRole] : [];

  return (
    <ul className="bg-white rounded-full p-[5px] lg:flex gap-8 py-[10px] hidden">
      {links?.map((link) => {
        const isSubActive =
          link.subLinks &&
          link.subLinks.some((sub) => isActive(pathname, sub.href));

        const active =
          !link.subLinks || link.subLinks.length === 0
            ? isActive(pathname, link.href ?? "")
            : isSubActive;

        return (
          <li key={link.name} className="relative group">
            {!link.subLinks || link.subLinks.length === 0 ? (
              <Link
                href={link.href || "/"}
                className={`px-6 py-2 rounded-full text-sm transition-colors duration-300 relative hover:text-green-600
                  ${active ? "text-green-600 font-medium" : "text-gray-600"}
                  after:absolute after:left-1/2 after:bottom-1 after:h-[2px] 
                  after:bg-green-600 after:transition-all after:duration-300 
                  after:ease-in-out ${
                    active
                      ? "after:w-1/2 after:-translate-x-1/2"
                      : "after:w-0 after:-translate-x-1/2"
                  }`}
              >
                {link.name}
              </Link>
            ) : (
              <>
                <span
                  className={`px-6 py-2 rounded-full text-sm cursor-pointer transition-colors duration-300 
                    ${active ? "text-green-600 font-medium" : "text-gray-600"}`}
                >
                  {link.name}
                </span>

                <ul className="absolute left-0 top-full mt-4 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {link.subLinks.map((sub) => {
                    const subActive = isActive(pathname, sub.href);
                    return (
                      <li key={sub.name}>
                        <Link
                          href={sub.href}
                          className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                            subActive
                              ? "bg-green-100 text-green-700 font-medium"
                              : "text-gray-700  hover:text-green-700"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default HeaderLinks;
