"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string;
  bgColor?: string;
  padding?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  width = "max-w-[40rem]",
  bgColor = "bg-white",
  padding = "p-6",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40"
      onClick={onClose} // close if clicking backdrop
    >
      <div
        className={`${bgColor} rounded-lg shadow-lg overflow-hidden ${width} max-h-[90vh] w-full`}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className={`overflow-y-auto max-h-[90vh] ${padding} ${bgColor}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
