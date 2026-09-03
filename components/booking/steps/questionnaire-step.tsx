"use client";
import { Button } from "@/components/ui/button";
import { questionnaireConfig, type QuestionnaireSection } from "@/lib/booking/questionnaire-config";
import type { StepProps } from "@/lib/booking/types";

const toneStyles = {
  danger: { card: "border-red-300 bg-red-50/60", tag: "bg-red-600 text-white" },
  warning: { card: "border-amber-300 bg-amber-50/60", tag: "bg-amber-500 text-white" },
  info: { card: "border-[#6E78FF] bg-[#6E78FF]/5", tag: "bg-[#6E78FF] text-white" },
};

function SectionCard({ section, answers, onToggle, onTextChange }: {
  section: QuestionnaireSection;
  answers: Record<string, string | boolean>;
  onToggle: (id: string) => void;
  onTextChange: (id: string, value: string) => void;
}) {
  const styles = toneStyles[section.tone];
  const showAlert = section.checkboxes?.some((c) => c.redFlag && answers[c.id] === true);

  return (
    <div className={`rounded-2xl border p-6 space-y-4 ${styles.card}`}>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${styles.tag}`}>
        • {section.tag}
      </span>

      <div>
        <h3 className="font-bold text-lg">{section.title}</h3>
        {section.description && <p className="text-sm text-muted-foreground mt-1">{section.description}</p>}
      </div>

      {section.checkboxes && (
        <div className="divide-y divide-black/20 border-b border-black/20">
          {section.checkboxes.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-start gap-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={answers[c.id] === true}
                onChange={() => onToggle(c.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#6E78FF]"
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      )}

    {section.textField && (
      <div className="space-y-1.5">
        <label className="text-sm font-medium block">{section.textField.label}</label>
        <input
          value={String(answers[section.textField.id] ?? "")}
          onChange={(e) => onTextChange(section.textField!.id, e.target.value)}
          placeholder={section.textField.placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6E78FF]"
        />
      </div>
    )}

    {section.signatureField && (
      <div className="space-y-1.5">
        <label className="text-sm font-medium block">{section.signatureField.label}</label>
        <input
          value={String(answers[section.signatureField.id] ?? "")}
          onChange={(e) => onTextChange(section.signatureField!.id, e.target.value)}
          placeholder={section.signatureField.placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#6E78FF]"
        />
      </div>
    )}

      {section.safetyAlert && showAlert && (
        <div className="rounded-xl bg-red-600 px-4 py-3 text-sm text-white leading-relaxed">
          <span className="font-bold">Please seek help now.</span> {section.safetyAlert.replace("Please seek help now. ", "").replace("We'll review this carefully. ", "")}
        </div>
      )}

      {section.infoNote && (
        <div className="rounded-lg bg-[#6E78FF]/10 px-4 py-3 text-sm text-[#6E78FF]">{section.infoNote}</div>
      )}
    </div>
  );
}

export function QuestionnaireStep({ data, update, next, back }: StepProps) {
  const sections = data.service ? questionnaireConfig[data.service] : [];
  const answers = data.questionnaire ?? {};

  const toggle = (id: string) => update({ questionnaire: { ...answers, [id]: !answers[id] } });
  const setText = (id: string, value: string) => update({ questionnaire: { ...answers, [id]: value } });

  const isComplete = sections.every((section) => {
    const checkboxesOk = !section.requireAll || (section.checkboxes ?? []).every((c) => answers[c.id] === true);
    const signatureOk = !section.signatureField || String(answers[section.signatureField.id] ?? "").trim() !== "";
    return checkboxesOk && signatureOk;
  });

  return (
    <div className="space-y-6 py-15">
      <div className="text-center space-y-1.5">
        <h1 className="text-4xl font-bold text-[#6E78FF] text-balance">Pre-consultation questionnaire.</h1>
        <p className="text-m text-muted-foreground max-w-md mx-auto">
          This helps your practitioner prepare. The most important questions are first.
        </p>
      </div>

      {sections.map((section) => (
        <SectionCard key={section.title} section={section} answers={answers} onToggle={toggle} onTextChange={setText} />
      ))}

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button disabled={!isComplete} onClick={next} className="w-full max-w-xs py-6 text-base bg-[#6E78FF] hover:bg-[#6E78FF]/90">
          Continue
        </Button>
        <button
          onClick={back}
          className="cursor-pointer text-xs font-semibold tracking-wide text-foreground underline underline-offset-4 transition-colors hover:text-[#6E78FF]"
        >
          BACK
        </button>
      </div>
    </div>
  );
}