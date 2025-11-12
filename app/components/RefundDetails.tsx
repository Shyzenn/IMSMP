"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { OrderItem } from "@/lib/interfaces";
import { Button } from "@/components/ui/button";
import { useRefundStore } from "@/lib/store/useRefundStore";

const RefundDetails = () => {
  const { transaction, setRefundItems } = useRefundStore();
  const [items, setItems] = useState<OrderItem[]>([]);

  // Initialize items from transaction - start with full refund quantities
  useEffect(() => {
    if (transaction?.itemDetails) {
      // Start with original quantities (full refund)
      const initialItems = transaction.itemDetails.map((item) => ({
        ...item,
        quantity: item.quantity, // Show original quantity (full refund by default)
      }));
      setItems(initialItems);
      setRefundItems(initialItems);
    }
  }, [transaction, setRefundItems]);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * (item.price ?? 0),
    0
  );

  const handleQuantityChange = (index: number, value: string) => {
    const refundQty = Number(value);
    const originalQty = transaction?.itemDetails[index]?.quantity || 0;

    // Validate: refund quantity must be between 0 and original quantity
    if (isNaN(refundQty) || refundQty < 0 || refundQty > originalQty) return;

    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, quantity: refundQty } : item
    );

    setItems(updatedItems);
    setRefundItems(updatedItems); // This quantity goes to inventory
  };

  const handleRefundAll = () => {
    // Set all quantities to original (refund everything)
    const fullRefund =
      transaction?.itemDetails.map((item) => ({
        ...item,
        quantity: item.quantity, // Original quantity = full refund
      })) || [];

    setItems(fullRefund);
    setRefundItems(fullRefund);
  };

  const handleRefundNone = () => {
    // Set all quantities to 0 (refund nothing)
    const noRefund = items.map((item) => ({ ...item, quantity: 0 }));
    setItems(noRefund);
    setRefundItems(noRefund);
  };

  if (!transaction) return null;

  return (
    <div className="mt-4 w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Refund Details</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefundNone}>
            Clear All
          </Button>
          <Button variant="secondary" size="sm" onClick={handleRefundAll}>
            Refund All
          </Button>
        </div>
      </div>

      <Table>
        <TableCaption>
          {" "}
          * Enter the quantity you want to refund. This amount will be restored
          to inventory.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Purchased Qty</TableHead>
            <TableHead>Refund Qty</TableHead>
            <TableHead className="text-right">Refund Amount</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item, index) => {
            const originalQty = transaction.itemDetails[index]?.quantity || 0;
            const refundAmount = item.quantity * (item.price ?? 0);

            return (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {item.productName}
                </TableCell>
                <TableCell className="text-center">{originalQty}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    max={originalQty}
                    className="w-20 text-center"
                    value={item.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, e.target.value)
                    }
                    placeholder="0"
                  />
                </TableCell>
                <TableCell className="text-right">
                  ₱{refundAmount.toFixed(2)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="font-semibold">
              Total Refund Amount
            </TableCell>
            <TableCell className="text-right font-semibold">
              ₱{totalAmount.toFixed(2)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default RefundDetails;
