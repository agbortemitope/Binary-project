"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { CreateTeamForm } from "@/components/forms/create-team-form";
import { Button } from "@/components/ui/button";

export function CreateTeamDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Create team
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              aria-label="Close create team modal"
            >
              <X className="h-4 w-4" />
            </button>
            <div>
              <p className="text-lg font-bold text-slate-950">Create team</p>
              <p className="mt-1 text-sm text-slate-600">Set payout mode and threshold, then start inviting members.</p>
            </div>
            <div className="mt-5">
              <CreateTeamForm />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
