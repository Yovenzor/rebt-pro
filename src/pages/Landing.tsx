import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Cable,
  Calculator,
  Check,
  CircuitBoard,
  FileDown,
  FileText,
  Gauge,
  Landmark,
  Ruler,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link } from "react-router";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

const circuitosDemo = [
  { codigo: "C1", nombre: "Iluminación", p: "1.500 W", pia: "10 A", s: "1,5", du: "1,81 %" },
  { codigo: "C2", nombre: "Tomas generales", p: "3.000 W", pia: "16 A", s: "2,5", du: "1,74 %" },
  { codigo: "C3", nombre: "Cocina y horno", p: "5.400 W", pia: "25 A", s: "6", du: "1,13 %" },
  { codigo: "C4", nombre: "Lavadora y termo", p: "3.450 W", pia: "20 A", s: "4", du: "1,36 %" },
  { codigo: "C5", nombre: "Baño y auxiliares", p: "3.450 W", pia: "16 A", s: "2,5", du: "1,74 %" },
];

const pasos = [
  {
    n: "01",
    titulo: "Cuéntanos la vivienda",
    texto:
      "Superficie, estancias, suministro y receptores. La app deduce el grado de electrificación y la potencia mínima que exige la ITC-BT-25.",
    icon: Ruler,
    tone: "teal",
  },
  {
    n: "02",
    titulo: "Diseña los circuitos",
    texto:
      "Parte de los circuitos C1 a C12, añade receptores especiales y ajusta lo que necesites. Las secciones y protecciones se recalculan solas.",
    icon: CircuitBoard,
    tone: "copper",
  },
  {
    n: "03",
    titulo: "Revisa sin sorpresas",
    texto:
      "El detector te dice qué falla, con qué norma choca y cómo arreglarlo. «IR AL ERROR» te deja delante del campo exacto.",
    icon: ShieldCheck,
    tone: "green",
  },
  {
    n: "04",
    titulo: "Descarga el PDF",
    texto:
      "Memoria A4 con datos, fórmulas, tablas, protecciones, puesta a tierra y esquema del cuadro. Lista para imprimir o archivar.",
    icon: FileDown,
    tone: "blue",
  },
];

const funcionalidades = [
  {
    icon: Gauge,
    tono: "teal",
    titulo: "Grado de electrificación, resuelto",
    texto:
      "Básica o elevada según la ITC-BT-25, con los motivos a la vista. Nada de un número suelto que no puedas explicar.",
  },
  {
    icon: Calculator,
    tono: "copper",
    titulo: "Cálculos que puedes defender",
    texto:
      "Fórmulas, tablas y factores de corrección. Todo lo necesario para justificar una sección delante de un cliente o una inspección.",
  },
  {
    icon: AlertTriangle,
    tono: "clay",
    titulo: "Errores con botón de arreglo",
    texto:
      "Cada incidencia indica norma, valor actual y solución. Pulsa «IR AL ERROR» y el proyecto te lleva al dato que la provoca.",
  },
  {
    icon: Cable,
    tono: "green",
    titulo: "Cables y tubos, coordinados",
    texto:
      "Fase, neutro y conductor de protección según la tabla 2 de la ITC-BT-19, con sección comercial y diámetro de tubo.",
  },
  {
    icon: Zap,
    tono: "olive",
    titulo: "Cuadro y protecciones",
    texto:
      "IGA, diferenciales de 30 mA y magnetotérmicos que encajan con el cable. Con el máximo de cinco circuitos por diferencial.",
  },
  {
    icon: Landmark,
    tono: "blue",
    titulo: "Tierra y documento final",
    texto:
      "Resistencia estimada o medida, coordinación R ≤ 50/IΔn y una memoria que declara sus hipótesis y sus datos pendientes.",
  },
];

const tonos: Record<string, string> = {
  teal: "bg-[#e4f1f0] text-[#1d5b5d]",
  copper: "bg-[#fbefdf] text-[#8a5a1f]",
  green: "bg-[#e7f4ec] text-[#23684a]",
  blue: "bg-[#e8eef8] text-[#345783]",
  clay: "bg-[#f9e9e3] text-[#9d4830]",
  olive: "bg-[#f1f1e0] text-[#5c602e]",
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Barra de color de marca */}
      <div className="h-[3px] bg-gradient-to-r from-primary via-accent to-[#7fae8e]" />

      {/* Barra superior */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Brand tone="dark" subtitle="Documentación REBT" />
          <nav className="hidden items-center gap-7 text-[13px] text-muted-foreground md:flex">
            <a href="#como-funciona" className="transition-colors hover:text-foreground">
              Cómo funciona
            </a>
            <a href="#calculos" className="transition-colors hover:text-foreground">
              Los cálculos
            </a>
            <a href="#para-quien" className="transition-colors hover:text-foreground">
              Para quién
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth?returnTo=/projects">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/auth?returnTo=/projects">
                Crear mi memoria
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 blueprint opacity-[0.55]" />
        <div className="pointer-events-none absolute -right-40 -top-32 size-[520px] rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-48 size-[440px] rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent" />
              Documentación REBT · para instaladores
            </span>

            <h1 className="mt-6 text-balance text-[2.4rem] font-semibold leading-[1.04] tracking-tight sm:text-[3.6rem]">
              La documentación de la instalación, calculada y{" "}
              <span className="relative inline-block whitespace-nowrap px-1">
                <span className="absolute inset-x-0 bottom-[0.14em] h-[0.28em] -rotate-1 rounded-sm bg-accent/60" />
                <span className="relative dark:text-accent-foreground">en PDF</span>
              </span>
              .
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground">
              REBT Pro convierte los datos de una vivienda en la memoria técnica
              completa: circuitos, secciones, protecciones, puesta a tierra y
              esquemas. Tú decides; la app hace las cuentas.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth?returnTo=/projects">
                  Crear mi memoria
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <a href="#calculos">Ver un cálculo real</a>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-muted-foreground">
              {[
                "Funciona en el navegador",
                "Cada cifra, con su norma",
                "A4 listo para imprimir",
              ].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Tarjeta de producto */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-3 rounded-[26px] bg-gradient-to-br from-primary/15 via-transparent to-accent/25 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[0_40px_80px_-40px_rgba(15,32,45,0.55)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div className="flex items-center gap-2 text-[11px] text-white/50">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Todo guardado
                </div>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">
                  Proyecto de ejemplo
                </span>
              </div>

              <div className="px-5 py-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
                  Vivienda unifamiliar · 120 m²
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2.5">
                  {[
                    { k: "Potencia prevista", v: "5.750", u: "W" },
                    { k: "IGA", v: "25", u: "A" },
                    { k: "ΔU máx.", v: "1,81", u: "%" },
                  ].map((m) => (
                    <div key={m.k} className="rounded-lg bg-white/[0.055] px-3 py-2.5">
                      <p className="text-[9.5px] uppercase tracking-wider text-white/35">
                        {m.k}
                      </p>
                      <p className="mt-1 text-lg font-semibold tabular-nums text-white">
                        {m.v}
                        <span className="ml-1 text-[10px] font-normal text-white/40">
                          {m.u}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 overflow-hidden rounded-lg border border-white/10">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-white/[0.04] text-[9px] uppercase tracking-wider text-white/35">
                        <th className="px-3 py-2 text-left font-medium">Circuito</th>
                        <th className="px-2 py-2 text-right font-medium">P</th>
                        <th className="px-2 py-2 text-right font-medium">PIA</th>
                        <th className="px-2 py-2 text-right font-medium">S</th>
                        <th className="px-3 py-2 text-right font-medium">ΔU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {circuitosDemo.map((c) => (
                        <tr key={c.codigo} className="border-t border-white/[0.07]">
                          <td className="px-3 py-[7px]">
                            <span className="mr-2 inline-flex min-w-6 justify-center rounded bg-white/10 px-1 py-0.5 text-[9px] font-semibold text-white/70">
                              {c.codigo}
                            </span>
                            <span className="text-white/80">{c.nombre}</span>
                          </td>
                          <td className="px-2 py-[7px] text-right tabular-nums text-white/55">
                            {c.p}
                          </td>
                          <td className="px-2 py-[7px] text-right tabular-nums text-white/55">
                            {c.pia}
                          </td>
                          <td className="px-2 py-[7px] text-right tabular-nums text-white/80">
                            {c.s} mm²
                          </td>
                          <td className="px-3 py-[7px] text-right tabular-nums text-emerald-300/90">
                            {c.du}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-2.5">
                  <span className="flex items-center gap-2 text-[11px] text-emerald-200/90">
                    <ShieldCheck className="size-3.5" />
                    Coordinación y caídas conformes
                  </span>
                  <span className="text-[10px] text-emerald-200/60">ITC-BT-25</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Normativa */}
      <section className="border-b border-border/60 bg-card/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow shrink-0">Las tablas oficiales, ya cargadas</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-muted-foreground">
            {[
              ["bg-primary", "ITC-BT-19 · intensidades"],
              ["bg-accent", "ITC-BT-25 · circuitos"],
              ["bg-[#7fae8e]", "ITC-BT-18 · tierra"],
              ["bg-[#8fa7c4]", "Guía técnica del REBT"],
            ].map(([color, texto]) => (
              <span key={texto} className="inline-flex items-center gap-2">
                <span className={`size-1.5 rounded-full ${color}`} />
                {texto}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto w-full max-w-6xl px-5 py-20">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="eyebrow">Del dato al documento</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">
            Cuatro pasos y un PDF.
          </h2>
          <p className="mt-3 text-[14.5px] leading-7 text-muted-foreground">
            Todo vive en el mismo proyecto: si cambias una potencia, se
            actualizan la sección, la protección, la caída de tensión y el
            documento. Sin copiar cifras de una hoja a otra.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pasos.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.06 }}
                className="surface-card group relative p-5 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex size-9 items-center justify-center rounded-lg ${tonos[p.tone]}`}
                  >
                    <Icon className="size-[17px]" />
                  </span>
                  <span className="text-[12px] font-semibold tabular-nums text-muted-foreground/40">
                    {p.n}
                  </span>
                </div>
                <h3 className="mt-4 text-[14.5px] font-semibold">{p.titulo}</h3>
                <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">
                  {p.texto}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Cálculo real */}
      <section id="calculos" className="border-y border-border/60 bg-card/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <motion.div {...fadeUp}>
            <p className="eyebrow">Trazabilidad</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.15rem]">
              Cada cifra, explicada.
            </h2>
            <p className="mt-4 text-[14.5px] leading-7 text-muted-foreground">
              Nada de resultados que aparecen por arte de magia. La memoria
              reproduce la fórmula, los valores de partida y el criterio de la
              instrucción técnica que la respalda.
            </p>
            <ul className="mt-6 space-y-3 text-[13px]">
              {[
                "Intensidad: I = P / (U · cos φ · η) y I = P / (√3 · U · cos φ · η).",
                "Sección por caída: ΔU = 2·L·I·cos φ / (γ·S), con γ = 48 m/(Ω·mm²).",
                "Corrección por temperatura y agrupamiento sobre la tabla 1.",
                "Conductor de protección según la tabla 2 de la ITC-BT-19.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeUp} className="surface-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-[#7fae8e]" />
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                C2 · Tomas de uso general
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Ejemplo comprobado
              </span>
            </div>
            <div className="divide-y divide-border/70">
              {[
                ["Potencia prevista", "3.450 W"],
                ["Longitud del recorrido", "30 m"],
                ["Instalación", "B1 · tubo empotrado · PVC"],
                ["Intensidad de diseño", "15,0 A"],
                ["Calibre adoptado", "16 A (ITC-BT-25)"],
                ["Sección por intensidad", "2,5 mm²"],
                ["Sección por caída (3 %)", "4 mm²"],
                ["Caída de tensión", "5,00 V · 2,17 %"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-6 px-5 py-2.5">
                  <span className="text-[12.5px] text-muted-foreground">{k}</span>
                  <span className="text-right text-[12.5px] font-medium tabular-nums">
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2.5 bg-primary/[0.04] px-5 py-3.5">
              <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-[11.5px] leading-5 text-muted-foreground">
                Mismo resultado que el ejemplo de la Guía Técnica de Aplicación
                del REBT (Anexo 2) para este circuito.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="eyebrow">Sin adornos</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">
            Lo que de verdad se usa en obra.
          </h2>
          <p className="mt-3 text-[14.5px] leading-7 text-muted-foreground">
            Las herramientas que hacen falta para cerrar una instalación de
            vivienda, con la precisión que exige el reglamento.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {funcionalidades.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.titulo}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="surface-card group p-5 transition-transform duration-300 hover:-translate-y-0.5"
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-xl ${tonos[f.tono]}`}
                >
                  <Icon className="size-[18px]" />
                </span>
                <h3 className="mt-4 text-[14px] font-semibold">{f.titulo}</h3>
                <p className="mt-1.5 text-[12.5px] leading-6 text-muted-foreground">
                  {f.texto}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Para quién */}
      <section id="para-quien" className="border-t border-border/60 bg-card/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Para quién es</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-[1.9rem]">
              Para quien instala y para quien firma.
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
              Vivienda nueva, reforma con boletín o ampliación de potencia. La
              memoria recoge el grado de electrificación, la previsión de cargas,
              los circuitos, las protecciones y las verificaciones, sin inventar
              ningún dato que no hayas introducido.
            </p>
            <div className="mt-6 rounded-xl border border-accent/40 bg-accent/[0.08] p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-foreground/80 dark:text-accent/80" />
                <div>
                  <p className="text-[12.5px] font-semibold">
                    Ingeniería, no magia
                  </p>
                  <p className="mt-1 text-[12px] leading-6 text-muted-foreground">
                    REBT Pro calcula y documenta. No sustituye la verificación en
                    obra, las mediciones, los ensayos ni la responsabilidad del
                    instalador habilitado y del técnico competente. Los datos
                    pendientes se muestran como tales.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: CircuitBoard,
                t: "Vivienda nueva",
                d: "Circuitos C1 a C12, grado de electrificación y memoria de diseño.",
                tono: "teal",
              },
              {
                icon: Cable,
                t: "Reforma",
                d: "Estado actual, circuitos nuevos y comprobación de la instalación.",
                tono: "copper",
              },
              {
                icon: Gauge,
                t: "Ampliación de potencia",
                d: "Previsión de cargas, IGA y coordinación con la derivación.",
                tono: "green",
              },
              {
                icon: FileText,
                t: "Documentación",
                d: "Memoria A4 en PDF con tablas, fórmulas y conclusiones.",
                tono: "blue",
              },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.t}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-lg ${tonos[c.tono]}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-3 text-[13px] font-semibold">{c.t}</p>
                  <p className="mt-1 text-[11.5px] leading-5 text-muted-foreground">
                    {c.d}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="relative overflow-hidden rounded-2xl bg-sidebar px-8 py-12 text-sidebar-foreground">
          <div className="absolute inset-0 blueprint-dark opacity-60" />
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-primary">
              Empieza por una vivienda
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.25rem]">
              Esta tarde puedes entregar la memoria.
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-white/55">
              Crea la instalación, revisa los cálculos y descarga el PDF. El
              resto es obra.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/auth?returnTo=/projects">
                  Crear mi memoria
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#como-funciona">Ver el flujo completo</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Brand tone="dark" subtitle="Documentación REBT" />
          <p className="max-w-xl text-[11px] leading-5 text-muted-foreground sm:text-right">
            REBT Pro · Herramienta de cálculo y documentación técnica. La
            normativa estatal se complementa con disposiciones autonómicas y
            requisitos de la distribuidora que deben verificarse en cada
            expediente. No emite certificados oficiales.
          </p>
        </div>
      </footer>
    </div>
  );
}
