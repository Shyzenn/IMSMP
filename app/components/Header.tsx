"use client";

import MobileMenu from "./MobileMenu";
import { useSession } from "next-auth/react";
import { PiBellThin } from "react-icons/pi";
import { memo, useEffect, useMemo, useState } from "react";
import NotificationList from "./NotificationList";
import { usePharmacistNotifications } from "../hooks/usePharmacistNotifications";
import WalkInOrder from "./WalkInOrder";
import Image from "next/image";
import PharmacyIcon from "@/public/macoleens_logo.png";
import HeaderLinks from "./HeaderLinks";
import ProfileDropdown from "./ProfileDropdown";

const Header = () => {
  const { data: session } = useSession();
  const { notifications, setNotifications, connectionStatus } =
    usePharmacistNotifications(session?.user.id, session?.user.role);

  const MemoMobileMenu = memo(MobileMenu);

  const [dropdown, setDropdown] = useState(false);

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
    <div className="flex justify-between items-center mx-10 py-8 relative">
      <Image
        src={PharmacyIcon}
        alt="Macoleen's Pharmacy Icon"
        width={150}
        height={150}
        className="hidden xl:block"
      />{" "}
      <MemoMobileMenu />
      <HeaderLinks session={session} />
      <div className="flex items-center relative">
        {session?.user.role === "Pharmacist_Staff" && (
          <>
            <WalkInOrder />
            <div className="relative flex items-center mr-8">
              {/*Notification*/}
              <button
                className="mr-text-2xl cursor-pointer8 bg-white p-2 rounded-full relative"
                tabIndex={0}
                aria-label="Notifications"
                onClick={handleBellClick}
              >
                <PiBellThin className="text-2xl" />
                {unreadCount > 0 && (
                  <div className="absolute bg-red-500 w-4 h-4 rounded-full -top-1 right-0 text-white text-center text-[10px]">
                    {unreadCount}
                  </div>
                )}
              </button>
              <NotificationList
                dropdown={dropdown}
                notifications={notifications}
                connectionStatus={connectionStatus}
              />
            </div>
          </>
        )}
        <ProfileDropdown session={session} />
      </div>
    </div>
  );
};

export default Header;
