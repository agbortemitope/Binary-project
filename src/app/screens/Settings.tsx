import { useNavigate } from "react-router";
import { ArrowLeft, Bell, Lock, CreditCard, HelpCircle, LogOut, ChevronRight, Shield, Moon } from "lucide-react";
import { useState } from "react";

export function Settings() {
  const navigate = useNavigate();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const settingsSections = [
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Push Notifications",
          type: "toggle" as const,
          value: pushNotifications,
          onChange: setPushNotifications,
        },
        {
          icon: Bell,
          label: "Email Notifications",
          type: "toggle" as const,
          value: emailNotifications,
          onChange: setEmailNotifications,
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          icon: Lock,
          label: "Change Password",
          type: "link" as const,
          onClick: () => navigate("/settings/change-password"),
        },
        {
          icon: Shield,
          label: "Two-Factor Authentication",
          type: "link" as const,
          onClick: () => navigate("/settings/2fa"),
        },
      ],
    },
    {
      title: "Payment",
      items: [
        {
          icon: CreditCard,
          label: "Payment Methods",
          type: "link" as const,
          onClick: () => navigate("/set-payout"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          type: "link" as const,
          onClick: () => {},
        },
        {
          icon: HelpCircle,
          label: "Contact Support",
          type: "link" as const,
          onClick: () => {},
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="pb-8">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mt-6">
            <h2 className="px-6 text-sm font-semibold text-gray-500 mb-3">
              {section.title}
            </h2>
            <div className="bg-white">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`px-6 py-4 flex items-center justify-between ${
                    itemIndex !== section.items.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-700" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      {item.label}
                    </span>
                  </div>

                  {item.type === "toggle" && (
                    <button
                      onClick={() => item.onChange?.(!item.value)}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        item.value ? "bg-[#1A6BFF]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          item.value ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  )}

                  {item.type === "link" && (
                    <button onClick={item.onClick}>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div className="mt-6 bg-white">
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600">Version 1.0.0</p>
            <p className="text-xs text-gray-500 mt-1">
              © 2026 CrewPay. All rights reserved.
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="px-6 mt-6">
          <button
            onClick={() => navigate("/auth/login")}
            className="w-full bg-red-50 text-[#FF3B57] rounded-xl py-4 font-bold text-base flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
