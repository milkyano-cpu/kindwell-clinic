"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { StepProps } from "@/lib/booking/types";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidMobile(v: string) {
  return /^04\d{8}$/.test(v.replace(/\s/g, ""));
}

export function FirstVisitStep({ data, update, next, back }: StepProps) {
  const [mobile, setMobile] = useState(data.mobile ?? "");
  const [email, setEmail] = useState(data.email ?? "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ mobile?: string; email?: string }>({});

  const validate = () => {
    const e: { mobile?: string; email?: string } = {};
    if (!mobile || !isValidMobile(mobile)) e.mobile = "Enter a valid Australian mobile digit phone number (04xxxxxxxx).";
    if (!email || !isValidEmail(email)) e.email = "Enter a valid email address.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const cleanMobile = mobile.replace(/\s/g, "");
      const params = new URLSearchParams({ mobile: cleanMobile, email, service: data.service! });
      const res = await fetch(`/api/patient-status?${params}`);
      if (!res.ok) throw new Error();
      const result = await res.json() as { visitType: "initial" | "follow-up" };
      const mobileChanged = data.mobile !== null && data.mobile !== cleanMobile;
      const emailChanged = data.email !== null && data.email !== email;
      update({
        mobile: cleanMobile,
        email,
        visitType: result.visitType,
        duration: null,
        patient: (mobileChanged || emailChanged) ? null : data.patient,
      });
      next();
    } catch {
      setErrors({ mobile: "Unable to check your details. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">Let&apos;s get you booked.</h1>
      <p className="text-muted-foreground text-sm">
        We&apos;ll use these to check if you&apos;re a returning patient.
      </p>

      <div className="space-y-4 text-left">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Mobile number</label>
          <div className={`flex rounded-lg border focus-within:ring-1 ${errors.mobile ? "border-red-400 focus-within:ring-red-400" : "border-gray-300 focus-within:ring-[#6E78FF]"}`}>
            <span className="flex items-center px-3 text-sm text-gray-500 border-r">AU</span>
            <input
              type="tel"
              value={mobile}
              placeholder="04xxxxxxxxx"
              maxLength={11}
              disabled={loading}
              onChange={(e) => { setMobile(e.target.value); setErrors((p) => ({ ...p, mobile: undefined })); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleContinue(); }}
              className="w-full rounded-r-lg px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none"
            />
          </div>
          {errors.mobile && <p className="text-xs text-red-600">{errors.mobile}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email address</label>
          <input
            type="email"
            value={email}
            placeholder="you@example.com"
            disabled={loading}
            onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleContinue(); }}
            className={`w-full rounded-lg border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
              errors.email ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-[#6E78FF]"
            }`}
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          disabled={!mobile || !email || loading}
          onClick={handleContinue}
          className="w-[300px] bg-[#6E78FF] hover:bg-[#6E78FF]/90"
        >
          {loading ? "Checking…" : "Continue"}
        </Button>
      </div>

      <button
        onClick={back}
        className="cursor-pointer text-xs font-semibold tracking-wide text-foreground underline underline-offset-4 transition-colors hover:text-[#6E78FF]"
      >
        BACK
      </button>
    </div>
  );
}
