import { useNavigate } from "react-router";
import { BottomNavLead } from "../components/BottomNavLead";
import { useTeamStore } from "../store/teamStore";
import { Plus, Users, DollarSign, ListTodo, ChevronRight } from "lucide-react";

export function TeamsScreen() {
  const navigate = useNavigate();
  const teams = useTeamStore((state) => state.teams);

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <button
            onClick={() => navigate("/lead/create-team")}
            className="w-10 h-10 rounded-full bg-[#1A6BFF] flex items-center justify-center hover:bg-[#1557CC] transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
        <p className="text-sm text-gray-600">Manage your teams</p>
      </div>

      {/* Teams List */}
      <div className="px-6 py-6">
        {teams.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No Teams Yet</h3>
            <p className="text-sm text-gray-600 mb-6">
              Create your first team to get started
            </p>
            <button
              onClick={() => navigate("/lead/create-team")}
              className="bg-[#1A6BFF] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1557CC] transition-colors"
            >
              Create Team
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
              >
                {/* Team Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="font-bold text-gray-900 text-lg mb-1">{team.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-[#1A6BFF] text-xs font-semibold rounded">
                        {team.type}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                        {team.payoutMode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="text-sm font-bold text-gray-900">₦{team.walletBalance.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Balance</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="text-sm font-bold text-gray-900">{team.memberCount}</div>
                    <div className="text-xs text-gray-500">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ListTodo className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="text-sm font-bold text-gray-900">{team.activeTasks}</div>
                    <div className="text-xs text-gray-500">Tasks</div>
                  </div>
                </div>

                {/* Manage Button */}
                <button
                  onClick={() => {
                    useTeamStore.getState().setCurrentTeam(team.id);
                    navigate(`/lead/teams/${team.id}`);
                  }}
                  className="w-full bg-[#1A6BFF] text-white rounded-xl py-3 font-semibold hover:bg-[#1557CC] transition-colors flex items-center justify-center gap-2"
                >
                  Manage Team
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavLead />
    </div>
  );
}
