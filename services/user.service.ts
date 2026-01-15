import { TEditUserSchema, TSignUpSchema } from "@/lib/types";
import { api } from "./api/client";
import { request } from "./api/request";

type UserResponse = {
  success: boolean;
  errors: boolean;
};

export const userService = {
  addUser: (payload: TSignUpSchema) =>
    request<UserResponse>(api.post("/api/user", payload)),

  editUser: (payload: TEditUserSchema) =>
    request<UserResponse>(api.patch("/api/user/update", payload)),
};
