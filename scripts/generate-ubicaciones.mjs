/**
 * Genera src/lib/rebt/ubicaciones.ts a partir del dataset de CodeForSpain,
 * que procesa la relación de municipios del INE (1 de enero de 2026).
 *
 * Uso: node scripts/generate-ubicaciones.mjs
 */
import { writeFile } from "node:fs/promises";

const BASE =
  "https://raw.githubusercontent.com/codeforspain/ds-organizacion-administrativa/master/data/";

const COMUNIDADES = {
  Andalucía: ["04", "11", "14", "18", "21", "23", "29", "41"],
  Aragón: ["22", "44", "50"],
  Asturias: ["33"],
  "Illes Balears": ["07"],
  Canarias: ["35", "38"],
  Cantabria: ["39"],
  "Castilla y León": ["05", "09", "24", "34", "37", "40", "42", "47", "49"],
  "Castilla-La Mancha": ["02", "13", "16", "19", "45"],
  Cataluña: ["08", "17", "25", "43"],
  "Comunidad Valenciana": ["03", "12", "46"],
  Extremadura: ["06", "10"],
  Galicia: ["15", "27", "32", "36"],
  "La Rioja": ["26"],
  Madrid: ["28"],
  Murcia: ["30"],
  Navarra: ["31"],
  "País Vasco": ["01", "20", "48"],
  Ceuta: ["51"],
  Melilla: ["52"],
};

const NOMBRES_PROVINCIA = {
  "07": "Illes Balears",
  "15": "A Coruña",
  "26": "La Rioja",
  "35": "Las Palmas",
};

const collator = new Intl.Collator("es", { sensitivity: "base" });

const [provincias, municipios] = await Promise.all([
  fetch(`${BASE}provincias.json`).then((r) => {
    if (!r.ok) throw new Error(`Provincias: HTTP ${r.status}`);
    return r.json();
  }),
  fetch(`${BASE}municipios.json`).then((r) => {
    if (!r.ok) throw new Error(`Municipios: HTTP ${r.status}`);
    return r.json();
  }),
]);

const nombreProvincia = new Map(
  provincias.map((p) => [p.provincia_id, NOMBRES_PROVINCIA[p.provincia_id] ?? p.nombre]),
);
const municipiosPorProvincia = new Map();
for (const municipio of municipios) {
  const lista = municipiosPorProvincia.get(municipio.provincia_id) ?? [];
  lista.push(municipio.nombre);
  municipiosPorProvincia.set(municipio.provincia_id, lista);
}

const provinciasAsignadas = new Set();
const bloques = Object.entries(COMUNIDADES).map(([comunidad, ids]) => {
  const provinciasComunidad = ids
    .map((id) => {
      provinciasAsignadas.add(id);
      const municipiosProvincia = [...(municipiosPorProvincia.get(id) ?? [])].sort(
        collator.compare,
      );
      return { id, nombre: nombreProvincia.get(id), municipios: municipiosProvincia };
    })
    .sort((a, b) => collator.compare(a.nombre, b.nombre));

  return `  {
    nombre: ${JSON.stringify(comunidad)},
    provincias: [
${provinciasComunidad
  .map(
    (p) => `      {
        nombre: ${JSON.stringify(p.nombre)},
        municipios: ${JSON.stringify(p.municipios)},
      },`,
  )
  .join("\n")}
    ],
  },`;
});

if (provinciasAsignadas.size !== provincias.length) {
  const faltan = provincias
    .filter((p) => !provinciasAsignadas.has(p.provincia_id))
    .map((p) => `${p.provincia_id} ${p.nombre}`);
  throw new Error(`Provincias sin comunidad: ${faltan.join(", ")}`);
}

const contenido = `/**
 * Comunidades autónomas, provincias y municipios de España.
 *
 * Fuente: Instituto Nacional de Estadística, relación de municipios a
 * 1 de enero de 2026, procesada por CodeForSpain
 * (github.com/codeforspain/ds-organizacion-administrativa, ODC-PDDL).
 * Archivo generado por scripts/generate-ubicaciones.mjs: no editar a mano.
 */

export interface ProvinciaUbicacion {
  nombre: string;
  municipios: string[];
}

export interface ComunidadUbicacion {
  nombre: string;
  provincias: ProvinciaUbicacion[];
}

export const UBICACIONES: ComunidadUbicacion[] = [
${bloques.join("\n")}
];

export function provinciasDe(comunidad: string): ProvinciaUbicacion[] {
  return UBICACIONES.find((c) => c.nombre === comunidad)?.provincias ?? [];
}

export function comunidadDeProvincia(provincia: string): string {
  return (
    UBICACIONES.find((c) =>
      c.provincias.some((p) => p.nombre === provincia),
    )?.nombre ?? ""
  );
}

export function municipiosDe(comunidad: string, provincia: string): string[] {
  return (
    provinciasDe(comunidad).find((p) => p.nombre === provincia)?.municipios ?? []
  );
}
`;

await writeFile("src/lib/rebt/ubicaciones.ts", contenido, "utf8");
console.log(
  `Generado src/lib/rebt/ubicaciones.ts: ${Object.keys(COMUNIDADES).length} comunidades, ${provincias.length} provincias, ${municipios.length} municipios.`,
);
