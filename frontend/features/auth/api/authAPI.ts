import { api } from "@/lib/api";
import { RegisterPayload, LoginPayload, AuthResponse } from "../../../types/authTypes";

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/api/auth/register", payload);
    return res.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>("/api/auth/login", payload);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/api/auth/logout");
  },
};