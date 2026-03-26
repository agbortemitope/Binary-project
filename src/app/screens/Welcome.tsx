import { useNavigate } from "react-router";
import { CheckCircle2, ClipboardList, Coins, Users } from "lucide-react";

export function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-16 pb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to CrewPay
        </h1>
        
        {/* App Icon with Gradient */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] flex items-center justify-center mb-6 shadow-lg">
          <div className="relative">
            <ClipboardList className="w-10 h-10 text-white" strokeWidth={2.5} />
            <Coins className="w-6 h-6 text-white absolute -bottom-1 -right-1" strokeWidth={2.5} />
          </div>
        </div>

        <p className="text-gray-600 text-base leading-relaxed">
          Get paid for your work. Join teams, complete tasks, earn.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="px-6 flex-1">
        <div className="space-y-4">
          {/* CrewMate Card */}
          <button
            onClick={() => navigate("/set-payout")}
            className="w-full bg-white border-2 border-[#1A6BFF] rounded-2xl p-5 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-[#1A6BFF]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">I work & get paid</h3>
                <p className="text-sm text-gray-600">
                  Join teams, complete tasks
                </p>
              </div>
            </div>
          </button>

          {/* CrewLead Card */}
          <button
            onClick={() => navigate("/lead")}
            className="w-full bg-white border-2 border-[#00C48C] rounded-2xl p-5 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4 mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-7 h-7 text-[#00C48C]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  I manage & pay a team
                </h3>
                <p className="text-sm text-gray-600">
                  Create teams, assign tasks, manage payouts
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* CTA Button */}
      <div className="px-6 pb-8 pt-6">
        <p className="text-xs text-gray-500 text-center leading-relaxed px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy. CrewPay is a payment platform for task-based work.
        </p>
      </div>
    </div>
  );
}