"use client";

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import clsx from "clsx";
import Link from "next/link";
import { generatePagination } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";

export default function Pagination({
  totalPages,
  isComponent,
  currentPage,
  onPageChange,
}: {
  totalPages: number;
  isComponent?: boolean;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlPage = Number(searchParams.get("page")) || 1;

  const activePage = isComponent ? currentPage || 1 : urlPage;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(activePage, totalPages);

  return (
    <div className="inline-flex">
      <PaginationArrow
        direction="left"
        href={createPageURL(activePage - 1)}
        isDisabled={activePage <= 1}
        isComponent={isComponent}
        onClick={() => onPageChange?.(activePage - 1)}
      />

      <div className="flex -space-x-px">
        {allPages.map((page, index) => {
          let position: "first" | "last" | "single" | "middle" | undefined;

          if (index === 0) position = "first";
          if (index === allPages.length - 1) position = "last";
          if (allPages.length === 1) position = "single";
          if (page === "...") position = "middle";

          return (
            <PaginationNumber
              key={`${page}-${index}`}
              href={createPageURL(page)}
              page={page}
              position={position}
              isActive={activePage === page}
              isComponent={isComponent}
              onClick={() =>
                typeof page === "number" ? onPageChange?.(page) : null
              }
            />
          );
        })}
      </div>

      <PaginationArrow
        direction="right"
        href={createPageURL(activePage + 1)}
        isDisabled={activePage >= totalPages}
        isComponent={isComponent}
        onClick={() => onPageChange?.(activePage + 1)}
      />
    </div>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
  isComponent,
  onClick,
}: {
  page: number | string;
  href: string;
  position?: "first" | "last" | "middle" | "single";
  isActive: boolean;
  isComponent?: boolean;
  onClick?: () => void;
}) {
  const className = clsx("flex items-center justify-center border", {
    "h-8 w-10 text-sm": !isComponent,
    "h-7 w-8 text-xs": isComponent,
    "rounded-l-md": position === "first" || position === "single",
    "rounded-r-md": position === "last" || position === "single",
    "z-10 bg-[#2b9e78] border-green-600 text-white": isActive,
    "hover:bg-gray-100": !isActive && position !== "middle",
    "text-gray-300": position === "middle",
  });

  if (isComponent) {
    return (
      <button
        className={className}
        onClick={onClick}
        disabled={position === "middle"}
      >
        {page}
      </button>
    );
  }

  return isActive || position === "middle" ? (
    <div className={className}>{page}</div>
  ) : (
    <Link href={href} className={className}>
      {page}
    </Link>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
  isComponent,
  onClick,
}: {
  href: string;
  direction: "left" | "right";
  isDisabled?: boolean;
  isComponent?: boolean;
  onClick?: () => void;
}) {
  const className = clsx("flex items-center justify-center rounded-md border", {
    "h-8 w-10": !isComponent,
    "h-7 w-8": isComponent,
    "pointer-events-none text-gray-300": isDisabled,
    "hover:bg-gray-100": !isDisabled,
    "mr-2 md:mr-4": direction === "left" && !isComponent,
    "mr-1": direction === "left" && isComponent,
    "ml-2 md:ml-4": direction === "right" && !isComponent,
    "ml-1": direction === "right" && isComponent,
  });

  const icon =
    direction === "left" ? (
      <IoIosArrowBack className={clsx(isComponent ? "w-3 h-3" : "w-4 h-4")} />
    ) : (
      <IoIosArrowForward
        className={clsx(isComponent ? "w-3 h-3" : "w-4 h-4")}
      />
    );

  if (isComponent) {
    return (
      <button className={className} onClick={onClick} disabled={isDisabled}>
        {icon}
      </button>
    );
  }

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <Link className={className} href={href}>
      {icon}
    </Link>
  );
}
