import { defineBuildConfig } from 'unbuild'
import path from 'path'

export default defineBuildConfig({
  entries: [
    'src/index' // 入口文件
  ],
  declaration: true, // 生成 .d.ts 文件
  clean: true, // 构建前清理 dist
  rollup: {
    emitCJS: true, // 输出 CommonJS 格式
    output: {
      format: 'umd', // 使用 UMD 格式
      name: 'mockTools', // 全局变量名
    },
    // 配置 esbuild 转换
    esbuild: {
      target: ['es2015'],
      minify: true
    },
    inlineDependencies: true, // 内联依赖
    alias: {
      entries: [
        { find: '@', replacement: path.resolve(__dirname, './src') }
      ]
    },
  },
  failOnWarn: false // 添加此配置避免警告导致构建失败
})
