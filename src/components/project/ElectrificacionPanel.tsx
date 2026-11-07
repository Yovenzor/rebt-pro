import { CheckRow, SectionHeader, NumberField, TextField } from "./ui";
import { Button } from "@/components/ui/button";
import { IGA_MINIMO_GRADO, POTENCIA_MINIMA_GRADO, PRESETS_ITC25 } from "@/lib/rebt/data";
import { potenciaAdmisible } from "@/lib/rebt/engine";
import { num, potencia } from "@/lib/format";
import type { Proyecto, ResultadoProyecto } from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, ShieldCheck, Sparkles } from "lucide-react";

const OPCIONES: {
  clave: keyof Proyecto["electrificacion"];
  etiqueta: string;
  descripcion: string;
}[] = [
  { clave: "calefaccion", etiqueta: "Calefacción eléctrica", descripcion: "Emisores, radiadores o suelo radiante eléctrico. Obliga a C8." },
  { clave: "climatizacion", etiqueta: "Aire acondicionado", descripcion: "Previsión de climatización eléctrica. Obliga a C9." },
  { clave: "secadora", etiqueta: "Secadora", descripcion: "Circuito independiente C10." },
  { clave: "lavavajillas", etiqueta: "Lavavajillas", descripcion: "Se integra en C4 o en un circuito adicional." },
  { clave: "cocinaElectrica", etiqueta: "Cocina eléctrica", descripcion: "Placa de cocción, circuito C3." },
  { clave: "horno", etiqueta: "Horno eléctrico", descripcion: "Comparte C3 o requiere un C12." },
  { clave: "termoElectrico", etiqueta: "Termo eléctrico", descripcion: "Se integra en C4." },
  { clave: "aerotermia", etiqueta: "Aerotermia", descripcion: "Circuito propio de potencia según equipo." },
  { clave: "recargaVE", etiqueta: "Recarga de vehículo eléctrico", descripcion: "Circuito específico conforme a ITC-BT-52." },
  { clave: "domotica", etiqueta: "Domótica", descripcion: "Sistemas de control y gestión. Obliga a C11." },
  { clave: "piscina", etiqueta: "Piscina", descripcion: "Bomba y tratamiento con circuito propio." },
  { clave: "automatizacion", etiqueta: "Automatización", descripcion: "Persianas, riego, seguridad. Obliga a C11." },
];

export function ElectrificacionPanel({
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
  const e = proyecto.electrificacion;
  const upd = (patch: Partial<Proyecto["electrificacion"]>) =>
    update({ electrificacion: { ...e, ...patch } });

  const calculado = resultado.gradoCalculado;
  const declarado = e.grado;
  const discrepancia = calculado !== declarado;
  const minimo = POTENCIA_MINIMA_GRADO[calculado];
  const codigos = new Set(proyecto.circuitos.map((c) => c.codigo));

  return (
    <div>
      <SectionHeader
        eyebrow="Asistente ITC-BT-25"
        title="Grado de electrificación"
        description="Selecciona los usos previstos. El asistente determina el grado exigible, la potencia mínima, los circuitos obligatorios y los requisitos que debes cumplir."
      />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <section className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[13.5px] font-semibold">Previsiones de la vivienda</h3>
              <span className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                {OPCIONES.filter((o) => Boolean(e[o.clave])).length} seleccionadas
              </span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {OPCIONES.map((o) => (
                <CheckRow
                  key={o.clave}
                  label={o.etiqueta}
                  description={o.descripcion}
                  checked={Boolean(e[o.clave])}
                  onChange={(v) => upd({ [o.clave]: v } as never)}
                />
              ))}
            </div>

            <div className="mt-4 grid gap-3.5 border-t border-border/70 pt-4 sm:grid-cols-[1fr_160px]">
              <TextField
                label="Otros receptores especiales"
                value={e.otros}
                onChange={(v) => upd({ otros: v })}
                placeholder="Grupo de presión, sauna, climatizador…"
              />
              <NumberField
                label="Potencia prevista"
                value={e.otrosPotencia}
                onChange={(v) => upd({ otrosPotencia: v })}
                unit="W"
                min={0}
                step={100}
              />
            </div>
          </section>

          <section className="surface-card p-5">
            <h3 className="text-[13.5px] font-semibold">Grado declarado en el proyecto</h3>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Puedes fijarlo manualmente. Si no cumple los criterios de la
              ITC-BT-25, el detector lo marcará como incumplimiento.
            </p>
            <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
              {(
                [
                  {
                    valor: "basica",
                    titulo: "Electrificación básica",
                    detalle: "5.750 W · IGA 25 A · circuitos C1 a C5",
                  },
                  {
                    valor: "elevada",
                    titulo: "Electrificación elevada",
                    detalle: "9.200 W · IGA 40 A · C1 a C7 y receptores",
                  },
                ] as const
              ).map((g) => (
                <button
                  key={g.valor}
                  type="button"
                  data-campo="grado"
                  onClick={() => upd({ grado: g.valor })}
                  className={cn(
                    "rounded-xl border px-4 py-3.5 text-left transition-all",
                    declarado === g.valor
                      ? "border-primary/40 bg-primary/[0.05] ring-1 ring-primary/20"
                      : "border-border bg-card hover:bg-muted/50",
                    highlightCampo === "grado" && "field-highlight",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-semibold">{g.titulo}</span>
                    {declarado === g.valor && (
                      <Check className="size-4 text-primary" />
                    )}
                  </span>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {g.detalle}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="surface-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/30 px-5 py-3.5">
              <span className="flex items-center gap-2 text-[12px] font-medium">
                <Sparkles className="size-4 text-accent-foreground/70" />
                Grado calculado
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider",
                  calculado === "elevada"
                    ? "bg-accent/20 text-accent-foreground"
                    : "bg-primary/10 text-primary",
                )}
              >
                {calculado === "elevada" ? "Elevada" : "Básica"}
              </span>
            </div>

            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    Potencia mínima
                  </p>
                  <p className="mt-1 text-[18px] font-semibold tabular-nums">
                    {num(minimo)} W
                  </p>
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
                    IGA mínimo
                  </p>
                  <p className="mt-1 text-[18px] font-semibold tabular-nums">
                    {IGA_MINIMO_GRADO[calculado]} A
                  </p>
                </div>
              </div>

              {resultado.motivosGrado.length > 0 ? (
                <ul className="mt-4 space-y-1.5">
                  {resultado.motivosGrado.map((m) => (
                    <li key={m} className="flex gap-2 text-[11.5px] leading-5 text-muted-foreground">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent-foreground/60" />
                      {m}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[11.5px] leading-5 text-muted-foreground">
                  No se ha previsto ningún uso que obligue a electrificación
                  elevada. Se aplica el mínimo reglamentario de 5.750 W.
                </p>
              )}

              {discrepancia && (
                <div className="mt-4 rounded-lg border border-accent/40 bg-accent/[0.08] p-3">
                  <p className="flex items-start gap-2 text-[11px] leading-5 text-accent-foreground">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    El proyecto declara electrificación {declarado}, pero los
                    criterios calculados exigen {calculado}.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 border-accent/40 bg-white/60 text-[11px]"
                    onClick={() =>
                      upd({
                        grado: calculado,
                      })
                    }
                  >
                    Aplicar {calculado}
                  </Button>
                </div>
              )}
            </div>
          </section>

          <section className="surface-card p-5">
            <h3 className="text-[13.5px] font-semibold">Circuitos exigidos</h3>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Mínimos de la ITC-BT-25 para el grado calculado.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {resultado.circuitosObligatorios.map((codigo) => {
                const presente = codigos.has(codigo);
                const preset = PRESETS_ITC25.find((p) => p.codigo === codigo);
                return (
                  <span
                    key={codigo}
                    title={preset?.nombre}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px]",
                      presente
                        ? "border-primary/25 bg-primary/8 text-primary"
                        : "border-destructive/30 bg-destructive/8 text-destructive",
                    )}
                  >
                    {presente ? (
                      <Check className="size-3" />
                    ) : (
                      <AlertTriangle className="size-3" />
                    )}
                    {codigo}
                  </span>
                );
              })}
            </div>
            {resultado.circuitosFaltantes.length > 0 && (
              <p className="mt-3 border-t border-border/70 pt-3 text-[11px] leading-5 text-destructive">
                Falta: {resultado.circuitosFaltantes.join(", ")}.
              </p>
            )}
          </section>

          <section className="surface-card p-5">
            <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
              <ShieldCheck className="size-4 text-primary" />
              Previsión de cargas
            </h3>
            <dl className="mt-3 space-y-2 text-[11.5px]">
              {[
                ["Potencia instalada", potencia(resultado.potenciaInstalada)],
                ["Potencia simultánea estimada", potencia(resultado.potenciaSimultanea)],
                ["Potencia prevista", potencia(resultado.potenciaPrevista)],
                ["Intensidad prevista", `${num(resultado.intensidadTotal, 1)} A`],
                [
                  "Potencia máxima admisible",
                  potencia(
                    potenciaAdmisible(
                      resultado.igaRecomendado,
                      proyecto.suministro.fases,
                      proyecto.suministro.cosPhi,
                    ),
                  ),
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 border-t border-border/70 pt-2.5 text-[10.5px] leading-4 text-muted-foreground">
              La potencia máxima admisible se obtiene del calibre del IGA
              adoptado, no de la suma aritmética de los circuitos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
