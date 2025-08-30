import { useEffect, useState } from "react";
import { Notification } from "@/lib/interfaces";

export function usePharmacistNotifications(userId?: string, role?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected"
  >("disconnected");

  useEffect(() => {
    if (!userId || !role) return;

    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Fetch error:", err));

    // Live SSE connection (per-user)
    const eventSource = new EventSource(`/api/events?userId=${userId}`);

    eventSource.onopen = () => {
      setConnectionStatus("connected");
    };

    eventSource.onmessage = (event) => {
      console.log("🔔 SSE message:", event.data);
      try {
        const notif = JSON.parse(event.data);
        // prepend new notification
        setNotifications((prev) => [notif, ...prev]);
      } catch (e) {
        console.error("Invalid SSE data:", event.data);
        console.log(e)
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus("disconnected");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userId, role]);

  return { notifications, setNotifications, connectionStatus };
}
