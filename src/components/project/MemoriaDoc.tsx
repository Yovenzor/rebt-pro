import { BrandMark } from "@/components/Brand";
import { NORMATIVA, POTENCIA_MINIMA_GRADO, TUBO_POR_SECCION } from "@/lib/rebt/data";
import { potenciaAdmisible } from "@/lib/rebt/engine";
import { fecha, num } from "@/lib/format";
import type { Hallazgo } from "@/lib/rebt/findings";
import { resumenHallazgos } from "@/lib/rebt/findings";
import type { Proyecto, ResultadoProyecto } from "@/lib/rebt/types";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

function Bloque({
  n,
  titulo,
  children,
  className,
  salto,
}: {
  n: string;
  titulo: string;
  children: React.ReactNode;
  className?: string;
  salto?: boolean;
}) {
  return (
    <section
      className={cn("doc-section mt-7 first:mt-0", salto && "doc-page-break", className)}
    >
      <h2 className="mb-2.5 flex items-baseline gap-2 border-b border-[#dfe4e8] pb-1.5 text-[14px] font-semibold text-[#16222c]">
        <span className="text-[11px] font-semibold text-[#7e8b96]">{n}</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Dato({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dotted border-[#e2e7eb] py-[3px]">
      <dt className="text-[#5c6873]">{k}</dt>
      <dd className="text-right font-medium text-[#1d2830]">{v || "—"}</dd>
    </div>
  );
}

function Tick({ ok }: { ok: boolean }) {
  return ok ? (
    <Check className="mx-auto size-3 text-[#1f6b4d]" strokeWidth={3} />
  ) : (
    <X className="mx-auto size-3 text-[#a5322a]" strokeWidth={3} />
  );
}

export function MemoriaDoc({
  proyecto,
  resultado,
  hallazgos,
  generado,
}: {
  proyecto: Proyecto;
  resultado: ResultadoProyecto;
  hallazgos: Hallazgo[];
  generado: string;
}) {
  const resumen = resumenHallazgos(hallazgos);
  const pendientes = hallazgos.filter((h) => h.severidad === "pendiente");
  const incidencias = hallazgos.filter(
    (h) => h.severidad === "critico" || h.severidad === "incumplimiento",
  );
  const e = proyecto.electrificacion;
  const s = proyecto.suministro;
  const t = proyecto.tierra;
  const conSobretensiones = proyecto.protecciones?.sobretensiones ?? true;
  const polosDps = s.fases === 3 ? 4 : 2;
  const tension = s.fases === 3 ? 400 : 230;

  const porSeccion = new Map<number, { circuitos: number; longitud: number }>();
  for (const r of resultado.circuitos) {
    const prev = porSeccion.get(r.seccion) ?? { circuitos: 0, longitud: 0 };
    porSeccion.set(r.seccion, {
      circuitos: prev.circuitos + 1,
      longitud: prev.longitud + r.circuito.longitud,
    });
  }

  const sensibilidades = [
    ...new Set(resultado.diferenciales.map((d) => d.diferencial.sensibilidad)),
  ].sort((a, b) => a - b);
  const sensibilidadTexto = sensibilidades.length
    ? sensibilidades.join(" / ")
    : "—";
  const maxCircuitosDif = Math.max(
    0,
    ...resultado.diferenciales.map((d) => d.circuitos.length),
  );

  const previsiones = [
    e.calefaccion && "Calefacción eléctrica",
    e.climatizacion && "Aire acondicionado",
    e.secadora && "Secadora",
    e.lavavajillas && "Lavavajillas",
    e.cocinaElectrica && "Cocina eléctrica",
    e.horno && "Horno eléctrico",
    e.termoElectrico && "Termo eléctrico",
    e.aerotermia && "Aerotermia",
    e.recargaVE && "Recarga de vehículo eléctrico",
    e.domotica && "Domótica",
    e.piscina && "Piscina",
    e.automatizacion && "Automatización",
    e.otros && `${e.otros} (${e.otrosPotencia} W)`,
  ].filter(Boolean) as string[];

  return (
    <article className="doc-page">
      {/* Aviso previo: ocupa la primera hoja del PDF */}
      <section className="flex min-h-[880px] flex-col">
        <div className="flex items-start justify-between border-b-2 border-[#a5322a] pb-4">
          <div className="flex items-center gap-3">
            <BrandMark tone="ink" className="size-11" />
            <div>
              <p className="text-[15px] font-semibold leading-none text-[#16222c]">
                REBT <span className="font-normal text-[#5c6873]">Pro</span>
              </p>
              <p className="mt-1 text-[8.5px] font-medium uppercase tracking-[0.16em] text-[#7e8b96]">
                Aviso previo al documento
              </p>
            </div>
          </div>
          <div className="text-right text-[8.5px] leading-4 text-[#7e8b96]">
            <p>Expediente</p>
            <p className="font-semibold text-[#1d2830]">
              {proyecto.expediente || "Sin consignar"}
            </p>
          </div>
        </div>

        <div className="my-auto py-10">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-[#a5322a] text-[28px] font-semibold leading-none text-[#a5322a]">
              !
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a5322a]">
              Advertencia importante
            </p>
          </div>

          <h1 className="mt-5 max-w-[580px] text-[32px] font-semibold leading-[1.15] tracking-tight text-[#16222c]">
            Documento generado por inteligencia artificial
          </h1>

          <p className="mt-5 max-w-[610px] text-[13px] leading-6 text-[#3c4852]">
            Esta memoria se ha generado de forma automática con inteligencia
            artificial a partir de los datos introducidos en el proyecto. No ha
            sido revisada ni validada por una persona antes de su emisión.
          </p>

          <p className="mt-4 inline-flex rounded-full border border-[#a5322a]/35 bg-[#fdf6f4] px-3 py-1 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#8f2f27]">
            Solo para fines experimentales
          </p>

          <div className="mt-5 rounded-lg border-2 border-[#a5322a] bg-[#fdf6f4] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f2f27]">
              No confíe en el contenido sin verificarlo
            </p>
            <ul className="mt-3 space-y-2 text-[11.5px] leading-5 text-[#4a3a37]">
              <li>
                Este documento es solo para fines experimentales y no debe
                utilizarse en una instalación real.
              </li>
              <li>
                Puede contener errores de cálculo, datos incompletos, omisiones
                o interpretaciones normativas incorrectas.
              </li>
              <li>
                No sustituye la revisión, las mediciones, los ensayos ni la firma
                de un técnico competente.
              </li>
              <li>
                No es un certificado oficial ni garantiza el cumplimiento del
                REBT ni de la normativa autonómica aplicable.
              </li>
              <li>
                Antes de utilizarlo, compruebe los datos de partida, potencias,
                secciones, caídas de tensión, protecciones, puesta a tierra y
                requisitos de la distribuidora.
              </li>
            </ul>
          </div>

          <p className="mt-5 max-w-[610px] text-[11px] font-medium leading-5 text-[#6b2d27]">
            Si detecta cualquier discrepancia o no puede verificar un dato, no
            utilice este documento para ejecutar la instalación ni para tomar
            decisiones de seguridad.
          </p>
        </div>

        <div className="border-t border-[#dfe4e8] pt-4 text-[9px] leading-4 text-[#7e8b96]">
          <p className="font-semibold uppercase tracking-[0.14em] text-[#5c6873]">
            Este aviso afecta a todas las páginas del documento
          </p>
          <p className="mt-1">
            Instalación: {proyecto.nombre || "Sin nombre"} · Fecha de generación:{" "}
            {generado}
          </p>
          <p className="mt-1">
            Las páginas siguientes contienen la memoria técnica y deben leerse
            junto con esta advertencia.
          </p>
        </div>
      </section>

      {/* Portada: comienza en la segunda hoja */}
      <header className="doc-page-break flex min-h-[880px] flex-col">
        <div className="flex items-start justify-between border-b-2 border-[#16222c] pb-4">
          <div className="flex items-center gap-3">
            <BrandMark tone="ink" className="size-11" />
            <div>
              <p className="text-[15px] font-semibold leading-none text-[#16222c]">
                REBT <span className="font-normal text-[#5c6873]">Pro</span>
              </p>
              <p className="mt-1 text-[8.5px] font-medium uppercase tracking-[0.16em] text-[#7e8b96]">
                Ingeniería eléctrica · Baja tensión
              </p>
            </div>
          </div>
          <div className="text-right text-[8.5px] leading-4 text-[#7e8b96]">
            <p>Expediente</p>
            <p className="font-semibold text-[#1d2830]">
              {proyecto.expediente || "Sin consignar"}
            </p>
          </div>
        </div>

        <div className="mt-[110px]">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#7e8b96]">
            Documentación técnica · ITC-BT-25
          </p>
          <h1 className="mt-3 max-w-[540px] text-[34px] font-semibold leading-[1.1] tracking-tight text-[#16222c]">
            Memoria técnica de diseño de instalación eléctrica de vivienda
          </h1>
          <p className="mt-5 max-w-[480px] text-[12.5px] leading-6 text-[#5c6873]">
            Cálculo de circuitos, previsión de cargas, protecciones, caídas de
            tensión y puesta a tierra conforme al Reglamento Electrotécnico para
            Baja Tensión.
          </p>
        </div>

        <div className="mt-12 rounded-lg border border-[#d9e0e5] bg-[#f7f9fa] p-5">
          <div className="grid gap-x-8 gap-y-3 text-[11px] sm:grid-cols-2">
            <div>
              <p className="text-[8px] uppercase tracking-[0.14em] text-[#7e8b96]">
                Instalación
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[#16222c]">
                {proyecto.nombre || "Instalación sin nombre"}
              </p>
            </div>
            <div>
              <p className="text-[8px] uppercase tracking-[0.14em] text-[#7e8b96]">
                Titular
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[#16222c]">
                {proyecto.cliente || "Pendiente de completar"}
              </p>
            </div>
            <div>
              <p className="text-[8px] uppercase tracking-[0.14em] text-[#7e8b96]">
                Emplazamiento
              </p>
              <p className="mt-1 text-[11px] leading-4">
                {[proyecto.direccion, proyecto.cp, proyecto.municipio, proyecto.provincia]
                  .filter(Boolean)
                  .join(", ") || "Pendiente de completar"}
              </p>
            </div>
            <div>
              <p className="text-[8px] uppercase tracking-[0.14em] text-[#7e8b96]">
                Grado de electrificación
              </p>
              <p className="mt-1 text-[11px] leading-4 capitalize">
                {resultado.gradoCalculado} ·{" "}
                {num(POTENCIA_MINIMA_GRADO[resultado.gradoCalculado])} W mínimo
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-4 border-t border-[#dfe4e8] pt-5 text-[10px]">
          <div>
            <p className="text-[8px] uppercase tracking-[0.14em] text-[#7e8b96]">
              Técnico responsable
            </p>
            <p className="mt-1 font-medium">{proyecto.tecnico || "Pendiente de completar"}</p>
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-[0.14em] text-[#7e8b96]">
              Empresa instaladora
            </p>
            <p className="mt-1 font-medium">{proyecto.empresa || "Pendiente de completar"}</p>
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-[0.14em] text-[#7e8b96]">
              Fecha del proyecto
            </p>
            <p className="mt-1 font-medium">{proyecto.fecha ? fecha(proyecto.fecha) : "—"}</p>
          </div>
        </div>
      </header>

      {/* Índice */}
      <div className="doc-page-break">
        <h2 className="border-b-2 border-[#16222c] pb-2 text-[16px] font-semibold">
          Índice del documento
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-x-10 gap-y-1.5 text-[10.5px]">
          {[
            "1. Datos del titular y de la instalación",
            "2. Objeto y alcance",
            "3. Normativa aplicada",
            "4. Descripción de la vivienda",
            "5. Grado de electrificación",
            "6. Previsión de cargas y potencia",
            "7. Características del suministro",
            "8. Derivación individual",
            "9. Cuadro general de mando y protección",
            "10. Circuitos de utilización",
            "11. Cálculo de intensidades",
            "12. Cálculo de secciones",
            "13. Caídas de tensión",
            "14. Protecciones y coordinación",
            "15. Cortocircuito y poder de corte",
            "16. Puesta a tierra",
            "17. Canalizaciones y conductores",
            "18. Protección contra contactos",
            "19. Protección contra sobretensiones",
            "20. Esquema unifilar del cuadro",
            "21. Verificaciones realizadas",
            "22. Relación de conductores y tubos",
            "23. Datos pendientes",
            "24. Conclusiones y firma",
          ].map((x, i) => (
            <p key={x} className="flex gap-2 text-[#3c4852]">
              <span className="tabular-nums text-[#9aa6af]">
                {String(i + 1).padStart(2, "0")}
              </span>
              {x.replace(/^\d+\.\s/, "")}
            </p>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-[#f0d9b8] bg-[#fdf8f0] px-4 py-3 text-[9.5px] leading-5 text-[#6b5327]">
          <p className="font-semibold uppercase tracking-wider">
            Documento de apoyo técnico
          </p>
          <p className="mt-1">
            Esta memoria ha sido generada a partir de los datos introducidos por
            el usuario y de los cálculos reproducidos en el documento. No
            constituye por sí misma un certificado oficial ni sustituye las
            verificaciones, mediciones y ensayos que debe realizar el instalador
            habilitado, ni la firma del técnico competente cuando sea exigible.
            Las particularidades autonómicas y los requisitos de la empresa
            distribuidora deben verificarse para cada expediente.
          </p>
        </div>

        <div className="mt-6 border-t border-[#dfe4e8] pt-3 text-[9px] leading-4 text-[#7e8b96]">
          <p>
            Normativa de referencia: Real Decreto 842/2002 (REBT) y sus
            Instrucciones Técnicas Complementarias, guías técnicas de aplicación
            y normas UNE citadas. Documento generado el {generado}.
          </p>
        </div>
      </div>

      <Bloque n="1" titulo="Datos del titular y de la instalación" salto>
        <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
          <dl className="text-[10.5px]">
            <Dato k="Titular" v={proyecto.cliente} />
            <Dato k="DNI / NIF" v={proyecto.nif || "No consignado"} />
            <Dato
              k="Dirección"
              v={[proyecto.direccion, proyecto.cp].filter(Boolean).join(", ")}
            />
            <Dato k="Municipio" v={proyecto.municipio} />
          </dl>
          <dl className="text-[10.5px]">
            <Dato k="Provincia" v={proyecto.provincia} />
            <Dato k="Comunidad autónoma" v={proyecto.comunidad} />
            <Dato k="Tipo de vivienda" v={proyecto.tipoVivienda} />
            <Dato
              k="Actuación"
              v={proyecto.tipoInstalacion === "nueva" ? "Instalación nueva" : "Reforma"}
            />
          </dl>
        </div>
        <div className="mt-3 grid gap-x-8 gap-y-0 sm:grid-cols-2">
          <dl className="text-[10.5px]">
            <Dato k="Superficie útil" v={`${proyecto.superficie} m²`} />
            <Dato k="Habitaciones / baños" v={`${proyecto.habitaciones} / ${proyecto.banos}`} />
            <Dato k="Plantas" v={proyecto.plantas} />
          </dl>
          <dl className="text-[10.5px]">
            <Dato k="Año de construcción" v={proyecto.anio ?? "No consta"} />
            <Dato k="Técnico responsable" v={proyecto.tecnico} />
            <Dato k="Empresa instaladora" v={proyecto.empresa} />
          </dl>
        </div>
      </Bloque>

      <Bloque n="2" titulo="Objeto y alcance">
        <p className="text-[10.5px] leading-5 text-[#3c4852]">
          La presente memoria tiene por objeto el diseño y la justificación
          técnica de la instalación eléctrica de baja tensión de la vivienda
          descrita, con arreglo al Reglamento Electrotécnico para Baja Tensión
          (RD 842/2002) y a sus Instrucciones Técnicas Complementarias. Se
          documentan la previsión de cargas, los circuitos de utilización, las
          secciones de los conductores, las caídas de tensión, las protecciones
          del cuadro general y la puesta a tierra.
        </p>
        <p className="mt-2 text-[10.5px] leading-5 text-[#3c4852]">
          El alcance se limita a la instalación interior de la vivienda y a los
          datos de suministro consignados. No se incluyen el proyecto de la
          acometida ni las instalaciones de enlace comunes del edificio, que
          serán objeto de su documentación específica.
        </p>
        <p className="mt-2 text-[10.5px] leading-5 text-[#3c4852]">
          El documento se emite como memoria técnica de diseño (MTD). La
          exigencia de un proyecto eléctrico completo, con visado y dirección
          facultativa, depende de la potencia prevista, del uso y de la
          reglamentación de la comunidad autónoma aplicable; dicha exigencia
          debe confirmarse antes de la presentación del expediente.
        </p>
      </Bloque>

      <Bloque n="3" titulo="Normativa aplicada">
        <table className="doc-table">
          <thead>
            <tr>
              <th className="w-[110px]">Referencia</th>
              <th>Denominación</th>
              <th>Uso en este documento</th>
            </tr>
          </thead>
          <tbody>
            {NORMATIVA.filter(
              (n) => n.ref !== "ITC-BT-52" || e.recargaVE,
            ).map((n) => (
              <tr key={n.ref}>
                <td className="font-medium whitespace-nowrap">{n.ref}</td>
                <td>{n.titulo}</td>
                <td className="text-[#5c6873]">{n.uso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Bloque>

      <Bloque n="4" titulo="Descripción de la vivienda">
        <p className="text-[10.5px] leading-5 text-[#3c4852]">
          Vivienda {proyecto.tipoVivienda.toLowerCase()} de {proyecto.superficie} m²
          útiles, distribuida en {proyecto.plantas}{" "}
          {proyecto.plantas === 1 ? "planta" : "plantas"}, con{" "}
          {proyecto.habitaciones} habitaciones y {proyecto.banos} baños. La
          actuación corresponde a{" "}
          {proyecto.tipoInstalacion === "nueva"
            ? "una instalación de nueva ejecución"
            : "una reforma de la instalación existente"}
          .{proyecto.anio ? ` El edificio data del año ${proyecto.anio}.` : ""}
        </p>
        {previsiones.length > 0 && (
          <p className="mt-2 text-[10.5px] leading-5 text-[#3c4852]">
            Se prevén los siguientes receptores y usos:{" "}
            {previsiones.join(", ")}.
          </p>
        )}
      </Bloque>

      <Bloque n="5" titulo="Grado de electrificación">
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <div>
            <p className="text-[10.5px] leading-5 text-[#3c4852]">
              De acuerdo con la ITC-BT-25, la instalación se clasifica con grado
              de electrificación{" "}
              <strong className="capitalize">{resultado.gradoCalculado}</strong>,
              con una potencia mínima a prever de{" "}
              <strong>{num(POTENCIA_MINIMA_GRADO[resultado.gradoCalculado])} W</strong>{" "}
              y un interruptor general automático de{" "}
              <strong>{resultado.igaMinimoGrado} A</strong> como mínimo.
            </p>
            {resultado.motivosGrado.length > 0 && (
              <>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[#5c6873]">
                  Criterios que determinan el grado
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[10.5px] leading-5 text-[#3c4852]">
                  {resultado.motivosGrado.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="rounded-lg border border-[#d9e0e5] bg-[#f7f9fa] p-3.5 text-[10px]">
            <p className="text-[8px] uppercase tracking-[0.14em] text-[#7e8b96]">
              Resumen
            </p>
            <dl className="mt-2 space-y-1">
              <Dato k="Grado" v={<span className="capitalize">{resultado.gradoCalculado}</span>} />
              <Dato k="Potencia mínima" v={`${num(POTENCIA_MINIMA_GRADO[resultado.gradoCalculado])} W`} />
              <Dato k="IGA mínimo" v={`${resultado.igaMinimoGrado} A`} />
              <Dato k="Circuitos" v={resultado.circuitos.length} />
            </dl>
          </div>
        </div>

        <p className="mt-3 text-[10px] text-[#5c6873]">
          Circuitos mínimos exigidos: {resultado.circuitosObligatorios.join(", ")}.
          {resultado.circuitosFaltantes.length > 0
            ? ` Pendiente de incorporar: ${resultado.circuitosFaltantes.join(", ")}.`
            : " Todos los circuitos exigidos están incluidos en el proyecto."}
        </p>
      </Bloque>

      <Bloque n="6" titulo="Previsión de cargas y potencia">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Circuito</th>
              <th>Denominación</th>
              <th className="text-right">P prevista (W)</th>
              <th className="text-right">Fs</th>
              <th className="text-right">P simultánea (W)</th>
            </tr>
          </thead>
          <tbody>
            {resultado.circuitos.map((r) => (
              <tr key={r.circuito.id}>
                <td className="font-medium">{r.circuito.codigo}</td>
                <td>{r.circuito.nombre}</td>
                <td className="text-right tabular-nums">{num(r.circuito.potencia)}</td>
                <td className="text-right tabular-nums">{num(r.circuito.fs, 2)}</td>
                <td className="text-right tabular-nums">
                  {num(r.circuito.potencia * r.circuito.fs)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-[#cfd6dd] font-semibold">
              <td colSpan={2}>Totales</td>
              <td className="text-right tabular-nums">{num(resultado.potenciaInstalada)}</td>
              <td />
              <td className="text-right tabular-nums">{num(resultado.potenciaSimultanea)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-3 grid gap-x-8 gap-y-0 sm:grid-cols-2">
          <dl className="text-[10.5px]">
            <Dato k="Potencia instalada" v={`${num(resultado.potenciaInstalada)} W`} />
            <Dato
              k="Potencia simultánea estimada"
              v={`${num(resultado.potenciaSimultanea)} W`}
            />
            <Dato k="Potencia prevista" v={`${num(resultado.potenciaPrevista)} W`} />
          </dl>
          <dl className="text-[10.5px]">
            <Dato
              k="Potencia máxima admisible"
              v={`${num(
                potenciaAdmisible(
                  resultado.igaRecomendado,
                  s.fases,
                  s.cosPhi,
                ),
              )} W`}
            />
            <Dato k="Potencia contratada" v={s.potenciaContratada ? `${num(s.potenciaContratada)} W` : "Pendiente"} />
            <Dato k="Intensidad prevista" v={`${num(resultado.intensidadTotal, 1)} A`} />
          </dl>
        </div>
        <p className="mt-2 text-[9.5px] leading-4 text-[#7e8b96]">
          La potencia máxima admisible se deduce del calibre del IGA adoptado. La
          potencia simultánea es una estimación con los coeficientes del proyecto
          y no sustituye a la potencia contratada.
        </p>
      </Bloque>

      <Bloque n="7" titulo="Características del suministro">
        <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
          <dl className="text-[10.5px]">
            <Dato k="Empresa distribuidora" v={s.compania || "No consignada"} />
            <Dato
              k="Tipo de suministro"
              v={s.fases === 3 ? "Trifásico, 400/230 V" : "Monofásico, 230 V"}
            />
            <Dato k="Factor de potencia previsto" v={num(s.cosPhi, 2)} />
          </dl>
          <dl className="text-[10.5px]">
            <Dato k="Interruptor general (IGA)" v={`${resultado.igaRecomendado} A`} />
            <Dato k="Poder de corte declarado" v={`${s.poderCorte} kA`} />
            <Dato
              k="Potencia a contratar"
              v={s.potenciaContratada ? `${num(s.potenciaContratada)} W` : "Pendiente"}
            />
          </dl>
        </div>
      </Bloque>

      <Bloque n="8" titulo="Derivación individual">
        {s.longitudDI > 0 && s.seccionDI > 0 ? (
          <>
            <div className="grid gap-x-8 gap-y-0 sm:grid-cols-2">
              <dl className="text-[10.5px]">
                <Dato k="Longitud" v={`${s.longitudDI} m`} />
                <Dato k="Sección adoptada" v={`${s.seccionDI} mm²`} />
              </dl>
              <dl className="text-[10.5px]">
                <Dato
                  k="Caída de tensión estimada"
                  v={`${num(
                    ((s.fases === 3 ? Math.sqrt(3) : 2) *
                      resultado.intensidadTotal *
                      (s.longitudDI / (48 * s.seccionDI)) *
                      s.cosPhi /
                      tension) *
                      100,
                    2,
                  )} %`}
                />
                <Dato k="Intensidad de cálculo" v={`${num(resultado.intensidadTotal, 1)} A`} />
              </dl>
            </div>
            <p className="mt-2 text-[9.5px] leading-4 text-[#7e8b96]">
              Cálculo informativo con γ = 48 m/(Ω·mm²) y cos φ del suministro. El
              límite reglamentario de la derivación individual debe confirmarse
              conforme a la ITC-BT-15 y a las condiciones de la distribuidora.
            </p>
          </>
        ) : (
          <p className="rounded border border-[#f0d9b8] bg-[#fdf8f0] px-3 py-2 text-[10px] text-[#6b5327]">
            Datos pendientes: no se han consignado la longitud y la sección de la
            derivación individual, por lo que no se emite su comprobación.
          </p>
        )}
      </Bloque>

      <Bloque n="9" titulo="Cuadro general de mando y protección">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Dispositivo</th>
              <th>Calibre / intensidad</th>
              <th>Sensibilidad</th>
              <th>Tipo</th>
              <th>Polos</th>
              <th>Circuitos asignados</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-medium">IGA</td>
              <td>{resultado.igaRecomendado} A</td>
              <td>—</td>
              <td>Automático</td>
              <td>{s.fases === 3 ? "4" : "2"}</td>
              <td>Todos</td>
            </tr>
            {conSobretensiones && (
              <tr>
                <td className="font-medium">
                  Protector de sobretensiones (previsto)
                </td>
                <td>—</td>
                <td>—</td>
                <td>Tipo 2</td>
                <td>{polosDps}</td>
                <td>General</td>
              </tr>
            )}
            {resultado.diferenciales.map((d) => (
              <tr key={d.diferencial.id}>
                <td className="font-medium">{d.diferencial.nombre}</td>
                <td>{d.intensidadAsignada} A</td>
                <td>{d.diferencial.sensibilidad} mA</td>
                <td>{d.diferencial.tipo}</td>
                <td>{d.diferencial.polos}</td>
                <td>
                  {d.circuitos.map((c) => c.circuito.codigo).join(", ") || "Sin asignar"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[#5c6873]">
          Magnetotérmicos por circuito
        </p>
        <table className="doc-table mt-1">
          <thead>
            <tr>
              <th>Circuito</th>
              <th>Intensidad de diseño</th>
              <th>Calibre</th>
              <th>Curva</th>
              <th>Polos</th>
              <th>Iz corregida</th>
              <th>Coordinación</th>
            </tr>
          </thead>
          <tbody>
            {resultado.circuitos.map((r) => (
              <tr key={r.circuito.id}>
                <td className="font-medium">{r.circuito.codigo}</td>
                <td className="tabular-nums">{num(r.ib, 1)} A</td>
                <td className="tabular-nums">{r.in} A</td>
                <td>{r.circuito.curva}</td>
                <td>{r.circuito.polos}</td>
                <td className="tabular-nums">{num(r.izCorregida, 1)} A</td>
                <td className="text-center">
                  <Tick ok={r.comprobaciones.intensidad && r.comprobaciones.proteccion} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[9.5px] leading-4 text-[#7e8b96]">
          La coordinación exige I<sub>b</sub> ≤ I<sub>n</sub> ≤ I<sub>z</sub>.
          Se adopta como mínimo un diferencial de alta sensibilidad por cada cinco
          circuitos instalados (ITC-BT-25).
        </p>
      </Bloque>

      <Bloque n="10" titulo="Circuitos de utilización" salto>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Denominación y uso</th>
              <th className="text-right">P (W)</th>
              <th className="text-right">L (m)</th>
              <th className="text-right">I<sub>b</sub> (A)</th>
              <th className="text-right">In (A)</th>
              <th className="text-right">Fase / N / PE</th>
              <th className="text-right">Tubo</th>
              <th className="text-right">ΔU (%)</th>
            </tr>
          </thead>
          <tbody>
            {resultado.circuitos.map((r) => (
              <tr key={r.circuito.id}>
                <td className="font-medium">{r.circuito.codigo}</td>
                <td>
                  {r.circuito.nombre}
                  <span className="block text-[8.5px] text-[#7e8b96]">
                    {r.circuito.uso} · {r.circuito.metodo} · {r.circuito.aislamiento}
                  </span>
                </td>
                <td className="text-right tabular-nums">{num(r.circuito.potencia)}</td>
                <td className="text-right tabular-nums">{r.circuito.longitud}</td>
                <td className="text-right tabular-nums">{num(r.ib, 1)}</td>
                <td className="text-right tabular-nums">{r.in}</td>
                <td className="text-right tabular-nums">
                  {r.seccion} / {r.neutro} / {r.pe} mm²
                </td>
                <td className="text-right tabular-nums">{r.tubo} mm</td>
                <td className="text-right tabular-nums">{num(r.caidaPct, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Bloque>

      <Bloque n="11" titulo="Cálculo de intensidades">
        <p className="text-[10.5px] leading-5 text-[#3c4852]">
          La intensidad de diseño se obtiene a partir de la potencia prevista, la
          tensión de servicio, el factor de potencia y, cuando procede, el
          rendimiento del receptor.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded border border-[#d9e0e5] bg-[#f7f9fa] px-3 py-2 text-[10px]">
            <p className="font-semibold">Monofásico</p>
            <p className="mt-1 font-mono">
              I<sub>b</sub> = P / (U · cos φ · η)
            </p>
          </div>
          <div className="rounded border border-[#d9e0e5] bg-[#f7f9fa] px-3 py-2 text-[10px]">
            <p className="font-semibold">Trifásico</p>
            <p className="mt-1 font-mono">
              I<sub>b</sub> = P / (√3 · U · cos φ · η)
            </p>
          </div>
        </div>
        <table className="doc-table mt-3">
          <thead>
            <tr>
              <th>Circuito</th>
              <th className="text-right">P (W)</th>
              <th className="text-right">U (V)</th>
              <th className="text-right">cos φ</th>
              <th className="text-right">η</th>
              <th className="text-right">I calculada (A)</th>
            </tr>
          </thead>
          <tbody>
            {resultado.circuitos.map((r) => (
              <tr key={r.circuito.id}>
                <td className="font-medium">{r.circuito.codigo}</td>
                <td className="text-right tabular-nums">{num(r.circuito.potencia)}</td>
                <td className="text-right tabular-nums">
                  {r.circuito.fases === 3 ? 400 : 230}
                </td>
                <td className="text-right tabular-nums">{num(r.circuito.cosPhi, 2)}</td>
                <td className="text-right tabular-nums">{num(r.circuito.rendimiento, 2)}</td>
                <td className="text-right font-medium tabular-nums">{num(r.ib, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Bloque>

      <Bloque n="12" titulo="Cálculo de secciones">
        <p className="text-[10.5px] leading-5 text-[#3c4852]">
          La sección se determina por dos criterios independientes y se adopta la
          mayor de las secciones normalizadas que cumple ambos:
        </p>
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[10px] leading-5 text-[#3c4852]">
          <li>
            Intensidad admisible: la intensidad corregida del conductor debe ser
            igual o superior al calibre de la protección, aplicando los factores
            de temperatura y agrupamiento sobre la tabla 1 de la ITC-BT-19.
          </li>
          <li>
            Caída de tensión: ΔU = (2 o √3) · L · I<sub>n</sub> · cos φ / (γ · S),
            con γ = 48 m/(Ω·mm²) para PVC a 70 °C y 44 para XLPE a 90 °C. No se
            considera la reactancia por tratarse de secciones ≤ 120 mm².
          </li>
        </ul>
        <table className="doc-table mt-3">
          <thead>
            <tr>
              <th>Circuito</th>
              <th className="text-right">S por intensidad</th>
              <th className="text-right">S por caída</th>
              <th className="text-right">S adoptada</th>
              <th className="text-right">Iz corregida</th>
              <th className="text-right">In</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {resultado.circuitos.map((r) => (
              <tr key={r.circuito.id}>
                <td className="font-medium">{r.circuito.codigo}</td>
                <td className="text-right tabular-nums">{r.seccionPorIntensidad} mm²</td>
                <td className="text-right tabular-nums">{r.seccionPorCaida} mm²</td>
                <td className="text-right font-medium tabular-nums">{r.seccion} mm²</td>
                <td className="text-right tabular-nums">{num(r.izCorregida, 1)} A</td>
                <td className="text-right tabular-nums">{r.in} A</td>
                <td className="text-[9px]">
                  {r.comprobaciones.intensidad && r.comprobaciones.seccionMinima
                    ? "Conforme"
                    : "No conforme"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Bloque>

      <Bloque n="13" titulo="Caídas de tensión">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Circuito</th>
              <th className="text-right">L (m)</th>
              <th className="text-right">In (A)</th>
              <th className="text-right">S (mm²)</th>
              <th className="text-right">ΔU (V)</th>
              <th className="text-right">ΔU (%)</th>
              <th className="text-right">Límite (%)</th>
              <th className="text-center">Cumple</th>
            </tr>
          </thead>
          <tbody>
            {resultado.circuitos.map((r) => (
              <tr key={r.circuito.id}>
                <td className="font-medium">{r.circuito.codigo}</td>
                <td className="text-right tabular-nums">{r.circuito.longitud}</td>
                <td className="text-right tabular-nums">{r.in}</td>
                <td className="text-right tabular-nums">{r.seccion}</td>
                <td className="text-right tabular-nums">{num(r.caidaV, 2)}</td>
                <td className="text-right tabular-nums">{num(r.caidaPct, 2)}</td>
                <td className="text-right tabular-nums">{r.limitePct}</td>
                <td className="text-center">
                  <Tick ok={r.comprobaciones.caida} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[9.5px] leading-4 text-[#7e8b96]">
          Caída calculada para la intensidad nominal de la protección, conforme al
          criterio de la ITC-BT-25. Límite de proyecto adoptado:{" "}
          {proyecto.ajustes.caidaMaximaPct} %. La caída acumulada desde el origen
          de la instalación interior coincide con el valor de cada circuito, ya
          que todos parten del cuadro general.
        </p>
      </Bloque>

      <Bloque n="14" titulo="Protecciones y coordinación">
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <dl className="text-[10.5px]">
            <Dato k="IGA adoptado" v={`${resultado.igaRecomendado} A`} />
            <Dato k="Intensidad prevista" v={`${num(resultado.intensidadTotal, 1)} A`} />
            <Dato k="Mínimo del grado" v={`${resultado.igaMinimoGrado} A`} />
          </dl>
          <dl className="text-[10.5px]">
            <Dato k="Nº de diferenciales" v={resultado.diferenciales.length} />
            <Dato
              k="Máximo de circuitos por diferencial"
              v={Math.max(0, ...resultado.diferenciales.map((d) => d.circuitos.length))}
            />
            <Dato k="Poder de corte declarado" v={`${s.poderCorte} kA`} />
            <Dato
              k="Protector de sobretensiones"
              v={
                conSobretensiones
                  ? `Tipo 2 · ${polosDps}P`
                  : "No previsto"
              }
            />
          </dl>
        </div>
        <p className="mt-2 text-[10.5px] leading-5 text-[#3c4852]">
          Todos los circuitos disponen de protección magnetotérmica individual.
          Los diferenciales son de {sensibilidadTexto} mA y su intensidad
          asignada no es inferior a la del interruptor general. Cada diferencial
          agrupa como máximo {maxCircuitosDif}{" "}
          {maxCircuitosDif === 1 ? "circuito" : "circuitos"}
          {maxCircuitosDif > 5
            ? ", valor que supera el máximo de cinco circuitos por dispositivo de la ITC-BT-25 y queda reflejado como incumplimiento en las verificaciones."
            : ", dentro del límite de cinco circuitos por dispositivo de la ITC-BT-25."}
        </p>
      </Bloque>

      <Bloque n="15" titulo="Cortocircuito y poder de corte">
        <p className="rounded border border-[#f0d9b8] bg-[#fdf8f0] px-3 py-2.5 text-[10px] leading-5 text-[#6b5327]">
          <strong>Dato pendiente de verificar.</strong> No se ha consignado la
          impedancia de la red ni la intensidad de cortocircuito presunta en el
          punto de instalación, por lo que esta memoria no calcula I<sub>cc</sub>{" "}
          máxima o mínima, ni verifica la energía pasante I²t. Se declara un poder
          de corte de {s.poderCorte} kA como dato de proyecto, que deberá
          contrastarse con la I<sub>cc</sub> facilitada por la distribuidora o
          medida en obra. La selección definitiva de los dispositivos y la
          comprobación del tiempo de desconexión corresponden al técnico
          competente.
        </p>
      </Bloque>

      <Bloque n="16" titulo="Puesta a tierra">
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <dl className="text-[10.5px]">
            <Dato k="Esquema de conexión" v={t.esquema} />
            <Dato k="Tipo de terreno" v={t.tipoTerreno} />
            <Dato k="Resistividad" v={`${num(t.resistividad)} Ω·m`} />
            <Dato k="Electrodos verticales" v={t.numElectrodos} />
          </dl>
          <dl className="text-[10.5px]">
            <Dato k="Longitud de pica" v={`${t.longitudPica} m`} />
            <Dato k="Separación" v={t.separacion ? `${t.separacion} m` : "—"} />
            <Dato k="Conductor de tierra" v={`${t.seccionTierra} mm²`} />
            <Dato
              k="Resistencia medida"
              v={t.resistenciaMedida !== null ? `${num(t.resistenciaMedida, 1)} Ω` : "Pendiente"}
            />
          </dl>
        </div>
        <div className="mt-2 rounded border border-[#d9e0e5] bg-[#f7f9fa] px-3 py-2 text-[10px] leading-5">
          <p>
            Valor considerado:{" "}
            <strong>
              {resultado.tierra.resistenciaVerificada !== null
                ? `${num(resultado.tierra.resistenciaVerificada, 1)} Ω (medida)`
                : resultado.tierra.resistenciaEstimada !== null
                  ? `${num(resultado.tierra.resistenciaEstimada, 1)} Ω (estimada)`
                  : "sin valor"}
            </strong>{" "}
            · Límite 50 / IΔn = {num(resultado.tierra.limite)} Ω ·{" "}
            {resultado.tierra.cumple === null
              ? "Sin verificar"
              : resultado.tierra.cumple
                ? "Conforme"
                : "No conforme"}
          </p>
          <p className="mt-1 text-[9.5px] text-[#7e8b96]">{resultado.tierra.metodo}</p>
        </div>
        <p className="mt-2 text-[9.5px] leading-4 text-[#7e8b96]">
          La conformidad definitiva requiere la medición de la resistencia de
          tierra y la comprobación de la continuidad de los conductores de
          protección en obra.
        </p>
      </Bloque>

      <Bloque n="17" titulo="Canalizaciones y conductores">
        <p className="text-[10.5px] leading-5 text-[#3c4852]">
          Los conductores son de cobre. La sección del neutro se adopta igual a la
          de fase y la del conductor de protección según la tabla 2 de la
          ITC-BT-19. Los diámetros de tubo son los recomendados para cada sección
          y número de conductores; la ocupación debe verificarse conforme a la
          ITC-BT-21.
        </p>
        <table className="doc-table mt-2">
          <thead>
            <tr>
              <th>Sección (mm²)</th>
              <th className="text-right">Circuitos</th>
              <th className="text-right">Longitud de trazado (m)</th>
              <th className="text-right">Tubo orientativo (mm)</th>
            </tr>
          </thead>
          <tbody>
            {[...porSeccion.entries()]
              .sort((a, b) => a[0] - b[0])
              .map(([seccion, datos]) => (
                <tr key={seccion}>
                  <td className="font-medium">{seccion}</td>
                  <td className="text-right tabular-nums">{datos.circuitos}</td>
                  <td className="text-right tabular-nums">{num(datos.longitud, 0)}</td>
                  <td className="text-right tabular-nums">
                    {TUBO_POR_SECCION[seccion] ?? "—"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Bloque>

      <Bloque n="18" titulo="Protección contra contactos directos e indirectos">
        <p className="text-[10.5px] leading-5 text-[#3c4852]">
          <strong>Contactos directos:</strong> los elementos en tensión quedan
          protegidos por aislamiento, barreras o envolventes y por la instalación
          de mecanismos con grado de protección adecuado. Las tapas y envolventes
          del cuadro general impedirán el acceso a partes activas.
        </p>
        <p className="mt-1.5 text-[10.5px] leading-5 text-[#3c4852]">
          <strong>Contactos indirectos:</strong> se emplea esquema de conexión a
          tierra {t.esquema} con puesta a tierra de las masas y protección
          diferencial de {sensibilidadTexto} mA. La coordinación exige que la resistencia de tierra
          no supere 50/IΔn; con la sensibilidad instalada el límite es{" "}
          {num(resultado.tierra.limite)} Ω.
        </p>
      </Bloque>

      <Bloque n="19" titulo="Protección contra sobretensiones">
        {conSobretensiones ? (
          <p className="text-[10.5px] leading-5 text-[#3c4852]">
            Se prevé la instalación de un protector contra sobretensiones
            transitorias tipo 2 de {polosDps} polos en el cuadro general,
            coordinado con la protección general. Su necesidad y características
            definitivas se ajustan a la ITC-BT-23 y a la ubicación de la vivienda
            (nivel de exposición y existencia de pararrayos en el edificio),
            datos que deben confirmarse en el expediente.
          </p>
        ) : (
          <div className="rounded border border-[#f0d9b8] bg-[#fdf8f0] px-3 py-2.5 text-[10px] leading-5 text-[#6b5327]">
            <p>
              <strong>No se prevé protector contra sobretensiones.</strong> El
              cuadro se documenta sin DPS por decisión del proyecto. La
              procedencia de incorporarlo debe justificarse conforme a la
              ITC-BT-23, el nivel de exposición de la vivienda y la posible
              existencia de pararrayos en el edificio; si el análisis lo exige,
              active la protección en el apartado de cuadro y protecciones.
            </p>
          </div>
        )}
      </Bloque>

      <Bloque n="20" titulo="Esquema unifilar del cuadro" salto>
        <p className="mb-3 text-[9.5px] leading-4 text-[#7e8b96]">
          Esquema funcional generado a partir de los dispositivos calculados. No
          representa el cableado interno ni las distancias físicas; su desarrollo
          detallado corresponde al esquema eléctrico del proyecto.
        </p>

        <div className="rounded-lg border border-[#cfd6dd] bg-[#fbfcfd] p-4">
          <div className="flex items-center justify-center gap-2 border-b border-[#dfe4e8] pb-3">
            <div className="rounded border border-[#8a6a37] bg-[#f4efe5] px-3 py-1.5 text-center">
              <p className="text-[8px] uppercase tracking-wider text-[#7a5f34]">IGA</p>
              <p className="text-[10px] font-semibold">
                {resultado.igaRecomendado} A · {s.fases === 3 ? "4P" : "2P"}
              </p>
            </div>
            {conSobretensiones && (
              <>
                <span className="text-[9px] text-[#7e8b96]">→</span>
                <div className="rounded border border-[#b4453a] bg-[#f9eeec] px-3 py-1.5 text-center">
                  <p className="text-[8px] uppercase tracking-wider text-[#8f3a31]">
                    DPS
                  </p>
                  <p className="text-[10px] font-semibold">
                    {polosDps}P · tipo 2
                  </p>
                </div>
              </>
            )}
            <span className="text-[9px] text-[#7e8b96]">→</span>
            <div className="rounded border border-[#3d6f73] bg-[#eef4f4] px-3 py-1.5 text-center">
              <p className="text-[8px] uppercase tracking-wider text-[#2f585b]">
                Diferenciales
              </p>
              <p className="text-[10px] font-semibold">
                {resultado.diferenciales.length} × {sensibilidadTexto} mA
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {resultado.diferenciales.map((d) => (
              <div key={d.diferencial.id} className="border-l-2 border-[#3d6f73]/50 pl-4">
                <p className="text-[9.5px] font-semibold text-[#2f585b]">
                  {d.diferencial.nombre} · {d.diferencial.sensibilidad} mA · tipo{" "}
                  {d.diferencial.tipo} · {d.diferencial.polos}P
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {d.circuitos.map((r) => (
                    <div
                      key={r.circuito.id}
                      className="rounded border border-[#aab4bd] bg-white px-2 py-1 text-center"
                    >
                      <p className="text-[8px] font-semibold uppercase text-[#5c6873]">
                        {r.circuito.codigo}
                      </p>
                      <p className="text-[9px] tabular-nums">
                        {r.in} A · {r.seccion} mm²
                      </p>
                    </div>
                  ))}
                  {d.circuitos.length === 0 && (
                    <p className="text-[9px] italic text-[#9aa6af]">
                      Sin circuitos asignados
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Bloque>

      <Bloque n="21" titulo="Verificaciones realizadas">
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
          <dl className="text-[10.5px]">
            <Dato k="Errores críticos" v={resumen.criticos} />
            <Dato k="Incumplimientos" v={resumen.incumplimientos} />
            <Dato k="Advertencias" v={resumen.advertencias} />
          </dl>
          <dl className="text-[10.5px]">
            <Dato k="Datos pendientes" v={resumen.pendientes} />
            <Dato k="Recomendaciones" v={resumen.recomendaciones} />
            <Dato k="Circuito con mayor caída" v={`${num(resultado.caidaMaximaPct, 2)} %`} />
          </dl>
        </div>

        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[#5c6873]">
          Comprobaciones efectuadas
        </p>
        <ul className="mt-1 grid gap-x-6 gap-y-0.5 text-[10px] leading-5 text-[#3c4852] sm:grid-cols-2">
          {[
            "Coordinación entre intensidad de diseño, protección y conductor.",
            "Sección mínima de cada circuito conforme a la ITC-BT-25.",
            "Caída de tensión con el límite adoptado en el proyecto.",
            "Conductor de protección según la tabla 2 de la ITC-BT-19.",
            "Sensibilidad e intensidad asignada de los diferenciales.",
            "Agrupación máxima de cinco circuitos por diferencial.",
            "Dimensionado del IGA y potencia mínima del grado.",
            "Coordinación entre resistencia de tierra y sensibilidad.",
            "Presencia de los circuitos obligatorios del grado.",
            "Coherencia entre potencia declarada y potencia calculada.",
          ].map((x) => (
            <li key={x} className="flex gap-1.5">
              <Check className="mt-1 size-2.5 shrink-0 text-[#1f6b4d]" strokeWidth={3} />
              {x}
            </li>
          ))}
        </ul>

        {incidencias.length > 0 && (
          <>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-[#a5322a]">
              Incidencias no resueltas
            </p>
            <table className="doc-table mt-1">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Incidencia</th>
                  <th>Normativa</th>
                </tr>
              </thead>
              <tbody>
                {incidencias.map((h) => (
                  <tr key={h.id}>
                    <td className="whitespace-nowrap font-medium">
                      {h.severidad === "critico" ? "Crítico" : "Incumplimiento"}
                    </td>
                    <td>{h.titulo}</td>
                    <td className="text-[#5c6873]">{h.normativa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Bloque>

      <Bloque n="22" titulo="Relación de conductores y tubos">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Circuito</th>
              <th className="text-right">Fase</th>
              <th className="text-right">Neutro</th>
              <th className="text-right">PE</th>
              <th className="text-right">Tubo</th>
              <th className="text-right">Protección</th>
              <th className="text-right">Diferencial</th>
            </tr>
          </thead>
          <tbody>
            {resultado.circuitos.map((r) => {
              const d = proyecto.diferenciales.find(
                (x) => x.id === r.circuito.diferencialId,
              );
              return (
                <tr key={r.circuito.id}>
                  <td className="font-medium">{r.circuito.codigo}</td>
                  <td className="text-right tabular-nums">{r.seccion} mm²</td>
                  <td className="text-right tabular-nums">{r.neutro} mm²</td>
                  <td className="text-right tabular-nums">{r.pe} mm²</td>
                  <td className="text-right tabular-nums">{r.tubo} mm</td>
                  <td className="text-right tabular-nums">
                    {r.in} A · {r.circuito.curva}
                  </td>
                  <td className="text-right text-[9px]">
                    {d ? `${d.nombre} · ${d.sensibilidad} mA` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Bloque>

      <Bloque n="23" titulo="Datos pendientes">
        {pendientes.length === 0 ? (
          <p className="rounded border border-[#d6e8de] bg-[#f3faf6] px-3 py-2.5 text-[10px] text-[#1f6b4d]">
            No se han identificado datos obligatorios pendientes en el momento de
            generar el documento.
          </p>
        ) : (
          <>
            <p className="text-[10px] leading-4 text-[#6b5327]">
              Los siguientes extremos deben completarse antes de considerar la
              documentación cerrada:
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[10px] leading-5 text-[#3c4852]">
              {pendientes.map((h) => (
                <li key={h.id}>
                  <span className="font-medium">{h.titulo}.</span> {h.solucion}
                </li>
              ))}
            </ul>
          </>
        )}
      </Bloque>

      <Bloque n="24" titulo="Conclusiones y firma">
        <p className="text-[10.5px] leading-5 text-[#3c4852]">
          La instalación proyectada consta de {resultado.circuitos.length}{" "}
          circuitos interiores, protegidos por {resultado.diferenciales.length}{" "}
          {resultado.diferenciales.length === 1 ? "interruptor diferencial" : "interruptores diferenciales"}{" "}
          de {sensibilidadTexto} mA y un interruptor general automático de{" "}
          {resultado.igaRecomendado} A, con una potencia prevista de{" "}
          {num(resultado.potenciaPrevista)} W. Las secciones adoptadas, las
          caídas de tensión y la coordinación de protecciones se detallan en los
          apartados anteriores.
        </p>
        <p className="mt-2 text-[10.5px] leading-5 text-[#3c4852]">
          {resumen.criticos === 0 && resumen.incumplimientos === 0 && resumen.pendientes === 0
            ? "De las comprobaciones realizadas con los datos consignados no resultan incumplimientos críticos ni datos pendientes. La conformidad definitiva queda supeditada a la verificación en obra y a la firma del técnico competente."
            : `El proyecto presenta ${resumen.criticos} errores críticos, ${resumen.incumplimientos} incumplimientos y ${resumen.pendientes} datos pendientes. En consecuencia, no se declara la conformidad de la instalación en el estado actual de la documentación.`}
        </p>

        <div className="mt-10 grid grid-cols-2 gap-10">
          <div>
            <p className="text-[8px] uppercase tracking-[0.14em] text-[#7e8b96]">
              Técnico responsable
            </p>
            <p className="mt-1 text-[10.5px] font-medium">
              {proyecto.tecnico || "Pendiente de completar"}
            </p>
            <div className="mt-10 border-t border-[#9aa6af] pt-1.5 text-[8px] text-[#7e8b96]">
              Firma y fecha
            </div>
          </div>
          <div>
            <p className="text-[8px] uppercase tracking-[0.14em] text-[#7e8b96]">
              Empresa instaladora
            </p>
            <p className="mt-1 text-[10.5px] font-medium">
              {proyecto.empresa || "Pendiente de completar"}
            </p>
            <div className="mt-10 border-t border-[#9aa6af] pt-1.5 text-[8px] text-[#7e8b96]">
              Sello y fecha
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#dfe4e8] pt-3 text-[8.5px] leading-4 text-[#7e8b96]">
          <p>
            Documento generado con REBT Pro el {generado}. Cálculos realizados con
            las tablas de la ITC-BT-19, los circuitos de la ITC-BT-25 y los
            criterios de la Guía Técnica de Aplicación del REBT. Las hipótesis y
            los datos de partida figuran en los apartados correspondientes.
          </p>
          <p className="mt-1">
            Este documento no acredita por sí mismo el cumplimiento final de la
            instalación: las mediciones, ensayos y la inspección inicial, cuando
            proceda, deben ser realizados por el instalador habilitado y, en su
            caso, por el organismo de control.
          </p>
        </div>
      </Bloque>
    </article>
  );
}
