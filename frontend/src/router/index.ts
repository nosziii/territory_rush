import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LobbyView from "../views/LobbyView.vue";
import GameView from "../views/GameView.vue";
import ProfileView from "../views/ProfileView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    { path: "/lobby", component: LobbyView },
    { path: "/game", component: GameView },
    { path: "/profile", component: ProfileView },
  ],
});
