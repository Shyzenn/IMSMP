import { normalizeApiError } from "./errors";

export async function request<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
