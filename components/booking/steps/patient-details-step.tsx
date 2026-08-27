"use client";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PatientDetails, StepProps } from "@/lib/booking/types";
import { validatePatient, type PatientFieldErrors } from "@/lib/booking/patient-validation";

const emptyPatient: PatientDetails = {
  title: "", firstName: "", lastName: "", dob: "", gender: "",
  address1: "", suburb: "", state: "", postcode: "",
  mobile: "", email: "", emergencyContactName: "", emergencyContactPhone: "",
  medicareNumber: "", ihiNumber: "",
};

const TITLES = ["Mr", "Mrs", "Ms", "Miss", "Dr", "Other"];
const GENDERS = ["Male", "Female"];
const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

function SlotHeldTimer() {
  const [seconds, setSeconds] = useState(15 * 60);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return (
    <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-amber-600">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Slot held — {m}:{s} left
    </p>
  );
}

function TextField({ label, value, placeholder, error, onChange }: { label: string; value: string; placeholder?: string; error?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
          error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-[#6E78FF]"
        }`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, placeholder, options, error, onChange }: { label: string; value: string; placeholder: string; options: string[]; error?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-lg border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
            error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-[#6E78FF]"
          }`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function PatientDetailsStep({ data, update, next }: StepProps) {
  const patient = data.patient ?? emptyPatient;
  const [errors, setErrors] = useState<PatientFieldErrors>({});
  const [touched, setTouched] = useState(false);

  const setField = (key: keyof PatientDetails, value: string) => {
    const updated = { ...patient, [key]: value };
    update({ patient: updated });
    if (touched) setErrors(validatePatient(updated));
  };

  const handleContinue = () => {
    const fieldErrors = validatePatient(patient);
    setErrors(fieldErrors);
    setTouched(true);
    if (Object.keys(fieldErrors).length === 0) next();
  };

  const rebateNote = errors.medicareNumber === "Enter at least one identifier to claim a Medicare rebate."
    ? errors.medicareNumber
    : "Enter at least one identifier to claim a Medicare rebate where eligible.";
  const rebateIsError = errors.medicareNumber === "Enter at least one identifier to claim a Medicare rebate.";

  return (
    <div className="space-y-6 py-15">
      <div className="text-center space-y-1.5">
        <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">A few details about you.</h1>
        <p className="text-sm text-muted-foreground">Your information is encrypted and only used for your care.</p>
        <SlotHeldTimer />
      </div>

      <div className="mt-10 rounded-2xl bg-white p-10 shadow-sm space-y-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold">About you</p>
          <SelectField label="Title*" value={patient.title} placeholder="Please select a title" options={TITLES} error={errors.title} onChange={(v) => setField("title", v)} />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="First Name*" value={patient.firstName} placeholder="First name" error={errors.firstName} onChange={(v) => setField("firstName", v)} />
            <TextField label="Last Name*" value={patient.lastName} placeholder="Last name" error={errors.lastName} onChange={(v) => setField("lastName", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Date of Birth*" value={patient.dob} placeholder="DD/MM/YYYY" error={errors.dob} onChange={(v) => setField("dob", v)} />
            <SelectField label="Gender*" value={patient.gender} placeholder="Gender" options={GENDERS} error={errors.gender} onChange={(v) => setField("gender", v)} />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold">Address</p>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Address 1*" value={patient.address1} placeholder="Please enter your street address." error={errors.address1} onChange={(v) => setField("address1", v)} />
            <TextField label="City / Suburb*" value={patient.suburb} placeholder="Please enter your suburb." error={errors.suburb} onChange={(v) => setField("suburb", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="State*" value={patient.state} placeholder="Please select your state." options={STATES} error={errors.state} onChange={(v) => setField("state", v)} />
            <TextField label="Postcode*" value={patient.postcode} placeholder="Postcode" error={errors.postcode} onChange={(v) => setField("postcode", v)} />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold">Contact & emergency</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mobile Phone*</label>
              <div className={`flex rounded-lg border focus-within:ring-1 ${errors.mobile ? "border-red-400 focus-within:ring-red-400" : "border-gray-300 focus-within:ring-[#6E78FF]"}`}>
                <span className="flex items-center px-3 text-sm text-gray-500 border-r">AU</span>
                <input
                  value={patient.mobile}
                  placeholder="+614 xxx-xxxx"
                  onChange={(e) => setField("mobile", e.target.value)}
                  className="w-full rounded-r-lg px-3 py-3 text-sm placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              {errors.mobile && <p className="text-xs text-red-600">{errors.mobile}</p>}
            </div>
            <TextField label="Email Address*" value={patient.email} placeholder="google@gmail.com" error={errors.email} onChange={(v) => setField("email", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Emergency Contact Name*" value={patient.emergencyContactName} placeholder="Emergency contact" error={errors.emergencyContactName} onChange={(v) => setField("emergencyContactName", v)} />
            <TextField label="Emergency Contact Phone*" value={patient.emergencyContactPhone} placeholder="Emergency contact" error={errors.emergencyContactPhone} onChange={(v) => setField("emergencyContactPhone", v)} />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-semibold">Medicare (for rebates)</p>
          <div className={`rounded-lg px-4 py-3 text-sm ${rebateIsError ? "bg-amber-50 text-amber-700" : "bg-[#6E78FF]/10 text-[#6E78FF]"}`}>
            {rebateNote}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <TextField label="Medicare Number + IRN" value={patient.medicareNumber} placeholder="Medicare number" error={rebateIsError ? undefined : errors.medicareNumber} onChange={(v) => setField("medicareNumber", v)} />
              <p className="text-xs text-muted-foreground">10 digits + 1 IRN digit (11 total).</p>
            </div>
            <div className="space-y-1.5">
              <TextField label="IHI Number" value={patient.ihiNumber} placeholder="IHI number" error={errors.ihiNumber} onChange={(v) => setField("ihiNumber", v)} />
              <p className="text-xs text-muted-foreground">16 digits.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleContinue} className="w-full max-w-xs py-6 text-base bg-[#6E78FF] hover:bg-[#6E78FF]/90">
          Continue
        </Button>
      </div>
    </div>
  );
}