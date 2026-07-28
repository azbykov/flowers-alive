"use client";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export function Chip({ label, selected = false, onClick }: ChipProps) {
  const interactive = Boolean(onClick);
  const base =
    "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[13px] font-medium transition-colors";
  const tone = selected
    ? "bg-stem-tint text-stem-deep border border-stem/30"
    : "bg-card text-ink-2 border border-line";
  if (!interactive) {
    return <span className={`${base} ${tone}`}>{label}</span>;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${tone} ${selected ? "" : "hover:border-stem/40"}`}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}
