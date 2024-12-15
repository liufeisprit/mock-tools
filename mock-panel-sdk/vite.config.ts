import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginCssInjectedByJs from 'vite-plugin-css-injected-by-js' // 引入插件
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginCssInjectedByJs()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      name: 'MockPanelSDK',
      fileName: 'mock-panel-sdk',
      formats: ['umd']
    },
    rollupOptions: {
      output: {
        // 将所有js文件打包成一个文件
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
      // 将所有代码打包到一个文件
      preserveEntrySignatures: 'strict'
    }
  }
})
