import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ClipboardList, Coins, Users } from "lucide-react";

export function JoinTeam() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const handleJoinTeam = () => {
    // Simulate joining team
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/set-payout")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Join a Team
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Centered Team Icon Illustration */}
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] flex items-center justify-center mb-6 shadow-xl relative">
          <Users className="w-16 h-16 text-white absolute" strokeWidth={2} />
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl bg-[#00C48C] flex items-center justify-center shadow-lg">
            <Coins className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
        </div>

        <p className="text-center text-gray-600 mb-8 leading-relaxed px-4">
          Ask your CrewLead for an invite code or link
        </p>

        {/* Invite Code Input - Large with letter spacing */}
        <div className="w-full mb-4">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="CREW-XXXX"
            className="w-full px-6 py-5 border-2 border-gray-300 rounded-2xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 text-center text-xl font-semibold tracking-[0.2em] placeholder:text-gray-400 placeholder:tracking-[0.2em]"
          />
        </div>

        {/* Or Divider */}
        <div className="w-full flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-500 font-medium">Or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Paste Invite Link Input */}
        <div className="w-full mb-8">
          <input
            type="text"
            value={inviteLink}
            onChange={(e) => setInviteLink(e.target.value)}
            placeholder="Paste Invite Link"
            className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 text-center placeholder:text-gray-400"
          />
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoinTeam}
          className="w-full bg-[#1A6BFF] text-white rounded-xl py-4 font-bold text-base shadow-lg shadow-blue-200 hover:bg-[#1557CC] transition-colors mb-4"
        >
          Join Team
        </button>

        {/* Skip Link */}
        <button
          onClick={() => navigate("/dashboard")}
          className="text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}