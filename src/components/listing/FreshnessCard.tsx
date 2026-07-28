import type { FreshnessReport } from "@/domain/types";
import { remainingDaysLabel } from "@/domain/freshness";
import { freshColor } from "./freshness";

/**
 * The signature AI component (design/Product design system guidelines).
 * Freshness is always presented as an estimate with confidence — never as
 * certainty (product rule).
 */
export function FreshnessCard({ report }: { report: FreshnessReport }) {
  const color = freshColor(report.score);
  return (
    <section className="overflow-hidden rounded-[20px] border border-line bg-card">
      <div className="flex items-center gap-1.5 border-b border-hairline px-[18px] pb-3.5 pt-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--stem)" strokeWidth="1.5">
          <path d="M8 2l1.6 3.4L13 6l-2.4 2.6L11 12 8 10.4 5 12l.4-3.4L3 6l3.4-.6L8 2z" strokeLinejoin="round" />
        </svg>
        <span className="text-[12px] font-bold uppercase tracking-[0.5px] text-muted">
          AI freshness estimate
        </span>
      </div>

      <div className="flex gap-5 p-[18px]">
        <div className="shrink-0 text-center">
          <div className="font-data text-[40px] font-bold leading-none" style={{ color }}>
            {report.score}%
          </div>
          <div className="mt-0.5 text-[11px] text-muted">fresh</div>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-2.5">
          <div className="h-2 overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full"
              style={{ width: `${report.score}%`, background: color }}
            />
          </div>
          <div className="flex justify-between text-[13.5px]">
            <span className="text-muted">Lasts about</span>
            <span className="font-bold text-ink">{remainingDaysLabel(report)}</span>
          </div>
          <div className="flex justify-between text-[13.5px]">
            <span className="text-muted">Confidence</span>
            <span className="font-data font-bold text-ink">{report.confidence}%</span>
          </div>
        </div>
      </div>

      {report.signals.length > 0 && (
        <div className="px-[18px] pb-[18px]">
          <div className="rounded-xl bg-surface-tint px-4 py-3.5">
            <div className="mb-2 text-[11.5px] font-bold text-muted">
              Why this estimate
            </div>
            {report.signals.map((signal) => (
              <div key={signal} className="mb-1.5 flex items-start gap-2">
                <span className="mt-px text-[13px] text-fresh-high" aria-hidden>
                  ✓
                </span>
                <span className="text-[13.5px] leading-snug text-ink-2">{signal}</span>
              </div>
            ))}
            <div className="mt-2 text-[11.5px] leading-snug text-faint">
              Estimate, not a guarantee. Always check flowers in person at pickup.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
