import { NumberField, SectionHeader, SelectField } from "./ui";
import { TIPOS_TERRENO } from "@/lib/rebt/data";
import { num } from "@/lib/format";
import type { Proyecto, ResultadoProyecto } from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, CircuitBoard, Check, Info, Ruler } from "lucide-react";

export function TierraPanel({
  proyecto,
  update,
  resultado,
  highlightCampo,
}: {
  proyecto: Proyecto;
  update: (patch: Partial<Proyecto>) => void;
  resultado: ResultadoProyecto;
  highlightCampo?: string;
}) {
  const t = proyecto.tierra;
  const upd = (patch: Partial<Proyecto["tierra"]>) =>
    update({ tierra: { ...t, ...patch } });

  const res = resultado.tierra;
  const cumple = res.cumple;

  return (
    <div>
      <SectionHeader
        eyebrow="ITC-BT-18"
        title="Puesta a tierra"
        description="La coordinación entre la resistencia de tierra y la sensibilidad del diferencial es la que garantiza la protección contra contactos indirectos en esquema TT. La estimación analítica no sustituye la medición en obra."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-card p-5">
          <h3 className="text-[13.5px] font-semibold">Datos del terreno y del electrodo</h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Introduzca la resistividad del terreno y la geometría del electrodo.
            Si dispone de la resistencia medida, prevalece sobre la estimación.
          </p>

          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <SelectField
              label="Esquema de conexión a tierra"
              value={t.esquema}
              onChange={(v) =>
                upd({ esquema: v as Proyecto["tierra"]["esquema"] })
              }
              options={[
                { value: "TT", label: "TT · neutro a tierra separado" },
                { value: "TN", label: "TN" },
                { value: "IT", label: "IT" },
              ]}
              field="esquema"
              highlight={highlightCampo === "esquema"}
            />
            <SelectField
              label="Tipo de terreno"
              value={t.tipoTerreno}
              onChange={(v) => {
                const fila = TIPOS_TERRENO.find((x) => x.nombre === v);
                upd({ tipoTerreno: v, resistividad: fila?.resistividad ?? t.resistividad });
              }}
              options={TIPOS_TERRENO.map((x) => ({
                value: x.nombre,
                label: `${x.nombre} · ${x.resistividad} Ω·m`,
              }))}
            />
            <NumberField
              label="Resistividad del terreno"
              value={t.resistividad}
              onChange={(v) => upd({ resistividad: v })}
              unit="Ω·m"
              min={1}
              max={10000}
              step={10}
              hint="Valor medido con telurómetro o el de la tabla orientativa."
            />
            <NumberField
              label="Número de electrodos verticales"
              value={t.numElectrodos}
              onChange={(v) => upd({ numElectrodos: v })}
              min={1}
              max={50}
              hint="Con más de un electrodo la estimación analítica no se aplica."
            />
            <NumberField
              label="Longitud de la pica"
              value={t.longitudPica}
              onChange={(v) => upd({ longitudPica: v })}
              unit="m"
              min={0.5}
              max={20}
              step={0.5}
            />
            <NumberField
              label="Separación entre electrodos"
              value={t.separacion}
              onChange={(v) => upd({ separacion: v })}
              unit="m"
              min={0}
              max={30}
              step={0.5}
            />
            <NumberField
              label="Sección del conductor de tierra"
              value={t.seccionTierra}
              onChange={(v) => upd({ seccionTierra: v })}
              unit="mm²"
              min={1.5}
              max={120}
              step={0.5}
            />
            <div className="space-y-1.5" data-campo="resistenciaMedida">
              <label className="text-[12px] font-medium text-foreground/80">
                Resistencia medida (Ω)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={t.resistenciaMedida ?? ""}
                placeholder="Sin medir"
                onChange={(e) => {
                  const v = e.target.value;
                  upd({ resistenciaMedida: v === "" ? null : Number(v) });
                }}
                className={cn(
                  "h-9 w-full rounded-lg border border-border bg-card px-3 text-[12px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  highlightCampo === "resistenciaMedida" && "field-highlight",
                )}
              />
              <p className="text-[11px] leading-4 text-muted-foreground">
                Dato de la verificación en obra. Déjelo vacío si aún no se ha
                medido.
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-5 py-3.5">
              <span className="text-[12px] font-medium">Resultado de la comprobación</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wide",
                  cumple === true
                    ? "bg-primary/10 text-primary"
                    : cumple === false
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {cumple === true ? (
                  <>
                    <Check className="size-3" /> Conforme
                  </>
                ) : cumple === false ? (
                  <>
                    <AlertTriangle className="size-3" /> No conforme
                  </>
                ) : (
                  "Sin verificar"
                )}
              </span>
            </div>

            <div className="px-5 py-4">
              <dl className="space-y-2.5 text-[11.5px]">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Límite 50 / IΔn</dt>
                  <dd className="font-medium tabular-nums">
                    {num(res.limite)} Ω
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Resistencia estimada</dt>
                  <dd className="font-medium tabular-nums">
                    {res.resistenciaEstimada !== null
                      ? `${num(res.resistenciaEstimada, 1)} Ω`
                      : "—"}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Resistencia medida</dt>
                  <dd className="font-medium tabular-nums">
                    {res.resistenciaVerificada !== null
                      ? `${num(res.resistenciaVerificada, 1)} Ω`
                      : "Pendiente"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 rounded-lg border border-border/80 bg-muted/35 p-3">
                <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  <Ruler className="size-3.5" />
                  Método de estimación
                </p>
                <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                  {res.metodo}
                </p>
                <p className="mt-2 rounded bg-card px-2 py-1.5 text-[10.5px] tabular-nums text-foreground/70">
                  R = ρ / (2πL) · [ln(4L/d) − 1] · d = 14 mm
                </p>
              </div>

              {res.resistenciaVerificada === null && (
                <p className="mt-3 flex items-start gap-2 text-[10.5px] leading-4 text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  La conformidad definitiva exige medición con telurómetro e
                  informe de la verificación.
                </p>
              )}
            </div>
          </section>

          <section className="surface-card p-5">
            <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
              <CircuitBoard className="size-4 text-primary" />
              Esquema y coordinación
            </h3>
            <div className="mt-3 space-y-3 text-[11.5px] leading-5 text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Esquema {t.esquema}.</span>{" "}
                {t.esquema === "TT"
                  ? "El neutro de la red y las masas de la instalación están puestos a tierra en puntos distintos. La protección contra contactos indirectos se confía al diferencial."
                  : "Verifique con la distribuidora las condiciones del esquema y las prescripciones adicionales de protección."}
              </p>
              <div className="rounded-lg bg-primary/[0.045] p-3">
                <p className="font-medium text-foreground">Condición de protección</p>
                <p className="mt-1 tabular-nums">
                  R<sub>tierra</sub> ≤ 50 / IΔn = 50 /{" "}
                  {num(resultado.tierra.limite > 0 ? 50 / resultado.tierra.limite * 1000 : 0)} mA ={" "}
                  {num(resultado.tierra.limite)} Ω
                </p>
              </div>
              <p>
                La sección del conductor de tierra ({t.seccionTierra} mm²) debe
                guardar relación con los conductores de protección de la
                instalación; compruebe la tabla 2 de la ITC-BT-19 para cada
                circuito.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
