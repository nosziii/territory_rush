import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    modal: "",
    notifications: [] as { id: string; text: string }[],
  }),
  actions: {
    pushNotification(text: string) {
      const id = Math.random().toString(36).slice(2);
      this.notifications.push({ id, text });
      setTimeout(() => this.removeNotification(id), 3000);
    },
    removeNotification(id: string) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    },
  },
});
