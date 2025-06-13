import { WebSocketServer, WebSocket } from "ws";

type ClientMap = Map<string, WebSocket>;

const clients: ClientMap = new Map();

const wss = new WebSocketServer({ port: 4001 });

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message: string | Buffer, isBinary: boolean) => {
    try {
      const parsed = JSON.parse(message.toString());

      if (parsed.type === "AUTH" && parsed.userId) {
        clients.set(parsed.userId, ws);
         clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && (message.toString() !== `{"event":"ping"}`)) {
          client.send(message, { binary: isBinary });
        }
      });
      }
    } catch (error) {
      console.error("Invalid WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    for (const [userId, socket] of clients.entries()) {
      if (socket === ws) {
        clients.delete(userId);
        break;
      }
    }
  });
});

export function sendNotification(userId: string, notification: object) {
  const client = clients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify({ type: "NOTIFICATION", payload: notification }));
  }
}