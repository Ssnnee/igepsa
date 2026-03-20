import "dotenv/config";

import { db } from "../src/server/db"; // Adjust import if needed based on tsconfig
import { inspecteurs } from "../src/server/db/schema";
import XLSX from "xlsx";
import path from "path";
import fs from "fs";

// Helper to convert Excel serial date to JS Date
function excelDateToJSDate(serial: any): Date | null {
  if (!serial || isNaN(serial)) return null;
  // Excel base date is Dec 30 1899 usually (1900 date system)
  // but XLSX library might handle getting raw values.
  // If the value is already a date string, return it.
  // If it's a number:
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info;
}

// Or use XLSX utility if available, but manual is safer for specific excel epoch
// Better: check if XLSX.SSF is available or just let the reader parse dates?
// We will use raw: false in sheet_to_json to get formatted strings?
// No, let's stick to parsing the raw numbers if they are dates.

async function main() {
  const filePath = path.join(process.cwd(), "BASE INSPECTEUR.xlsx");
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    process.exit(1);
  }

  console.log("Reading Excel file...");
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames?.[0];
  if (!sheetName) {
    throw new Error("No sheets found in workbook");
  }
  const worksheet = workbook.Sheets[sheetName];

  // Read as JSON, raw values
  const data = XLSX.utils.sheet_to_json(worksheet!);

  console.log(`Found ${data.length} records. Processing...`);

  let count = 0;
  for (const row of data as any[]) {
    // Map fields
    const matricule = row["MATRICULE"];
    if (!matricule) continue; // Skip empty rows

    try {
      await db
        .insert(inspecteurs)
        .values({
          matricule: String(matricule).trim(),
          nomsPrenoms: row["NOMS_PRENOMS"] || "",
          dateNaissance: excelDateToJSDate(row["DATE_NAISSANCE"]),
          lieuNaissance: row["LIEU_NAISSANCE"],
          sexe: row["SEXE"],
          sitMatrimoniale: row["SIT_MATRIMONIALE"],
          telephone: row["TELEPHONE"],
          diplomeAcademique: row["DIPLOME_ACADEMIQUE"],
          diplomeProfessionnel: row["DIPLOME_PROFESSIONNEL"],
          statut: row["STATUT"],
          dateRecrutement: excelDateToJSDate(row["DATE_RECRUTEMENT"]),
          dateDepRetraite: excelDateToJSDate(row["DATE_DEP_RETRAITE"]),
          dernierAvancement: excelDateToJSDate(row["DERNIER_AVANCEMENT"]),
          grade: row["GRADE"],
          departement: row["DEPARTEMENT"],
          structurePrincipale: row["STRUCTURE_PRINCIPALE"],
          serviceRattachement: row["SERVICE_RATTACHEMENT"],
          age: row["AGE"] ? Number(row["AGE"]) : null,
          anneesService: row["ANNEES_SERVICE"]
            ? Number(row["ANNEES_SERVICE"])
            : null,
          anneesAvantRetraite: row["ANNEES_AVANT_RETRAITE"]
            ? Number(row["ANNEES_AVANT_RETRAITE"])
            : null,
          observation: row["OBSERVATION"],
        })
        .onConflictDoUpdate({
          target: inspecteurs.matricule,
          set: {
            nomsPrenoms: row["NOMS_PRENOMS"] || "",
            // Add other fields to update if needed, for now just update name to show it works
            updatedAt: new Date(),
          },
        });
      count++;
    } catch (err) {
      console.error(`Failed to import matricule ${matricule}:`, err);
    }
  }

  console.log(`Imported/Updated ${count} inspectors.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
