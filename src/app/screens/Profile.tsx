import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { User, Mail, Phone, Settings, ChevronRight, Award, Clock, DollarSign } from "lucide-react";

export function Profile() {
  const navigate = useNavigate();

  const stats = [
    { label: "Total Earned", value: "₦245,000", icon: DollarSign, color: "text-[#00C48C]" },
    { label: "Tasks Done", value: "24", icon: Award, color: "text-[#1A6BFF]" },
    { label: "Hours Worked", value: "156", icon: Clock, color: "text-[#FF9500]" },
  ];

  const teams = [
    { id: 1, name: "Marketing Team", role: "Member", status: "Active" },
    { id: 2, name: "Event Crew", role: "Member", status: "Active" },
    { id: 3, name: "Content Team", role: "Member", status: "Completed" },
  ];

  const menuItems = [
    { icon: User, label: "Edit Profile", path: "/edit-profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] px-6 pt-12 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <button 
            onClick={() => navigate("/settings")}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-xl text-gray-900 mb-1">John Doe</h2>
              <p className="text-sm text-gray-600">CrewMate Member</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm">john.doe@email.com</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">+234 812 345 6789</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 -mt-16 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
              <p className="font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-gray-700" />
                </div>
                <span className="font-semibold text-gray-900">{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Teams */}
      <div className="px-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-3">My Teams</h3>
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          {teams.map((team, index) => (
            <button
              key={team.id}
              className={`w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                index !== teams.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <span className="text-lg">👥</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">{team.name}</p>
                  <p className="text-xs text-gray-500">{team.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    team.status === "Active"
                      ? "bg-green-50 text-[#00C48C]"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {team.status}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
