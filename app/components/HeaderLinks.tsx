import { cashierLinks, managerLinks, pharmacistLinks } from "@/lib/links";
import { nurseLinks } from "@/lib/links";
import { isActive } from "@/lib/utils";
import { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const roleLinksMap: Record<string, { name: string; href: string }[]> = {
  Pharmacist_Staff: pharmacistLinks,
  Nurse: nurseLinks,
  Cashier: cashierLinks,
  Manager: managerLinks,
};

const HeaderLinks = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();
  const role = session?.user.role;

  const links = role ? roleLinksMap[role] : [];

  return (
    <ul className="bg-white rounded-full p-[5px] flex gap-8 py-[10px] sm:hidden xl:flex">
      {links?.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <li key={link.name} className="relative">
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
          </li>
        );
      })}
    </ul>
  );
};

export default HeaderLinks;
