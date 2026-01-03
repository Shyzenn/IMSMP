import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || !session.user.id) {
    return NextResponse.json({ message: "Unauthorize" }, { status: 401 });
  }

  try {
    const balances = await db.orderRequest.groupBy({
      by: ["patientId"],
      where: {
        status: { in: ["pending", "for_payment"] },
      },
      _sum: {
        totalAmount: true,
      },
      _count: { id: true },
    });

    const patientIds = balances.map((b) => b.patientId);

    // get patients details
    const patients = await db.patient.findMany({
      where: {
        id: { in: patientIds },
      },
      select: {
        id: true,
        patientName: true,
        patientNumber: true,
      },
    });

    const result = patients.map((patient) => {
      // find the patients balance per record
      const balance = balances.find((b) => b.patientId === patient.id);

      return {
        ...patient,
        totalBalance: balance?._sum.totalAmount ?? 0,
        unpaidOrders: balance?._count.id,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET PATIENTS ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
