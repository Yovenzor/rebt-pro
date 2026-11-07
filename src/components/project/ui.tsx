import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Severidad } from "@/lib/rebt/findings";
import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="text-[22px] font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 max-w-2xl text-[13px] leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
  highlight,
  campo,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  highlight?: boolean;
  campo?: string;
}) {
  return (
    <div
      className={cn("space-y-1.5", className, highlight && "field-highlight p-1")}
      data-campo={campo}
    >
      <Label htmlFor={htmlFor} className="text-[12px] font-medium text-foreground/80">
        {label}
      </Label>
      {children}
      {hint && <p className="text-[11px] leading-4 text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  field,
  highlight,
  type = "text",
  className,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  field?: string;
  highlight?: boolean;
  type?: "text" | "date" | "email" | "tel";
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Field
      label={label}
      htmlFor={field}
      hint={hint}
      className={className}
      campo={field}
      highlight={highlight}
    >
      <Input
        id={field}
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 bg-card"
      />
    </Field>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  unit,
  hint,
  field,
  highlight,
  min = 0,
  max,
  step = 1,
  className,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  hint?: string;
  field?: string;
  highlight?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Field
      label={label}
      htmlFor={field}
      hint={hint}
      className={className}
      campo={field}
      highlight={highlight}
    >
      <div className="relative">
        <Input
          id={field}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? String(value) : ""}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const n = e.target.value === "" ? 0 : Number(e.target.value);
            onChange(Number.isNaN(n) ? 0 : n);
          }}
          className={cn("h-9 bg-card tabular-nums", unit && "pr-11")}
        />
        {unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </Field>
  );
}

export function SelectField<T extends string | number>({
  label,
  value,
  onChange,
  options,
  hint,
  field,
  highlight,
  className,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  hint?: string;
  field?: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <Field
      label={label}
      htmlFor={field}
      hint={hint}
      className={className}
      campo={field}
      highlight={highlight}
    >
      <Select
        value={String(value)}
        onValueChange={(v) => {
          const found = options.find((o) => String(o.value) === v);
          if (found) onChange(found.value);
        }}
      >
        <SelectTrigger id={field} className="h-9 w-full bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={String(o.value)} value={String(o.value)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

export function CheckRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 transition-colors",
        checked
          ? "border-primary/35 bg-primary/[0.045]"
          : "border-border bg-card hover:border-border hover:bg-muted/50",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
      />
      <span className="min-w-0">
        <span className="block text-[12.5px] font-medium leading-4">{label}</span>
        {description && (
          <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}

const severidadEstilo: Record<Severidad, string> = {
  critico: "border-destructive/25 bg-destructive/10 text-destructive",
  incumplimiento: "border-accent/40 bg-accent/15 text-accent-foreground",
  advertencia: "border-[oklch(0.72_0.13_85)]/35 bg-[oklch(0.9_0.09_90)]/45 text-[oklch(0.42_0.09_75)]",
  recomendacion: "border-primary/25 bg-primary/8 text-primary",
  pendiente: "border-border bg-muted text-muted-foreground",
};

export function SeverityBadge({ severidad }: { severidad: Severidad }) {
  const etiqueta: Record<Severidad, string> = {
    critico: "Crítico",
    incumplimiento: "Incumplimiento",
    advertencia: "Advertencia",
    recomendacion: "Recomendación",
    pendiente: "Pendiente",
  };
  return (
    <Badge
      variant="outline"
      className={cn("border px-2 py-0.5 text-[10px] font-medium", severidadEstilo[severidad])}
    >
      {etiqueta[severidad]}
    </Badge>
  );
}

export function Stat({
  label,
  value,
  unit,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: "default" | "primary" | "warning" | "danger";
}) {
  return (
    <div className="surface-card p-4">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-[24px] font-semibold leading-none tracking-tight tabular-nums",
          tone === "primary" && "text-primary",
          tone === "warning" && "text-accent-foreground",
          tone === "danger" && "text-destructive",
        )}
      >
        {value}
        {unit && (
          <span className="ml-1 text-[12px] font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
      {hint && <p className="mt-2 text-[11px] leading-4 text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function DataTable({
  head,
  children,
  className,
}: {
  head: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("surface-card overflow-x-auto", className)}>
      <table className="w-full min-w-[680px] text-[12px]">
        <thead className="border-b border-border/80 bg-muted/40 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {head}
        </thead>
        <tbody className="divide-y divide-border/60">{children}</tbody>
      </table>
    </div>
  );
}
