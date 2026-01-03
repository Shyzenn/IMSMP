"use client";

import React from "react";
import { createPortal } from "react-dom";
import OrderDetailsModal from "./OrderDetailsModal";
import EmergencyOrderModal from "./EmergencyModal";

export default function ModalPortal() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <>
      <OrderDetailsModal hasPrint={true} />
      <EmergencyOrderModal />
    </>,
    document.body
  );
}
