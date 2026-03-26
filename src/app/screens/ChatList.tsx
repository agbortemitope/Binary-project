import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { EmptyState } from "../components/EmptyState";
import { MessageCircle, Search } from "lucide-react";
import { useState } from "react";

export function ChatList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const chats = [
    {
      id: "1",
      teamName: "Event Crew",
      lastMessage: "Task completed successfully!",
      time: "2m ago",
      unread: 3,
      avatar: "👥",
    },
    {
      id: "2",
      teamName: "Marketing Team",
      lastMessage: "Great work on the design",
      time: "1h ago",
      unread: 0,
      avatar: "📱",
    },
    {
      id: "3",
      teamName: "Content Team",
      lastMessage: "When is the deadline?",
      time: "3h ago",
      unread: 1,
      avatar: "✍️",
    },
  ];

  const filteredChats = chats.filter((chat) =>
    chat.teamName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams..."
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1A6BFF] text-gray-900"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="pt-2">
        {filteredChats.length === 0 && searchQuery ? (
          <div className="px-6">
            <EmptyState
              icon={MessageCircle}
              title="No chats found"
              description={`No teams match "${searchQuery}"`}
            />
          </div>
        ) : chats.length === 0 ? (
          <div className="px-6">
            <EmptyState
              icon={MessageCircle}
              title="No messages yet"
              description="Join a team to start chatting with your crew members."
              actionLabel="Join a Team"
              onAction={() => navigate("/join-team")}
            />
          </div>
        ) : (
          <div className="bg-white">
            {filteredChats.map((chat, index) => (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${
                  index !== filteredChats.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {chat.avatar}
                </div>

                {/* Chat Info */}
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{chat.teamName}</h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage}
                  </p>
                </div>

                {/* Unread Badge */}
                {chat.unread > 0 && (
                  <div className="w-6 h-6 rounded-full bg-[#1A6BFF] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">
                      {chat.unread}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
