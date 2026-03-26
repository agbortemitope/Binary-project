import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Building2, Lock, AlertCircle, Wallet } from "lucide-react";

export function SetPayoutMethod() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"bank" | "crypto">("bank");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [cryptoType, setCryptoType] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const handleSave = () => {
    // Navigate to join team after saving
    navigate("/join-team");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Set Payout Method
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Info Banner */}
        <div className="mx-6 mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-[#1A6BFF] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Required before joining any team — ensures instant payment.
          </p>
        </div>

        {/* Method Toggle */}
        <div className="px-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setMethod("bank")}
              className={`p-5 rounded-xl border-2 transition-all ${
                method === "bank"
                  ? "border-[#1A6BFF] bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Building2
                className={`w-7 h-7 mx-auto mb-2 ${
                  method === "bank" ? "text-[#1A6BFF]" : "text-gray-500"
                }`}
              />
              <span
                className={`text-sm font-semibold block ${
                  method === "bank" ? "text-[#1A6BFF]" : "text-gray-700"
                }`}
              >
                Bank Transfer
              </span>
            </button>

            <button
              onClick={() => setMethod("crypto")}
              className={`p-5 rounded-xl border-2 transition-all ${
                method === "crypto"
                  ? "border-[#1A6BFF] bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <Wallet
                className={`w-7 h-7 mx-auto mb-2 ${
                  method === "crypto" ? "text-[#1A6BFF]" : "text-gray-500"
                }`}
              />
              <span
                className={`text-sm font-semibold block ${
                  method === "crypto" ? "text-[#1A6BFF]" : "text-gray-700"
                }`}
              >
                Crypto
              </span>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-6 mt-8 space-y-5">
          {method === "bank" ? (
            <>
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bank Name
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 bg-white"
                >
                  <option value="">Select your bank</option>
                  <option value="firstbank">First Bank of Nigeria</option>
                  <option value="gtbank">GTBank</option>
                  <option value="access">Access Bank</option>
                  <option value="zenith">Zenith Bank</option>
                  <option value="uba">UBA</option>
                  <option value="union">Union Bank</option>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="tel"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0123456789"
                  maxLength={10}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Full name as per bank records"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
                />
              </div>
            </>
          ) : (
            <>
              {/* Cryptocurrency Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cryptocurrency
                </label>
                <select
                  value={cryptoType}
                  onChange={(e) => setCryptoType(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 bg-white"
                >
                  <option value="">Select cryptocurrency</option>
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="usdt">Tether (USDT)</option>
                  <option value="usdc">USD Coin (USDC)</option>
                  <option value="bnb">BNB</option>
                </select>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Enter your wallet address"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900 font-mono text-sm"
                />
              </div>

              {/* Network Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-900">
                  <span className="font-semibold">Important:</span> Ensure your wallet address is correct. Payments sent to an incorrect address cannot be recovered.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Security Note */}
        <div className="px-6 mt-6 flex items-center gap-2 text-gray-600">
          <Lock className="w-4 h-4" />
          <p className="text-xs">
            Your payment information is encrypted and secure
          </p>
        </div>
      </div>

      {/* Fixed CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 max-w-[390px] mx-auto">
        <button
          onClick={handleSave}
          className="w-full bg-[#1A6BFF] text-white rounded-xl py-4 font-bold text-base shadow-lg shadow-blue-200 hover:bg-[#1557CC] transition-colors"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}