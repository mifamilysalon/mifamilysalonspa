"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { StaffProfile } from "@/lib/site";

export default function StaffLoginPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [pinLength, setPinLength] = useState<4 | 6>(4);
  const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch("/api/staff?forLogin=1");
        const d = (await res.json()) as {
          staff?: StaffProfile[];
          pinLength?: 4 | 6;
        };
        setStaff(d.staff || []);
        if (d.pinLength === 6 || d.pinLength === 4) setPinLength(d.pinLength);
      } catch {
        setError("Could not load staff list.");
      }
    }
    loadStaff();
  }, []);

  function appendDigit(digit: string) {
    setPin((p) => (p.length < pinLength ? p + digit : p));
  }

  function backspace() {
    setPin((p) => p.slice(0, -1));
  }

  async function handleLogin() {
    if (!selectedStaff || pin.length !== pinLength) {
      setError(`Select your name and enter your ${pinLength}-digit PIN.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: selectedStaff.id, pin }),
      });

      const data = (await res.json()) as { error?: string; user: { role: string; name: string } };
      if (!res.ok) {
        setError(data.error || "Invalid PIN");
        setPin("");
        return;
      }

      router.push("/staff");
      router.refresh();
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="editorial-panel p-6">
        <h1 className="font-serif text-2xl text-salon-heading">Staff login</h1>
        <p className="mt-2 text-sm text-salon-body">
          Select your name and enter your {pinLength}-digit PIN.
        </p>

        {error && (
          <p className="mt-4 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="mt-6">
          <span className="mb-2 block text-sm font-medium text-salon-heading">Who are you?</span>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {staff.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  setSelectedStaff(member);
                  setPin("");
                  setError(null);
                }}
                className={`min-h-12 w-full border px-4 py-3 text-left transition ${
                  selectedStaff?.id === member.id
                    ? "border-salon-primary bg-salon-light"
                    : "border-salon-border hover:border-salon-primary"
                }`}
              >
                {member.display_name}
              </button>
            ))}
          </div>
        </div>

        {selectedStaff && (
          <div className="mt-6">
            <span className="mb-2 block text-sm font-medium text-salon-heading">
              PIN ({pinLength} digits)
            </span>
            <div className="mb-4 flex justify-center gap-2">
              {Array.from({ length: pinLength }).map((_, i) => (
                <span
                  key={i}
                  className="flex h-12 w-10 items-center justify-center border border-salon-border text-xl"
                >
                  {pin[i] ? "*" : ""}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === "clear") setPin("");
                    else if (key === "back") backspace();
                    else appendDigit(key);
                  }}
                  className="min-h-[48px] border border-salon-border bg-salon-panel text-lg text-salon-heading transition hover:border-salon-primary active:bg-salon-light"
                >
                  {key === "clear" ? "C" : key === "back" ? "Del" : key}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading || pin.length !== pinLength}
              className="mt-6 min-h-12 w-full bg-salon-primary py-3 text-white transition hover:bg-salon-hover disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
