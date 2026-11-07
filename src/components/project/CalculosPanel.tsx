import { DataTable, NumberField, SectionHeader, Stat } from "./ui";
import { conductividad } from "@/lib/rebt/data";
import { num, potencia } from "@/lib/format";
import type { Proyecto, ResultadoProyecto } from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import {
  Activity,
  Calculator,
  Check,
  Gauge,
  Info,
  TrendingUp,
  X,
} from "lucide-react";
import { Fragment } from "react";

export function CalculosPanel({
  proyecto,
  update,
  resultado,
}: {
  proyecto: Proyecto;
  update: (patch: Partial<Proyecto>) => void;
  resultado: ResultadoProyecto;
}) {
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
          <h3 className="text-[13.5px] font-semibold">
            Tabla de cálculo por circuito
          </h3>
          <p className="text-[10.5px] text-muted-foreground">
            Despliega cada fila para ver la sustitución de valores.
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
              <th className="px-4 py-2.5 text-center font-medium">Cumple</th>
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

            return (
              <Fragment key={r.circuito.id}>
                <tr className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {c.codigo}
                    </span>
                    <span className="text-[11.5px]">{c.nombre}</span>
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
                    {ok ? (
                      <Check className="mx-auto size-4 text-primary" />
                    ) : (
                      <X className="mx-auto size-4 text-destructive" />
                    )}
                  </td>
                </tr>
                <tr className="bg-muted/20">
                  <td colSpan={10} className="px-4 py-2">
                    <details className="group">
                      <summary className="cursor-pointer list-none text-[10.5px] font-medium text-primary marker:hidden">
                        <span className="inline-flex items-center gap-1.5">
                          <Calculator className="size-3" />
                          Ver desarrollo del cálculo
                        </span>
                      </summary>
                      <div className="mt-2 grid gap-x-8 gap-y-1 rounded-lg border border-border/70 bg-card px-3 py-2.5 font-mono text-[10.5px] leading-5 text-muted-foreground">
                        <span>
                          I<sub>b</sub> = P / ({trifasico ? "√3 · " : ""}U · cos φ · η) ={" "}
                          {num(c.potencia)} / (
                          {trifasico ? "1,732 · " : ""}
                          {trifasico ? 400 : 230} · {num(c.cosPhi, 2)} ·{" "}
                          {num(c.rendimiento, 2)}) ={" "}
                          <span className="text-foreground">{num(r.ib, 2)} A</span>
                        </span>
                        <span>
                          I<sub>n</sub> adoptado = {r.in} A
                          {r.inMinimoNormativo > 0
                            ? ` (mínimo ITC-BT-25: ${r.inMinimoNormativo} A)`
                            : ""}
                        </span>
                        <span>
                          I<sub>z</sub> = {num(r.izTabla, 1)} · {num(r.factorTemperatura, 3)} ·{" "}
                          {num(r.factorAgrupamiento, 2)} ={" "}
                          <span className="text-foreground">{num(r.izCorregida, 1)} A</span>{" "}
                          ≥ I<sub>n</sub> = {r.in} A
                        </span>
                        <span>
                          S por intensidad = {r.seccionPorIntensidad} mm² · S por
                          caída = {r.seccionPorCaida} mm² · S adoptada ={" "}
                          <span className="text-foreground">{r.seccion} mm²</span>
                        </span>
                        <span>
                          ΔU = {fase} · L · I<sub>n</sub> · cos φ / (γ · S) = {fase} ·{" "}
                          {c.longitud} · {r.in} · {num(c.cosPhi, 2)} / ({gamma} ·{" "}
                          {r.seccion}) ={" "}
                          <span className="text-foreground">
                            {num(r.caidaV, 2)} V → {num(r.caidaPct, 2)} %
                          </span>{" "}
                          ≤ {r.limitePct} %
                        </span>
                        <span>
                          P<sub>pérdidas</sub> = {conductores} · I<sub>b</sub>² · R ={" "}
                          {conductores} · {num(r.ib, 2)}² · {num(r.resistencia, 4)} ={" "}
                          <span className="text-foreground">{num(r.perdidasW, 1)} W</span>
                        </span>
                        <span>
                          PE = {r.pe} mm² (ITC-BT-19 tabla 2) · tubo recomendado ={" "}
                          {r.tubo} mm
                        </span>
                      </div>
                    </details>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </DataTable>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
            <TrendingUp className="size-4 text-primary" />
            Pérdidas y consumo estimado
          </h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
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

          <dl className="mt-4 space-y-2 border-t border-border/70 pt-4 text-[11.5px]">
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
          <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
            <Gauge className="size-4 text-primary" />
            {resultado.fases ? "Equilibrado de fases" : "Criterios e hipótesis"}
          </h3>

          {resultado.fases ? (
            <>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
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
                      <div className="flex items-baseline justify-between text-[11px]">
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
                  "mt-4 rounded-lg border px-3 py-2.5 text-[11px]",
                  (resultado.desequilibrioPct ?? 0) > 15
                    ? "border-accent/40 bg-accent/10 text-accent-foreground"
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
            <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground">
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
              <p key={t} className="flex gap-2 text-[10.5px] leading-4 text-muted-foreground">
                <Info className="mt-0.5 size-3 shrink-0" />
                {t}
              </p>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
        <Activity className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-[11px] leading-5 text-muted-foreground">
          <span className="font-medium text-foreground">Sobre el cortocircuito:</span>{" "}
          el poder de corte se declara como dato de proyecto ({proyecto.suministro.poderCorte} kA).
          La comprobación de I²t y del tiempo de desconexión requiere la impedancia
          de bucle, que debe aportar la distribuidora o medirse en obra.
        </p>
      </div>
    </div>
  );
}
