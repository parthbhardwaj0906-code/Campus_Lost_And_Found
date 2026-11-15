import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  server: { port: 5173 },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "login.html"),
        register: resolve(__dirname, "register.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        createItem: resolve(__dirname, "create-item.html"),
        itemDetails: resolve(__dirname, "item-details.html"),
        myPosts: resolve(__dirname, "my-posts.html"),
        admin: resolve(__dirname, "admin.html"),
        notFound: resolve(__dirname, "404.html")
      }
    }
  }
});
