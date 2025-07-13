import React from "react";
import { IconType } from "react-icons/lib";

const ActionButton = ({
  icon: Icon,
  onClick,
  color,
  type,
}: {
  icon: IconType;
  onClick?: () => void;
  color: string;
  type?: "submit" | "button";
}) => {
  return (
    <button
      className={`border p-1 rounded-md ${color}`}
      onClick={onClick}
      type={type}
    >
      <Icon />
    </button>
  );
};

export default ActionButton;
