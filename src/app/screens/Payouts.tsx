import { useNavigate } from "react-router";
import { ArrowLeft, MoreVertical } from "lucide-react";

export function Payouts() {
  const navigate = useNavigate();

  const payouts = [
    {
      id: 1,
      amount: "₦25,000",
      date: "May 7, 2023",
      method: "Bank Transfer",
      status: "Completed" as const,
    },
    {
      id: 2,
      amount: "₦15,000",
      date: "Apr 20, 2023",
      method: "Mobile Money",
      status: "Completed" as const,
    },
    {
      id: 3,
      amount: "₦7,000",
      date: "Apr 28, 2023",
      task: "Data Entry Task",
      status: "Pending" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-white max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/earnings")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <button className="ml-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Payouts List */}
      <div className="px-6 py-6 space-y-4">
        {payouts.map((payout) => (
          <div
            key={payout.id}
            className="border-b border-gray-100 pb-4 last:border-0"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {payout.amount}
                </h3>
                <p className="text-sm text-gray-600">{payout.date}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  payout.status === "Completed"
                    ? "bg-[#00C48C] text-white"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {payout.status}
              </span>
            </div>

            {payout.method && (
              <p className="text-sm text-gray-700 font-medium">
                {payout.method}
              </p>
            )}
            {payout.task && (
              <p className="text-sm text-gray-700">{payout.task}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
