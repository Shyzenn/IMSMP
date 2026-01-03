import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const HeaderLinksSkeleton = () => (
  <ul className="bg-white rounded-full p-[5px] lg:flex gap-8 py-[10px] hidden">
    {[1, 2, 3, 4].map((i) => (
      <li key={i}>
        <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
      </li>
    ))}
  </ul>
);

export function ProfileSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="h-4 w-24 rounded bg-gray-200 animate-pulse"></div>
        <div className="h-3 w-16 rounded bg-gray-200 animate-pulse"></div>
      </div>
    </>
  );
}

export function ProductSkeleton() {
  return (
    <>
      <tr className="w-full border-b border-gray-100">
        {/* Product */}
        <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
          <div className="flex items-center gap-1">
            <div className="h-6 w-44 rounded bg-gray-100"></div>
          </div>
        </td>
        {/* Quantity */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </td>
        {/* Category */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-32 rounded bg-gray-100"></div>
        </td>
        {/* Price */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </td>
        {/* Release Date */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-32 rounded bg-gray-100"></div>
        </td>
        {/*Expiry Date */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-32 rounded bg-gray-100"></div>
        </td>
        {/* Actions */}
        {/* <td className="whitespace-nowrap px-3 py-3 flex gap-2">
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
          <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
        </td> */}
      </tr>
    </>
  );
}

export function RecentRequestOrderSkeleton() {
  return (
    <>
      <div className="bg-white mx-4 min-h-[300px] max-h-[300px] animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/6 mt-4 mb-8" />

        <div className="flex flex-col gap-6 flex-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-40">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function TableRowSkeleton({
  headerLabel,
}: {
  headerLabel: { key: string; label: string }[];
}) {
  return (
    <>
      <div className=" bg-white animate-pulse mx-4 min-h-[300px] max-h-[300px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              {Array.isArray(headerLabel) &&
                headerLabel.map((col) => (
                  <TableHead className="text-black font-semibold" key={col.key}>
                    {col.label}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:flex">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse shadow-sm bg-white flex-1 py-2 px-3 flex flex-col justify-between rounded-md h-[7rem] lg:h-[8rem]"
        >
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
            <div className="h-6 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

const SalesGraphSkeleton = () => {
  return (
    <div className="bg-white w-full h-full rounded-md p-3 shadow-md flex flex-col animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-1/3 mb-4" />

      <div className="flex flex-col gap-4 flex-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 flex-1 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesGraphSkeleton;

export function ExpiryProductsSkeleton() {
  return (
    <>
      <div className=" p-2 mx-4 max-h-[260px] bg-white animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4" />

        <div className="flex flex-col gap-4 flex-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-4 flex-1 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export const OrderModalSkeleton = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white w-full max-w-[500px] rounded-md relative overflow-auto p-4 flex flex-col gap-8 pb-16">
        <div className="flex gap-2 flex-col">
          <div className="h-6 w-24 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-6 w-32 rounded bg-gray-100 animate-pulse"></div>
        </div>
        <div className="flex gap-2 flex-col">
          <div className="h-6 w-44 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-6 w-36 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-6 w-56 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-6 w-36 rounded bg-gray-100 animate-pulse"></div>
        </div>
        <div className="flex gap-2 justify-between px-2">
          <div className="h-5 w-24 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-5 w-28 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-5 w-20 rounded bg-gray-100 animate-pulse"></div>
        </div>
        <div className="flex gap-2 justify-between px-2">
          <div className="h-5 w-24 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-5 w-28 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-5 w-20 rounded bg-gray-100 animate-pulse"></div>
        </div>
        <div className="flex gap-2 justify-between px-2">
          <div className="h-5 w-24 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-5 w-28 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-5 w-20 rounded bg-gray-100 animate-pulse"></div>
        </div>
        <div className="flex gap-2 justify-between px-2">
          <div className="h-5 w-24 rounded bg-gray-100 animate-pulse"></div>
          <div className="h-5 w-28 rounded bg-gray-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductListSkeleton = () => {
  return (
    <div className="p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border p-4 mb-2 bg-white rounded-lg">
          {/* Top Section - Product Name, Strength & Price */}
          <div className="flex justify-between items-center border-b pb-2">
            <div className="flex flex-col gap-1 flex-1">
              {/* Product Name */}
              <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse" />
              {/* Generic Name & Form */}
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>
            <div className="flex flex-col gap-1 items-end">
              {/* Price */}
              <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
              {/* Per unit text */}
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
            </div>
          </div>

          {/* Bottom Section - Stock & Add to Cart Button */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              {/* "AVAILABLE STOCK" label */}
              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
              {/* Stock amount with dot */}
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
            </div>
            {/* Add to Cart Button */}
            <div className="h-10 bg-gray-200 rounded-lg w-36 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};
