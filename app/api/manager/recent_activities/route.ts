import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {

    const session = await auth();
  
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
  

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter");
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 4;

  let fromDate: Date | undefined;

  if (filter === "Today") {
    fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
  } else if (filter === "Yesterday") {
    fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 1);
    fromDate.setHours(0, 0, 0, 0);
  } else if (filter === "Last 7 days") {
    fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
  }

  const logs = await db.auditLog.findMany({
    where: fromDate ? { createdAt: { gte: fromDate } } : undefined,
    include: { user: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await db.auditLog.count({
    where: fromDate ? { createdAt: { gte: fromDate } } : undefined,
  });

  return NextResponse.json({ logs, total });
}
