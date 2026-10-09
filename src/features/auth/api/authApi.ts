import { apiFetch } from "../../../helpers/apiHelper";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export const postLogin = ({ email, password }: LoginPayload) =>
  apiFetch<{ token: string; user: AuthUser }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const postRegister = ({ name, email, password }: RegisterPayload) =>
  apiFetch("/auth/register", { method: "POST", body: { name, email, password } });

export const postLogout = () => apiFetch("/auth/logout", { method: "POST" });
