import { CheckCircle2, XCircle, X } from "lucide-react";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function StatusModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  actionLabel,
  onAction,
}: StatusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            type === "success" ? "bg-green-50" : "bg-red-50"
          }`}
        >
          {type === "success" ? (
            <CheckCircle2 className="w-8 h-8 text-[#00C48C]" />
          ) : (
            <XCircle className="w-8 h-8 text-[#FF3B57]" />
          )}
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-center mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                type === "success"
                  ? "bg-[#00C48C] text-white hover:bg-[#00B37D]"
                  : "bg-[#FF3B57] text-white hover:bg-[#E6324D]"
              }`}
            >
              {actionLabel}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
