import { useNavigate, useParams } from "react-router";
import { ArrowLeft, DollarSign, Calendar, User, FileText, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useTeamStore } from "../store/teamStore";

export function TaskDetailLead() {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const task = useTeamStore((state) => state.tasks.find(t => t.id === taskId));
  const approveTask = useTeamStore((state) => state.approveTask);
  const rejectTask = useTeamStore((state) => state.rejectTask);

  if (!task) {
    return <div>Task not found</div>;
  }

  const handleApprove = () => {
    if (confirm("Approve this task submission? Funds will be released to the member.")) {
      approveTask(task.id);
      navigate("/lead/tasks?tab=completed");
    }
  };

  const handleReject = () => {
    if (confirm("Reject this submission? The task will return to active status.")) {
      rejectTask(task.id);
      navigate("/lead/tasks");
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-8">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/lead/tasks")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Task Details</h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        {/* Task Info */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">{task.title}</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs">Reward</span>
              </div>
              <div className="font-bold text-[#1A6BFF]">₦{task.reward.toLocaleString()}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Deadline</span>
              </div>
              <div className="font-bold text-gray-900 text-sm">{task.deadline}</div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs">Assigned</span>
              </div>
              <div className="font-bold text-gray-900 text-sm">{task.assignedToName}</div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
          </div>
        </div>

        {/* Submissions */}
        {task.submission && (
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#1A6BFF]" />
              <h3 className="font-bold text-gray-900">Submission</h3>
            </div>

            {task.submission.note && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-700 mb-1">Note from CrewMate</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{task.submission.note}</p>
              </div>
            )}

            {task.submission.fileUrl && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Attached Files</h4>
                <a
                  href={task.submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-50 text-[#1A6BFF] rounded-lg p-3 hover:bg-blue-100 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-semibold">View Submission File</span>
                </a>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Submitted on {task.submission.submittedAt ? new Date(task.submission.submittedAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Task Chat */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#1A6BFF]" />
              <h3 className="font-bold text-gray-900">Task Chat</h3>
            </div>
            <button
              onClick={() => navigate(`/lead/chat/task/${task.id}`)}
              className="text-[#1A6BFF] text-sm font-semibold hover:underline"
            >
              Open Chat
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Discuss this task with the assigned member
          </p>
        </div>

        {/* Action Buttons */}
        {task.status === 'Submitted' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleReject}
              className="bg-white border-2 border-[#FF3B57] text-[#FF3B57] rounded-xl py-4 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="bg-[#00C48C] text-white rounded-xl py-4 font-bold hover:bg-[#00A876] transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <CheckCircle className="w-5 h-5" />
              Approve
            </button>
          </div>
        )}

        {task.status === 'Approved' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <CheckCircle className="w-8 h-8 text-[#00C48C] mx-auto mb-2" />
            <p className="font-semibold text-green-900">Task Approved</p>
            <p className="text-sm text-green-700 mt-1">Funds released to member</p>
          </div>
        )}

        {task.status === 'Rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <XCircle className="w-8 h-8 text-[#FF3B57] mx-auto mb-2" />
            <p className="font-semibold text-red-900">Submission Rejected</p>
            <p className="text-sm text-red-700 mt-1">Task returned to active status</p>
          </div>
        )}
      </div>
    </div>
  );
}
