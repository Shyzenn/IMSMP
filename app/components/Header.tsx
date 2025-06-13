"use client";

import { AiOutlineUser } from "react-icons/ai";
import { usePathname } from "next/navigation";
import MobileMenu from "./MobileMenu";
import { useSession } from "next-auth/react";
import { capitalLetter, pageTitles } from "@/lib/utils";
import { PiBellThin } from "react-icons/pi";
import { memo, useEffect, useMemo, useState } from "react";
import NotificationList from "./NotificationList";
import { usePharmacistNotifications } from "../hooks/usePharmacistNotifications";

const Header = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { notifications, setNotifications, connectionStatus } =
    usePharmacistNotifications(session?.user.id, session?.user.role);

  const MemoMobileMenu = memo(MobileMenu);

  const [dropdown, setDropdown] = useState(false);

  const pageTitle = pageTitles[pathname] || "Dashboard";

  useEffect(() => {
    const fetchNotification = async () => {
      const response = await fetch("api/notifications");
      const data = await response.json();
      setNotifications(data);
    };

    if (session?.user.id) {
      fetchNotification();
    }
  }, [session?.user.id, setNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const handleBellClick = () => {
    setDropdown(!dropdown);

    if (unreadCount > 0) {
      fetch("api/notifications/mark-read", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div className="flex justify-between items-center shadow-md px-3 py-4 bg-white relative">
      <p className="hidden xl:block">{pageTitle}</p>
      <MemoMobileMenu />
      <div className="flex items-center relative">
        {session?.user.role === "Pharmacist_Staff" && (
          <div className="relative">
            {/*Notification*/}
            <PiBellThin
              className="mr-8 text-2xl cursor-pointer"
              onClick={() => handleBellClick()}
              role="button"
              tabIndex={0}
              aria-label="Notifications"
            />
            <NotificationList
              dropdown={dropdown}
              notifications={notifications}
              unreadCount={unreadCount}
              connectionStatus={connectionStatus}
            />
          </div>
        )}
        <div className="flex items-center gap-1">
          <AiOutlineUser className="text-2xl" />
          {session?.user.username
            ? capitalLetter(session.user.username)
            : "Unknown User"}
        </div>
      </div>
    </div>
  );
};

export default Header;
