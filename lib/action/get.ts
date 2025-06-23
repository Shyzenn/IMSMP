'use server'

import { Decimal } from "@prisma/client/runtime/library";
import { Category, Prisma } from "@prisma/client";
import { db } from "../db";


// Search and pagination
const ITEMS_PER_PAGE = 14;

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
  






