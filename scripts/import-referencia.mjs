#!/usr/bin/env node
// Lê as planilhas de referência (PHB e Guia do Mestre 2024) e gera arquivos
// estáticos dentro de data/rulesets/dnd2024/. Roda só em dev, uma vez (ou toda
// vez que a planilha de origem mudar) — não é dependência do app publicado.
//
// As planilhas de origem NÃO ficam no repositório (conteúdo pago de terceiros,
// mesmo cuidado já usado com outros materiais de referência licenciados nesta
// sessão). Passe os caminhos locais via variável de ambiente ou argumento:
//
//   node scripts/import-referencia.mjs <phb.xlsx> <guia-mestre.xlsx>
//   PHB_XLSX=... GUIA_MESTRE_XLSX=... node scripts/import-referencia.mjs

import XLSX from "xlsx";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "data", "rulesets", "dnd2024");

const phbPath = process.argv[2] || process.env.PHB_XLSX;
const guiaMestrePath = process.argv[3] || process.env.GUIA_MESTRE_XLSX;

if (!phbPath || !guiaMestrePath) {
  console.error(
    "Uso: node scripts/import-referencia.mjs <caminho-phb.xlsx> <caminho-guia-mestre.xlsx>\n" +
      "(ou defina PHB_XLSX e GUIA_MESTRE_XLSX no ambiente)"
  );
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

function lerAbas(caminho) {
  const wb = XLSX.readFile(caminho);
  return wb.SheetNames;
}

const phbAbas = lerAbas(phbPath);
const guiaMestreAbas = lerAbas(guiaMestrePath);

// Entrega 0: prova de ponta a ponta do pipeline (ler → gerar arquivo em
// data/rulesets/dnd2024/). Popular as 27 abas de conteúdo é trabalho da
// Entrega 1, não desta entrega.
const manifest = {
  geradoEm: new Date().toISOString(),
  fontes: {
    phb: { arquivo: "dnd5e-2024-referencia.xlsx", abas: phbAbas },
    guiaMestre: {
      arquivo: "dnd5e-2024-guia-mestre-referencia.xlsx",
      abas: guiaMestreAbas,
    },
  },
};

writeFileSync(
  join(OUT_DIR, "_manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n"
);

// Prova real de extração: a aba "Perícias" é pequena e estável, boa candidata
// pra validar o pipeline linha-a-linha antes da Entrega 1 abrir todas as abas.
const wbPhb = XLSX.readFile(phbPath);
const wsPericias = wbPhb.Sheets["Perícias"];
const periciasLinhas = wsPericias
  ? XLSX.utils.sheet_to_json(wsPericias, { defval: null })
  : [];

writeFileSync(
  join(OUT_DIR, "pericias.json"),
  JSON.stringify(periciasLinhas, null, 2) + "\n"
);

console.log(`OK — manifest.json (${phbAbas.length} abas PHB, ${guiaMestreAbas.length} abas Guia do Mestre)`);
console.log(`OK — pericias.json (${periciasLinhas.length} linhas extraídas, prova de ponta a ponta)`);
console.log(`Saída: ${OUT_DIR}`);
