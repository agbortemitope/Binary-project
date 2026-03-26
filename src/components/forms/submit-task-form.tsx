"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Textarea } from "@/components/ui/textarea";

type UploadResult = {
  path: string;
  name: string;
  mimeType: string;
  size: number;
};

export function SubmitTaskForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
          const uploaded: UploadResult[] = [];
          for (const file of files) {
            const formData = new FormData();
            formData.append("taskId", taskId);
            formData.append("file", file);

            const uploadResponse = await fetch("/api/uploads/task-evidence", {
              method: "POST",
              body: formData,
            });

            const uploadPayload = (await uploadResponse.json()) as { ok: boolean; error?: string; data?: UploadResult };
            if (!uploadResponse.ok || !uploadPayload.ok || !uploadPayload.data) {
              throw new Error(uploadPayload.error ?? "Unable to upload evidence.");
            }

            uploaded.push(uploadPayload.data);
          }

          const response = await fetch(`/api/tasks/${taskId}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note, evidence: uploaded }),
          });

          const payload = (await response.json()) as { ok: boolean; error?: string };
          if (!response.ok || !payload.ok) {
            throw new Error(payload.error ?? "Unable to submit task.");
          }

          toast.success("Task submitted for review.");
          setFiles([]);
          setNote("");
          if (fileInputRef.current) fileInputRef.current.value = "";
          router.refresh();
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Unable to submit task.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Submission note</label>
        <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Explain what you completed and attach proof if needed." />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Attachments</label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-between rounded-[24px] bg-blue-600 px-4 py-4 text-left text-white shadow-[0_16px_34px_rgba(31,100,255,0.22)] transition hover:bg-blue-700"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/18">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">Choose files to upload</div>
              <div className="text-xs text-blue-100">Photos, screenshots, receipts, and other proof</div>
            </div>
          </div>
          <div className="rounded-full bg-white/16 px-3 py-1 text-xs font-semibold">
            {files.length > 0 ? `${files.length} selected` : "Select"}
          </div>
        </button>
        {files.length > 0 ? (
          <ul className="space-y-2 text-sm text-slate-500">
            {files.map((file) => (
              <li key={`${file.name}-${file.size}`} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-600">
                <Paperclip className="h-4 w-4 text-blue-600" />
                <span className="truncate">{file.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">Upload at least one file if the task needs proof.</p>
        )}
      </div>

      {error ? <FormMessage>{error}</FormMessage> : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit work"}
      </Button>
    </form>
  );
}
