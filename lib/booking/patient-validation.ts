import { z } from "zod";
import type { PatientDetails } from "./types";

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
    lastName: z.string().min(1, "Required."),
    dob: z.string().refine(isValidDob, "Enter a valid date. You must be 18 or older."),
    gender: z.string().min(1, "Required."),
    address1: z.string().min(1, "Required."),
    suburb: z.string().min(1, "Required."),
    state: z.string().min(1, "Required."),
    postcode: z.string().regex(/^\d{4}$/, "Enter a valid 4-digit postcode."),
    mobile: z
      .string()
      .transform(normalizePhone)
      .refine((v) => /^(\+614\d{8}|04\d{8})$/.test(v), "Enter a valid AU mobile (+614 or 04xx xxx xxx)."),
    email: z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Enter a valid email."),
    emergencyContactName: z.string().min(1, "Required."),
    emergencyContactPhone: z.string().min(1, "Required."),
    medicareNumber: z
      .string()
      .transform((v) => v.replace(/\s/g, ""))
      .refine((v) => v === "" || /^\d{11}$/.test(v), "Medicare must be 11 digits (10 + IRN)."),
    ihiNumber: z
      .string()
      .transform((v) => v.replace(/\s/g, ""))
      .refine((v) => v === "" || /^\d{16}$/.test(v), "IHI must be 16 digits."),
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