import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NumberField, TextField } from "@/components/project/ui";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { fechaCorta } from "@/lib/format";
import { proyectoNuevo } from "@/lib/rebt/data";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Copy,
  FileText,
  FolderOpen,
  House,
  Loader2,
  MapPin,
  Plus,
  Ruler,
  Trash2,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

const navItems: NavItem[] = [
  { id: "proyectos", label: "Instalaciones", icon: FolderOpen },
];

export default function Projects() {
  const { user } = useAuth();
  const projects = useQuery(api.projects.list);
  const create = useMutation(api.projects.create);
  const duplicate = useMutation(api.projects.duplicate);
  const remove = useMutation(api.projects.remove);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [borrar, setBorrar] = useState<Id<"projects"> | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    cliente: "",
    municipio: "",
    superficie: 100,
    tipoVivienda: "Unifamiliar",
  });

  const handleCreate = async () => {
    if (!form.nombre.trim()) {
      toast.error("Indica un nombre para la instalación.");
      return;
    }
    setSaving(true);
    try {
      const data = proyectoNuevo({
        nombre: form.nombre.trim(),
        cliente: form.cliente.trim(),
        municipio: form.municipio.trim(),
        superficie: form.superficie,
        tipoVivienda: form.tipoVivienda,
      });
      const id = await create({ data });
      toast.success("Instalación creada");
      navigate(`/projects/${id}`);
    } catch {
      toast.error("No se pudo crear la instalación. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (id: Id<"projects">) => {
    try {
      await duplicate({ id });
      toast.success("Instalación duplicada");
    } catch {
      toast.error("No se pudo duplicar la instalación.");
    }
  };

  const handleDelete = async () => {
    if (!borrar) return;
    try {
      await remove({ id: borrar });
      toast.success("Instalación eliminada");
    } catch {
      toast.error("No se pudo eliminar la instalación.");
    } finally {
      setBorrar(null);
    }
  };

  const cargando = projects === undefined;

  return (
    <AppShell
      navItems={navItems}
      active="proyectos"
      onNavigate={() => undefined}
      navLabel="Tu espacio de trabajo"
      eyebrow="Documentación REBT"
      title="Tus instalaciones"
      subtitle={
        user?.name
          ? `${user.name} · Documentación REBT de viviendas`
          : "Documentación REBT de tus viviendas"
      }
      actions={
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Nueva instalación
        </Button>
      }
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="surface-card p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Instalaciones
            </p>
            <p className="mt-1.5 text-[24px] font-semibold tabular-nums leading-none">
              {cargando ? "—" : projects.length}
            </p>
          </div>
          <div className="surface-card p-4">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Última edición
            </p>
            <p className="mt-2 text-[13px] font-medium">
              {cargando || projects.length === 0
                ? "—"
                : `${projects[0].nombre} · ${fechaCorta(
                    new Date(projects[0].updatedAt).toISOString(),
                  )}`}
            </p>
          </div>
          <div className="surface-card flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Documento
              </p>
              <p className="mt-1.5 text-[13px] font-medium">
                Memoria y cálculos en PDF
              </p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground dark:text-accent">
              <Zap className="size-4" />
            </span>
          </div>
        </div>

        {cargando ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="surface-card blueprint flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
              <House className="size-6" />
            </span>
            <h2 className="mt-5 text-[18px] font-semibold">
              Tu primera instalación empieza aquí
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-6 text-muted-foreground">
              Crea la instalación, añade los circuitos de la ITC-BT-25 y genera
              la memoria técnica con todos los cálculos.
            </p>
            <Button className="mt-6 gap-1.5" onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              Crear instalación
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {projects.map((p) => (
              <div
                key={p._id}
                className={cn(
                  "surface-card group relative flex flex-col p-5 transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_20px_50px_-34px_oklch(0.24_0.014_250/0.45)]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#e4f1f0] text-[#1d5b5d]">
                      <House className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold leading-5">
                        {p.nombre}
                      </p>
                      <p className="mt-1 truncate text-[12px] text-muted-foreground">
                        {p.cliente || "Cliente sin definir"}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md bg-accent/15 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-accent-foreground dark:text-accent">
                    {p.tipoVivienda || "Vivienda"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[11.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {p.municipio || "Municipio pendiente"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Ruler className="size-3.5" />
                    {p.superficie} m²
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FolderOpen className="size-3.5" />
                    {fechaCorta(new Date(p.updatedAt).toISOString())}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Duplicar"
                      aria-label="Duplicar instalación"
                      onClick={() => handleDuplicate(p._id)}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Eliminar"
                      aria-label="Eliminar instalación"
                      onClick={() => setBorrar(p._id)}
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-primary hover:text-primary"
                      onClick={() => navigate(`/projects/${p._id}`)}
                    >
                      Abrir
                      <ArrowRight className="size-3.5" />
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5"
                    >
                      <Link to={`/projects/${p._id}/memoria`}>
                        <FileText className="size-3.5" />
                        PDF
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva instalación</DialogTitle>
            <DialogDescription>
              Con estos datos ya podemos empezar. El resto se completa dentro de
              la instalación, sin prisa y sin perder nada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <TextField
              label="Nombre de la instalación"
              value={form.nombre}
              onChange={(v) => setForm((f) => ({ ...f, nombre: v }))}
              placeholder="Vivienda unifamiliar · Calle Mayor 12"
              field="nombre"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Cliente"
                value={form.cliente}
                onChange={(v) => setForm((f) => ({ ...f, cliente: v }))}
                placeholder="Nombre y apellidos"
              />
              <TextField
                label="Municipio"
                value={form.municipio}
                onChange={(v) => setForm((f) => ({ ...f, municipio: v }))}
                placeholder="Municipio"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                label="Superficie útil"
                value={form.superficie}
                onChange={(v) => setForm((f) => ({ ...f, superficie: v }))}
                unit="m²"
                min={20}
                max={2000}
              />
              <div className="space-y-1.5">
                <p className="text-[12px] font-medium text-foreground/80">
                  Tipo de vivienda
                </p>
                <div className="flex gap-2">
                  {["Unifamiliar", "Piso"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tipoVivienda: t }))}
                      className={cn(
                        "h-9 flex-1 rounded-lg border text-[12px] transition-colors",
                        form.tipoVivienda === t
                          ? "border-primary/40 bg-primary/8 font-medium text-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <p className="rounded-lg bg-muted/60 px-3 py-2.5 text-[11.5px] leading-5 text-muted-foreground">
              Las viviendas de más de 160 m² se crean ya con electrificación
              elevada y los circuitos C1 a C7 de la ITC-BT-25.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving} className="gap-2">
              {saving && <Loader2 className="size-4 animate-spin" />}
              Crear instalación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={borrar !== null} onOpenChange={() => setBorrar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar la instalación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán la instalación, sus circuitos y la documentación
              asociada. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
