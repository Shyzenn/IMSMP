import { TEditUserSchema, TSignUpSchema } from "@/lib/types";
import { api } from "./api/client";
import { request } from "./api/request";
import { Response } from "./order.service";

export const userService = {
  addUser: (payload: TSignUpSchema) =>
    request<Response>(api.post("/api/user", payload)),

  editUser: (payload: TEditUserSchema) =>
    request<Response>(api.patch("/api/user/update", payload)),
};
