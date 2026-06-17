import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const globalRef =
    '(typeof globalThis!=="undefined"?globalThis:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})';

/** 飞书 iframe CSP 禁止 eval；lodash 等依赖里的 Function("return this")() 会在运行时被拦截 */
function stripUnsafeEval() {
    return {
        name: "strip-unsafe-eval",
        renderChunk(code) {
            const next = code.replace(
                /Function\(\s*["']return this["']\s*\)\(\)/g,
                globalRef,
            );
            return next === code ? null : { code: next, map: null };
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    plugins: [react(), stripUnsafeEval()],
    resolve: {
        alias: {
            "#minpath": path.resolve(rootDir, "node_modules/vfile/lib/minpath.browser.js"),
            "#minproc": path.resolve(rootDir, "node_modules/vfile/lib/minproc.browser.js"),
            "#minurl": path.resolve(rootDir, "node_modules/vfile/lib/minurl.browser.js"),
        },
    },
    server: {
        host: "0.0.0.0",
    },
    build: {},
});
