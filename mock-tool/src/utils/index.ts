export function EnvironmentalTag() {
  const dev = process.env.NODE_ENV === 'development'
  let tag = 'pro'
  if (dev) {
    tag = 'dev'
  }
  return tag
}

export function isString(wat) {
  return Object.prototype.toString.call(wat) === '[object String]';
}

function isRegExp(wat) {
  return Object.prototype.toString.call(wat) === '[object RegExp]';
}

export function isMatchingPattern(value, pattern) {
  if (!isString(value)) {
    return false;
  }
  if (isRegExp(pattern)) {
    return pattern.test(value);
  }
  if (typeof pattern === 'string') {
    return value.indexOf(pattern) !== -1;
  }
  return false;
}

// throttle 用于函数节流
export const throttle = (fn: Function, delay: number) => {
  let timer = null
  return function(...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args)
        timer = null
      }, delay)
    }
  }
}

// debounce 用于函数防抖
export const debounce = (fn: Function, delay: number) => {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export const sliceUrlPath = (url: string) => {
  // 把url的search参数和协议去掉
  let urlArr = url.split('?')
  if (urlArr[0].indexOf('//') > -1) {
    let urlPath = urlArr[0].split('//')[1]
    return urlPath
  } else {
    return urlArr[0]
  }
}

export const isUrlValid = (url: string, rules?: string[], excludeRules_?: string[]): boolean => {
  // 检查白名单规则
  if (rules?.length) {
    const isWhitelisted = rules.some(rule => isMatchingPattern(url, rule));
    if (!isWhitelisted) {
      return false; // 如果不在白名单中，返回 false
    }
  }

  // 检查黑名单规则
  if (excludeRules_?.length) {
    const isBlacklisted = excludeRules_.some(rule => isMatchingPattern(url, rule));
    if (isBlacklisted) {
      return false; // 如果在黑名单中，返回 false
    }
  }

  return true; // 如果通过所有检查，返回 true
};

// 复制 XHR 的所有配置
export function cloneXHR(originalXhr) {
  const newXhr = new XMLHttpRequest();

  // 1. 复制 open 配置
  const openArgs = originalXhr._openArgs;
  newXhr.open(
    openArgs.method,
    openArgs.url,
    openArgs.async,
    openArgs.username,
    openArgs.password
  );

  // 2. 复制所有请求头
  if (originalXhr._requestHeaders) {
    originalXhr._requestHeaders.forEach(({value, name}) => {
      newXhr.setRequestHeader(name, value);
    });
  }

  // 3. 复制 xhr 属性
  const copyProperties = [
    'timeout',
    'withCredentials',
    'responseType',
    'msCaching',
    'mimeType'
  ];

  copyProperties.forEach(prop => {
    if (originalXhr[prop] !== undefined) {
      try {
        newXhr[prop] = originalXhr[prop];
      } catch (e) {
        console.warn(`Failed to copy property ${prop}:`, e);
      }
    }
  });

  // 4. 复制事件监听器
  const events = [
    'abort',
    'error',
    'load',
    'loadend',
    'loadstart',
    'progress',
    'readystatechange',
    'timeout'
  ];

  // 复制 on* 事件处理器
  events.forEach(eventType => {
    const eventHandler = originalXhr[`on${eventType}`];
    if (typeof eventHandler === 'function') {
      newXhr[`on${eventType}`] = eventHandler.bind(newXhr);
    }
  });

  // 复制 addEventListener 添加的事件监听器
  if (originalXhr._events) {
    Object.entries(originalXhr._events).forEach(([type, listeners]) => {
      (listeners as any).forEach(({ listener, options }) => {
        newXhr.addEventListener(type, listener.bind(newXhr), options);
      });
    });
  }

  // 5. 添加上传事件处理
  if (originalXhr.upload) {
    events.forEach(eventType => {
      const uploadHandler = originalXhr.upload[`on${eventType}`];
      if (typeof uploadHandler === 'function') {
        newXhr.upload[`on${eventType}`] = uploadHandler.bind(newXhr.upload);
      }
    });
  }

  return newXhr;
}

export const printLog = ({
  url,
  mockUrl,
  mockData
}: any)=>{
  if(mockUrl) {
    console.groupCollapsed(`%cMatched XHR Response modified：${url}`, 'background-color: #108ee9; color: white; padding: 4px');
    console.info('%cModified Request Url：', 'background-color: #ff5500; color: white;', mockUrl);
  }else {
    console.groupCollapsed(`%cMatched XHR Response modified：${url}`, 'background-color: #108ee9; color: white; padding: 4px');
    console.info(`%cOriginal Request Url：`, 'background-color: #ff8040; color: white;', url);
    console.info('%cModified Response Payload：', 'background-color: #ff5500; color: white;', JSON.parse(mockData || null));
  }
  console.groupEnd();
}
