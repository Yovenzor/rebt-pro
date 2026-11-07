/**
 * Detector de errores y comprobaciones de cumplimiento.
 *
 * Cada hallazgo conoce el módulo y el campo exacto que lo origina, de modo que
 * la interfaz puede abrir esa sección, resaltar el dato y proponer la solución.
 */

import { PRESETS_ITC25, POTENCIA_MINIMA_GRADO } from "./data";
import { calcularProyecto, presetDe } from "./engine";
import type { Proyecto, ResultadoProyecto } from "./types";

export type Severidad =
  | "critico"
  | "incumplimiento"
  | "advertencia"
  | "recomendacion"
  | "pendiente";

export type SeccionId =
  | "resumen"
  | "datos"
  | "electrificacion"
  | "circuitos"
  | "calculos"
  | "cuadro"
  | "tierra"
  | "validacion"
  | "memoria";

export interface Hallazgo {
  id: string;
  severidad: Severidad;
  titulo: string;
  detalle: string;
  normativa: string;
  solucion: string;
  seccion: SeccionId;
  /** Identificador del circuito afectado, si procede. */
  circuitoId?: string;
  /** Campo del formulario que debe resaltarse. */
  campo?: string;
  valorActual?: string;
  valorPropuesto?: string;
}

export const SEVERIDAD_INFO: Record<
  Severidad,
  { etiqueta: string; orden: number }
> = {
  critico: { etiqueta: "Error crítico", orden: 0 },
  incumplimiento: { etiqueta: "Incumplimiento", orden: 1 },
  advertencia: { etiqueta: "Advertencia", orden: 2 },
  recomendacion: { etiqueta: "Recomendación", orden: 3 },
  pendiente: { etiqueta: "Dato pendiente", orden: 4 },
};

const POTENCIA_MAXIMA_POR_CODIGO: Record<string, number> = {
  C1: 2300,
  C2: 5750,
  C3: 5750,
  C4: 5750,
  C5: 5750,
  C6: 2300,
  C7: 5750,
  C8: 5750,
  C9: 5750,
  C10: 5750,
  C11: 2300,
  C12: 5750,
};

export function analizarProyecto(
  proyecto: Proyecto,
  resultado: ResultadoProyecto = calcularProyecto(proyecto),
): Hallazgo[] {
  const h: Hallazgo[] = [];

  // ── Datos de proyecto ────────────────────────────────────────────────────
  const faltantes: { campo: keyof Proyecto; etiqueta: string }[] = [
    { campo: "cliente", etiqueta: "nombre del cliente" },
    { campo: "direccion", etiqueta: "dirección de la instalación" },
    { campo: "municipio", etiqueta: "municipio" },
    { campo: "provincia", etiqueta: "provincia" },
    { campo: "tecnico", etiqueta: "técnico responsable" },
  ];
  for (const f of faltantes) {
    const valor = proyecto[f.campo];
    if (!valor || (typeof valor === "string" && valor.trim() === "")) {
      h.push({
        id: `dato-${f.campo}`,
        severidad: "pendiente",
        titulo: `Falta ${f.etiqueta}`,
        detalle: `El documento técnico debe identificar ${f.etiqueta}. Sin este dato la memoria no puede emitirse como documento completo.`,
        normativa: "ITC-BT-25 · datos de la instalación y del titular",
        solucion: `Complete ${f.etiqueta} en el módulo «Datos y suministro».`,
        seccion: "datos",
        campo: f.campo,
      });
    }
  }

  if (proyecto.circuitos.length === 0) {
    h.push({
      id: "sin-circuitos",
      severidad: "critico",
      titulo: "La instalación no tiene circuitos",
      detalle:
        "No es posible calcular ni documentar una instalación sin circuitos de utilización.",
      normativa: "ITC-BT-25 · número de circuitos y características",
      solucion: "Añada los circuitos mínimos del grado de electrificación.",
      seccion: "circuitos",
      campo: "nuevo-circuito",
    });
    return h;
  }

  // ── Grado de electrificación ─────────────────────────────────────────────
  const gradoDeclarado = proyecto.electrificacion.grado;
  if (resultado.gradoCalculado === "elevada" && gradoDeclarado === "basica") {
    h.push({
      id: "grado-insuficiente",
      severidad: "incumplimiento",
      titulo: "Grado de electrificación insuficiente",
      detalle: `La ITC-BT-25 exige electrificación elevada por: ${resultado.motivosGrado.join(
        "; ",
      )}. El proyecto declara electrificación básica.`,
      normativa: "ITC-BT-25 · grados de electrificación",
      solucion:
        "Cambie el grado a electrificación elevada y revise la previsión de potencia (mínimo 9.200 W).",
      seccion: "electrificacion",
      campo: "grado",
      valorActual: "Básica",
      valorPropuesto: "Elevada",
    });
  }

  if (resultado.circuitosFaltantes.length > 0) {
    h.push({
      id: "circuitos-faltantes",
      severidad: "critico",
      titulo: "Faltan circuitos exigidos por la ITC-BT-25",
      detalle: `Para este grado de electrificación y receptores previstos faltan: ${resultado.circuitosFaltantes.join(
        ", ",
      )}.`,
      normativa: "ITC-BT-25 · circuitos mínimos según grado",
      solucion:
        "Añada los circuitos indicados desde el selector de circuitos normalizados.",
      seccion: "circuitos",
      campo: "nuevo-circuito",
    });
  }

  // ── Circuitos ────────────────────────────────────────────────────────────
  const codigosVistos = new Map<string, number>();
  for (const r of resultado.circuitos) {
    const c = r.circuito;
    const nombre = `${c.codigo} · ${c.nombre}`;
    codigosVistos.set(c.codigo, (codigosVistos.get(c.codigo) ?? 0) + 1);

    const diferencialValido = proyecto.diferenciales.some(
      (d) => d.id === c.diferencialId,
    );
    if (!diferencialValido) {
      h.push({
        id: `sin-diferencial-${c.id}`,
        severidad: "critico",
        titulo: `Circuito sin protección diferencial: ${nombre}`,
        detalle:
          "El circuito no está asignado a ningún interruptor diferencial válido, por lo que no queda cubierta la protección contra contactos indirectos.",
        normativa: "ITC-BT-25 · protección diferencial de los circuitos",
        solucion:
          "Asigne el circuito a un diferencial de 30 mA o cree uno nuevo en el módulo del cuadro.",
        seccion: "cuadro",
        circuitoId: c.id,
        campo: `diferencial-${c.diferencialId || "nuevo"}`,
      });
    }

    if (c.longitud <= 0) {
      h.push({
        id: `longitud-${c.id}`,
        severidad: "pendiente",
        titulo: `Longitud sin definir en ${nombre}`,
        detalle:
          "Sin longitud no puede comprobarse la caída de tensión del circuito.",
        normativa: "ITC-BT-19 · caídas de tensión",
        solucion:
          "Introduzca la distancia desde el cuadro hasta el punto de utilización más alejado.",
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "longitud",
      });
    }

    if (!r.comprobaciones.caida) {
      h.push({
        id: `caida-${c.id}`,
        severidad: "critico",
        titulo: `Caída de tensión excesiva en ${nombre}`,
        detalle: `La caída calculada es ${r.caidaPct.toFixed(
          2,
        )} % y el límite adoptado es ${r.limitePct} %.`,
        normativa:
          "ITC-BT-25 · la sección se condiciona a una caída de tensión máxima del 3 %",
        solucion: `Aumente la sección a ${r.seccionPorCaida} mm² o reduzca la longitud del recorrido.`,
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "seccion",
        valorActual: `${r.caidaPct.toFixed(2)} %`,
        valorPropuesto: `S = ${r.seccionPorCaida} mm²`,
      });
    }

    if (!r.comprobaciones.intensidad) {
      h.push({
        id: `intensidad-${c.id}`,
        severidad: "critico",
        titulo: `Sección insuficiente en ${nombre}`,
        detalle: `La intensidad admisible corregida (${r.izCorregida} A) es inferior al calibre del magnetotérmico (${r.in} A).`,
        normativa: "ITC-BT-19 · tabla 1 y factores de corrección",
        solucion: `Eleve la sección a ${r.seccionPorIntensidad} mm² o reduzca el calibre del magnetotérmico.`,
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "seccion",
        valorActual: `${r.seccion} mm²`,
        valorPropuesto: `${r.seccionPorIntensidad} mm²`,
      });
    }

    if (!r.comprobaciones.proteccion) {
      h.push({
        id: `proteccion-${c.id}`,
        severidad: "critico",
        titulo: `Magnetotérmico insuficiente en ${nombre}`,
        detalle: `La intensidad de diseño es ${r.ib.toFixed(
          1,
        )} A y el magnetotérmico instalado es de ${r.in} A.`,
        normativa: "ITC-BT-22 · protección contra sobreintensidades",
        solucion: `Instale un magnetotérmico de calibre igual o superior a ${r.ib.toFixed(
          1,
        )} A (recomendado ${Math.max(r.inMinimoNormativo, 0) || "el calculado"} A).`,
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "pia",
        valorActual: `${r.in} A`,
        valorPropuesto: `${r.in} A → aumentar calibre`,
      });
    }

    if (!r.comprobaciones.seccionMinima) {
      h.push({
        id: `seccion-min-${c.id}`,
        severidad: "incumplimiento",
        titulo: `Sección inferior al mínimo normativo en ${nombre}`,
        detalle: `La sección instalada (${r.seccion} mm²) es inferior al mínimo de la ITC-BT-25 (${r.seccionMinimaNormativa} mm²).`,
        normativa: "ITC-BT-25 · tabla 1, secciones mínimas",
        solucion: `Adopte una sección de ${r.seccionMinimaNormativa} mm² como mínimo.`,
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "seccion",
        valorActual: `${r.seccion} mm²`,
        valorPropuesto: `${r.seccionMinimaNormativa} mm²`,
      });
    }

    if (c.pia > 0 && c.pia < r.inMinimoNormativo) {
      h.push({
        id: `pia-normativo-${c.id}`,
        severidad: "incumplimiento",
        titulo: `Calibre por debajo del previsto en ${nombre}`,
        detalle: `La ITC-BT-25 prevé un interruptor automático de ${r.inMinimoNormativo} A para este circuito y se han configurado ${c.pia} A.`,
        normativa: "ITC-BT-25 · tabla 1",
        solucion: `Configure el magnetotérmico en ${r.inMinimoNormativo} A.`,
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "pia",
        valorActual: `${c.pia} A`,
        valorPropuesto: `${r.inMinimoNormativo} A`,
      });
    }

    const maxPotencia = POTENCIA_MAXIMA_POR_CODIGO[c.codigo];
    if (c.tipo === "estandar" && maxPotencia && c.potencia > maxPotencia) {
      h.push({
        id: `potencia-max-${c.id}`,
        severidad: "incumplimiento",
        titulo: `Potencia superior a la admisible en ${nombre}`,
        detalle: `La potencia del circuito (${c.potencia} W) supera el máximo previsto para el ${c.codigo} (${maxPotencia} W).`,
        normativa: "ITC-BT-25 · tabla 1, notas",
        solucion:
          "Reduzca la potencia del circuito o desdoble el circuito con uno adicional (C12).",
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "potencia",
        valorActual: `${c.potencia} W`,
        valorPropuesto: `≤ ${maxPotencia} W`,
      });
    }

    const preset = presetDe(c.codigo);
    if (preset && c.puntos > preset.maxPuntos) {
      h.push({
        id: `puntos-${c.id}`,
        severidad: "advertencia",
        titulo: `Exceso de puntos de utilización en ${nombre}`,
        detalle: `El circuito tiene ${c.puntos} puntos y la ITC-BT-25 admite un máximo de ${preset.maxPuntos}.`,
        normativa: "ITC-BT-25 · tabla 1, máximo nº de puntos",
        solucion:
          "Distribuya los puntos en un circuito adicional del mismo tipo (C6, C7 o C12).",
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "puntos",
        valorActual: `${c.puntos}`,
        valorPropuesto: `≤ ${preset.maxPuntos}`,
      });
    }

    if (c.potencia === 0) {
      h.push({
        id: `potencia-cero-${c.id}`,
        severidad: "pendiente",
        titulo: `Potencia sin definir en ${nombre}`,
        detalle:
          "Un circuito con potencia nula no puede dimensionarse ni justificarse.",
        normativa: "ITC-BT-25 · previsión de cargas",
        solucion: "Introduzca la potencia prevista del circuito.",
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "potencia",
      });
    }

    if (c.seccion > 0 && c.seccion > r.seccionPorCaida && c.seccion > r.seccionPorIntensidad) {
      h.push({
        id: `sobredimensionado-${c.id}`,
        severidad: "recomendacion",
        titulo: `Sección sobredimensionada en ${nombre}`,
        detalle: `Con ${r.seccion} mm² se cumple holgadamente; el cálculo pide ${Math.max(
          r.seccionPorCaida,
          r.seccionPorIntensidad,
        )} mm².`,
        normativa: "ITC-BT-19 · criterios de dimensionado",
        solucion:
          "Puede reducir la sección para optimizar el coste, verificando la coordinación con la protección.",
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "seccion",
      });
    }

    if (c.fases === 3 && c.polos < 3) {
      h.push({
        id: `polos-${c.id}`,
        severidad: "incumplimiento",
        titulo: `Número de polos insuficiente en ${nombre}`,
        detalle:
          "Un circuito trifásico requiere protección omnipolar (mínimo 3 polos).",
        normativa: "ITC-BT-25 · protección de circuitos",
        solucion: "Configure el magnetotérmico con 3 o 4 polos.",
        seccion: "circuitos",
        circuitoId: c.id,
        campo: "polos",
      });
    }
  }

  for (const [codigo, veces] of codigosVistos) {
    if (veces > 1) {
      h.push({
        id: `codigo-duplicado-${codigo}`,
        severidad: "advertencia",
        titulo: `Código ${codigo} repetido`,
        detalle: `Hay ${veces} circuitos con el mismo código ${codigo}. La ITC-BT-25 identifica cada circuito con un código único.`,
        normativa: "ITC-BT-25 · identificación de circuitos",
        solucion:
          "Renombra los circuitos adicionales con su código correspondiente (C6, C7 o C12) para evitar duplicidades en la documentación.",
        seccion: "circuitos",
        campo: "nuevo-circuito",
      });
    }
  }

  // ── Cuadro eléctrico ─────────────────────────────────────────────────────
  if (proyecto.diferenciales.length === 0) {
    h.push({
      id: "sin-diferenciales",
      severidad: "critico",
      titulo: "No hay interruptores diferenciales",
      detalle:
        "Todos los circuitos de la vivienda deben estar protegidos por diferenciales de alta sensibilidad.",
      normativa: "ITC-BT-25 · protección contra contactos indirectos",
      solucion: "Añada al menos un diferencial de 30 mA tipo A.",
      seccion: "cuadro",
      campo: "nuevo-diferencial",
    });
  }

  for (const d of resultado.diferenciales) {
    if (d.circuitos.length === 0) {
      h.push({
        id: `dif-vacio-${d.diferencial.id}`,
        severidad: "advertencia",
        titulo: `${d.diferencial.nombre} sin circuitos asignados`,
        detalle:
          "Un diferencial sin circuitos no protege ninguna carga y ocupa espacio en el cuadro.",
        normativa: "ITC-BT-17 · dispositivos de mando y protección",
        solucion: "Asigne circuitos o elimine el diferencial.",
        seccion: "cuadro",
        campo: `diferencial-${d.diferencial.id}`,
      });
    }

    if (d.diferencial.sensibilidad > 30) {
      h.push({
        id: `dif-sens-${d.diferencial.id}`,
        severidad: "incumplimiento",
        titulo: `Sensibilidad insuficiente en ${d.diferencial.nombre}`,
        detalle: `La sensibilidad configurada es ${d.diferencial.sensibilidad} mA; en viviendas se exige ≤ 30 mA.`,
        normativa: "ITC-BT-25 · diferenciales de alta sensibilidad",
        solucion: "Configure la sensibilidad en 30 mA.",
        seccion: "cuadro",
        campo: `sensibilidad-${d.diferencial.id}`,
        valorActual: `${d.diferencial.sensibilidad} mA`,
        valorPropuesto: "30 mA",
      });
    }

    if (d.circuitos.length > 5) {
      h.push({
        id: `dif-grupo-${d.diferencial.id}`,
        severidad: "incumplimiento",
        titulo: `Exceso de circuitos en ${d.diferencial.nombre}`,
        detalle: `Agrupa ${d.circuitos.length} circuitos; la ITC-BT-25 exige como mínimo un diferencial por cada cinco circuitos instalados.`,
        normativa: "ITC-BT-25 · un diferencial como mínimo por cada cinco circuitos",
        solucion:
          "Reparta los circuitos en otro diferencial de 30 mA hasta dejar cinco por dispositivo.",
        seccion: "cuadro",
        campo: `diferencial-${d.diferencial.id}`,
        valorActual: `${d.circuitos.length} circuitos`,
        valorPropuesto: "≤ 5 circuitos",
      });
    }

    if (d.diferencial.sensibilidad <= 30 && d.intensidadAsignada < resultado.igaRecomendado) {
      h.push({
        id: `dif-calibre-${d.diferencial.id}`,
        severidad: "incumplimiento",
        titulo: `Calibre del diferencial inferior al IGA`,
        detalle: `La intensidad asignada del diferencial debe ser igual o superior a la del interruptor general (${resultado.igaRecomendado} A).`,
        normativa: "ITC-BT-25 · intensidad asignada del diferencial",
        solucion: `Adopte un diferencial de ${resultado.igaRecomendado} A como mínimo.`,
        seccion: "cuadro",
        campo: `diferencial-${d.diferencial.id}`,
      });
    }

    const tiposSugeridos = d.circuitos.some((c) =>
      ["C11", "C12", "E-VE", "E-FV", "E-INF"].includes(c.circuito.codigo),
    );
    if (tiposSugeridos && d.diferencial.tipo === "AC") {
      h.push({
        id: `dif-tipo-${d.diferencial.id}`,
        severidad: "advertencia",
        titulo: `Tipo de diferencial a revisar en ${d.diferencial.nombre}`,
        detalle:
          "Protege circuitos con electrónica de potencia o corrientes pulsantes; un diferencial tipo AC puede no detectar la fuga.",
        normativa: "ITC-BT-24 / ITC-BT-25 · tipo de diferencial según la carga",
        solucion: "Utilice un diferencial tipo A (o F/B según el receptor).",
        seccion: "cuadro",
        campo: `tipo-${d.diferencial.id}`,
      });
    }
  }

  if (resultado.igaRecomendado < resultado.igaMinimoGrado) {
    h.push({
      id: "iga-calibre",
      severidad: "incumplimiento",
      titulo: "Calibre del IGA insuficiente",
      detalle: `El grado de electrificación ${resultado.gradoCalculado} exige un IGA mínimo de ${resultado.igaMinimoGrado} A y la intensidad prevista es ${resultado.intensidadTotal} A.`,
      normativa: "ITC-BT-25 · interruptor general automático",
      solucion: `Adopte un IGA de ${resultado.igaRecomendado} A.`,
      seccion: "cuadro",
      campo: "iga",
      valorActual: `${resultado.igaRecomendado} A`,
    });
  }

  if (resultado.potenciaPrevista < POTENCIA_MINIMA_GRADO[resultado.gradoCalculado]) {
    h.push({
      id: "potencia-insuficiente",
      severidad: "incumplimiento",
      titulo: "Potencia prevista insuficiente",
      detalle: `La potencia a prever (${resultado.potenciaPrevista} W) es inferior al mínimo del grado ${resultado.gradoCalculado} (${POTENCIA_MINIMA_GRADO[resultado.gradoCalculado]} W).`,
      normativa: "ITC-BT-25 · previsión de potencia",
      solucion:
        "Ajuste la potencia contratada o la previsión de cargas al mínimo reglamentario.",
      seccion: "datos",
      campo: "potenciaContratada",
    });
  }

  if (
    resultado.desequilibrioPct !== null &&
    resultado.desequilibrioPct > 15
  ) {
    h.push({
      id: "desequilibrio",
      severidad: "advertencia",
      titulo: "Desequilibrio de fases elevado",
      detalle: `El desequilibrio entre fases es del ${resultado.desequilibrioPct} %. Un reparto más homogéneo reduce la corriente por el neutro.`,
      normativa: "ITC-BT-19 · equilibrio de cargas entre fases",
      solucion:
        "Redistribuya los circuitos entre L1, L2 y L3 para acercar las intensidades.",
      seccion: "calculos",
      campo: "fases",
    });
  }

  if (
    proyecto.suministro.seccionDI <= 0 ||
    proyecto.suministro.longitudDI <= 0
  ) {
    h.push({
      id: "di-pendiente",
      severidad: "pendiente",
      titulo: "Derivación individual sin definir",
      detalle:
        "Faltan la longitud o la sección de la derivación individual para comprobar su caída de tensión.",
      normativa: "ITC-BT-15 · derivaciones individuales",
      solucion:
        "Complete la longitud y la sección de la derivación individual.",
      seccion: "datos",
      campo: "seccionDI",
    });
  }

  // ── Puesta a tierra ──────────────────────────────────────────────────────
  const t = resultado.tierra;
  if (t.cumple === false) {
    h.push({
      id: "tierra-resistencia",
      severidad: "critico",
      titulo: "Resistencia de tierra excesiva",
      detalle: `El valor considerado (${t.resistenciaVerificada ?? t.resistenciaEstimada} Ω) supera el límite de ${t.limite} Ω para 50/IΔn con la sensibilidad instalada.`,
      normativa: "ITC-BT-18 · coordinación con la protección diferencial",
      solucion:
        "Mejore el electrodo (más picas, mayor longitud, anillo) o reduzca la sensibilidad del diferencial y verifique con medida.",
      seccion: "tierra",
      campo: "resistenciaMedida",
    });
  }
  if (t.resistenciaVerificada === null) {
    h.push({
      id: "tierra-medida",
      severidad: "pendiente",
      titulo: "Resistencia de tierra sin verificar",
      detalle:
        "La memoria incluye una estimación analítica, pero la conformidad exige la medición en obra por el instalador habilitado.",
      normativa: "ITC-BT-18 / ITC-BT-19 · verificación de la puesta a tierra",
      solucion:
        "Introduzca la resistencia medida con telurómetro y consérvela en el expediente.",
      seccion: "tierra",
      campo: "resistenciaMedida",
      valorActual: t.resistenciaEstimada ? `${t.resistenciaEstimada} Ω (estimada)` : "—",
    });
  }
  if (proyecto.tierra.esquema !== "TT") {
    h.push({
      id: "tierra-esquema",
      severidad: "advertencia",
      titulo: "Esquema de conexión a tierra distinto de TT",
      detalle: `Se ha declarado esquema ${proyecto.tierra.esquema}. En viviendas alimentadas desde la red de distribución el esquema habitual es TT y las prescripciones de la ITC-BT-18 son específicas.`,
      normativa: "ITC-BT-18 · esquemas de conexión a tierra",
      solucion:
        "Confirme el esquema con la empresa distribuidora y documente las condiciones de protección.",
      seccion: "tierra",
      campo: "esquema",
    });
  }

  // ── Recomendaciones ──────────────────────────────────────────────────────
  if (resultado.potenciaSimultanea > resultado.potenciaPrevista) {
    h.push({
      id: "potencia-contratada",
      severidad: "recomendacion",
      titulo: "Revise la potencia a contratar",
      detalle: `La potencia simultánea estimada (${resultado.potenciaSimultanea} W) supera la potencia prevista (${resultado.potenciaPrevista} W). El ICP limitará la demanda real.`,
      normativa: "ITC-BT-10 · previsión de cargas",
      solucion:
        "Si la simultaneidad es realista, contrate una potencia superior o redistribuya las cargas.",
      seccion: "datos",
      campo: "potenciaContratada",
    });
  }

  if (resultado.perdidasPct > 3) {
    h.push({
      id: "perdidas-altas",
      severidad: "recomendacion",
      titulo: "Pérdidas por efecto Joule elevadas",
      detalle: `Las pérdidas suponen el ${resultado.perdidasPct} % de la potencia instalada (${resultado.perdidasTotalesW} W).`,
      normativa: "ITC-BT-19 · criterios de eficiencia energética",
      solucion:
        "Aumente la sección de los circuitos con mayor longitud o reduzca sus recorridos.",
      seccion: "calculos",
      campo: "perdidas",
    });
  }

  const orden: Severidad[] = [
    "critico",
    "incumplimiento",
    "advertencia",
    "pendiente",
    "recomendacion",
  ];
  return h.sort(
    (a, b) => orden.indexOf(a.severidad) - orden.indexOf(b.severidad),
  );
}

export function resumenHallazgos(hallazgos: Hallazgo[]) {
  const cuenta = (s: Severidad) =>
    hallazgos.filter((x) => x.severidad === s).length;
  const criticos = cuenta("critico");
  const incumplimientos = cuenta("incumplimiento");
  const advertencias = cuenta("advertencia");
  const pendientes = cuenta("pendiente");
  const recomendaciones = cuenta("recomendacion");

  const puedeValidar = criticos === 0 && incumplimientos === 0 && pendientes === 0;

  return {
    criticos,
    incumplimientos,
    advertencias,
    pendientes,
    recomendaciones,
    total: hallazgos.length,
    puedeValidar,
  };
}

/** Circuitos normalizados que aún no están en el proyecto. */
export function circuitosDisponibles(proyecto: Proyecto) {
  const usados = new Set(proyecto.circuitos.map((c) => c.codigo));
  return PRESETS_ITC25.filter((p) => !usados.has(p.codigo));
}
