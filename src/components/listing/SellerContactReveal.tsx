import {
  phoneHref,
  telegramHref,
  whatsappHref,
  type ContactChannels,
} from "@/domain/contacts";

interface SellerContactRevealProps {
  seller: ContactChannels;
  reachLabel: string;
  phoneLabel: string;
  telegramLabel: string;
  whatsappLabel: string;
}

/** Deep-link buttons shown after buyer taps Contact seller. */
export function SellerContactReveal({
  seller,
  reachLabel,
  phoneLabel,
  telegramLabel,
  whatsappLabel,
}: SellerContactRevealProps) {
  const links: { href: string; label: string; value: string }[] = [];
  const phone = phoneHref(seller.phone);
  if (phone) {
    links.push({ href: phone, label: phoneLabel, value: seller.phone });
  }
  const tg = telegramHref(seller.telegram);
  if (tg) {
    links.push({
      href: tg,
      label: telegramLabel,
      value: `@${seller.telegram.replace(/^@/, "")}`,
    });
  }
  const wa = whatsappHref(seller.whatsapp);
  if (wa) {
    links.push({ href: wa, label: whatsappLabel, value: seller.whatsapp });
  }

  if (links.length === 0) {
    return (
      <div className="flex-1 rounded-2xl bg-stem-tint px-4 py-3 text-center text-[13px] text-ink-soft">
        {reachLabel}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-2 rounded-2xl bg-stem-tint px-3 py-3">
      <p className="text-center text-[13px] text-ink-soft">{reachLabel}</p>
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target={link.href.startsWith("tel:") ? undefined : "_blank"}
            rel={link.href.startsWith("tel:") ? undefined : "noopener noreferrer"}
            className="flex items-center justify-between gap-2 rounded-xl bg-card px-3.5 py-2.5 text-[14px] font-semibold text-ink shadow-[0_1px_2px_rgb(34_48_42/0.06)] hover:border-stem/30"
          >
            <span className="text-ink-soft">{link.label}</span>
            <span className="truncate text-stem">{link.value}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
