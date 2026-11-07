import { SectionHeader, SeverityBadge } from "./ui";
import { Button } from "@/components/ui/button";
import type { Hallazgo, SeccionId, Severidad } from "@/lib/rebt/findings";
import { SEVERIDAD_INFO, resumenHallazgos } from "@/lib/rebt/findings";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Filter,
  Lightbulb,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

const FILTROS: { id: "todos" | Severidad; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "critico", label: "Críticos" },
  { id: "incumplimiento", label: "Incumplimientos" },
  { id: "advertencia", label: "Advertencias" },
  { id: "pendiente", label: "Pendientes" },
  { id: "recomendacion", label: "Recomendaciones" },
];

export function ValidacionPanel({
  hallazgos,
  onIr,
}: {
  hallazgos: Hallazgo[];
  onIr: (seccion: SeccionId, opts?: { circuitoId?: string; campo?: string }) => void;
}) {
  const [filtro, setFiltro] = useState<"todos" | Severidad>("todos");
  const resumen = resumenHallazgos(hallazgos);

  const visibles = useMemo(
    () =>
      hallazgos
        .filter((h) => filtro === "todos" || h.severidad === filtro)
        .sort(
          (a, b) =>
            SEVERIDAD_INFO[a.severidad].orden - SEVERIDAD_INFO[b.severidad].orden,
        ),
    [hallazgos, filtro],
  );

  return (
    <div>
      <SectionHeader
        eyebrow="Control de calidad"
        title="Detector de errores y cumplimiento"
        description="Cada hallazgo está vinculado al dato que lo provoca. «IR AL ERROR» abre el módulo, desplaza la vista al campo, lo resalta y permite corregirlo; el proyecto se recalcula al instante."
      />

      <div
        className={cn(
          "mb-4 flex flex-col gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
          resumen.puedeValidar
            ? "border-primary/25 bg-primary/[0.05]"
            : "border-destructive/25 bg-destructive/[0.04]",
        )}
      >
        <div className="flex items-start gap-2.5">
          {resumen.puedeValidar ? (
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          ) : (
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          )}
          <div>
            <p className="text-[12.5px] font-semibold">
              {resumen.puedeValidar
                ? "Comprobaciones superadas"
                : "La instalación no puede declararse conforme"}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-5 text-muted-foreground">
              {resumen.puedeValidar
                ? "No existen errores críticos, incumplimientos ni datos pendientes."
                : `${resumen.criticos} errores críticos · ${resumen.incumplimientos} incumplimientos · ${resumen.pendientes} datos pendientes.`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-4 text-[11px]">
          <span className="text-muted-foreground">
            Total <span className="font-semibold text-foreground">{resumen.total}</span>
          </span>
          <span className="text-muted-foreground">
            Recomendaciones{" "}
            <span className="font-semibold text-foreground">{resumen.recomendaciones}</span>
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
          <Filter className="size-3" />
          Filtrar
        </span>
        {FILTROS.map((f) => {
          const count =
            f.id === "todos"
              ? hallazgos.length
              : hallazgos.filter((h) => h.severidad === f.id).length;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                filtro === f.id
                  ? "border-primary/35 bg-primary/10 font-medium text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              {f.label}
              <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <div className="surface-card flex flex-col items-center px-6 py-14 text-center">
          <CheckCircle2 className="size-8 text-primary" />
          <p className="mt-3 text-[14px] font-semibold">
            Sin incidencias en este filtro
          </p>
          <p className="mt-1 max-w-sm text-[12px] text-muted-foreground">
            Cambia el filtro o revisa los datos del proyecto para seguir
            comprobando la instalación.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visibles.map((h) => (
            <li key={h.id} className="surface-card overflow-hidden">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severidad={h.severidad} />
                    <h3 className="text-[12.5px] font-semibold">{h.titulo}</h3>
                  </div>

                  <p className="mt-1.5 text-[11.5px] leading-5 text-muted-foreground">
                    {h.detalle}
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        <BookOpen className="size-3" />
                        Normativa aplicable
                      </p>
                      <p className="mt-1 text-[10.5px] leading-4">{h.normativa}</p>
                    </div>
                    <div className="rounded-lg bg-primary/[0.045] px-3 py-2">
                      <p className="flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        <Lightbulb className="size-3" />
                        Solución propuesta
                      </p>
                      <p className="mt-1 text-[10.5px] leading-4">{h.solucion}</p>
                    </div>
                  </div>

                  {(h.valorActual || h.valorPropuesto) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10.5px]">
                      {h.valorActual && (
                        <span className="rounded-md border border-destructive/25 bg-destructive/[0.05] px-2 py-1 text-destructive">
                          Actual: {h.valorActual}
                        </span>
                      )}
                      {h.valorPropuesto && (
                        <span className="rounded-md border border-primary/25 bg-primary/[0.06] px-2 py-1 text-primary">
                          Propuesto: {h.valorPropuesto}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5 self-start"
                  onClick={() =>
                    onIr(h.seccion, {
                      circuitoId: h.circuitoId,
                      campo: h.campo,
                    })
                  }
                >
                  <Wrench className="size-3.5" />
                  IR AL ERROR
                  <ArrowRight className="size-3" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-[10.5px] leading-5 text-muted-foreground">
          <span className="font-medium text-foreground">Criterio de validación:</span>{" "}
          una instalación sólo se considera documentable como conforme cuando no
          existen errores críticos, incumplimientos reglamentarios ni datos
          obligatorios pendientes. Las recomendaciones no bloquean la emisión,
          pero quedan reflejadas en la memoria.
        </p>
      </div>
    </div>
  );
}
