import React, { ReactNode } from "react";

interface AddButtonProps {
  onClick?: () => void;
  label?: React.ReactNode;
  icon?: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  label = "",
  icon = "",
  className = "",
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`cursor-pointer bg-green-500 hover:bg-green-600 text-white rounded-md ${className}`}
      disabled={disabled}
    >
      {icon}
      {label}
    </button>
  );
};

export default AddButton;
