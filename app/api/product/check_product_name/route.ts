import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get("name");
  const strength = searchParams.get("strength");
  const excludeProductId = searchParams.get("excludeProductId");

  if (!name) {
    return NextResponse.json({ exists: false });
  }

  const existingProduct = await db.product.findFirst({
    where: {
      product_name: {
        equals: name.trim(),
      },
      ...(strength
        ? {
            strength: {
              equals: strength.trim(),
            },
          }
        : {
            OR: [{ strength: null }, { strength: "" }],
          }),
      ...(excludeProductId && {
        id: {
          not: parseInt(excludeProductId),
        },
      }),
    },
  });

  return NextResponse.json({ exists: !!existingProduct });
}
