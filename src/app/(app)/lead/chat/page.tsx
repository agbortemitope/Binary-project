import Link from "next/link";

import { requireLeadProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatRelative } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function LeadChatPage() {
  const { profile } = await requireLeadProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includeChatRooms: true });
  const rooms = snapshot.chatRooms;

  return (
    <div className="space-y-5">
      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-950">Chat</p>
            <p className="text-sm text-slate-600">Open any team or task conversation from here.</p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/lead/teams">Open teams</Link>
          </Button>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="space-y-3">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex items-center justify-between gap-3 rounded-[24px] border border-slate-200 p-4 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-950">{room.name}</div>
                  <div className="mt-1 text-sm text-slate-500">Updated {formatRelative(room.created_at)}</div>
                </div>
                <Badge tone={room.type === "team" ? "info" : room.type === "task" ? "warning" : "neutral"}>{room.type}</Badge>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No chat rooms available yet.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
