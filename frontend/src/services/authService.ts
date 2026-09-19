import { api } from "./api";
import { LoginPayload, RegisterPayload, TokenResponse, User } from "../types/auth";

export const authService = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/login", payload);
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>("/auth/register", payload);
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<User>("/auth/me");
    return res.data;
  },
};
