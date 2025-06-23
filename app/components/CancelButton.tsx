import React from "react";
import { FieldValues, UseFormReset } from "react-hook-form";

type CancelButtonType<T extends FieldValues = FieldValues> = {
  setIsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  reset?: UseFormReset<T>;
  onClick?: () => void;
  setTypedProductNames?: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
};

const CancelButton = <T extends FieldValues>({
  setIsModalOpen,
  reset,
  onClick,
  setTypedProductNames,
}: CancelButtonType<T>) => {
  return (
    <>
      <button
        type="button"
        className="border px-6 py-2 rounded-md hover:bg-gray-50"
        onClick={() => {
          setIsModalOpen?.(false);
          reset?.();
          onClick?.();
          setTypedProductNames?.({});
        }}
      >
        Cancel
      </button>
    </>
  );
};

export default CancelButton;
