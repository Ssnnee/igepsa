// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, sqliteTableCreator } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `igepsa_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("name_idx").on(t.name)],
);

export const inspecteurs = createTable(
  "inspecteur",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    matricule: d.text({ length: 256 }).notNull().unique(),
    nomsPrenoms: d.text("noms_prenoms", { length: 256 }).notNull(),
    dateNaissance: d.integer("date_naissance", { mode: "timestamp" }),
    lieuNaissance: d.text("lieu_naissance", { length: 256 }),
    sexe: d.text({ length: 10 }),
    sitMatrimoniale: d.text("sit_matrimoniale", { length: 50 }),
    telephone: d.text({ length: 50 }),
    diplomeAcademique: d.text("diplome_academique", { length: 256 }),
    diplomeProfessionnel: d.text("diplome_professionnel", { length: 256 }),
    statut: d.text({ length: 100 }),
    dateRecrutement: d.integer("date_recrutement", { mode: "timestamp" }),
    dateDepRetraite: d.integer("date_dep_retraite", { mode: "timestamp" }),
    dernierAvancement: d.integer("dernier_avancement", { mode: "timestamp" }),
    grade: d.text({ length: 50 }),
    departement: d.text({ length: 100 }),
    structurePrincipale: d.text("structure_principale", { length: 255 }),
    serviceRattachement: d.text("service_rattachement", { length: 255 }),
    age: d.integer({ mode: "number" }),
    anneesService: d.integer("annees_service", { mode: "number" }),
    anneesAvantRetraite: d.integer("annees_avant_retraite", { mode: "number" }),
    observation: d.text({ length: 1000 }),
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d
      .integer("updated_at", { mode: "timestamp" })
      .$onUpdate(() => new Date()),
  }),
  (t) => [index("matricule_idx").on(t.matricule)],
);
