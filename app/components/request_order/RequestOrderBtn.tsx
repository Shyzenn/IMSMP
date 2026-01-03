"use client";

import React from "react";
import AddButton from "../ui/Button";
import RequestOrderModal from "./RequestOrderModal";
import { useModal } from "@/app/hooks/useModal";

const RequestOrderBtn = () => {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <AddButton
        label="Request Order"
        className="px-6 py-2 flex items-center gap-2 w-auto"
        onClick={open}
      />

      {isOpen && <RequestOrderModal close={close} />}
    </>
  );
};

export default RequestOrderBtn;
