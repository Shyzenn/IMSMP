import { api } from "./client";

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional UX handling
      console.warn("Unauthorized request");
    }

    return Promise.reject(error);
  }
);
