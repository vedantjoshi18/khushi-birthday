"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Props = {
  onSearch: (query: string) => Promise<void>;
};

export default function SearchBar({ onSearch }: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearch(query).catch(() => null);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [onSearch, query]);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await onSearch(query);
      }}
      className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white/80 p-2"
    >
      <Search className="ml-2 h-4 w-4 text-stone-400" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search any song on Spotify..."
        className="w-full bg-transparent px-2 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none"
      />
      <button type="submit" className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white">
        Search
      </button>
    </form>
  );
}
