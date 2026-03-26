import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useTeamStore } from "../store/teamStore";

export function CreateTeam() {
  const navigate = useNavigate();
  const addTeam = useTeamStore((state) => state.addTeam);

  const [teamName, setTeamName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [payoutMode, setPayoutMode] = useState<"Instant" | "Scheduled">("Instant");
  const [payoutFrequency, setPayoutFrequency] = useState<"Daily" | "Weekly" | "Biweekly" | "Monthly">("Weekly");
  const [threshold, setThreshold] = useState("5000");

  const handleCreateTeam = () => {
    if (!teamName) return;

    const newTeam = {
      id: `team-${Date.now()}`,
      name: teamName,
      currency,
      payoutMode,
      payoutFrequency: payoutMode === "Scheduled" ? payoutFrequency : undefined,
      threshold: parseInt(threshold) || 0,
      walletBalance: 0,
      reservedBalance: 0,
      createdBy: "lead-1",
      memberCount: 1,
      activeTasks: 0,
    };

    addTeam(newTeam);
    navigate("/lead/wallet");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/lead")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Team</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-6 pt-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-[#1A6BFF] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Configure your team settings carefully. You can update most settings later.
          </p>
        </div>

        <div className="space-y-5">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Marketing Team"
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 bg-white"
            >
              <option value="NGN">Nigerian Naira (₦)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="GHS">Ghanaian Cedi (GH₵)</option>
              <option value="KES">Kenyan Shilling (KSh)</option>
            </select>
          </div>

          {/* Payout Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payout Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPayoutMode("Instant")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  payoutMode === "Instant"
                    ? "border-[#1A6BFF] bg-blue-50 text-[#1A6BFF]"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                <span className="font-semibold">Instant</span>
                <p className="text-xs mt-1 opacity-80">Pay immediately</p>
              </button>
              <button
                onClick={() => setPayoutMode("Scheduled")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  payoutMode === "Scheduled"
                    ? "border-[#1A6BFF] bg-blue-50 text-[#1A6BFF]"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                <span className="font-semibold">Scheduled</span>
                <p className="text-xs mt-1 opacity-80">Set schedule</p>
              </button>
            </div>
          </div>

          {/* Payout Frequency (only if Scheduled) */}
          {payoutMode === "Scheduled" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payout Frequency
              </label>
              <select
                value={payoutFrequency}
                onChange={(e) => setPayoutFrequency(e.target.value as any)}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 bg-white"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Biweekly">Biweekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          )}

          {/* Minimum Payout Threshold */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Payout Threshold
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                ₦
              </span>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="5000"
                className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Members must earn at least this amount to receive payout
            </p>
          </div>
        </div>
      </div>

      {/* Fixed CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 max-w-[390px] mx-auto">
        <button
          onClick={handleCreateTeam}
          disabled={!teamName}
          className="w-full bg-[#1A6BFF] text-white rounded-xl py-4 font-bold text-base shadow-lg shadow-blue-200 hover:bg-[#1557CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Team
        </button>
      </div>
    </div>
  );
}
