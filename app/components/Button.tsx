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
      className={`bg-green-500 text-white py-2 px-6 rounded-md hover:bg-green-400 flex items-center gap-2 ${className}`}
      disabled={disabled}
    >
      {icon}
      {label}
    </button>
  );
};

export default AddButton;
