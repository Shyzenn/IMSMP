"use server";

import { MedTechRemarks, MedTechStatus, Prisma } from "@prisma/client";
import { db } from "../db";
import { OrderItem } from "../interfaces";
import {
  dateFilter,
  isMTFilterEnabled,
  ITEMS_PER_PAGE,
  mapMTStatus,
  MTTransactionFilter,
} from "../utils";

export type ArchiveItem =
  | {
      id: number;
      type: "Product";
      product_name: string;
      category: string;
      quantity: number;
      archivedAt: Date | null;
      archivedBy: string;
      archiveReason: string | null;
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
      archiveReason: string | null;
    }
  | {
      id: number;
      type: "Order Request";
      product_name: string;
      category: string;
      quantity: number;
      archivedAt: Date | null;
      archivedBy: string;
      archiveReason: string | null;
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
        archivedByUser: {
          select: { username: true; firstName: true; lastName: true };
        };
      };
    }>[] = [];

    let archivedBatches: Prisma.ProductBatchGetPayload<{
      include: {
        product: { include: { category: true } };
        archivedByUser: {
          select: { username: true; firstName: true; lastName: true };
        };
      };
    }>[] = [];

    let archivedOrders: Prisma.OrderRequestGetPayload<{
      include: {
        user: true;
        items: true;
        patient: { select: { patientName: true; roomNumber: true } };
        archivedByUser: {
          select: { username: true; firstName: true; lastName: true };
        };
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
            },
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
            },
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
          patient: {
            select: {
              patientName: true,
              roomNumber: true,
            },
          },
          archivedByUser: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    const formatUserName = (
      user: {
        username: string;
        firstName: string | null;
        lastName: string | null;
      } | null
    ) => {
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
        archiveReason: p.archiveReason,
      })),
      ...archivedBatches.map((b) => ({
        id: b.id,
        type: "Product Batch" as const,
        product_name: b.product.product_name,
        category: b.product.category?.name || "None",
        batchNumber: b.batchNumber,
        quantity: b.quantity,
        releaseDate: b.manufactureDate,
        expiryDate: b.expiryDate,
        archivedAt: b.archiveAt,
        archivedBy: formatUserName(b.archivedByUser),
        archiveReason: b.archiveReason,
      })),
      ...archivedOrders.map((o) => ({
        id: o.id,
        type: "Order Request" as const,
        product_name: o.patient.patientName || "Unknown",
        category: `Room ${o.patient.roomNumber || "N/A"}`,
        quantity: o.items?.length || 0,
        archivedAt: o.updatedAt,
        archivedBy: formatUserName(o.archivedByUser),
        archiveReason: o.archiveReason,
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
      filter === "all" || filter === "Product"
        ? db.product.count({
            where: {
              status: "ARCHIVED",
              ...(safeQuery && { product_name: { contains: safeQuery } }),
            },
          })
        : Promise.resolve(0),

      filter === "all" || filter === "Product Batch"
        ? db.productBatch.count({
            where: {
              type: "ARCHIVED",
              ...(safeQuery && {
                product: { product_name: { contains: safeQuery } },
              }),
            },
          })
        : Promise.resolve(0),

      filter === "all" || filter === "Order Request"
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
  const selectedFilters =
    selectedFiltersParam
      ?.split(",")
      .filter(Boolean)
      .map((f) => f.trim()) || [];

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

    conditions.push({
      user: {
        role: { not: "SuperAdmin" },
      },
    });

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
  const selectedFilters =
    selectedFiltersParam
      ?.split(",")
      .filter(Boolean)
      .map((f) => f.trim()) || [];

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

    conditions.push({
      user: {
        role: { not: "SuperAdmin" },
      },
    });

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
export type MTTransaction = {
  id: number;
  approvedBy?: string;
  receivedBy?: string;
  notes?: string;
  requestedBy?: string;
  quantity: number;
  status: string;
  remarks: string;
  createdAt: Date;
  itemDetails: OrderItem[];
};

export const getMTTransactionList = async (
  query: string,
  currentPage: number,
  filter: string,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc",
  dateRange: { from: string; to: string }
): Promise<MTTransaction[]> => {
  try {
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    const safeQuery =
      typeof query === "string" ? query.toLowerCase().trim() : "";

    const selectedFiltersParam = filter;
    const selectedFilters = selectedFiltersParam
      ?.split(",")
      .filter(Boolean)
      .map((f) => f.trim() as MTTransactionFilter) || ["all"];

    const medTechFilters = selectedFilters
      .map((f) => mapMTStatus(f))
      .filter(Boolean);

    // Build where clauses
    const buildRequestWhere = (): Prisma.MedTechRequestWhereInput => {
      const conditions: Prisma.MedTechRequestWhereInput[] = [];

      if (safeQuery) {
        const numericId = parseInt(safeQuery, 10);
        if (!isNaN(numericId)) {
          conditions.push({ id: { equals: numericId } });
        }
      }

      if (medTechFilters.length > 0) {
        // Filter by status
        const statusOnlyFilters = medTechFilters.filter(
          (sf) => sf!.field === "status"
        );
        if (statusOnlyFilters.length > 0) {
          conditions.push({
            status: {
              in: statusOnlyFilters.map((sf) => sf!.value as MedTechStatus),
            },
          });
        }

        // Filter by remarks
        const remarksOnlyFilters = medTechFilters.filter(
          (sf) => sf!.field === "remarks"
        );
        if (remarksOnlyFilters.length > 0) {
          conditions.push({
            remarks: {
              in: remarksOnlyFilters.map((sf) => sf!.value as MedTechRemarks),
            },
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
    const includeRequest = isMTFilterEnabled(selectedFilters);

    const validSortFields = ["createdAt", "quantity"];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const dbSortableFields = ["createdAt"];
    const isDbSortable = dbSortableFields.includes(sortBy);

    // Fixed: Added await and proper conditional
    const medtechRequest = includeRequest
      ? await db.medTechRequest.findMany({
          where: whereRequestOrder,
          include: {
            requestedBy: true,
            receivedBy: true,
            approvedBy: true,
            items: { include: { product: true } },
          },
          orderBy: isDbSortable
            ? { [safeSortBy]: sortOrder }
            : { createdAt: "desc" },
        })
      : [];

    // Format the data
    const formattedRequest: MTTransaction[] = medtechRequest.map((tx) => {
      const items = tx.items ?? [];

      return {
        id: tx.id,
        requestedBy: tx.requestedBy?.username
          ? tx.requestedBy.username.charAt(0).toUpperCase() +
            tx.requestedBy.username.slice(1)
          : "Unknown",
        receivedBy: tx.receivedBy?.username
          ? tx.receivedBy.username.charAt(0).toUpperCase() +
            tx.receivedBy.username.slice(1)
          : "Unknown",
        approvedBy: tx.approvedBy?.username
          ? tx.approvedBy.username.charAt(0).toUpperCase() +
            tx.approvedBy.username.slice(1)
          : "Unknown",
        notes: tx.notes ?? "",
        remarks: tx.remarks ?? "",
        createdAt: tx.createdAt,
        status: tx.status,
        quantity: items.reduce(
          (sum, item) => sum + item.quantityOrdered.toNumber(),
          0
        ),
        itemDetails: items.map((item) => ({
          productName: item.product?.product_name ?? "Unknown",
          quantityOrdered: item.quantityOrdered.toNumber(),
          price: item.product?.price.toNumber(),
        })),
      };
    });

    // Sort if needed (for non-DB sortable fields)
    const sorted = isDbSortable
      ? formattedRequest
      : formattedRequest.sort((a, b) => {
          let fieldA: string | number | Date;
          let fieldB: string | number | Date;

          switch (sortBy) {
            case "id":
              fieldA = a.id;
              fieldB = b.id;
              break;
            case "createdAt":
              fieldA = a.createdAt;
              fieldB = b.createdAt;
              break;
            case "quantity":
              fieldA = a.quantity;
              fieldB = b.quantity;
              break;
            default:
              fieldA = a.createdAt;
              fieldB = b.createdAt;
          }

          if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
          if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });

    // Return paginated results
    return sorted.slice(skip, skip + ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Error fetching MT transactions:", error);
    throw new Error("Failed to fetch medical technology transactions");
  }
};

export async function fetchMTTransactionPages(
  query: string,
  filter: string,
  dateRange: { from: string; to: string }
): Promise<number> {
  try {
    const safeQuery = query.trim();

    const selectedFiltersParam = filter;
    const selectedFilters = selectedFiltersParam
      ?.split(",")
      .filter(Boolean)
      .map((f) => f.trim() as MTTransactionFilter) || ["all"];

    // Build filters for each selected filter
    const statusFilters = selectedFilters
      .map((f) => mapMTStatus(f))
      .filter(Boolean);

    const buildRequestWhere = (): Prisma.MedTechRequestWhereInput => {
      const conditions: Prisma.MedTechRequestWhereInput[] = [];

      // Use equals for integer id field
      if (safeQuery) {
        const numericId = parseInt(safeQuery, 10);
        if (!isNaN(numericId)) {
          conditions.push({ id: { equals: numericId } });
        }
      }

      if (statusFilters.length > 0) {
        const statusOnlyFilters = statusFilters.filter(
          (sf) => sf!.field === "status"
        );

        if (statusOnlyFilters.length > 0) {
          conditions.push({
            status: {
              in: statusOnlyFilters.map((sf) => sf!.value as MedTechStatus),
            },
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
    const includeRequest = isMTFilterEnabled(selectedFilters);

    const requestCount = includeRequest
      ? await db.medTechRequest.count({ where: whereRequestOrder })
      : 0;

    // Return total pages
    return Math.ceil(requestCount / ITEMS_PER_PAGE);
  } catch (error) {
    console.error("Error fetching MT transaction pages:", error);
    return 0;
  }
}

export async function getProductById(id: number) {
  try {
    const product = await db.product.findUnique({
      where: { id },
    });
    if (product) {
      return product;
    } else {
      return { error: "Product not found" };
    }
  } catch (error) {
    console.error("Error fetching products", error);
    return { error: "An error occurred while fetching product" };
  }
}
