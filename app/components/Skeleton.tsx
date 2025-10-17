import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function HeaderSkeleton() {
  return (
    <>
      <div className="fixed top-0 w-full bg-white mb-5 shadow-md z-20 py-6">
        <div className="flex justify-between items-center px-10 2xl:max-w-screen-3xl mx-auto">
          <div className="h-6 w-40 rounded bg-gray-100"></div>

          <div className="flex items-center gap-8">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center relative">
            <div className="h-6 w-40 rounded bg-gray-100"></div>
          </div>
        </div>
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
    <div className="flex gap-5 h-32">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse shadow-sm bg-white flex-1 py-2 px-3 flex flex-col justify-between rounded-md"
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
