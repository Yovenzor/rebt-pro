/**
 * Generador del presupuesto orientativo de la instalación.
 *
 * Las cantidades se deducen del proyecto calculado: protecciones del cuadro,
 * longitud de cada circuito, sección de cable, tubo, puntos de utilización y
 * puesta a tierra. Los precios son unitarios y editables desde la interfaz; las
 * partidas manuales se suman sin alterar el cálculo automático.
 */

import type { Proyecto, ResultadoProyecto } from "./types";

export type CategoriaPresupuesto = "material" | "manoObra" | "manual";

export interface LineaPresupuesto {
  id: string;
  concepto: string;
  detalle: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
  importe: number;
  categoria: CategoriaPresupuesto;
  automatica: boolean;
}

export interface PresupuestoCalculado {
  lineas: LineaPresupuesto[];
  materiales: number;
  manoObra: number;
  manuales: number;
  subtotal: number;
  ivaPct: number;
  iva: number;
  total: number;
  incluyeDps: boolean;
}

const PRECIO_CABLE: Record<number, number> = {
  1.5: 0.52,
  2.5: 0.72,
  4: 1.02,
  6: 1.42,
  10: 2.15,
  16: 3.3,
  25: 5,
  35: 6.8,
};

const PRECIO_TUBO: Record<number, number> = {
  16: 1.15,
  20: 1.4,
  25: 1.75,
  32: 2.2,
  40: 2.65,
  50: 3.15,
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

const decimal = (n: number) =>
  Number.isInteger(n) ? String(n) : String(n).replace(".", ",");

function precioDiferencial(
  tipo: string,
  sensibilidad: number,
  polos: number,
): number {
  const base = polos === 4 ? 96 : 56;
  const extraTipo =
    tipo === "B" ? 42 : tipo === "F" ? 20 : tipo === "A" ? 0 : -6;
  const extraSensibilidad =
    sensibilidad === 10 ? 12 : sensibilidad === 30 ? 0 : sensibilidad === 100 ? -8 : -12;
  return round2(base + extraTipo + extraSensibilidad);
}

function precioPia(calibre: number, polos: number, curva: string): number {
  const base = 8 + calibre * 0.42 + (polos - 1) * 3.5;
  return round2(base + (curva === "D" ? 5 : curva === "B" ? -1 : 0));
}

export function calcularPresupuesto(
  proyecto: Proyecto,
  resultado: ResultadoProyecto,
): PresupuestoCalculado {
  const config = proyecto.presupuesto ?? {
    ivaPct: 21,
    precios: {},
    lineasManuales: [],
  };
  const incluyeDps = proyecto.protecciones?.sobretensiones ?? true;
  const s = proyecto.suministro;
  const t = proyecto.tierra;
  const lineas: LineaPresupuesto[] = [];

  const add = ({
    id,
    concepto,
    detalle,
    unidad,
    cantidad,
    base,
    categoria = "material",
  }: {
    id: string;
    concepto: string;
    detalle: string;
    unidad: string;
    cantidad: number;
    base: number;
    categoria?: CategoriaPresupuesto;
  }) => {
    if (!(cantidad > 0)) return;
    const override = config.precios?.[id];
    const precioUnitario =
      typeof override === "number" && Number.isFinite(override) && override >= 0
        ? override
        : base;
    lineas.push({
      id,
      concepto,
      detalle,
      unidad,
      cantidad,
      precioUnitario: round2(precioUnitario),
      importe: round2(cantidad * precioUnitario),
      categoria,
      automatica: true,
    });
  };

  // ── Cuadro y protecciones ────────────────────────────────────────────────
  add({
    id: "cuadro",
    concepto: "Cuadro general de mando y protección",
    detalle: "Caja de 36 módulos, embarrado, tapa y accesorios",
    unidad: "ud",
    cantidad: 1,
    base: 110,
  });

  const polosGenerales = s.fases === 3 ? 4 : 2;
  add({
    id: "iga",
    concepto: "Interruptor general automático (IGA)",
    detalle: `${polosGenerales}P · ${resultado.igaRecomendado} A`,
    unidad: "ud",
    cantidad: 1,
    base: polosGenerales === 4 ? 72 : 44,
  });

  if (incluyeDps) {
    add({
      id: "dps",
      concepto: "Protector contra sobretensiones (DPS)",
      detalle: `Tipo 2 · ${polosGenerales}P`,
      unidad: "ud",
      cantidad: 1,
      base: polosGenerales === 4 ? 145 : 98,
    });
  }

  const gruposDiferenciales = new Map<
    string,
    { tipo: string; sensibilidad: number; polos: number; cantidad: number }
  >();
  for (const d of resultado.diferenciales) {
    const key = `dif-${d.diferencial.tipo}-${d.diferencial.sensibilidad}-${d.diferencial.polos}`;
    const actual = gruposDiferenciales.get(key) ?? {
      tipo: d.diferencial.tipo,
      sensibilidad: d.diferencial.sensibilidad,
      polos: d.diferencial.polos,
      cantidad: 0,
    };
    actual.cantidad += 1;
    gruposDiferenciales.set(key, actual);
  }
  for (const [id, d] of gruposDiferenciales) {
    add({
      id,
      concepto: `Interruptor diferencial tipo ${d.tipo} · ${d.sensibilidad} mA`,
      detalle: `${d.polos}P · alta sensibilidad`,
      unidad: "ud",
      cantidad: d.cantidad,
      base: precioDiferencial(d.tipo, d.sensibilidad, d.polos),
    });
  }

  const gruposPias = new Map<
    string,
    { calibre: number; polos: number; curva: string; cantidad: number }
  >();
  for (const r of resultado.circuitos) {
    const key = `pia-${r.in}-${r.circuito.polos}-${r.circuito.curva}`;
    const actual = gruposPias.get(key) ?? {
      calibre: r.in,
      polos: r.circuito.polos,
      curva: r.circuito.curva,
      cantidad: 0,
    };
    actual.cantidad += 1;
    gruposPias.set(key, actual);
  }
  for (const [id, p] of gruposPias) {
    add({
      id,
      concepto: `Magnetotérmico ${p.calibre} A · curva ${p.curva}`,
      detalle: `${p.polos}P · protección de circuito`,
      unidad: "ud",
      cantidad: p.cantidad,
      base: precioPia(p.calibre, p.polos, p.curva),
    });
  }

  // ── Cable, tubo y mecanismos ─────────────────────────────────────────────
  const metrosCable = new Map<number, number>();
  const metrosTubo = new Map<number, number>();
  let totalPuntos = 0;

  for (const r of resultado.circuitos) {
    const longitud = Math.max(0, r.circuito.longitud);
    // Fase(s) y neutro. El conductor de protección se contabiliza aparte
    // porque su sección puede ser distinta en circuitos de gran sección.
    const conductoresFaseNeutro = r.circuito.fases === 3 ? 4 : 2;
    metrosCable.set(
      r.seccion,
      (metrosCable.get(r.seccion) ?? 0) + longitud * conductoresFaseNeutro,
    );
    metrosCable.set(r.pe, (metrosCable.get(r.pe) ?? 0) + longitud);
    metrosTubo.set(
      r.tubo,
      (metrosTubo.get(r.tubo) ?? 0) + longitud * 1.05,
    );
    totalPuntos += Math.max(0, r.circuito.puntos);
  }

  for (const [seccion, metros] of [...metrosCable.entries()].sort(
    (a, b) => a[0] - b[0],
  )) {
    add({
      id: `cable-${seccion}`,
      concepto: `Conductor de cobre H07V-K ${decimal(seccion)} mm²`,
      detalle: "Fase, neutro y protección · incluye 10 % de merma",
      unidad: "m",
      cantidad: Math.ceil(metros * 1.1),
      base: PRECIO_CABLE[seccion] ?? 8,
    });
  }

  for (const [diametro, metros] of [...metrosTubo.entries()].sort(
    (a, b) => a[0] - b[0],
  )) {
    add({
      id: `tubo-${diametro}`,
      concepto: `Tubo corrugado Ø${diametro} mm`,
      detalle: "Instalación empotrada · incluye 5 % de merma",
      unidad: "m",
      cantidad: Math.ceil(metros),
      base: PRECIO_TUBO[diametro] ?? 3.2,
    });
  }

  add({
    id: "cajas",
    concepto: "Cajas de derivación y registro",
    detalle: "Una por circuito y una en el cuadro",
    unidad: "ud",
    cantidad: resultado.circuitos.length + 1,
    base: 4.5,
  });

  add({
    id: "puntos",
    concepto: "Puntos de utilización",
    detalle: "Interruptores, tomas y puntos de luz",
    unidad: "punto",
    cantidad: totalPuntos,
    base: 12.5,
  });

  // ── Puesta a tierra ──────────────────────────────────────────────────────
  add({
    id: "tierra-picas",
    concepto: "Pica de puesta a tierra",
    detalle: `${decimal(t.longitudPica)} m · acero cobreado`,
    unidad: "ud",
    cantidad: t.numElectrodos,
    base: 24,
  });

  const longitudTierra = Math.max(
    5,
    s.longitudDI + 4 + t.numElectrodos * t.longitudPica,
  );
  add({
    id: "tierra-conductor",
    concepto: `Conductor de tierra ${decimal(t.seccionTierra)} mm²`,
    detalle: "Cobre aislado verde/amarillo",
    unidad: "m",
    cantidad: Math.ceil(longitudTierra * 1.05),
    base: round2((PRECIO_CABLE[t.seccionTierra] ?? 4.5) * 1.3),
  });

  add({
    id: "tierra-caja",
    concepto: "Caja de conexión de tierra",
    detalle: "Con puente equipotencial y bornes",
    unidad: "ud",
    cantidad: 1,
    base: 18,
  });

  // ── Mano de obra y pequeño material ──────────────────────────────────────
  add({
    id: "mo-cuadro",
    concepto: "Mano de obra: cuadro y cableado",
    detalle: "Montaje, conexionado y pruebas",
    unidad: "global",
    cantidad: 1,
    base: 190,
    categoria: "manoObra",
  });

  add({
    id: "mo-puntos",
    concepto: "Mano de obra: puntos de utilización",
    detalle: "Instalación de mecanismos y remates",
    unidad: "punto",
    cantidad: totalPuntos,
    base: 20,
    categoria: "manoObra",
  });

  add({
    id: "mo-tierra",
    concepto: "Mano de obra: puesta a tierra",
    detalle: "Ejecución, conexión y comprobación",
    unidad: "global",
    cantidad: 1,
    base: 80,
    categoria: "manoObra",
  });

  const materialSinConsumibles = lineas
    .filter((l) => l.categoria === "material")
    .reduce((suma, l) => suma + l.importe, 0);
  add({
    id: "pequeno-material",
    concepto: "Pequeño material y consumibles",
    detalle: "Cinta, abrazaderas, tornillería y remates (4 %)",
    unidad: "global",
    cantidad: 1,
    base: round2(materialSinConsumibles * 0.04),
    categoria: "material",
  });

  // ── Partidas manuales ────────────────────────────────────────────────────
  for (const l of config.lineasManuales ?? []) {
    const cantidad = Number.isFinite(l.cantidad) ? Math.max(0, l.cantidad) : 0;
    const precioUnitario = Number.isFinite(l.precioUnitario)
      ? Math.max(0, l.precioUnitario)
      : 0;
    lineas.push({
      id: l.id,
      concepto: (l.descripcion ?? "").trim() || "Partida adicional",
      detalle: "Añadida manualmente",
      unidad: (l.unidad ?? "").trim() || "ud",
      cantidad,
      precioUnitario: round2(precioUnitario),
      importe: round2(cantidad * precioUnitario),
      categoria: "manual",
      automatica: false,
    });
  }

  const sumar = (categoria: CategoriaPresupuesto) =>
    round2(
      lineas
        .filter((l) => l.categoria === categoria)
        .reduce((suma, l) => suma + l.importe, 0),
    );

  const materiales = sumar("material");
  const manoObra = sumar("manoObra");
  const manuales = sumar("manual");
  const subtotal = round2(materiales + manoObra + manuales);
  const ivaPct = Math.min(
    100,
    Math.max(0, Number.isFinite(config.ivaPct) ? config.ivaPct : 21),
  );
  const iva = round2((subtotal * ivaPct) / 100);

  return {
    lineas,
    materiales,
    manoObra,
    manuales,
    subtotal,
    ivaPct,
    iva,
    total: round2(subtotal + iva),
    incluyeDps,
  };
}
