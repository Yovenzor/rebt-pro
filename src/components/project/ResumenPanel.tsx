import { SeverityBadge, Stat } from "./ui";
import { Button } from "@/components/ui/button";
import { num, potencia } from "@/lib/format";
import type { Hallazgo, SeccionId, Severidad } from "@/lib/rebt/findings";
import { resumenHallazgos } from "@/lib/rebt/findings";
import type { Proyecto, ResultadoProyecto } from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircuitBoard,
  FileText,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ResumenPanel({
  proyecto,
  resultado,
  hallazgos,
  onIr,
  onMemoria,
}: {
  proyecto: Proyecto;
  resultado: ResultadoProyecto;
  hallazgos: Hallazgo[];
  onIr: (seccion: SeccionId, opts?: { circuitoId?: string; campo?: string }) => void;
  onMemoria: () => void;
}) {
  const resumen = resumenHallazgos(hallazgos);
  const datos = resultado.circuitos.map((r) => ({
    nombre: r.circuito.codigo,
    potencia: r.circuito.potencia,
    estado: r.estado,
  }));

  const colorBarra = (estado: string) =>
    estado === "error"
      ? "var(--destructive)"
      : estado === "aviso"
        ? "var(--accent)"
        : "var(--chart-1)";

  const punto: Record<Severidad, string> = {
    critico: "bg-destructive",
    incumplimiento: "bg-accent",
    advertencia: "bg-accent/70",
    pendiente: "bg-[#8797a8]",
    recomendacion: "bg-primary",
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Tu instalación</p>
          <h2 className="mt-1.5 text-[26px] font-semibold tracking-tight">
            {proyecto.nombre || "Instalación sin nombre"}
          </h2>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {proyecto.municipio || "Municipio pendiente"} ·{" "}
            {proyecto.superficie} m² · electrificación{" "}
            {resultado.gradoCalculado === "elevada" ? "elevada" : "básica"}
          </p>
        </div>
        <Button className="gap-2" onClick={onMemoria}>
          <FileText className="size-4" />
          Generar el PDF
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Potencia prevista"
          value={potencia(resultado.potenciaPrevista)}
          hint={`Instalada ${potencia(resultado.potenciaInstalada)}`}
          tone="primary"
        />
        <Stat
          label="IGA adoptado"
          value={String(resultado.igaRecomendado)}
          unit="A"
          hint={`Mínimo del grado ${resultado.igaMinimoGrado} A`}
        />
        <Stat
          label="Circuitos"
          value={String(resultado.circuitos.length)}
          hint={`${resultado.diferenciales.length} diferenciales · ${resultado.circuitos.length} PIAs`}
        />
        <Stat
          label="Caída de tensión máxima"
          value={num(resultado.caidaMaximaPct, 2)}
          unit="%"
          hint={`Límite ${proyecto.ajustes.caidaMaximaPct} %`}
          tone={
            resultado.caidaMaximaPct > proyecto.ajustes.caidaMaximaPct
              ? "danger"
              : "default"
          }
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-[14.5px] font-semibold">Potencia por circuito</h3>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Potencia prevista de cada circuito, en vatios.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <span className="size-2 rounded-full bg-primary" /> conforme
              <span className="ml-2 size-2 rounded-full bg-[oklch(0.75_0.13_80)]" />{" "}
              revisar
            </span>
          </div>

          <div className="mt-4 h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                <XAxis
                  dataKey="nombre"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickFormatter={(v: number) => `${v / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", fillOpacity: 0.55 }}
                  contentStyle={{
                    background: "var(--card)",
                    color: "var(--card-foreground)",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    fontSize: 11,
                    boxShadow: "0 12px 30px -18px rgba(0,0,0,0.45)",
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                  itemStyle={{ color: "var(--card-foreground)" }}
                  formatter={(v: number) => [`${num(v)} W`, "Potencia"]}
                />
                <Bar dataKey="potencia" radius={[4, 4, 0, 0]} maxBarSize={38}>
                  {datos.map((d, i) => (
                    <Cell key={`${d.nombre}-${i}`} fill={colorBarra(d.estado)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface-card flex flex-col p-5">
          <div className="flex items-center gap-2">
            {resumen.puedeValidar ? (
              <ShieldCheck className="size-4 text-primary" />
            ) : (
              <ShieldAlert className="size-4 text-destructive" />
            )}
            <h3 className="text-[14.5px] font-semibold">Estado de la instalación</h3>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {[
              {
                k: "Críticos",
                v: resumen.criticos,
                tone: "text-destructive",
                box: "border-destructive/30 bg-destructive/[0.06]",
                ir: "validacion" as SeccionId,
              },
              {
                k: "Incumplimientos",
                v: resumen.incumplimientos,
                tone: "text-accent-foreground dark:text-accent",
                box: "border-accent/40 bg-accent/[0.09]",
                ir: "validacion" as SeccionId,
              },
              {
                k: "Advertencias",
                v: resumen.advertencias,
                tone: "text-muted-foreground",
                box: "border-border/80 bg-muted/25",
                ir: "validacion" as SeccionId,
              },
              {
                k: "Pendientes",
                v: resumen.pendientes,
                tone: "text-muted-foreground",
                box: "border-border/80 bg-muted/25",
                ir: "validacion" as SeccionId,
              },
            ].map((x) => (
              <button
                key={x.k}
                type="button"
                onClick={() => onIr(x.ir)}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                  x.v > 0 ? x.box : "border-border/80 bg-muted/25",
                )}
              >
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {x.k}
                </p>
                <p className={cn("mt-1 text-[20px] font-semibold tabular-nums", x.tone)}>
                  {x.v}
                </p>
              </button>
            ))}
          </div>

          <div
            className={cn(
              "mt-4 rounded-lg border px-3 py-2.5 text-[12px] leading-5",
              resumen.puedeValidar
                ? "border-primary/25 bg-primary/8 text-primary"
                : "border-destructive/25 bg-destructive/[0.05] text-destructive",
            )}
          >
            {resumen.puedeValidar ? (
              <span className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                Todo listo para documentar. No hay errores críticos ni datos
                pendientes en las comprobaciones realizadas.
              </span>
            ) : (
              <span className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {resumen.criticos + resumen.incumplimientos > 0
                  ? "Hay incumplimientos sin resolver. El PDF se generará indicando expresamente lo que no cumple."
                  : "Faltan datos para poder declarar la conformidad de la instalación."}
              </span>
            )}
          </div>

          <dl className="mt-4 space-y-2 border-t border-border/70 pt-3 text-[12px]">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Resistencia de tierra</dt>
              <dd className="font-medium tabular-nums">
                {resultado.tierra.resistenciaVerificada !== null ||
                resultado.tierra.resistenciaEstimada !== null
                  ? `${num(
                      resultado.tierra.resistenciaVerificada ??
                        resultado.tierra.resistenciaEstimada,
                      1,
                    )} Ω`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Consumo estimado anual</dt>
              <dd className="font-medium tabular-nums">
                {num(resultado.consumoEstimadoKwhAnio)} kWh
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Pérdidas anuales</dt>
              <dd className="font-medium tabular-nums">
                {num(resultado.costePerdidasAnio, 2)} €
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-4 surface-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="flex items-center gap-2 text-[14.5px] font-semibold">
              <CircuitBoard className="size-4 text-primary" />
              Lo que pide atención
            </h3>
            {resumen.criticos +
              resumen.incumplimientos +
              resumen.pendientes >
              0 && (
              <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold text-destructive">
                {resumen.criticos +
                  resumen.incumplimientos +
                  resumen.pendientes}{" "}
                bloqueos
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onIr("validacion")}
            className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline"
          >
            Ver todo
            <ArrowRight className="size-3" />
          </button>
        </div>

        {hallazgos.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 rounded-lg bg-primary/8 px-3 py-3 text-[12.5px] text-primary">
            <CheckCircle2 className="size-4" />
            Nada pendiente: los cálculos y las comprobaciones cuadran.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border/70">
            {hallazgos.slice(0, 5).map((x) => (
              <li
                key={x.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-start gap-2.5">
                  <span
                    className={cn(
                      "mt-2 size-2 shrink-0 rounded-full",
                      punto[x.severidad],
                    )}
                  />
                  <div className="min-w-0">
                    <SeverityBadge severidad={x.severidad} />
                    <p className="mt-1 text-[12.5px] font-medium leading-5">
                      {x.titulo}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 self-start"
                  onClick={() =>
                    onIr(x.seccion, {
                      circuitoId: x.circuitoId,
                      campo: x.campo,
                    })
                  }
                >
                  Corregir
                  <ArrowRight className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
