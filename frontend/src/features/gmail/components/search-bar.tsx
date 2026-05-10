import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import { useGmailStore } from "../store";

export function SearchBar() {
  const search = useGmailStore((s) => s.search);

  const setSearch = useGmailStore((s) => s.setSearch);

  return (
    <div className="border-b p-4">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search mail..."
          className="pl-8"
        />
      </div>
    </div>
  );
}
