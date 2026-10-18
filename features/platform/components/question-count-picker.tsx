import {
  QUESTION_COUNT_OPTIONS,
  type QuestionCount,
} from "@/features/platform/question-count";
import { useAppLanguage } from "@/features/platform/i18n/language-provider";

export function QuestionCountPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: QuestionCount;
  onChange: (value: QuestionCount) => void;
  disabled?: boolean;
}) {
  const { pick } = useAppLanguage();
  const optionDetails: Record<
    QuestionCount,
    { label: string; duration: string }
  > = {
    5: {
      label: pick("Cepat", "Quick"),
      duration: pick("5–10 menit", "5–10 minutes"),
    },
    10: {
      label: pick("Santai", "Standard"),
      duration: pick("10–20 menit", "10–20 minutes"),
    },
    15: {
      label: pick("Panjang", "Extended"),
      duration: pick("20–30 menit", "20–30 minutes"),
    },
  };

  return (
    <fieldset
      disabled={disabled}
      className="mt-6"
    >
      <legend className="text-sm text-zinc-300">
        {pick("Jumlah pertanyaan", "Number of questions")}
      </legend>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {QUESTION_COUNT_OPTIONS.map((count) => {
          const selected = value === count;
          const details = optionDetails[count];

          return (
            <button
              key={count}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(count)}
              className={`rounded-2xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                selected
                  ? "border-pink-400 bg-pink-400/15"
                  : "border-white/10 bg-white/5 hover:border-white/25"
              }`}
            >
              <strong className="block text-lg">
                {count}
              </strong>

              <span className="mt-1 block text-xs text-zinc-400">
                {details.label}
              </span>

              <span className="mt-1 hidden text-[11px] text-zinc-500 sm:block">
                {details.duration}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
