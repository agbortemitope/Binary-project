import { useState } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { EmptyState } from "../components/EmptyState";
import { Calendar, DollarSign, ClipboardList } from "lucide-react";

export function TasksList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  const tasks = [
    {
      id: 1,
      title: "Design Logo",
      team: "Event Crew",
      amount: "₦10,000",
      deadline: "Mar 12, 2026",
      status: "Active" as const,
    },
    {
      id: 2,
      title: "Write Blog Post",
      team: "Content Team",
      amount: "₦15,000",
      deadline: "Mar 15, 2026",
      status: "Submitted" as const,
    },
    {
      id: 3,
      title: "Data Entry Task",
      team: "Delivery Squad",
      amount: "₦7,000",
      deadline: "Mar 18, 2026",
      status: "Completed" as const,
    },
  ];

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "active") return task.status === "Active";
    if (activeTab === "completed") return task.status === "Completed";
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#1A6BFF] text-white";
      case "Submitted":
        return "bg-[#FF9500] text-white";
      case "Completed":
        return "bg-[#00C48C] text-white";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Tasks</h1>
        
        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === tab.key
                  ? "bg-[#1A6BFF] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="px-6 pt-6">
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No tasks found"
            description={
              activeTab === "active"
                ? "You don't have any active tasks at the moment."
                : activeTab === "completed"
                ? "You haven't completed any tasks yet."
                : "Join a team to start receiving tasks and earning."
            }
            actionLabel={activeTab === "all" ? "Join a Team" : undefined}
            onAction={activeTab === "all" ? () => navigate("/join-team") : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1 text-left">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 text-left">{task.team}</p>
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
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-4 h-4 text-[#00C48C]" />
                    <span className="font-semibold text-[#00C48C]">
                      {task.amount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{task.deadline}</span>
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
