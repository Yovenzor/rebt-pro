import {
  DataTable,
  NumberField,
  SectionHeader,
  SelectField,
  TextField,
} from "./ui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CALIBRES_PIA,
  CURVAS,
  METODOS_INSTALACION,
  PRESETS_ESPECIALES,
  PRESETS_ITC25,
  SECCIONES_COMERCIALES,
  circuitoDesdePreset,
} from "@/lib/rebt/data";
import { calcularCircuito, presetDe } from "@/lib/rebt/engine";
import { num } from "@/lib/format";
import type { Circuito, Diferencial, Proyecto, ResultadoProyecto } from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calculator,
  Copy,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const estadoColor = {
  ok: "bg-[oklch(0.62_0.12_155)]",
  aviso: "bg-[oklch(0.75_0.13_80)]",
  error: "bg-destructive",
} as const;

function CircuitoDialog({
  circuito,
  diferenciales,
  limite,
  highlightCampo,
  onClose,
  onSave,
}: {
  circuito: Circuito;
  diferenciales: Diferencial[];
  limite: number;
  highlightCampo?: string;
  onClose: () => void;
  onSave: (c: Circuito) => void;
}) {
  const [draft, setDraft] = useState<Circuito>(circuito);

  const r = calcularCircuito(draft, limite);
  const preset = presetDe(draft.codigo);
  const err = r.estado === "error";

  const set = (patch: Partial<Circuito>) =>
    setDraft((d) => (d ? { ...d, ...patch } : d));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[17px]">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[12px] font-semibold text-primary">
              {draft.codigo}
            </span>
            {draft.nombre}
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            {draft.tipo === "estandar"
              ? "Circuito normalizado ITC-BT-25. Las secciones y calibres automáticos respetan los mínimos reglamentarios."
              : "Circuito especial. El dimensionado se calcula con los criterios generales de la ITC-BT-19."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-1 lg:grid-cols-[1fr_260px]">
          <div className="space-y-4">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <TextField
                label="Nombre del circuito"
                value={draft.nombre}
                onChange={(v) => set({ nombre: v })}
                field="nombre"
                highlight={highlightCampo === "nombre"}
              />
              <TextField
                label="Uso / destino"
                value={draft.uso}
                onChange={(v) => set({ uso: v })}
              />
              <NumberField
                label="Potencia prevista"
                value={draft.potencia}
                onChange={(v) => set({ potencia: v })}
                unit="W"
                min={0}
                step={10}
                field="potencia"
                highlight={highlightCampo === "potencia"}
              />
              <NumberField
                label="Coeficiente de simultaneidad"
                value={draft.fs}
                onChange={(v) => set({ fs: v })}
                min={0}
                max={1}
                step={0.05}
                hint="Sólo se aplica a la previsión de cargas del conjunto."
              />
              <NumberField
                label="Longitud del recorrido"
                value={draft.longitud}
                onChange={(v) => set({ longitud: v })}
                unit="m"
                min={0}
                max={300}
                field="longitud"
                highlight={highlightCampo === "longitud"}
              />
              <NumberField
                label="Puntos de utilización / tomas"
                value={draft.puntos}
                onChange={(v) => set({ puntos: v })}
                min={0}
                max={200}
                field="puntos"
                highlight={highlightCampo === "puntos"}
              />
              <NumberField
                label="Factor de potencia (cos φ)"
                value={draft.cosPhi}
                onChange={(v) => set({ cosPhi: v })}
                min={0.5}
                max={1}
                step={0.01}
              />
              <NumberField
                label="Rendimiento (η)"
                value={draft.rendimiento}
                onChange={(v) => set({ rendimiento: v })}
                min={0.3}
                max={1}
                step={0.01}
              />
            </div>

            <div className="rounded-lg border border-border/80 p-3.5">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Condiciones de instalación
              </p>
              <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
                <SelectField
                  label="Método de instalación"
                  value={draft.metodo}
                  onChange={(v) => set({ metodo: v as Circuito["metodo"] })}
                  options={METODOS_INSTALACION.map((m) => ({
                    value: m.valor,
                    label: m.etiqueta,
                  }))}
                  hint={METODOS_INSTALACION.find((m) => m.valor === draft.metodo)?.descripcion}
                />
                <SelectField
                  label="Tipo de aislamiento"
                  value={draft.aislamiento}
                  onChange={(v) => set({ aislamiento: v as Circuito["aislamiento"] })}
                  options={[
                    { value: "PVC", label: "PVC · 70 °C" },
                    { value: "XLPE", label: "XLPE / EPR · 90 °C" },
                  ]}
                />
                <NumberField
                  label="Temperatura ambiente"
                  value={draft.tempAmbiente}
                  onChange={(v) => set({ tempAmbiente: v })}
                  unit="°C"
                  min={10}
                  max={60}
                  hint="La tabla 1 está referida a 40 °C."
                />
                <NumberField
                  label="Circuitos agrupados"
                  value={draft.agrupamiento}
                  onChange={(v) => set({ agrupamiento: v })}
                  min={1}
                  max={12}
                  hint="Nº total de circuitos en la misma canalización."
                />
                <SelectField
                  label="Número de fases"
                  value={draft.fases}
                  onChange={(v) => set({ fases: Number(v) as 1 | 3 })}
                  options={[
                    { value: 1, label: "Monofásico · 230 V" },
                    { value: 3, label: "Trifásico · 400 V" },
                  ]}
                />
                <SelectField
                  label="Sección del conductor"
                  value={draft.seccion}
                  onChange={(v) => set({ seccion: Number(v) })}
                  options={[
                    { value: 0, label: `Automática (${r.seccion} mm²)` },
                    ...SECCIONES_COMERCIALES.map((s) => ({
                      value: s,
                      label: `${s} mm²`,
                    })),
                  ]}
                  field="seccion"
                  highlight={highlightCampo === "seccion"}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border/80 p-3.5">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Protección y diferencial
              </p>
              <div className="mt-3 grid gap-3.5 sm:grid-cols-2">
                <SelectField
                  label="Magnetotérmico (PIA)"
                  value={draft.pia}
                  onChange={(v) => set({ pia: Number(v) })}
                  options={[
                    { value: 0, label: `Automático (${r.in} A)` },
                    ...CALIBRES_PIA.map((a) => ({ value: a, label: `${a} A` })),
                  ]}
                  field="pia"
                  highlight={highlightCampo === "pia"}
                />
                <SelectField
                  label="Curva de disparo"
                  value={draft.curva}
                  onChange={(v) => set({ curva: v as Circuito["curva"] })}
                  options={CURVAS.map((c) => ({ value: c, label: `Curva ${c}` }))}
                  hint="C para uso general; B para iluminación; D para motores."
                />
                <SelectField
                  label="Número de polos"
                  value={draft.polos}
                  onChange={(v) => set({ polos: Number(v) as Circuito["polos"] })}
                  options={[1, 2, 3, 4].map((p) => ({
                    value: p,
                    label: `${p} ${p === 1 ? "polo" : "polos"}`,
                  }))}
                  field="polos"
                  highlight={highlightCampo === "polos"}
                />
                <SelectField
                  label="Diferencial asociado"
                  value={draft.diferencialId}
                  onChange={(v) => set({ diferencialId: v })}
                  options={diferenciales.map((d) => ({
                    value: d.id,
                    label: `${d.nombre} · ${d.sensibilidad} mA ${d.tipo}`,
                  }))}
                />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-foreground/80">
                Observaciones
              </label>
              <textarea
                value={draft.observaciones}
                onChange={(e) => set({ observaciones: e.target.value })}
                rows={2}
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                placeholder="Notas de instalación, criterios particulares…"
              />
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-border bg-muted/35 p-4">
              <p className="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                <Calculator className="size-3.5" />
                Resultado en vivo
              </p>
              <dl className="mt-3 space-y-2 text-[12.5px]">
                {[
                  ["Intensidad de diseño", `${num(r.ib, 2)} A`],
                  ["Magnetotérmico", `${r.in} A`],
                  ["Sección adoptada", `${r.seccion} mm²`],
                  ["Neutro / PE", `${r.neutro} / ${r.pe} mm²`],
                  ["Tubo recomendado", `${r.tubo} mm`],
                  ["Iz corregida", `${num(r.izCorregida, 1)} A`],
                  ["Caída de tensión", `${num(r.caidaV, 2)} V · ${num(r.caidaPct, 2)} %`],
                  ["Pérdidas", `${num(r.perdidasW, 1)} W`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>

              <div
                className={cn(
                  "mt-3 flex items-start gap-2 rounded-lg border px-2.5 py-2 text-[11.5px] leading-4",
                  err
                    ? "border-destructive/30 bg-destructive/8 text-destructive"
                    : r.estado === "aviso"
                      ? "border-accent/40 bg-accent/10 text-accent-foreground dark:text-accent"
                      : "border-primary/25 bg-primary/8 text-primary",
                )}
              >
                {err ? (
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                ) : (
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-current" />
                )}
                <span>
                  {err
                    ? "No cumple: revisa la sección, el calibre o la longitud."
                    : r.estado === "aviso"
                      ? "Cumple con margen ajustado o agrupamiento elevado."
                      : "Coordinación y caída de tensión conformes."}
                </span>
              </div>
            </div>

            {preset && (
              <div className="rounded-xl border border-border p-4">
                <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Referencia ITC-BT-25
                </p>
                <dl className="mt-2.5 space-y-1.5 text-[12px]">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">PIA de tabla</dt>
                    <dd className="tabular-nums">{preset.pia} A</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Sección mínima</dt>
                    <dd className="tabular-nums">{preset.seccion} mm²</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Tubo de tabla</dt>
                    <dd className="tabular-nums">{preset.tubo} mm</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Máx. puntos</dt>
                    <dd className="tabular-nums">{preset.maxPuntos}</dd>
                  </div>
                </dl>
              </div>
            )}

            <div className="rounded-xl bg-primary/[0.045] p-3.5 text-[11.5px] leading-4 text-muted-foreground">
              Sección por intensidad {r.seccionPorIntensidad} mm² · por caída{" "}
              {r.seccionPorCaida} mm². Se adopta la mayor de ambas.
            </div>
          </aside>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Guardar circuito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CircuitosPanel({
  proyecto,
  update,
  resultado,
  editingId,
  onEditingChange,
  highlightCampo,
  onNavigate,
}: {
  proyecto: Proyecto;
  update: (patch: Partial<Proyecto>) => void;
  resultado: ResultadoProyecto;
  editingId?: string | null;
  onEditingChange: (id: string | null) => void;
  highlightCampo?: string;
  onNavigate: () => void;
}) {
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const editing = proyecto.circuitos.find((c) => c.id === editingId) ?? null;

  const usados = new Set(proyecto.circuitos.map((c) => c.codigo));
  const disponibles = [
    ...PRESETS_ITC25.filter((p) => !usados.has(p.codigo)).map((p) => ({
      value: p.codigo,
      label: `${p.codigo} · ${p.nombre}`,
      grupo: "ITC-BT-25",
    })),
    ...PRESETS_ESPECIALES.map((p) => ({
      value: p.codigo,
      label: `${p.codigo} · ${p.nombre}`,
      grupo: "Especiales",
    })),
  ];
  const disponiblesITC = disponibles.filter((d) => d.grupo === "ITC-BT-25");
  const disponiblesEspeciales = disponibles.filter(
    (d) => d.grupo === "Especiales",
  );

  const commit = (circuitos: Circuito[]) => update({ circuitos });

  const addCircuito = () => {
    const preset = [...PRESETS_ITC25, ...PRESETS_ESPECIALES].find(
      (p) => p.codigo === nuevoCodigo,
    );
    if (!preset) return;
    // Se asigna al diferencial con menos circuitos para no superar el máximo
    // de cinco por dispositivo (ITC-BT-25).
    const dif = [...proyecto.diferenciales].sort(
      (a, b) =>
        proyecto.circuitos.filter((c) => c.diferencialId === a.id).length -
        proyecto.circuitos.filter((c) => c.diferencialId === b.id).length,
    )[0];
    const nuevo = circuitoDesdePreset(
      preset,
      proyecto.circuitos.length,
      dif?.id ?? "",
      `${preset.codigo}-${Date.now()}`,
    );
    commit([...proyecto.circuitos, nuevo]);
    setNuevoCodigo("");
    onNavigate();
  };

  const saveCircuito = (c: Circuito) => {
    commit(proyecto.circuitos.map((x) => (x.id === c.id ? c : x)));
  };

  const mover = (id: string, dir: -1 | 1) => {
    const idx = proyecto.circuitos.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const next = [...proyecto.circuitos];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    commit(next);
  };

  return (
    <div>
      <SectionHeader
        eyebrow="ITC-BT-25"
        title="Circuitos de la instalación"
        description="Cada circuito se calcula de forma independiente: intensidad, sección por intensidad y por caída, protección, conductor de protección y tubo. Los valores automáticos respetan los mínimos reglamentarios."
        actions={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Select
              value={nuevoCodigo || undefined}
              onValueChange={setNuevoCodigo}
            >
              <SelectTrigger
                aria-label="Circuito a añadir"
                className="h-9 w-full min-w-0 flex-1 rounded-lg border-border bg-card px-2.5 text-[13px] shadow-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/40 data-[state=open]:ring-2 data-[state=open]:ring-ring/25 dark:bg-card dark:hover:bg-muted/30 sm:w-[240px] sm:min-w-[210px] sm:flex-none"
              >
                <SelectValue placeholder="Añadir circuito…" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                className="max-h-[320px] w-[300px] max-w-[calc(100vw-2rem)] rounded-xl border-border/80 bg-popover p-1.5 shadow-xl"
              >
                {disponiblesITC.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                      ITC-BT-25 (disponibles)
                    </SelectLabel>
                    {disponiblesITC.map((d) => (
                      <SelectItem
                        key={d.value}
                        value={d.value}
                        className="rounded-md py-2 text-[12.5px]"
                      >
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}

                {disponiblesITC.length > 0 &&
                  disponiblesEspeciales.length > 0 && <SelectSeparator />}

                {disponiblesEspeciales.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                      Circuitos especiales
                    </SelectLabel>
                    {disponiblesEspeciales.map((d) => (
                      <SelectItem
                        key={d.value}
                        value={d.value}
                        className="rounded-md py-2 text-[12.5px]"
                      >
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}

                {disponibles.length === 0 && (
                  <SelectItem value="__sin-circuitos" disabled>
                    No quedan circuitos disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="gap-1"
              onClick={addCircuito}
              disabled={!nuevoCodigo}
              data-campo="nuevo-circuito"
            >
              <Plus className="size-4" />
              Añadir
            </Button>
          </div>
        }
      />

      <DataTable
        head={
          <tr>
            <th className="px-4 py-2.5 text-left font-medium">Circuito</th>
            <th className="px-3 py-2.5 text-right font-medium">P (W)</th>
            <th className="px-3 py-2.5 text-right font-medium">L (m)</th>
            <th className="px-3 py-2.5 text-right font-medium">Ib (A)</th>
            <th className="px-3 py-2.5 text-right font-medium">PIA</th>
            <th className="px-3 py-2.5 text-right font-medium">S (mm²)</th>
            <th className="px-3 py-2.5 text-right font-medium">ΔU (%)</th>
            <th className="px-3 py-2.5 text-center font-medium">Estado</th>
            <th className="px-4 py-2.5 text-right font-medium">Acciones</th>
          </tr>
        }
      >
        {resultado.circuitos.map((r) => {
          const c = r.circuito;
          return (
            <tr
              key={c.id}
              data-campo={`circuito-${c.id}`}
              className={cn(
                "group transition-colors hover:bg-muted/35",
                r.estado === "error" && "bg-destructive/[0.035]",
                Boolean(highlightCampo) && editingId === c.id && "field-highlight",
              )}
            >
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex min-w-9 justify-center rounded bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                    {c.codigo}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{c.nombre}</p>
                    <p className="truncate text-[11.5px] text-muted-foreground">
                      {c.fases === 3 ? "Trifásico" : "Monofásico"} ·{" "}
                      {c.metodo} · {c.aislamiento} · {c.puntos} pts
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">{num(c.potencia)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{c.longitud}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{num(r.ib, 1)}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{r.in} A</td>
              <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                {r.seccion}
              </td>
              <td
                className={cn(
                  "px-3 py-2.5 text-right tabular-nums",
                  !r.comprobaciones.caida && "font-semibold text-destructive",
                )}
              >
                {num(r.caidaPct, 2)}
              </td>
              <td className="px-3 py-2.5 text-center">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                    r.estado === "error" && "bg-destructive/10 text-destructive",
                    r.estado === "aviso" &&
                      "bg-accent/15 text-accent-foreground dark:text-accent",
                    r.estado === "ok" && "bg-primary/8 text-primary",
                  )}
                  title={
                    r.estado === "ok"
                      ? "Conforme"
                      : r.estado === "aviso"
                        ? "Revisar"
                        : "Incumple"
                  }
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      estadoColor[r.estado],
                    )}
                  />
                  {r.estado === "ok"
                    ? "OK"
                    : r.estado === "aviso"
                      ? "Aviso"
                      : "Error"}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center justify-end gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Subir"
                    onClick={() => mover(c.id, -1)}
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Bajar"
                    onClick={() => mover(c.id, 1)}
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Editar"
                    onClick={() => onEditingChange(c.id)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Duplicar"
                    onClick={() =>
                      commit([
                        ...proyecto.circuitos,
                        {
                          ...c,
                          id: `${c.codigo}-${Date.now()}`,
                          nombre: `${c.nombre} (copia)`,
                        },
                      ])
                    }
                  >
                    <Copy className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Eliminar"
                    onClick={() => commit(proyecto.circuitos.filter((x) => x.id !== c.id))}
                  >
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </td>
            </tr>
          );
        })}
      </DataTable>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Potencia instalada",
            value: `${num(resultado.potenciaInstalada)} W`,
            hint: "Suma de la potencia prevista de todos los circuitos.",
          },
          {
            label: "Caída máxima",
            value: `${num(resultado.caidaMaximaPct, 2)} %`,
            hint: `Límite adoptado: ${proyecto.ajustes.caidaMaximaPct} %.`,
          },
          {
            label: "Sección mínima utilizada",
            value: `${resultado.seccionMinima} mm²`,
            hint: "Incluye circuitos de iluminación de 1,5 mm².",
          },
        ].map((k) => (
          <div key={k.label} className="surface-card px-4 py-3">
            <p className="text-[11.5px] uppercase tracking-[0.1em] text-muted-foreground">
              {k.label}
            </p>
            <p className="mt-1 text-[17px] font-semibold tabular-nums">{k.value}</p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">{k.hint}</p>
          </div>
        ))}
      </div>

      {editing && (
        <CircuitoDialog
          key={editing.id}
          circuito={editing}
          diferenciales={proyecto.diferenciales}
          limite={proyecto.ajustes.caidaMaximaPct}
          highlightCampo={highlightCampo}
          onClose={() => onEditingChange(null)}
          onSave={saveCircuito}
        />
      )}
    </div>
  );
}
