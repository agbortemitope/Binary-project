import Link from "next/link";

import { requireWorkerProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatRelative } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function WorkerChatPage() {
  const { profile } = await requireWorkerProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includeChatRooms: true });
  const teamRooms = snapshot.chatRooms.filter((room) => room.type === "team");

  return (
    <div className="space-y-5">
      <SectionCard>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-slate-950">Team chat</p>
            <p className="text-sm text-slate-600">All the team conversations you currently belong to.</p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/worker/teams">Open teams</Link>
          </Button>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="space-y-3">
          {teamRooms.length > 0 ? (
            teamRooms.map((room) => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-950">{room.name}</div>
                  <div className="mt-1 text-sm text-slate-500">Updated {formatRelative(room.created_at)}</div>
                </div>
                <Badge tone="info">team</Badge>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">
              You are not in any team chats yet.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
