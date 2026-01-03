"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRefundStore } from "@/lib/store/useRefundStore";

type RefundUIItem = {
  productName: string;
  quantityOrdered: number;
  refundedQuantity: number; // Already refunded in previous sessions
  price: number;
  maxAvailable: number; // Remaining balance
  refundQuantity: number; // Current input
  rowId: string;
};

export interface TransactionItemDetail {
  productName: string;
  quantityOrdered?: number | string; // From OrderItem
  quantity?: number | string; // From WalkInItem
  refundedQuantity?: number | string;
  price: number | string;
}

const RefundDetails = () => {
  const { transaction, setRefundItems } = useRefundStore();
  const [items, setItems] = useState<RefundUIItem[]>([]);

  useEffect(() => {
    if (!transaction?.itemDetails) return;

    const initialItems: RefundUIItem[] = transaction.itemDetails.map(
      (item: TransactionItemDetail, index: number) => {
        const purchased = Number(item.quantityOrdered || item.quantity || 0);
        const previouslyRefunded = Number(item.refundedQuantity || 0);
        const available = purchased - previouslyRefunded;

        return {
          productName: item.productName,
          quantityOrdered: purchased,
          refundedQuantity: previouslyRefunded,
          price: Number(item.price || 0),
          maxAvailable: available,
          refundQuantity: 0, // Default to 0
          rowId: `${item.productName}-${index}`,
        };
      }
    );

    setItems(initialItems);
  }, [transaction]);

  // Sync with store whenever local items change
  useEffect(() => {
    setRefundItems(
      items
        .filter((i) => i.refundQuantity > 0)
        .map((i) => ({
          productName: i.productName,
          quantity: i.refundQuantity,
        }))
    );
  }, [items, setRefundItems]);

  const handleQuantityChange = (rowId: string, val: string) => {
    const qty = Math.max(0, parseInt(val) || 0);
    setItems((prev) =>
      prev.map((item) =>
        item.rowId === rowId
          ? { ...item, refundQuantity: Math.min(qty, item.maxAvailable) }
          : item
      )
    );
  };

  const handleRefundAll = () => {
    setItems((prev) =>
      prev.map((item) => ({ ...item, refundQuantity: item.maxAvailable }))
    );
  };

  const totalRefundAmount = items.reduce(
    (sum, item) => sum + item.refundQuantity * item.price,
    0
  );

  if (!transaction) return null;

  return (
    <div className="mt-4 w-full space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">
          Adjust Refund Quantities
        </h3>
        <Button variant="outline" size="sm" onClick={handleRefundAll}>
          Refund All Available
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-center">Purchased</TableHead>
              <TableHead className="text-center">Remaining</TableHead>
              <TableHead className="w-[100px]">Refund Qty</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.rowId}>
                <TableCell className="font-medium">
                  {item.productName}
                </TableCell>
                <TableCell className="text-center text-gray-500">
                  {item.quantityOrdered}
                </TableCell>
                <TableCell className="text-center font-semibold text-blue-600">
                  {item.maxAvailable}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.refundQuantity}
                    onChange={(e) =>
                      handleQuantityChange(item.rowId, e.target.value)
                    }
                    className="h-8 w-20"
                    disabled={item.maxAvailable === 0}
                  />
                </TableCell>
                <TableCell className="text-right font-mono">
                  ₱{(item.refundQuantity * item.price).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="font-bold">
                Total Refund
              </TableCell>
              <TableCell className="text-right font-bold text-red-600">
                ₱{totalRefundAmount.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default RefundDetails;
