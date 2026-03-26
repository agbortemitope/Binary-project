import { requireProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";

import { MarkNotificationsReadButton } from "@/components/forms/mark-notifications-read-button";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";

export default async function NotificationsPage() {
  const { profile } = await requireProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includeNotifications: true });

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-slate-950">Notifications</p>
          <p className="text-sm text-slate-600">New submissions, payout changes, wallet updates, and chat activity.</p>
        </div>
        <MarkNotificationsReadButton />
      </div>
      <div className="mt-4 space-y-3">
        {snapshot.notifications.length > 0 ? (
          snapshot.notifications.map((notification) => (
            <div key={notification.id} className="flex items-start justify-between gap-3 rounded-[24px] border border-slate-200 p-4">
              <div>
                <div className="font-semibold text-slate-950">{notification.title}</div>
                <div className="mt-1 text-sm text-slate-600">{notification.body}</div>
              </div>
              <Badge tone={notification.read_at ? "neutral" : "info"}>{notification.read_at ? "Read" : "Unread"}</Badge>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
            No notifications yet.
          </div>
        )}
      </div>
    </SectionCard>
  );
}
