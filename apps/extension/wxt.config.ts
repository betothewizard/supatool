import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  modulesDir: "wxt-modules",
  manifest: {
    name: "Supatool",
    description: "Fast site data reset & tab focus keep-alive emulation for web developers.",
    action: {
      default_title: "Supatool",
    },
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


