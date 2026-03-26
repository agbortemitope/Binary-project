import { useNavigate } from "react-router";
import { BottomNavLead } from "../components/BottomNavLead";
import { useTeamStore } from "../store/teamStore";
import { Plus, TrendingUp, Users, ListTodo, Calendar, DollarSign, Clock, ChevronRight } from "lucide-react";

export function DashboardLead() {
  const navigate = useNavigate();
  const teams = useTeamStore((state) => state.teams);
  const tasks = useTeamStore((state) => state.tasks);

  const totalWalletBalance = teams.reduce((sum, team) => sum + team.walletBalance, 0);
  const totalReservedBalance = teams.reduce((sum, team) => sum + team.reservedBalance, 0);
  const totalActiveMembers = teams.reduce((sum, team) => sum + team.memberCount, 0);
  const totalActiveTasks = tasks.filter(t => t.status === 'Active' || t.status === 'Submitted').length;

  const pendingApprovals = tasks.filter(t => t.status === 'Submitted');
  const nextPayoutTeam = teams.find(t => t.nextPayoutDate);

  const recentActivity = [
    { id: 1, type: 'submission', text: 'Sarah Johnson submitted "Create Social Media Graphics"', time: '2h ago' },
    { id: 2, type: 'task', text: 'New task created: "Email Campaign Design"', time: '4h ago' },
    { id: 3, type: 'approval', text: 'Approved "Event Setup" for David Brown', time: '6h ago' },
    { id: 4, type: 'member', text: 'Mike Chen joined Marketing Team', time: '1d ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back, CrewLead</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] flex items-center justify-center">
            <span className="text-white font-bold text-sm">CL</span>
          </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Wallet Balance */}
          <div className="bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] rounded-2xl p-4 text-white">
            <div className="text-xs opacity-90 mb-1">Wallet Balance</div>
            <div className="text-xl font-bold">₦{totalWalletBalance.toLocaleString()}</div>
          </div>

          {/* Reserved Balance */}
          <div className="bg-gradient-to-br from-[#FF9500] to-[#E68600] rounded-2xl p-4 text-white">
            <div className="text-xs opacity-90 mb-1">Reserved</div>
            <div className="text-xl font-bold">₦{totalReservedBalance.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Active Members */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <Users className="w-5 h-5 text-[#1A6BFF] mb-2" />
            <div className="text-xs text-gray-600 mb-1">Members</div>
            <div className="text-lg font-bold text-gray-900">{totalActiveMembers}</div>
          </div>

          {/* Active Tasks */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <ListTodo className="w-5 h-5 text-[#00C48C] mb-2" />
            <div className="text-xs text-gray-600 mb-1">Active</div>
            <div className="text-lg font-bold text-gray-900">{totalActiveTasks}</div>
          </div>

          {/* Next Payout */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <Calendar className="w-5 h-5 text-[#FF9500] mb-2" />
            <div className="text-xs text-gray-600 mb-1">Payout</div>
            <div className="text-xs font-bold text-gray-900">{nextPayoutTeam?.nextPayoutDate || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate("/lead/tasks/create")}
            className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col items-center gap-2 hover:border-[#1A6BFF] hover:bg-blue-50 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#1A6BFF]" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Create Task</span>
          </button>

          <button
            onClick={() => navigate("/lead/wallet")}
            className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col items-center gap-2 hover:border-[#1A6BFF] hover:bg-blue-50 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#00C48C]" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Fund Wallet</span>
          </button>

          <button
            onClick={() => navigate("/lead/teams")}
            className="bg-white rounded-2xl p-4 border border-gray-200 flex flex-col items-center gap-2 hover:border-[#1A6BFF] hover:bg-blue-50 transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Invite</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Pending Approvals</h2>
            <button
              onClick={() => navigate("/lead/tasks?tab=pending")}
              className="text-[#1A6BFF] text-sm font-semibold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {pendingApprovals.slice(0, 3).map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/lead/tasks/${task.id}`)}
                className="bg-white rounded-2xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.assignedToName}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                    Review
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-bold text-[#1A6BFF]">₦{task.reward.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Submitted {task.submission?.submittedAt ? new Date(task.submission.submittedAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="px-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Recent Activity</h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                activity.type === 'submission' ? 'bg-purple-100' :
                activity.type === 'task' ? 'bg-blue-100' :
                activity.type === 'approval' ? 'bg-green-100' :
                'bg-gray-100'
              }`}>
                {activity.type === 'submission' ? <Clock className="w-4 h-4 text-purple-600" /> :
                 activity.type === 'task' ? <Plus className="w-4 h-4 text-[#1A6BFF]" /> :
                 activity.type === 'approval' ? <TrendingUp className="w-4 h-4 text-[#00C48C]" /> :
                 <Users className="w-4 h-4 text-gray-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.text}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <BottomNavLead />
    </div>
  );
}
