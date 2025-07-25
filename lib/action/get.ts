'use server'

import { Decimal } from "@prisma/client/runtime/library";
import { Category, Prisma } from "@prisma/client";
import { db } from "../db";
import { OrderItem } from "../interfaces";
import formatStatus, { isRequestOrderFilterEnabled, isWalkInFilterEnabled, ITEMS_PER_PAGE, mapStatus, TransactionFilter } from "../utils";

type CombinedTransaction = {
  id: number;
  customer: string;
  quantity: number;
  price: number;
  total: number;
  status: string;
  createdAt: Date;
  source: "Walk In" | "Request Order";
  orderItems: OrderItem[]
};

// Transaction
export const getTransactionList = async (
  query: string,
  currentPage: number,
  filter: string,
  sortBy: string = "createdAt", 
  sortOrder: "asc" | "desc" = "desc"
): Promise<CombinedTransaction[]> => {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;
  const safeQuery = typeof query === "string" ? query.toLowerCase().trim() : "";

  const statusFilter = mapStatus(filter as TransactionFilter);

  const whereRequestOrder: Prisma.OrderRequestWhereInput = {
    AND: [
      query && { patient_name: { contains: safeQuery } },
      statusFilter && { status: statusFilter },
    ].filter(Boolean) as Prisma.OrderRequestWhereInput[],
  };

  const whereWalkIn: Prisma.WalkInTransactionWhereInput = {
    AND: [
      query && { customer_name: { contains: safeQuery } },
      statusFilter && { status: statusFilter },
    ].filter(Boolean) as Prisma.WalkInTransactionWhereInput[],
  };

  const includeWalkIn = isWalkInFilterEnabled(filter as TransactionFilter);
  const includeRequest = isRequestOrderFilterEnabled(filter as TransactionFilter);

  const validSortFields = ["customer", "createdAt", "quantity", "total"];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const safeSortByRequest = sortBy === "customer_name" ? "patient_name" : safeSortBy;
  const safeSortByWalkIn = sortBy === "customer_name" ? "customer_name" : safeSortBy;
  const dbSortableFields = ["createdAt", "customer_name"];
  const isDbSortable = dbSortableFields.includes(sortBy);

  const [requestOrders, walkinOrders] = await Promise.all([
    includeRequest
      ? db.orderRequest.findMany({
          where: whereRequestOrder,
          include: {
            items: { include: { product: true } },
          },
          orderBy: isDbSortable ? { [safeSortByRequest]: sortOrder } : { createdAt: "desc" },
        })
      : Promise.resolve([]),
    includeWalkIn
      ? db.walkInTransaction.findMany({
          where: whereWalkIn,
          include: {
            items: { include: { product: true } },
          },
          orderBy: isDbSortable ? { [safeSortByWalkIn]: sortOrder } : { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const formattedWalkIn = walkinOrders.map((tx) => ({
    id: tx.id,
    customer: tx.customer_name?.trim() || "Unknown",
    createdAt: tx.createdAt,
    status: formatStatus(tx.status),
    source: "Walk In" as const,
    quantity: tx.items.reduce((sum, item) => sum + item.quantity, 0),
    price: tx.items.reduce((sum, item) => sum + item.price.toNumber(), 0),
    total: tx.totalAmount.toNumber(),
    orderItems: tx.items.map((item) => ({
      productName: item.product.product_name,
      quantity: item.quantity,
      price: item.price.toNumber(),
    })),
  }));

  const formattedRequest = requestOrders.map((tx) => ({
    id: tx.id,
    customer: tx.patient_name || "Unknown",
    createdAt: tx.createdAt,
    status: formatStatus(tx.status),
    source: "Request Order" as const,
    quantity: tx.items.reduce((sum, item) => sum + item.quantity, 0),
    price: tx.items.reduce((sum, item) => sum + item.product.price.toNumber(), 0),
    total: tx.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price.toNumber(),
      0
    ),
    orderItems: tx.items.map((item) => ({
      productName: item.product.product_name,
      quantity: item.quantity,
      price: item.product.price.toNumber(),
    })),
  }));

  const combined = [...formattedWalkIn, ...formattedRequest];

  const sorted = combined.sort((a, b) => {
    let fieldA: string | number | Date;
    let fieldB: string | number | Date;

    switch (sortBy) {
      case "customer_name":
        fieldA = a.customer.toLowerCase();
        fieldB = b.customer.toLowerCase();
        break;
      case "createdAt":
        fieldA = a.createdAt;
        fieldB = b.createdAt;
        break;
      case "quantity":
        fieldA = a.quantity;
        fieldB = b.quantity;
        break;
      case "total":
        fieldA = a.total;
        fieldB = b.total;
        break;
      default:
        fieldA = a.createdAt;
        fieldB = b.createdAt;
    }

    if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted.slice(skip, skip + ITEMS_PER_PAGE);
};

export async function fetchTransactionPages(query: string, filter: string) {
  const safeQuery = query.toLowerCase().trim();
  const statusFilter = mapStatus(filter as TransactionFilter);

  const whereRequestOrder: Prisma.OrderRequestWhereInput = {
    AND: [
      query && { patient_name: { contains: safeQuery } },
      statusFilter && { status: statusFilter },
    ].filter(Boolean) as Prisma.OrderRequestWhereInput[],
  };

  const whereWalkIn: Prisma.WalkInTransactionWhereInput = {
    AND: [
      query && { customer_name: { contains: safeQuery } },
      statusFilter && { status: statusFilter },
    ].filter(Boolean) as Prisma.WalkInTransactionWhereInput[],
  };

  let total: number;

  if (filter === "walk_in") {
    total = await db.walkInTransaction.count({ where: whereWalkIn });
  } else if (filter === "request_order") {
    total = await db.orderRequest.count({ where: whereRequestOrder });
  } else {
    const [walkinCount, requestCount] = await Promise.all([
      isWalkInFilterEnabled(filter as TransactionFilter)
        ? db.walkInTransaction.count({ where: whereWalkIn })
        : Promise.resolve(0),
      isRequestOrderFilterEnabled(filter as TransactionFilter)
        ? db.orderRequest.count({ where: whereRequestOrder })
        : Promise.resolve(0),
    ]);
    total = walkinCount + requestCount;
  }

  return Math.ceil(total / 14);
}



//Inventory
export const getProductList = async (
  query: string,
  currentPage: number,
  filter: string,
  sortBy: string = "createdAt", 
  sortOrder: "asc" | "desc" = "desc"
) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const where: Prisma.ProductWhereInput = {
    product_name: {
      contains: query,
    },
  };

  if (
    filter &&
    filter !== "latest" &&
    filter !== "oldest" &&
    filter !== "all" &&
    Object.values(Category).includes(filter as Category)
  ) {
    where.category = filter as Category;
  }

  const validSortFields = ["product_name", "price", "quantity", "createdAt", "expiryDate"];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  const products = await db.product.findMany({
    where,
    select: {
      id: true,
      product_name: true,
      price: true,
      quantity: true,
      category: true,
      releaseDate: true,
      expiryDate: true,
      createdAt: true,
    },
    orderBy: {
      [safeSortBy]: sortOrder,
    },
    take: ITEMS_PER_PAGE,
    skip: offset,
  });

  const mappedProducts = products.map((p) => ({
    ...p,
    price: p.price instanceof Decimal ? p.price.toNumber() : Number(p.price),
    icon: [],
  }));

  return mappedProducts;
};

export async function fetchProductsPages(query: string, filter: string) {
  try {
    const where: Prisma.ProductWhereInput = {
      product_name: {
        contains: query,
      },
    };

    // Apply category if valid
    if (
      filter &&
      filter !== "latest" &&
      filter !== "oldest" &&
      filter !== "all"
    ) {
      where.category = filter as Category;
    }

    const totalProducts = await db.product.count({ where });

    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of products.");
  }
}

export async function getProductById(id:number) {
    try{
        const product = await db.product.findUnique({
            where:{id}
        })
        if(product){
            return product
        } else {
            return {error: "Product not found"}
        }
    } catch (error){
        console.error("Error fetching products", error)
        return {error: "An error occurred while fetching product"}
    }
}
  






