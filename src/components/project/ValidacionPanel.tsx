import { SectionHeader, SeverityBadge } from "./ui";
import { Button } from "@/components/ui/button";
import type { Hallazgo, SeccionId, Severidad } from "@/lib/rebt/findings";
import { resumenHallazgos } from "@/lib/rebt/findings";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  Filter,
  Lightbulb,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useState } from "react";

const FILTROS: { id: "todos" | Severidad; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "critico", label: "Críticos" },
  { id: "incumplimiento", label: "Incumplimientos" },
  { id: "pendiente", label: "Pendientes" },
  { id: "advertencia", label: "Advertencias" },
  { id: "recomendacion", label: "Recomendaciones" },
];

const ORDEN: Record<Severidad, number> = {
  critico: 0,
  incumplimiento: 1,
  pendiente: 2,
  advertencia: 3,
  recomendacion: 4,
};

const SECCION_LABEL: Record<SeccionId, string> = {
  resumen: "Resumen",
  datos: "Datos y suministro",
  electrificacion: "Electrificación",
  circuitos: "Circuitos",
  calculos: "Cálculos eléctricos",
  cuadro: "Cuadro y protecciones",
  tierra: "Puesta a tierra",
  validacion: "Detector de errores",
  memoria: "Memoria técnica",
};

const ESTILO: Record<
  Severidad,
  { borde: string; icono: string; punto: string; Icon: LucideIcon }
> = {
  critico: {
    borde: "border-l-destructive",
    icono: "bg-destructive/10 text-destructive",
    punto: "bg-destructive",
    Icon: AlertOctagon,
  },
  incumplimiento: {
    borde: "border-l-accent",
    icono: "bg-accent/15 text-accent-foreground",
    punto: "bg-accent",
    Icon: ShieldAlert,
  },
  advertencia: {
    borde: "border-l-accent/60",
    icono: "bg-accent/10 text-accent-foreground",
    punto: "bg-accent/70",
    Icon: AlertTriangle,
  },
  pendiente: {
    borde: "border-l-[#8797a8]",
    icono: "bg-muted text-muted-foreground",
    punto: "bg-[#8797a8]",
    Icon: CircleDashed,
  },
  recomendacion: {
    borde: "border-l-primary/60",
    icono: "bg-primary/8 text-primary",
    punto: "bg-primary",
    Icon: Lightbulb,
  },
};

export function ValidacionPanel({
  hallazgos,
  onIr,
}: {
  hallazgos: Hallazgo[];
  onIr: (seccion: SeccionId, opts?: { circuitoId?: string; campo?: string }) => void;
}) {
  const [filtro, setFiltro] = useState<"todos" | Severidad>("todos");
  const resumen = resumenHallazgos(hallazgos);
  const bloqueos =
    resumen.criticos + resumen.incumplimientos + resumen.pendientes;

  const visibles = [...hallazgos]
    .filter((h) => filtro === "todos" || h.severidad === filtro)
    .sort((a, b) => ORDEN[a.severidad] - ORDEN[b.severidad]);

  return (
    <div>
      <SectionHeader
        eyebrow="Control de calidad"
        title="Detector de errores y cumplimiento"
        description="Primero lo que bloquea la emisión. Cada tarjeta muestra la norma, el dato afectado y cómo resolverlo; el botón abre el campo exacto y lo resalta."
      />

      <div
        className={cn(
          "mb-5 overflow-hidden rounded-2xl border",
          resumen.puedeValidar
            ? "border-primary/25 bg-primary/[0.05]"
            : "border-destructive/30 bg-destructive/[0.045]",
        )}
      >
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                resumen.puedeValidar
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {resumen.puedeValidar ? (
                <ShieldCheck className="size-5" />
              ) : (
                <ShieldAlert className="size-5" />
              )}
            </span>
            <div>
              <p className="text-[17px] font-semibold leading-tight">
                {resumen.puedeValidar
                  ? "Todo en orden para documentar"
                  : `${bloqueos} ${bloqueos === 1 ? "asunto bloquea" : "asuntos bloquean"} la emisión`}
              </p>
              <p className="mt-1 max-w-xl text-[13px] leading-5 text-muted-foreground">
                {resumen.puedeValidar
                  ? "No hay errores críticos, incumplimientos ni datos pendientes. Las recomendaciones no bloquean y quedan reflejadas en la memoria."
                  : "Corrige lo marcado y el cálculo se actualiza al instante. El PDF declarará expresamente lo que siga sin resolver."}
              </p>
            </div>
          </div>

          {!resumen.puedeValidar && (
            <div className="grid grid-cols-3 gap-2 sm:shrink-0">
              {[
                {
                  label: "Críticos",
                  value: resumen.criticos,
                  tone: "text-destructive",
                },
                {
                  label: "Incumplim.",
                  value: resumen.incumplimientos,
                  tone: "text-accent-foreground",
                },
                {
                  label: "Pendientes",
                  value: resumen.pendientes,
                  tone: "text-muted-foreground",
                },
              ].map((x) => (
                <div
                  key={x.label}
                  className="min-w-[86px] rounded-lg border border-border/70 bg-card px-3 py-2 text-center"
                >
                  <p
                    className={cn(
                      "text-[20px] font-semibold leading-none tabular-nums",
                      x.value > 0 ? x.tone : "text-muted-foreground/50",
                    )}
                  >
                    {x.value}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {x.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          <Filter className="size-3.5" />
          Filtrar
        </span>
        {FILTROS.map((f) => {
          const count =
            f.id === "todos"
              ? hallazgos.length
              : hallazgos.filter((h) => h.severidad === f.id).length;
          const activo = filtro === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                activo
                  ? "border-primary bg-primary font-medium text-primary-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-muted",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  f.id === "todos" ? "bg-foreground/40" : ESTILO[f.id].punto,
                )}
              />
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10.5px] font-semibold tabular-nums",
                  activo ? "bg-white/20" : "bg-muted",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <div className="surface-card flex flex-col items-center px-6 py-14 text-center">
          <CheckCircle2 className="size-9 text-primary" />
          <p className="mt-3 text-[16px] font-semibold">
            Sin incidencias en este filtro
          </p>
          <p className="mt-1 max-w-sm text-[13px] leading-5 text-muted-foreground">
            Cambia el filtro o revisa los datos de la instalación para seguir
            comprobando.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visibles.map((h) => {
            const estilo = ESTILO[h.severidad];
            const Icono = estilo.Icon;
            const bloqueante =
              h.severidad === "critico" ||
              h.severidad === "incumplimiento" ||
              h.severidad === "pendiente";

            return (
              <li
                key={h.id}
                className={cn(
                  "surface-card overflow-hidden border-l-[3px]",
                  estilo.borde,
                )}
              >
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:p-5">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      estilo.icono,
                    )}
                  >
                    <Icono className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severidad={h.severidad} />
                      <span className="inline-flex items-center gap-1 text-[11.5px] text-muted-foreground">
                        <MapPin className="size-3" />
                        {SECCION_LABEL[h.seccion]}
                      </span>
                    </div>

                    <h3 className="mt-2 text-[16px] font-semibold leading-snug">
                      {h.titulo}
                    </h3>
                    <p className="mt-1.5 text-[13.5px] leading-6 text-muted-foreground">
                      {h.detalle}
                    </p>

                    {(h.valorActual || h.valorPropuesto) && (
                      <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                        {h.valorActual && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/25 bg-destructive/[0.06] px-2.5 py-1 text-destructive">
                            <span className="font-semibold">Actual</span>
                            {h.valorActual}
                          </span>
                        )}
                        {h.valorPropuesto && (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/[0.06] px-2.5 py-1 text-primary">
                            <span className="font-semibold">Propuesto</span>
                            {h.valorPropuesto}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={bloqueante ? "default" : "outline"}
                    className="shrink-0 gap-1.5 self-start"
                    onClick={() =>
                      onIr(h.seccion, {
                        circuitoId: h.circuitoId,
                        campo: h.campo,
                      })
                    }
                    title="Abrir el dato que provoca el error"
                  >
                    <Wrench className="size-4" />
                    Corregir
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>

                <div className="grid gap-3 border-t border-border/70 bg-muted/25 px-4 py-3 sm:grid-cols-2 sm:px-5">
                  <div>
                    <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      <BookOpen className="size-3.5" />
                      Normativa aplicable
                    </p>
                    <p className="mt-1 text-[12.5px] leading-5">{h.normativa}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      <Lightbulb className="size-3.5" />
                      Cómo resolverlo
                    </p>
                    <p className="mt-1 text-[12.5px] leading-5">{h.solucion}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3">
        <p className="text-[11.5px] leading-5 text-muted-foreground">
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
