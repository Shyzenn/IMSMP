import {
  TAddProductSchema,
  TEditBatchSchema,
  TEditProductSchema,
  TReplenishProductSchema,
} from "@/lib/types";
import { api } from "./api/client";
import { request } from "./api/request";
import { ProductProps } from "@/app/components/Inventory/products/InventoryTable";
import { BatchProps } from "@/app/components/Inventory/batches/BatchTable";
import { Response } from "./order.service";

export type GetBatchesResponse = {
  data: BatchProps[];
  meta?: {
    totalProducts: number;
    totalPages: number;
    currentPage: number;
  };
};

export type GetProductsResponse = {
  data: ProductProps[];
  meta?: {
    totalProducts: number;
    totalPages: number;
    currentPage: number;
  };
};

export const productService = {
  // -----------------------//
  //        Products        //
  // -----------------------//
  getProducts: async (params: {
    query?: string;
    page?: number;
    filter?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<GetProductsResponse> => {
    const res = await api.get("/api/product/list", { params });
    return res.data;
  },

  getProductPages: async (params: {
    query?: string;
    filter?: string;
  }): Promise<{ totalPages: number; totalProducts: number }> => {
    const res = await api.get("/api/product/pages", { params });
    return res.data;
  },

  addProduct: (payload: TAddProductSchema) =>
    request<Response>(api.post("/api/product", payload)),

  editProduct: (payload: TEditProductSchema) =>
    request<Response>(api.patch("/api/product/update", payload)),

  // -----------------------//
  //    Product Batches     //
  // ----------------------//
  getBatches: async (params: {
    query?: string;
    page?: number;
    filter?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<GetBatchesResponse> => {
    const res = await api.get("/api/batches", { params });
    return res.data;
  },

  getBatchesPages: async (params: {
    query?: string;
    filter?: string;
  }): Promise<{ totalPages: number; totalProducts: number }> => {
    const res = await api.get("/api/batches/pages", { params });
    return res.data;
  },

  replenishProduct: (payload: TReplenishProductSchema) =>
    request<Response>(api.post("/api/product/replenish", payload)),

  editBatch: (payload: TEditBatchSchema) =>
    request<Response>(api.patch("/api/product/edit_batch", payload)),

  // -----------------------//
  //    Product Category    //
  // -----------------------//
  addCategory: (name: string) =>
    request<Response>(api.post("/api/product/category", { name })),

  editCategory: (
    selectedCategoryForEdit: { id: number; name: string },
    name: string
  ) =>
    request<Response>(
      api.put(`/api/product/category/${selectedCategoryForEdit.id}/update`, {
        name,
      })
    ),
};
