/**
 * Motor de cálculo REBT Pro.
 *
 * El motor es independiente de la interfaz: recibe un `Proyecto` y devuelve
 * todos los resultados. No contiene constantes ocultas: los coeficientes y
 * tablas están en `data.ts` y se muestran en la memoria.
 */

import {
  CALIBRES_PIA,
  IGA_MINIMO_GRADO,
  POTENCIA_MINIMA_GRADO,
  PRESETS_ITC25,
  SECCIONES_COMERCIALES,
  conductividad,
  diametroTubo,
  factorAgrupamiento,
  factorTemperatura,
  intensidadAdmisible,
  seccionPE,
} from "./data";
import type {
  Circuito,
  DiferencialCalculado,
  GradoElectrificacion,
  Proyecto,
  ResultadoCircuito,
  ResultadoProyecto,
} from "./types";

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const redondear = (v: number, decimales = 2) => {
  const f = 10 ** decimales;
  return Math.round(v * f) / f;
};

/** Tensión de servicio del circuito (V). */
export function tensionCircuito(c: Circuito): number {
  return c.fases === 3 ? 400 : 230;
}

/** Potencia aparente / intensidad de diseño (A). */
export function intensidadDiseno(c: Circuito): number {
  const P = Math.max(0, c.potencia);
  if (P === 0) return 0;
  const U = tensionCircuito(c);
  const cosPhi = clamp(c.cosPhi || 1, 0.1, 1);
  const eta = clamp(c.rendimiento || 1, 0.1, 1);
  return c.fases === 3
    ? P / (Math.sqrt(3) * U * cosPhi * eta)
    : P / (U * cosPhi * eta);
}

export function menorCalibre(intensidad: number): number {
  const calibre = CALIBRES_PIA.find((c) => c >= intensidad);
  return calibre ?? CALIBRES_PIA[CALIBRES_PIA.length - 1];
}

export function calibreSiguiente(calibre: number): number {
  const idx = CALIBRES_PIA.indexOf(calibre as never);
  if (idx === -1 || idx === CALIBRES_PIA.length - 1) {
    return CALIBRES_PIA[CALIBRES_PIA.length - 1];
  }
  return CALIBRES_PIA[idx + 1];
}

export function presetDe(codigo: string) {
  return PRESETS_ITC25.find((p) => p.codigo === codigo);
}

export function calcularCircuito(
  circuito: Circuito,
  limitePct: number,
): ResultadoCircuito {
  const U = tensionCircuito(circuito);
  const cosPhi = clamp(circuito.cosPhi || 1, 0.1, 1);
  const ib = intensidadDiseno(circuito);
  const preset = presetDe(circuito.codigo);

  const inMinimoNormativo = preset?.pia ?? 0;
  const seccionMinimaNormativa = preset?.seccion ?? 1.5;
  const inAuto = Math.max(inMinimoNormativo, menorCalibre(ib));
  const inFinal = circuito.pia > 0 ? circuito.pia : inAuto;

  const cargados: 2 | 3 = circuito.fases === 3 ? 3 : 2;
  const fTemperatura = factorTemperatura(circuito.tempAmbiente, circuito.aislamiento);
  const fAgrupamiento = factorAgrupamiento(circuito.agrupamiento);

  const izDe = (seccion: number) =>
    intensidadAdmisible(
      seccion,
      circuito.metodo,
      circuito.aislamiento,
      cargados,
    ) *
    fTemperatura *
    fAgrupamiento;

  const caidaDe = (seccion: number, intensidad: number) => {
    const gamma = conductividad(circuito.aislamiento);
    const resistencia = circuito.longitud / (gamma * seccion);
    const caidaV =
      (circuito.fases === 3 ? Math.sqrt(3) : 2) *
      intensidad *
      resistencia *
      cosPhi;
    return { resistencia, caidaV, caidaPct: (caidaV / U) * 100 };
  };

  const seccionPorIntensidad =
    SECCIONES_COMERCIALES.find(
      (s) => s >= seccionMinimaNormativa && izDe(s) >= inFinal,
    ) ?? 35;
  const seccionPorCaida =
    SECCIONES_COMERCIALES.find(
      (s) =>
        s >= seccionMinimaNormativa &&
        caidaDe(s, inFinal).caidaPct <= limitePct + 1e-9,
    ) ?? 35;

  const seccion =
    circuito.seccion > 0
      ? circuito.seccion
      : Math.max(seccionPorIntensidad, seccionPorCaida);

  const izTabla = intensidadAdmisible(
    seccion,
    circuito.metodo,
    circuito.aislamiento,
    cargados,
  );
  const izCorregida = izTabla * fTemperatura * fAgrupamiento;
  const { resistencia, caidaV, caidaPct } = caidaDe(seccion, inFinal);

  const conductores = circuito.fases === 3 ? 3 : 2;
  const perdidasW =
    conductores * Math.pow(ib, 2) * resistencia;

  const pe = seccionPE(seccion);
  const tubo = diametroTubo(seccion, circuito.fases, preset?.tubo);

  const intensidadOk = izCorregida >= inFinal;
  const caidaOk = caidaPct <= limitePct + 1e-9;
  const seccionOk = seccion >= seccionMinimaNormativa;
  const proteccionOk = inFinal >= ib;
  const diferencialOk = Boolean(circuito.diferencialId);

  let estado: ResultadoCircuito["estado"] = "ok";
  if (!intensidadOk || !caidaOk || !seccionOk || !proteccionOk) {
    estado = "error";
  } else if (caidaPct > limitePct * 0.85 || ib === 0 || circuito.agrupamiento > 5) {
    estado = "aviso";
  }

  return {
    circuito,
    ib: redondear(ib),
    in: inFinal,
    inMinimoNormativo,
    seccionMinimaNormativa,
    izTabla,
    factorTemperatura: redondear(fTemperatura, 3),
    factorAgrupamiento: redondear(fAgrupamiento, 2),
    izCorregida: redondear(izCorregida, 1),
    seccionPorIntensidad,
    seccionPorCaida,
    seccion,
    neutro: seccion,
    pe,
    tubo,
    resistencia: redondear(resistencia, 4),
    caidaV: redondear(caidaV),
    caidaPct: redondear(caidaPct),
    limitePct,
    perdidasW: redondear(perdidasW, 1),
    estado,
    comprobaciones: {
      intensidad: intensidadOk,
      caida: caidaOk,
      seccionMinima: seccionOk,
      proteccion: proteccionOk,
      diferencial: diferencialOk,
    },
  };
}

/** Criterios de grado de electrificación (ITC-BT-25). */
export function determinarGrado(proyecto: Proyecto): {
  grado: GradoElectrificacion;
  motivos: string[];
  obligatorios: string[];
  faltantes: string[];
  receptoresFaltantes: string[];
} {
  const e = proyecto.electrificacion;
  const motivos: string[] = [];

  if (proyecto.superficie > 160) {
    motivos.push(`Superficie útil ${proyecto.superficie} m² > 160 m²`);
  }
  if (e.calefaccion) motivos.push("Previsión de calefacción eléctrica");
  if (e.climatizacion) motivos.push("Previsión de aire acondicionado");
  if (e.automatizacion || e.domotica) {
    motivos.push("Sistemas de automatización / domótica");
  }
  if (e.aerotermia) motivos.push("Aerotermia");
  if (e.recargaVE) motivos.push("Recarga de vehículo eléctrico");
  if (e.piscina) motivos.push("Piscina");
  if (e.secadora) motivos.push("Secadora");
  if (e.otros && e.otrosPotencia > 0) {
    motivos.push(`Receptor especial: ${e.otros}`);
  }
  // La Guía BT-25 (tabla A) mantiene el escalón 7.360 W / 32 A dentro de la
  // electrificación básica; a partir de 9.200 W el grado es elevado.
  if (proyecto.suministro.potenciaContratada > 7360) {
    motivos.push(
      `Potencia a prever ${proyecto.suministro.potenciaContratada} W > 7.360 W (escalón máximo de electrificación básica)`,
    );
  }

  const grado: GradoElectrificacion = motivos.length ? "elevada" : "basica";

  const obligatorios = ["C1", "C2", "C3", "C4", "C5"];
  const codigos = new Set(proyecto.circuitos.map((c) => c.codigo));

  const puntosLuz = proyecto.circuitos
    .filter((c) => c.codigo === "C1" || c.codigo === "C6")
    .reduce((s, c) => s + c.puntos, 0);
  if (puntosLuz > 30 || codigos.has("C6")) obligatorios.push("C6");

  const tomas = proyecto.circuitos
    .filter((c) => c.codigo === "C2" || c.codigo === "C7")
    .reduce((s, c) => s + c.puntos, 0);
  if (proyecto.superficie > 160 || tomas > 20 || codigos.has("C7")) {
    obligatorios.push("C7");
  }

  if (e.calefaccion) obligatorios.push("C8");
  if (e.climatizacion) obligatorios.push("C9");
  if (e.secadora) obligatorios.push("C10");
  if (e.automatizacion || e.domotica) obligatorios.push("C11");

  const faltantes = obligatorios.filter((c) => !codigos.has(c));

  const receptoresFaltantes: string[] = [];
  const nombres = proyecto.circuitos.map((c) => `${c.nombre} ${c.uso}`.toLowerCase());
  const requiere = (activo: boolean, texto: string, palabras: string[]) => {
    if (!activo) return;
    if (!nombres.some((n) => palabras.some((p) => n.includes(p)))) {
      receptoresFaltantes.push(texto);
    }
  };
  requiere(e.aerotermia, "Circuito de aerotermia", ["aerotermia"]);
  requiere(e.recargaVE, "Circuito de recarga de vehículo eléctrico", [
    "vehículo",
    "recarga",
  ]);
  requiere(e.piscina, "Circuito de piscina", ["piscina"]);
  if (e.otros && e.otrosPotencia > 0) {
    receptoresFaltantes.push(`Circuito para ${e.otros}`);
  }

  return { grado, motivos, obligatorios, faltantes, receptoresFaltantes };
}

function calcularTierra(proyecto: Proyecto, sensibilidad: number) {
  const t = proyecto.tierra;
  const limite = sensibilidad > 0 ? 50 / (sensibilidad / 1000) : 0;

  let resistenciaEstimada: number | null = null;
  let metodo = "";

  if (t.numElectrodos === 1 && t.resistividad > 0 && t.longitudPica > 0) {
    // Fórmula de Dwight para una pica vertical (d = 14 mm).
    const d = 0.014;
    resistenciaEstimada =
      (t.resistividad / (2 * Math.PI * t.longitudPica)) *
      (Math.log((4 * t.longitudPica) / d) - 1);
    metodo =
      "Estimación analítica de una pica vertical (Dwight) con ρ del terreno declarada.";
  } else {
    metodo =
      "Con varios electrodos la estimación requiere el coeficiente de eficiencia del conjunto; debe introducirse la resistencia medida.";
  }

  const verificada =
    t.resistenciaMedida !== null && !Number.isNaN(t.resistenciaMedida)
      ? t.resistenciaMedida
      : null;
  const valor = verificada ?? resistenciaEstimada;
  const cumple = valor === null ? null : valor <= limite;

  return {
    resistenciaEstimada:
      resistenciaEstimada === null ? null : redondear(resistenciaEstimada, 1),
    resistenciaVerificada: verificada,
    limite: redondear(limite, 0),
    cumple,
    metodo,
  };
}

export function calcularProyecto(proyecto: Proyecto): ResultadoProyecto {
  const limitePct = proyecto.ajustes.caidaMaximaPct || 3;
  const circuitos = proyecto.circuitos.map((c) =>
    calcularCircuito(c, limitePct),
  );

  const grado = determinarGrado(proyecto);
  const potenciaMinimaGrado = POTENCIA_MINIMA_GRADO[grado.grado];

  const potenciaInstalada = circuitos.reduce(
    (s, r) => s + r.circuito.potencia,
    0,
  );
  const potenciaSimultanea = circuitos.reduce(
    (s, r) => s + r.circuito.potencia * clamp(r.circuito.fs || 0, 0, 1),
    0,
  );

  const contratada = proyecto.suministro.potenciaContratada;
  const potenciaPrevista = Math.max(
    potenciaMinimaGrado,
    contratada > 0 ? contratada : 0,
  );

  const fases = proyecto.suministro.fases;
  const tension = fases === 3 ? 400 : 230;
  const cosPhi = clamp(proyecto.suministro.cosPhi || 1, 0.1, 1);
  const intensidadTotal =
    potenciaPrevista /
    ((fases === 3 ? Math.sqrt(3) : 1) * tension * cosPhi);

  const igaMinimoGrado = IGA_MINIMO_GRADO[grado.grado];
  const igaRecomendado = Math.max(
    igaMinimoGrado,
    menorCalibre(intensidadTotal),
  );

  const diferenciales: DiferencialCalculado[] = proyecto.diferenciales.map(
    (d) => {
      const asignados = circuitos.filter(
        (r) => r.circuito.diferencialId === d.id,
      );
      const sensibilidadOk = d.sensibilidad <= 30;
      const agrupacionOk = asignados.length <= 5;
      const asignadoOk = asignados.length > 0;
      return {
        diferencial: d,
        intensidadAsignada: igaRecomendado,
        circuitos: asignados,
        estado:
          sensibilidadOk && agrupacionOk && asignadoOk
            ? "ok"
            : "error",
      };
    },
  );

  const perdidasTotalesW = circuitos.reduce((s, r) => s + r.perdidasW, 0);
  const energiaPerdidaKwhAnio = (perdidasTotalesW / 1000) * 24 * 365;
  const costePerdidasAnio =
    energiaPerdidaKwhAnio * (proyecto.ajustes.precioKwh || 0);
  const consumoEstimadoKwhAnio =
    (potenciaSimultanea / 1000) *
    (proyecto.ajustes.horasEquivalenteDia || 0) *
    365;
  const costeConsumoAnio =
    consumoEstimadoKwhAnio * (proyecto.ajustes.precioKwh || 0);

  const caidaMaximaPct = circuitos.reduce(
    (m, r) => Math.max(m, r.caidaPct),
    0,
  );
  const seccionMinima = circuitos.reduce(
    (m, r) => (m === 0 ? r.seccion : Math.min(m, r.seccion)),
    0,
  );

  let reparto: { L1: number; L2: number; L3: number } | null = null;
  let desequilibrioPct: number | null = null;
  if (fases === 3) {
    const cargas = { L1: 0, L2: 0, L3: 0 };
    const claves: (keyof typeof cargas)[] = ["L1", "L2", "L3"];
    circuitos.forEach((r, i) => {
      cargas[claves[i % 3]] += r.ib;
    });
    reparto = {
      L1: redondear(cargas.L1, 1),
      L2: redondear(cargas.L2, 1),
      L3: redondear(cargas.L3, 1),
    };
    const max = Math.max(cargas.L1, cargas.L2, cargas.L3);
    const min = Math.min(cargas.L1, cargas.L2, cargas.L3);
    desequilibrioPct = max > 0 ? redondear(((max - min) / max) * 100, 1) : 0;
  }

  const sensibilidadMax = proyecto.diferenciales.reduce(
    (m, d) => Math.max(m, d.sensibilidad),
    0,
  );

  return {
    circuitos,
    diferenciales,
    potenciaInstalada: redondear(potenciaInstalada, 0),
    potenciaSimultanea: redondear(potenciaSimultanea, 0),
    potenciaPrevista: redondear(potenciaPrevista, 0),
    potenciaMinimaGrado,
    intensidadTotal: redondear(intensidadTotal, 1),
    igaRecomendado,
    igaMinimoGrado,
    perdidasTotalesW: redondear(perdidasTotalesW, 1),
    perdidasPct:
      potenciaInstalada > 0
        ? redondear((perdidasTotalesW / potenciaInstalada) * 100, 2)
        : 0,
    energiaPerdidaKwhAnio: redondear(energiaPerdidaKwhAnio, 0),
    costePerdidasAnio: redondear(costePerdidasAnio, 2),
    consumoEstimadoKwhAnio: redondear(consumoEstimadoKwhAnio, 0),
    costeConsumoAnio: redondear(costeConsumoAnio, 2),
    caidaMaximaPct: redondear(caidaMaximaPct, 2),
    seccionMinima,
    fases: reparto,
    desequilibrioPct,
    tierra: calcularTierra(proyecto, sensibilidadMax),
    gradoCalculado: grado.grado,
    motivosGrado: grado.motivos,
    circuitosObligatorios: grado.obligatorios,
    circuitosFaltantes: [...grado.faltantes, ...grado.receptoresFaltantes],
  };
}

/** Potencia máxima admisible según el calibre del IGA y el cos φ previsto. */
export function potenciaAdmisible(
  calibre: number,
  fases: 1 | 3,
  cosPhi = 1,
): number {
  const factor = fases === 3 ? Math.sqrt(3) * 400 : 230;
  return redondear(factor * calibre * clamp(cosPhi || 1, 0.1, 1), 0);
}
