import { SectionHeader, NumberField, SelectField, TextField } from "./ui";
import type { Proyecto } from "@/lib/rebt/types";
import { num } from "@/lib/format";
import { Calculator, Info } from "lucide-react";

const COMUNIDADES = [
  "Andalucía",
  "Aragón",
  "Asturias",
  "Illes Balears",
  "Canarias",
  "Cantabria",
  "Castilla-La Mancha",
  "Castilla y León",
  "Cataluña",
  "Comunidad Valenciana",
  "Extremadura",
  "Galicia",
  "La Rioja",
  "Madrid",
  "Murcia",
  "Navarra",
  "País Vasco",
  "Ceuta",
  "Melilla",
];

export function DatosPanel({
  proyecto,
  update,
  highlightCampo,
}: {
  proyecto: Proyecto;
  update: (patch: Partial<Proyecto>) => void;
  highlightCampo?: string;
}) {
  const s = proyecto.suministro;
  const tension = s.fases === 3 ? 400 : 230;
  const cosPhi = s.cosPhi || 1;
  const intensidad =
    s.potenciaContratada /
    ((s.fases === 3 ? Math.sqrt(3) : 1) * tension * cosPhi);
  const gamma = 48;
  const caidaDI =
    s.seccionDI > 0 && s.longitudDI > 0
      ? ((s.fases === 3 ? Math.sqrt(3) : 2) *
          intensidad *
          (s.longitudDI / (gamma * s.seccionDI)) *
          cosPhi)
      : null;
  const caidaDIPct = caidaDI ? (caidaDI / tension) * 100 : null;

  const upd = (patch: Partial<Proyecto["suministro"]>) =>
    update({ suministro: { ...s, ...patch } });

  return (
    <div>
      <SectionHeader
        eyebrow="Identificación"
        title="Datos de la vivienda y del suministro"
        description="Estos datos alimentan la portada, la previsión de cargas y la derivación individual de la memoria. Lo que falte se señalará como dato pendiente, nunca se inventará."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="surface-card p-5">
          <h3 className="text-[13.5px] font-semibold">Titular y emplazamiento</h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Datos que figurarán en la portada y en el apartado 1 de la memoria.
          </p>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <TextField
              label="Nombre del cliente"
              value={proyecto.cliente}
              onChange={(v) => update({ cliente: v })}
              placeholder="Nombre y apellidos / razón social"
              field="cliente"
              highlight={highlightCampo === "cliente"}
              className="sm:col-span-2"
            />
            <TextField
              label="DNI / NIF"
              value={proyecto.nif}
              onChange={(v) => update({ nif: v })}
              placeholder="Opcional, cuando proceda"
              field="nif"
            />
            <TextField
              label="Dirección de la instalación"
              value={proyecto.direccion}
              onChange={(v) => update({ direccion: v })}
              placeholder="Calle, número, piso"
              field="direccion"
              highlight={highlightCampo === "direccion"}
              className="sm:col-span-2"
            />
            <TextField
              label="Código postal"
              value={proyecto.cp}
              onChange={(v) => update({ cp: v })}
              placeholder="28001"
              field="cp"
            />
            <TextField
              label="Municipio"
              value={proyecto.municipio}
              onChange={(v) => update({ municipio: v })}
              field="municipio"
              highlight={highlightCampo === "municipio"}
            />
            <TextField
              label="Provincia"
              value={proyecto.provincia}
              onChange={(v) => update({ provincia: v })}
              field="provincia"
              highlight={highlightCampo === "provincia"}
            />
            <SelectField
              label="Comunidad autónoma"
              value={proyecto.comunidad || "Madrid"}
              onChange={(v) => update({ comunidad: v })}
              options={COMUNIDADES.map((c) => ({ value: c, label: c }))}
            />
          </div>
        </section>

        <section className="surface-card p-5">
          <h3 className="text-[13.5px] font-semibold">Características de la vivienda</h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            La superficie y las previsiones de uso determinan el grado de
            electrificación exigible.
          </p>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <TextField
              label="Nombre de la instalación"
              value={proyecto.nombre}
              onChange={(v) => update({ nombre: v })}
              field="nombre"
              className="sm:col-span-2"
            />
            <SelectField
              label="Tipo de vivienda"
              value={proyecto.tipoVivienda}
              onChange={(v) => update({ tipoVivienda: v })}
              options={[
                { value: "Unifamiliar", label: "Unifamiliar" },
                { value: "Piso", label: "Piso / apartamento" },
                { value: "Adosado", label: "Adosado" },
                { value: "Chalet", label: "Chalet" },
              ]}
            />
            <SelectField
              label="Tipo de actuación"
              value={proyecto.tipoInstalacion}
              onChange={(v) =>
                update({ tipoInstalacion: v as Proyecto["tipoInstalacion"] })
              }
              options={[
                { value: "nueva", label: "Instalación nueva" },
                { value: "reforma", label: "Reforma" },
              ]}
            />
            <NumberField
              label="Superficie útil"
              value={proyecto.superficie}
              onChange={(v) => update({ superficie: v })}
              unit="m²"
              min={10}
              max={2000}
              hint={
                proyecto.superficie > 160
                  ? "Superficie > 160 m²: exige electrificación elevada."
                  : undefined
              }
            />
            <NumberField
              label="Plantas"
              value={proyecto.plantas}
              onChange={(v) => update({ plantas: v })}
              min={1}
              max={10}
            />
            <NumberField
              label="Habitaciones"
              value={proyecto.habitaciones}
              onChange={(v) => update({ habitaciones: v })}
              min={0}
              max={30}
            />
            <NumberField
              label="Baños"
              value={proyecto.banos}
              onChange={(v) => update({ banos: v })}
              min={0}
              max={15}
            />
            <NumberField
              label="Año de construcción"
              value={proyecto.anio ?? 0}
              onChange={(v) => update({ anio: v || null })}
              min={0}
              max={2100}
              hint="Opcional"
            />
          </div>
        </section>

        <section className="surface-card p-5">
          <h3 className="text-[13.5px] font-semibold">Suministro y derivación individual</h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Condiciones de la acometida según los datos facilitados por la
            distribuidora.
          </p>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <TextField
              label="Empresa distribuidora"
              value={s.compania}
              onChange={(v) => upd({ compania: v })}
              placeholder="Compañía suministradora"
              className="sm:col-span-2"
            />
            <SelectField
              label="Número de fases"
              value={s.fases}
              onChange={(v) => upd({ fases: v as 1 | 3 })}
              options={[
                { value: 1, label: "Monofásico · 230 V" },
                { value: 3, label: "Trifásico · 400 V" },
              ]}
            />
            <NumberField
              label="Factor de potencia previsto"
              value={s.cosPhi}
              onChange={(v) => upd({ cosPhi: v })}
              min={0.5}
              max={1}
              step={0.01}
            />
            <NumberField
              label="Potencia a contratar"
              value={s.potenciaContratada}
              onChange={(v) => upd({ potenciaContratada: v })}
              unit="W"
              min={0}
              step={100}
              field="potenciaContratada"
              highlight={highlightCampo === "potenciaContratada"}
              hint="Si es 0 se aplica el mínimo del grado."
            />
            <NumberField
              label="Poder de corte de las protecciones"
              value={s.poderCorte}
              onChange={(v) => upd({ poderCorte: v })}
              unit="kA"
              min={3}
              max={25}
              hint="Dato de proyecto; verificar Icc en el punto de instalación."
            />
            <NumberField
              label="Longitud de la derivación individual"
              value={s.longitudDI}
              onChange={(v) => upd({ longitudDI: v })}
              unit="m"
              min={0}
              max={200}
            />
            <SelectField
              label="Sección de la derivación individual"
              value={s.seccionDI}
              onChange={(v) => upd({ seccionDI: Number(v) })}
              options={[
                { value: 0, label: "Sin definir" },
                ...[6, 10, 16, 25, 35].map((x) => ({
                  value: x,
                  label: `${x} mm²`,
                })),
              ]}
              field="seccionDI"
              highlight={highlightCampo === "seccionDI"}
            />
          </div>

          <div className="mt-4 rounded-lg border border-border/80 bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <Calculator className="size-3.5" />
              Comprobación orientativa de la derivación individual
            </div>
            <p className="mt-1.5 text-[12px] tabular-nums">
              I = {num(intensidad, 2)} A · ΔU ={" "}
              {caidaDI ? `${num(caidaDI, 2)} V (${num(caidaDIPct, 2)} %)` : "sin datos"}
            </p>
            <p className="mt-1 flex items-start gap-1.5 text-[10.5px] leading-4 text-muted-foreground">
              <Info className="mt-0.5 size-3 shrink-0" />
              Cálculo informativo con γ = 48 m/(Ω·mm²). El límite aplicable de
              la derivación debe confirmarse con la ITC-BT-15 y la distribuidora.
            </p>
          </div>
        </section>

        <section className="surface-card p-5">
          <h3 className="text-[13.5px] font-semibold">Técnico, empresa y expediente</h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground">
            Identificación de quien asume la documentación técnica.
          </p>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
            <TextField
              label="Técnico responsable"
              value={proyecto.tecnico}
              onChange={(v) => update({ tecnico: v })}
              placeholder="Nombre y titulación"
              field="tecnico"
              highlight={highlightCampo === "tecnico"}
            />
            <TextField
              label="Empresa instaladora"
              value={proyecto.empresa}
              onChange={(v) => update({ empresa: v })}
              placeholder="Nombre de la empresa"
              field="empresa"
            />
            <TextField
              label="Nº de expediente"
              value={proyecto.expediente}
              onChange={(v) => update({ expediente: v })}
              placeholder="Expediente / referencia"
              field="expediente"
            />
            <TextField
              label="Fecha del proyecto"
              value={proyecto.fecha}
              onChange={(v) => update({ fecha: v })}
              type="date"
              field="fecha"
            />
          </div>
          <div className="mt-4 rounded-lg bg-primary/[0.045] p-3 text-[11px] leading-5 text-muted-foreground">
            <span className="font-medium text-foreground">Alcance del documento:</span>{" "}
            memoria técnica de diseño y documentación de apoyo. No sustituye la
            firma del técnico competente ni la certificación del instalador
            habilitado.
          </div>
        </section>
      </div>
    </div>
  );
}
