import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Users, UserPlus, Settings as SettingsIcon, DollarSign, TrendingUp, Clock, Shield } from "lucide-react";
import { useTeamStore } from "../store/teamStore";

export function ManageTeam() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "payout" | "settings">("overview");

  const team = useTeamStore((state) => state.teams.find(t => t.id === teamId));
  const members = useTeamStore((state) => state.members.filter(m => m.teamId === teamId));
  const tasks = useTeamStore((state) => state.tasks.filter(t => t.teamId === teamId));
  const updateTeam = useTeamStore((state) => state.updateTeam);
  const updateMember = useTeamStore((state) => state.updateMember);
  const removeMember = useTeamStore((state) => state.removeMember);

  const [payoutMode, setPayoutMode] = useState(team?.payoutMode || "Instant");
  const [payoutFrequency, setPayoutFrequency] = useState(team?.payoutFrequency || "Weekly");
  const [threshold, setThreshold] = useState(team?.threshold.toString() || "0");

  if (!team) {
    return <div>Team not found</div>;
  }

  const handleSavePayoutSettings = () => {
    if (!teamId) return;
    updateTeam(teamId, {
      payoutMode: payoutMode as any,
      payoutFrequency: payoutMode === "Scheduled" ? payoutFrequency as any : undefined,
      threshold: parseInt(threshold) || 0,
    });
    alert("Payout settings updated!");
  };

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "members", name: "Members" },
    { id: "payout", name: "Payout" },
    { id: "settings", name: "Settings" },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-8">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/lead/teams")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-sm text-gray-600">{team.type} Team</p>
          </div>
        </div>

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
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Wallet Summary */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Wallet Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Total Balance</div>
                  <div className="text-xl font-bold text-[#1A6BFF]">₦{team.walletBalance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Reserved</div>
                  <div className="text-xl font-bold text-[#FF9500]">₦{team.reservedBalance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Available</div>
                  <div className="text-lg font-bold text-[#00C48C]">₦{(team.walletBalance - team.reservedBalance).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Members</div>
                  <div className="text-lg font-bold text-gray-900">{team.memberCount}</div>
                </div>
              </div>
            </div>

            {/* Task Stats */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Task Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Tasks</span>
                  <span className="font-bold text-gray-900">{tasks.filter(t => t.status === 'Active').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Review</span>
                  <span className="font-bold text-purple-600">{tasks.filter(t => t.status === 'Submitted').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="font-bold text-[#00C48C]">{tasks.filter(t => t.status === 'Approved' || t.status === 'Paid').length}</span>
                </div>
              </div>
            </div>

            {/* Activity Preview */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Task submitted for review</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-[#00C48C]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Task approved and paid</p>
                    <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="space-y-4">
            <button
              onClick={() => alert("Invite feature coming soon!")}
              className="w-full bg-[#1A6BFF] text-white rounded-xl py-3 font-semibold hover:bg-[#1557CC] transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Invite Members
            </button>

            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="bg-white rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          member.role === 'Owner' ? 'bg-purple-100 text-purple-700' :
                          member.role === 'Manager' ? 'bg-blue-100 text-[#1A6BFF]' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Total Earned</div>
                      <div className="font-bold text-gray-900">₦{member.earnings.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Tasks Done</div>
                      <div className="font-bold text-gray-900">{member.tasksCompleted}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {member.role === 'Member' && (
                      <button
                        onClick={() => updateMember(member.id, { role: 'Manager' })}
                        className="flex-1 bg-blue-50 text-[#1A6BFF] rounded-lg py-2 text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Shield className="w-4 h-4" />
                        Promote
                      </button>
                    )}
                    {member.role !== 'Owner' && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${member.name} from team?`)) {
                            removeMember(member.id);
                          }
                        }}
                        className="flex-1 bg-red-50 text-[#FF3B57] rounded-lg py-2 text-sm font-semibold hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payout Settings Tab */}
        {activeTab === "payout" && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                Configure how and when team members receive payments for completed tasks.
              </p>
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

            {/* Frequency (only if Scheduled) */}
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

            {/* Threshold */}
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
            </div>

            <button
              onClick={handleSavePayoutSettings}
              className="w-full bg-[#1A6BFF] text-white rounded-xl py-4 font-bold hover:bg-[#1557CC] transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Team Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    defaultValue={team.name}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
                  />
                </div>

                <button className="w-full bg-blue-50 text-[#1A6BFF] rounded-xl py-3 font-semibold hover:bg-blue-100 transition-colors">
                  Update Team Name
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-4">
                These actions are irreversible. Please be careful.
              </p>
              
              <div className="space-y-2">
                <button className="w-full bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-200 transition-colors">
                  Leave Team
                </button>
                <button className="w-full bg-red-50 text-[#FF3B57] rounded-xl py-3 font-semibold hover:bg-red-100 transition-colors">
                  Delete Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
