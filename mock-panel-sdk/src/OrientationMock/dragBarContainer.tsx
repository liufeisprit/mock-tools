import React, { useState } from "react";
import close from "@/assets/close.svg";
import SideDrawer from "./SideDrawer";
import "./index.less";
import AreaChartOutlined from "@ant-design/icons/AreaChartOutlined";
/**
 * 定向mock浮标组件
 * @returns React.JSXElement
 */
const DragBarContainer: React.FC = () => {
  const [closeState, setCloseState] = useState(false);
  const [ballEntryState, setBallEntryState] = useState(false);
  const [open, setOpen] = useState(false);
  const onMouseEnter = () => {
    setCloseState(true);
    setBallEntryState(true);
  };
  const onMouseLeave = () => {
    setCloseState(false);
    setBallEntryState(false);
  };
  const onOpenSideDrawer = () => {
    setOpen(true);
    setCloseState(false);
    setBallEntryState(false);
  };
  return (
    <div className="mock_drag_container" onMouseLeave={onMouseLeave}>
      <div
        className={`close_wrapper ${closeState ? "close_wrapper_hover" : ""}`}
      >
        <img src={close} style={{ width: 12 }} />
      </div>
      <div
        className={`ball_entry ${ballEntryState ? "ball_entry_hover" : ""}`}
        onMouseEnter={onMouseEnter}
        onClick={onOpenSideDrawer}
      >
        <div className="ball_wrapper">
          <AreaChartOutlined />
        <div />
        </div>
      </div>
      {<SideDrawer open={open} onCancel={() => setOpen(false)} />}
    </div>
  );
};

export default DragBarContainer;
