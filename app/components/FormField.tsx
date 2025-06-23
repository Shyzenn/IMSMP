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
    <div className="w-full">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;
