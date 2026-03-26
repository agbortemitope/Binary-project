export function LoadingSpinner({ fullScreen = false }: { fullScreen?: boolean }) {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center max-w-[390px] mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-full h-full border-4 border-gray-200 border-t-[#1A6BFF] rounded-full animate-spin" />
          </div>
          <p className="text-gray-600 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-12 h-12">
        <div className="w-full h-full border-4 border-gray-200 border-t-[#1A6BFF] rounded-full animate-spin" />
      </div>
    </div>
  );
}
