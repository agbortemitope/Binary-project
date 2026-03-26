import { useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Users, ListTodo, MessageSquare, Wallet, UserCircle } from "lucide-react";

export function BottomNavLead() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { name: "Dashboard", path: "/lead/dashboard", icon: LayoutDashboard },
    { name: "Teams", path: "/lead/teams", icon: Users },
    { name: "Tasks", path: "/lead/tasks", icon: ListTodo },
    { name: "Chat", path: "/lead/chat", icon: MessageSquare },
    { name: "Wallet", path: "/lead/wallet", icon: Wallet },
    { name: "Profile", path: "/lead/profile", icon: UserCircle },
  ];

  const isActive = (path: string) => {
    if (path === "/lead/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 max-w-[390px] mx-auto z-50">
      <div className="grid grid-cols-6 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                active
                  ? "text-[#1A6BFF] bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-[#1A6BFF]" : ""}`} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 font-medium ${active ? "text-[#1A6BFF]" : ""}`}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
