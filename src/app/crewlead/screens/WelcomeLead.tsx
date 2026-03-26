import { useNavigate } from "react-router";
import { Users, Briefcase, TrendingUp } from "lucide-react";

export function WelcomeLead() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A6BFF] via-[#1557CC] to-[#0052CC] flex flex-col max-w-[390px] mx-auto text-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo/Icon */}
        <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8 shadow-2xl">
          <Users className="w-12 h-12 text-white" strokeWidth={2} />
        </div>

        <h1 className="text-4xl font-bold text-center mb-4">
          CrewPay
        </h1>
        <p className="text-xl font-semibold text-center mb-2 text-blue-100">
          For CrewLeads
        </p>
        <p className="text-center text-blue-100 text-base leading-relaxed mb-12 px-4">
          Manage teams, create tasks, and pay your crew instantly
        </p>

        {/* Features */}
        <div className="w-full space-y-4 mb-12">
          <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Create & Assign Tasks</h3>
              <p className="text-sm text-blue-100">Set rewards and track completion</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Manage Teams</h3>
              <p className="text-sm text-blue-100">Invite members and track performance</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Track Analytics</h3>
              <p className="text-sm text-blue-100">Monitor payouts and team metrics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="px-6 pb-8 space-y-3">
        <button
          onClick={() => navigate("/lead/create-team")}
          className="w-full bg-white text-[#1A6BFF] rounded-xl py-4 font-bold text-base shadow-xl hover:bg-blue-50 transition-colors"
        >
          Create Team
        </button>
        <button
          onClick={() => navigate("/lead/dashboard")}
          className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl py-4 font-bold text-base hover:bg-white/20 transition-colors"
        >
          Join Existing Team
        </button>
      </div>
    </div>
  );
}
