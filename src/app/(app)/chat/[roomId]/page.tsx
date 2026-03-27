import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireProfile } from "@/lib/auth";
import { getChatRoomDetail } from "@/lib/data";

import { ChatInterface } from "@/components/chat/chat-interface";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { profile } = await requireProfile();
  const { roomId } = await params;
  const detail = await getChatRoomDetail(profile.user_id, roomId);

  if (!detail?.room) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Chat room not found.
      </div>
    );
  }

  const backHref = profile.default_role_view === "lead" ? "/lead/chat" : "/worker/chat";

  return (
    <div className="flex h-[calc(100svh-8rem)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm lg:h-[calc(100vh-6rem)]">
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
        <Link
          href={backHref}
          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950">{detail.room.name}</p>
          <p className="text-xs text-slate-400 capitalize">{detail.room.type} room</p>
        </div>
      </div>

      <ChatInterface
        roomId={detail.room.id}
        currentUserId={profile.user_id}
        messages={detail.messages}
      />
    </div>
  );
}
