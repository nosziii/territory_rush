import { defineStore } from "pinia";
import axios from "axios";

interface Profile {
  id: string;
  username: string;
  level: number;
  xp: number;
  softCurrency: number;
  hardCurrency: number;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    token: "",
    profile: null as Profile | null,
  }),
  actions: {
    async login(email: string, password: string) {
      const { data } = await axios.post("/auth/login", { email, password });
      this.token = data.token;
      axios.defaults.headers.common.Authorization = `Bearer ${this.token}`;
      await this.fetchProfile();
    },
    async register(email: string, password: string) {
      const { data } = await axios.post("/auth/register", { email, password });
      this.token = data.token;
      axios.defaults.headers.common.Authorization = `Bearer ${this.token}`;
      await this.fetchProfile();
    },
    async fetchProfile() {
      if (!this.token) return;
      const { data } = await axios.get("/user/me");
      this.profile = data;
    },
    logout() {
      this.token = "";
      this.profile = null;
      delete axios.defaults.headers.common.Authorization;
    },
  },
});
