import { useEffect, useRef, useState } from "react";
import { Notification } from "@/lib/interfaces";

export function usePharmacistNotifications(userId?: string, role?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!(userId && role === "Pharmacist_Staff")) return;

    const socket = new WebSocket("ws://localhost:4001");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "AUTH", userId }));
      setConnectionStatus("connected");
    };

    socket.onclose = () => {
      setConnectionStatus("disconnected");
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "NOTIFICATION") {
          const notification: Notification = {
            ...data.payload,
            id: Date.now().toString(),
            read: false,
          };
          setNotifications((prev) => [notification, ...prev]);
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    };

    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(`{"event":"ping"}`);
      }
    }, 29000);

    socketRef.current = socket;

    return () => {
      clearInterval(pingInterval);
      socketRef.current?.close();
    };
  }, [userId, role]);

  return { notifications, setNotifications, connectionStatus };
}