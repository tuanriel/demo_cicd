import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" → asset dùng đường dẫn tương đối, phục vụ được ở bất kỳ path nào
// (nginx root của demo.orbitai.vn).
export default defineConfig({
  plugins: [react()],
  base: "./",
});
