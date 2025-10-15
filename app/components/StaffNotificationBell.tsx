"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PiBellThin } from "react-icons/pi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StaffNotificationList from "./StaffNotificationList";
import { useUserNotifications } from "../hooks/useUserNotifications";
import { Notification } from "@/lib/interfaces";
import { useSession } from "next-auth/react";

interface NotificationBellProps {
  userId?: string;
  userRole?: string;
}

const StaffNotificationBell = ({ userId, userRole }: NotificationBellProps) => {
  const { data: session } = useSession();
  const { notifications, connectionStatus, setNotifications } =
    useUserNotifications(session?.user?.id);
  const [dropdown, setDropdown] = useState(false);
  const [flashBell, setFlashBell] = useState(false);
  const bellRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const prevNotificationIdsRef = useRef<Set<number>>(new Set());
  const audioEnabledRef = useRef(false);

  // Unlock audio on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioEnabledRef.current) {
        audioEnabledRef.current = true;
        console.log("🔊 Audio unlocked! Notifications can now ring.");
        setFlashBell(false);
      }
    };

    document.addEventListener("click", unlockAudio, { once: true });
    document.addEventListener("keypress", unlockAudio, { once: true });

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keypress", unlockAudio);
    };
  }, []);

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
      try {
        const response = await fetch("/api/notifications");
        const data = await response.json();
        setNotifications(data);

        const initialIds = new Set<number>(
          data
            .filter(
              (n: Notification) =>
                !(userRole === "Pharmacist_Staff" && n.type === "ORDER_REQUEST")
            )
            .map((n: Notification) => n.id as number)
        );

        prevNotificationIdsRef.current = initialIds;
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (userId) fetchNotification();
  }, [userId, setNotifications, userRole]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Handle new notifications (sound + flash)
  useEffect(() => {
    if (notifications.length === 0) return;

    const currentIds = new Set<number>(
      notifications.map((n) => n.id as number)
    );

    const newNotificationIds = [...currentIds].filter(
      (id) => !prevNotificationIdsRef.current.has(id)
    );

    if (newNotificationIds.length > 0) {
      const newNotifications = notifications.filter((n) =>
        newNotificationIds.includes(n.id)
      );

      const isPharmacist = userRole === "Pharmacist_Staff";

      const shouldRing =
        (isPharmacist &&
          newNotifications.some(
            (n) => n.type === "ORDER_REQUEST" || n.type === "PAYMENT_PROCESSED"
          )) ||
        (!isPharmacist &&
          newNotifications.some((n) => n.type === "ORDER_RECEIVED"));

      if (shouldRing) {
        if (audioEnabledRef.current && audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.loop = true;
          audioRef.current
            .play()
            .catch((err) => console.error("Failed to play sound:", err));
        } else if (isPharmacist) {
          setFlashBell(true);
        }
      }
    }

    prevNotificationIdsRef.current = currentIds;
  }, [notifications, userRole]);

  // Stop sound when all notifications are read
  useEffect(() => {
    if (audioRef.current && unreadCount === 0) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.loop = false;
    }
  }, [unreadCount]);

  const handleBellClick = async () => {
    setDropdown((prev) => !prev);

    if (unreadCount > 0) {
      try {
        const res = await fetch("/api/notifications/mark-read", {
          method: "POST",
        });
        if (res.ok) {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.loop = false;
          }
          setFlashBell(false);
        }
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  return (
    <div ref={bellRef} className="relative flex items-center mr-8">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className={`mr-text-2xl cursor-pointer p-2 rounded-full relative 
              hover:bg-gray-200 ${dropdown ? "bg-gray-200" : "bg-white"} ${
                flashBell ? "animate-pulse bg-red-100" : ""
              }`}
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
            <p>Notifications ({connectionStatus})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <StaffNotificationList
        dropdown={dropdown}
        notifications={notifications}
        connectionStatus={connectionStatus}
        userRole={userRole ?? ""}
      />

      <audio ref={audioRef} src="/sounds/bell.mp3" preload="auto" />
    </div>
  );
};

export default StaffNotificationBell;
