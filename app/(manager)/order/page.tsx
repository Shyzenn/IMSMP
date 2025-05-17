"use client";

import { useState } from "react";
import RequestForm from "@/app/components/RequestForm";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddButton from "@/app/components/Button";
import { OrderProduct, RequestFormData } from "@/lib/interfaces";
import { formattedDate } from "@/lib/utils";

const Order = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<RequestFormData | null>(
    null
  ); // Store submitted value

  const handleFormSubmit = (data: RequestFormData) => {
    setSubmittedData(data); // Update state when form is submitted
    setIsModalOpen(true); // Open modal after submission
  };

  const totalAmount = submittedData?.products.reduce(
    (total, product) => total + product.price * Number(product.quantity),
    0
  );

  return (
    <>
      <div className="bg-white h-full px-11">
        <RequestForm buttonLabel="Print" onSubmitForm={handleFormSubmit} />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded-md shadow-md w-[30rem] max-h-[90vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-12 text-center">
              Confirm Print
            </h2>
            {submittedData &&
            submittedData.patientName &&
            submittedData.roomNumber ? (
              <form className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-5 border-b-2 pb-4">
                  <div className="flex justify-between ">
                    <p>
                      <strong>Name:</strong> {submittedData.patientName}
                    </p>
                    <p>
                      Date:<span className="font-normal">{formattedDate}</span>
                    </p>
                  </div>
                  <p className="">
                    <strong>Room#:</strong> {submittedData.roomNumber}
                  </p>
                </div>

                {/* Order List */}
                <div className="my-6 pb-2">
                  <p className="font-bold mb-4">Order List:</p>
                  {submittedData.products.some(
                    (product) => product.productName && product.quantity
                  ) ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="text-gray-500">
                          <TableHead>Product</TableHead>
                          <TableHead colSpan={2}>Quantity</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submittedData.products.map(
                          (product: OrderProduct, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {product.productName}
                              </TableCell>
                              <TableCell colSpan={2}>
                                {product.quantity}
                              </TableCell>
                              <TableCell className="text-right">
                                ₱
                                {(
                                  product.price * Number(product.quantity)
                                ).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                      <TableFooter>
                        <TableRow className="bg-gray-100">
                          <TableCell colSpan={3}>Total</TableCell>
                          <TableCell className="text-right">
                            ₱{totalAmount?.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    </Table>
                  ) : (
                    <p>No Product added.</p>
                  )}
                </div>
                <div className="sticky bottom-0 bg-white border-t-2 pt-4 pb-2 flex gap-6 justify-end">
                  <button
                    className="bg-gray-100 py-2 px-8 rounded-md hover:bg-gray-200"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <AddButton label="Confirm" type="submit" />
                </div>
              </form>
            ) : (submittedData && submittedData.roomNumber) ||
              submittedData?.patientName ? (
              <>
                <p className="text-center text-gray-500">
                  Room# or Patient Name are empty.
                </p>
                <button
                  className="bg-green-500 py-2 px-8 rounded-md hover:bg-green-400 mt-12 text-white"
                  onClick={() => setIsModalOpen(false)}
                >
                  Go back
                </button>
              </>
            ) : (
              <>
                <p className="text-center text-gray-500">No Data Submitted.</p>
                <button
                  className="bg-green-500 py-2 px-8 rounded-md hover:bg-green-400 mt-12 text-white"
                  onClick={() => setIsModalOpen(false)}
                >
                  Go back
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Order;
