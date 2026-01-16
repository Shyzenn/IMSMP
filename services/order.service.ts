import {
  TAddMedTechRequestSchema,
  TAddRequestOrderSchema,
  TEditMedTechRequestSchema,
  TEditRequestOrderSchema,
  WalkInPaymentSchema,
} from "@/lib/types";
import { z } from "zod";
import { api } from "./api/client";
import { request } from "./api/request";

type PaymentPayload = z.infer<typeof WalkInPaymentSchema>;

export type Response = {
  success: boolean;
};

export const orderService = {
  addWalkInOrder: (payload: PaymentPayload) =>
    request<Response>(api.post("/api/walkin_order", payload)),

  addOrderRequestOrder: (payload: TAddRequestOrderSchema) =>
    request<Response>(api.post("/api/request_order", payload)),

  editOrderRequestOrder: (payload: TEditRequestOrderSchema, id: string) =>
    request<Response>(api.patch(`/api/request_order/${id}/update`, payload)),

  addMedtechRequestOrder: (payload: TAddMedTechRequestSchema) =>
    request<Response>(api.post("/api/medtech_request", payload)),

  editMedtechRequestOrder: (payload: TEditMedTechRequestSchema, id: string) =>
    request<Response>(api.patch(`/api/medtech_request/${id}/update`, payload)),
};
