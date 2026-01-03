import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Modal from "../ui/Modal";
import { CartItem } from "./WalkInPOS";
import { formattedDateTime, toTitleCase } from "@/lib/utils";

type PreviewReceiptProps = {
  close: () => void;
  isOpen: boolean;
  customerName: string | null;
  cartItems: CartItem[];

  subTotal: number;
  discountType: "NONE" | "PWD" | "CUSTOM" | "SENIOR";
  discountAmount: number;
  vatAmount: number;
  totalDue: number;
  amountTendered: number;
  change: number;
};

const PreviewReceipt = ({
  close,
  isOpen,
  customerName,
  cartItems,
  subTotal,
  discountAmount,
  discountType,
  vatAmount,
  totalDue,
  amountTendered,
  change,
}: PreviewReceiptProps) => {
  return (
    <Modal
      onClose={close}
      bgColor="bg-white"
      width="max-w-[22rem]"
      isOpen={isOpen}
    >
      <header className="text-center">
        <p className="text-lg font-semibold">Macoleen&#39;s Pharmacy</p>
        <p className="text-gray-800">Order Receipt</p>
      </header>

      <main className="mt-8">
        <section className="mb-8">
          <p className="flex items-center justify-between">
            Customer Name: <span>{customerName}</span>
          </p>
          <p className="flex items-center justify-between">
            Type: <span>Walk In</span>
          </p>
          <p className="flex items-center justify-between">
            Date: <span>{formattedDateTime()}</span>
          </p>
        </section>

        <section>
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
              {Array.isArray(cartItems) && cartItems.length > 0 ? (
                cartItems.map((item, index: number) => {
                  const quantity = item.quantity;
                  const price = item.price ?? 0;
                  const subTotal = quantity * price;

                  return (
                    <TableRow key={index} className="text-xs">
                      <TableCell className="font-semibold">
                        {toTitleCase(item.productName)}
                      </TableCell>
                      <TableCell colSpan={2} className="text-gray-500">
                        {item.quantity}
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
                  <TableCell
                    colSpan={5}
                    className="text-center text-gray-500 py-4"
                  >
                    No items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <section className="mt-6 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₱{subTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-green-700">
              <span>
                Discount
                {discountType !== "NONE" && ` (${discountType})`}
              </span>
              <span>-₱{discountAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>
                VAT (12%)
                {discountType === "PWD" || discountType === "SENIOR"
                  ? " — Exempt"
                  : ""}
              </span>
              <span>₱{vatAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Cash:</span>
              <span>₱{amountTendered.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Change:</span>
              <span>₱{change.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-bold text-base border-t mt-3 pt-3">
              <span>Total Due</span>
              <span>₱{totalDue.toFixed(2)}</span>
            </div>
          </section>
        </section>
      </main>
    </Modal>
  );
};

export default PreviewReceipt;
