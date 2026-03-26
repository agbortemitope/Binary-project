import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { BottomNavLead } from "../components/BottomNavLead";
import { useTeamStore } from "../store/teamStore";
import { Plus, DollarSign, Calendar, User } from "lucide-react";

export function TasksScreenLead() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "active";
  const [activeTab, setActiveTab] = useState<"active" | "pending" | "completed">(initialTab as any);

  const tasks = useTeamStore((state) => state.tasks);

  const activeTasks = tasks.filter(t => t.status === 'Active');
  const pendingTasks = tasks.filter(t => t.status === 'Submitted');
  const completedTasks = tasks.filter(t => t.status === 'Approved' || t.status === 'Paid' || t.status === 'Completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#1A6BFF] text-white";
      case "Submitted":
        return "bg-purple-600 text-white";
      case "Approved":
      case "Completed":
      case "Paid":
        return "bg-[#00C48C] text-white";
      case "Rejected":
        return "bg-[#FF3B57] text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const tabs = [
    { id: "active", name: "Active", count: activeTasks.length },
    { id: "pending", name: "Pending Review", count: pendingTasks.length },
    { id: "completed", name: "Completed", count: completedTasks.length },
  ] as const;

  const currentTasks = 
    activeTab === "active" ? activeTasks :
    activeTab === "pending" ? pendingTasks :
    completedTasks;

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <button
            onClick={() => navigate("/lead/tasks/create")}
            className="w-10 h-10 rounded-full bg-[#1A6BFF] flex items-center justify-center hover:bg-[#1557CC] transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
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

      {/* Tasks List */}
      <div className="px-6 py-6">
        {currentTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No {activeTab} tasks</h3>
            <p className="text-sm text-gray-600 mb-6">
              {activeTab === "active" && "Create a new task to get started"}
              {activeTab === "pending" && "No submissions waiting for review"}
              {activeTab === "completed" && "No completed tasks yet"}
            </p>
            {activeTab === "active" && (
              <button
                onClick={() => navigate("/lead/tasks/create")}
                className="bg-[#1A6BFF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1557CC] transition-colors"
              >
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/lead/tasks/${task.id}`)}
                className="bg-white rounded-2xl p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="font-bold text-[#1A6BFF]">₦{task.reward.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{task.assignedToName || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{task.deadline}</span>
                  </div>
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
