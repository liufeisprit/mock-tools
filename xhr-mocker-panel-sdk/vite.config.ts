import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginCssInjectedByJs from 'vite-plugin-css-injected-by-js' // 引入插件
import path from 'path'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), vitePluginCssInjectedByJs()],
  define: {
    'process.env': {}  // 或提供具体的环境变量值
  },
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
      fileName: (format) => {
        if (format === 'es') return 'index.js'
        return `index.${format}.js`
      },
      formats: ['es','cjs','umd']
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
