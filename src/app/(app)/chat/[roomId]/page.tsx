import { requireProfile } from "@/lib/auth";
import { getChatRoomDetail } from "@/lib/data";
import { formatRelative } from "@/lib/utils";

import { MessageComposer } from "@/components/forms/message-composer";
import { SectionCard } from "@/components/section-card";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { profile } = await requireProfile();
  const { roomId } = await params;
  const detail = await getChatRoomDetail(profile.user_id, roomId);

  if (!detail || !detail.room) {
    return <SectionCard>Chat room not found.</SectionCard>;
  }

  return (
    <div className="space-y-5">
      <SectionCard>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Chat room</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{detail.room.name}</h2>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="space-y-3">
          {detail.messages.length > 0 ? (
            detail.messages.map((message) => (
              <div key={message.id} className="rounded-[24px] border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-900">
                    {message.sender_user_id === profile.user_id
                      ? "You"
                      : message.sender?.full_name || message.sender?.email || "CrewPay member"}
                  </div>
                  <div className="text-xs text-slate-500">{formatRelative(message.created_at)}</div>
                </div>
                <div className="mt-2 text-sm text-slate-600">{message.content}</div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No messages yet.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard>
        <MessageComposer roomId={detail.room.id} />
      </SectionCard>
    </div>
  );
}
