import {
  Drawer,
  Tabs,
  Button,
  Space,
  Flex,
  Tag,
  Tooltip,
  message,
} from "antd";
import React, {
  ForwardedRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import MonacoEditor from "../MonacoEditor";
import { RESPONSE_EXAMPLES } from "../common/value";
import { isEqual } from "lodash";
import { QuestionCircleOutlined } from '@ant-design/icons'
export interface ModifyDataModalOnSaveProps {
  interfaceIndex: number;
  responseEditorValue: string;
  name?: string;
  type: 1 | 2; // 1 本地 2 fetch
  id?: number; // 数据唯一索引
  priority?: number; // 优先级
  mockUrl?: string;
}

interface ModifyDataModalProps {
  onSave: (
    { interfaceIndex, responseEditorValue, type }: ModifyDataModalOnSaveProps,
    record: ReportListItem
  ) => void;
}

import { ReportListItem } from "../OrientationMock/SideDrawer/index";

const Wrapper = React.memo((props: { children: any }) => {
  return (
    <div style={{ height: "calc(100vh - 140px)", overflow: "auto" }}>
      {props.children}
    </div>
  );
});

const ModifyDataModal = (
  props: ModifyDataModalProps,
  ref: ForwardedRef<{
    openModal: (props: ReportListItem, index: number) => void;
  }>
) => {
  // local 编辑器 ref
  const monacoEditorResponseRef = useRef<any>({});
  // fetch 编辑器 ref
  const monacoEditorFetchResponseRef = useRef<any>({});
  // 保存并使用事件
  const { onSave = () => {} } = props;
  // modal显示隐藏
  const [visible, setVisible] = useState(false);
  // 拦截的接口列表中当前接口的索引
  const [interfaceIndex, setInterfaceIndex] = useState(0);
  // 当前选择的tab
  const [activeTab, setActiveTab] = useState("local");
  // matched url
  const [request, setRequest] = useState("");
  // local response 编辑器内容
  const [responseLocalText, setResponseLocalText] = useState("");
  // 当前生效的数据对象
  const [record, setRecord] = useState<ReportListItem>();
  useImperativeHandle(ref, () => ({
    openModal,
  }));

  /**
   * 打开弹窗
   * @param c
   * @param index
   */
  const openModal = async (c: ReportListItem, index: number) => {
    const { url, data, activeType } = c;
    const actTab = activeType;
    const isChangeInterface = index !== interfaceIndex
    setInterfaceIndex(index);
    // 查看最新接口数据
    // 本地数据
    setResponseLocalText(data);
    setRequest(url as string);
    setVisible(true);
    setActiveTab(actTab == 2 ? "fetch" : "local");
    // 最新数据和此时数据不一致 mock开启的时候 updateData为请求的真实数据
    c.updateData =
      c.updateData && !isEqual(c.updateData, c.data) ? c.updateData : null;
    setRecord(c);
    setTimeout(()=>{
      monacoEditorResponseRef.current?.formatDocumentAction?.(isChangeInterface)
    })
  };

  /**
   * 保存并使用
   */
  const handleOk = async () => {
    const { editorInstance: responseEditorInstance } =
    monacoEditorResponseRef.current;
    const { editorInstance: responseFetchEditorInstance } =
    monacoEditorFetchResponseRef.current;
    const isLocalData = activeTab == "local";
    const responseEditorValue = (
      isLocalData ? responseEditorInstance : responseFetchEditorInstance
    )?.current.getValue();
      // local response
      onSave(
        {
          interfaceIndex,
          responseEditorValue,
          type: isLocalData ? 1 : 2,
        },
        record!
      );
      message.success('保存成功');
      setVisible(false);
  };

  /**
   * 数据分类tab切换
   * @param v
   */
  const tabsOnChange = async (v: string) => {
    setActiveTab(v);
    if (v == "local") {
      // local response
      setResponseLocalText(record?.data);
    }
  };

  return (
    <>
      <Drawer
        width={"65%"}
        onClose={() => setVisible(false)}
        destroyOnClose
        title={<Space size={15}>
          <span style={{ fontSize: 12 }}>Matched URL：{request}</span>
        </Space>}
        open={visible}
        footer={
          <Flex
            justify="flex-end"
            style={{
              padding: "12px",
            }}
          >
            <Space size={15}>
              <Button type="primary" onClick={handleOk}>
                保存并使用
              </Button>
              <Button onClick={() => setVisible(false)}>取消</Button>
            </Space>
          </Flex>
        }
      >
        <Tabs
          defaultActiveKey={activeTab}
          activeKey={activeTab}
          size="small"
          onChange={(v) => tabsOnChange(v)}
          items={[
            {
              label: (
                <>
                  Local Response{" "}<Tooltip title={"数据来源于真实请求,修改后保存在本地"}
                  >
                  {/* @ts-ignore */}
                  <QuestionCircleOutlined />
                </Tooltip>
                  {record?.isOpen && record?.activeType == 1 && (
                    <Tag bordered={false} color="success">
                      生效中
                    </Tag>
                  )}
                </>
              ),
              key: "local",
              children: (
                <Wrapper>
                  <MonacoEditor
                    ref={monacoEditorResponseRef}
                    headerLeftNode={
                      <Space>
                        {
                          record?.updateData && <Tooltip title={'加载最新的请求数据'}>
                            <Button
                              type="link"
                              onClick={() =>{
                                setResponseLocalText(record?.updateData)
                              }
                              }
                            >
                              加载真实数据
                            </Button>
                          </Tooltip>
                        }
                      </Space>
                    }
                    language={"json"}
                    text={responseLocalText}
                    examples={RESPONSE_EXAMPLES}
                  />
                </Wrapper>
              ),
            }
          ]}
        />
      </Drawer>
    </>
  );
};

export default React.memo(React.forwardRef(ModifyDataModal));
