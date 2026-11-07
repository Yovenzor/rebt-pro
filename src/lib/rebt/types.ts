/**
 * Tipos del proyecto REBT Pro.
 *
 * Todas las magnitudes eléctricas se guardan en unidades del Sistema
 * Internacional (W, V, A, m, mm², Ω) para que el motor de cálculo no dependa
 * de la interfaz.
 */

export type GradoElectrificacion = "basica" | "elevada";
export type TipoInstalacion = "nueva" | "reforma";
export type MetodoInstalacion = "B1" | "B2" | "C";
export type Aislamiento = "PVC" | "XLPE";
export type CurvaDisparo = "B" | "C" | "D";
export type TipoDiferencial = "AC" | "A" | "F" | "B";
export type EsquemaTierra = "TT" | "TN" | "IT";
export type TipoCircuito = "estandar" | "especial";

export interface Circuito {
  id: string;
  /** Código ITC-BT-25 (C1…C12) o código propio para circuitos especiales. */
  codigo: string;
  nombre: string;
  tipo: TipoCircuito;
  uso: string;
  /** Potencia prevista del circuito (W). */
  potencia: number;
  /** Coeficiente de simultaneidad aplicado a la previsión de cargas. */
  fs: number;
  fases: 1 | 3;
  cosPhi: number;
  rendimiento: number;
  /** Longitud del recorrido desde el cuadro hasta el punto más alejado (m). */
  longitud: number;
  metodo: MetodoInstalacion;
  aislamiento: Aislamiento;
  tempAmbiente: number;
  /** Número de circuitos agrupados en la misma canalización. */
  agrupamiento: number;
  /** Sección fijada por el usuario (mm²). 0 = cálculo automático. */
  seccion: number;
  /** Calibre fijado por el usuario (A). 0 = cálculo automático. */
  pia: number;
  curva: CurvaDisparo;
  polos: 1 | 2 | 3 | 4;
  diferencialId: string;
  /** Puntos de utilización / tomas del circuito. */
  puntos: number;
  observaciones: string;
}

export interface Diferencial {
  id: string;
  nombre: string;
  /** Sensibilidad IΔn en mA. */
  sensibilidad: number;
  tipo: TipoDiferencial;
  polos: 2 | 4;
}

export interface Electrificacion {
  /** Grado declarado en el proyecto (puede no coincidir con el calculado). */
  grado: GradoElectrificacion;
  calefaccion: boolean;
  climatizacion: boolean;
  secadora: boolean;
  lavavajillas: boolean;
  cocinaElectrica: boolean;
  horno: boolean;
  termoElectrico: boolean;
  aerotermia: boolean;
  recargaVE: boolean;
  domotica: boolean;
  piscina: boolean;
  automatizacion: boolean;
  otros: string;
  otrosPotencia: number;
}

export interface Suministro {
  /** Tensión de fase (230 F+N / 400 entre fases en trifásico). */
  fases: 1 | 3;
  cosPhi: number;
  compania: string;
  /** Longitud de la derivación individual (m). */
  longitudDI: number;
  /** Sección de la derivación individual (mm²). 0 = sin definir. */
  seccionDI: number;
  /** Poder de corte de los dispositivos (kA). Dato de proyecto. */
  poderCorte: number;
  /** Potencia contratada (W). 0 = pendiente. */
  potenciaContratada: number;
}

export interface PuestaTierra {
  esquema: EsquemaTierra;
  tipoTerreno: string;
  resistividad: number;
  numElectrodos: number;
  longitudPica: number;
  separacion: number;
  seccionTierra: number;
  /** Resistencia medida en la verificación (Ω). null = no medida. */
  resistenciaMedida: number | null;
}

export interface Ajustes {
  /** Caída de tensión máxima admisible en circuitos interiores (%). */
  caidaMaximaPct: number;
  /** Horas equivalentes diarias a plena carga para estimar consumo. */
  horasEquivalenteDia: number;
  precioKwh: number;
}

export interface Proyecto {
  nombre: string;
  cliente: string;
  nif: string;
  direccion: string;
  cp: string;
  municipio: string;
  provincia: string;
  comunidad: string;
  tipoVivienda: string;
  superficie: number;
  habitaciones: number;
  banos: number;
  plantas: number;
  anio: number | null;
  tipoInstalacion: TipoInstalacion;
  tecnico: string;
  empresa: string;
  expediente: string;
  fecha: string;
  suministro: Suministro;
  electrificacion: Electrificacion;
  circuitos: Circuito[];
  diferenciales: Diferencial[];
  tierra: PuestaTierra;
  ajustes: Ajustes;
}

export interface ResultadoCircuito {
  circuito: Circuito;
  /** Intensidad de diseño (A). */
  ib: number;
  /** Calibre del magnetotérmico adoptado (A). */
  in: number;
  /** Calibre mínimo exigido por ITC-BT-25 para circuitos normalizados. */
  inMinimoNormativo: number;
  seccionMinimaNormativa: number;
  /** Intensidad admisible de tabla (A). */
  izTabla: number;
  factorTemperatura: number;
  factorAgrupamiento: number;
  /** Intensidad admisible corregida (A). */
  izCorregida: number;
  /** Sección necesaria por intensidad admisible (mm²). */
  seccionPorIntensidad: number;
  /** Sección necesaria por caída de tensión (mm²). */
  seccionPorCaida: number;
  seccion: number;
  neutro: number;
  pe: number;
  tubo: number;
  resistencia: number;
  caidaV: number;
  caidaPct: number;
  limitePct: number;
  perdidasW: number;
  estado: "ok" | "aviso" | "error";
  comprobaciones: {
    intensidad: boolean;
    caida: boolean;
    seccionMinima: boolean;
    proteccion: boolean;
    diferencial: boolean;
  };
}

export interface DiferencialCalculado {
  diferencial: Diferencial;
  intensidadAsignada: number;
  circuitos: ResultadoCircuito[];
  estado: "ok" | "aviso" | "error";
}

export interface ResultadoProyecto {
  circuitos: ResultadoCircuito[];
  diferenciales: DiferencialCalculado[];
  potenciaInstalada: number;
  potenciaSimultanea: number;
  potenciaPrevista: number;
  potenciaMinimaGrado: number;
  intensidadTotal: number;
  igaRecomendado: number;
  igaMinimoGrado: number;
  perdidasTotalesW: number;
  perdidasPct: number;
  energiaPerdidaKwhAnio: number;
  costePerdidasAnio: number;
  consumoEstimadoKwhAnio: number;
  costeConsumoAnio: number;
  caidaMaximaPct: number;
  seccionMinima: number;
  fases: { L1: number; L2: number; L3: number } | null;
  desequilibrioPct: number | null;
  tierra: {
    resistenciaEstimada: number | null;
    resistenciaVerificada: number | null;
    limite: number;
    cumple: boolean | null;
    metodo: string;
  };
  gradoCalculado: GradoElectrificacion;
  motivosGrado: string[];
  circuitosObligatorios: string[];
  circuitosFaltantes: string[];
}
