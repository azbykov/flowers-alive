import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const CONTROL_CLASSES =
  "w-full rounded-xl border border-line bg-card px-4 text-[15px] text-ink placeholder:text-ink-soft/60 outline-none focus:border-stem focus:ring-2 focus:ring-stem/20";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input className={`${CONTROL_CLASSES} h-12 ${className}`} {...rest} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea className={`${CONTROL_CLASSES} min-h-24 py-3 ${className}`} {...rest} />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select className={`${CONTROL_CLASSES} h-12 ${className}`} {...rest} />;
}
