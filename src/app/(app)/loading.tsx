export default function AppLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5">
        <div className="h-3 w-28 rounded-full bg-slate-200" />
        <div className="mt-3 h-8 w-56 rounded-full bg-slate-200" />
        <div className="mt-4 h-4 w-full max-w-xl rounded-full bg-slate-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 rounded-[24px] bg-slate-100" />
        <div className="h-28 rounded-[24px] bg-slate-100" />
        <div className="h-28 rounded-[24px] bg-slate-100" />
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5">
        <div className="h-5 w-36 rounded-full bg-slate-200" />
        <div className="mt-4 space-y-3">
          <div className="h-20 rounded-[22px] bg-slate-100" />
          <div className="h-20 rounded-[22px] bg-slate-100" />
          <div className="h-20 rounded-[22px] bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
