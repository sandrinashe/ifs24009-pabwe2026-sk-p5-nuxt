import { defineStore } from "pinia";
import {
  postLogin,
  postLogout,
  postRegister,
  type LoginPayload,
  type RegisterPayload,
} from "../api/authApi";
import { getAccessToken, putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";

export interface AuthState {
  token: string | null;
  isLoading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: getAccessToken(),
    isLoading: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => Boolean(state.token),
  },
  actions: {
    async isAuthLogin(payload: LoginPayload) {
      this.isLoading = true;
      const result = await postLogin(payload);
      if (result.success) {
        putAccessToken(result.data.token);
        this.token = result.data.token;
      }
      this.isLoading = false;
      return result;
    },
    async isAuthRegister(payload: RegisterPayload) {
      this.isLoading = true;
      const result = await postRegister(payload);
      this.isLoading = false;
      return result;
    },
    async isAuthLogout() {
      await postLogout();
      removeAccessToken();
      this.token = null;
    },
  },
});
