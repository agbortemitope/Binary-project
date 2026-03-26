import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Send, Paperclip, Smile } from "lucide-react";
import { useTeamStore } from "../store/teamStore";

export function ConversationScreen() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [messageText, setMessageText] = useState("");

  const chatRoom = useTeamStore((state) => state.chatRooms.find(c => c.id === chatId));
  const messages = useTeamStore((state) => state.messages.filter(m => m.chatRoomId === chatId));
  const addMessage = useTeamStore((state) => state.addMessage);

  const handleSend = () => {
    if (!messageText.trim() || !chatId) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      chatRoomId: chatId,
      senderId: 'lead-1',
      senderName: 'You',
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    addMessage(newMessage);
    setMessageText("");
  };

  if (!chatRoom) {
    return <div>Chat not found</div>;
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/lead/chat")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">{chatRoom.name}</h1>
            <p className="text-xs text-gray-600">{chatRoom.type} Chat</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === 'lead-1';
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                  {!isOwnMessage && (
                    <span className="text-xs font-semibold text-gray-700 mb-1 px-1">
                      {message.senderName}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      isOwnMessage
                        ? 'bg-[#1A6BFF] text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.attachmentUrl && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <a
                          href={message.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                        >
                          View Attachment
                        </a>
                      </div>
                    )}
                  </div>
                  <span className={`text-xs text-gray-500 mt-1 px-1`}>
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:border-[#1A6BFF] focus:outline-none text-gray-900 pr-12"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="w-10 h-10 rounded-full bg-[#1A6BFF] flex items-center justify-center hover:bg-[#1557CC] transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
