/**
 * Datos normativos empleados por el motor de cálculo.
 *
 * Fuentes:
 *  - REBT, RD 842/2002. ITC-BT-19 (tabla 1: intensidades admisibles a 40 °C;
 *    tabla 2: secciones mínimas del conductor de protección).
 *  - ITC-BT-25 (tabla 1: características eléctricas de los circuitos; grados de
 *    electrificación básica 5.750 W / elevada 9.200 W).
 *  - Guía Técnica de Aplicación del REBT, Anexo 2 (caídas de tensión):
 *    conductividad del cobre a 48 m/(Ω·mm²) a 70 °C y 44 a 90 °C.
 *  - ITC-BT-18 (puesta a tierra: R ≤ 50 / IΔn en esquema TT).
 *
 * Ningún valor de esta tabla se ha estimado: todos proceden de las tablas
 * citadas. Las hipótesis de cálculo se muestran en la memoria y en la pantalla
 * de cálculos para que puedan auditarse.
 */

import type {
  Aislamiento,
  Circuito,
  Diferencial,
  MetodoInstalacion,
  Proyecto,
} from "./types";

export const SECCIONES_COMERCIALES = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35,
] as const;

export const CALIBRES_PIA = [6, 10, 16, 20, 25, 32, 40, 50, 63] as const;

export const CURVAS = ["B", "C", "D"] as const;

/** Diámetro exterior orientativo de tubo (mm) según sección (ITC-BT-25). */
export const TUBO_POR_SECCION: Record<number, number> = {
  1.5: 16,
  2.5: 20,
  4: 20,
  6: 25,
  10: 32,
  16: 32,
  25: 40,
  35: 40,
};

/** ITC-BT-19 tabla 1. Cobre, temperatura ambiente 40 °C, instalación al aire. */
const INTENSIDADES: Record<
  MetodoInstalacion,
  Record<Aislamiento, { 2: number[]; 3: number[] }>
> = {
  B1: {
    PVC: {
      2: [15, 21, 27, 36, 50, 66, 84, 104],
      3: [13.5, 18.5, 24, 31, 42, 56, 73, 89],
    },
    XLPE: {
      2: [19.5, 27, 36, 46, 63, 85, 112, 138],
      3: [17.5, 24, 32, 41, 57, 76, 96, 119],
    },
  },
  B2: {
    PVC: {
      2: [13.5, 18, 24, 31, 42, 56, 73, 89],
      3: [12, 16, 21, 27, 36, 48, 62, 76],
    },
    XLPE: {
      2: [17, 23, 30, 39, 52, 69, 90, 111],
      3: [15, 20, 26, 34, 46, 62, 80, 99],
    },
  },
  C: {
    PVC: {
      2: [17.5, 24, 32, 41, 57, 76, 96, 119],
      3: [15.5, 21, 28, 36, 50, 68, 89, 110],
    },
    XLPE: {
      2: [22, 30, 40, 51, 70, 94, 119, 147],
      3: [19.5, 26, 35, 44, 60, 80, 101, 126],
    },
  },
};

export const METODOS_INSTALACION: {
  valor: MetodoInstalacion;
  etiqueta: string;
  descripcion: string;
}[] = [
  {
    valor: "B1",
    etiqueta: "B1 · Tubo empotrado",
    descripcion:
      "Conductores aislados en el interior de tubos empotrados en paredes aislantes (caso habitual en vivienda).",
  },
  {
    valor: "B2",
    etiqueta: "B2 · Cable bajo tubo",
    descripcion:
      "Cables multiconductores en el interior de tubos empotrados en paredes aislantes.",
  },
  {
    valor: "C",
    etiqueta: "C · Superficie",
    descripcion:
      "Conductores aislados en tubo o canaleta en montaje superficial, o cable fijado directamente sobre pared.",
  },
];

/** ITC-BT-19 tabla 1. */
export function intensidadAdmisible(
  seccion: number,
  metodo: MetodoInstalacion,
  aislamiento: Aislamiento,
  conductoresCargados: 2 | 3,
): number {
  const idx = SECCIONES_COMERCIALES.indexOf(seccion as never);
  if (idx === -1) return 0;
  return INTENSIDADES[metodo][aislamiento][conductoresCargados][idx];
}

/** ITC-BT-19: factor de agrupamiento de circuitos en la misma canalización. */
export const FACTOR_AGRUPAMIENTO: { circuitos: number; factor: number }[] = [
  { circuitos: 1, factor: 1.0 },
  { circuitos: 2, factor: 0.8 },
  { circuitos: 3, factor: 0.7 },
  { circuitos: 4, factor: 0.65 },
  { circuitos: 5, factor: 0.6 },
  { circuitos: 6, factor: 0.57 },
  { circuitos: 7, factor: 0.54 },
  { circuitos: 8, factor: 0.52 },
  { circuitos: 9, factor: 0.5 },
];

export function factorAgrupamiento(circuitos: number): number {
  if (circuitos <= 1) return 1;
  const fila = FACTOR_AGRUPAMIENTO.find((f) => f.circuitos >= circuitos);
  return fila ? fila.factor : 0.45;
}

/**
 * UNE 20460-5-523 / ITC-BT-19: la tabla está referida a 40 °C, por lo que el
 * factor por temperatura ambiente es f = √((θmáx − θamb)/(θmáx − 40)).
 */
export function factorTemperatura(
  tempAmbiente: number,
  aislamiento: Aislamiento,
): number {
  const tMax = aislamiento === "PVC" ? 70 : 90;
  if (tempAmbiente >= tMax) return 0.5;
  const f = Math.sqrt((tMax - tempAmbiente) / (tMax - 40));
  return Math.min(1.35, Math.max(0.3, f));
}

/** Conductividad del cobre (m/Ω·mm²) a la temperatura de servicio. */
export function conductividad(aislamiento: Aislamiento): number {
  return aislamiento === "PVC" ? 48 : 44;
}

/** ITC-BT-19 tabla 2: sección mínima del conductor de protección. */
export function seccionPE(seccionFase: number): number {
  if (seccionFase <= 16) return seccionFase;
  if (seccionFase <= 35) return 16;
  return Math.ceil(seccionFase / 2);
}

export function diametroTubo(
  seccion: number,
  fases: 1 | 3,
  preset?: number,
): number {
  if (preset) return preset;
  const base = TUBO_POR_SECCION[seccion] ?? 40;
  // Un circuito trifásico lleva un conductor más: se adopta el diámetro
  // inmediatamente superior de la serie comercial.
  if (fases === 3) {
    const serie = [16, 20, 25, 32, 40, 50];
    const i = serie.indexOf(base);
    return serie[Math.min(i + 1, serie.length - 1)];
  }
  return base;
}

/** Potencias mínimas a prever por grado (ITC-BT-25 / Guía BT-25 tabla A). */
export const POTENCIA_MINIMA_GRADO = {
  basica: 5750,
  elevada: 9200,
} as const;

export const IGA_MINIMO_GRADO = {
  basica: 25,
  elevada: 40,
} as const;

export interface PresetCircuito {
  codigo: string;
  nombre: string;
  uso: string;
  potencia: number;
  pia: number;
  seccion: number;
  tubo: number;
  maxPuntos: number;
  puntos: number;
  /** Potencia prevista por toma publicada en ITC-BT-25 tabla 1. */
  potenciaPorToma?: number;
  factorSimultaneidad?: number;
  factorUtilizacion?: number;
  fs: number;
  tipo: "estandar" | "especial";
}

/**
 * ITC-BT-25 tabla 1 (circuitos C1 a C12) completada con la potencia prevista
 * de proyecto habitual. Las columnas normativas (P/toma, Fs, Fu, PIA, sección,
 * tubo y nº máximo de puntos) se muestran en la ficha de cada circuito.
 */
export const PRESETS_ITC25: PresetCircuito[] = [
  {
    codigo: "C1",
    nombre: "Iluminación",
    uso: "Puntos de luz",
    potencia: 1500,
    pia: 10,
    seccion: 1.5,
    tubo: 16,
    maxPuntos: 30,
    puntos: 12,
    potenciaPorToma: 200,
    factorSimultaneidad: 0.75,
    factorUtilizacion: 0.5,
    fs: 0.75,
    tipo: "estandar",
  },
  {
    codigo: "C2",
    nombre: "Tomas de uso general y frigorífico",
    uso: "Bases 16 A 2p+T",
    potencia: 3000,
    pia: 16,
    seccion: 2.5,
    tubo: 20,
    maxPuntos: 20,
    puntos: 12,
    potenciaPorToma: 3450,
    factorSimultaneidad: 0.2,
    factorUtilizacion: 0.25,
    fs: 0.5,
    tipo: "estandar",
  },
  {
    codigo: "C3",
    nombre: "Cocina y horno",
    uso: "Bases 25 A 2p+T",
    potencia: 5400,
    pia: 25,
    seccion: 6,
    tubo: 25,
    maxPuntos: 2,
    puntos: 2,
    potenciaPorToma: 5400,
    factorSimultaneidad: 0.5,
    factorUtilizacion: 0.75,
    fs: 1,
    tipo: "estandar",
  },
  {
    codigo: "C4",
    nombre: "Lavadora, lavavajillas y termo eléctrico",
    uso: "Bases 16 A 2p+T",
    potencia: 3450,
    pia: 20,
    seccion: 4,
    tubo: 20,
    maxPuntos: 3,
    puntos: 2,
    potenciaPorToma: 3450,
    factorSimultaneidad: 0.66,
    factorUtilizacion: 0.75,
    fs: 0.75,
    tipo: "estandar",
  },
  {
    codigo: "C5",
    nombre: "Tomas de baño y auxiliares de cocina",
    uso: "Bases 16 A 2p+T",
    potencia: 3450,
    pia: 16,
    seccion: 2.5,
    tubo: 20,
    maxPuntos: 6,
    puntos: 4,
    potenciaPorToma: 3450,
    factorSimultaneidad: 0.4,
    factorUtilizacion: 0.5,
    fs: 0.6,
    tipo: "estandar",
  },
  {
    codigo: "C6",
    nombre: "Circuito adicional de iluminación",
    uso: "Puntos de luz",
    potencia: 1500,
    pia: 10,
    seccion: 1.5,
    tubo: 16,
    maxPuntos: 30,
    puntos: 10,
    potenciaPorToma: 200,
    factorSimultaneidad: 0.75,
    factorUtilizacion: 0.5,
    fs: 0.75,
    tipo: "estandar",
  },
  {
    codigo: "C7",
    nombre: "Circuito adicional de tomas de corriente",
    uso: "Bases 16 A 2p+T",
    potencia: 3000,
    pia: 16,
    seccion: 2.5,
    tubo: 20,
    maxPuntos: 20,
    puntos: 10,
    potenciaPorToma: 3450,
    factorSimultaneidad: 0.2,
    factorUtilizacion: 0.25,
    fs: 0.5,
    tipo: "estandar",
  },
  {
    codigo: "C8",
    nombre: "Calefacción eléctrica",
    uso: "Receptor de calefacción",
    potencia: 5750,
    pia: 25,
    seccion: 6,
    tubo: 25,
    maxPuntos: 1,
    puntos: 1,
    fs: 1,
    tipo: "estandar",
  },
  {
    codigo: "C9",
    nombre: "Aire acondicionado",
    uso: "Receptor de climatización",
    potencia: 5750,
    pia: 25,
    seccion: 6,
    tubo: 25,
    maxPuntos: 1,
    puntos: 1,
    fs: 1,
    tipo: "estandar",
  },
  {
    codigo: "C10",
    nombre: "Secadora",
    uso: "Base 16 A 2p+T",
    potencia: 3450,
    pia: 16,
    seccion: 2.5,
    tubo: 20,
    maxPuntos: 1,
    puntos: 1,
    fs: 1,
    tipo: "estandar",
  },
  {
    codigo: "C11",
    nombre: "Automatización, gestión técnica y seguridad",
    uso: "Domótica y control",
    potencia: 2300,
    pia: 10,
    seccion: 1.5,
    tubo: 16,
    maxPuntos: 1,
    puntos: 1,
    fs: 1,
    tipo: "estandar",
  },
  {
    codigo: "C12",
    nombre: "Circuito adicional (C3, C4 o C5)",
    uso: "Ampliación de circuitos normalizados",
    potencia: 3450,
    pia: 20,
    seccion: 4,
    tubo: 20,
    maxPuntos: 3,
    puntos: 2,
    fs: 1,
    tipo: "estandar",
  },
];

/** Circuitos especiales y receptores singulares. */
export const PRESETS_ESPECIALES: PresetCircuito[] = [
  { codigo: "E-AER", nombre: "Aerotermia", uso: "Bomba de calor", potencia: 3000, pia: 0, seccion: 0, tubo: 0, maxPuntos: 1, puntos: 1, fs: 1, tipo: "especial" },
  { codigo: "E-VE", nombre: "Recarga de vehículo eléctrico", uso: "Punto de recarga (ITC-BT-52)", potencia: 7400, pia: 32, seccion: 6, tubo: 32, maxPuntos: 1, puntos: 1, fs: 1, tipo: "especial" },
  { codigo: "E-PIS", nombre: "Piscina · bomba y tratamiento", uso: "Motobomba", potencia: 1500, pia: 0, seccion: 0, tubo: 0, maxPuntos: 1, puntos: 1, fs: 1, tipo: "especial" },
  { codigo: "E-JAR", nombre: "Jardín", uso: "Iluminación y tomas exteriores", potencia: 1000, pia: 0, seccion: 0, tubo: 0, maxPuntos: 6, puntos: 4, fs: 1, tipo: "especial" },
  { codigo: "E-GAR", nombre: "Garaje", uso: "Iluminación y tomas", potencia: 2000, pia: 0, seccion: 0, tubo: 0, maxPuntos: 4, puntos: 2, fs: 1, tipo: "especial" },
  { codigo: "E-PUE", nombre: "Puerta automática", uso: "Motor de puerta", potencia: 500, pia: 0, seccion: 0, tubo: 0, maxPuntos: 1, puntos: 1, fs: 1, tipo: "especial" },
  { codigo: "E-INF", nombre: "Equipos informáticos", uso: "Rack / SAI", potencia: 1500, pia: 0, seccion: 0, tubo: 0, maxPuntos: 2, puntos: 1, fs: 1, tipo: "especial" },
  { codigo: "E-FV", nombre: "Sistemas fotovoltaicos", uso: "Inversor / autoconsumo", potencia: 3000, pia: 0, seccion: 0, tubo: 0, maxPuntos: 1, puntos: 1, fs: 1, tipo: "especial" },
  { codigo: "E-BOM", nombre: "Bombas", uso: "Grupo de presión", potencia: 1500, pia: 0, seccion: 0, tubo: 0, maxPuntos: 1, puntos: 1, fs: 1, tipo: "especial" },
  { codigo: "E-MAQ", nombre: "Maquinaria", uso: "Receptor monofásico", potencia: 3000, pia: 0, seccion: 0, tubo: 0, maxPuntos: 1, puntos: 1, fs: 1, tipo: "especial" },
  { codigo: "E-OTR", nombre: "Otros receptores", uso: "Uso a definir", potencia: 2000, pia: 0, seccion: 0, tubo: 0, maxPuntos: 1, puntos: 1, fs: 1, tipo: "especial" },
];

export const TIPOS_DIFERENCIAL = [
  { valor: "AC", etiqueta: "AC · corriente alterna senoidal" },
  { valor: "A", etiqueta: "A · con componentes pulsantes" },
  { valor: "F", etiqueta: "F · frecuencia mixta" },
  { valor: "B", etiqueta: "B · corriente continua" },
] as const;

export const TIPOS_TERRENO = [
  { nombre: "Arcilla compacta", resistividad: 100 },
  { nombre: "Arcilla arenosa", resistividad: 150 },
  { nombre: "Arena húmeda", resistividad: 200 },
  { nombre: "Arena seca", resistividad: 500 },
  { nombre: "Grava", resistividad: 1000 },
  { nombre: "Roca", resistividad: 3000 },
] as const;

export const NORMATIVA = [
  {
    ref: "RD 842/2002",
    titulo: "Reglamento Electrotécnico para Baja Tensión (REBT)",
    uso: "Marco reglamentario de toda la instalación.",
  },
  {
    ref: "ITC-BT-10",
    titulo: "Previsión de cargas para suministros en baja tensión",
    uso: "Potencia a prever en el suministro de la vivienda.",
  },
  {
    ref: "ITC-BT-15",
    titulo: "Derivaciones individuales",
    uso: "Características de la derivación individual y su caída de tensión.",
  },
  {
    ref: "ITC-BT-17",
    titulo: "Dispositivos generales e individuales de mando y protección",
    uso: "Composición del cuadro: IGA, diferenciales y protecciones.",
  },
  {
    ref: "ITC-BT-18",
    titulo: "Instalaciones de puesta a tierra",
    uso: "Coordinación entre resistencia de tierra y sensibilidad diferencial.",
  },
  {
    ref: "ITC-BT-19",
    titulo: "Instalaciones interiores o receptoras",
    uso: "Intensidades admisibles (tabla 1), conductores de protección (tabla 2) y caídas de tensión.",
  },
  {
    ref: "ITC-BT-21",
    titulo: "Instalaciones interiores. Tubos y canales protectores",
    uso: "Dimensionado de canalizaciones y ocupación de tubos.",
  },
  {
    ref: "ITC-BT-22",
    titulo: "Protección contra sobreintensidades",
    uso: "Coordinación entre intensidad de diseño, protección y conductor.",
  },
  {
    ref: "ITC-BT-23",
    titulo: "Protección contra sobretensiones",
    uso: "Necesidad de protector contra sobretensiones transitorias.",
  },
  {
    ref: "ITC-BT-24",
    titulo: "Protección contra los contactos directos e indirectos",
    uso: "Empleo de diferenciales de alta sensibilidad y puesta a tierra.",
  },
  {
    ref: "ITC-BT-25",
    titulo: "Instalaciones interiores en viviendas",
    uso: "Circuitos C1-C12, secciones mínimas, grados de electrificación y nº mínimo de diferenciales.",
  },
  {
    ref: "ITC-BT-43",
    titulo: "Receptores para usos domésticos",
    uso: "Condiciones de conexión de receptores domésticos.",
  },
  {
    ref: "ITC-BT-52",
    titulo: "Instalaciones con fines especiales. Recarga de vehículo eléctrico",
    uso: "Circuito de recarga y protecciones específicas.",
  },
  {
    ref: "UNE 20460-5-523",
    titulo: "Intensidades admisibles en los cables",
    uso: "Base de la tabla 1 de la ITC-BT-19 y factores de corrección.",
  },
  {
    ref: "UNE-HD 60364-5-52",
    titulo: "Selección y montaje de los cables",
    uso: "Métodos de instalación y factores de corrección.",
  },
  {
    ref: "UNE 211002 / UNE 21031",
    titulo: "Cables de tensión asignada 450/750 V y 0,6/1 kV",
    uso: "Características de los conductores empleados.",
  },
] as const;

/** Construye un circuito a partir de un preset y un índice. */
export function circuitoDesdePreset(
  preset: PresetCircuito,
  indice: number,
  diferencialId: string,
  idBase?: string,
): Circuito {
  return {
    id: idBase ?? `${preset.codigo}-${Date.now()}-${indice}`,
    codigo: preset.codigo,
    nombre: preset.nombre,
    tipo: preset.tipo,
    uso: preset.uso,
    potencia: preset.potencia,
    fs: preset.fs,
    fases: 1,
    cosPhi: 1,
    rendimiento: 1,
    longitud: preset.tipo === "estandar" ? 15 : 20,
    metodo: "B1",
    aislamiento: "PVC",
    tempAmbiente: 40,
    agrupamiento: 2,
    seccion: 0,
    pia: 0,
    curva: "C",
    polos: 2,
    diferencialId,
    puntos: preset.puntos,
    observaciones: "",
  };
}

export function buscarPreset(codigo: string): PresetCircuito | undefined {
  return [...PRESETS_ITC25, ...PRESETS_ESPECIALES].find(
    (p) => p.codigo === codigo,
  );
}

/**
 * Proyecto nuevo a partir de los datos mínimos del asistente. Si la vivienda
 * supera los 160 m² se prepara directamente la electrificación elevada con los
 * circuitos C1 a C7 que exige la ITC-BT-25.
 */
export function proyectoNuevo(datos: {
  nombre: string;
  cliente?: string;
  municipio?: string;
  superficie?: number;
  tipoVivienda?: string;
}): Proyecto {
  const base = proyectoEjemplo(datos.nombre);
  const superficie = datos.superficie ?? 100;
  const elevada = superficie > 160;

  const presets = elevada
    ? PRESETS_ITC25.slice(0, 7)
    : PRESETS_ITC25.slice(0, 5);

  // Un diferencial por cada cinco circuitos como mínimo (ITC-BT-25).
  const numDiferenciales = Math.max(1, Math.ceil(presets.length / 5));
  const diferenciales: Diferencial[] = Array.from(
    { length: numDiferenciales },
    (_, i) => ({
      id: `dif-${i + 1}`,
      nombre: `Diferencial ${i + 1}`,
      sensibilidad: 30,
      tipo: "A",
      polos: 2,
    }),
  );

  return {
    ...base,
    cliente: datos.cliente ?? "",
    municipio: datos.municipio ?? "",
    superficie,
    tipoVivienda: datos.tipoVivienda ?? "Unifamiliar",
    electrificacion: { ...base.electrificacion, grado: elevada ? "elevada" : "basica" },
    suministro: {
      ...base.suministro,
      potenciaContratada: elevada ? 9200 : 5750,
    },
    diferenciales,
    circuitos: presets.map((p, i) =>
      circuitoDesdePreset(
        p,
        i,
        diferenciales[Math.floor(i / 5)]?.id ?? diferenciales[0].id,
        `c-${i + 1}`,
      ),
    ),
  };
}

/** Proyecto de ejemplo con datos coherentes para empezar a trabajar. */
export function proyectoEjemplo(nombre = "Vivienda unifamiliar"): Proyecto {
  const dif1 = "dif-1";
  const dif2 = "dif-2";
  const circuitos = PRESETS_ITC25.slice(0, 6).map((p, i) =>
    circuitoDesdePreset(p, i, i < 5 ? dif1 : dif2, `c-${i + 1}`),
  );
  return {
    nombre,
    cliente: "",
    nif: "",
    direccion: "",
    cp: "",
    municipio: "",
    provincia: "",
    comunidad: "",
    tipoVivienda: "Unifamiliar",
    superficie: 120,
    habitaciones: 3,
    banos: 2,
    plantas: 1,
    anio: null,
    tipoInstalacion: "nueva",
    tecnico: "",
    empresa: "",
    expediente: "",
    fecha: new Date().toISOString().slice(0, 10),
    suministro: {
      fases: 1,
      cosPhi: 1,
      compania: "",
      longitudDI: 12,
      seccionDI: 10,
      poderCorte: 6,
      potenciaContratada: 5750,
    },
    electrificacion: {
      grado: "basica",
      calefaccion: false,
      climatizacion: false,
      secadora: false,
      lavavajillas: true,
      cocinaElectrica: true,
      horno: true,
      termoElectrico: true,
      aerotermia: false,
      recargaVE: false,
      domotica: false,
      piscina: false,
      automatizacion: false,
      otros: "",
      otrosPotencia: 0,
    },
    circuitos,
    diferenciales: [
      {
        id: dif1,
        nombre: "Diferencial 1",
        sensibilidad: 30,
        tipo: "A",
        polos: 2,
      },
      {
        id: dif2,
        nombre: "Diferencial 2",
        sensibilidad: 30,
        tipo: "A",
        polos: 2,
      },
    ],
    tierra: {
      esquema: "TT",
      tipoTerreno: "Arcilla compacta",
      resistividad: 100,
      numElectrodos: 1,
      longitudPica: 2,
      separacion: 2,
      seccionTierra: 16,
      resistenciaMedida: null,
    },
    ajustes: {
      caidaMaximaPct: 3,
      horasEquivalenteDia: 5,
      precioKwh: 0.15,
    },
  };
}
