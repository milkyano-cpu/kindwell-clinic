import type { ServiceType } from "./types";

export interface QuestionnaireCheckbox {
  id: string;
  label: string;
  redFlag?: boolean; 
}

export interface QuestionnaireSection {
  tag: string;
  title: string;
  description?: string;
  tone: "danger" | "warning" | "info";
  checkboxes?: QuestionnaireCheckbox[];
  textField?: { id: string; label: string; placeholder: string };
  signatureField?: { id: string; label: string; placeholder: string };
  safetyAlert?: string;
  infoNote?: string;
  requireAll?: boolean; // semua checkbox di section ini wajib dicentang
}

export const questionnaireConfig: Record<ServiceType, QuestionnaireSection[]> = {
  "alternative-medicine": [
    {
      tag: "1st priority · High-risk contraindications",
      title: "Primary diagnosis & high-risk contraindications",
      description: "Have you ever had any of the following? Some may make this treatment unsuitable.",
      tone: "danger",
      checkboxes: [
        { id: "psychosis", label: "Psychosis", redFlag: true },
        { id: "bipolar", label: "Bipolar disorder", redFlag: true },
        { id: "mood-disorder", label: "Mood disorder", redFlag: true },
        { id: "cardio-respiratory", label: "Cardio-respiratory disease", redFlag: true },
        { id: "drug-dependence", label: "Drug dependence", redFlag: true },
        { id: "pregnancy-breastfeeding", label: "Pregnancy / breastfeeding", redFlag: true },
      ],
      textField: { id: "primary-diagnosis", label: "Primary diagnosis you're seeking treatment for", placeholder: "e.g. chronic pain" },
      safetyAlert: "We'll review this carefully. A flagged condition doesn't automatically rule you out, but your practitioner will discuss the risks with you before any treatment.",
    },
    {
      tag: "2nd priority · Legal consents (11 required)",
      title: "Patient declarations & legal consents",
      description: "All 11 acknowledgements are mandatory to proceed.",
      tone: "warning",
      requireAll: true,
      checkboxes: [
        { id: "consent-1", label: "I understand medicinal cannabis is an unregistered therapeutic good under the TGA Special Access / Authorised Prescriber scheme." },
        { id: "consent-2", label: "I understand I must NOT drive or operate machinery while taking any THC-containing product." },
        { id: "consent-3", label: "I understand THC can result in a positive roadside drug test regardless of impairment." },
        { id: "consent-4", label: "I consent to my treatment being reported to relevant regulatory bodies as required by law." },
        { id: "consent-5", label: "I understand possible side effects and agree to report any adverse reactions." },
        { id: "consent-6", label: "I confirm I am not currently pregnant or breastfeeding (or have discussed the risks)." },
        { id: "consent-7", label: "I understand this medication is for my personal use only and must not be shared." },
        { id: "consent-8", label: "I agree not to combine this treatment with alcohol or other sedatives without advice." },
        { id: "consent-9", label: "I understand my suitability is reassessed at each consultation and may be withdrawn." },
        { id: "consent-10", label: "I consent to my GP / referrer being informed of my treatment where provided." },
        { id: "consent-11", label: "I confirm the information I have provided is true and complete to the best of my knowledge." },
      ],
    },
    {
      tag: "3rd priority · Signature",
      title: "Electronic acknowledgement & legal signature",
      tone: "info",
      signatureField: { id: "signature", label: "Type your full name to sign", placeholder: "Full legal name" },
    },
  ],

  "smoking-cessation": [
    {
      tag: "1st priority · Urgent symptoms",
      title: "Red flag & urgent symptoms screen",
      description: "Tick anything you're experiencing now. Some answers may need urgent attention.",
      tone: "danger",
      checkboxes: [
        { id: "chest-pain", label: "Chest pain", redFlag: true },
        { id: "shortness-of-breath", label: "Shortness of breath", redFlag: true },
        { id: "coughing-blood", label: "Coughing up blood", redFlag: true },
        { id: "palpitations", label: "Severe palpitations", redFlag: true },
        { id: "fainting", label: "Fainting", redFlag: true },
        { id: "seizures", label: "Seizures", redFlag: true },
        { id: "severe-depression", label: "Severe depression", redFlag: true },
        { id: "suicidal-thoughts", label: "Suicidal thoughts", redFlag: true },
        { id: "pregnancy", label: "Pregnancy", redFlag: true },
      ],
      safetyAlert: "Please seek help now. If this is an emergency call 000. For urgent mental health support call Lifeline 13 11 14. Your practitioner will also be alerted.",
    },
    {
      tag: "2nd priority · Medical & mental health",
      title: "Critical medical & mental health history",
      description: "Have you ever been diagnosed with any of the following?",
      tone: "warning",
      checkboxes: [
        { id: "asthma", label: "Asthma" },
        { id: "copd", label: "COPD" },
        { id: "hypertension", label: "Hypertension" },
        { id: "heart-attack", label: "Heart attack" },
        { id: "stroke", label: "Stroke" },
        { id: "epilepsy", label: "Epilepsy" },
        { id: "anxiety", label: "Anxiety" },
        { id: "psychosis", label: "Psychosis" },
        { id: "self-harm-history", label: "History of self-harm" },
      ],
    },
    {
      tag: "3rd priority · Consent",
      title: "Consent, privacy & electronic acknowledgement",
      tone: "info",
      requireAll: true,
      checkboxes: [
        { id: "consent-privacy", label: "History of selI consent to the collection and handling of my health information as described in the privacy policy.f-harm" },
        { id: "consent-record", label: "I acknowledge this electronic questionnaire forms part of my clinical record." },
      ],
      infoNote: "Remaining sections (lifestyle, medications, supports) continue after these. Fields shown here reflect the priority-highlight order in the brief.",
    },
  ],
};