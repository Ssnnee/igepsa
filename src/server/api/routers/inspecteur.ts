
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { inspecteurs } from "~/server/db/schema";
import { like, or, eq } from "drizzle-orm";
import puppeteer from "puppeteer";

// Helper to generate HTML for "Attestation de présence au poste"
function generateAttestationPresenceHtml(inspector: any, dateRef: string) {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Attestation de Présence au Poste</title>
<style>
body {
  font-family: "Times New Roman", serif;
  margin: 60px;
  color: #000;
}

.header {
  text-align: center;
  font-size: 14px;
  line-height: 1.4;
}

.header .left,
.header .right {
  width: 45%;
  display: inline-block;
  vertical-align: top;
}

.header .left {
  text-align: center;
}

.header .right {
  text-align: center;
}

.title {
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  margin: 40px 0 30px 0;
  text-decoration: underline;
}

.content {
  font-size: 16px;
  text-align: justify;
  line-height: 1.8;
}

.signature {
  margin-top: 60px;
}

.signature .location-date {
  text-align: right;
  margin-bottom: 60px;
}

.signature .sign {
  text-align: right;
  font-weight: bold;
}

.footer {
  margin-top: 80px;
  font-size: 12px;
}

.ampliation {
  margin-top: 20px;
  font-size: 12px;
  line-height: 1.5;
}
</style>
</head>
<body>

<div class="header">
  <div class="left">
    <strong>MINISTERE DE L’ENSEIGNEMENT PRESCOLAIRE,<br>
    PRIMAIRE, SECONDAIRE ET DE L’ALPHABETISATION</strong><br>
    ----------------<br>
    C A B I N E T<br>
    ----------------<br>
    INSPECTION GENERALE DE L’ENSEIGNEMENT<br>
    PRIMAIRE, SECONDAIRE ET DE L’ALPHABETISATION<br>
    ----------------<br>
    DIRECTION DES AFFAIRES ADMINISTRATIVES<br>
    ET FINANCIERES<br>
    ----------------<br>
    SERVICE DES AFFAIRES ADMINISTRATIVES ET DES<br>
    RESSOURCES HUMAINES<br>
    ----------------<br>
    BUREAU DES AFFAIRES ADMINISTRATIVES,<br>
    DU PERSONNEL ET DU CONTENTIEUX.<br>
    ----------------<br>
  N°_________/MEPPSA-CAB-IGEPSA-DAAF-SAARH-BAAPC.
  </div>

  <div class="right">
    <strong>REPUBLIQUE DU CONGO</strong><br>
    Unité - Travail - Progrès<br>
    ----------------
  </div>
</div>

<div class="title">
  ATTESTATION DE PRESENCE AU POSTE
</div>

<div class="content">
  L’Inspecteur Général de l’Enseignement Primaire, Secondaire et de l’Alphabétisation,
  soussigné, atteste que :<br><br>

  ${inspector.sexe === 'F' ? 'Madame' : 'Monsieur'} <strong>${inspector.nomsPrenoms}</strong>,
  ${inspector.grade || 'Fonctionnaire'}, 
  Catégorie [CAT], Échelle [ECH], Échelon [ECHEL],
  Indice [INDICE], en service à ${inspector.structurePrincipale || 'la Direction des Affaires Administratives et Financières'},
  est bel et bien ${inspector.sexe === 'F' ? 'présente' : 'présent'} à son lieu de service depuis le ${inspector.dateRecrutement ? new Date(inspector.dateRecrutement).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '[DATE]'},
  en qualité de ${inspector.statut || 'Agent'}.<br><br>

  En foi de quoi, la présente attestation est établie pour servir et valoir ce que de droit.
</div>

<div class="signature">
  <div class="location-date">
    Brazzaville, le ${dateRef}
  </div>

  <div class="sign">
    L’Inspecteur Général,
  </div>
</div>

<div class="ampliation">
  <strong>Ampliation</strong><br>
  MEPPSA-CAB ............................. 2<br>
  IGEPSA-DAAF-IPA-IAFP .......... 4<br>
  INTERESSE ................................ 1<br>
  DOSSIER .................................... 1<br>
  ARCHIVES .................................. 2/10
</div>

</body>
</html>
  `;
}

// TODO: Implement other templates similarly

export const inspecteurRouter = createTRPCRouter({
    search: publicProcedure
        .input(z.object({ query: z.string() }))
        .query(async ({ ctx, input }) => {
            if (!input.query) return [];

            const searchPattern = `%${input.query}%`;

            const results = await ctx.db
                .select()
                .from(inspecteurs)
                .where(
                    or(
                        like(inspecteurs.nomsPrenoms, searchPattern),
                        like(inspecteurs.matricule, searchPattern)
                    )
                )
                .limit(10);

            return results;
        }),

    generatePdf: publicProcedure
        .input(z.object({
            inspectorId: z.number(),
            documentType: z.enum(["attestation_presence", "reprise_service", "cessation_service"]),
            extraData: z.record(z.string(), z.any()).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // 1. Fetch inspector data
            const inspector = await ctx.db.query.inspecteurs.findFirst({
                where: eq(inspecteurs.id, input.inspectorId),
            });

            if (!inspector) {
                throw new Error("Inspector not found");
            }

            // 2. Generate HTML
            let htmlContent = "";
            const dateRef = input.extraData?.dateReference
                ? new Date(input.extraData.dateReference).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })
                : new Date().toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' });

            if (input.documentType === "attestation_presence") {
                htmlContent = generateAttestationPresenceHtml(inspector, dateRef);
            } else {
                throw new Error("Only 'Attestation de présence' is implemented with the new HTML method so far.");
            }

            // 3. Render PDF with Puppeteer
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for some container environments
                headless: true
            });
            const page = await browser.newPage();

            // Set content
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0cm', // Margins are handled in CSS
                    right: '0cm',
                    bottom: '0cm',
                    left: '0cm'
                }
            });

            await browser.close();

            // 4. Return
            const base64Pdf = Buffer.from(pdfBuffer).toString("base64");

            return {
                success: true,
                pdfBase64: base64Pdf,
                filename: `${input.documentType}_${inspector.matricule}.pdf`
            };
        })
});
