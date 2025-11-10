import React, { ReactNode } from "react";

const FormField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) => {
  return (
    <div className="w-full flex flex-col text-left">
      <label className="text-sm font-medium mb-[3px] text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default FormField;
