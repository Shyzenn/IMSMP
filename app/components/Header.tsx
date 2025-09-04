"use client";

import MobileMenu from "./MobileMenu";
import { useSession } from "next-auth/react";
import { PiBellThin } from "react-icons/pi";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import NotificationList from "./NotificationList";
import { usePharmacistNotifications } from "../hooks/usePharmacistNotifications";
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

const Header = () => {
  const { data: session } = useSession();
  const userRole = session?.user.role;
  const { notifications, setNotifications, connectionStatus } =
    usePharmacistNotifications(session?.user.id, session?.user.role);

  const MemoMobileMenu = memo(MobileMenu);

  const [dropdown, setDropdown] = useState(false);
  const prevNotificationsCount = useRef(0);

  // audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchNotification = async () => {
      const response = await fetch("api/notifications");
      const data = await response.json();
      setNotifications(data);
      prevNotificationsCount.current = data.length; // set initial count
    };

    if (session?.user.id) {
      fetchNotification();
    }
  }, [session?.user.id, setNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Play bell sound when new notification arrives
  useEffect(() => {
    if (userRole === "Pharmacist_Staff" && notifications.length > 0) {
      const hasUnread = notifications.some((n) => !n.read);
      if (hasUnread && audioRef.current) {
        audioRef.current.loop = true; // keep ringing until cleared
        audioRef.current.play().catch(() => {});
      }
    }
  }, [notifications, userRole]);

  // Stop the loop when notifications are marked read
  useEffect(() => {
    if (
      userRole === "Pharmacist_Staff" &&
      unreadCount === 0 &&
      audioRef.current
    ) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // reset
    }
  }, [unreadCount, userRole]);

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
      />
      <MemoMobileMenu />
      <HeaderLinks session={session} />
      <div className="flex items-center relative">
        {userRole === "Pharmacist_Staff" && <WalkInOrder />}

        {(userRole === "Pharmacist_Staff" || userRole === "Manager") && (
          <div className="relative flex items-center mr-8">
            {/* Notification */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`mr-text-2xl cursor-pointer p-2 rounded-full relative 
              hover:bg-gray-200 ${dropdown ? "bg-gray-200" : "bg-white"}`}
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
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <NotificationList
              dropdown={dropdown}
              notifications={notifications}
              connectionStatus={connectionStatus}
            />

            {/* Hidden audio element */}
            <audio ref={audioRef} src="/sounds/bell.mp3" preload="auto" />
          </div>
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
