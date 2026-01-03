import React, { ReactNode } from "react";

const FormField = ({
  label,
  error,
  children,
  icon,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  icon?: ReactNode;
}) => {
  return (
    <div className="w-full flex flex-col text-left">
      <label className="text-sm font-medium mb-[3px] text-gray-700 flex gap-2 items-center">
        {label} {icon}
      </label>
      {children}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
