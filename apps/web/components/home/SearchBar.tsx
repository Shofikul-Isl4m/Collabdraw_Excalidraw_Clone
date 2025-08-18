"use client";

import useDebounce from "@/lib/hooks/useDebounce";
import { Input } from "@repo/ui/components/ui/input";
import { LoaderCircle, Search } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";

import { useEffect, useState } from "react";

const SearchBar = ({ search }: { search: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");
  const debounceValue = useDebounce(value, 500);
  const isLoading = value !== debounceValue;
  useEffect(() => {
    const param = new URLSearchParams(searchParams);
    if (debounceValue) {
      param.set("search", debounceValue);
    } else {
      param.delete("search");
    }
    router.push(`/home?${param.toString()}`);
  }, [debounceValue, searchParams, router]);

  return (
    <div className=" relative w-full  lg:w-96">
      <Input
        type="search"
        placeholder="search..."
        className="peer ps-9 pe-9 w-full py-2 "
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <div className="text-muted-foreground/80 pointer-events-none absolute   inset-y-0 flex items-center justify-center peer-disabled:opacity-50">
        {isLoading ? (
          <LoaderCircle
            strokeWidth={2}
            className="animate-spin"
            aria-hidden="true"
            role="presentation"
            size={16}
          />
        ) : (
          <Search size={16} strokeWidth={2} aria-hidden="true" />
        )}
      </div>
    </div>
  );
};

export default SearchBar;
