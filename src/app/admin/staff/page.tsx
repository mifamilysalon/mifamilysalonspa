"use client";

import { useCallback, useEffect, useState } from "react";

type ServiceOption = { id: number; name: string; category: string };

type StaffMember = {
  id: number;
  user_id: number;
  display_name: string;
  bio: string | null;
  is_bookable: number;
  name: string;
  email: string | null;
  role: string;
  is_active: number;
  has_pin: number;
  service_ids: number[];
};

type FormState = {
  display_name: string;
  name: string;
  email: string;
  role: "stylist" | "receptionist" | "manager";
  bio: string;
  is_bookable: boolean;
  pin: string;
  service_ids: number[];
};

const emptyForm = (): FormState => ({
  display_name: "",
  name: "",
  email: "",
  role: "stylist",
  bio: "",
  is_bookable: true,
  pin: "",
  service_ids: [],
});

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [pinLength, setPinLength] = useState<4 | 6>(4);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pinOnlyId, setPinOnlyId] = useState<number | null>(null);
  const [pinOnlyValue, setPinOnlyValue] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = (await res.json()) as {
        staff?: StaffMember[];
        services?: ServiceOption[];
        pinLength?: 4 | 6;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Failed to load staff");
        return;
      }
      setStaff(data.staff || []);
      setServices(data.services || []);
      if (data.pinLength === 4 || data.pinLength === 6) setPinLength(data.pinLength);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(member: StaffMember) {
    setEditingId(member.id);
    setPinOnlyId(null);
    setForm({
      display_name: member.display_name,
      name: member.name,
      email: member.email || "",
      role: (["stylist", "receptionist", "manager"].includes(member.role)
        ? member.role
        : "stylist") as FormState["role"],
      bio: member.bio || "",
      is_bookable: !!member.is_bookable,
      pin: "",
      service_ids: [...member.service_ids],
    });
    setError(null);
    setMessage(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm());
  }

  function toggleService(serviceId: number) {
    setForm((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter((id) => id !== serviceId)
        : [...prev.service_ids, serviceId],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (!editingId && form.pin.length !== pinLength) {
        setError(`Enter a ${pinLength}-digit PIN for new staff.`);
        return;
      }
      if (editingId && form.pin && form.pin.length !== pinLength) {
        setError(`PIN must be ${pinLength} digits, or leave blank to keep the current PIN.`);
        return;
      }

      const payload: Record<string, unknown> = {
        display_name: form.display_name.trim(),
        name: (form.name || form.display_name).trim(),
        email: form.email.trim() || null,
        role: form.role,
        bio: form.bio.trim() || null,
        is_bookable: form.is_bookable,
        service_ids: form.service_ids,
      };
      if (form.pin) payload.pin = form.pin;

      const res = await fetch(
        editingId ? `/api/admin/staff/${editingId}` : "/api/admin/staff",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }

      setMessage(editingId ? "Staff updated." : "Staff added.");
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function setPin(memberId: number) {
    if (pinOnlyValue.length !== pinLength) {
      setError(`PIN must be ${pinLength} digits.`);
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/staff/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinOnlyValue }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not set PIN");
        return;
      }
      setMessage("PIN updated.");
      setPinOnlyId(null);
      setPinOnlyValue("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(member: StaffMember) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: !member.is_active,
          is_bookable: member.is_active ? false : !!member.is_bookable,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Update failed");
        return;
      }
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function removeStaff(member: StaffMember) {
    if (
      !window.confirm(
        `Remove ${member.display_name} from staff? They will no longer appear on booking or staff login. Appointment history is kept.`,
      )
    ) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/staff/${member.id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Remove failed");
        return;
      }
      setMessage(`${member.display_name} removed.`);
      if (editingId === member.id) resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-salon-heading">Staff</h1>
      <p className="mt-2 text-sm text-salon-body">
        Add or remove team members, assign services, and set login PINs ({pinLength} digits).
      </p>

      {(error || message) && (
        <p
          className={`mt-4 border px-4 py-3 text-sm ${
            error
              ? "border-red-300 bg-red-50 text-red-800"
              : "border-salon-border bg-salon-light text-salon-heading"
          }`}
        >
          {error || message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="editorial-panel mt-8 space-y-4 p-6">
        <h2 className="font-serif text-lg text-salon-heading">
          {editingId ? "Edit staff" : "Add staff"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Display name</span>
            <input
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              required
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Full name</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Defaults to display name"
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Email (optional)</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">Role</span>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as FormState["role"] })
              }
              className="min-h-12 w-full border border-salon-border px-3"
            >
              <option value="stylist">Stylist</option>
              <option value="receptionist">Receptionist</option>
              <option value="manager">Manager</option>
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm text-salon-heading">Bio</span>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full border border-salon-border px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-salon-heading">
              {editingId ? `New PIN (optional, ${pinLength} digits)` : `PIN (${pinLength} digits)`}
            </span>
            <input
              type="password"
              inputMode="numeric"
              pattern={`\\d{${pinLength}}`}
              maxLength={pinLength}
              value={form.pin}
              onChange={(e) =>
                setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, pinLength) })
              }
              required={!editingId}
              className="min-h-12 w-full border border-salon-border px-3"
            />
          </label>
          <label className="flex min-h-12 items-center gap-3 self-end">
            <input
              type="checkbox"
              checked={form.is_bookable}
              onChange={(e) => setForm({ ...form, is_bookable: e.target.checked })}
              className="h-5 w-5 accent-salon-primary"
            />
            <span className="text-sm text-salon-body">Bookable online</span>
          </label>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-salon-heading">Services</legend>
          <div className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-2">
            {services.map((service) => (
              <label key={service.id} className="flex min-h-10 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.service_ids.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                  className="h-4 w-4 accent-salon-primary"
                />
                <span>
                  {service.name}{" "}
                  <span className="text-salon-body/70">({service.category})</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="min-h-12 bg-salon-primary px-6 py-3 text-white hover:bg-salon-hover disabled:opacity-60"
          >
            {saving ? "Saving..." : editingId ? "Save changes" : "Add staff"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="min-h-12 border border-salon-border px-4 py-2 text-sm hover:border-salon-primary"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div className="mt-8">
        <h2 className="font-serif text-lg text-salon-heading">Team roster</h2>
        {loading ? (
          <p className="mt-4 text-salon-body">Loading...</p>
        ) : staff.length === 0 ? (
          <p className="mt-4 text-salon-body">No staff yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-salon-border border border-salon-border">
            {staff.map((member) => (
              <li key={member.id} className="space-y-3 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-salon-heading">
                      {member.display_name}
                      {!member.is_active && (
                        <span className="ml-2 text-xs text-red-600">(removed)</span>
                      )}
                      {member.is_active && !member.is_bookable && (
                        <span className="ml-2 text-xs text-salon-body">(not bookable)</span>
                      )}
                    </p>
                    <p className="text-sm text-salon-body">
                      {member.role}
                      {member.email ? ` · ${member.email}` : ""}
                      {member.has_pin ? " · PIN set" : " · no PIN"}
                      {member.service_ids.length
                        ? ` · ${member.service_ids.length} service${member.service_ids.length === 1 ? "" : "s"}`
                        : " · no services"}
                    </p>
                    {member.bio && (
                      <p className="mt-1 text-sm text-salon-body/80">{member.bio}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={saving || !member.is_active}
                      onClick={() => startEdit(member)}
                      className="min-h-11 border border-salon-border px-3 text-sm hover:border-salon-primary disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={saving || !member.is_active}
                      onClick={() => {
                        setPinOnlyId(member.id);
                        setPinOnlyValue("");
                        setError(null);
                      }}
                      className="min-h-11 border border-salon-border px-3 text-sm hover:border-salon-primary disabled:opacity-50"
                    >
                      Set PIN
                    </button>
                    {member.is_active ? (
                      <>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => toggleActive(member)}
                          className="min-h-11 border border-salon-border px-3 text-sm hover:border-salon-primary"
                        >
                          Deactivate
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => removeStaff(member)}
                          className="min-h-11 border border-red-300 px-3 text-sm text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => toggleActive(member)}
                        className="min-h-11 border border-salon-border px-3 text-sm hover:border-salon-primary"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </div>
                {pinOnlyId === member.id && (
                  <div className="flex flex-wrap items-end gap-2 border-t border-salon-border pt-3">
                    <label className="block">
                      <span className="mb-1 block text-sm text-salon-heading">
                        New {pinLength}-digit PIN
                      </span>
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={pinLength}
                        value={pinOnlyValue}
                        onChange={(e) =>
                          setPinOnlyValue(
                            e.target.value.replace(/\D/g, "").slice(0, pinLength),
                          )
                        }
                        className="min-h-11 w-40 border border-salon-border px-3"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setPin(member.id)}
                      className="min-h-11 bg-salon-primary px-4 text-sm text-white hover:bg-salon-hover disabled:opacity-60"
                    >
                      Save PIN
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPinOnlyId(null);
                        setPinOnlyValue("");
                      }}
                      className="min-h-11 border border-salon-border px-3 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
