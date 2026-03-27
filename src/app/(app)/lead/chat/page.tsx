import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { requireLeadProfile } from "@/lib/auth";
import { getSnapshotForUser } from "@/lib/data";
import { formatRelative } from "@/lib/utils";

import { SectionCard } from "@/components/section-card";

export default async function LeadChatPage() {
  const { profile } = await requireLeadProfile();
  const snapshot = await getSnapshotForUser(profile.user_id, { includeChatRooms: true });
  const rooms = snapshot.chatRooms;
  const teamRooms = rooms.filter((r) => r.type === "team");
  const taskRooms = rooms.filter((r) => r.type === "task");

  return (
    <div className="space-y-4">
      {teamRooms.length > 0 && (
        <SectionCard>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Team chats</p>
          <div className="mt-3 space-y-2">
            {teamRooms.map((room) => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex items-center gap-3 rounded-[20px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-950">{room.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{formatRelative(room.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {taskRooms.length > 0 && (
        <SectionCard>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Task chats</p>
          <div className="mt-3 space-y-2">
            {taskRooms.map((room) => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex items-center gap-3 rounded-[20px] border border-slate-200 px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-950">{room.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{formatRelative(room.created_at)}</p>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {rooms.length === 0 && (
        <SectionCard>
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No chats yet. Team chats are created automatically when you create a team.
          </div>
        </SectionCard>
      )}
    </div>
  );
}
