import { useNavigate, useLocation } from "react-router";
import { Home, ClipboardList, MessageCircle, DollarSign, User } from "lucide-react";

interface BottomNavProps {
  badge?: {
    tab: string;
    count?: number;
  };
}

export function BottomNav({ badge }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "/dashboard" },
    { id: "tasks", label: "Tasks", icon: ClipboardList, path: "/tasks" },
    { id: "chat", label: "Chat", icon: MessageCircle, path: "/chat" },
    { id: "earnings", label: "Earnings", icon: DollarSign, path: "/earnings" },
    { id: "profile", label: "Profile", icon: User, path: "/profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-[390px] mx-auto flex justify-around items-center h-20 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          const hasBadge = badge?.tab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-1 relative flex-1 py-2"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 ${
                    active ? "text-[#1A6BFF]" : "text-gray-500"
                  }`}
                />
                {hasBadge && (
                  <div className="absolute -top-1 -right-1 bg-[#FF3B57] rounded-full w-4 h-4 flex items-center justify-center">
                    {badge.count && (
                      <span className="text-white text-[10px] font-bold">
                        {badge.count}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span
                className={`text-xs ${
                  active ? "text-[#1A6BFF] font-semibold" : "text-gray-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
