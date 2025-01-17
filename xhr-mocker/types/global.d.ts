type ReportListDataItem = {
  url: string | URL
  method: string
  effectLocation: string
  status?: number
  data?: any
  updateData?: any
}

type MockInterfaceItem = {
  url: string;
  mockUrl?: string;
  mockMethod?: string;
  method: string;
  status?: number;
  isOpen?: boolean;
  isWaitResponse?: boolean; // 是否等待真实响应结束
  activeType?: 1 | 2; // 1 本地 2 fetch
  data?: any;
  updateData?: any;
  effectLocation: string; // 生效的页面
  isCurrentPage?: boolean; // 是否是当前页面
}

type InitOptions = {
  rules?: string[]
  excludeRules?: string[]
  mockPanelSdkUrl: string
  disabled?: boolean
}
