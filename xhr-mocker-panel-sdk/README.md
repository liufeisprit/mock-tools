
# xhr-mocker-panel-sdk

**描述**   
xhr-mocker-panel-sdk 是一个基于 xhr-mocker 的项目，用于拦截和修改 AJAX/Fetch 请求响应。它提供了一个可视化的控制面板，基于monaco-editor的代码编辑器，用于实时监控请求和自定义配置 Mock 数据, 可再此基础上扩展ai-mock,json-schema-mock等功能。

## 安装
```
pnpm i 
```
## 启动
```
pnpm dev
```
## 打包
```
pnpm build
```

## 使用

### 开启 Mock 功能
1. 打开控制面板，启用监听功能后可查看所有请求记录
2. 通过右侧开关按钮控制 Mock 功能的开启/关闭
3. 可为单个接口配置即时响应模式
  
### 自定义响应数据
在响应编辑器中，您可以：
1. 自由编辑响应数据
2. 基于此项目进行功能扩展.例如: 结合 API 文档自动生成 MockJs 数据,自定义开发通过 AI + api schema生成Mock数据

## License
MIT License.
