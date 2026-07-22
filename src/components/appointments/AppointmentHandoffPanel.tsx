"use client";

import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";

type StaffOption = { id: number; display_name: string };

type Props = {
  appointmentId: number;
  apiBase: "/api/staff/appointments" | "/api/admin/appointments";
  mode: "staff" | "admin";
  staffId: number | null;
  status: string;
  startDatetime: string;
  myStaffId?: number | null;
  onDone: () => void;
  onError?: (message: string) => void;
};

/**
 * Claim / transfer / reassign / reschedule for one appointment.
 */
export function AppointmentHandoffPanel({
  appointmentId,
  apiBase,
  mode,
  staffId,
  status,
  startDatetime,
  myStaffId = null,
  onDone,
  onError,
}: Props) {
  const [panel, setPanel] = useState<"transfer" | "reschedule" | null>(null);
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [toStaffId, setToStaffId] = useState("");
  const [reason, setReason] = useState("");
  const [newStart, setNewStart] = useState("");
  const [force, setForce] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const closed = ["cancelled", "completed", "no_show"].includes(status);
  const isMine = myStaffId != null && staffId === myStaffId;
  const unassigned = staffId == null;
  const isDesk = mode === "staff" && myStaffId == null; // receptionist / manager on staff portal

  const canClaim = mode === "staff" && !!myStaffId && unassigned && !closed;
  const canTransfer =
    !closed &&
    (mode === "admin" || isDesk || (mode === "staff" && isMine));
  const canReschedule = !closed && (mode === "admin" || isDesk || isMine || unassigned);

  useEffect(() => {
    if (panel !== "transfer") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/staff/appointments/${appointmentId}/options`);
        if (!res.ok) return;
        const data = (await res.json()) as { staff?: StaffOption[] };
        if (cancelled) return;
        const list = data.staff || [];
        setStaffOptions(
          mode === "staff" && myStaffId
            ? list.filter((s) => s.id !== myStaffId)
            : list,
        );
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [panel, appointmentId, mode, myStaffId]);

  useEffect(() => {
    if (panel !== "reschedule" || !startDatetime) return;
    try {
      setNewStart(format(parseISO(startDatetime), "yyyy-MM-dd'T'HH:mm"));
    } catch {
      setNewStart("");
    }
  }, [panel, startDatetime]);

  function reportError(msg: string) {
    setLocalError(msg);
    onError?.(msg);
  }

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setLocalError(null);
    try {
      const res = await fetch(`${apiBase}/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        reportError(data.error || "Update failed");
        return false;
      }
      setPanel(null);
      setReason("");
      setForce(false);
      setToStaffId("");
      onDone();
      return true;
    } catch {
      reportError("Network error");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (closed) return null;

  return (
    <div className="mt-2 w-full">
      <div className="flex flex-wrap gap-2">
        {canClaim && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => patch({ claim: true })}
              className="min-h-11 border border-salon-border px-3 py-2 text-sm hover:border-salon-primary disabled:opacity-50"
            >
              Claim
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => patch({ claimAndConfirm: true })}
              className="min-h-11 border border-salon-primary px-3 py-2 text-sm text-salon-primary hover:bg-salon-light disabled:opacity-50"
            >
              Claim & confirm
            </button>
          </>
        )}
        {canTransfer && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setPanel(panel === "transfer" ? null : "transfer")}
            className="min-h-11 border border-salon-border px-3 py-2 text-sm hover:border-salon-primary disabled:opacity-50"
          >
            {mode === "admin" || isDesk ? "Reassign" : "Transfer"}
          </button>
        )}
        {canReschedule && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setPanel(panel === "reschedule" ? null : "reschedule")}
            className="min-h-11 border border-salon-border px-3 py-2 text-sm hover:border-salon-primary disabled:opacity-50"
          >
            Reschedule
          </button>
        )}
      </div>

      {panel === "transfer" && (
        <div className="mt-3 border border-salon-border bg-salon-light/60 p-4">
          <p className="text-sm font-medium text-salon-heading">
            {mode === "admin" || isDesk ? "Reassign staff" : "Transfer to a teammate"}
          </p>
          <label className="mt-3 block text-sm text-salon-body">
            Assign to
            <select
              value={toStaffId}
              onChange={(e) => setToStaffId(e.target.value)}
              className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
            >
              <option value="">Select staff...</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.display_name}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-sm text-salon-body">
            Reason (optional)
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Running behind, client preference"
              className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
            />
          </label>
          {mode === "admin" && (
            <label className="mt-3 flex items-center gap-2 text-sm text-salon-body">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className="h-4 w-4 accent-salon-primary"
              />
              Force even if times overlap
            </label>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy || !toStaffId}
              onClick={() =>
                patch({
                  staffId: Number(toStaffId),
                  reason: reason.trim() || undefined,
                  force: mode === "admin" ? force : undefined,
                })
              }
              className="min-h-11 bg-salon-primary px-4 text-sm text-white hover:bg-salon-hover disabled:opacity-50"
            >
              {mode === "admin" || isDesk ? "Save reassignment" : "Transfer now"}
            </button>
            {(mode === "admin" || isDesk) && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  patch({
                    staffId: null,
                    reason: reason.trim() || "Returned to open pool",
                  })
                }
                className="min-h-11 border border-salon-border px-4 text-sm hover:border-salon-primary disabled:opacity-50"
              >
                Unassign (open pool)
              </button>
            )}
          </div>
          {localError && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {localError}
            </p>
          )}
        </div>
      )}

      {panel === "reschedule" && (
        <div className="mt-3 border border-salon-border bg-salon-light/60 p-4">
          <p className="text-sm font-medium text-salon-heading">Reschedule</p>
          <label className="mt-3 block text-sm text-salon-body">
            New date & time
            <input
              type="datetime-local"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
            />
          </label>
          <label className="mt-3 block text-sm text-salon-body">
            Note (optional)
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 block w-full min-h-11 border border-salon-border bg-salon-panel px-3 text-salon-heading"
            />
          </label>
          {mode === "admin" && (
            <label className="mt-3 flex items-center gap-2 text-sm text-salon-body">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className="h-4 w-4 accent-salon-primary"
              />
              Force even if times overlap
            </label>
          )}
          <button
            type="button"
            disabled={busy || !newStart}
            onClick={() =>
              patch({
                startDatetime: new Date(newStart).toISOString(),
                reason: reason.trim() || undefined,
                force: mode === "admin" ? force : undefined,
              })
            }
            className="mt-3 min-h-11 bg-salon-primary px-4 text-sm text-white hover:bg-salon-hover disabled:opacity-50"
          >
            Save new time
          </button>
          {localError && (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {localError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
