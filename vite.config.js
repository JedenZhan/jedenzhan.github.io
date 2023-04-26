import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

const isProduct = process.env.NODE_ENV === "product";

export default defineConfig({
  plugins: [vue()],
  base: isProduct ? "./" : "/",
  build: {
    outDir: "docs",
  },
  resolve: {
    alias: {
      "@": "/src/",
      stream: "stream-browserify",
      crypto: "crypto-browserify",
    },
    extensions: [".vue", ".ts", ".js", "index.vue"],
  },
  css: {
    preprocessorOptions: {
      less: {
        math: "always",
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        // NodeGlobalsPolyfillPlugin({
        //   process: true,
        //   buffer: true,
        // }),
      ],
    },
  },
  server: {
    port: 3000,
    cors: true,
    proxy: {
      "/public": {
        // '/api'是代理标识，一般是每个接口前的相同部分
        target: "https://music.balawallet.com", // 请求地址，一般是服务器地址
        changeOrigin: true, // 是否进行跨域
        rewrite(path) {
          // pathRewrite的作用是把请求接口中的 '/api'替换掉，一般是替换为空""
          return path.replace(/^\/public/, "");
        },
      },
      "/game": {
        // '/api'是代理标识，一般是每个接口前的相同部分
        target: "https://musictest.muverse.info/", // 请求地址，一般是服务器地址
        changeOrigin: true, // 是否进行跨域
      },
    },
  },
});
