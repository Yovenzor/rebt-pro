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
  Sparkles,
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
    titulo: "Datos de la vivienda",
    texto:
      "Superficie, estancias, suministro y receptores previstos. La app deduce el grado de electrificación y la potencia mínima exigible.",
    icon: Ruler,
  },
  {
    n: "02",
    titulo: "Circuitos y protecciones",
    texto:
      "Parte de los circuitos C1-C12 de la ITC-BT-25 y añade receptores especiales. Cada cambio recalcula secciones, calibres y caídas.",
    icon: CircuitBoard,
  },
  {
    n: "03",
    titulo: "Comprobación normativa",
    texto:
      "El detector revisa coordinación protección-conductor, caídas, diferenciales, agrupaciones y tierra, y te lleva al campo exacto.",
    icon: ShieldCheck,
  },
  {
    n: "04",
    titulo: "Memoria en PDF",
    texto:
      "Documento A4 con datos, fórmulas, tablas de cálculo, esquema del cuadro y conclusiones. Listo para imprimir o archivar.",
    icon: FileDown,
  },
];

const funcionalidades = [
  {
    icon: Gauge,
    titulo: "Grado de electrificación automático",
    texto:
      "Básica 5.750 W o elevada 9.200 W según superficie, calefacción, climatización, automatización y potencia prevista, con los motivos indicados.",
  },
  {
    icon: Calculator,
    titulo: "Cálculos con la fórmula a la vista",
    texto:
      "Intensidad de diseño, sección por intensidad admisible y por caída de tensión, factores de temperatura y agrupamiento. Sin cajas negras.",
  },
  {
    icon: AlertTriangle,
    titulo: "Detector con navegación al error",
    texto:
      "Cada incumplimiento indica norma, valor actual, límite y solución. «IR AL ERROR» abre el circuito y resalta el campo que lo provoca.",
  },
  {
    icon: Cable,
    titulo: "Conductores y canalizaciones",
    texto:
      "Fase, neutro y conductor de protección según ITC-BT-19 tabla 2, con diámetro de tubo y secciones normalizadas.",
  },
  {
    icon: Zap,
    titulo: "Cuadro y protecciones",
    texto:
      "IGA calculado, diferenciales de 30 mA con máximo de cinco circuitos cada uno, magnetotérmicos coordinados con el conductor.",
  },
  {
    icon: Landmark,
    titulo: "Puesta a tierra y memoria",
    texto:
      "Resistencia estimada o medida, coordinación R ≤ 50/IΔn y memoria técnica que declara las hipótesis y los datos pendientes.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Barra superior */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Brand tone="dark" subtitle="Cálculo y memoria REBT" />
          <nav className="hidden items-center gap-7 text-[13px] text-muted-foreground md:flex">
            <a href="#como-funciona" className="transition-colors hover:text-foreground">
              Cómo funciona
            </a>
            <a href="#calculos" className="transition-colors hover:text-foreground">
              Cálculos
            </a>
            <a href="#alcance" className="transition-colors hover:text-foreground">
              Alcance
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/auth?returnTo=/projects">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/auth?returnTo=/projects">
                Crear memoria
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 blueprint opacity-[0.55]" />
        <div className="pointer-events-none absolute -right-40 -top-32 size-[520px] rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-accent-foreground/70" />
              REBT · ITC-BT-19 · ITC-BT-25 · ITC-BT-18
            </span>

            <h1 className="mt-6 text-balance text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-[3.4rem]">
              La memoria técnica de la vivienda,{" "}
              <span className="relative whitespace-nowrap">
                calculada
                <svg
                  className="absolute -bottom-1.5 left-0 h-2 w-full text-accent"
                  viewBox="0 0 200 8"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M1 5.5C45 2.5 120 2 199 4"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              y lista en PDF.
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground">
              REBT Pro es la herramienta de trabajo del instalador: introduces
              los datos de la vivienda, diseña los circuitos y obtienes las
              secciones, las protecciones, las caídas de tensión y la memoria
              técnica completa, con cada resultado trazado a su instrucción
              técnica.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth?returnTo=/projects">
                  Crear mi primera memoria
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <a href="#calculos">Ver un cálculo real</a>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] text-muted-foreground">
              {[
                "Sin instalación",
                "Cálculos auditables",
                "Documento A4 en PDF",
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
            <div className="absolute -inset-3 rounded-[26px] bg-gradient-to-br from-primary/10 via-transparent to-accent/15 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[0_40px_80px_-40px_rgba(15,32,45,0.55)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
                <div className="flex items-center gap-2 text-[11px] text-white/50">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Proyecto guardado
                </div>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/60">
                  Vista de cálculo
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
                  <span className="text-[10px] text-emerald-200/60">
                    ITC-BT-25
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Normativa / confianza */}
      <section className="border-b border-border/60 bg-card/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow shrink-0">Trabaja con las tablas oficiales</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[12px] text-muted-foreground">
            <span>ITC-BT-19 · intensidades admisibles</span>
            <span className="hidden sm:inline text-border">|</span>
            <span>ITC-BT-25 · circuitos de vivienda</span>
            <span className="hidden sm:inline text-border">|</span>
            <span>ITC-BT-18 · puesta a tierra</span>
            <span className="hidden sm:inline text-border">|</span>
            <span>Guía técnica del REBT</span>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto w-full max-w-6xl px-5 py-20">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="eyebrow">Del dato al documento</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.1rem]">
            Cuatro pasos, un único proyecto conectado
          </h2>
          <p className="mt-3 text-[14.5px] leading-7 text-muted-foreground">
            No hay cálculos aislados ni hojas sueltas: todo lo que cambias se
            propaga a los circuitos, al cuadro, al presupuesto de materiales y a
            la memoria.
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
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                    <Icon className="size-[17px]" />
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground/50">
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
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Cada cifra, con su fórmula y su tabla
            </h2>
            <p className="mt-4 text-[14.5px] leading-7 text-muted-foreground">
              El motor no esconde constantes. La memoria reproduce las
              expresiones utilizadas, los valores de entrada y el criterio de la
              instrucción técnica aplicable, para que el cálculo pueda
              revisarse línea a línea.
            </p>
            <ul className="mt-6 space-y-3 text-[13px]">
              {[
                "Intensidad: I = P / (U · cos φ · η) y I = P / (√3 · U · cos φ · η)",
                "Sección por caída: ΔU = 2·L·I·cos φ / (γ·S) con γ = 48 m/(Ω·mm²)",
                "Corrección por temperatura y agrupamiento sobre la tabla 1",
                "Conductor de protección según ITC-BT-19 tabla 2",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...fadeUp} className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                C2 · Tomas de uso general
              </span>
              <span className="rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary">
                Ejemplo verificado
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
                Resultado coherente con el ejemplo de la Guía Técnica de
                Aplicación del REBT (Anexo 2) para el mismo circuito.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20">
        <motion.div {...fadeUp} className="max-w-2xl">
          <p className="eyebrow">Qué incluye</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            Diseñado para firmar, no para impresionar
          </h2>
          <p className="mt-3 text-[14.5px] leading-7 text-muted-foreground">
            Las funciones que un instalador usa de verdad al cerrar una
            instalación de vivienda.
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
                className="surface-card p-5"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
                  <Icon className="size-[17px]" />
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

      {/* Alcance / responsabilidad */}
      <section id="alcance" className="border-t border-border/60 bg-card/50">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Para quién es</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Instaladores eléctricos que entregan documentación
            </h2>
            <p className="mt-4 text-[14px] leading-7 text-muted-foreground">
              Vivienda nueva, reforma con boletín o ampliación de potencia: la
              memoria recoge el grado de electrificación, la previsión de
              cargas, los circuitos, las protecciones y las verificaciones, sin
              inventar ningún dato que no hayas introducido.
            </p>
            <div className="mt-6 rounded-xl border border-accent/30 bg-accent/[0.07] p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-foreground/80" />
                <div>
                  <p className="text-[12.5px] font-semibold">Ingeniería, no magia</p>
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
                d: "Circuitos C1-C12, grado de electrificación y memoria de diseño.",
              },
              {
                icon: Cable,
                t: "Reforma",
                d: "Estado actual, circuitos nuevos y comprobación de la instalación.",
              },
              {
                icon: Gauge,
                t: "Ampliación de potencia",
                d: "Previsión de cargas, IGA y coordinación con la derivación.",
              },
              {
                icon: FileText,
                t: "Documentación",
                d: "Memoria A4 en PDF con tablas, fórmulas y conclusiones.",
              },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.t}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <Icon className="size-4 text-primary" />
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
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sidebar-primary">
              Empieza por una vivienda
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-[2.15rem]">
              Menos hojas de cálculo. Más instalaciones terminadas.
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-white/55">
              Crea el proyecto, carga los circuitos de la ITC-BT-25 y descarga la
              memoria técnica en PDF.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link to="/auth?returnTo=/projects">
                  Entrar y crear el proyecto
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
          <Brand tone="dark" subtitle="Cálculo y memoria REBT" />
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
