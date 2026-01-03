import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderItem, OrderView } from "@/lib/interfaces";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { DiscountTypeFormat, toTitleCase } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const OrderProductTable = ({ currentOrder }: { currentOrder: OrderView }) => {
  const [showDiscount, setShowDiscount] = useState(false);

  const payment = currentOrder.paymentDetails?.[0];

  const total = currentOrder.itemDetails.reduce(
    (sum, item) => sum + item.price * item.quantityOrdered,
    0
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]" colSpan={2}>
            Product
          </TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.isArray(currentOrder?.itemDetails) &&
        currentOrder.itemDetails.length > 0 ? (
          currentOrder.itemDetails.map((item: OrderItem, index: number) => {
            const quantity = item.quantityOrdered;
            const price = item.price ?? 0;
            const subTotal = quantity * price;

            return (
              <TableRow key={index} className="text-xs">
                <TableCell className="font-semibold">
                  {toTitleCase(item.productName)}
                </TableCell>
                <TableCell colSpan={2} className="text-gray-500">
                  {item.quantityOrdered}
                </TableCell>
                <TableCell className="text-gray-500">
                  {`₱${Number(item.price).toFixed(2)}`}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {`₱${subTotal.toFixed(2)}`}
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-500 py-4">
              No items found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter>
        {(payment?.discountType !== "NONE" || !payment.discountType) &&
          currentOrder.status === "paid" && (
            <>
              <TableRow
                className="cursor-pointer text-xs text-gray-500"
                onClick={() => setShowDiscount((prev) => !prev)}
              >
                <TableCell colSpan={5}>
                  <div className="flex items-center justify-between">
                    <span>Discount Details</span>
                    <MdOutlineKeyboardArrowDown
                      className={`transition-transform duration-200 ${
                        showDiscount ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </TableCell>
              </TableRow>
              <AnimatePresence initial={false}>
                {showDiscount && (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <Table className="w-full text-xs">
                          <TableBody>
                            <TableRow>
                              <TableCell className="w-3/5"></TableCell>
                              <TableCell className="text-gray-500">
                                Discount Type:
                              </TableCell>
                              <TableCell className="text-right text-gray-800">
                                {DiscountTypeFormat(payment?.discountType)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell></TableCell>
                              <TableCell className="text-gray-500">
                                Discount Percent:
                              </TableCell>
                              <TableCell className="text-right text-green-800">
                                {payment?.discountPercent}%
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell></TableCell>
                              <TableCell className="text-gray-500">
                                Discount Amount:
                              </TableCell>
                              <TableCell className="text-right text-green-800">
                                - ₱{payment?.discountAmount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </>
          )}

        <TableRow className="font-semibold">
          <TableCell colSpan={4}>Total</TableCell>
          <TableCell className="text-right">
            ₱
            {currentOrder.status === "paid"
              ? payment?.amountDue.toFixed(2)
              : total.toFixed(2)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default OrderProductTable;
