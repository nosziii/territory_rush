import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import "./styles.css";

const apiBase = import.meta.env.VITE_API_BASE ?? "";
import axios from "axios";
axios.defaults.baseURL = apiBase;

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
