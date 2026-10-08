import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  modulesDir: "wxt-modules",
  manifest: {
    name: "Supatool - Developer Tools",
    description: "Browser Developer Tools & Productivity Extension for fast debugging, tab keep-alive, and site data clearing.",
    permissions: [
      "browsingData",
      "activeTab",
      "scripting",
      "storage",
      "tabs",
      "webNavigation",
    ],
    host_permissions: ["<all_urls>"],
  },
});


