import { createServiceRoleClient } from "@/utils/supabase/service-role-client";

export type NotificationAudience = "platform" | "tenant";
export type ActivityScope = "platform" | "tenant";

export type EmitEventInput = {
  type: string;
  title: string;
  body?: string;
  href?: string;
  actorId?: string | null;
  actorEmail?: string | null;
  /** Notify platform admins */
  notifyPlatform?: boolean;
  /** Notify store managers for this tenant */
  tenantId?: string | null;
  notifyTenant?: boolean;
  /** Also write activity log(s) */
  logPlatform?: boolean;
  logTenant?: boolean;
  action?: string;
  entityType?: string;
  entityId?: string;
  summary?: string;
  meta?: Record<string, unknown>;
};

/**
 * Fire-and-forget style emitter. Never throws to callers —
 * activity/notifications must not break primary flows.
 */
export async function emitEvent(input: EmitEventInput): Promise<void> {
  try {
    const db = createServiceRoleClient();
    const meta = input.meta ?? {};
    const action = input.action ?? input.type;
    const summary = input.summary ?? input.title;

    const notificationRows: Array<Record<string, unknown>> = [];
    const logRows: Array<Record<string, unknown>> = [];

    if (input.notifyPlatform) {
      notificationRows.push({
        audience: "platform",
        tenant_id: null,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        href: input.href ?? null,
        actor_id: input.actorId ?? null,
        meta,
      });
    }

    if (input.notifyTenant && input.tenantId) {
      notificationRows.push({
        audience: "tenant",
        tenant_id: input.tenantId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        href: input.href ?? null,
        actor_id: input.actorId ?? null,
        meta,
      });
    }

    if (input.logPlatform) {
      logRows.push({
        scope: "platform",
        tenant_id: null,
        actor_id: input.actorId ?? null,
        actor_email: input.actorEmail ?? null,
        action,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        summary,
        meta,
      });
    }

    if (input.logTenant && input.tenantId) {
      logRows.push({
        scope: "tenant",
        tenant_id: input.tenantId,
        actor_id: input.actorId ?? null,
        actor_email: input.actorEmail ?? null,
        action,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        summary,
        meta,
      });
    }

    if (notificationRows.length > 0) {
      const { error } = await db.from("notifications").insert(notificationRows);
      if (error) console.error("[emitEvent] notifications:", error.message);
    }

    if (logRows.length > 0) {
      const { error } = await db.from("activity_logs").insert(logRows);
      if (error) console.error("[emitEvent] activity_logs:", error.message);
    }
  } catch (error) {
    console.error(
      "[emitEvent]",
      error instanceof Error ? error.message : error,
    );
  }
}
