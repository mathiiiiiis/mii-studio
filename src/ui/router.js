import { createRouter, createWebHistory } from "vue-router";
import Studio from "./views/Studio.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "studio", component: Studio },
    {
      path: "/kitchen",
      name: "kitchen",
      component: () => import("./views/Kitchen.vue"),
    },
  ],
});
