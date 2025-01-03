
English | [简体中文](./README-zh.md)
  
A powerful tool for intercepting and modifying Ajax/Fetch request responses.

**Core Features：**   
- [x] Intercept and modify AJAX/Fetch request responses
- [x] Real-time request monitoring and visualization
- [x] Support immediate response mode without waiting for actual requests
- [x] Dynamic loading in development environment without affecting production code

## Installation
```
npm i mock-tools@latest
```
```javascript
// Entry file
import { mockInit } from 'mock-tools'
// Initialize at application entry
// React projects
mockInit({
    rules:[],  // Domain rules to intercept (supports regex), typically just configure main project domain
    excludeRules:[] , // Domain rules to exclude (supports regex), includes built-in exclusions
    mockPanelSdkUrl: '' // Mock panel SDK URL
})}
// Vue projects
mockInit({
  rules: []
}).then(() => {
  new Vue({
    render: h => h(App)
  }).$mount('#app')
})
```

## Usage Guide

### Enable Mock Features
1. Open control panel - monitor all requests after enabling listening
2. Toggle Mock functionality using the switch button
3. Configure immediate response mode for individual endpoints
  
### Customize Response Data
In the response editor, you can:
1. Freely edit response data
2. Extend functionality based on panel-sdk。eg: Auto-generate mock data from API documentation or generate simulated data using AI

## License
MIT License.
