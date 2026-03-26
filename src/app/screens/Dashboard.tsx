import { useState } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { EmptyState } from "../components/EmptyState";
import { Briefcase, Calendar, DollarSign, TrendingUp, Users, Bell } from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  const [hasTeams] = useState(true); // Toggle this to see empty state

  const stats = {
    totalEarnings: 205000,
    activeTasks: 4,
    teamsJoined: 3,
  };

  const teams = [
    { id: 1, name: "Event Crew", earnings: 45000, tasks: 8, avatar: "🎉" },
    { id: 2, name: "Marketing Team", earnings: 85000, tasks: 12, avatar: "📱" },
    { id: 3, name: "Content Team", earnings: 75000, tasks: 10, avatar: "✍️" },
  ];

  const activeTasks = [
    {
      id: 1,
      name: "Design Logo",
      team: "Event Crew",
      reward: 10000,
      dueDate: "Mar 12",
      status: "Active" as const,
    },
    {
      id: 2,
      name: "Write Blog Post",
      team: "Content Team",
      reward: 15000,
      dueDate: "Mar 15",
      status: "Submitted" as const,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#1A6BFF] text-white";
      case "Submitted":
        return "bg-[#FF9500] text-white";
      case "Approved":
        return "bg-[#00C48C] text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!hasTeams) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
        {/* Header */}
        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                Welcome to CrewPay 👋
              </h1>
              <p className="text-base text-gray-700 mt-1">John Doe</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="pt-12">
          <EmptyState
            icon={Users}
            title="No teams yet"
            description="Join a team to start receiving tasks and earning money with CrewPay."
            actionLabel="Join Your First Team"
            onAction={() => navigate("/join-team")}
          />
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] px-6 pt-12 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              Good morning 👋
            </h1>
            <p className="text-base text-white/80 mt-1">John Doe</p>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <DollarSign className="w-5 h-5 text-white/80 mb-2" />
            <p className="text-xs text-white/80 mb-1">Earned</p>
            <p className="font-bold text-white">₦{stats.totalEarnings.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Briefcase className="w-5 h-5 text-white/80 mb-2" />
            <p className="text-xs text-white/80 mb-1">Tasks</p>
            <p className="font-bold text-white">{stats.activeTasks}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <Users className="w-5 h-5 text-white/80 mb-2" />
            <p className="text-xs text-white/80 mb-1">Teams</p>
            <p className="font-bold text-white">{stats.teamsJoined}</p>
          </div>
        </div>
      </div>

      {/* My Teams */}
      <div className="px-6 -mt-16 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white">My Teams</h2>
          <button className="text-sm font-semibold text-white/80 hover:text-white">
            See All
          </button>
        </div>

        <div className="space-y-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
                    {team.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.tasks} active tasks</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#00C48C]">
                    ₦{team.earnings.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total earned</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Tasks */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Active Tasks</h2>
          <button
            onClick={() => navigate("/tasks")}
            className="text-sm font-semibold text-[#1A6BFF] hover:text-[#1557CC]"
          >
            View All
          </button>
        </div>

        {activeTasks.length === 0 ? (
          <div className="bg-white rounded-xl p-8">
            <EmptyState
              icon={Briefcase}
              title="No active tasks"
              description="You don't have any tasks assigned right now."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{task.name}</h3>
                    <p className="text-sm text-gray-600">{task.team}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[#00C48C]">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">
                      ₦{task.reward.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Due {task.dueDate}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
