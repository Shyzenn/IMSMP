"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { useDebouncedCallback } from "use-debounce";

const Search = ({ placeholder }: { placeholder: string }) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  // State for input value
  const [searchTerm, setSearchTerm] = useState<string | undefined>(
    searchParams.get("query") || ""
  );

  // Debounced search handler
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  // Update input value based on the URL query
  useEffect(() => {
    setSearchTerm(searchParams.get("query") || "");
  }, [searchParams]);

  return (
    <>
      <CiSearch className="text-xl text-gray-400" />
      <input
        placeholder={placeholder}
        className="w-full py-2 outline-none bg-gray-50"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value); // Update state on change
          handleSearch(e.target.value); // Trigger the debounced search
        }}
      />
    </>
  );
};

export default Search;
