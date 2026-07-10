"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  CATEGORY_ICON_OPTIONS,
  getCategoryIconOption,
} from "@/lib/catalog/category-display";
import { adminInputClass } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils";

type CategoryIconPickerProps = {
  value: string;
  onChange: (iconName: string) => void;
};

export function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  const [query, setQuery] = useState("");
  const selected = getCategoryIconOption(value);
  const SelectedIcon = selected.Icon;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORY_ICON_OPTIONS;
    return CATEGORY_ICON_OPTIONS.filter((option) => {
      const haystack = `${option.name} ${option.label} ${option.keywords}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800">
          <SelectedIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-gray-900">{selected.label}</p>
          <p className="truncate text-[11px] text-gray-500">{selected.name}</p>
        </div>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons (phone, fashion, kitchen…)"
          className={cn(adminInputClass, "pl-8")}
          aria-label="Search category icons"
        />
      </div>

      <div
        className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto rounded-md border border-gray-200 bg-white p-2 sm:grid-cols-6"
        role="listbox"
        aria-label="Category icons"
      >
        {filtered.length === 0 ? (
          <p className="col-span-full px-2 py-6 text-center text-[12px] text-gray-500">
            No icons match “{query}”.
          </p>
        ) : (
          filtered.map((option) => {
            const Icon = option.Icon;
            const isSelected = option.name === value;
            return (
              <button
                key={option.name}
                type="button"
                role="option"
                aria-selected={isSelected}
                title={option.label}
                onClick={() => onChange(option.name)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border px-1.5 py-2 text-center transition",
                  isSelected
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-transparent bg-gray-50 text-gray-700 hover:border-gray-200 hover:bg-white",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="w-full truncate text-[10px] leading-tight">
                  {option.label}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
