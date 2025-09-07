"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PiBellThin } from "react-icons/pi";
import NotificationList from "./NotificationList";
import { usePharmacistNotifications } from "../hooks/usePharmacistNotifications";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NotificationBellProps {
  userId?: string;
  userRole?: string;
}

const NotificationBell = ({ userId, userRole }: NotificationBellProps) => {
  const { notifications, setNotifications, connectionStatus } =
    usePharmacistNotifications(userId, userRole);

  const [dropdown, setDropdown] = useState(false);
  const bellRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevNotificationsCount = useRef(0);

  // Close dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotification = async () => {
      const response = await fetch("api/notifications");
      const data = await response.json();
      setNotifications(data);
      prevNotificationsCount.current = data.length;
    };

    if (userId) fetchNotification();
  }, [userId, setNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Play sound when new notification arrives
  useEffect(() => {
    if (userRole === "Pharmacist_Staff" && notifications.length > 0) {
      const hasUnread = notifications.some((n) => !n.read);
      if (hasUnread && audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => {});
      }
    }
  }, [notifications, userRole]);

  // Stop sound when all read
  useEffect(() => {
    if (
      userRole === "Pharmacist_Staff" &&
      unreadCount === 0 &&
      audioRef.current
    ) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [unreadCount, userRole]);

  const handleBellClick = () => {
    setDropdown((prev) => !prev);

    if (unreadCount > 0) {
      fetch("api/notifications/mark-read", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  return (
    <div ref={bellRef} className="relative flex items-center mr-8">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`mr-text-2xl cursor-pointer p-2 rounded-full relative 
              hover:bg-gray-200 ${dropdown ? "bg-gray-200" : "bg-white"}`}
              onClick={handleBellClick}
              aria-label="Notifications"
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
  );
};

export default NotificationBell;
