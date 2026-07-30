import { avatarColor } from "@/domain/contacts";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-11 w-11 text-[17px]",
  md: "h-12 w-12 text-lg",
  lg: "h-16 w-16 text-2xl",
  xl: "h-20 w-20 text-[30px]",
};

interface UserAvatarProps {
  name: string;
  src?: string | null;
  size?: Size;
  className?: string;
}

/** Circle avatar: Google/OAuth photo when present, otherwise colored initial. */
export function UserAvatar({
  name,
  src,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || "✿";
  const color = avatarColor(name || "x");

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote OAuth URLs (Google)
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className={`${SIZE_CLASS[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex ${SIZE_CLASS[size]} items-center justify-center rounded-full font-display font-medium text-white ${className}`}
      style={{
        background: `linear-gradient(140deg, ${color}, #c0561f)`,
      }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
