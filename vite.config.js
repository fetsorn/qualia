import { defineConfig } from "vite";
import { internalIpV4 } from "internal-ip";
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const host = await internalIpV4();

  /** @type {import('vite').UserConfig} */
  const config = {
    plugins: [react(), nodePolyfills()],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    // server: {
    //   port: 1420,
    //   strictPort: true,
    // },
    server: {
      host: "0.0.0.0", // listen on all addresses
      port: 1420,
      strictPort: true,
      hmr: {
        protocol: "ws",
        // TODO: replace with internalIpV4, why is it 192.168.1.0 but tauri connects to 192.168.1.4?
        host: "192.168.1.4",
        port: 1420,
      },
    },
    // TODO: check for build, https://github.com/vitejs/vite/issues/8427
    // https://github.com/vitejs/vite/issues/11672
    // optimizeDeps: { exclude: {} },
    // 3. to make use of `TAURI_DEBUG` and other env variables
    // https://tauri.app/v1/api/config#buildconfig.beforedevcommand
    envPrefix: ["VITE_", "TAURI_"],
    worker: {
      format: "es"
    }
  };

  return config;
});
