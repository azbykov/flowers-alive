import type { ReactNode } from "react";

interface EmptyStateProps {
  emoji?: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ emoji = "🌷", message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <p className="max-w-60 text-[15px] text-ink-soft">{message}</p>
      {action}
    </div>
  );
}
