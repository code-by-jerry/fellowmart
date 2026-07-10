"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { adminInputClass } from "@/components/admin/admin-ui";

export type TagOption = {
  id?: string;
  name: string;
  slug?: string;
  usage_count?: number;
};

type TagPickerProps = {
  tenantSlug: string;
  value: string[];
  suggestions?: TagOption[];
  onChange: (tags: string[]) => void;
};

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function TagPicker({
  tenantSlug,
  value,
  suggestions = [],
  onChange,
}: TagPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [catalog, setCatalog] = useState<TagOption[]>(suggestions);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCatalog((current) => {
      const byName = new Map(
        current.map((tag) => [tag.name.toLowerCase(), tag] as const),
      );
      for (const tag of suggestions) {
        byName.set(tag.name.toLowerCase(), tag);
      }
      return Array.from(byName.values());
    });
  }, [suggestions]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ tenant_slug: tenantSlug });
        if (query.trim()) params.set("q", query.trim());
        const res = await fetch(`/api/business/tags?${params.toString()}`, {
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return;
        setCatalog((json.tags ?? []) as TagOption[]);
      } catch {
        // ignore aborted/network errors while typing
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query, tenantSlug]);

  const selected = useMemo(
    () => value.map(normalizeTag).filter(Boolean),
    [value],
  );

  const selectedSet = useMemo(
    () => new Set(selected.map((tag) => tag.toLowerCase())),
    [selected],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog
      .filter((tag) => !selectedSet.has(tag.name.toLowerCase()))
      .filter((tag) => (q ? tag.name.toLowerCase().includes(q) : true))
      .slice(0, 8);
  }, [catalog, query, selectedSet]);

  const canCreate = useMemo(() => {
    const next = normalizeTag(query);
    if (!next) return false;
    return !selectedSet.has(next.toLowerCase());
  }, [query, selectedSet]);

  const exactExists = useMemo(() => {
    const next = normalizeTag(query).toLowerCase();
    if (!next) return false;
    return catalog.some((tag) => tag.name.toLowerCase() === next);
  }, [catalog, query]);

  const addTag = (name: string) => {
    const next = normalizeTag(name);
    if (!next || selectedSet.has(next.toLowerCase())) return;
    onChange([...selected, next]);
    setQuery("");
    setError(null);
    inputRef.current?.focus();
  };

  const removeTag = (name: string) => {
    onChange(selected.filter((tag) => tag.toLowerCase() !== name.toLowerCase()));
  };

  const createAndAdd = async () => {
    const next = normalizeTag(query);
    if (!next || creating) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/business/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenant_slug: tenantSlug, name: next }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? "Could not create tag");
        setCreating(false);
        return;
      }

      const tag = json.tag as TagOption;
      setCatalog((current) => {
        const exists = current.some(
          (item) => item.name.toLowerCase() === tag.name.toLowerCase(),
        );
        return exists ? current : [tag, ...current];
      });
      addTag(tag.name);
    } catch {
      setError("Could not create tag");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div ref={rootRef} className="space-y-2">
      <div
        className={`${adminInputClass} flex min-h-11 flex-wrap items-center gap-1.5 py-1.5`}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selected.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white"
          >
            {tag}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                removeTag(tag);
              }}
              className="rounded-full p-0.5 text-white/70 transition hover:bg-white/15 hover:text-white"
              aria-label={`Remove ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <div className="relative min-w-[10rem] flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (filtered[0]) {
                  addTag(filtered[0].name);
                } else if (canCreate) {
                  void createAndAdd();
                }
              }
              if (event.key === "Backspace" && !query && selected.length > 0) {
                removeTag(selected[selected.length - 1]);
              }
              if (event.key === "Escape") {
                setOpen(false);
              }
            }}
            className="w-full border-0 bg-transparent py-1.5 pl-5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            placeholder={selected.length ? "Add another tag…" : "Search or create a tag…"}
          />
        </div>
      </div>

      {open ? (
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-md">
          {filtered.length > 0 ? (
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.map((tag) => (
                <li key={tag.id ?? tag.name}>
                  <button
                    type="button"
                    onClick={() => addTag(tag.name)}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] text-gray-700 transition hover:bg-gray-50"
                  >
                    <span>{tag.name}</span>
                    {typeof tag.usage_count === "number" ? (
                      <span className="text-[11px] text-gray-400">
                        {tag.usage_count} use{tag.usage_count === 1 ? "" : "s"}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-2 text-[13px] text-gray-500">
              {query.trim()
                ? "No matching tags."
                : "Start typing to search existing tags."}
            </p>
          )}

          {canCreate && !exactExists ? (
            <button
              type="button"
              disabled={creating}
              onClick={() => void createAndAdd()}
              className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-2 text-left text-[13px] font-medium text-gray-900 transition hover:bg-gray-50 disabled:opacity-60"
            >
              <Plus size={14} />
              {creating ? "Creating…" : `Create “${normalizeTag(query)}”`}
            </button>
          ) : null}
        </div>
      ) : null}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      <p className="text-xs text-gray-400">
        Search common tags or press Enter to create a new one for this store.
      </p>
    </div>
  );
}
