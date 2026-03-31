import { getLabelClass, getLabelEmoji } from "@/lib/utils";

export function LabelPill({ label }: { label: string }) {
  const cls = getLabelClass(label);
  const emoji = getLabelEmoji(label);
  return (
    <span className={`label-pill ${cls}`}>
      {emoji && <>{emoji} </>}
      {label}
    </span>
  );
}
