"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { AppNotification } from "@/lib/activity/types";
import { formatRelativeTime } from "@/lib/activity/types";

type NotificationBellProps = {
  audience: "platform" | "tenant";
  tenantSlug?: string;
  activityHref: string;
};

export function NotificationBell({
  audience,
  tenantSlug,
  activityHref,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        audience,
        limit: "15",
      });
      if (tenantSlug) params.set("tenant_slug", tenantSlug);
      const res = await fetch(`/api/notifications?${params}`);
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setItems(json.notifications ?? []);
        setUnread(json.unread ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [audience, tenantSlug]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audience,
        tenant_slug: tenantSlug,
        mark_all: true,
      }),
    });
    setItems((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })),
    );
    setUnread(0);
  };

  const markOne = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audience,
        tenant_slug: tenantSlug,
        ids: [id],
      }),
    });
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n,
      ),
    );
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-gray-100"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
      >
        <Bell size={15} className="text-gray-600" />
        {unread > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[9px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-[min(100vw-1.5rem,22rem)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
            <p className="text-[13px] font-semibold text-gray-900">Notifications</p>
            {unread > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-[12px] font-medium text-gray-500 hover:text-gray-800"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && items.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-gray-400">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-3 py-6 text-center text-[13px] text-gray-400">
                No notifications yet
              </p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {items.map((item) => {
                  const content = (
                    <div className="flex gap-2 px-3 py-2.5 hover:bg-gray-50">
                      {!item.read_at ? (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900" />
                      ) : (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-gray-900">{item.title}</p>
                        {item.body ? (
                          <p className="mt-0.5 line-clamp-2 text-[12px] text-gray-500">
                            {item.body}
                          </p>
                        ) : null}
                        <p className="mt-1 text-[11px] text-gray-400">
                          {formatRelativeTime(item.created_at)}
                        </p>
                      </div>
                    </div>
                  );

                  return (
                    <li key={item.id}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          onClick={() => {
                            if (!item.read_at) void markOne(item.id);
                            setOpen(false);
                          }}
                        >
                          {content}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => {
                            if (!item.read_at) void markOne(item.id);
                          }}
                        >
                          {content}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-100 px-3 py-2">
            <Link
              href={activityHref}
              onClick={() => setOpen(false)}
              className="block text-center text-[12px] font-medium text-gray-600 hover:text-gray-900"
            >
              View activity log
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
