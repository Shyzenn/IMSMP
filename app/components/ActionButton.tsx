import React from "react";
import { IconType } from "react-icons/lib";

const ActionButton = ({
  icon: Icon,
  onClick,
  color,
  type,
  label,
  disabled,
}: {
  icon: IconType;
  onClick?: () => void;
  color: string;
  type?: "submit" | "button";
  label?: string;
  disabled?: boolean;
}) => {
  return (
    <button
      disabled={disabled}
      className={`border p-1 rounded-md ${color} flex gap-2 items-center text-black text-[13px]`}
      onClick={onClick}
      type={type}
    >
      <Icon className="text-base" />
      {label}
    </button>
  );
};

export default ActionButton;
