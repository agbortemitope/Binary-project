import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Calendar, DollarSign, FileText, Upload } from "lucide-react";

export function TaskDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedTeam, setSelectedTeam] = useState("Event Crew");

  const teams = ["Event Crew", "Delivery Squad", "Content Team"];

  return (
    <div className="min-h-screen bg-white max-w-[390px] mx-auto flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/tasks")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Team Chat</h1>
          <button className="ml-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xl">⋯</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Task Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
            <span className="text-sm text-gray-500">2:30 PM</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Reminder: Please submit the logo design.
          </p>
          <p className="text-xs text-gray-500 mt-2">John Doe 2:31 PM</p>
        </div>

        {/* Message */}
        <div className="bg-[#1A6BFF] text-white rounded-2xl rounded-tr-sm px-4 py-3 mb-4 ml-auto max-w-[80%]">
          <p>Got it! I'll send it in shortly</p>
          <span className="text-xs opacity-80 mt-1 block">2:33</span>
        </div>

        <p className="text-xs text-gray-500 text-right mb-4">John Doe 2:31 PM</p>

        {/* File attachment */}
        <div className="bg-gray-100 rounded-2xl p-4 mb-4 ml-auto max-w-[80%]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#1A6BFF]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">logo_design.jpg</p>
              <p className="text-xs text-gray-500">1.2 MB</p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-4 ml-auto max-w-[80%]">
          <p className="text-gray-700">I've submitted the logo design.</p>
          <p className="text-gray-700">Please check it out.</p>
          <p className="text-xs text-gray-500 mt-1">Telay 3:02 PM</p>
        </div>

        {/* Response */}
        <div className="bg-[#00C48C] text-white rounded-2xl rounded-tr-sm px-4 py-3 mb-4 ml-auto max-w-[80%]">
          <p>Got it! Looks good!</p>
          <span className="text-xs opacity-80 mt-1 block">3:05 PM</span>
        </div>
      </div>

      {/* Quick Verdicts */}
      <div className="px-6 py-4 border-t border-gray-100">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Quie Urdets</h3>
        <div className="space-y-2 mb-4">
          <button
            onClick={() => setSelectedTeam("Bank Transfer")}
            className="w-full text-left py-3 px-4 bg-gray-50 rounded-lg text-gray-700 font-medium flex items-center justify-between"
          >
            <span>Bank Transfer</span>
            <span className="text-gray-400">›</span>
          </button>
          {teams.map((team) => (
            <button
              key={team}
              onClick={() => setSelectedTeam(team)}
              className="w-full text-left py-3 px-4 bg-gray-50 rounded-lg text-gray-700 font-medium flex items-center justify-between"
            >
              <span>{team}</span>
              <span className="text-gray-400">›</span>
            </button>
          ))}
        </div>

        <button className="w-full bg-[#1A6BFF] text-white rounded-xl py-4 font-bold text-base shadow-lg shadow-blue-200 hover:bg-[#1557CC] transition-colors">
          Submit Work
        </button>
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-2xl text-gray-600">+</span>
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:border-[#1A6BFF] focus:outline-none"
        />
        <button className="w-10 h-10 rounded-full bg-[#1A6BFF] flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
