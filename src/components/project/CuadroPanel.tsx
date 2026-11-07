import { DataTable, SectionHeader, SelectField } from "./ui";
import { Button } from "@/components/ui/button";
import { IGA_MINIMO_GRADO, TIPOS_DIFERENCIAL } from "@/lib/rebt/data";
import { potenciaAdmisible } from "@/lib/rebt/engine";
import { num, potencia } from "@/lib/format";
import type { Diferencial, Proyecto, ResultadoProyecto } from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Check,
  CircuitBoard,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";

export function CuadroPanel({
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
  const iga = resultado.igaRecomendado;
  const admisible = potenciaAdmisible(
    iga,
    proyecto.suministro.fases,
    proyecto.suministro.cosPhi,
  );

  const updDif = (id: string, patch: Partial<Diferencial>) =>
    update({
      diferenciales: proyecto.diferenciales.map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      ),
    });

  const addDiferencial = () => {
    const nuevo: Diferencial = {
      id: `dif-${Date.now()}`,
      nombre: `Diferencial ${proyecto.diferenciales.length + 1}`,
      sensibilidad: 30,
      tipo: "A",
      polos: 2,
    };
    update({ diferenciales: [...proyecto.diferenciales, nuevo] });
  };

  const delDiferencial = (id: string) => {
    const restantes = proyecto.diferenciales.filter((d) => d.id !== id);
    update({
      diferenciales: restantes,
      circuitos: proyecto.circuitos.map((c) =>
        c.diferencialId === id
          ? { ...c, diferencialId: restantes[0]?.id ?? "" }
          : c,
      ),
    });
  };

  const moverCircuito = (circuitoId: string, diferencialId: string) =>
    update({
      circuitos: proyecto.circuitos.map((c) =>
        c.id === circuitoId ? { ...c, diferencialId } : c,
      ),
    });

  // Vista frontal: cada dispositivo ocupa tantos módulos DIN de 17,5 mm como
  // polos tiene. El ancho se construye desde los dispositivos calculados.
  const modulos: {
    id: string;
    label: string;
    sub: string;
    tipo: "iga" | "dps" | "dif" | "pia";
    ancho: number;
  }[] = [
    {
      id: "iga",
      label: "IGA",
      sub: `${iga} A`,
      tipo: "iga",
      ancho: proyecto.suministro.fases === 3 ? 4 : 2,
    },
    { id: "dps", label: "DPS", sub: "Tipo 2", tipo: "dps", ancho: 4 },
  ];
  for (const d of resultado.diferenciales) {
    modulos.push({
      id: d.diferencial.id,
      label: "Dif.",
      sub: `${d.diferencial.sensibilidad} mA · ${d.diferencial.tipo}`,
      tipo: "dif",
      ancho: d.diferencial.polos,
    });
  }
  for (const r of resultado.circuitos) {
    modulos.push({
      id: `pia-${r.circuito.id}`,
      label: r.circuito.codigo,
      sub: `${r.in} A · ${r.circuito.curva}`,
      tipo: "pia",
      ancho: Math.min(4, Math.max(1, r.circuito.polos)),
    });
  }

  const carriles: (typeof modulos)[] = [];
  let carrilActual: typeof modulos = [];
  let anchoCarril = 0;
  for (const m of modulos) {
    if (anchoCarril + m.ancho > 12 && carrilActual.length > 0) {
      carriles.push(carrilActual);
      carrilActual = [];
      anchoCarril = 0;
    }
    carrilActual.push(m);
    anchoCarril += m.ancho;
  }
  if (carrilActual.length > 0) carriles.push(carrilActual);

  return (
    <div>
      <SectionHeader
        eyebrow="ITC-BT-17 / ITC-BT-25"
        title="Cuadro eléctrico y protecciones"
        description="El IGA se dimensiona a partir de la intensidad prevista y del mínimo del grado. Cada circuito mantiene su propio magnetotérmico y se agrupa bajo un diferencial de alta sensibilidad, con un máximo de cinco circuitos por dispositivo."
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section
          className={cn(
            "surface-card p-5",
            highlightCampo === "iga" && "field-highlight",
          )}
          data-campo="iga"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Interruptor general automático</p>
              <p className="mt-1.5 text-[32px] font-semibold leading-none tabular-nums">
                {iga}
                <span className="ml-1 text-[14px] font-normal text-muted-foreground">A</span>
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
              <Zap className="size-5" />
            </span>
          </div>

          <dl className="mt-4 space-y-2 border-t border-border/70 pt-4 text-[11.5px]">
            {[
              ["Intensidad prevista", `${num(resultado.intensidadTotal, 1)} A`],
              ["Mínimo del grado", `${IGA_MINIMO_GRADO[resultado.gradoCalculado]} A`],
              ["Potencia prevista", potencia(resultado.potenciaPrevista)],
              ["Potencia admisible con IGA", potencia(admisible)],
              ["Poder de corte previsto", `${proyecto.suministro.poderCorte} kA`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-3 rounded-lg bg-muted/50 p-3 text-[10.5px] leading-4 text-muted-foreground">
            Se adopta el menor calibre normalizado que cubre la intensidad
            prevista sin bajar del mínimo del grado de electrificación
            ({proyecto.suministro.fases === 3 ? "trifásico" : "monofásico"}).
          </p>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
                <Shield className="size-4 text-primary" />
                Interruptores diferenciales
              </h3>
              <p className="mt-1 text-[11.5px] text-muted-foreground">
                30 mA obligatorio en vivienda. Un diferencial por cada cinco
                circuitos como mínimo.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={addDiferencial}
              data-campo="nuevo-diferencial"
            >
              <Plus className="size-3.5" />
              Añadir
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {resultado.diferenciales.map((d) => {
              const excede = d.circuitos.length > 5;
              const vacio = d.circuitos.length === 0;
              return (
                <div
                  key={d.diferencial.id}
                  data-campo={`diferencial-${d.diferencial.id}`}
                  className={cn(
                    "rounded-xl border p-3.5",
                    excede
                      ? "border-destructive/35 bg-destructive/[0.04]"
                      : "border-border/80 bg-muted/20",
                    highlightCampo === `diferencial-${d.diferencial.id}` &&
                      "field-highlight",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-md text-[10px] font-semibold",
                          excede
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/8 text-primary",
                        )}
                      >
                        {d.circuitos.length}
                      </span>
                      <input
                        value={d.diferencial.nombre}
                        onChange={(e) =>
                          updDif(d.diferencial.id, { nombre: e.target.value })
                        }
                        className="w-36 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[12.5px] font-semibold outline-none hover:border-border focus:border-border"
                        aria-label="Nombre del diferencial"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10.5px] text-muted-foreground">
                        {d.circuitos.length}/5
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Eliminar diferencial"
                        onClick={() => delDiferencial(d.diferencial.id)}
                      >
                        <Trash2 className="size-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                    <SelectField
                      label="Sensibilidad"
                      value={d.diferencial.sensibilidad}
                      onChange={(v) =>
                        updDif(d.diferencial.id, { sensibilidad: Number(v) })
                      }
                      options={[10, 30, 100, 300].map((s) => ({
                        value: s,
                        label: `${s} mA`,
                      }))}
                      field={`sensibilidad-${d.diferencial.id}`}
                      highlight={highlightCampo === `sensibilidad-${d.diferencial.id}`}
                    />
                    <SelectField
                      label="Tipo"
                      value={d.diferencial.tipo}
                      onChange={(v) =>
                        updDif(d.diferencial.id, {
                          tipo: v as Diferencial["tipo"],
                        })
                      }
                      options={TIPOS_DIFERENCIAL.map((t) => ({
                        value: t.valor,
                        label: t.valor,
                      }))}
                      field={`tipo-${d.diferencial.id}`}
                    />
                    <SelectField
                      label="Polos"
                      value={d.diferencial.polos}
                      onChange={(v) =>
                        updDif(d.diferencial.id, { polos: Number(v) as 2 | 4 })
                      }
                      options={[
                        { value: 2, label: "2 polos" },
                        { value: 4, label: "4 polos" },
                      ]}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {d.circuitos.length === 0 && (
                      <span className="text-[10.5px] text-muted-foreground">
                        Sin circuitos asignados.
                      </span>
                    )}
                    {d.circuitos.map((c) => (
                      <span
                        key={c.circuito.id}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px]"
                      >
                        {c.circuito.codigo} · {c.in} A
                      </span>
                    ))}
                  </div>

                  {excede && (
                    <p className="mt-2.5 flex items-start gap-1.5 text-[10.5px] leading-4 text-destructive">
                      <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                      Más de cinco circuitos en un mismo diferencial. La
                      ITC-BT-25 exige al menos uno por cada cinco.
                    </p>
                  )}
                  {vacio && (
                    <p className="mt-2.5 text-[10.5px] leading-4 text-muted-foreground">
                      Asigna circuitos desde la tabla inferior o elimina el
                      dispositivo.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-4 surface-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
              <CircuitBoard className="size-4 text-primary" />
              Asignación de circuitos a diferenciales
            </h3>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              Selecciona el diferencial que protege cada circuito. Los
              magnetotérmicos siguen siendo individuales.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {resultado.circuitos.map((r) => (
            <div
              key={r.circuito.id}
              className="flex items-center gap-2 rounded-lg border border-border/80 bg-card px-3 py-2"
            >
              <span className="inline-flex min-w-8 justify-center rounded bg-muted px-1 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {r.circuito.codigo}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-medium">
                  {r.circuito.nombre}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {r.in} A · curva {r.circuito.curva}
                </p>
              </div>
              <select
                value={r.circuito.diferencialId}
                onChange={(e) => moverCircuito(r.circuito.id, e.target.value)}
                className="h-7 max-w-[120px] rounded-md border border-border bg-card px-1.5 text-[10.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                aria-label={`Diferencial de ${r.circuito.nombre}`}
              >
                {proyecto.diferenciales.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[13.5px] font-semibold">Tabla de protecciones</h3>
          <span className="text-[10.5px] text-muted-foreground">
            IGA {iga} A · poder de corte {proyecto.suministro.poderCorte} kA
          </span>
        </div>
        <DataTable
          head={
            <tr>
              <th className="px-4 py-2.5 text-left font-medium">Circuito</th>
              <th className="px-3 py-2.5 text-right font-medium">P (W)</th>
              <th className="px-3 py-2.5 text-right font-medium">Ib</th>
              <th className="px-3 py-2.5 text-center font-medium">PIA</th>
              <th className="px-3 py-2.5 text-center font-medium">Curva / polos</th>
              <th className="px-3 py-2.5 text-right font-medium">Iz corr.</th>
              <th className="px-3 py-2.5 text-left font-medium">Diferencial</th>
              <th className="px-4 py-2.5 text-center font-medium">Coord.</th>
            </tr>
          }
        >
          {resultado.circuitos.map((r) => {
            const dif = proyecto.diferenciales.find(
              (d) => d.id === r.circuito.diferencialId,
            );
            const ok = r.comprobaciones.intensidad && r.comprobaciones.proteccion;
            return (
              <tr key={r.circuito.id} className="hover:bg-muted/30">
                <td className="px-4 py-2.5">
                  <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {r.circuito.codigo}
                  </span>
                  <span className="text-[11.5px]">{r.circuito.nombre}</span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {num(r.circuito.potencia)}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">
                  {num(r.ib, 1)} A
                </td>
                <td className="px-3 py-2.5 text-center font-medium tabular-nums">
                  {r.in} A
                </td>
                <td className="px-3 py-2.5 text-center text-[11px]">
                  {r.circuito.curva} · {r.circuito.polos}P
                </td>
                <td
                  className={cn(
                    "px-3 py-2.5 text-right tabular-nums",
                    !r.comprobaciones.intensidad && "font-semibold text-destructive",
                  )}
                >
                  {num(r.izCorregida, 1)} A
                </td>
                <td className="px-3 py-2.5 text-[11px]">
                  {dif ? `${dif.nombre} · ${dif.sensibilidad} mA` : "—"}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {ok ? (
                    <Check className="mx-auto size-4 text-primary" />
                  ) : (
                    <AlertTriangle className="mx-auto size-4 text-destructive" />
                  )}
                </td>
              </tr>
            );
          })}
        </DataTable>
      </section>

      <section className="mt-4 surface-card p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 text-[13.5px] font-semibold">
            <ShieldCheck className="size-4 text-primary" />
            Vista frontal del cuadro
          </h3>
          <p className="text-[10.5px] text-muted-foreground">
            Distribución orientativa por módulos DIN de 17,5 mm · carriles de 12
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {carriles.map((carril, i) => {
            const ocupados = carril.reduce((s, m) => s + m.ancho, 0);
            return (
              <div
                key={i}
                className="overflow-x-auto rounded-lg bg-sidebar p-2.5"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
              >
                <div className="mb-1.5 flex min-w-[540px] items-center justify-between px-0.5">
                  <span className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                    Carril {i + 1}
                  </span>
                  <span className="text-[9px] tabular-nums text-white/25">
                    {ocupados}/12 módulos
                  </span>
                </div>
                <div className="grid min-w-[540px] grid-cols-12 gap-1">
                  {carril.map((m) => (
                    <div
                      key={m.id}
                      style={{ gridColumn: `span ${Math.min(12, m.ancho)}` }}
                      className={cn(
                        "flex h-[52px] flex-col items-center justify-center rounded-[3px] border-b-2 px-1 text-center",
                        m.tipo === "iga" &&
                          "border-accent bg-[#f4f0e8] text-[#3a2c15]",
                        m.tipo === "dps" &&
                          "border-[#b4453a] bg-[#f7ece9] text-[#4a201b]",
                        m.tipo === "dif" &&
                          "border-[#3d6f73] bg-[#eaf0f0] text-[#1e3b3d]",
                        m.tipo === "pia" &&
                          "border-[#5f6b77] bg-[#f2f4f5] text-[#2a333b]",
                      )}
                      title={`${m.label} · ${m.sub}`}
                    >
                      <span className="text-[9px] font-semibold leading-none">
                        {m.label}
                      </span>
                      <span className="mt-1 text-[7.5px] leading-tight opacity-70">
                        {m.sub}
                      </span>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 12 - ocupados) }).map(
                    (_, k) => (
                      <div
                        key={`hueco-${k}`}
                        className="h-[52px] rounded-[3px] border border-dashed border-white/[0.07]"
                      />
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[10.5px] leading-4 text-muted-foreground">
          Representación generada a partir de los dispositivos calculados (IGA,
          DPS, diferenciales y magnetotérmicos). No incluye el cableado interno;
          el esquema unifilar completo se desarrolla en la memoria técnica.
        </p>
      </section>
    </div>
  );
}
