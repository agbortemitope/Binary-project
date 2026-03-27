import { requireProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatRelative } from "@/lib/utils";
import { NOTIFICATION_TONES } from "@/lib/constants";

import { MarkNotificationsReadButton } from "@/components/forms/mark-notifications-read-button";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export default async function NotificationsPage() {
  const { profile } = await requireProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includeNotifications: true });
  const unread = snapshot.notifications.filter((n) => !n.read_at).length;

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-slate-950">Notifications</p>
          {unread > 0 && <p className="mt-0.5 text-sm text-slate-500">{unread} unread</p>}
        </div>
        {unread > 0 && <MarkNotificationsReadButton />}
      </div>

      <div className="mt-4 space-y-2">
        {snapshot.notifications.length > 0 ? (
          snapshot.notifications.map((n) => {
            const tone = NOTIFICATION_TONES[n.type] ?? "neutral";
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 rounded-[20px] border p-4 transition ${
                  n.read_at ? "border-slate-200 bg-white" : "border-blue-100 bg-blue-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-950">{n.title}</p>
                  <p className="mt-0.5 text-sm text-slate-600">{n.body}</p>
                  <p className="mt-1.5 text-xs text-slate-400">{formatRelative(n.created_at)}</p>
                </div>
                {!n.read_at && <Badge tone={tone}>New</Badge>}
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No notifications yet.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
