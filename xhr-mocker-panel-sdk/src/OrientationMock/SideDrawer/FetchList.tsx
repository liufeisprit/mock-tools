import {useRef,memo,useMemo} from 'react'
import { Table, Switch, Space, Button, Tooltip, Checkbox } from 'antd'
import InterfaceModal from '../../InterfaceModal'
import { ReportListItem } from './index'
import type { ModifyDataModalOnSaveProps } from '../../InterfaceModal'
function FetchList(props: {
  requestList: ReportListItem[]
  onChange: (record: ReportListItem, isOpen: boolean,index: number) => void
  loadingState: Record<string,boolean>
  handleSwitchChange: (record: ReportListItem, isOpen: boolean,index: number) => void
  handleWaitResponseSwitchChange: (isWaitResponse: boolean,index: number) => void
  delInterfaceHandle: (index: number) => void
}) {
  const { requestList = [], onChange, loadingState = {}, handleSwitchChange, delInterfaceHandle, handleWaitResponseSwitchChange } = props
  const requestDataList = useMemo(()=>{
    return requestList.filter(v => v.effectLocation === location.href.split('?')[0])
  }, [requestList])
  const modalRef = useRef<any>({})
  // 数据弹窗保存
  const ModifyDataSave = (d: ModifyDataModalOnSaveProps, c: ReportListItem) => {
    const { responseEditorValue, type, interfaceIndex, id, name, priority, mockUrl, mockMethod } = d
    onChange(Object.assign({},c,{
      data: responseEditorValue,
      activeType: type,
      id,
      name,
      mockUrl,
      mockMethod,
      priority
    }), true, interfaceIndex)
  }
  const openInterfaceModal = (record: ReportListItem,index: number)=>{
    modalRef.current?.openModal(record, index)
  }
  const delInterface = (index: number)=>{
    delInterfaceHandle(index)
  }

  return (
    <>
      <InterfaceModal onSave={ModifyDataSave} ref={modalRef}/>
      <Table
        rowKey="url"
        columns={[{
          title: 'Index',
          render: (_, _record, index) => {
            return <span>{index+1}</span>
          }
        }, {
          title: 'Path',
          dataIndex: 'url',
          render(value, record) {
            const values = value.split('/')
            const urlPath = values.length > 1 ? values.slice(1).join('/') : value;
            const index = requestList.findIndex(v => v.url === record.url)
            return <Space>
              <div>
                {
                  <span style={{
                    color: record.isCurrentPage ? '#1890ff' : 'inherit',
                  }}>{urlPath}</span>
                }
              </div>
              {
                record.isOpen && <Tooltip title="对于本地mock的数据开启后立即返回mock数据 关闭后等待真实请求完成后返回mock数据">
                  <Checkbox
                    checked={!record.isWaitResponse}
                    onChange={e => {
                      handleWaitResponseSwitchChange(!e.target.checked, index)
                    }}
                  />
                </Tooltip>
              }
            </Space>
          },
        },
        {
          title: 'Method',
          dataIndex: 'method'
        },
        {
          title: 'Status',
          dataIndex:'status',
          render(v,record) {
            return <>{
              record.isOpen ? 200 : v
            }</>
          }
        },
        {
          title: '操作',
          dataIndex: 'operation',
          render(_,record) {
            const index = requestList.findIndex(v => v.url === record.url)
            return <Space>
              <Switch
                checkedChildren="开启Mock"
                unCheckedChildren="关闭Mock"
                checked={record.isOpen}
                loading={loadingState[record?.url]}
                onChange={checked => {
                  handleSwitchChange(record, checked, index)
                }}
              />
              <Button type='link' onClick={() => openInterfaceModal(record, index)}>查看</Button>
              <Button type='link' danger onClick={() => delInterface(index)}>删除</Button>
            </Space>
          }
        }]}
        pagination={false}
        dataSource={requestDataList}
      />
    </>
  )
}

export default memo(FetchList)
