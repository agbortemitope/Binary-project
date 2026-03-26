import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, AlertCircle, Upload } from "lucide-react";
import { useTeamStore } from "../store/teamStore";

export function CreateTask() {
  const navigate = useNavigate();
  const teams = useTeamStore((state) => state.teams);
  const members = useTeamStore((state) => state.members);
  const addTask = useTeamStore((state) => state.addTask);
  const updateTeam = useTeamStore((state) => state.updateTeam);
  const addTransaction = useTeamStore((state) => state.addTransaction);

  const [teamId, setTeamId] = useState(teams[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  const selectedTeam = teams.find(t => t.id === teamId);
  const teamMembers = members.filter(m => m.teamId === teamId);

  const handlePublish = () => {
    setError("");

    if (!title || !description || !reward || !assignedTo || !deadline) {
      setError("All fields are required");
      return;
    }

    const rewardAmount = parseInt(reward);
    if (!selectedTeam || selectedTeam.walletBalance < rewardAmount) {
      setError("Insufficient wallet balance. Please fund your wallet first.");
      return;
    }

    // Create task
    const newTask = {
      id: `task-${Date.now()}`,
      teamId,
      title,
      description,
      reward: rewardAmount,
      assignedTo,
      assignedToName: members.find(m => m.userId === assignedTo)?.name,
      deadline,
      status: 'Active' as const,
    };

    addTask(newTask);

    // Update team balances
    updateTeam(teamId, {
      walletBalance: selectedTeam.walletBalance - rewardAmount,
      reservedBalance: selectedTeam.reservedBalance + rewardAmount,
      activeTasks: selectedTeam.activeTasks + 1,
    });

    // Add transaction
    addTransaction({
      id: `txn-${Date.now()}`,
      teamId,
      type: 'Task Reserved',
      amount: -rewardAmount,
      reference: `TSK-${newTask.id}`,
      date: new Date().toISOString(),
      status: 'Success',
    });

    navigate("/lead/tasks");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/lead/tasks")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Task</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-6 pt-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-[#FF3B57] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900">{error}</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-[#1A6BFF] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 mb-1">
              Funds will be reserved from your wallet when you publish this task.
            </p>
            {selectedTeam && (
              <p className="text-xs text-blue-700">
                Available: ₦{selectedTeam.walletBalance.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          {/* Team Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Team
            </label>
            <select
              value={teamId}
              onChange={(e) => {
                setTeamId(e.target.value);
                setAssignedTo("");
              }}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 bg-white"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Create Social Media Graphics"
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task in detail..."
              rows={4}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 resize-none"
            />
          </div>

          {/* Reward Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reward Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                ₦
              </span>
              <input
                type="number"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="10000"
                className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Assign Member */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign to Member
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 bg-white"
            >
              <option value="">Select a member</option>
              {teamMembers.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
            />
          </div>

          {/* Attach Files */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Attach Files (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1A6BFF] transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to upload files</p>
              <p className="text-xs text-gray-500 mt-1">PDF, Images, or Documents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 max-w-[390px] mx-auto">
        <button
          onClick={handlePublish}
          className="w-full bg-[#1A6BFF] text-white rounded-xl py-4 font-bold text-base shadow-lg shadow-blue-200 hover:bg-[#1557CC] transition-colors"
        >
          Publish Task
        </button>
      </div>
    </div>
  );
}
