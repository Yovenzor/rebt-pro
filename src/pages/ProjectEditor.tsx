import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { CalculosPanel } from "@/components/project/CalculosPanel";
import { CircuitosPanel } from "@/components/project/CircuitosPanel";
import { CuadroPanel } from "@/components/project/CuadroPanel";
import { DatosPanel } from "@/components/project/DatosPanel";
import { ElectrificacionPanel } from "@/components/project/ElectrificacionPanel";
import { PresupuestoPanel } from "@/components/project/PresupuestoPanel";
import { ResumenPanel } from "@/components/project/ResumenPanel";
import { TierraPanel } from "@/components/project/TierraPanel";
import { ValidacionPanel } from "@/components/project/ValidacionPanel";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { normalizarProyecto } from "@/lib/rebt/data";
import { calcularProyecto } from "@/lib/rebt/engine";
import { analizarProyecto, resumenHallazgos } from "@/lib/rebt/findings";
import type { SeccionId } from "@/lib/rebt/findings";
import type { Proyecto } from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  Calculator,
  CircuitBoard,
  FileText,
  Gauge,
  Home,
  Landmark,
  LayoutDashboard,
  Loader2,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { toast } from "sonner";

const SECCIONES: { id: SeccionId; label: string; icon: NavItem["icon"] }[] = [
  { id: "resumen", label: "Resumen", icon: LayoutDashboard },
  { id: "datos", label: "Datos y suministro", icon: Home },
  { id: "electrificacion", label: "Electrificación", icon: Gauge },
  { id: "circuitos", label: "Circuitos", icon: CircuitBoard },
  { id: "calculos", label: "Cálculos eléctricos", icon: Calculator },
  { id: "cuadro", label: "Cuadro y protecciones", icon: ShieldCheck },
  { id: "tierra", label: "Puesta a tierra", icon: Landmark },
  { id: "presupuesto", label: "Presupuesto", icon: Receipt },
  { id: "validacion", label: "Detector de errores", icon: ShieldAlert },
  { id: "memoria", label: "Memoria técnica", icon: FileText },
];

const TITULOS: Record<SeccionId, { titulo: string; eyebrow: string }> = {
  resumen: { titulo: "Resumen de la instalación", eyebrow: "Tu instalación" },
  datos: { titulo: "Datos y suministro", eyebrow: "La instalación" },
  electrificacion: { titulo: "Grado de electrificación", eyebrow: "Asistente ITC-BT-25" },
  circuitos: { titulo: "Circuitos", eyebrow: "Configurador" },
  calculos: { titulo: "Cálculos eléctricos", eyebrow: "Motor de cálculo" },
  cuadro: { titulo: "Cuadro y protecciones", eyebrow: "Cuadro eléctrico" },
  tierra: { titulo: "Puesta a tierra", eyebrow: "ITC-BT-18" },
  presupuesto: { titulo: "Presupuesto", eyebrow: "Estimación económica" },
  validacion: { titulo: "Detector de errores", eyebrow: "Cumplimiento REBT" },
  memoria: { titulo: "Memoria técnica", eyebrow: "El documento" },
};

export default function ProjectEditor() {
  const { id } = useParams<{ id: string }>();
  const projectId = id as Id<"projects">;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useQuery(api.projects.get, { id: projectId });
  const updateMutation = useMutation(api.projects.update);

  const seccionParam = searchParams.get("seccion") as SeccionId | null;
  const seccion: SeccionId =
    seccionParam && TITULOS[seccionParam] ? seccionParam : "resumen";

  const [draft, setDraft] = useState<Proyecto | null>(null);
  const [guardado, setGuardado] = useState<"guardado" | "guardando" | "error">(
    "guardado",
  );
  const [editingCircuitId, setEditingCircuitId] = useState<string | null>(null);
  const [highlightCampo, setHighlightCampo] = useState<string | undefined>();

  const loaded = useRef<string | null>(null);
  const dirty = useRef(false);

  useEffect(() => {
    if (data && data._id === projectId && loaded.current !== projectId) {
      setDraft(normalizarProyecto(data.data as Proyecto));
      loaded.current = projectId;
    }
  }, [data, projectId]);

  useEffect(() => {
    if (!draft || !dirty.current) return;
    setGuardado("guardando");
    const timer = setTimeout(async () => {
      try {
        await updateMutation({ id: projectId, data: draft });
        setGuardado("guardado");
      } catch {
        setGuardado("error");
        toast.error("No se pudo guardar la instalación.");
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [draft, projectId, updateMutation]);

  const update = (patch: Partial<Proyecto>) => {
    dirty.current = true;
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  /** Guarda lo pendiente antes de abrir el documento para no emitir datos antiguos. */
  const irAMemoria = async () => {
    if (!draft) return;
    if (dirty.current) {
      try {
        await updateMutation({ id: projectId, data: draft });
        dirty.current = false;
        setGuardado("guardado");
      } catch {
        toast.error("No se pudo guardar antes de generar la memoria.");
        return;
      }
    }
    navigate(`/projects/${projectId}/memoria`);
  };

  const resultado = useMemo(
    () => (draft ? calcularProyecto(draft) : null),
    [draft],
  );
  const hallazgos = useMemo(
    () => (draft && resultado ? analizarProyecto(draft, resultado) : []),
    [draft, resultado],
  );
  const resumen = resumenHallazgos(hallazgos);

  const irA = (
    destino: SeccionId,
    opts?: { circuitoId?: string; campo?: string },
  ) => {
    setSearchParams({ seccion: destino });
    setHighlightCampo(opts?.campo);
    setEditingCircuitId(opts?.circuitoId ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!highlightCampo) return;
    const timer = setTimeout(() => {
      const selector = `[data-campo="${CSS.escape(highlightCampo)}"]`;
      const el = document.querySelector(selector);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const field = el.querySelector(
        "input:not([type=hidden]), select, textarea",
      ) as HTMLElement | null;
      field?.focus({ preventScroll: true });
    }, 260);
    return () => clearTimeout(timer);
  }, [highlightCampo, seccion, editingCircuitId]);

  const navItems: NavItem[] = SECCIONES.map((s) =>
    s.id === "validacion"
      ? {
          ...s,
          badge:
            resumen.criticos + resumen.incumplimientos + resumen.pendientes,
          badgeTone: "error" as const,
        }
      : s,
  );

  if (data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data === null || !draft || !resultado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-[17px] font-semibold">Instalación no disponible</p>
        <p className="max-w-sm text-[13.5px] text-muted-foreground">
          La instalación no existe o pertenece a otra cuenta. Vuelve a tu lista
          de instalaciones para continuar.
        </p>
        <Button onClick={() => navigate("/projects")}>
          Volver a instalaciones
        </Button>
      </div>
    );
  }

  const meta = TITULOS[seccion];

  return (
    <AppShell
      navItems={navItems}
      active={seccion}
      navLabel="Instalación"
      onNavigate={(destino) => irA(destino as SeccionId)}
      eyebrow={meta.eyebrow}
      title={meta.titulo}
      subtitle={draft.nombre}
      actions={
        <>
          <span className="hidden items-center gap-1.5 text-[11.5px] text-muted-foreground sm:inline-flex">
            <span
              className={cn(
                "size-1.5 rounded-full",
                guardado === "guardado"
                  ? "bg-[oklch(0.62_0.12_155)]"
                  : guardado === "guardando"
                    ? "bg-accent"
                    : "bg-destructive",
              )}
            />
            {guardado === "guardado"
              ? "Todo guardado"
              : guardado === "guardando"
                ? "Guardando…"
                : "Sin guardar"}
          </span>
          <Button size="sm" className="gap-1.5" onClick={irAMemoria}>
            <FileText className="size-3.5" />
            <span className="hidden sm:inline">Memoria</span> PDF
          </Button>
        </>
      }
    >
      <div className="project-workspace mx-auto w-full max-w-6xl">
        {seccion === "resumen" && (
          <ResumenPanel
            proyecto={draft}
            resultado={resultado}
            hallazgos={hallazgos}
            onIr={irA}
            onMemoria={irAMemoria}
          />
        )}

        {seccion === "datos" && (
          <DatosPanel
            proyecto={draft}
            update={update}
            highlightCampo={highlightCampo}
          />
        )}

        {seccion === "electrificacion" && (
          <ElectrificacionPanel
            proyecto={draft}
            update={update}
            resultado={resultado}
            highlightCampo={highlightCampo}
          />
        )}

        {seccion === "circuitos" && (
          <CircuitosPanel
            proyecto={draft}
            update={update}
            resultado={resultado}
            editingId={editingCircuitId}
            onEditingChange={setEditingCircuitId}
            highlightCampo={highlightCampo}
            onNavigate={() => {
              setHighlightCampo(undefined);
            }}
          />
        )}

        {seccion === "calculos" && (
          <CalculosPanel
            proyecto={draft}
            update={update}
            resultado={resultado}
          />
        )}

        {seccion === "cuadro" && (
          <CuadroPanel
            proyecto={draft}
            update={update}
            resultado={resultado}
            highlightCampo={highlightCampo}
          />
        )}

        {seccion === "tierra" && (
          <TierraPanel
            proyecto={draft}
            update={update}
            resultado={resultado}
            highlightCampo={highlightCampo}
          />
        )}

        {seccion === "presupuesto" && (
          <PresupuestoPanel
            proyecto={draft}
            update={update}
            resultado={resultado}
            onIrAProtecciones={() => irA("cuadro", { campo: "sobretensiones" })}
          />
        )}

        {seccion === "validacion" && (
          <ValidacionPanel hallazgos={hallazgos} onIr={irA} />
        )}

        {seccion === "memoria" && (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="surface-card p-6">
              <p className="eyebrow">Documento</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-tight">
                Memoria técnica de diseño
              </h2>
              <p className="mt-1 text-[13.5px] text-muted-foreground">
                El manual de la instalación, en A4 y listo para entregar.
              </p>
              <p className="mt-3 text-[14px] leading-6 text-muted-foreground">
                Documento A4 con la identificación del titular, la normativa
                aplicada, el grado de electrificación, la previsión de cargas, los
                circuitos, los cálculos de intensidades y secciones, las caídas de
                tensión, las protecciones, la puesta a tierra, el esquema del
                cuadro, las verificaciones y los datos pendientes.
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  "24 apartados técnicos",
                  "Tablas de cálculo por circuito",
                  "Hipótesis y referencias normativas",
                  "Esquema unifilar del cuadro",
                  "Relación de conductores y tubos",
                  "Declaración de datos pendientes",
                ].map((x) => (
                  <p
                    key={x}
                    className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-[12.5px]"
                  >
                    <FileText className="size-3.5 text-primary" />
                    {x}
                  </p>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button className="gap-2" onClick={irAMemoria}>
                  <FileText className="size-4" />
                  Ver y descargar el PDF
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => irA("validacion")}
                >
                  <ShieldAlert className="size-4" />
                  Revisar incidencias ({resumen.total})
                </Button>
              </div>
            </section>

            <section className="surface-card p-6">
              <h3 className="text-[14.5px] font-semibold">Antes de emitir</h3>
              <ul className="mt-3 space-y-2.5 text-[12.5px] leading-5 text-muted-foreground">
                <li className="flex gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  {resumen.criticos === 0 && resumen.incumplimientos === 0
                    ? "No existen errores críticos ni incumplimientos."
                    : `Quedan ${resumen.criticos + resumen.incumplimientos} incumplimientos por resolver; la memoria los declarará expresamente.`}
                </li>
                <li className="flex gap-2">
                  <Landmark className="mt-0.5 size-4 shrink-0 text-primary" />
                  {resultado.tierra.resistenciaVerificada !== null
                    ? "Resistencia de tierra medida e incorporada a la instalación."
                    : "La resistencia de tierra aún no está medida: la memoria lo indicará como dato pendiente."}
                </li>
                <li className="flex gap-2">
                  <Upload className="mt-0.5 size-4 shrink-0 text-primary" />
                  El PDF se genera con la impresión del navegador (Guardar como
                  PDF) y conserva el formato A4.
                </li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
}
