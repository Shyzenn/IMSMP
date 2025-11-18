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
  const isInitialLoadCompleteRef = useRef(false);
  const hasInitialFetchStartedRef = useRef(false);

  // Unlock audio on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioEnabledRef.current) {
        audioEnabledRef.current = true;
        console.log("🔊 Audio unlocked! Notifications can now ring.");
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
      if (hasInitialFetchStartedRef.current) return;
      hasInitialFetchStartedRef.current = true;

      try {
        const response = await fetch("/api/notifications");
        const data = await response.json();

        const initialIds = new Set<number>(
          data
            .filter(
              (n: Notification) =>
                !(userRole === "Pharmacist_Staff" && n.type === "ORDER_REQUEST")
            )
            .map((n: Notification) => n.id as number)
        );

        // Set the ref FIRST before updating notifications
        prevNotificationIdsRef.current = initialIds;

        // Mark initial load as complete BEFORE setting notifications
        isInitialLoadCompleteRef.current = true;

        // Now set notifications
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        isInitialLoadCompleteRef.current = true;
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
    // Skip if initial load not complete or no notifications
    if (!isInitialLoadCompleteRef.current || notifications.length === 0) {
      return;
    }

    const currentIds = new Set<number>(
      notifications.map((n) => n.id as number)
    );

    // If prevNotificationIdsRef is empty, this is the first time setting notifications
    // after the component mounted - treat these as initial, not new
    if (prevNotificationIdsRef.current.size === 0) {
      prevNotificationIdsRef.current = currentIds;
      return;
    }

    const newNotificationIds = [...currentIds].filter(
      (id) => !prevNotificationIdsRef.current.has(id)
    );

    if (newNotificationIds.length > 0) {
      const newNotifications = notifications.filter((n) =>
        newNotificationIds.includes(n.id)
      );

      const isPharmacist = userRole === "Pharmacist_Staff";

      const shouldRing =
        isPharmacist &&
        newNotifications.some(
          (n) => n.type === "ORDER_REQUEST" || n.type === "PAYMENT_PROCESSED"
        );

      // Only ring/flash if there are actually UNREAD notifications
      const hasUnreadNew = newNotifications.some((n) => !n.read);

      if (shouldRing && hasUnreadNew) {
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

  // Stop sound and flash when all notifications are read
  useEffect(() => {
    if (unreadCount === 0) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.loop = false;
      }
      setFlashBell(false);
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
    <div ref={bellRef} className="relative flex items-center">
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
              {unreadCount > 0 ? (
                <div className="absolute bg-red-500 w-4 h-4 rounded-full -top-1 right-0 text-white text-center text-[10px]">
                  {unreadCount}
                </div>
              ) : null}
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
