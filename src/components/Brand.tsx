import { cn } from "@/lib/utils";

/** Marca de REBT Pro: un rayo dentro de un módulo DIN estilizado. */
export function BrandMark({
  className,
  tone = "copper",
}: {
  className?: string;
  tone?: "copper" | "ink" | "light";
}) {
  const bg =
    tone === "copper"
      ? "bg-accent text-accent-foreground"
      : tone === "ink"
        ? "bg-primary text-primary-foreground"
        : "bg-white/10 text-white";

  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-[10px]",
        bg,
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-[19px]" fill="none">
        <path
          d="M13.6 3 6.9 13.2h4.3L9.9 21l7.2-10.6h-4.4L13.6 3Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function Brand({
  subtitle = "Documentación REBT",
  tone = "light",
  href,
}: {
  subtitle?: string;
  tone?: "light" | "dark";
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-2.5">
      <BrandMark tone={tone === "dark" ? "copper" : "copper"} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-[15px] font-semibold tracking-tight",
            tone === "dark" ? "text-foreground" : "text-white",
          )}
        >
          REBT <span className="font-normal opacity-70">Pro</span>
        </span>
        <span
          className={cn(
            "mt-1 text-[10px] font-medium uppercase tracking-[0.14em]",
            tone === "dark" ? "text-muted-foreground" : "text-white/45",
          )}
        >
          {subtitle}
        </span>
      </span>
    </span>
  );

  if (href) {
    return (
      <a href={href} className="inline-flex">
        {content}
      </a>
    );
  }
  return content;
}
