
[English](./README.md) | 简体中文
  
一个强大的 Ajax/Fetch 请求拦截和响应修改工具。

**主要功能：**   
- [x] 拦截并修改 AJAX、Fetch 请求的响应数据
- [x] 实时监控请求并可视化展示拦截记录
- [x] 支持即时响应模式，无需等待真实请求
- [x] 支持开发环境动态加载，无需污染生产环境代码

## 安装
```
npm i xhr-mocker@latest
```
```javascript
// 入口文件
import { mockInit } from 'xhr-mocker'
// 在应用程序入口最上面调用
// react项目
mockInit({
    rules:[],  //匹配拦截的域名 支持正则 一般只配置这个 项目请求的主域名
    excludeRules:[] , // 匹配不拦截的域名 支持正则 内置了一些默认值
    mockPanelSdkUrl: '' // mock面板sdk地址 可以不传 默认使用cdn
    disabled: false // 是否禁用 如果为true 则不会加载mock工具
})}
// vue项目
mockInit({
  rules: []
}).then(() => {
  new Vue({
    render: h => h(App)
  }).$mount('#app')
})
```

## 使用

### 开启 Mock 功能
1. 点击右上角图标，打开控制面板，启用监听功能后可查看所有请求记录
2. 通过右侧开关按钮控制 Mock 功能的开启/关闭
3. 可为单个接口配置即时响应模式
  
### 自定义响应数据
在响应编辑器中，您可以：
1. 自由编辑响应数据
2. 基于xhr-mocker-panel-sdk项目进行功能扩展.例如: 结合 API 文档自动生成 Mock 数据,自定义开发通过 AI + api schema生成Mock数据

## License
MIT License.
