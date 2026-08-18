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
//
// Entrega 1 (Fase 1): popula as 27 abas de conteúdo do PHB. A planilha do
// Guia do Mestre (tesouro/itens mágicos) fica fora do escopo desta entrega —
// não estava na lista aprovada no plano — e volta numa entrega futura.

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

// Origem SRD/não-SRD: campo reservado no schema, sem esforço de classificação
// real por enquanto (confirmado com o usuário) — tudo do Livro do Jogador
// entra como "não-SRD" por padrão.
const ORIGEM_PADRAO = "não-SRD";

function slugify(s) {
  if (s === null || s === undefined) return "";
  return s
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Linha divisória de seção: só a 1ª coluna (às vezes com "— Nome —", às
// vezes só "Nome") e a última (Fonte) têm conteúdo — todo o resto vazio.
// Não é uma linha de dado (README §3): agrupa as linhas seguintes por
// classe/espécie/categoria e deve ser pulada ao ler valores.
function isDividerRow(row) {
  if (typeof row[0] !== "string" || row[0].trim() === "") return false;
  for (let i = 1; i < row.length - 1; i++) {
    if (row[i] !== null && row[i] !== "" && row[i] !== undefined) return false;
  }
  return true;
}

function dividerText(row) {
  return row[0].trim().replace(/^—\s*/, "").replace(/\s*—$/, "");
}

/** Lê uma aba simples (1 tabela, header na linha 1, com ou sem linhas
 * divisórias de seção "— Grupo —"). Retorna as linhas de dado já sem
 * divisórias, cada uma com o texto da última divisória vista em `_grupo`. */
function readSheet(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Aba não encontrada: ${sheetName}`);
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const header = rows[0];
  const data = [];
  let grupo = null;
  for (const row of rows.slice(1)) {
    if (row.every((c) => c === null || c === "")) continue;
    if (isDividerRow(row)) {
      grupo = dividerText(row);
      continue;
    }
    data.push({ row, grupo });
  }
  return { header, data };
}

function mapRows({ data }, fieldMap, { withGrupo = false } = {}) {
  const keys = Object.keys(fieldMap);
  return data.map(({ row, grupo }) => {
    const obj = {};
    keys.forEach((key, i) => {
      const col = fieldMap[key];
      obj[key] = row[col] === undefined ? null : row[col];
    });
    if (withGrupo) obj.grupo = grupo;
    obj.origem = ORIGEM_PADRAO;
    return obj;
  });
}

function withIds(list, idFn) {
  const seen = new Map();
  for (const item of list) {
    let id = idFn(item);
    if (seen.has(id)) {
      const n = seen.get(id) + 1;
      seen.set(id, n);
      id = `${id}-${n}`;
    } else {
      seen.set(id, 1);
    }
    item.id = id;
  }
  return list;
}

function writeJson(filename, data) {
  writeFileSync(join(OUT_DIR, filename), JSON.stringify(data, null, 2) + "\n");
}

// ---------------------------------------------------------------------------

const wbPhb = XLSX.readFile(phbPath);
const wbGuiaMestre = XLSX.readFile(guiaMestrePath);

const contagens = {};

function processar(sheetName, filename, fieldMap, idFn, opts) {
  const sheet = readSheet(wbPhb, sheetName);
  const rows = mapRows(sheet, fieldMap, opts);
  withIds(rows, idFn);
  if (opts && opts.aposIds) opts.aposIds(rows);
  writeJson(filename, rows);
  contagens[filename] = rows.length;
  return rows;
}

// Conceitos e regras gerais ---------------------------------------------
processar(
  "Perícias",
  "pericias.json",
  { nome: 0, nomeEn: 1, atributo: 2, exemplo: 3, fonte: 4 },
  (o) => slugify(o.nome)
);

processar(
  "Condições",
  "condicoes.json",
  { nome: 0, nomeEn: 1, efeito: 2, fonte: 3 },
  (o) => slugify(o.nome)
);

processar(
  "Idiomas",
  "idiomas.json",
  { nome: 0, nomeEn: 1, tipo: 2, falantes: 3, fonte: 4 },
  (o) => slugify(o.nome)
);

processar(
  "Alinhamentos",
  "alinhamentos.json",
  { nome: 0, nomeEn: 1, sigla: 2, descricao: 3, fonte: 4 },
  (o) => slugify(o.sigla || o.nome)
);

processar(
  "Glossário de Regras",
  "glossario.json",
  { termo: 0, categoria: 1, descricao: 2, fonte: 3 },
  (o) => slugify(o.termo)
);

processar(
  "Evolução do Personagem",
  "evolucao-personagem.json",
  { nivel: 0, xp: 1, bonusProficiencia: 2, fonte: 3 },
  (o) => `nivel-${o.nivel}`
);

// Criação de personagem ---------------------------------------------------
processar(
  "Antecedentes",
  "antecedentes.json",
  {
    nome: 0,
    nomeEn: 1,
    atributos: 2,
    talentoOrigem: 3,
    pericia1: 4,
    pericia2: 5,
    ferramenta: 6,
    equipamentoA: 7,
    equipamentoB: 8,
    fonte: 9,
  },
  (o) => slugify(o.nome)
);

processar(
  "Espécies",
  "especies.json",
  {
    especie: 0,
    especieEn: 1,
    tipoCriatura: 2,
    tamanho: 3,
    deslocamento: 4,
    traco: 5,
    descricao: 6,
    fonte: 7,
  },
  (o) => `${slugify(o.especie)}--${slugify(o.traco)}`
);

processar(
  "Talentos",
  "talentos.json",
  {
    nome: 0,
    categoria: 1,
    preRequisito: 2,
    beneficio: 3,
    repetivel: 4,
    fonte: 5,
  },
  (o) => slugify(o.nome)
);

// Equipamento ---------------------------------------------------------------
processar(
  "Armas",
  "armas.json",
  {
    categoria: 0,
    nome: 1,
    dano: 2,
    propriedades: 3,
    maestria: 4,
    peso: 5,
    custo: 6,
    fonte: 7,
  },
  (o) => `${slugify(o.categoria)}--${slugify(o.nome)}`
);

processar(
  "Armaduras",
  "armaduras.json",
  {
    categoria: 0,
    nome: 1,
    ca: 2,
    forcaMinima: 3,
    furtividade: 4,
    peso: 5,
    custo: 6,
    fonte: 7,
  },
  (o) => slugify(o.nome)
);

processar(
  "Equipamento de Aventura",
  "equipamento-aventura.json",
  { nome: 0, peso: 1, custo: 2, fonte: 3 },
  (o) => slugify(o.nome),
  { withGrupo: true }
);

// Correções conhecidas: a extração automática do PDF (mesma planilha, ver
// README §7) fez a coluna "O que fabrica" de duas linhas vazar o começo da
// célula seguinte na página (Sapateiro após Entalhador; um cabeçalho de
// seção após Veneno). Já identificado e corrigido manualmente ao escrever
// data/shop-items.js numa revisão de regras anterior desta sessão — herdando
// a mesma correção aqui em vez de reprocessar do zero.
const CORRECOES_FERRAMENTAS = {
  "ferramentas-de-entalhador":
    "Armas à Distância (exceto Funda, Mosquete e Pistola), Cajado, Caneta Tinteiro, Clava, Clava Grande, Dardos, Flechas, Foco Arcano, Foco Druídico, Virotes.",
  "kit-de-veneno": "Veneno Básico.",
};

processar(
  "Ferramentas",
  "ferramentas.json",
  {
    nome: 0,
    categoria: 1,
    custo: 2,
    atributo: 3,
    peso: 4,
    uso: 5,
    fabrica: 6,
    variantes: 7,
    fonte: 8,
  },
  (o) => slugify(o.nome),
  {
    aposIds: (rows) =>
      rows.forEach((item) => {
        if (CORRECOES_FERRAMENTAS[item.id]) item.fabrica = CORRECOES_FERRAMENTAS[item.id];
      }),
  }
);

processar(
  "Montarias e Veículos",
  "montarias-veiculos.json",
  { nome: 0, capacidadeCarga: 1, custo: 2, fonte: 3 },
  (o) => slugify(o.nome),
  { withGrupo: true }
);

processar(
  "Veículos Aquáticos",
  "veiculos-aquaticos.json",
  {
    nome: 0,
    deslocamento: 1,
    tripulacao: 2,
    passageiros: 3,
    carga: 4,
    ca: 5,
    pv: 6,
    danoCerco: 7,
    custo: 8,
    fonte: 9,
  },
  (o) => slugify(o.nome)
);

processar(
  "Serviços",
  "servicos.json",
  { nome: 0, custo: 1, fonte: 2 },
  (o) => slugify(o.nome),
  { withGrupo: true }
);

processar(
  "Bugigangas",
  "bugigangas.json",
  { d100: 0, nome: 1, fonte: 2 },
  (o) => `d100-${o.d100}`
);

// Classes e progressão -------------------------------------------------------
processar(
  "Progressão de Classe",
  "progressao-classe.json",
  {
    classe: 0,
    nivel: 1,
    bonusProficiencia: 2,
    caracteristicas: 3,
    recursos: 4,
    fonte: 5,
  },
  (o) => `${slugify(o.classe)}-nivel-${o.nivel}`
);

processar(
  "Características de Classe",
  "caracteristicas-classe.json",
  { classe: 0, nivel: 1, nome: 2, descricao: 3, fonte: 4 },
  (o) => `${slugify(o.classe)}--nivel-${o.nivel}--${slugify(o.nome)}`
);

processar(
  "Subclasses",
  "subclasses.json",
  { classe: 0, subclasse: 1, nivel: 2, nome: 3, descricao: 4, fonte: 5 },
  (o) =>
    `${slugify(o.classe)}--${slugify(o.subclasse)}--nivel-${o.nivel}--${slugify(o.nome)}`
);

processar(
  "Opções de Classe",
  "opcoes-classe.json",
  { classe: 0, caracteristica: 1, opcao: 2, descricao: 3, fonte: 4 },
  (o) => `${slugify(o.classe)}--${slugify(o.opcao)}`,
  { withGrupo: true }
);

// Classes: metadados extraídos das linhas divisórias de "Progressão de
// Classe" (ex.: "— Bárbaro — Atributo Primário: Força | Dado de Vida: d12 |
// Salvaguardas: Força e Constituição") — não é uma coluna própria da
// planilha, mas informação estruturada real que só aparece ali.
function extrairClasses() {
  const ws = wbPhb.Sheets["Progressão de Classe"];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const classes = [];
  for (const row of rows.slice(1)) {
    if (!isDividerRow(row)) continue;
    const texto = dividerText(row);
    const m = texto.match(
      /^(.+?)\s*—\s*Atributo Primário:\s*(.+?)\s*\|\s*Dado de Vida:\s*(.+?)\s*\|\s*Salvaguardas:\s*(.+)$/
    );
    if (!m) continue;
    classes.push({
      nome: m[1].trim(),
      atributoPrimario: m[2].trim(),
      dadoDeVida: m[3].trim(),
      salvaguardas: m[4].trim(),
      fonte: row[row.length - 1],
      origem: ORIGEM_PADRAO,
    });
  }
  withIds(classes, (o) => slugify(o.nome));
  writeJson("classes.json", classes);
  contagens["classes.json"] = classes.length;
}
extrairClasses();

// Magia -----------------------------------------------------------------
processar(
  "Magias",
  "magias.json",
  {
    nome: 0,
    circulo: 1,
    escola: 2,
    classes: 3,
    tempoConjuracao: 4,
    alcance: 5,
    componentes: 6,
    duracao: 7,
    descricao: 8,
    fonte: 9,
  },
  (o) => slugify(o.nome)
);

processar(
  "Magias Preparadas por Classe",
  "magias-preparadas-por-classe.json",
  { classe: 0, quando: 1, quantidade: 2, fonte: 3 },
  (o) => slugify(o.classe)
);

processar(
  "Propriedades de Maestria",
  "propriedades-maestria.json",
  { nome: 0, nomeEn: 1, efeito: 2, fonte: 3 },
  (o) => slugify(o.nome)
);

// Mestre de jogo (apoio) -----------------------------------------------------
processar(
  "Estatísticas de Criaturas",
  "estatisticas-criaturas.json",
  {
    nome: 0,
    tipo: 1,
    tamanho: 2,
    alinhamento: 3,
    ca: 4,
    iniciativa: 5,
    pv: 6,
    deslocamento: 7,
    for: 8,
    des: 9,
    con: 10,
    int: 11,
    sab: 12,
    car: 13,
    pericias: 14,
    resistencias: 15,
    imunidades: 16,
    vulnerabilidades: 17,
    sentidos: 18,
    idiomas: 19,
    equipamento: 20,
    nd: 21,
    tracos: 22,
    acoes: 23,
    acoesBonus: 24,
    reacoes: 25,
    fonte: 26,
  },
  (o) => slugify(o.nome)
);

// Abas com múltiplas tabelinhas na mesma planilha (Regras Rápidas,
// Multiclasse) — bloco = título de 1 célula, depois header, depois linhas,
// separados por linha em branco.
function lerBlocos(wb, sheetName) {
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const blocos = [];
  let i = 0;
  while (i < rows.length) {
    while (i < rows.length && rows[i].every((c) => c === null || c === "")) i++;
    if (i >= rows.length) break;
    const titulo = rows[i][0];
    i++;
    const header = rows[i];
    i++;
    const linhas = [];
    while (i < rows.length && !rows[i].every((c) => c === null || c === "")) {
      linhas.push(rows[i]);
      i++;
    }
    blocos.push({ titulo, header, linhas });
  }
  return blocos;
}

function blocosParaObjetos(blocos) {
  return blocos.map((b) => ({
    titulo: b.titulo,
    colunas: b.header.filter((h) => h !== null),
    linhas: b.linhas.map((row) => {
      const obj = {};
      b.header.forEach((h, i) => {
        if (h === null) return;
        obj[h] = row[i] === undefined ? null : row[i];
      });
      return obj;
    }),
  }));
}

{
  const blocos = blocosParaObjetos(lerBlocos(wbPhb, "Regras Rápidas"));
  writeJson("regras-rapidas.json", blocos);
  contagens["regras-rapidas.json"] = blocos.reduce((n, b) => n + b.linhas.length, 0);
}
{
  const blocos = blocosParaObjetos(lerBlocos(wbPhb, "Multiclasse"));
  writeJson("multiclasse.json", blocos);
  contagens["multiclasse.json"] = blocos.reduce((n, b) => n + b.linhas.length, 0);
}

// ---------------------------------------------------------------------------
// Manifest final (substitui o da Entrega 0 com a lista completa de saída)

const manifest = {
  geradoEm: new Date().toISOString(),
  fontes: {
    phb: { arquivo: "dnd5e-2024-referencia.xlsx", abas: wbPhb.SheetNames },
    guiaMestre: {
      arquivo: "dnd5e-2024-guia-mestre-referencia.xlsx",
      abas: wbGuiaMestre.SheetNames,
      status: "não importado nesta entrega (fora do escopo da Entrega 1)",
    },
  },
  arquivosGerados: contagens,
};
writeJson("_manifest.json", manifest);

console.log("Arquivos gerados em", OUT_DIR + ":");
for (const [file, count] of Object.entries(contagens)) {
  console.log(`  ${file.padEnd(34)} ${count} itens`);
}
