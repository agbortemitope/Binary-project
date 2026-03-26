import { useState } from "react";
import { useNavigate } from "react-router";
import { BottomNavLead } from "../components/BottomNavLead";
import { useTeamStore } from "../store/teamStore";
import { Plus, TrendingDown, DollarSign, ArrowDownCircle, ArrowUpCircle, Clock } from "lucide-react";

export function WalletScreen() {
  const navigate = useNavigate();
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const teams = useTeamStore((state) => state.teams);
  const transactions = useTeamStore((state) => state.transactions);
  const fundWallet = useTeamStore((state) => state.fundWallet);

  const totalBalance = teams.reduce((sum, team) => sum + team.walletBalance, 0);
  const totalReserved = teams.reduce((sum, team) => sum + team.reservedBalance, 0);
  const availableBalance = totalBalance;

  const handleFund = () => {
    if (!selectedTeamId || !fundAmount) return;
    
    const amount = parseInt(fundAmount);
    if (amount > 0) {
      fundWallet(selectedTeamId, amount);
      setShowFundModal(false);
      setFundAmount("");
      setSelectedTeamId("");
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Funding':
        return <ArrowDownCircle className="w-5 h-5 text-[#00C48C]" />;
      case 'Task Reserved':
        return <Clock className="w-5 h-5 text-[#FF9500]" />;
      case 'Task Approved':
        return <ArrowUpCircle className="w-5 h-5 text-[#FF3B57]" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] px-6 pt-12 pb-20">
        <h1 className="text-2xl font-bold text-white mb-8">Wallet</h1>

        {/* Balance Cards */}
        <div className="space-y-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <div className="text-sm text-blue-100 mb-1">Total Balance</div>
            <div className="text-3xl font-bold text-white mb-4">₦{totalBalance.toLocaleString()}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-blue-100 mb-1">Available</div>
                <div className="text-lg font-bold text-white">₦{availableBalance.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-blue-100 mb-1">Reserved</div>
                <div className="text-lg font-bold text-white">₦{totalReserved.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 -mt-12 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowFundModal(true)}
            className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Plus className="w-6 h-6 text-[#00C48C]" />
            </div>
            <span className="font-semibold text-gray-900">Fund Wallet</span>
          </button>

          <button
            onClick={() => alert("Withdrawal feature coming soon")}
            className="bg-white rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-[#1A6BFF]" />
            </div>
            <span className="font-semibold text-gray-900">Withdraw</span>
          </button>
        </div>
      </div>

      {/* Team Wallets */}
      <div className="px-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Team Wallets</h2>
        <div className="space-y-3">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{team.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{team.type} • {team.payoutMode}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Balance</div>
                  <div className="font-bold text-gray-900">₦{team.walletBalance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Reserved</div>
                  <div className="font-bold text-[#FF9500]">₦{team.reservedBalance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Available</div>
                  <div className="font-bold text-[#00C48C]">₦{(team.walletBalance - team.reservedBalance).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="px-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Recent Transactions</h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {transactions.slice(0, 10).map((txn) => (
            <div key={txn.id} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                {getTransactionIcon(txn.type)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{txn.type}</p>
                <p className="text-xs text-gray-500">{txn.reference}</p>
                <p className="text-xs text-gray-500">{new Date(txn.date).toLocaleString()}</p>
              </div>
              <div className={`text-right ${txn.amount > 0 ? 'text-[#00C48C]' : 'text-gray-900'}`}>
                <div className="font-bold">{txn.amount > 0 ? '+' : ''}₦{Math.abs(txn.amount).toLocaleString()}</div>
                <div className={`text-xs px-2 py-0.5 rounded ${
                  txn.status === 'Success' ? 'bg-green-100 text-green-700' :
                  txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {txn.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 max-w-[390px] mx-auto">
          <div className="bg-white rounded-t-3xl w-full p-6 pb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Fund Wallet</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Team
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 bg-white"
                >
                  <option value="">Choose a team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowFundModal(false);
                    setFundAmount("");
                    setSelectedTeamId("");
                  }}
                  className="bg-gray-100 text-gray-700 rounded-xl py-3 font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFund}
                  disabled={!selectedTeamId || !fundAmount}
                  className="bg-[#1A6BFF] text-white rounded-xl py-3 font-semibold hover:bg-[#1557CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fund Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavLead />
    </div>
  );
}
