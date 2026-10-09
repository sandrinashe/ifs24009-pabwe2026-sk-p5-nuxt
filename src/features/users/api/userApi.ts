import { apiFetch } from "../../../helpers/apiHelper";

export interface User {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ChangeProfilePayload {
  name: string;
  email: string;
}

export interface ChangePasswordPayload {
  password: string;
  new_password: string;
  new_password_confirmation: string;
}

export const getUsers = () => apiFetch<{ users: User[] }>("/users");

export const getMe = () => apiFetch<{ user: User }>("/users/me");

export const putMe = ({ name, email }: ChangeProfilePayload) =>
  apiFetch("/users/me", { method: "PUT", body: { name, email } });

export const postPhoto = (file: File) => {
  const formData = new FormData();
  formData.append("photo", file);
  return apiFetch("/users/me/photo", { method: "POST", formData });
};

// Sesuai dokumentasi Delcom Open API: PUT /users/password
export const putPassword = ({
  password,
  new_password,
  new_password_confirmation,
}: ChangePasswordPayload) =>
  apiFetch("/users/password", {
    method: "PUT",
    body: { password, new_password, new_password_confirmation },
  });
