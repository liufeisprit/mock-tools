import { EnvironmentalTag } from '@/utils'
import loadMockTool from './mock-tool'
import startMock, { listenMockSwitch } from './reqMock'

type InitOptions = {
  auto?: boolean
  rules?: string[]
  excludeRules?: string[]
  mockSdkUrl: string
}
const mockInit = async(options?: InitOptions) => {
  // 非正式环境才上报
  const dev = EnvironmentalTag()
  if (dev !== 'pro') {
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
    loadMockTool(options.mockSdkUrl||'')
    return true
  }
  return true
}

export default mockInit
