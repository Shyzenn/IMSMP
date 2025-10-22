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
      className={`cursor-pointer bg-[#2b9e78] hover:bg-[#41b08d] transition-all ease-in-out duration-300 text-white rounded-md ${className} flex items-center gap-2`}
      disabled={disabled}
    >
      {icon}
      {label}
    </button>
  );
};

export default AddButton;
