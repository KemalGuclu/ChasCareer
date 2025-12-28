"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, Users, Target, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SearchResult = {
  id: string;
  type: "student" | "company" | "lead";
  title: string;
  subtitle?: string;
  href: string;
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Search when query changes
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch {
        console.error("Search failed");
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "student":
        return <Users className="h-4 w-4" />;
      case "company":
        return <Building2 className="h-4 w-4" />;
      case "lead":
        return <Target className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md text-sm text-muted-foreground sm:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Sök...
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="sr-only">Sök</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Sök studerande, företag, leads..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => setQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="max-h-[300px] overflow-y-auto p-2">
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Söker...
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Inga resultat för &quot;{query}&quot;
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-accent"
                    onClick={() => handleSelect(result)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="truncate text-sm text-muted-foreground">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {result.type === "student" ? "Studerande" : 
                       result.type === "company" ? "Företag" : "Lead"}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!loading && query.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Skriv minst 2 tecken för att söka
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
