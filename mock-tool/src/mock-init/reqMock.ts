import { isMatchingPattern, sliceUrlPath, isString, isUrlValid, printLog, cloneXHR, parseFullUrl } from '@/utils'
import Store from '@/utils/store'

type ReportListItem = {
  url: string | URL
  method: string
  effectLocation: string
  status?: number
  data?: any
  updateData?: any
}

const openNative = XMLHttpRequest.prototype.open
const sendNative = XMLHttpRequest.prototype.send
const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader
const originalAddEventListener = XMLHttpRequest.prototype.addEventListener;
// 保存原始的 fetch 函数引用
const originalFetch = window.fetch
const mockInterface = {}
const mockRequestEffect = {}
const requestListSendData: Record<string, ReportListItem> = {}
const isRealRequest = new WeakMap()
// mock-sdk是否加载完成
let isMockSdkLoad = false
const sendResponse = (params: {
  requestListData: Record<string, ReportListItem>,
  rules?: string[],
  excludeRules?: string[],
  sdkLoaded?: boolean
}) => {
  const { requestListData, rules, excludeRules, sdkLoaded } = params
  // 发送数据ui面板
  let dataList = Object.entries(requestListData).map(v => v[1])
  if (!!rules?.length) {
    // 过滤白名单规则的数据
    dataList = dataList.filter(v => {
      return rules.some(r => isMatchingPattern(v.url, r))
    })
  }
  if (excludeRules?.length) {
    dataList = dataList.filter(v => {
      return excludeRules.every(r => !isMatchingPattern(v.url, r))
    })
  }
  if (!!dataList.length) {
    if (sdkLoaded) {
      const event = new CustomEvent('mock-request-end', { detail: dataList.filter(data => data.url) });
      window.dispatchEvent(event);
    } else {
      dataList.forEach(data => {
        requestListSendData[data.url as string] = data
      })
    }
  }
}

const resetMock = () => {
  XMLHttpRequest.prototype.open = openNative
  XMLHttpRequest.prototype.send = sendNative
  XMLHttpRequest.prototype.addEventListener = originalAddEventListener
  XMLHttpRequest.prototype.setRequestHeader = originalSetRequestHeader
  window.fetch = originalFetch
}

const getMockData = (url_) => {
  // 1为本地数据
  if (mockInterface[url_] && mockInterface[url_].activeType == 1) {
    return mockInterface[url_].data
  }
  return null
}

/**
 * @name 发送接口数据给web面板
 * @param url 接口path
 * @param isLoad sdk是否加载完成
 * @returns 
 */
const sendRequestEffect = (url: string, isLoad: Boolean) => {
  mockRequestEffect[url] = true
  if (!isLoad) return
  const event = new CustomEvent('mock-request-effect', { detail: url })
  window.dispatchEvent(event);
  delete mockRequestEffect[url]
}

/**
 * @name sdk 主函数，用于开启拦截 XHR 和 fetch 请求，发送接口数据到 web 面板
 * @param options {Object} 配置项
 * @param options.rules {Array} 需要拦截的域名列表
 * @param options.excludeRules {Array} 需要排除的域名列表
 */
const startMock = async(options) => {
  const xhrOpen = XMLHttpRequest.prototype.open
  const xhrSend = XMLHttpRequest.prototype.send
  const { rules = [], excludeRules = [] } = options || {}
  const excludeRules_ = [...excludeRules,
    /hot-update/,
    /umiui/,
    /dev-server/,
    /devScripts/,
    /umi/,
    /undefined/,
    /localhost/,
    /favicon\.ico/,
  ]
  const store = new Store()
  const mockRequestList = await store.getItem('mock-requestList') || []
  
  // 替换接口url为mock接口
  mockRequestList.forEach(v => {
    if (v.isOpen) {
      mockInterface[v.url] = v
    }
  })
  // 上报数据
  let requestListData: Record<string, ReportListItem> = {}
  const setRequestListData = ({
    url, data, status, updateData
  }: {
    url: string,
    data: any,
    status: number,
    updateData?: any
  }) => {
    requestListData[url].data = data
    requestListData[url].status = status
    requestListData[url].updateData = updateData || data

  }
  XMLHttpRequest.prototype.send = function(...arg) {
    const xhr = this;
    const onreadystatechange = this.onreadystatechange
    const url_ = sliceUrlPath(xhr.originRequestUrl)
    const isMock = mockInterface[url_] && mockInterface[url_].isOpen
    if (isRealRequest.get(xhr)) {
      return xhrSend.apply(xhr, arg)
    }
    this.onreadystatechange = function(...args) {
      if (this.readyState === this.DONE) {
        if (this.responseType === 'text' || this.responseType === '') {
          this.originResponse = this.responseText;
        } else {
          this.originResponse = this.response;
        }
        // 开启本地mock并且等待响应
        if (isMock && mockInterface[url_].activeType == 1 && mockInterface[url_].isWaitResponse) {
          const overrideText = getMockData(url_)
          Object.defineProperties(xhr, {
            readyState: { get: () => 4, configurable: true },
            status: { get: () => 200, configurable: true },
            response: { get: () => overrideText || this.originResponse, configurable: true },
            responseText: { get: () => overrideText || this.originResponse, configurable: true },
            statusText: { get: () => 'OK', configurable: true }
          });
          printLog({
            url: url_,
            mockData: overrideText
          })
        }
        // 发送数据到面板 匹配规则的数据以及等待真实响应的数据
        if (url_ && requestListData[url_] && isUrlValid(url_, rules, excludeRules_) && (!isMock || mockInterface[url_].isWaitResponse)) {
          setRequestListData({
            url: url_,
            data: isString(xhr.response) ? xhr.response : JSON.stringify(xhr.response),
            status: isMock ? 200 : xhr.status,
            updateData: isString(xhr.originResponse) ? xhr.originResponse : JSON.stringify(xhr.originResponse),
          })
          sendResponse({
            requestListData,
            rules,
            excludeRules: excludeRules_,
            sdkLoaded: isMockSdkLoad
          })
          delete requestListData[url_]
        }
      }
      if (typeof onreadystatechange === 'function') {
        onreadystatechange.apply(this, args)
      }
    }
    if (isMock && mockInterface[url_]?.activeType == 1) {
      const mockData = getMockData(url_);
      // 本地mock开启 等待请求响应处理错误 默认为false
      if (mockInterface[url_].isWaitResponse) {
        this.onerror = function() {
          // 对mock的接口错误进行处理
          Object.defineProperties(xhr, {
            readyState: { get: () => 4, configurable: true },
            status: { get: () => 200, configurable: true },
            response: { get: () => mockData, configurable: true },
            responseText: { get: () => typeof mockData === 'string' ? mockData : JSON.stringify(mockData), configurable: true },
            statusText: { get: () => 'OK', configurable: true }
          });
          // 触发 load 事件，模拟请求成功
          const loadEvent = new Event('load');
          this.dispatchEvent(loadEvent);
        }
        xhrSend.apply(this, arg)
      } else {
        // 创建真实请求
        const realXhr = cloneXHR(xhr)
        isRealRequest.set(realXhr, true);
        // 发送真实请求
        realXhr.send(arg as any)
        // 监听真实请求的状态变化
        realXhr.onreadystatechange = function() {
          if (realXhr.readyState === realXhr.DONE) {
            const realResponse = realXhr.responseType === 'text' || realXhr.responseType === ''
              ? realXhr.responseText
              : realXhr.response;

            // 更新 requestListData 中的 updateData 为真实响应数据
            if (url_ && requestListData[url_] && isUrlValid(url_, rules, excludeRules_)) {
              setRequestListData({
                url: url_,
                data: isString(mockData) ? mockData : JSON.stringify(mockData),
                status: realXhr.status,
                updateData: isString(realResponse) ? realResponse : JSON.stringify(realResponse)
              });

              // 发送更新后的数据
              sendResponse({
                requestListData,
                rules,
                excludeRules: excludeRules_,
                sdkLoaded: isMockSdkLoad
              });

              delete requestListData[url_];
            }
          }
        };
        // 立即返回mock数据
        setTimeout(() => {
          Object.defineProperties(xhr, {
            readyState: { get: () => 4, configurable: true },
            status: { get: () => 200, configurable: true },
            response: { get: () => mockData, configurable: true },
            responseText: { get: () => typeof mockData === 'string' ? mockData : JSON.stringify(mockData), configurable: true },
            statusText: { get: () => 'OK', configurable: true }
          });
          if (xhr.onreadystatechange) {
            xhr.onreadystatechange();
          }
          if (xhr.onload) {
            xhr.onload();
          }
          ['loadstart', 'load', 'loadend'].forEach(eventType => {
            const event = new Event(eventType);
            xhr.dispatchEvent(event);
          });
          const readyStateEvent = new Event('readystatechange');
          xhr.dispatchEvent(readyStateEvent);
          printLog({
            url: url_,
            mockData: mockData
          })
        }, 0);
      }
    }else {
      xhrSend.apply(this, arg)
    }
  }

  XMLHttpRequest.prototype.open = function(method, url: string, ...args) {
    const curArgs = Array.from(arguments)
    const xhr = this;
    const url_ = sliceUrlPath(parseFullUrl(url))
    // 不一定请求成功 新接口这里都是请求失败
    const reportData = {
      url: url_,
      method,
      status: xhr.status,
      effectLocation: location.href.split('?')[0]
    }
    if (url_ && isUrlValid(url_, rules, excludeRules_)) {
      requestListData[url_] = reportData
    }
    const isMock = mockInterface[url_] && mockInterface[url_].isOpen
    this.originRequestUrl = url_
    if (isMock && mockInterface[url_]) {
      // 远程mock 替换requestUrl
      if (mockInterface[url_].activeType == 2 && mockInterface[url_].mockUrl) {
        curArgs[1] = '//' + mockInterface[url_].mockUrl
        printLog({
          url: url_,
          mockUrl: mockInterface[url_].mockUrl
        })
      }
      sendRequestEffect(url_, isMockSdkLoad)
    }
    // 保存完整的 open 参数
    this._openArgs = {
      method,
      url,
      async: args[0],
      username: args[1],
      password: args[2]
    }
    this._events = this._events || {}
    // eslint-disable-next-line prefer-rest-params
    xhrOpen.apply(this, curArgs as any)
  }

  XMLHttpRequest.prototype.addEventListener = function(type, listener, options) {
    this._events = this._events || {};
    this._events[type] = this._events[type] || [];
    this._events[type].push({ listener, options });
    return originalAddEventListener.apply(this, arguments);
  };

  XMLHttpRequest.prototype.setRequestHeader = function(name, value) {
    if (!this._requestHeaders) {
      this._requestHeaders = [];
    }
    this._requestHeaders.push({ name, value });
    return originalSetRequestHeader.apply(this, arguments);
  }

  
  // 重写 fetch 函数
  window.fetch = function(url, options) {
    let url_ = ''
    if (url) {
      if (typeof url === 'string') {
        url_ = sliceUrlPath(parseFullUrl(url))
      } else if (typeof url === 'object' && url instanceof Request) {
        url_ = sliceUrlPath(parseFullUrl(url.url))
      }
      if (isUrlValid(url_, rules, excludeRules_)) {
        requestListData[url_] = {
          method: options?.method || "GET",
          effectLocation: location.href.split('?')[0],
          url: url_
        }
      }
    }
    
    const curArgs = Array.from(arguments)
    const _this = this
    const isMock = mockInterface[url_] && mockInterface[url_].isOpen
    const isFetchMock = isMock && mockInterface[url_].activeType == 2
    
    if (isMock) {
      if (isFetchMock) {
        // 远程 mock，替换请求 URL
        if (typeof curArgs[0] === 'string') {
          // 如果 input 是字符串 URL，直接替换
          curArgs[0] = '//' + mockInterface[url_].mockUrl;
        } else if (curArgs[0] instanceof Request) {
          // 如果 input 是 Request 对象，创建新的 Request 对象，修改其 URL
          const newRequest = new Request('//' + mockInterface[url_].mockUrl, {
            method: curArgs[0].method,
            headers: curArgs[0].headers,
            body: curArgs[0].body,
            mode: curArgs[0].mode,
            credentials: curArgs[0].credentials,
            cache: curArgs[0].cache,
            redirect: curArgs[0].redirect,
            referrer: curArgs[0].referrer,
            integrity: curArgs[0].integrity,
            keepalive: curArgs[0].keepalive,
            signal: curArgs[0].signal
          });
          curArgs[0] = newRequest;
        }
        printLog({
          url: url_,
          mockUrl: mockInterface[url_].mockUrl
        })
      }
      sendRequestEffect(url_, isMockSdkLoad)
    }
  
    const realFetchPromise = originalFetch.apply(_this, curArgs as any)
  
    return new Promise((resolve, reject) => {
      if (isMock && !isFetchMock) {
        const mockData = mockInterface[url_].data
        if (mockInterface[url_].isWaitResponse) {
          // 等待真实请求完成后返回 mock 数据
          realFetchPromise
            .then(response => {
              const responseClone = response.clone();
              // 处理真实请求的响应用于数据上报
              if (response.ok && requestListData[url_]) {
                responseClone.text().then(data => {
                  setRequestListData({
                    url: url_,
                    data: data,
                    status: response.status
                  })
                })
              }
              // 等待真实响应读取完成
              return response.text().then(() => {
                resolve(new Response(mockData, { status: 200 }))
                printLog({
                  url: url_,
                  mockData: mockData
                })
              })
            })
            .catch(() => {
              resolve(new Response(mockData, { status: 200 }))
            })
            .finally(() => {
              if (url_ && requestListData[url_] && isUrlValid(url_, rules, excludeRules_)) {
                sendResponse({
                  requestListData,
                  rules,
                  excludeRules: excludeRules_,
                  sdkLoaded: isMockSdkLoad
                })
                setTimeout(() => {
                  delete requestListData[url_]
                },10)
              }
            });
        } else {
          // 立即返回 mock 数据
          resolve(new Response(mockData, { status: 200 }));
          printLog({
            url: url_,
            mockData: mockData
          })
          // 继续处理真实请求的响应用于数据上报
          realFetchPromise
            .then(response => {
              const responseClone = response.clone();
              if (response.ok && requestListData[url_]) {
                responseClone.text().then(data => {
                  setRequestListData({
                    url: url_,
                    data: data,
                    status: response.status
                  })
                })
              }
            })
            .finally(() => {
              if (url_ && requestListData[url_] && isUrlValid(url_, rules, excludeRules_)) {
                sendResponse({
                  requestListData,
                  rules,
                  excludeRules: excludeRules_,
                  sdkLoaded: isMockSdkLoad
                })
                setTimeout(() => {
                  delete requestListData[url_]
                },10)
              }
            });
        }
      } else {
        // 非 mock 或远程 mock 的正常请求处理
        realFetchPromise
          .then(response => {
            const responseClone = response.clone();
            if (response.ok && requestListData[url_]) {
              responseClone.text().then(data => {
                setRequestListData({
                  url: url_,
                  data: data,
                  status: response.status
                })
              })
            }
            resolve(response)
          })
          .catch(reject)
          .finally(() => {
            if (url_ && requestListData[url_] && isUrlValid(url_, rules, excludeRules_)) {
              sendResponse({
                requestListData,
                rules,
                excludeRules: excludeRules_,
                sdkLoaded: isMockSdkLoad
              })
              // 为什么要延迟？ 因为response.clone().text().then是异步的，如果立即删除，可能会导致数据丢失
              setTimeout(() => {
                delete requestListData[url_]
              }, 10)
            }
          });
      }
    });
  }
  
  console.log('fetch XMLHttpRequest重写成功')
  
}

// 监听SDK事件
export const listenMockSwitch = (options) => {
  // 监听全局开关
  window.addEventListener("mock-global-switch", (event: CustomEventInit) => {
    if (event.detail) {
      startMock(options)
    } else {
      resetMock()
    }
  });
  // 监听mock开关
  window.addEventListener("mock-interface-switch", (event: CustomEventInit) => {
    if (event.detail) {
      const { url, isOpen, deleteAll } = event.detail
      if (deleteAll) {
        for (const key in mockInterface) {
          delete mockInterface[key]
        }
      } else {
        if (isOpen) {
          mockInterface[url] = Object.assign({}, mockInterface[url], event.detail)
        } else {
          delete mockInterface[url]
        }
      }
    }
  });
  // 监听sdk加载完成
  window.addEventListener("mock-sdk-loaded", (event: CustomEventInit) => {
    if (event.detail) {
      isMockSdkLoad = true
      // 此时sdk可能还没有开始监听 现在触发事件也监听不到
      setTimeout(() => {
        const mockRequestEffectData = Object.keys(mockRequestEffect)
        if (mockRequestEffectData.length) {
          for (const url of mockRequestEffectData) {
            sendRequestEffect(url, isMockSdkLoad)
          }
        }
        sendResponse({
          requestListData: requestListSendData,
          sdkLoaded: true
        })
      }, 1000)
    }
  });
}

export default startMock
