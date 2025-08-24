import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1024,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        minifyInternalExports: true,
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router-dom")) return "router";
            if (id.includes("/react/") || id.includes("react-dom")) return "react";
            if (id.includes("monaco")) return "monaco";
            if (id.includes("lexical")) return "lexical";
            if (id.includes("semi-ui")) return "semi";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("i18next")) return "i18n";
            if (id.includes("jspdf") || id.includes("jszip") || id.includes("file-saver") || id.includes("html-to-image")) return "files";
            if (id.includes("dexie")) return "dexie";
            if (id.includes("sql-parser")) return "sql";
            if (id.includes("lottie")) return "lottie";
            if (id.includes("lodash")) return "lodash";
            if (id.includes("antlr4")) return "antlr4";
            if (id.includes("dbml")) return "dbml";

            return null;
          }
        }

      },
    },
  },
  server: {
    allowedHosts: [".gitpod.io"]
  }
})