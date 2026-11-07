/**
 * Comprobación de render: monta los paneles y la memoria con un proyecto real
 * para detectar accesos a datos indefinidos antes de abrir la app.
 *
 * Ejecutar con:  bun scripts/render-check.tsx
 */

import { renderToString } from "react-dom/server";
import { CalculosPanel } from "../src/components/project/CalculosPanel";
import { CircuitosPanel } from "../src/components/project/CircuitosPanel";
import { CuadroPanel } from "../src/components/project/CuadroPanel";
import { DatosPanel } from "../src/components/project/DatosPanel";
import { ElectrificacionPanel } from "../src/components/project/ElectrificacionPanel";
import { MemoriaDoc } from "../src/components/project/MemoriaDoc";
import { PresupuestoPanel } from "../src/components/project/PresupuestoPanel";
import { TierraPanel } from "../src/components/project/TierraPanel";
import { ValidacionPanel } from "../src/components/project/ValidacionPanel";
import { proyectoEjemplo } from "../src/lib/rebt/data";
import { calcularProyecto } from "../src/lib/rebt/engine";
import { analizarProyecto } from "../src/lib/rebt/findings";

const proyecto = proyectoEjemplo("Vivienda de prueba · Calle Mayor 12");
proyecto.cliente = "Ana García López";
proyecto.direccion = "Calle Mayor 12, 2º B";
proyecto.cp = "28013";
proyecto.municipio = "Madrid";
proyecto.provincia = "Madrid";
proyecto.comunidad = "Madrid";
proyecto.tecnico = "Ingeniero de prueba";
proyecto.empresa = "Instalaciones de prueba";

const resultado = calcularProyecto(proyecto);
const hallazgos = analizarProyecto(proyecto, resultado);
const noop = () => undefined;

function check(nombre: string, elemento: React.ReactElement) {
  const html = renderToString(elemento);
  if (html.length < 200) {
    throw new Error(`${nombre}: render vacío (${html.length} caracteres)`);
  }
  console.log(`✓ ${nombre} · ${html.length} caracteres`);
}

check(
  "Resumen / memoria",
  <MemoriaDoc
    proyecto={proyecto}
    resultado={resultado}
    hallazgos={hallazgos}
    generado="7 de noviembre de 2026"
  />,
);
check(
  "Datos y suministro",
  <DatosPanel proyecto={proyecto} update={noop} />,
);
check(
  "Electrificación",
  <ElectrificacionPanel
    proyecto={proyecto}
    update={noop}
    resultado={resultado}
  />,
);
check(
  "Circuitos",
  <CircuitosPanel
    proyecto={proyecto}
    update={noop}
    resultado={resultado}
    onEditingChange={noop}
    onNavigate={noop}
  />,
);
check(
  "Cálculos",
  <CalculosPanel proyecto={proyecto} update={noop} resultado={resultado} />,
);
check(
  "Cuadro",
  <CuadroPanel proyecto={proyecto} update={noop} resultado={resultado} />,
);
check(
  "Tierra",
  <TierraPanel proyecto={proyecto} update={noop} resultado={resultado} />,
);

proyecto.presupuesto.lineasManuales.push({
  id: "manual-check",
  descripcion: "Ayuda de instalación",
  unidad: "ud",
  cantidad: 1,
  precioUnitario: 50,
});
check(
  "Presupuesto",
  <PresupuestoPanel
    proyecto={proyecto}
    update={noop}
    resultado={resultado}
    onIrAProtecciones={noop}
  />,
);

proyecto.protecciones.sobretensiones = false;
check(
  "Cuadro sin DPS",
  <CuadroPanel proyecto={proyecto} update={noop} resultado={resultado} />,
);
check(
  "Memoria sin DPS",
  <MemoriaDoc
    proyecto={proyecto}
    resultado={resultado}
    hallazgos={hallazgos}
    generado="7 de noviembre de 2026"
  />,
);
proyecto.protecciones.sobretensiones = true;

check("Validación", <ValidacionPanel hallazgos={hallazgos} onIr={noop} />);

console.log(`\nProyecto: ${resultado.circuitos.length} circuitos · ${hallazgos.length} hallazgos.`);
console.log(
  hallazgos.map((h) => `  [${h.severidad}] ${h.titulo}`).join("\n"),
);
