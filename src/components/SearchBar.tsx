"use client";

import { Loader2, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Suspense, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* 
    GOALS: 
    1. Needs to be intuitive(hitting ESC while typing will loose focus from input element)
    2. Functional(store the search results in URL params to give results on a reload)
*/
const SearchBar = () => {
  const searchParams = useSearchParams();
  const defaultQuery = searchParams.get("query") || "";
  const inputRef = useRef<HTMLInputElement>(null);
  const [isSearching, startTransition] = useTransition();
  const router = useRouter();
  const [query, setQuery] = useState<string>(defaultQuery);

  const search = () => {
    startTransition(() => {
      router.push(`/search?query=${query}`);
    });
  };

  return (
    <Suspense>
      <div className="relative w-full h-14 flex flex-col">
        <div className="relative h-14 z-10 rounded-md">
          <Input
            disabled={isSearching}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                search();
              }

              // hitting ESC while typing will loose focus from input element
              if (e.key === "Escape") {
                inputRef?.current?.blur();
              }
            }}
            ref={inputRef}
            className="absolute inset-0 h-full"
          />

          <Button
            disabled={isSearching}
            className="absolute right-0 inset-y-0 h-full rounded-l-none"
            size="sm"
            onClick={search}
          >
            {isSearching ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Search className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </Suspense>
  );
};

export default SearchBar;
