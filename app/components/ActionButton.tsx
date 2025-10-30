import React from "react";
import { IconType } from "react-icons/lib";

const ActionButton = ({
  icon: Icon,
  onClick,
  color,
  type,
  label,
}: {
  icon: IconType;
  onClick?: () => void;
  color: string;
  type?: "submit" | "button";
  label?: string;
}) => {
  return (
    <button
      className={`border p-1 rounded-md ${color} flex gap-2 items-center`}
      onClick={onClick}
      type={type}
    >
      <Icon className="text-black" />
      {label}
    </button>
  );
};

export default ActionButton;
