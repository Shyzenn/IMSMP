"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher/client";
import type { Notification } from "@/lib/interfaces";

export function useUserNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");

  useEffect(() => {
    if (!userId) return;

    const channel = pusherClient.subscribe(`private-user-${userId}`);

    channel.bind("pusher:subscription_succeeded", () => {
      setConnectionStatus("connected");
    });

    channel.bind("pusher:subscription_error", () => {
      setConnectionStatus("disconnected");
    });

    channel.bind("new-notification", (data: Notification) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      pusherClient.unsubscribe(`private-user-${userId}`);
      setConnectionStatus("disconnected");
    };
  }, [userId]);

  return { notifications, setNotifications, connectionStatus };
}

