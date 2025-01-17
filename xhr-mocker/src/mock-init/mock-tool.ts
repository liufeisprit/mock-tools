const loadScript = (src: string) => {
  try {
    const script = document.createElement('script')
    script.src = src

    script.onerror = function() {
      console.error('加载mock-sdk失败')
    }

    script.onload = function() {
      console.info('加载mock-sdk成功')
      // 开启缓存这里会早触发 此时可能没开始监听
      setTimeout(() => {
        const event = new CustomEvent('mock-sdk-loaded', { detail: true });
        window.dispatchEvent(event);
      }, 100)
    }

    document.getElementsByTagName('body')[0].appendChild(script)
  } catch (e) {
    console.error(`mock-sdk加载失败, ${e.message}`)
  }
}

const loadToolModule = () => {
  const mockBoxHtml = `<div id="mock-tool-web"></div>`
  const mockDiv = document.createElement('div')
  mockDiv.innerHTML = mockBoxHtml
  document.getElementsByTagName('body')[0].appendChild(mockDiv)
}

const mockTool = (mockPanelSdkUrl: string) => {
  if (typeof window === 'undefined') {
    return
  }
  loadToolModule()
  loadScript(mockPanelSdkUrl)
}
export default mockTool
