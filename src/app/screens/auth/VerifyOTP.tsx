import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Shield } from "lucide-react";

export function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "user@example.com";
  const phone = location.state?.phone || "+234 800 000 0000";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.join("").length !== 6) return;
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1500);
  };

  const handleResend = () => {
    setResendCooldown(60);
    // Simulate resend API call
    console.log("OTP resent");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[390px] mx-auto">
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="flex-1 px-6 pt-8 pb-8">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-8 mx-auto">
          <Shield className="w-10 h-10 text-[#1A6BFF]" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Verify Your Account
        </h1>
        <p className="text-gray-600 mb-8 text-center px-4">
          We sent a 6-digit code to<br />
          <span className="font-semibold text-gray-900">{email}</span>
        </p>

        {/* OTP Input */}
        <div className="flex gap-3 justify-center mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#1A6BFF] focus:outline-none text-gray-900"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={otp.join("").length !== 6 || loading}
          className="w-full bg-[#1A6BFF] text-white rounded-xl py-4 font-bold text-base shadow-lg shadow-blue-200 hover:bg-[#1557CC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        >
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>

        {/* Resend */}
        <div className="text-center">
          <p className="text-gray-600 text-sm mb-2">
            Didn't receive the code?
          </p>
          {resendCooldown > 0 ? (
            <p className="text-sm text-gray-500">
              Resend in {resendCooldown}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm font-semibold text-[#1A6BFF] hover:text-[#1557CC]"
            >
              Resend Code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
