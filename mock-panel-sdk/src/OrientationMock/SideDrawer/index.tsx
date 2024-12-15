import { useEffect, useState } from "react";
import { Drawer, Switch, Radio, message, Button, Popconfirm } from "antd";
import FetchList from "./FetchList";
import StoreFn from "@/utils/store";
import { debounce } from "lodash";

const Store = new StoreFn();
export type ReportListItem = {
  url: string;
  mockUrl?: string;
  method: string;
  status?: number;
  isOpen?: boolean;
  isWaitResponse?: boolean;
  // 1 本地 2 fetch
  activeType?: 1 | 2;
  data?: any;
  updateData?: any;
  effectLocation: string;
  globalRouteTag?: string;
  isCurrentPage?: boolean
  name?: string;
  id?: number;
  priority?: number;
  data_source?: number
};
let requestListData: any[] = []
const SideModal = ({
  open,
  onCancel,
  width = "75%",
}: {
  open?: boolean;
  onCancel?: () => void;
  width?: number | string;
}) => {
  const [requestList, setRequestList] = useState<ReportListItem[]>([]);
  const [mockUrlMap, setMockUrlMap] = useState<Record<string, any>>({});
  // 全局开关
  const all_opened = localStorage.getItem("mock_tools_all_opened");
  const [globalSwitch, setGlobalSwitch] = useState(
    all_opened != undefined ? all_opened.toLowerCase() === "true" : false
  );
  // Drawer 显示信息
  const [drawerInfo, setDrawerInfo] = useState<{
    placement: "right" | "bottom";
  }>({
    placement: "right",
  });
  const toastMock = debounce(async (res: Record<string, any>) => {
    const mockData_ = Object.keys(res);
    if (mockData_.length) {
      message.info('mock数据已生效 可在控制台或打开mock面板查看')
      setMockUrlMap({});
    }
  }, 2000);
  // 保存请求url到indexdb
  const saveReqList = (data: any[]) => {
    Store.setItem(
      "mock-requestList",
      data.map((v) => {
        const { updateData, isCurrentPage, ...other } = v;
        return other;
      })
    );
  };
  // 切换开关的loading状态
  const [loadingState, setLoadingState] = useState({});
  // 切换全局开关时通知init关闭或者打开mock
  const changeGlobalSwitch = (checked: boolean) => {
    const event = new CustomEvent("mock-global-switch", { detail: checked });
    window.dispatchEvent(event);
  };


  /**
   * 初始化sdk
   */
  const init = async () => {
    console.log("init-sdk");
    const urlList = (await Store.getItem("mock-requestList")) || [];
    if (urlList.length) {
      setRequestList(urlList);
    }
    window.addEventListener("mock-request-end", async (event: CustomEventInit) => {
      const existingData: any[] = event.detail.concat(requestListData)
      const uniqueDataMap = new Map();
      existingData.forEach(item => {
        if (!uniqueDataMap.has(item.url)) {
          uniqueDataMap.set(item.url, item);
        }
      })
      requestListData = Array.from(uniqueDataMap.values());
      getRequestListHandle(requestListData);
    });

    // 监听mock-init替换url为mockurl成功的消息
    window.addEventListener("mock-request-effect", (event: CustomEventInit) => {
      const mockData = Object.assign(mockUrlMap, { [event.detail]: true });
      setMockUrlMap(mockData);
      toastMock(mockData);
    });
  };

  const getRequestListHandle = debounce(async (detailData: any[]) => {
    const res: ReportListItem[] = (await Store.getItem("mock-requestList")) || []
    const currentUrl = location.href.split('?')[0];
    // 创建Map来存储detailData的顺序
    const orderMap = new Map(detailData.map((item, index) => [item.url, index]));
    let needsSort = false;
    detailData.forEach((v: any) => {
      // 避免重复添加
      const index = res.findIndex((_: any) => v.url == _.url);
      const isCurrentPage = v.effectLocation === currentUrl
      if (index == -1) {
        res.push({ ...v, isCurrentPage});
        if (isCurrentPage || v.isOpen) needsSort = true;
      } else {
        // 重复合并
        const { data, status, ...other } = v;
        const updatedItem = {
          ...res[index],
          ...other,
          data: res[index].data || v.data,
          status,
          updateData:  v.updateData,
          isCurrentPage
        };
        res[index] = updatedItem;
        if (isCurrentPage || updatedItem.isOpen) needsSort = true;
      }
    });
    // 只有在存在当前页面项目时才进行排序 再对后触发的请求排序在前面 也就是detailData的顺序
    if (needsSort) {
      res.sort((a, b) => {
        if (a.isCurrentPage !== b.isCurrentPage) {
          return b.isCurrentPage ? 1 : -1;
        }
        if (a.isCurrentPage) {
          const priorityDiff = (b.isOpen ? 1 : 0) - (a.isOpen ? 1 : 0);
          if (priorityDiff !== 0) return priorityDiff;
        }

        // 在优先级相同的情况下，按照detailData的顺序排序
        const orderA = orderMap.get(a.url);
        const orderB = orderMap.get(b.url);

        // 如果都在detailData中，按照detailData的顺序
        if (orderA !== undefined && orderB !== undefined) {
          return orderA - orderB;
        }
        // 如果只有一个在detailData中，将在detailData中的排在前面
        if (orderA !== undefined) return -1;
        if (orderB !== undefined) return 1;
        // 都不在detailData中的保持原有顺序
        return 0;
      });
    }
    if (all_opened) {
      saveReqList(res);
    }
    setRequestList(res);
  },500)
  useEffect(() => {
    init();
  }, []);

  // 全局开关
  const globalSwitchOnchange = (checked: boolean) => {
    setGlobalSwitch(checked);
    changeGlobalSwitch(checked);
    localStorage.setItem("mock_tools_all_opened", checked + "");
  };

  // 更新缓存数据
  const updateCacheData = ({
    index,
    res,
    isOpen,
    activeType,
    data,
  }: any) => {
    const newData = requestList.map((v, i) => {
      if (i == index) {
        const _ = v
        _.mockUrl = res?.mockPath || "";
        _.isOpen = isOpen;
        // 从列表修改默认设置值
        _.activeType = activeType || (res?.mockPath ? 2 : 1);
        _.data = data;
        return _
      }
      return v
    });
    if (index > -1) {
      setRequestList(newData);
      saveReqList(newData);
    }
    const event = new CustomEvent("mock-interface-switch", {
      detail: newData[index],
    });
    window.dispatchEvent(event);
  };

  // 单个 switch 开关切换
  const handleSwitchChange =  async (
    record: ReportListItem,
    isOpen: boolean,
    index: number
  ) => {
    const { data, mockUrl } = record;
    let activeType = record.activeType
    let res = {
      mockPath: mockUrl,
    }
    updateCacheData({ index, res, isOpen, activeType, data });
  };

  const handleWaitResponseSwitchChange = (
    isWaitResponse: boolean,
    index: number
  ) => {
    const newData = requestList.map((v, i) => {
      if (i == index) {
        v.isWaitResponse = isWaitResponse;
      }
      return v;
    });
    if (index > -1) {
      setRequestList(newData);
      saveReqList(newData);
    }
    const event = new CustomEvent("mock-interface-switch", {
      detail: newData[index],
    });
    window.dispatchEvent(event);
  }

  // 单个接口删除
  const delInterfaceHandle = (index: number)=>{
    const _ = requestList.filter((_, i) => i != index)
    setRequestList(_)
    requestListData = requestListData.filter((_, i) => i != index)
    const event = new CustomEvent("mock-interface-switch", {
      detail: Object.assign({}, requestList[index], { isOpen : false }),
    });
    window.dispatchEvent(event);
    Store.setItem("mock-requestList", _)
  }

  const delAllInterface = ()=>{
    setRequestList([])
    requestListData = []
    Store.setItem("mock-requestList", [])
    const event = new CustomEvent("mock-interface-switch", {
      detail: {
        deleteAll: true
      },
    })
    window.dispatchEvent(event);
  }

  // local response / mock response 数据弹窗保存并使用
  const urlMockOnChange = async (
    record: ReportListItem,
    isOpen: boolean,
    index: number
  ) => {
    const {
      url,
      activeType,
      data,
      mockUrl,
    } = record;
    try {
      let res = {
        mockPath: mockUrl,
      };
      // local response
      updateCacheData({ index, res, isOpen, activeType, data });
    } catch (error) {
      setLoadingState((prevState) => ({
        ...prevState,
        [url]: false,
      }));
    }
  };

  return (
    <Drawer
      title="定向 Mock"
      open={open}
      onClose={onCancel}
      width={width}
      mask={true}
      placement={drawerInfo.placement}
      height={'50%'}
      extra={
        <Radio.Group
          value={drawerInfo.placement}
          onChange={(e) =>
            setDrawerInfo({
              ...drawerInfo,
              placement: e.target.value,
            })
          }
        >
          <Radio value="right">右固定</Radio>
          <Radio value="bottom">底部固定</Radio>
        </Radio.Group>
      }
    >
      {/* 全局开关 */}
      <div className="mb-20" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Switch
          checkedChildren="开始监听"
          unCheckedChildren="关闭监听"
          checked={globalSwitch}
          onChange={globalSwitchOnchange}
        />
        <Popconfirm
          title="确认要删除吗?"
          description="删除后本地数据将被清空?"
          onConfirm={delAllInterface}
          okText="确认"
          cancelText="取消"
        >
          <Button type="link">删除全部</Button>
        </Popconfirm>
      </div>
      {/* 请求列表 */}
      <div style={{
        opacity: globalSwitch ? 1 : 0.5
      }}>
        <FetchList
          requestList={requestList}
          onChange={urlMockOnChange}
          handleSwitchChange={handleSwitchChange}
          handleWaitResponseSwitchChange={handleWaitResponseSwitchChange}
          delInterfaceHandle={delInterfaceHandle}
          loadingState={loadingState}
        />
      </div>
    </Drawer>
  );
};

export default SideModal;
