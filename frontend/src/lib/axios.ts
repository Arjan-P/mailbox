import { errorResponse } from "@/types/api";
import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  // success handler
  (res) => res,
  // error handler
  (error: AxiosError) => {
    const parsed = errorResponse.safeParse(error.response?.data);
    if (parsed.success) {
      return Promise.reject(parsed.data.error);
    }
    return Promise.reject({ code: "UNKNOWN", message: "Something went wrong" });
  },
);
