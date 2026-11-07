import { MemoriaDoc } from "@/components/project/MemoriaDoc";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { calcularProyecto } from "@/lib/rebt/engine";
import { analizarProyecto } from "@/lib/rebt/findings";
import type { Proyecto } from "@/lib/rebt/types";
import { useQuery } from "convex/react";
import { ArrowLeft, Download, Info, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";

export default function Memoria() {
  const { id } = useParams<{ id: string }>();
  const projectId = id as Id<"projects">;
  const navigate = useNavigate();
  const data = useQuery(api.projects.get, { id: projectId });

  const proyecto = data?.data as Proyecto | undefined;
  const resultado = useMemo(
    () => (proyecto ? calcularProyecto(proyecto) : null),
    [proyecto],
  );
  const hallazgos = useMemo(
    () => (proyecto && resultado ? analizarProyecto(proyecto, resultado) : []),
    [proyecto, resultado],
  );
  const generado = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    [],
  );

  if (data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!proyecto || !resultado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-[16px] font-semibold">Memoria no disponible</p>
        <p className="max-w-sm text-[12.5px] text-muted-foreground">
          La instalación no existe o no tienes acceso a ella.
        </p>
        <Button onClick={() => navigate("/projects")}>
          Volver a instalaciones
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/60 print:bg-white">
      <header className="no-print sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5">
            <Link to={`/projects/${projectId}`}>
              <ArrowLeft className="size-4" />
              Instalación
            </Link>
          </Button>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-[12.5px] font-semibold">
              Memoria técnica · {proyecto.nombre}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              Vista A4 · {generado}
            </p>
          </div>

          <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Download className="size-4" />
            Descargar PDF
          </Button>
        </div>
      </header>

      <div className="no-print mx-auto flex w-full max-w-5xl items-start gap-2 px-4 pt-4">
        <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <p className="text-[10.5px] leading-4 text-muted-foreground">
          En el diálogo de impresión elige «Guardar como PDF», papel A4 y activa
          «Gráficos de fondo» para conservar las tramas y encabezados del
          documento.
        </p>
      </div>

      <div className="px-2 py-6 sm:px-4 sm:py-8 print:p-0">
        <MemoriaDoc
          proyecto={proyecto}
          resultado={resultado}
          hallazgos={hallazgos}
          generado={generado}
        />
      </div>

      <footer className="no-print mx-auto w-full max-w-5xl px-4 pb-8 text-center">
        <p className="text-[10.5px] leading-4 text-muted-foreground">
          REBT Pro · La memoria se genera con los datos del proyecto y no emite
          certificados oficiales.
        </p>
      </footer>
    </div>
  );
}
