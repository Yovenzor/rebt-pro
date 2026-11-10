import { DataTable, SectionHeader, SelectField } from "./ui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { IGA_MINIMO_GRADO, TIPOS_DIFERENCIAL } from "@/lib/rebt/data";
import { potenciaAdmisible } from "@/lib/rebt/engine";
import { num, potencia } from "@/lib/format";
import type { Diferencial, Proyecto, ResultadoProyecto } from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Check,
  CircuitBoard,
  Info,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
  Zap,
} from "lucide-react";

type ModuloCuadro = {
  id: string;
  codigo: string;
  nombre: string;
  rating: string;
  detalle: string;
  tipo: "iga" | "dps" | "dif" | "pia";
  ancho: number;
  estado?: "ok" | "error";
};

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
  const conSobretensiones = proyecto.protecciones.sobretensiones;
  const polosDps = proyecto.suministro.fases === 3 ? 4 : 2;
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
  // polos tiene. Se ordena por grupos reales: IGA, DPS, y cada diferencial
  // seguido de los magnetotérmicos que protege.
  const modulos: ModuloCuadro[] = [
    {
      id: "iga",
      codigo: "IGA",
      nombre: "Interruptor general automático",
      rating: `${iga} A`,
      detalle: proyecto.suministro.fases === 3 ? "General · 4P" : "General · 2P",
      tipo: "iga",
      ancho: proyecto.suministro.fases === 3 ? 4 : 2,
    },
  ];

  if (conSobretensiones) {
    modulos.push({
      id: "dps",
      codigo: "DPS",
      nombre: "Protección contra sobretensiones",
      rating: "Tipo 2",
      detalle: `${polosDps}P · Previsto`,
      tipo: "dps",
      ancho: polosDps,
    });
  }

  const codigoDif = new Map(
    resultado.diferenciales.map((d, i) => [d.diferencial.id, `D${i + 1}`]),
  );

  const piaModulo = (
    r: ResultadoProyecto["circuitos"][number],
  ): ModuloCuadro => ({
    id: `pia-${r.circuito.id}`,
    codigo: r.circuito.codigo,
    nombre: r.circuito.nombre,
    rating: `${r.in} A`,
    detalle: `${codigoDif.get(r.circuito.diferencialId) ?? "Sin dif."} · curva ${r.circuito.curva}`,
    tipo: "pia",
    ancho: Math.min(4, Math.max(1, r.circuito.polos)),
    estado: r.estado === "error" ? "error" : "ok",
  });

  // Primero las protecciones generales y después los magnetotérmicos de cada
  // circuito, como se monta físicamente en el cuadro.
  resultado.diferenciales.forEach((d, i) => {
    modulos.push({
      id: d.diferencial.id,
      codigo: `D${i + 1}`,
      nombre: d.diferencial.nombre,
      rating: `${d.diferencial.sensibilidad} mA`,
      detalle: `Tipo ${d.diferencial.tipo} · ${d.circuitos.length} circ.`,
      tipo: "dif",
      ancho: d.diferencial.polos,
    });
  });

  resultado.circuitos.forEach((r) => modulos.push(piaModulo(r)));

  const carriles: ModuloCuadro[][] = [];
  let carrilActual: ModuloCuadro[] = [];
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

  const totalModulos = modulos.reduce((s, m) => s + m.ancho, 0);

  const tono: Record<ModuloCuadro["tipo"], { barra: string; palanca: string }> = {
    iga: { barra: "bg-[#c08a3e]", palanca: "bg-[#a9782f]" },
    dps: { barra: "bg-[#b4453a]", palanca: "bg-[#9e3a31]" },
    dif: { barra: "bg-[#3d7a7e]", palanca: "bg-[#2f666a]" },
    pia: { barra: "bg-[#7a8794]", palanca: "bg-[#3a4249]" },
  };

  const leyenda: {
    tipo: ModuloCuadro["tipo"];
    titulo: string;
    texto: string;
  }[] = [
    { tipo: "iga", titulo: "IGA", texto: "Corta toda la instalación" },
    ...(conSobretensiones
      ? [
          {
            tipo: "dps" as const,
            titulo: "DPS",
            texto: "Protege de sobretensiones",
          },
        ]
      : []),
    {
      tipo: "dif",
      titulo: "Diferencial",
      texto: "30 mA contra contactos indirectos",
    },
    { tipo: "pia", titulo: "PIA", texto: "Un magnetotérmico por circuito" },
  ];

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
              <p className="mt-1.5 text-[34px] font-semibold leading-none tabular-nums">
                {iga}
                <span className="ml-1 text-[14px] font-normal text-muted-foreground">A</span>
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
              <Zap className="size-5" />
            </span>
          </div>

          <dl className="mt-4 space-y-2 border-t border-border/70 pt-4 text-[12.5px]">
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

          <p className="mt-3 rounded-lg bg-muted/50 p-3 text-[11.5px] leading-4 text-muted-foreground">
            Se adopta el menor calibre normalizado que cubre la intensidad
            prevista sin bajar del mínimo del grado de electrificación
            ({proyecto.suministro.fases === 3 ? "trifásico" : "monofásico"}).
          </p>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-[14.5px] font-semibold">
                <Shield className="size-4 text-primary" />
                Interruptores diferenciales
              </h3>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
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
                          "flex size-7 items-center justify-center rounded-md text-[11px] font-semibold",
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
                        className="w-36 rounded-md border border-transparent bg-transparent px-1 py-0.5 text-[13.5px] font-semibold outline-none hover:border-border focus:border-border"
                        aria-label="Nombre del diferencial"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11.5px] text-muted-foreground">
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
                      <span className="text-[11.5px] text-muted-foreground">
                        Sin circuitos asignados.
                      </span>
                    )}
                    {d.circuitos.map((c) => (
                      <span
                        key={c.circuito.id}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px]"
                      >
                        {c.circuito.codigo} · {c.in} A
                      </span>
                    ))}
                  </div>

                  {excede && (
                    <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] leading-4 text-destructive">
                      <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                      Más de cinco circuitos en un mismo diferencial. La
                      ITC-BT-25 exige al menos uno por cada cinco.
                    </p>
                  )}
                  {vacio && (
                    <p className="mt-2.5 text-[11.5px] leading-4 text-muted-foreground">
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

      <section
        className={cn(
          "mt-4 surface-card p-5",
          highlightCampo === "sobretensiones" && "field-highlight",
        )}
        data-campo="sobretensiones"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                conSobretensiones
                  ? "bg-destructive/10 text-destructive"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Shield className="size-4" />
            </span>
            <div>
              <h3 className="text-[14.5px] font-semibold">
                Protección contra sobretensiones
              </h3>
              <p className="mt-1 max-w-2xl text-[12.5px] leading-5 text-muted-foreground">
                Incluye un protector contra sobretensiones transitorias (DPS)
                tipo 2 en el cuadro general, coordinado con el IGA. La decisión
                definitiva debe justificarse conforme a la ITC-BT-23 y al nivel
                de exposición de la vivienda.
              </p>
            </div>
          </div>

          <label className="flex shrink-0 cursor-pointer items-center gap-2.5 self-start rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-[12px] font-medium">
              {conSobretensiones ? "Activada" : "Desactivada"}
            </span>
            <Switch
              checked={conSobretensiones}
              onCheckedChange={(v) =>
                update({
                  protecciones: {
                    ...proyecto.protecciones,
                    sobretensiones: v,
                  },
                })
              }
              aria-label="Incluir protección contra sobretensiones"
            />
          </label>
        </div>

        <div
          className={cn(
            "mt-3 rounded-lg border px-3 py-2.5 text-[11.5px] leading-4",
            conSobretensiones
              ? "border-primary/20 bg-primary/[0.04] text-muted-foreground"
              : "border-accent/35 bg-accent/[0.05] text-accent-foreground dark:text-accent",
          )}
        >
          {conSobretensiones
            ? `El cuadro incluirá un DPS tipo 2 de ${polosDps} polos. También se presupuesta y se refleja en la memoria técnica.`
            : "El cuadro se documentará sin DPS. El presupuesto no lo incluirá y la memoria declarará expresamente que no se prevé."}
        </div>
      </section>

      <section className="mt-4 surface-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-[14.5px] font-semibold">
              <CircuitBoard className="size-4 text-primary" />
              Asignación de circuitos a diferenciales
            </h3>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Selecciona el diferencial que protege cada circuito. Los
              magnetotérmicos siguen siendo individuales.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {resultado.circuitos.map((r) => (
            <div
              key={r.circuito.id}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-border/80 bg-card px-3 py-2"
            >
              <span className="inline-flex min-w-8 shrink-0 justify-center rounded bg-muted px-1 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {r.circuito.codigo}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium">
                  {r.circuito.nombre}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {r.in} A · curva {r.circuito.curva}
                </p>
              </div>
              <Select
                value={r.circuito.diferencialId || undefined}
                onValueChange={(v) => moverCircuito(r.circuito.id, v)}
                disabled={proyecto.diferenciales.length === 0}
              >
                <SelectTrigger
                  aria-label={`Diferencial de ${r.circuito.nombre}`}
                  className="h-7 w-[110px] min-w-0 shrink-0 px-2 text-[11px] sm:w-[136px]"
                >
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="end"
                  className="max-h-[280px] w-[190px] max-w-[calc(100vw-2rem)]"
                >
                  {proyecto.diferenciales.length === 0 ? (
                    <SelectItem value="__sin-diferencial" disabled>
                      Sin diferenciales
                    </SelectItem>
                  ) : (
                    proyecto.diferenciales.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14.5px] font-semibold">Tabla de protecciones</h3>
          <span className="text-[11.5px] text-muted-foreground">
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
              <tr
                key={r.circuito.id}
                className={cn("hover:bg-muted/30", !ok && "bg-destructive/[0.035]")}
              >
                <td className="px-4 py-2.5">
                  <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {r.circuito.codigo}
                  </span>
                  <span className="text-[12.5px]">{r.circuito.nombre}</span>
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
                <td className="px-3 py-2.5 text-center text-[12px]">
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
                <td className="px-3 py-2.5 text-[12px]">
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-[14.5px] font-semibold">
              <ShieldCheck className="size-4 text-primary" />
              Vista frontal del cuadro
            </h3>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Cada bloque es un dispositivo real y ocupa su ancho en módulos DIN
              de 17,5 mm.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-muted px-3 py-1 text-[11.5px] font-medium text-muted-foreground">
            {modulos.length} dispositivos · {totalModulos} módulos ·{" "}
            {carriles.length} {carriles.length === 1 ? "carril" : "carriles"}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {leyenda.map((l) => (
            <div
              key={l.tipo}
              className="flex items-start gap-2 rounded-lg border border-border/70 bg-muted/25 px-3 py-2"
            >
              <span
                className={cn(
                  "mt-0.5 h-4 w-1.5 shrink-0 rounded-full",
                  tono[l.tipo].barra,
                )}
              />
              <div>
                <p className="text-[12px] font-semibold leading-tight">
                  {l.titulo}
                </p>
                <p className="mt-0.5 text-[11.5px] leading-4 text-muted-foreground">
                  {l.texto}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-[#dcd7cb] bg-[#f3f0e9] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b7466]">
              Cuadro de distribución
            </span>
            <span className="text-[10.5px] text-[#9a9384]">
              Visión frontal · puerta abierta
            </span>
          </div>
          <div className="space-y-3">
            {carriles.map((carril, i) => {
            const ocupados = carril.reduce((s, m) => s + m.ancho, 0);
            return (
              <div
                key={i}
                className="overflow-x-auto rounded-xl bg-sidebar p-3"
              >
                <div className="min-w-[640px]">
                  <div className="mb-2 flex items-center justify-between gap-3 px-0.5">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Carril {i + 1}
                      </span>
                      <span className="text-[11px] text-white/40">
                        {carril.length} dispositivos · {ocupados} de 12 módulos
                      </span>
                    </div>
                    <span className="text-[10.5px] text-white/30">
                      Perfil DIN 35 mm
                    </span>
                  </div>

                  <div className="mb-1 grid grid-cols-12 gap-1 px-1.5">
                    {Array.from({ length: 12 }).map((_, n) => (
                      <span
                        key={n}
                        className="text-center text-[10px] tabular-nums text-white/25"
                      >
                        {n + 1}
                      </span>
                    ))}
                  </div>

                  <div className="relative rounded-md bg-[#1e2328] px-1.5 py-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <div className="pointer-events-none absolute inset-x-0 top-1/2 h-5 -translate-y-1/2 bg-gradient-to-b from-white/[0.09] via-white/[0.03] to-black/25" />
                    <div className="relative grid grid-cols-12 gap-1">
                      {carril.map((m) => (
                        <div
                          key={m.id}
                          style={{
                            gridColumn: `span ${Math.min(12, m.ancho)}`,
                          }}
                          className="relative flex h-[88px] flex-col overflow-hidden rounded-[3px] border border-black/25 bg-[#efeee9] text-[#20262b] shadow-[0_3px_6px_rgba(0,0,0,0.35)]"
                          title={`${m.codigo} — ${m.nombre} · ${m.rating} · ${m.detalle}`}
                        >
                          <div
                            className={cn(
                              "h-[4px] shrink-0",
                              tono[m.tipo].barra,
                            )}
                          />
                          <div className="flex flex-1 flex-col items-center px-1 pb-1 pt-1.5">
                            <span className="w-full truncate text-center text-[11.5px] font-bold leading-none">
                              {m.codigo}
                            </span>
                            <span
                              className={cn(
                                "mt-2 h-3.5 w-4 rounded-[1px] border border-black/40 shadow-sm",
                                tono[m.tipo].palanca,
                              )}
                            />
                            <span className="mt-auto w-full truncate text-center text-[11.5px] font-semibold leading-none tabular-nums">
                              {m.rating}
                            </span>
                          </div>
                          {m.ancho >= 2 && (
                            <div className="shrink-0 border-t border-black/10 bg-black/[0.05] px-1 py-0.5 text-center">
                              <span className="block truncate text-[10.5px] leading-tight text-[#5b646d]">
                                {m.detalle}
                              </span>
                            </div>
                          )}
                          {m.estado === "error" && (
                            <span className="absolute right-1 top-1.5 size-1.5 rounded-full bg-destructive ring-1 ring-white/80" />
                          )}
                        </div>
                      ))}
                      {Array.from({
                        length: Math.max(0, 12 - ocupados),
                      }).map((_, k) => (
                        <div
                          key={`hueco-${k}`}
                          className="h-[88px] rounded-[3px] border border-dashed border-white/[0.07]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-muted/40 p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <p className="text-[12px] leading-5 text-muted-foreground">
            Se lee de izquierda a derecha: primero las protecciones generales
            (IGA, {conSobretensiones ? "DPS y " : ""}diferenciales) y después los
            magnetotérmicos de cada circuito. Cada PIA indica el diferencial que lo
            protege (D1, D2…) en su etiqueta o al pasar el cursor. Cada bloque ocupa
            su ancho real en módulos de 17,5 mm; el punto rojo señala un circuito
            con comprobaciones pendientes. El esquema unifilar se desarrolla en la
            memoria.
          </p>
        </div>
      </section>
    </div>
  );
}
