import loadMockTool from './mock-tool'
import startMock, { listenMockSwitch } from './reqMock'
type InitOptions = {
  rules?: string[]
  excludeRules?: string[]
  mockPanelSdkUrl: string
  disabled?: boolean
}
const mockInit = async(options?: InitOptions) => {
  if (!options.disabled) {
    // 全局mock开关
    const isOpen = localStorage.getItem('mock_tools_all_opened')
    if (isOpen !== 'false') {
      localStorage.setItem('mock_tools_all_opened', 'true')
      // 开启接口拦截和mock
      await startMock(options)
    }
    // 监听mock开关切换
    listenMockSwitch(options)
    // 加载mock可视化工具
    loadMockTool(options.mockPanelSdkUrl || 'https://unpkg.com/xhr-mocker-panel-sdk@latest/dist/index.umd.js')
    return true
  }
  return true
}

export default mockInit
