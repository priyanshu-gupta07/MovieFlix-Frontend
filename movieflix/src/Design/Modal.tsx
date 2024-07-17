import React from "react";
import { ReactNode } from "react";
import ReactDOM from "react-dom";

type PropsType = {
  backDropCls?: string;
  cardCls?: string;
  onHandleClick?: () => void;
  children: ReactNode;
};

const Modal = ({
  backDropCls = "fixed inset-0 z-50 bg-black/80 backdrop-blur flex flex-col justify-center items-center overflow-y-auto",
  cardCls = "bg-white/20 p-2 rounded-lg w-full max-w-[766px] m-4",
  onHandleClick,
  children,
}: PropsType) => {
  const portalContainer = document.getElementById("overlays");

  if (!portalContainer) {
    console.error("Portal container not found");
    return null;
  }

  return ReactDOM.createPortal(
    <div className={backDropCls}>
      <div className={cardCls}>
        <button
          type="button"
          className="rounded text-white px-2 bg-red-500 hover:bg-red-800 active:bg-red-400 w-fit block ml-auto"
          onClick={onHandleClick}
        >
          X
        </button>
        {children}
      </div>
    </div>,
    portalContainer
  );
};

export default Modal;