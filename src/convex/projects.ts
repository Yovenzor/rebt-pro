import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Proyectos de instalación. Cada usuario sólo accede a sus propios proyectos;
 * el contenido técnico completo viaja en `data` y se versiona con `updatedAt`.
 */

const camposResumen = (data: unknown) => {
  const d = (data ?? {}) as Record<string, unknown>;
  return {
    nombre: typeof d.nombre === "string" ? d.nombre : "Instalación sin nombre",
    cliente: typeof d.cliente === "string" ? d.cliente : "",
    municipio: typeof d.municipio === "string" ? d.municipio : "",
    superficie: typeof d.superficie === "number" ? d.superficie : 0,
    tipoVivienda: typeof d.tipoVivienda === "string" ? d.tipoVivienda : "",
  };
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return [];

    const docs = await ctx.db
      .query("projects")
      .withIndex("by_owner_updated", (q) => q.eq("ownerId", userId))
      .order("desc")
      .collect();

    return docs.map((d) => ({
      _id: d._id,
      nombre: d.nombre,
      cliente: d.cliente,
      municipio: d.municipio,
      superficie: d.superficie,
      tipoVivienda: d.tipoVivienda,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const doc = await ctx.db.get(id);
    if (!doc || doc.ownerId !== userId) return null;
    return { _id: doc._id, updatedAt: doc.updatedAt, data: doc.data };
  },
});

export const create = mutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("No autenticado");
    const resumen = camposResumen(data);
    const now = Date.now();
    return await ctx.db.insert("projects", {
      ownerId: userId,
      ...resumen,
      data,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: { id: v.id("projects"), data: v.any() },
  handler: async (ctx, { id, data }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("No autenticado");
    const doc = await ctx.db.get(id);
    if (!doc || doc.ownerId !== userId) throw new Error("Proyecto no encontrado");

    await ctx.db.patch(id, {
      ...camposResumen(data),
      data,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("No autenticado");
    const doc = await ctx.db.get(id);
    if (!doc || doc.ownerId !== userId) throw new Error("Proyecto no encontrado");
    await ctx.db.delete(id);
    return null;
  },
});

export const duplicate = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("No autenticado");
    const doc = await ctx.db.get(id);
    if (!doc || doc.ownerId !== userId) throw new Error("Proyecto no encontrado");

    const data = {
      ...(doc.data as Record<string, unknown>),
      nombre: `${doc.nombre} (copia)`,
    };
    const now = Date.now();
    return await ctx.db.insert("projects", {
      ownerId: userId,
      ...camposResumen(data),
      data,
      createdAt: now,
      updatedAt: now,
    });
  },
});
