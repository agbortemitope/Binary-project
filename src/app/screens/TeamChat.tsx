import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, FileText, Send, Plus } from "lucide-react";

export function TeamChat() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [message, setMessage] = useState("");

  const messages = [
    {
      id: 1,
      sender: "John Doe",
      text: "Reminder: Please submit the logo design.",
      time: "2:30 PM",
      isOwn: false,
    },
    {
      id: 2,
      sender: "John Doe",
      text: "",
      time: "2:31 PM",
      isOwn: false,
    },
    {
      id: 3,
      sender: "You",
      text: "Got it! I'll send it in shortly",
      time: "2:33",
      isOwn: true,
    },
    {
      id: 4,
      sender: "John Doe",
      text: "",
      time: "2:31 PM",
      file: {
        name: "logo_design.jpg",
        size: "1.2 MB",
      },
      isOwn: false,
    },
    {
      id: 5,
      sender: "You",
      text: "I've submitted the logo design.\nPlease check it out.",
      time: "Telay 3:02 PM",
      isOwn: false,
    },
    {
      id: 6,
      sender: "You",
      text: "Got it! Looks good!",
      time: "3:05 PM",
      isOwn: true,
      success: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white max-w-[390px] mx-auto flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/chat")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Team Chat</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xl">⋯</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.isOwn ? "items-end" : "items-start"} flex flex-col`}>
              {!msg.isOwn && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">JD</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{msg.sender}</span>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
              )}
              
              {msg.file ? (
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-[#1A6BFF]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{msg.file.name}</p>
                      <p className="text-xs text-gray-500">{msg.file.size}</p>
                    </div>
                  </div>
                </div>
              ) : msg.text ? (
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.isOwn
                      ? msg.success
                        ? "bg-[#00C48C] text-white rounded-tr-sm"
                        : "bg-[#1A6BFF] text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-900 rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  {msg.isOwn && (
                    <span className="text-xs opacity-80 mt-1 block">{msg.time}</span>
                  )}
                </div>
              ) : null}

              {!msg.isOwn && !msg.file && msg.text && (
                <span className="text-xs text-gray-500 mt-1">{msg.time}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:border-[#1A6BFF] focus:outline-none"
          />
          <button className="w-10 h-10 rounded-full bg-[#1A6BFF] flex items-center justify-center hover:bg-[#1557CC] transition-colors">
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
