import { ConfigProvider, theme } from 'antd'
import DragBarContainer from './OrientationMock/dragBarContainer';
import './global.less'
export default function App(){
  ConfigProvider.config({
    // 5.13.0+
    holderRender: (children) => <ConfigProvider prefixCls="mock-sdk" theme={{ algorithm: theme.compactAlgorithm } }>{children}</ConfigProvider>
  });
  return (
    <ConfigProvider
      prefixCls='mock-sdk'
      theme={{
        algorithm: theme.compactAlgorithm
      }}
    >
      <DragBarContainer/>
    </ConfigProvider>
  );
}
