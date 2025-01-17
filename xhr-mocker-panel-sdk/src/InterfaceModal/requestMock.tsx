import { forwardRef, useImperativeHandle, useState,useEffect } from 'react'
import { Input, Card, Space,Select } from 'antd'
import { HTTP_METHOD_MAP } from '../common/value'
const RequestMock = forwardRef((props: {
  mockUrl?: string
  mockMethod?: string
}, ref) => {
  const { mockUrl,mockMethod } = props;
  const [replacementUrl, setReplacementUrl] = useState(mockUrl || '');
  const [replacementMethod, setReplacementMethod] = useState(mockMethod ||'');
  useEffect(()=>{
    if(mockMethod){
      setReplacementMethod(mockMethod)
    }
  }, [mockMethod])
  useEffect(()=>{
    if(mockUrl){
      setReplacementUrl(mockUrl)
    }
  }, [mockUrl])
  useImperativeHandle(ref, () => ({
    getValue: () => {
      return {
        url: replacementUrl,
        method: replacementMethod
      }
    }
  }))
  return (
    <>
      <Card title="Replacement Request URL" type="inner" size="small" >
        <Space.Compact style={{ width: '100%' }}>
          <Select
            popupMatchSelectWidth={false}
            value={replacementMethod}
            onChange={(value) => setReplacementMethod(value)}
          >
            <Select.Option value="">*(same)</Select.Option>
            {HTTP_METHOD_MAP.map((method) => <Select.Option key={method} value={method}>{method}</Select.Option>)}
          </Select>
          <Input
            allowClear
            value={replacementUrl}
            placeholder="Please enter the URL you want to replace with."
            onChange={(e) => setReplacementUrl(e.target.value)}
          />
        </Space.Compact>
      </Card>
    </>
  )
})

export default RequestMock
