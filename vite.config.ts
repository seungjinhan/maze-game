import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages 하위 경로(/maze-game/)에서도 열리게 상대 경로로 만들어요. 화면 이동은 # 주소로 해요.
export default defineConfig({ base: "./", plugins: [react()] });
