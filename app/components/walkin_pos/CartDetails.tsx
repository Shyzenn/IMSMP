import { CartItem } from "./WalkInPOS";
import { FaTrash } from "react-icons/fa6";
import { BsFilterLeft } from "react-icons/bs";
import { FiPlus, FiMinus } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { formatPackageType } from "@/lib/utils";

const CartDetails = ({
  items,
  onUpdateQty,
  onRemoveItem,
  onDeleteAllItem,
}: {
  items: CartItem[];
  onUpdateQty: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onDeleteAllItem: () => void;
}) => {
  return (
    <div className="bg-gray-50 border-l border-slate-200 h-full">
      <div className="flex justify-between border-b p-6 items-center bg-white">
        <p className="font-semibold text-lg">Cart Details</p>
        <button
          className="inline-flex items-center gap-1 text-sm text-red-500 font-semibold"
          onClick={onDeleteAllItem}
        >
          <span className="flex">
            <FaTrash />
            <BsFilterLeft />
          </span>
          Clear All
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 bg-surface-highlight/30 h-full">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-left text-slate-400 text-[11px] uppercase tracking-wider font-bold pb-2 pl-2">
                Product
              </th>
              <th className="text-center text-slate-400 text-[11px] uppercase tracking-wider font-bold pb-2 w-32">
                Qty
              </th>
              <th className="text-right text-slate-400 text-[11px] uppercase tracking-wider font-bold pb-2 w-20">
                Price
              </th>
              <th className="text-right text-slate-400 text-[11px] uppercase tracking-wider font-bold pb-2 w-24">
                Total
              </th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="space-y-2 overflow-y-auto">
            {items.length === 0 ? (
              <tr className="text-center text-slate-500 ">
                <td colSpan={4}>No item added</td>
              </tr>
            ) : (
              items.map((item) => {
                const totalPrice = item.price * item.quantity;

                return (
                  <tr
                    key={item.productId}
                    className="bg-white shadow-sm rounded-xl group hover:shadow-md transition-all"
                  >
                    <td className="rounded-l-xl py-3 pl-4 pr-2 border-y border-l border-border-color group-hover:border-primary/30">
                      <div className="flex flex-col">
                        <span className="text-text-dark font-bold text-sm">
                          {item.productName} {item.strength}
                        </span>
                        <span className="text-slate-500 text-xs">
                          {item.genericName} •{" "}
                          {formatPackageType(item.dosageForm)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 border-y border-border-color group-hover:border-primary/30">
                      <div
                        className={`flex items-center justify-center bg-slate-50 rounded-lg border  h-9 w-28 mx-auto ${
                          item.quantity > item.stock
                            ? "border-red-500"
                            : "border-border-color"
                        }`}
                      >
                        <button
                          className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-white rounded-l-lg transition"
                          onClick={() =>
                            onUpdateQty(
                              item.productId,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                        >
                          <span className="text-sm">
                            <FiMinus />
                          </span>
                        </button>
                        <input
                          className="w-10 h-full bg-transparent border-none text-center text-text-dark text-sm font-bold focus:ring-0 p-0 no-spinner"
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            onUpdateQty(
                              item.productId,
                              Math.max(1, Number(e.target.value))
                            )
                          }
                        />
                        <button
                          className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white rounded-r-lg transition"
                          onClick={() =>
                            onUpdateQty(item.productId, item.quantity + 1)
                          }
                        >
                          <span className="text-sm">
                            <FiPlus />
                          </span>
                        </button>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2 border-y border-border-color group-hover:border-primary/30 text-text-main text-sm font-medium">
                      ₱{Number(item.price).toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-2 border-y border-border-color group-hover:border-primary/30 text-text-dark font-bold text-sm">
                      ₱{totalPrice.toFixed(2)}
                    </td>
                    <td className="rounded-r-xl py-3 pr-3 pl-2 border-y border-r border-border-color group-hover:border-primary/30 text-center">
                      <button
                        className="text-slate-500 hover:text-danger hover:bg-danger/10 rounded-lg p-1.5 transition"
                        onClick={() => onRemoveItem(item.productId)}
                      >
                        <span className="text-lg hover:text-red-500">
                          <IoMdClose />
                        </span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CartDetails;
