import { useNavigate } from "react-router";
import { BottomNavLead } from "../components/BottomNavLead";
import { User, Mail, Phone, CreditCard, Shield, LogOut, ChevronRight, Edit } from "lucide-react";

export function ProfileScreen() {
  const navigate = useNavigate();

  const profileData = {
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+234 800 123 4567",
    paymentMethod: "First Bank - 0123456789",
    kycStatus: "Verified",
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-[390px] mx-auto pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A6BFF] to-[#0052CC] px-6 pt-12 pb-12">
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

        {/* Avatar & Name */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
            <span className="text-white font-bold text-2xl">JS</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{profileData.name}</h2>
            <p className="text-sm text-blue-100 mt-1">CrewLead Account</p>
            <button className="mt-2 text-sm text-white font-semibold bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-colors flex items-center gap-1">
              <Edit className="w-3 h-3" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="px-6 -mt-6 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-[#1A6BFF]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Full Name</p>
              <p className="font-semibold text-gray-900">{profileData.name}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#00C48C]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{profileData.email}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Phone</p>
              <p className="font-semibold text-gray-900">{profileData.phone}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#FF9500]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">Payment Method</p>
              <p className="font-semibold text-gray-900">{profileData.paymentMethod}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#00C48C]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600">KYC Status</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#00C48C]">{profileData.kycStatus}</p>
                <div className="w-2 h-2 rounded-full bg-[#00C48C]"></div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="px-6 mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3">Settings</h2>
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <Shield className="w-5 h-5 text-gray-600" />
            <span className="flex-1 text-left font-semibold text-gray-900">Privacy & Security</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <span className="flex-1 text-left font-semibold text-gray-900">Payment Settings</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <User className="w-5 h-5 text-gray-600" />
            <span className="flex-1 text-left font-semibold text-gray-900">Account Settings</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="px-6 mb-6">
        <button
          onClick={() => {
            if (confirm("Are you sure you want to logout?")) {
              navigate("/");
            }
          }}
          className="w-full bg-white border-2 border-red-200 text-[#FF3B57] rounded-2xl p-4 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      <BottomNavLead />
    </div>
  );
}
