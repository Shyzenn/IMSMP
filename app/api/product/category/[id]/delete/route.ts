import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {

    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;

    const { id } = await context.params;
    const categoryId = Number(id);

    const existingCategory = await db.productCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const productsUsingCategory = await db.product.findMany({
      where: { categoryId },
      select: { id: true, product_name: true },
    });

    if (productsUsingCategory.length > 0) {
      return NextResponse.json(
        {
          hasProducts: true,
          message:
            "This category is used by existing products. You can’t delete it directly.",
          products: productsUsingCategory,
        },
        { status: 400 }
      );
    }

    const productCategory = await db.productCategory.delete({
      where: { id: categoryId },
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "Deleted Category",
        entityType: "Product",
        description: `User ${session.user.username} (${session.user.role}) deleted a product category "${productCategory.name}".`,
      },
    });

    return NextResponse.json(
      { message: "Category deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category. Please try again." },
      { status: 500 }
    );
  }
}