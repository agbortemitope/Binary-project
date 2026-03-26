import { useState } from "react";
import { useNavigate } from "react-router";
import { BottomNavLead } from "../components/BottomNavLead";
import { useTeamStore } from "../store/teamStore";
import { MessageSquare, Users, User, FileText, ChevronRight } from "lucide-react";

export function ChatScreenLead() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"team" | "direct" | "task">("team");

  const chatRooms = useTeamStore((state) => state.chatRooms);

  const teamChats = chatRooms.filter(c => c.type === 'Group');
  const directChats = chatRooms.filter(c => c.type === 'Direct');
  const taskChats = chatRooms.filter(c => c.type === 'Task');

  const tabs = [
    { id: "team", name: "Team Chat", count: teamChats.length },
    { id: "direct", name: "Direct", count: directChats.length },
    { id: "task", name: "Task Chat", count: taskChats.length },
  ] as const;

  const currentChats = 
    activeTab === "team" ? teamChats :
    activeTab === "direct" ? directChats :
    taskChats;

  const getIcon = (type: string) => {
    switch (type) {
      case 'Group':
        return <Users className="w-5 h-5 text-[#1A6BFF]" />;
      case 'Direct':
        return <User className="w-5 h-5 text-[#00C48C]" />;
      case 'Task':
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Chat</h1>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto -mx-6 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-[#1A6BFF] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-white/20" : "bg-gray-300"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="px-6 py-6">
        {currentChats.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-sm text-gray-600">
              {activeTab === "team" && "Team chats will appear here"}
              {activeTab === "direct" && "Start a direct conversation"}
              {activeTab === "task" && "Task-specific chats will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => navigate(`/lead/chat/${chat.id}`)}
                className="bg-white rounded-2xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {getIcon(chat.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{chat.name}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage || 'No messages yet'}</p>
                    {chat.unreadCount > 0 && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-0.5 bg-[#1A6BFF] text-white text-xs font-semibold rounded-full">
                          {chat.unreadCount} new
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavLead />
    </div>
  );
}
