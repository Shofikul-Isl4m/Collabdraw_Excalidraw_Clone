import useDebounce from "@/lib/hooks/useDebounce";
import { Input } from "@repo/ui/components/ui/input";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const SearchBar = () => {
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
    router.push(`/dashboard?${param.toString()}`);
  }, [debounceValue, searchParams, router]);

  return (
    <div className="w-full lg:w-96">
      <Input
        type="search"
        placeholder="search..."
        className="peer ps-9 pe-9 w-full"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
