import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none absolute inset-0 blueprint opacity-60" />
      <header className="relative border-b border-border/60">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-5">
          <Brand tone="dark" subtitle="Cálculo y memoria REBT" />
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 py-16">
        <div className="max-w-md text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Error 404
          </p>
          <h1 className="mt-3 text-[32px] font-semibold tracking-tight">
            Esta página no existe
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
            El enlace puede haber cambiado o el proyecto ya no está disponible.
            Vuelve al espacio de trabajo para continuar con tus instalaciones.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild className="gap-2">
              <Link to="/projects">
                <ArrowLeft className="size-4" />
                Ir a mis proyectos
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
