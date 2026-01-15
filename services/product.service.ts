import {
  TAddProductSchema,
  TEditBatchSchema,
  TEditProductSchema,
  TReplenishProductSchema,
} from "@/lib/types";
import { api } from "./api/client";
import { request } from "./api/request";

type ProductResponse = {
  success: boolean;
};

export const productService = {
  addProduct: (payload: TAddProductSchema) =>
    request<ProductResponse>(api.post("/api/product", payload)),

  editProduct: (payload: TEditProductSchema) =>
    request<ProductResponse>(api.patch("/api/product/update", payload)),

  replenishProduct: (payload: TReplenishProductSchema) =>
    request<ProductResponse>(api.post("/api/product/replenish", payload)),

  editBatch: (payload: TEditBatchSchema) =>
    request<ProductResponse>(api.patch("/api/product/edit_batch", payload)),

  addCategory: (name: string) =>
    request<ProductResponse>(api.post("/api/product/category", { name })),

  editCategory: (
    selectedCategoryForEdit: { id: number; name: string },
    name: string
  ) =>
    request<ProductResponse>(
      api.put(`/api/product/category/${selectedCategoryForEdit.id}/update`, {
        name,
      })
    ),
};
