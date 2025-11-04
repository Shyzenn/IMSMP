"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { auth } from "@/auth";

export async function createAuditLog(
  userId: string,
  action: string,
  entityType: string,
  entityId: number,
  description: string
) {
  await db.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      description,
    },
  });
}

export async function archiveProduct(productId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const product = await db.product.findUnique({where : {id: productId}})
    if (!product) throw new Error("Product not found");

    await db.product.update({
      where: { id: productId },
      data: {
        status: "ARCHIVED",
        archiveAt: new Date(),
        archivedById: session.user.id
      },
    });

    await createAuditLog(
      session.user.id,
      "ARCHIVE_PRODUCT",
      "PRODUCT",
      productId,
      `Product ${product.product_name} archived by ${session?.user?.username}`
    );

    revalidatePath("/inventory/products");

    return { success: true, message: "Product archived successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to archive product",
    };
  }
}

export async function archiveBatch(id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const batch = await db.productBatch.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!batch) throw new Error("Batch not found");

    await db.productBatch.update({
      where: { id },
      data: {
        type: "ARCHIVED",
        archiveAt: new Date(),
        archivedById: session.user.id
      },
    });

    await createAuditLog(
      session.user.id,
      "ARCHIVE_BATCH",
      "PRODUCT",
      id,
      `Batch ${batch.batchNumber} of ${batch.product.product_name} archived by ${session?.user?.username}`
    );

    revalidatePath("/inventory/batches");

    return { success: true, message: "Batch archived successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to archive batch",
    };
  }
}

export async function restoreProduct(productId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    
    const product = await db.product.findUnique({where : {id: productId}})
    if (!product) throw new Error("Product not found");

    await db.product.update({
      where: { id: productId },
      data: {
        status: "ACTIVE",
        archiveAt: null,
      },
    });

    await createAuditLog(
      session.user.id,
      "RESTORE_PRODUCT",
      "PRODUCT",
      productId,
      `Product ${product.product_name} restored by ${session?.user?.username}`
    );

    revalidatePath("/manager_archive");

    return { success: true, message: "Product restored successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to restore product",
    };
  }
}

export async function restoreBatch(id: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const batch = await db.productBatch.findUnique({
      where: {id},
      include: { product: true }
    })
    if (!batch) throw new Error("Batch not found");

    await db.productBatch.update({
      where: { id },
      data: {
        type: "ACTIVE",
        archiveAt: null,
      },
    });

    await createAuditLog(
      session.user.id,
      "RESTORE_BATCH",
      "PRODUCT",
      id,
      `Batch ${batch.batchNumber} of ${batch.product.product_name} restored by ${session?.user?.username}`
    );

    revalidatePath("/manager_archive");

    return { success: true, message: "Batch restored successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to restore batch",
    };
  }
}
