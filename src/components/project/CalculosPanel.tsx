import { DataTable, NumberField, SectionHeader, Stat } from "./ui";
import { Button } from "@/components/ui/button";
import { conductividad } from "@/lib/rebt/data";
import { num, potencia } from "@/lib/format";
import type { Proyecto, ResultadoProyecto } from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import {
  Activity,
  Calculator,
  Check,
  ChevronDown,
  Gauge,
  Info,
  TrendingUp,
  X,
} from "lucide-react";
import { Fragment, useState } from "react";

export function CalculosPanel({
  proyecto,
  update,
  resultado,
}: {
  proyecto: Proyecto;
  update: (patch: Partial<Proyecto>) => void;
  resultado: ResultadoProyecto;
}) {
  const [abiertos, setAbiertos] = useState<string[]>([]);

  const toggle = (id: string) =>
    setAbiertos((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const updAjustes = (patch: Partial<Proyecto["ajustes"]>) =>
    update({ ajustes: { ...proyecto.ajustes, ...patch } });

  return (
    <div>
      <SectionHeader
        eyebrow="Motor de cálculo"
        title="Cálculos eléctricos"
        description="Intensidad de diseño, sección por intensidad admisible y por caída de tensión, pérdidas por efecto Joule y coordinación con la protección. Todas las expresiones se muestran con los valores del proyecto."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Potencia prevista"
          value={potencia(resultado.potenciaPrevista)}
          hint={`Mínimo del grado: ${potencia(resultado.potenciaMinimaGrado)}`}
          tone="primary"
        />
        <Stat
          label="Intensidad prevista"
          value={num(resultado.intensidadTotal, 1)}
          unit="A"
          hint={`IGA recomendado ${resultado.igaRecomendado} A`}
        />
        <Stat
          label="Caída máxima"
          value={num(resultado.caidaMaximaPct, 2)}
          unit="%"
          hint={`Límite adoptado ${proyecto.ajustes.caidaMaximaPct} %`}
          tone={resultado.caidaMaximaPct > proyecto.ajustes.caidaMaximaPct ? "danger" : "default"}
        />
        <Stat
          label="Pérdidas Joule"
          value={num(resultado.perdidasTotalesW, 1)}
          unit="W"
          hint={`${num(resultado.perdidasPct, 2)} % de la potencia instalada`}
        />
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[14.5px] font-semibold">
            Tabla de cálculo por circuito
          </h3>
          <p className="text-[12px] text-muted-foreground">
            Abre el desarrollo de cada circuito para ver la sustitución de
            valores.
          </p>
        </div>

        <DataTable
          head={
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Circuito</th>
              <th className="px-3 py-2.5 text-right font-medium">P (W)</th>
              <th className="px-3 py-2.5 text-right font-medium">Ib (A)</th>
              <th className="px-3 py-2.5 text-right font-medium">In (A)</th>
              <th className="px-3 py-2.5 text-right font-medium">Iz corr. (A)</th>
              <th className="px-3 py-2.5 text-right font-medium">S (mm²)</th>
              <th className="px-3 py-2.5 text-right font-medium">ΔU (V)</th>
              <th className="px-3 py-2.5 text-right font-medium">ΔU (%)</th>
              <th className="px-3 py-2.5 text-right font-medium">Pérd. (W)</th>
              <th className="px-4 py-2.5 text-center font-medium">Desarrollo</th>
            </tr>
          }
        >
          {resultado.circuitos.map((r) => {
            const c = r.circuito;
            const gamma = conductividad(c.aislamiento);
            const fase = c.fases === 3 ? "√3" : "2";
            const conductores = c.fases === 3 ? 3 : 2;
            const trifasico = c.fases === 3;
            const ok =
              r.comprobaciones.intensidad &&
              r.comprobaciones.caida &&
              r.comprobaciones.proteccion &&
              r.comprobaciones.seccionMinima;

            const clave = r.circuito.id;
            const abierto = abiertos.includes(clave);

            return (
              <Fragment key={r.circuito.id}>
                <tr
                  className={cn(
                    "hover:bg-muted/30",
                    !ok && "bg-destructive/[0.035]",
                  )}
                >
                  <td className="px-4 py-2.5">
                    <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {c.codigo}
                    </span>
                    <span className="text-[12.5px]">{c.nombre}</span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {num(c.potencia)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {num(r.ib, 2)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{r.in}</td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right tabular-nums",
                      !r.comprobaciones.intensidad && "font-semibold text-destructive",
                    )}
                  >
                    {num(r.izCorregida, 1)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                    {r.seccion}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {num(r.caidaV, 2)}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2.5 text-right tabular-nums",
                      !r.comprobaciones.caida && "font-semibold text-destructive",
                    )}
                  >
                    {num(r.caidaPct, 2)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {num(r.perdidasW, 1)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-8 gap-1.5 whitespace-nowrap px-2.5",
                        !ok &&
                          "border-destructive/35 text-destructive hover:bg-destructive/5 hover:text-destructive",
                      )}
                      onClick={() => toggle(clave)}
                      aria-expanded={abierto}
                      aria-label={`Ver desarrollo del cálculo de ${c.codigo}`}
                      title="Ver desarrollo del cálculo"
                    >
                      {ok ? (
                        <Check className="size-4 text-primary" />
                      ) : (
                        <X className="size-4" />
                      )}
                      <span className="hidden lg:inline">Ver cálculo</span>
                      <ChevronDown
                        className={cn(
                          "size-3.5 text-muted-foreground transition-transform",
                          abierto && "rotate-180",
                        )}
                      />
                    </Button>
                  </td>
                </tr>
                {abierto && (
                  <tr>
                    <td colSpan={10} className="p-0">
                      <DesarrolloCalculo
                        c={c}
                        r={r}
                        gamma={gamma}
                        fase={fase}
                        conductores={conductores}
                        trifasico={trifasico}
                        ok={ok}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </DataTable>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h3 className="flex items-center gap-2 text-[14.5px] font-semibold">
            <TrendingUp className="size-4 text-primary" />
            Pérdidas y consumo estimado
          </h3>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Estimación con las horas equivalentes y el precio indicados. No es
            una factura: es una referencia de diseño.
          </p>

          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <NumberField
              label="Horas equivalentes a plena carga"
              value={proyecto.ajustes.horasEquivalenteDia}
              onChange={(v) => updAjustes({ horasEquivalenteDia: v })}
              unit="h/día"
              min={0}
              max={24}
              step={0.5}
            />
            <NumberField
              label="Precio de la energía"
              value={proyecto.ajustes.precioKwh}
              onChange={(v) => updAjustes({ precioKwh: v })}
              unit="€/kWh"
              min={0}
              max={2}
              step={0.01}
            />
          </div>

          <dl className="mt-4 space-y-2 border-t border-border/70 pt-4 text-[12.5px]">
            {[
              ["Pérdidas instantáneas", `${num(resultado.perdidasTotalesW, 1)} W`],
              ["Energía perdida al año", `${num(resultado.energiaPerdidaKwhAnio)} kWh`],
              ["Coste anual de las pérdidas", `${num(resultado.costePerdidasAnio, 2)} €`],
              ["Consumo anual estimado", `${num(resultado.consumoEstimadoKwhAnio)} kWh`],
              ["Coste anual estimado", `${num(resultado.costeConsumoAnio, 2)} €`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="surface-card p-5">
          <h3 className="flex items-center gap-2 text-[14.5px] font-semibold">
            <Gauge className="size-4 text-primary" />
            {resultado.fases ? "Equilibrado de fases" : "Criterios e hipótesis"}
          </h3>

          {resultado.fases ? (
            <>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Reparto automático de los circuitos entre fases y desequilibrio
                resultante.
              </p>
              <div className="mt-4 space-y-3">
                {(["L1", "L2", "L3"] as const).map((f) => {
                  const valor = resultado.fases![f];
                  const max = Math.max(
                    resultado.fases!.L1,
                    resultado.fases!.L2,
                    resultado.fases!.L3,
                    1,
                  );
                  return (
                    <div key={f}>
                      <div className="flex items-baseline justify-between text-[12px]">
                        <span className="font-medium">{f}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {num(valor, 1)} A
                        </span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${(valor / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className={cn(
                  "mt-4 rounded-lg border px-3 py-2.5 text-[12px]",
                  (resultado.desequilibrioPct ?? 0) > 15
                    ? "border-accent/40 bg-accent/10 text-accent-foreground dark:text-accent"
                    : "border-primary/25 bg-primary/8 text-primary",
                )}
              >
                Desequilibrio entre fases:{" "}
                <span className="font-semibold tabular-nums">
                  {num(resultado.desequilibrioPct, 1)} %
                </span>
              </div>
            </>
          ) : (
            <p className="mt-1 text-[12.5px] leading-5 text-muted-foreground">
              Instalación monofásica: no se requiere reparto entre fases. El
              neutro se dimensiona igual que la fase según la ITC-BT-19.
            </p>
          )}

          <div className="mt-4 space-y-2 border-t border-border/70 pt-4">
            {[
              "Conductores de cobre. γ = 48 m/(Ω·mm²) para PVC a 70 °C y 44 para XLPE a 90 °C (Guía REBT, Anexo 2).",
              "Tabla de intensidades referida a 40 °C; corrección por temperatura según √((θmáx − θ)/(θmáx − 40)).",
              "Factor de agrupamiento según el número de circuitos en la misma canalización.",
              "Caída de tensión calculada con la intensidad nominal del magnetotérmico, criterio de la ITC-BT-25.",
              "Reactancia despreciada para secciones ≤ 120 mm², conforme a la Guía Técnica.",
              "No se calcula la intensidad de cortocircuito: requiere la impedancia de red o la Icc declarada por la distribuidora.",
            ].map((t) => (
              <p key={t} className="flex gap-2 text-[11.5px] leading-4 text-muted-foreground">
                <Info className="mt-0.5 size-3 shrink-0" />
                {t}
              </p>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
        <Activity className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-[12px] leading-5 text-muted-foreground">
          <span className="font-medium text-foreground">Sobre el cortocircuito:</span>{" "}
          el poder de corte se declara como dato de proyecto ({proyecto.suministro.poderCorte} kA).
          La comprobación de I²t y del tiempo de desconexión requiere la impedancia
          de bucle, que debe aportar la distribuidora o medirse en obra.
        </p>
      </div>
    </div>
  );
}

type CircuitoProyecto = Proyecto["circuitos"][number];
type CircuitoResultado = ResultadoProyecto["circuitos"][number];

function Paso({
  n,
  titulo,
  formula,
  sustitucion,
  resultado,
  ok,
  tono,
}: {
  n: number;
  titulo: string;
  formula: string;
  sustitucion: string;
  resultado: string;
  ok?: boolean;
  tono: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-t-[3px] border-border/80 bg-card p-3.5",
        tono,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
          {n}
        </span>
        {ok !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
              ok
                ? "bg-primary/8 text-primary"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {ok ? <Check className="size-3" /> : <X className="size-3" />}
            {ok ? "Cumple" : "Revisar"}
          </span>
        )}
      </div>
      <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {titulo}
      </p>
      <p className="mt-1.5 font-mono text-[12px] leading-5 text-foreground/80">
        {formula}
      </p>
      <p className="mt-0.5 font-mono text-[11.5px] leading-5 text-muted-foreground">
        {sustitucion}
      </p>
      <p className="mt-2.5 border-t border-border/70 pt-2 text-[16px] font-semibold tabular-nums">
        {resultado}
      </p>
    </div>
  );
}

function DesarrolloCalculo({
  c,
  r,
  gamma,
  fase,
  conductores,
  trifasico,
  ok,
}: {
  c: CircuitoProyecto;
  r: CircuitoResultado;
  gamma: number;
  fase: string;
  conductores: number;
  trifasico: boolean;
  ok: boolean;
}) {
  return (
    <div className="border-t border-border/60 bg-muted/25 px-3 py-4 sm:px-4">
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border/70 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
              <Calculator className="size-4" />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Desarrollo del cálculo
              </p>
              <p className="mt-1 text-[16px] font-semibold leading-tight">
                {c.codigo} · {c.nombre}
              </p>
              <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground">
                P = {num(c.potencia)} W · L = {c.longitud} m · cos φ ={" "}
                {num(c.cosPhi, 2)} · γ = {gamma} m/(Ω·mm²)
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-3 py-1 text-[11.5px] font-medium",
              ok
                ? "bg-primary/8 text-primary"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {ok ? <Check className="size-4" /> : <X className="size-4" />}
            {ok ? "Cálculo correcto" : "Revisar el cálculo"}
          </span>
        </div>

        <div className="grid gap-2.5 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-4">
          <Paso
            n={1}
            titulo="Intensidad de diseño"
            formula={`Ib = P / (${trifasico ? "√3 · " : ""}U · cos φ · η)`}
            sustitucion={`= ${num(c.potencia)} / (${trifasico ? "1,732 · " : ""}${trifasico ? 400 : 230} · ${num(c.cosPhi, 2)} · ${num(c.rendimiento, 2)})`}
            resultado={`${num(r.ib, 2)} A`}
            tono="border-t-primary"
          />
          <Paso
            n={2}
            titulo="Sección del conductor"
            formula="S = máx(S intensidad, S caída, S mínima)"
            sustitucion={`Int. ${r.seccionPorIntensidad} · Caída ${r.seccionPorCaida} · Mín. ${r.seccionMinimaNormativa} mm²`}
            resultado={`${r.seccion} mm²`}
            ok={r.comprobaciones.intensidad && r.comprobaciones.seccionMinima}
            tono="border-t-accent"
          />
          <Paso
            n={3}
            titulo="Caída de tensión"
            formula={`ΔU = ${fase} · L · In · cos φ / (γ · S)`}
            sustitucion={`= ${fase} · ${c.longitud} · ${r.in} · ${num(c.cosPhi, 2)} / (${gamma} · ${r.seccion})`}
            resultado={`${num(r.caidaV, 2)} V · ${num(r.caidaPct, 2)} %`}
            ok={r.comprobaciones.caida}
            tono="border-t-[#6f9a74]"
          />
          <Paso
            n={4}
            titulo="Pérdidas por efecto Joule"
            formula={`Pp = ${conductores} · Ib² · R`}
            sustitucion={`= ${conductores} · ${num(r.ib, 2)}² · ${num(r.resistencia, 4)}`}
            resultado={`${num(r.perdidasW, 1)} W`}
            tono="border-t-[#7d95b3]"
          />
        </div>

        <div className="grid gap-2.5 border-t border-border/70 bg-muted/25 p-3 sm:p-4 md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-card p-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Protección
            </p>
            <p
              className={cn(
                "mt-1.5 font-mono text-[12px] leading-5",
                !r.comprobaciones.proteccion &&
                  "font-semibold text-destructive",
              )}
            >
              In = {r.in} A ≥ Ib = {num(r.ib, 2)} A
            </p>
            <p className="mt-1 text-[11.5px] leading-4 text-muted-foreground">
              {r.comprobaciones.proteccion
                ? `PIA curva ${c.curva} · ${c.polos}P${
                    r.inMinimoNormativo > 0
                      ? ` · mínimo ITC-BT-25 ${r.inMinimoNormativo} A`
                      : ""
                  }`
                : "El calibre del PIA no cubre la intensidad de diseño."}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card p-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Canalización
            </p>
            <p
              className={cn(
                "mt-1.5 font-mono text-[12px] leading-5",
                !r.comprobaciones.intensidad &&
                  "font-semibold text-destructive",
              )}
            >
              Iz = {num(r.izTabla, 1)} · {num(r.factorTemperatura, 3)} ·{" "}
              {num(r.factorAgrupamiento, 2)}
            </p>
            <p
              className={cn(
                "mt-1 text-[11.5px] leading-4",
                r.comprobaciones.intensidad
                  ? "text-muted-foreground"
                  : "font-medium text-destructive",
              )}
            >
              {r.comprobaciones.intensidad
                ? `= ${num(r.izCorregida, 1)} A ≥ In ${r.in} A · sección ${r.seccion} mm²`
                : `= ${num(r.izCorregida, 1)} A < In ${r.in} A: aumenta la sección.`}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card p-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Conductores
            </p>
            <p className="mt-1.5 font-mono text-[12px] leading-5">
              F+N {r.seccion} mm² · PE {r.pe} mm²
            </p>
            <p className="mt-1 text-[11.5px] leading-4 text-muted-foreground">
              Tubo recomendado {r.tubo} mm · caída límite {r.limitePct} %
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
