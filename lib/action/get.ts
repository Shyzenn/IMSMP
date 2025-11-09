'use server'

import { Decimal } from "@prisma/client/runtime/library";
import { OrderType, Prisma, Status } from "@prisma/client";
import { db } from "../db";
import { OrderItem } from "../interfaces";
import { dateFilter, isRequestOrderFilterEnabled, isWalkInFilterEnabled, ITEMS_PER_PAGE, mapStatus, TransactionFilter } from "../utils";

export type ArchiveItem =
  | {
      id: number;
      type: "Product";
      product_name: string;
      category: string;
      quantity: number;
      archivedAt: Date | null;
      archivedBy: string;
    }
  | {
      id: number;
      type: "Product Batch";
      product_name: string;
      category: string;
      batchNumber: number | string;
      quantity: number;
      releaseDate: Date;
      expiryDate: Date;
      archivedAt: Date | null;
      archivedBy: string;
    }
  | {
      id: number;
      type: "Order Request";
      product_name: string;
      category: string; 
      quantity: number;
      archivedAt: Date | null;
      archivedBy: string;
    };

export const getArchive = async (
  query: string,
  currentPage: number,
  filter: string
): Promise<ArchiveItem[]> => {
  try {
    const safePage = Number(currentPage) || 1;
    const safeQuery = (query || "").toLowerCase().trim();

    let archivedProducts: Prisma.ProductGetPayload<{
      include: { 
        category: true; 
        batches: { select: { quantity: true } };
        archivedByUser: { select: { username: true; firstName: true; lastName: true } };
      };
    }>[] = [];

    let archivedBatches: Prisma.ProductBatchGetPayload<{
      include: { 
        product: { include: { category: true } };
        archivedByUser: { select: { username: true; firstName: true; lastName: true } };
      };
    }>[] = [];

    let archivedOrders: Prisma.OrderRequestGetPayload<{
      include: { 
        user: true; 
        items: true;
        archivedByUser: { select: { username: true; firstName: true; lastName: true } };
      };
    }>[] = [];

    if (filter === "all" || filter === "Product") {
      archivedProducts = await db.product.findMany({
        where: {
          status: "ARCHIVED",
          ...(safeQuery && {
            product_name: { contains: safeQuery },
          }),
        },
        include: {
          category: true,
          batches: { select: { quantity: true } },
          archivedByUser: { 
            select: { 
              username: true,
              firstName: true,
              lastName: true,
            } 
          },
        },
        orderBy: { archiveAt: "desc" },
      });
    }

    if (filter === "all" || filter === "Product Batch") {
      archivedBatches = await db.productBatch.findMany({
        where: {
          type: "ARCHIVED",
          ...(safeQuery && {
            product: { product_name: { contains: safeQuery } },
          }),
        },
        include: { 
          product: { include: { category: true } },
          archivedByUser: { 
            select: { 
              username: true,
              firstName: true,
              lastName: true,
            } 
          },
        },
        orderBy: { archiveAt: "desc" },
      });
    }

    if (filter === "all" || filter === "Order Request") {
      archivedOrders = await db.orderRequest.findMany({
        where: {
          isArchived: true,
          ...(safeQuery && {
            patient_name: { contains: safeQuery },
          }),
        },
        include: { 
          user: true, 
          items: true,
          archivedByUser: { 
            select: { 
              username: true,
              firstName: true,
              lastName: true,
            } 
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    const formatUserName = (user: { username: string; firstName: string | null; lastName: string | null } | null) => {
      if (!user) return "Unknown";
      
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }
      
      return user.username;
    };

    const merged: ArchiveItem[] = [
      ...archivedProducts.map((p) => ({
        id: p.id,
        type: "Product" as const,
        product_name: p.product_name,
        category: p.category?.name || "None",
        quantity:
          p.batches?.reduce((sum, b) => sum + (b.quantity || 0), 0) || 0,
        archivedAt: p.archiveAt,
        archivedBy: formatUserName(p.archivedByUser),
      })),
      ...archivedBatches.map((b) => ({
        id: b.id,
        type: "Product Batch" as const,
        product_name: b.product.product_name,
        category: b.product.category?.name || "None",
        batchNumber: b.batchNumber,
        quantity: b.quantity,
        releaseDate: b.releaseDate,
        expiryDate: b.expiryDate,
        archivedAt: b.archiveAt,
        archivedBy: formatUserName(b.archivedByUser),
      })),
      ...archivedOrders.map((o) => ({
        id: o.id,
        type: "Order Request" as const,
        product_name: o.patient_name || "Unknown",
        category: `Room ${o.room_number || "N/A"}`,
        quantity: o.items?.length || 0,
        archivedAt: o.updatedAt,
        archivedBy: formatUserName(o.archivedByUser),
      })),
    ];

    // Sort newest first
    merged.sort((a, b) => {
      const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
      const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
      return dateB - dateA;
    });

    const offset = (safePage - 1) * ITEMS_PER_PAGE;
    return merged.slice(offset, offset + ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Error in getArchive:", error);
    return [];
  }
};


export const fetchArchivePages = async (
  query: string,
  filter: string
): Promise<number> => {
  try {
    const safeQuery = (query || "").toLowerCase().trim();

    const counts = await Promise.all([
      (filter === "all" || filter === "Product")
        ? db.product.count({
            where: {
              status: "ARCHIVED",
              ...(safeQuery && { product_name: { contains: safeQuery } }),
            },
          })
        : Promise.resolve(0),

      (filter === "all" || filter === "Product Batch")
        ? db.productBatch.count({
            where: {
              type: "ARCHIVED",
              ...(safeQuery && {
                product: { product_name: { contains: safeQuery } },
              }),
            },
          })
        : Promise.resolve(0),

      (filter === "all" || filter === "Order Request")
        ? db.orderRequest.count({
            where: {
              isArchived: true,
              ...(safeQuery && { patient_name: { contains: safeQuery } }),
            },
          })
        : Promise.resolve(0),
    ]);

    const [productCount, batchCount, orderCount] = counts;
    const totalCount = productCount + batchCount + orderCount;

    return Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  } catch (error) {
    console.error("Error in fetchArchivePages:", error);
    return 1;
  }
};

// Batches
export const getBatches = async (
  query: string,
  currentPage: number,
  filter: string,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
) => {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  const safeQuery = query.toLowerCase().trim();

  const where: Prisma.ProductBatchWhereInput = {
    product: {
      product_name: {
        contains: safeQuery,
      },
      status: "ACTIVE",
    },
  };

  const validSortFields: Record<string, keyof Prisma.ProductBatchOrderByWithRelationInput> = {
    product_name: "product",
    batchNumber: "batchNumber",
    quantity: "quantity",
    releaseDate: "releaseDate",
    expiryDate: "expiryDate",
    createdAt: "createdAt",
  };

  let orderBy: Prisma.ProductBatchOrderByWithRelationInput;
  if (sortBy === "product_name") {
    orderBy = { product: { product_name: sortOrder } };
  } else {
    orderBy = { [validSortFields[sortBy] || "createdAt"]: sortOrder };
  }

  const batches = await db.productBatch.findMany({
    where,
    orderBy,
    include: {
      product: { select: { product_name: true } },
    },
  });

  const now = new Date();
  const enriched = batches.map((batch) => {
    if (batch.type === "ARCHIVED") {
      return { ...batch, status: "ARCHIVED" as const };
    }

    let status: "Active" | "Expiring" | "Expired" | "Consumed" = "Active";

    if (batch.quantity === 0) {
      status = "Consumed";
    } else if (new Date(batch.expiryDate) < now) {
      status = "Expired";
    } else {
      const daysToExpire =
        (new Date(batch.expiryDate).getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysToExpire <= 31) status = "Expiring";
    }

    return { ...batch, status };
  });

  // Filter by status (support multiple statuses)
  const selectedStatusesParam = filter;
  const selectedStatuses = selectedStatusesParam?.split(",") || [];

  let filtered = enriched;
  if (selectedStatuses.length > 0 && selectedStatuses[0] !== "all") {
    filtered = enriched.filter((batch) => 
      selectedStatuses.includes(batch.status)
    );
  }

  // Apply pagination after filtering
  const paginatedBatches = filtered.slice(offset, offset + ITEMS_PER_PAGE);

  return paginatedBatches;
};

export async function fetchBatchPages(query: string, filter: string) {
  const safeQuery = query.toLowerCase().trim();

  try {
    const batches = await db.productBatch.findMany({
      where: {
        product: {
          product_name: {
            contains: safeQuery,
          },
          status: "ACTIVE"
        },
      },
      include: { product: true },
    });

    const now = new Date();
    const enriched = batches.map((batch) => {
      if (batch.type === "ARCHIVED") {
        return { ...batch, status: "ARCHIVED" as const };
      }

      let status: "Active" | "Expiring" | "Expired" | "Consumed" = "Active";

      if (batch.quantity === 0) {
        status = "Consumed";
      } else if (new Date(batch.expiryDate) < now) {
        status = "Expired";
      } else {
        const daysToExpire =
          (new Date(batch.expiryDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysToExpire <= 31) status = "Expiring";
      }

      return { ...batch, status };
    });

    // Filter by status (support multiple statuses)
    const selectedStatusesParam = filter;
    const selectedStatuses = selectedStatusesParam?.split(",") || [];

    let filtered = enriched;
    if (selectedStatuses.length > 0 && selectedStatuses[0] !== "all") {
      filtered = enriched.filter((batch) => 
        selectedStatuses.includes(batch.status)
      );
    }

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of batches.");
  }
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
    status: "ACTIVE",
    OR: [
      {
        product_name: {
          contains: query,
        },
      },
      {
        id: !isNaN(Number(query)) ? Number(query) : undefined, 
      },
    ],
  };

  const selectedCategoriesParam = filter; 
  const selectedCategories = selectedCategoriesParam?.split(",") || [];

  if (selectedCategories.length > 0 && selectedCategories[0] !== "all") {
    where.category = {
      name: {
        in: selectedCategories,
      },
    };
  }

  const databaseSortFields = ["id", "product_name", "price", "createdAt"];
  const isDatabaseSort = databaseSortFields.includes(sortBy);

  const products = await db.product.findMany({
    where,
    include: {
      batches: {
        where: {
          type: { not: "ARCHIVED" } 
        },
        orderBy: { expiryDate: "asc" },
      },
      category: true,
    },
    ...(isDatabaseSort && {
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
    ...(isDatabaseSort ? {
      take: ITEMS_PER_PAGE,
      skip: offset,
    } : {}),
  });

  let mappedProducts = products.map((p) => {
    const validBatches = p.batches.filter((b) => b.quantity > 0 && b.type !== "ARCHIVED");
    const totalQuantity = validBatches.reduce((sum, b) => sum + b.quantity, 0);
    const totalBatches = p.batches.length;

    const now = new Date();
    const threshold = new Date();
    threshold.setDate(now.getDate() + 31);

    const expiringSoonCount = validBatches.filter((b) => {
      const expiry = new Date(b.expiryDate);
      return expiry > now && expiry <= threshold;
    }).length;

    return {
      id: p.id,
      product_name: p.product_name,
      price: p.price instanceof Decimal ? p.price.toNumber() : Number(p.price),
      category: p.category?.name ?? "Uncategorized",
      createdAt: p.createdAt,
      totalQuantity,
      totalBatches,
      expiringSoonCount, 
      batches: validBatches,
      batchQuantity: validBatches.map((b) => b.quantity),
      status: p.status as "ACTIVE" | "ARCHIVED",
      icon: [],
    };
  });

  if (sortBy === "expiringSoon") {
  mappedProducts = mappedProducts.sort((a, b) =>
    sortOrder === "asc"
      ? a.expiringSoonCount - b.expiringSoonCount
      : b.expiringSoonCount - a.expiringSoonCount
  );
}

  if (!isDatabaseSort) {
    mappedProducts.sort((a, b) => {
      let compareValue = 0;

      if (sortBy === "totalQuantity") {
        compareValue = a.totalQuantity - b.totalQuantity;
      } else if (sortBy === "totalBatches") {
        compareValue = a.totalBatches - b.totalBatches;
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    return mappedProducts.slice(offset, offset + ITEMS_PER_PAGE);
  }

  return mappedProducts;
};

export async function fetchProductsPages(query: string, filter: string) {
  try {
    const where: Prisma.ProductWhereInput = {
      product_name: {
        contains: query,
      },
      status: "ACTIVE", 
    };

    const selectedCategoriesParam = filter;
    const selectedCategories = selectedCategoriesParam?.split(",") || [];

    if (selectedCategories.length > 0 && selectedCategories[0] !== "all") {
      where.category = {
        name: {
          in: selectedCategories,
        },
      };
    }

    const totalProducts = await db.product.count({ where });
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of products.");
  }
}

// Audit
export const getAuditLogList = async (
  query: string = "",
  filter: string = "all",
  currentPage: number = 1,
  dateRange: { to: string; from: string }
) => {
  const page = Number.isFinite(Number(currentPage)) ? Number(currentPage) : 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const safeQuery = query.toLowerCase().trim();

  // Parse multiple filters
  const selectedFiltersParam = filter;
  const selectedFilters = selectedFiltersParam
    ?.split(",")
    .filter(Boolean)
    .map(f => f.trim()) || [];

  const buildWhere = (): Prisma.AuditLogWhereInput => {
    const conditions: Prisma.AuditLogWhereInput[] = [];

    // Search query
    if (safeQuery) {
      conditions.push({
        OR: [
          { action: { contains: safeQuery } },
          { description: { contains: safeQuery } },
          { entityType: { contains: safeQuery } },
          { user: { username: { contains: safeQuery } } },
        ],
      });
    }

    // Entity type filters (support multiple)
    if (selectedFilters.length > 0 && !selectedFilters.includes("all")) {
      conditions.push({
        entityType: { in: selectedFilters },
      });
    }

    // Date filter
    const dateCondition = dateFilter(dateRange);
    if (dateCondition) {
      conditions.push(dateCondition);
    }

    if (conditions.length === 0) {
      return {};
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
  };

  const where = buildWhere();

  return db.auditLog.findMany({
    where,
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: ITEMS_PER_PAGE,
    skip: offset,
  });
};

export async function fetchAuditPages(
  query: string,
  filter: string = "all",
  dateRange: { to: string; from: string }
) {
  const safeQuery = query.toLowerCase().trim();

  // Parse multiple filters
  const selectedFiltersParam = filter;
  const selectedFilters = selectedFiltersParam
    ?.split(",")
    .filter(Boolean)
    .map(f => f.trim()) || [];

  const buildWhere = (): Prisma.AuditLogWhereInput => {
    const conditions: Prisma.AuditLogWhereInput[] = [];

    // Search query
    if (safeQuery) {
      conditions.push({
        OR: [
          { action: { contains: safeQuery } },
          { description: { contains: safeQuery } },
          { entityType: { contains: safeQuery } },
          { user: { username: { contains: safeQuery } } },
        ],
      });
    }

    // Entity type filters (support multiple)
    if (selectedFilters.length > 0 && !selectedFilters.includes("all")) {
      conditions.push({
        entityType: { in: selectedFilters },
      });
    }

    // Date filter
    const dateCondition = dateFilter(dateRange);
    if (dateCondition) {
      conditions.push(dateCondition);
    }

    if (conditions.length === 0) {
      return {};
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
  };

  const where = buildWhere();

  const totalAudit = await db.auditLog.count({ where });
  return Math.ceil(totalAudit / ITEMS_PER_PAGE);
}

// Transaction
export type CombinedTransaction = {
  id: number; 
  type: "REGULAR" | "EMERGENCY" | "Walk In";
  processedBy?: string,
  receivedBy?: string,
  notes?: string,
  requestedBy?: string
  customer: string;
  patient_name?: string;
  roomNumber?: number;
  quantity: number;
  price: number;
  total: number;
  status: string;
  createdAt: Date;
  source: "Walk In" | "Request Order";
  itemDetails: OrderItem[];
};


export const getTransactionList = async (
  query: string,
  currentPage: number,
  filter: string,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
  userRole: string,
  dateRange: { from: string; to: string }
): Promise<CombinedTransaction[]> => {
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;
  const safeQuery = typeof query === "string" ? query.toLowerCase().trim() : "";

  // Parse multiple filters
  const selectedFiltersParam = filter;
  const selectedFilters = selectedFiltersParam
    ?.split(",")
    .filter(Boolean)
    .map(f => f.trim() as TransactionFilter) || ["all"];

  // Build filters for each selected filter
  const statusFilters = selectedFilters
    .map(f => mapStatus(f))
    .filter(Boolean);

  // Build where clauses
  const buildRequestWhere = (): Prisma.OrderRequestWhereInput => {
  const conditions: Prisma.OrderRequestWhereInput[] = [];

  if (safeQuery) {
    conditions.push({ patient_name: { contains: safeQuery } });
  }

  if (statusFilters.length > 0) {
    const typeFilters = statusFilters.filter(sf => sf!.field === "type");
    const statusOnlyFilters = statusFilters.filter(sf => sf!.field === "status");

    if (typeFilters.length > 0) {
      conditions.push({
        type: { in: typeFilters.map(tf => tf!.value as OrderType) }
      });
    }

    if (statusOnlyFilters.length > 0) {
      conditions.push({
        status: { in: statusOnlyFilters.map(sf => sf!.value as Status) }
      });
    }
  }

  const dateCondition = dateFilter(dateRange);
  if (dateCondition) {
    conditions.push(dateCondition);
  }

  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { AND: conditions };
};

const buildWalkInWhere = (): Prisma.WalkInTransactionWhereInput => {
  const conditions: Prisma.WalkInTransactionWhereInput[] = [];

  if (safeQuery) {
    conditions.push({ customer_name: { contains: safeQuery } });
  }

  if (statusFilters.length > 0) {
    const statusOnlyFilters = statusFilters.filter(sf => sf!.field === "status");
    
    if (statusOnlyFilters.length > 0) {
      conditions.push({
        status: { in: statusOnlyFilters.map(sf => sf!.value as Status) }
      });
    }
  }

  const dateCondition = dateFilter(dateRange);
  if (dateCondition) {
    conditions.push(dateCondition);
  }

  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { AND: conditions };
};

  const whereRequestOrder = buildRequestWhere();
  const whereWalkIn = buildWalkInWhere();

  const includeWalkIn = isWalkInFilterEnabled(selectedFilters);
  const includeRequest = isRequestOrderFilterEnabled(selectedFilters);

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
            user: true,
            receivedBy: true,
            processedBy: true,
            items: { include: { product: true } },
          },
          orderBy: isDbSortable ? { [safeSortByRequest]: sortOrder } : { createdAt: "desc" },
        })
      : Promise.resolve([]),
    includeWalkIn && userRole !== "Nurse"
      ? db.walkInTransaction.findMany({
          where: whereWalkIn,
          include: {
            items: { include: { product: true } },
          },
          orderBy: isDbSortable ? { [safeSortByWalkIn]: sortOrder } : { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const formattedWalkIn: CombinedTransaction[] = walkinOrders.map((tx) => {
    const items = tx.items ?? [];

    return {
      id: tx.id,
      customer: tx.customer_name?.trim() || "Unknown",
      type: "Walk In",
      patient_name: undefined,
      roomNumber: undefined,
      requestedBy: "Unknown",
      createdAt: tx.createdAt,
      status: tx.status,
      source: "Walk In",
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      price: items.reduce((sum, item) => sum + item.price.toNumber(), 0),
      total: tx.totalAmount?.toNumber?.() ?? 0,
      itemDetails: items.map((item) => ({
        productName: item.product?.product_name ?? "Unknown",
        quantity: item.quantity,
        price: item.product?.price?.toNumber?.() ?? 0,
      })),
    };
  });

  const formattedRequest: CombinedTransaction[] = requestOrders.map((tx) => {
    const items = tx.items ?? [];

    return {
      id: tx.id,
      requestedBy: tx.user?.username
        ? tx.user.username.charAt(0).toUpperCase() + tx.user.username.slice(1)
        : "Unknown",
      receivedBy: tx.receivedBy?.username
        ? tx.receivedBy.username.charAt(0).toUpperCase() + tx.receivedBy.username.slice(1)
        : "Unknown",
      processedBy: tx.processedBy?.username
        ? tx.processedBy.username.charAt(0).toUpperCase() + tx.processedBy.username.slice(1)
        : "Unknown",
      customer: tx.patient_name || "Unknown",
      patient_name: tx.patient_name ?? "N/A",
      roomNumber: tx.room_number ? Number(tx.room_number) : undefined,
      type: tx.type,
      createdAt: tx.createdAt,
      status: tx.status,
      source: "Request Order",
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      price: items.reduce(
        (sum, item) => sum + (item.product?.price?.toNumber?.() ?? 0),
        0
      ),
      total: items.reduce(
        (sum, item) =>
          sum + item.quantity * (item.product?.price?.toNumber?.() ?? 0),
        0
      ),
      itemDetails: items.map((item) => ({
        productName: item.product?.product_name ?? "Unknown",
        quantity: item.quantity,
        price: item.product?.price?.toNumber?.() ?? 0,
      })),
    };
  });

  // Merge into unified list
  const combined: CombinedTransaction[] = [...formattedWalkIn, ...formattedRequest];

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

export async function fetchTransactionPages(
  query: string,
  filter: string,
  userRole: string,
  dateRange: { from: string; to: string }
) {
  const safeQuery = query.toLowerCase().trim();

  // Parse multiple filters
  const selectedFiltersParam = filter;
  const selectedFilters = selectedFiltersParam
    ?.split(",")
    .filter(Boolean)
    .map(f => f.trim() as TransactionFilter) || ["all"];

  const statusFilters = selectedFilters
    .map(f => mapStatus(f))
    .filter(Boolean);

  // Build where clauses (same logic as above)
const buildRequestWhere = (): Prisma.OrderRequestWhereInput => {
  const conditions: Prisma.OrderRequestWhereInput[] = [];

  if (safeQuery) {
    conditions.push({ patient_name: { contains: safeQuery } });
  }

  if (statusFilters.length > 0) {
    const typeFilters = statusFilters.filter(sf => sf!.field === "type");
    const statusOnlyFilters = statusFilters.filter(sf => sf!.field === "status");

    if (typeFilters.length > 0) {
      conditions.push({
        type: { in: typeFilters.map(tf => tf!.value as OrderType) }
      });
    }

    if (statusOnlyFilters.length > 0) {
      conditions.push({
        status: { in: statusOnlyFilters.map(sf => sf!.value as Status) }
      });
    }
  }

  const dateCondition = dateFilter(dateRange);
  if (dateCondition) {
    conditions.push(dateCondition);
  }

  // Return empty object if no conditions
  if (conditions.length === 0) {
    return {};
  }

  // Return single condition without AND if only one condition
  if (conditions.length === 1) {
    return conditions[0];
  }

  return { AND: conditions };
};

const buildWalkInWhere = (): Prisma.WalkInTransactionWhereInput => {
  const conditions: Prisma.WalkInTransactionWhereInput[] = [];

  if (safeQuery) {
    conditions.push({ customer_name: { contains: safeQuery } });
  }

  if (statusFilters.length > 0) {
    const statusOnlyFilters = statusFilters.filter(sf => sf!.field === "status");
    
    if (statusOnlyFilters.length > 0) {
      conditions.push({
        status: { in: statusOnlyFilters.map(sf => sf!.value as Status) }
      });
    }
  }

  const dateCondition = dateFilter(dateRange);
  if (dateCondition) {
    conditions.push(dateCondition);
  }

  if (conditions.length === 0) {
    return {};
  }

  if (conditions.length === 1) {
    return conditions[0];
  }

  return { AND: conditions };
};

  const whereRequestOrder = buildRequestWhere();
  const whereWalkIn = buildWalkInWhere();

  const includeWalkIn = isWalkInFilterEnabled(selectedFilters);
  const includeRequest = isRequestOrderFilterEnabled(selectedFilters);

  const [walkinCount, requestCount] = await Promise.all([
    includeWalkIn && userRole !== "Nurse"
      ? db.walkInTransaction.count({ where: whereWalkIn })
      : Promise.resolve(0),
    includeRequest
      ? db.orderRequest.count({ where: whereRequestOrder })
      : Promise.resolve(0),
  ]);

  const total = walkinCount + requestCount;
  return Math.ceil(total / ITEMS_PER_PAGE);
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
  






