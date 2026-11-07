/**
 * Verificación del motor de cálculo con casos contrastados con la Guía Técnica
 * de Aplicación del REBT (Anexo 2, cálculo de caídas de tensión) y con las
 * tablas de la ITC-BT-19 / ITC-BT-25.
 *
 * Ejecutar con:  bun scripts/verify-engine.ts
 */

import assert from "node:assert/strict";
import {
  factorAgrupamiento,
  factorTemperatura,
  intensidadAdmisible,
  seccionPE,
  POTENCIA_MINIMA_GRADO,
} from "../src/lib/rebt/data";
import {
  calcularCircuito,
  calcularProyecto,
  menorCalibre,
} from "../src/lib/rebt/engine";
import {
  proyectoEjemplo,
  circuitoDesdePreset,
  PRESETS_ITC25,
  PRESETS_ESPECIALES,
} from "../src/lib/rebt/data";
import { analizarProyecto } from "../src/lib/rebt/findings";
import type { Circuito } from "../src/lib/rebt/types";

let pasadas = 0;

function test(nombre: string, fn: () => void) {
  try {
    fn();
    pasadas += 1;
    console.log(`✓ ${nombre}`);
  } catch (error) {
    console.error(`✗ ${nombre}`);
    throw error;
  }
}

function circuito(codigo: string, cambios: Partial<Circuito> = {}): Circuito {
  const preset = [...PRESETS_ITC25, ...PRESETS_ESPECIALES].find(
    (p) => p.codigo === codigo,
  )!;
  return {
    ...circuitoDesdePreset(preset, 0, "dif-1", `test-${codigo}`),
    agrupamiento: 1,
    tempAmbiente: 40,
    ...cambios,
  };
}

// ── Tablas normativas ─────────────────────────────────────────────────────
test("ITC-BT-19 tabla 1: B1 PVC 2 conductores cargados", () => {
  assert.equal(intensidadAdmisible(1.5, "B1", "PVC", 2), 15);
  assert.equal(intensidadAdmisible(2.5, "B1", "PVC", 2), 21);
  assert.equal(intensidadAdmisible(4, "B1", "PVC", 2), 27);
  assert.equal(intensidadAdmisible(6, "B1", "PVC", 2), 36);
  assert.equal(intensidadAdmisible(10, "B1", "PVC", 2), 50);
});

test("ITC-BT-19 tabla 1: B1 PVC 3 conductores cargados", () => {
  assert.equal(intensidadAdmisible(1.5, "B1", "PVC", 3), 13.5);
  assert.equal(intensidadAdmisible(6, "B1", "PVC", 3), 31);
});

test("ITC-BT-19 tabla 2: sección del conductor de protección", () => {
  assert.equal(seccionPE(1.5), 1.5);
  assert.equal(seccionPE(6), 6);
  assert.equal(seccionPE(16), 16);
  assert.equal(seccionPE(25), 16);
  assert.equal(seccionPE(50), 25);
});

test("Factores de corrección (temperatura y agrupamiento)", () => {
  assert.equal(factorTemperatura(40, "PVC"), 1);
  assert.ok(Math.abs(factorTemperatura(30, "PVC") - Math.sqrt(40 / 30)) < 1e-9);
  assert.equal(factorAgrupamiento(1), 1);
  assert.equal(factorAgrupamiento(3), 0.7);
  assert.equal(factorAgrupamiento(5), 0.6);
});

test("Selección de calibre normalizado", () => {
  assert.equal(menorCalibre(13.04), 16);
  assert.equal(menorCalibre(23.48), 25);
  assert.equal(menorCalibre(25), 25);
});

// ── Casos de la Guía BT-Anexo 2 ───────────────────────────────────────────
test("C2 (3.450 W) a 30 m: intensidad 15 A y sección 4 mm² por caída de tensión", () => {
  const r = calcularCircuito(
    circuito("C2", { potencia: 3450, longitud: 30 }),
    3,
  );
  assert.ok(Math.abs(r.ib - 15) < 0.01);
  assert.equal(r.in, 16);
  assert.equal(r.seccionPorIntensidad, 2.5);
  assert.equal(r.seccionPorCaida, 4);
  assert.equal(r.seccion, 4);
  assert.ok(r.caidaPct <= 3);
  // 2·16·30/(48·4) = 5 V  → 2,17 %
  assert.ok(Math.abs(r.caidaV - 5) < 0.05);
});

test("C3 (5.400 W) a 20 m: calibre 25 A y sección 6 mm²", () => {
  const r = calcularCircuito(circuito("C3", { longitud: 20 }), 3);
  assert.ok(Math.abs(r.ib - 23.48) < 0.05);
  assert.equal(r.in, 25);
  assert.equal(r.seccion, 6);
  assert.equal(r.pe, 6);
  assert.equal(r.tubo, 25);
  assert.ok(r.caidaPct < 3);
});

test("C1 iluminación a 25 m: exige 2,5 mm² por caída de tensión", () => {
  const r = calcularCircuito(
    circuito("C1", { potencia: 1500, longitud: 25 }),
    3,
  );
  assert.equal(r.in, 10);
  assert.equal(r.seccionPorIntensidad, 1.5);
  assert.equal(r.seccion, 2.5);
  assert.ok(r.caidaPct <= 3);
});

test("Circuito trifásico: I = P / (√3·U·cosφ)", () => {
  const r = calcularCircuito(
    circuito("E-MAQ", {
      potencia: 10000,
      fases: 3,
      longitud: 20,
      cosPhi: 0.9,
    }),
    3,
  );
  const esperado = 10000 / (Math.sqrt(3) * 400 * 0.9);
  assert.ok(Math.abs(r.ib - esperado) < 0.05);
});

test("Sobrecarga: sección insuficiente se detecta como error", () => {
  const r = calcularCircuito(
    circuito("C3", { seccion: 2.5, potencia: 5400 }),
    3,
  );
  assert.equal(r.comprobaciones.intensidad, false);
  assert.equal(r.estado, "error");
});

test("Protección insuficiente: PIA menor que la intensidad de diseño", () => {
  const r = calcularCircuito(
    circuito("C2", { pia: 10, potencia: 3450 }),
    3,
  );
  assert.equal(r.comprobaciones.proteccion, false);
});

// ── Conjunto ──────────────────────────────────────────────────────────────
test("Vivienda de ejemplo: grado básico, 5.750 W e IGA 25 A", () => {
  const p = proyectoEjemplo();
  const r = calcularProyecto(p);
  assert.equal(r.gradoCalculado, "basica");
  assert.equal(r.potenciaMinimaGrado, POTENCIA_MINIMA_GRADO.basica);
  assert.equal(r.igaMinimoGrado, 25);
  assert.equal(r.igaRecomendado, 25);
  assert.ok(r.circuitos.length === 6);
});

test("Superficie > 160 m² obliga a electrificación elevada", () => {
  const p = proyectoEjemplo();
  p.superficie = 180;
  const r = calcularProyecto(p);
  assert.equal(r.gradoCalculado, "elevada");
  assert.ok(r.circuitosObligatorios.includes("C7"));
  const h = analizarProyecto(p, r);
  assert.ok(h.some((x) => x.id === "grado-insuficiente"));
  assert.ok(h.some((x) => x.id === "circuitos-faltantes"));
});

test("Falta de circuito obligatorio (calefacción eléctrica)", () => {
  const p = proyectoEjemplo();
  p.electrificacion.calefaccion = true;
  const r = calcularProyecto(p);
  assert.ok(r.circuitosObligatorios.includes("C8"));
  assert.ok(r.circuitosFaltantes.includes("C8"));
});

test("Un diferencial con más de cinco circuitos incumple ITC-BT-25", () => {
  const p = proyectoEjemplo();
  p.circuitos = p.circuitos.map((c) => ({ ...c, diferencialId: "dif-1" }));
  p.diferenciales = [p.diferenciales[0]];
  const h = analizarProyecto(p);
  assert.ok(h.some((x) => x.severidad === "incumplimiento" && x.id.startsWith("dif-grupo")));
});

test("Puesta a tierra: estimación de una pica vertical y límite 50/IΔn", () => {
  const p = proyectoEjemplo();
  p.tierra = {
    ...p.tierra,
    resistividad: 100,
    numElectrodos: 1,
    longitudPica: 2,
  };
  const r = calcularProyecto(p);
  // ρ/(2πL)·(ln(4L/d) − 1) con ρ=100, L=2, d=0,014 → ≈ 42,6 Ω
  assert.ok(r.tierra.resistenciaEstimada !== null);
  assert.ok(
    Math.abs((r.tierra.resistenciaEstimada as number) - 42.6) < 0.5,
  );
  assert.equal(r.tierra.limite, 1667);
  assert.equal(r.tierra.cumple, true);
});

test("Caída de tensión acumulada del proyecto = máximo de los circuitos", () => {
  const p = proyectoEjemplo();
  const r = calcularProyecto(p);
  const max = Math.max(...r.circuitos.map((c) => c.caidaPct));
  assert.equal(r.caidaMaximaPct, max);
});

console.log(`\n${pasadas} comprobaciones superadas.`);
