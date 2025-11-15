"use client";

import React from "react";
import { useModal } from "../hooks/useModal";
import AddButton from "./Button";
import MedTechReqModal from "./MedTechReqModal";

const MedTechReqBtn = () => {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <AddButton
        label="Request Order"
        className="px-6 py-2 flex items-center gap-2 w-auto"
        onClick={open}
      />

      {isOpen && <MedTechReqModal close={close} />}
    </>
  );
};

export default MedTechReqBtn;
