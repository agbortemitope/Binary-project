import { useState } from "react";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { EmptyState } from "../components/EmptyState";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export function Earnings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const earnings = {
    total: 205000,
    pending: 25000,
    available: 30000,
  };

  const transactions = [
    {
      id: 1,
      title: "Design Logo - Event Crew",
      amount: 10000,
      date: "Mar 5, 2026",
      status: "Completed" as const,
    },
    {
      id: 2,
      title: "Write Blog Post - Content Team",
      amount: 15000,
      date: "Mar 4, 2026",
      status: "Pending" as const,
    },
    {
      id: 3,
      title: "Data Entry - Delivery Squad",
      amount: 7000,
      date: "Mar 3, 2026",
      status: "Completed" as const,
    },
    {
      id: 4,
      title: "Social Media Graphics - Marketing Team",
      amount: 12000,
      date: "Mar 1, 2026",
      status: "Completed" as const,
    },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] px-6 pt-12 pb-24">
        <h1 className="text-2xl font-bold text-white mb-6">Earnings</h1>

        {/* Stats Cards */}
        <div className="space-y-3">
          {/* Total Earned */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/80">Total Earned</span>
              <TrendingUp className="w-5 h-5 text-white/80" />
            </div>
            <p className="text-3xl font-bold text-white">
              ₦{earnings.total.toLocaleString()}
            </p>
          </div>

          {/* Pending & Available */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-[#FF9500]" />
                <span className="text-xs text-white/80">Pending</span>
              </div>
              <p className="text-xl font-bold text-white">
                ₦{earnings.pending.toLocaleString()}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#00C48C]" />
                <span className="text-xs text-white/80">Available</span>
              </div>
              <p className="text-xl font-bold text-white">
                ₦{earnings.available.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="px-6 -mt-16">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Transactions</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="py-4">
              <EmptyState
                icon={DollarSign}
                title="No earnings yet"
                description="Complete tasks to start earning money with CrewPay."
                actionLabel="Browse Tasks"
                onAction={() => navigate("/tasks")}
              />
            </div>
          ) : (
            <div>
              {transactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`px-4 py-4 flex items-center justify-between ${
                    index !== transactions.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.status === "Completed"
                          ? "bg-green-50"
                          : "bg-amber-50"
                      }`}
                    >
                      {transaction.status === "Completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-[#00C48C]" />
                      ) : (
                        <Clock className="w-5 h-5 text-[#FF9500]" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {transaction.title}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#00C48C]">
                      +₦{transaction.amount.toLocaleString()}
                    </p>
                    <span
                      className={`text-xs ${
                        transaction.status === "Completed"
                          ? "text-[#00C48C]"
                          : "text-[#FF9500]"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payout CTA */}
        {earnings.available > 0 && (
          <button
            onClick={() => navigate("/payouts")}
            className="w-full mt-6 bg-[#1A6BFF] text-white rounded-xl py-4 font-bold text-base shadow-lg shadow-blue-200 hover:bg-[#1557CC] transition-colors"
          >
            Request Payout
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
