import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Mail, KeyRound } from "lucide-react";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSendReset = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
    }, 1500);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto">
        <div className="flex-1 px-6 pt-16 pb-8 flex flex-col items-center justify-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-2xl bg-green-50 flex items-center justify-center mb-8">
            <Mail className="w-10 h-10 text-[#00C48C]" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Check Your Email
          </h1>
          <p className="text-gray-600 mb-8 text-center px-4">
            We've sent password reset instructions to<br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          <button
            onClick={() => navigate("/auth/login")}
            className="w-full bg-[#1A6BFF] text-white rounded-xl py-4 font-bold text-base shadow-lg shadow-blue-200 hover:bg-[#1557CC] transition-colors mb-4"
          >
            Back to Sign In
          </button>

          <button
            onClick={() => setEmailSent(false)}
            className="text-sm font-semibold text-[#1A6BFF] hover:text-[#1557CC]"
          >
            Try different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <button
          onClick={() => navigate("/auth/login")}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="flex-1 px-6 pt-8 pb-8">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-8">
          <KeyRound className="w-10 h-10 text-[#1A6BFF]" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Forgot Password?
        </h1>
        <p className="text-gray-600 mb-8">
          No worries! Enter your email and we'll send you reset instructions.
        </p>

        <div className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
              />
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendReset}
            disabled={!email || loading}
            className="w-full bg-[#1A6BFF] text-white rounded-xl py-4 font-bold text-base shadow-lg shadow-blue-200 hover:bg-[#1557CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/auth/login")}
            className="text-sm font-semibold text-[#1A6BFF] hover:text-[#1557CC]"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
