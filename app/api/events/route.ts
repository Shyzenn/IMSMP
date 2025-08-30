import { NextRequest } from "next/server";
import { addClient, removeClient } from "@/lib/sse";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return new Response("Missing userId", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      addClient(userId, controller);

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message: "Connected to SSE" })}\n\n`));

      // Cleanup on disconnect
      req.signal.addEventListener("abort", () => {
        removeClient(userId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
