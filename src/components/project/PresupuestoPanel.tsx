import { Button } from "@/components/ui/button";
import { eur, num } from "@/lib/format";
import { calcularPresupuesto } from "@/lib/rebt/presupuesto";
import type { LineaPresupuesto } from "@/lib/rebt/presupuesto";
import type {
  LineaPresupuestoManual,
  Proyecto,
  ResultadoProyecto,
} from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import {
  Info,
  Plus,
  Receipt,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { SectionHeader, Stat } from "./ui";

const cantidadTexto = (cantidad: number) =>
  num(cantidad, Number.isInteger(cantidad) ? 0 : 2);

export function PresupuestoPanel({
  proyecto,
  update,
  resultado,
  onIrAProtecciones,
}: {
  proyecto: Proyecto;
  update: (patch: Partial<Proyecto>) => void;
  resultado: ResultadoProyecto;
  onIrAProtecciones: () => void;
}) {
  const p = proyecto.presupuesto;
  const calc = calcularPresupuesto(proyecto, resultado);

  const upd = (patch: Partial<Proyecto["presupuesto"]>) =>
    update({ presupuesto: { ...p, ...patch } });

  const updManual = (
    id: string,
    patch: Partial<LineaPresupuestoManual>,
  ) =>
    upd({
      lineasManuales: p.lineasManuales.map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      ),
    });

  const addManual = () => {
    const linea: LineaPresupuestoManual = {
      id: `manual-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      descripcion: "",
      unidad: "ud",
      cantidad: 1,
      precioUnitario: 0,
    };
    upd({ lineasManuales: [...p.lineasManuales, linea] });
  };

  const delManual = (id: string) =>
    upd({ lineasManuales: p.lineasManuales.filter((l) => l.id !== id) });

  const setPrecio = (id: string, valor: number) =>
    upd({
      precios: { ...p.precios, [id]: Number.isFinite(valor) ? Math.max(0, valor) : 0 },
    });

  const resetPrecio = (id: string) => {
    const precios = { ...p.precios };
    delete precios[id];
    upd({ precios });
  };

  const preciosEditados = calc.lineas.filter(
    (l) => l.automatica && p.precios[l.id] !== undefined,
  ).length;
  const automaticas = calc.lineas.filter((l) => l.automatica).length;

  const fila = (linea: LineaPresupuesto) => {
    const manual = !linea.automatica;
    const sobrescrito = linea.automatica && p.precios[linea.id] !== undefined;

    return (
      <tr
        key={linea.id}
        className={cn(
          "align-top transition-colors hover:bg-muted/25",
          manual && "bg-primary/[0.018]",
        )}
      >
        <td className="px-4 py-3">
          {linea.automatica ? (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Auto
                </span>
                <span className="text-[12.5px] font-medium">{linea.concepto}</span>
              </div>
              <p className="mt-1 text-[11.5px] leading-4 text-muted-foreground">
                {linea.detalle}
              </p>
            </div>
          ) : (
            <div>
              <span className="mb-1 inline-flex rounded bg-accent/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-accent-foreground dark:text-accent">
                Manual
              </span>
              <input
                value={
                  p.lineasManuales.find((l) => l.id === linea.id)?.descripcion ??
                  ""
                }
                onChange={(e) =>
                  updManual(linea.id, { descripcion: e.target.value })
                }
                placeholder="Describe el trabajo o material"
                aria-label="Descripción de la partida manual"
                className="h-8 w-full min-w-[220px] rounded-md border border-border bg-card px-2 text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
          )}
        </td>

        <td className="px-2 py-3 text-center">
          {manual ? (
            <input
              value={
                p.lineasManuales.find((l) => l.id === linea.id)?.unidad ?? "ud"
              }
              onChange={(e) => updManual(linea.id, { unidad: e.target.value })}
              aria-label="Unidad de la partida manual"
              className="h-8 w-14 rounded-md border border-border bg-card px-1.5 text-center text-[11.5px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          ) : (
            <span className="text-[11.5px] text-muted-foreground">
              {linea.unidad}
            </span>
          )}
        </td>

        <td className="px-2 py-3 text-right">
          {manual ? (
            <input
              type="number"
              min={0}
              step={0.01}
              value={
                p.lineasManuales.find((l) => l.id === linea.id)?.cantidad ?? 0
              }
              onChange={(e) =>
                updManual(linea.id, {
                  cantidad: Math.max(0, Number(e.target.value) || 0),
                })
              }
              aria-label="Cantidad de la partida manual"
              className="h-8 w-20 rounded-md border border-border bg-card px-2 text-right text-[12.5px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          ) : (
            <span className="text-[12.5px] tabular-nums text-muted-foreground">
              {cantidadTexto(linea.cantidad)}
            </span>
          )}
        </td>

        <td className="px-2 py-3 text-right">
          {manual ? (
            <input
              type="number"
              min={0}
              step={0.01}
              value={
                p.lineasManuales.find((l) => l.id === linea.id)
                  ?.precioUnitario ?? 0
              }
              onChange={(e) =>
                updManual(linea.id, {
                  precioUnitario: Math.max(0, Number(e.target.value) || 0),
                })
              }
              aria-label="Precio unitario de la partida manual"
              className="h-8 w-24 rounded-md border border-border bg-card px-2 text-right text-[12.5px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          ) : (
            <div className="inline-flex items-center gap-1">
              <input
                type="number"
                min={0}
                step={0.01}
                value={linea.precioUnitario}
                onChange={(e) => setPrecio(linea.id, Number(e.target.value))}
                aria-label={`Precio unitario de ${linea.concepto}`}
                title="Precio editable"
                className="h-8 w-20 rounded-md border border-transparent bg-transparent px-1.5 text-right text-[12.5px] tabular-nums outline-none transition-colors hover:border-border focus:border-border focus:bg-card focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              {sobrescrito && (
                <button
                  type="button"
                  onClick={() => resetPrecio(linea.id)}
                  title="Restablecer el precio orientativo"
                  aria-label={`Restablecer precio de ${linea.concepto}`}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <RotateCcw className="size-3" />
                </button>
              )}
            </div>
          )}
        </td>

        <td className="px-3 py-3 text-right text-[12.5px] font-medium tabular-nums">
          {eur(linea.importe)}
        </td>

        <td className="px-2 py-3 text-right">
          {manual && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => delManual(linea.id)}
              title="Eliminar partida"
              aria-label="Eliminar partida manual"
            >
              <Trash2 className="size-3.5 text-muted-foreground" />
            </Button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Presupuesto orientativo"
        title="Presupuesto de la instalación"
        description="Se genera con los circuitos, las longitudes y las protecciones del proyecto. Puedes ajustar cualquier precio unitario, añadir partidas propias y cambiar el IVA."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Materiales"
          value={eur(calc.materiales)}
          hint="Cuadro, cable, tubo, mecanismos y tierra"
          tone="primary"
        />
        <Stat
          label="Mano de obra"
          value={eur(calc.manoObra)}
          hint="Montaje, conexionado y pruebas"
        />
        <Stat
          label="Partidas manuales"
          value={eur(calc.manuales)}
          hint={
            p.lineasManuales.length === 0
              ? "Aún no has añadido ninguna"
              : `${p.lineasManuales.length} ${
                  p.lineasManuales.length === 1 ? "partida" : "partidas"
                }`
          }
        />
        <Stat
          label="Total con IVA"
          value={eur(calc.total)}
          hint={`IVA ${num(calc.ivaPct, 1)} %`}
          tone="primary"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_0.7fr]">
        <section className="surface-card overflow-hidden">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
            <div>
              <h3 className="flex items-center gap-2 text-[14.5px] font-semibold">
                <Receipt className="size-4 text-primary" />
                Detalle del presupuesto
              </h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {automaticas} partidas automáticas
                {p.lineasManuales.length > 0 &&
                  ` · ${p.lineasManuales.length} manuales`}
                . Los precios en gris son editables.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {preciosEditados > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => upd({ precios: {} })}
                  title="Restablecer todos los precios automáticos"
                >
                  <RotateCcw className="size-3.5" />
                  <span className="hidden sm:inline">Restablecer precios</span>
                  <span className="sm:hidden">Precios</span>
                </Button>
              )}
              <Button size="sm" className="gap-1.5" onClick={addManual}>
                <Plus className="size-3.5" />
                Añadir partida
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[790px] text-[12.5px]">
              <thead className="border-b border-border/80 bg-muted/40 text-[10.5px] uppercase tracking-[0.07em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Concepto</th>
                  <th className="px-2 py-2.5 text-center font-medium">Unidad</th>
                  <th className="px-2 py-2.5 text-right font-medium">Cantidad</th>
                  <th className="px-2 py-2.5 text-right font-medium">
                    Precio (€)
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">Importe</th>
                  <th className="w-9 px-2 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {calc.lineas.map(fila)}
              </tbody>
            </table>
          </div>

          <div className="border-t border-border/70 bg-muted/20 px-5 py-3">
            <p className="flex items-start gap-2 text-[11.5px] leading-4 text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Las cantidades se recalculan al cambiar circuitos, longitudes o
              protecciones. Los precios son orientativos y no incluyen IVA; el
              IVA se aplica en el resumen.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="surface-card p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[14.5px] font-semibold">Resumen económico</h3>
              <span className="text-[10.5px] uppercase tracking-[0.1em] text-muted-foreground">
                Sin IVA
              </span>
            </div>

            <dl className="mt-4 space-y-2.5 text-[12.5px]">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Materiales</dt>
                <dd className="font-medium tabular-nums">{eur(calc.materiales)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Mano de obra</dt>
                <dd className="font-medium tabular-nums">{eur(calc.manoObra)}</dd>
              </div>
              {calc.manuales > 0 && (
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">Partidas manuales</dt>
                  <dd className="font-medium tabular-nums">{eur(calc.manuales)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-3 border-t border-border/70 pt-2.5">
                <dt className="font-medium">Subtotal</dt>
                <dd className="font-semibold tabular-nums">{eur(calc.subtotal)}</dd>
              </div>
            </dl>

            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
              <label
                htmlFor="iva-presupuesto"
                className="text-[11px] font-medium text-muted-foreground"
              >
                IVA aplicado
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="iva-presupuesto"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={p.ivaPct}
                  onChange={(e) =>
                    upd({
                      ivaPct: Math.min(
                        100,
                        Math.max(0, Number(e.target.value) || 0),
                      ),
                    })
                  }
                  className="h-8 w-20 rounded-md border border-border bg-card px-2 text-right text-[12.5px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                />
                <span className="text-[12px] text-muted-foreground">%</span>
                <span className="ml-auto text-[12.5px] font-medium tabular-nums">
                  {eur(calc.iva)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/70 pt-3">
              <span className="text-[13px] font-medium">Total</span>
              <span className="text-[22px] font-semibold leading-none tracking-tight text-primary tabular-nums">
                {eur(calc.total)}
              </span>
            </div>
          </section>

          <section
            className={cn(
              "surface-card p-5",
              calc.incluyeDps
                ? "border-primary/20"
                : "border-accent/35 bg-accent/[0.025]",
            )}
          >
            <div className="flex items-start gap-2.5">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  calc.incluyeDps
                    ? "bg-primary/8 text-primary"
                    : "bg-accent/15 text-accent-foreground dark:text-accent",
                )}
              >
                {calc.incluyeDps ? (
                  <ShieldCheck className="size-4" />
                ) : (
                  <ShieldAlert className="size-4" />
                )}
              </span>
              <div>
                <h3 className="text-[14.5px] font-semibold">
                  Protección contra sobretensiones
                </h3>
                <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
                  {calc.incluyeDps
                    ? "El presupuesto incluye un DPS tipo 2 en el cuadro general."
                    : "El presupuesto no incluye DPS. Puedes activarlo en el apartado de protecciones."}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={onIrAProtecciones}
            >
              {calc.incluyeDps ? "Revisar en el cuadro" : "Activar en el cuadro"}
            </Button>
          </section>

          <section className="rounded-xl border border-border bg-muted/40 p-4">
            <p className="flex items-start gap-2 text-[11.5px] leading-4 text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Los precios son orientativos y deben revisarse con las tarifas de
              tu proveedor antes de entregar el presupuesto.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
