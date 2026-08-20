import { createApp } from "vue";
import App from "../ui/App.vue";
import { router } from "../ui/router.js";

createApp(App).use(router).mount("#app");
