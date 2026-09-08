import { z } from "zod";
import type { PatientDetails } from "./types";

// Street address postcodes only — PO Box (1xxx NSW, 02xx ACT) and LVR ranges excluded
const POSTCODE_STATE_RANGES: Record<string, [number, number][]> = {
  NSW: [[2000, 2599], [2619, 2899], [2921, 2999]],
  ACT: [[2600, 2618], [2900, 2920]],
  VIC: [[3000, 3999]],
  QLD: [[4000, 4999]],
  SA:  [[5000, 5799]],
  WA:  [[6000, 6797]],
  TAS: [[7000, 7799]],
  NT:  [[800,  899]],
};

function isPostcodeValidForState(postcode: string, state: string): boolean {
  const code = parseInt(postcode, 10);
  if (isNaN(code)) return false;
  const ranges = POSTCODE_STATE_RANGES[state];
  if (!ranges) return true;
  return ranges.some(([min, max]) => code >= min && code <= max);
}

function isValidDob(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) return false;
  const age = (Date.now() - date.getTime()) / (365.25 * 24 * 3600 * 1000);
  return age >= 18;
}

function normalizePhone(value: string) {
  return value.replace(/[\s-]/g, "");
}

export const patientSchema = z
  .object({
    title: z.string().min(1, "Please select a title."),
    firstName: z.string().min(1, "Required."),
    lastName: z.string().min(1, "Required.").max(40, "Max 40 characters."),
    dob: z.string().refine(isValidDob, "Enter a valid date. You must be 18 or older."),
    gender: z.string().min(1, "Required."),
    address1: z.string().min(1, "Required.").max(50, "Max 50 characters."),
    suburb: z.string().min(1, "Required.").max(60, "Max 60 characters."),
    state: z.string().min(1, "Required."),
    postcode: z.string().regex(/^\d{4}$/, "Enter a valid 4-digit postcode."),
    mobile: z
      .string()
      .transform(normalizePhone)
      .refine((v) => /^(\+614\d{8}|04\d{8})$/.test(v), "Enter a valid AU mobile (+614 or 04xx xxx xxx)."),
    email: z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email.").max(100, "Max 100 characters."),
    emergencyContactName: z.string().min(1, "Required."),
    emergencyContactPhone: z.string().min(1, "Required."),
    emergencyRelationship: z.string().min(1, "Required."),
    medicareNumber: z
      .string()
      .transform((v) => v.replace(/\s/g, ""))
      .refine((v) => v === "" || /^\d{11}$/.test(v), "Medicare must be 11 digits (10 + IRN)."),
    ihiNumber: z
      .string()
      .transform((v) => v.replace(/\s/g, ""))
      .refine((v) => v === "" || /^\d{16}$/.test(v), "IHI must be 16 digits."),
  }).superRefine((data, ctx) => {
    if (data.postcode && data.state && !isPostcodeValidForState(data.postcode, data.state)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["postcode"],
        message: `Postcode ${data.postcode} is not valid for ${data.state}.`,
      });
    }
  });

export type PatientFieldErrors = Partial<Record<keyof z.infer<typeof patientSchema>, string>>;

export function validatePatient(patient: PatientDetails): PatientFieldErrors {
  const result = patientSchema.safeParse(patient);
  if (result.success) return {};
  const errors: PatientFieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof PatientFieldErrors;
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}