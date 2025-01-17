import React, { useState, useEffect, useCallback } from "react";
import close from "@/assets/close.svg";
import SideDrawer from "./SideDrawer";
import "./index.less";
import ApiOutlined from "@ant-design/icons/ApiOutlined";
/**
 * 定向mock浮标组件
 * @returns React.JSXElement
 */
const DragBarContainer: React.FC = () => {
  const [closeState, setCloseState] = useState(false);
  const [ballEntryState, setBallEntryState] = useState(false);
  const [open, setOpen] = useState(false);
  const [showBallEntry, setShowBallEntry] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [startOffset, setStartOffset] = useState(0);
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
  const handleClose = () => {
    console.log('handleClose')
    setShowBallEntry(false);
  };

  // 处理拖拽逻辑
  const handleDrag = useCallback((clientY: number) => {
    const newY = Math.min(
      Math.max(clientY - startOffset, 50), // 上边界（留50px边距）
      window.innerHeight - 50, // 下边界
    );
    setPosition((prev) => ({ ...prev, y: newY }));
  }, [startOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    setStartOffset(offsetY);
    setIsDragging(true);
  };

  // PC端鼠标事件
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleDrag(e.clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleDrag]);

  // 移动端触摸事件
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        handleDrag(touch.clientY);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, handleDrag]);
  return (
    <>
      {
        showBallEntry && <div className="mock_drag_container" onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter}>
          <div
            className={`ball_entry ${ballEntryState ? "ball_entry_hover" : ""}`}
            style={{
              position: 'absolute',
              transform: `translate3d(${closeState ? '-35px' : '-30px'}, ${position.y}px, 0)`,
              transition: isDragging ? 'none' : 'transform 0.3s',
              cursor: 'move',
              pointerEvents: 'auto',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={(e) => {
              setIsDragging(true);
              e.preventDefault();
            }}
            onClick={onOpenSideDrawer}
          >
            <>
              <div
                className={`close_wrapper`}
                onClick={handleClose}
                style={{
                  transform: `translateX(${closeState ? '-10px' : '13px'})`,
                  transition: closeState ? 'transform 0.3s' : 'none',
                }}
              >
                <img src={close} style={{ width: 12 }} />
              </div>
              <div className="ball_wrapper">
                <ApiOutlined />
              </div>
            </>
          </div>
          {<SideDrawer open={open} onCancel={() => setOpen(false)} onHide={() => setShowBallEntry(false)} />}
        </div>
      }
    </>
  );
};

export default DragBarContainer;
