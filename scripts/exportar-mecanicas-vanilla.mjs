#!/usr/bin/env node
// Copia (não reescreve) os dados de mecânica de nível 1 já curados à mão em
// data/*.js do site vanilla para data/rulesets/dnd2024/mecanicas-nivel1/,
// em JSON. Isso é a migração "praticamente intacta" que o VISAO.md §4 já
// previa para esses arquivos — são dados de regra (classe, espécie,
// antecedente, arma, armadura, item, magia, talento) que o motor em core/
// (Entrega 4 da Fase 1) vai consumir, não a planilha de referência bruta da
// Entrega 1 (que cobre o livro inteiro 1-20, mas em formato de texto corrido
// — este script cobre exatamente o nível 1, no formato que o wizard atual
// já usa pra calcular CA/PV/perícias/ataques/conjuração).
//
// Roda cada data/*.js (mais um recorte de puro-dado de
// js/00-notes-and-state.js — só os mapas Classe/Espécie/Antecedente->const,
// nunca as notas/funções) na ORDEM EXATA em que o index.html carrega hoje,
// dentro de uma sandbox Node (vm), e serializa os objetos resultantes —
// nada é digitado de novo à mão, então não há risco de erro de transcrição.
//
// Roda sozinho, sem argumento: node scripts/exportar-mecanicas-vanilla.mjs

import vm from "node:vm";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, "..");
const OUT_DIR = join(RAIZ, "data", "rulesets", "dnd2024", "mecanicas-nivel1");
mkdirSync(OUT_DIR, { recursive: true });

// Mesma ordem de <script> do index.html (linhas 19-69) — só os arquivos de
// DADO puro (const = objeto/array), nunca os js/*.js de UI/lógica.
const ARQUIVOS_DADO_EM_ORDEM = [
  "data/weapon-mastery.js",
  "data/classes/bruxo.js",
  "data/classes/barbaro.js",
  "data/spells.js",
  "data/feats.js",
  "data/skills.js",
  "data/classes/bardo.js",
  "data/classes/mago.js",
  "data/classes/paladino.js",
  "data/classes/psionico.js",
  "data/classes/clerigo.js",
  "data/classes/guerreiro.js",
  "data/classes/ladino.js",
  "data/classes/druida.js",
  "data/classes/feiticeiro.js",
  "data/classes/monge.js",
  "data/classes/guardiao.js",
  "data/languages.js",
  "data/alignments.js",
  "data/instruments.js",
  "data/game-sets.js",
  "data/artisan-tools.js",
  "data/shop-items.js",
  "data/equipment-aliases.js",
  "data/armor-ac.js",
  "data/species/tiferino.js",
  "data/species/pequenino.js",
  "data/species/aasimar.js",
  "data/species/anao.js",
  "data/species/orc.js",
  "data/species/humano.js",
  "data/species/draconato.js",
  "data/species/elfo.js",
  "data/species/gnomo.js",
  "data/species/golias.js",
  "data/backgrounds/charlatao.js",
  "data/backgrounds/nobre.js",
  "data/backgrounds/andarilho.js",
  "data/backgrounds/criminoso.js",
  "data/backgrounds/eremita.js",
  "data/backgrounds/fazendeiro.js",
  "data/backgrounds/marinheiro.js",
  "data/backgrounds/escriba.js",
  "data/backgrounds/mercador.js",
  "data/backgrounds/artesao.js",
  "data/backgrounds/artista.js",
  "data/backgrounds/guarda.js",
  "data/backgrounds/soldado.js",
  "data/backgrounds/acolito.js",
  "data/backgrounds/guia.js",
  "data/backgrounds/sabio.js",
];

const partes = ARQUIVOS_DADO_EM_ORDEM.map((rel) => readFileSync(join(RAIZ, rel), "utf8"));

// Recorte de js/00-notes-and-state.js: só os mapas Classe/Espécie/
// Antecedente -> const (linhas 1010-1065) e as consts de regra genérica
// (linhas 1114-1119: ABILITIES, PROF_BONUS_BY_LEVEL, STANDARD_ARRAY) — por
// intervalo de linha, nunca o arquivo inteiro (que tem ~1400 linhas de
// notas/histórico e funções que assumem DOM/localStorage, sem uso aqui).
const notasELinhas = readFileSync(join(RAIZ, "js", "00-notes-and-state.js"), "utf8").split("\n");
const recorteMapas = notasELinhas.slice(1009, 1065).join("\n"); // linhas 1010-1065 (1-indexed)
const recorteConsts = notasELinhas.slice(1113, 1119).join("\n"); // linhas 1114-1119
const recorteAllTools = notasELinhas[1274]; // linha 1275: ALL_TOOLS (pool do talento Habilidoso)

// 4 mapas pequenos e estáveis que hoje vivem em js/06-idiomas-attrs-shop.js
// (arquivo de UI — não dá pra rodar ele inteiro numa sandbox sem DOM).
// Reproduzidos aqui por extenso, não recalculados: conferir com
// `grep -n "WEAPON_PROF_LABEL\|ARMOR_PROF_LABEL\|CLASS_HIT_DIE\|CLASS_SPELL_ABILITY" js/06-idiomas-attrs-shop.js`
// sempre que o vanilla mudar essas linhas.
const mapasDeJs06 = `
const WEAPON_PROF_LABEL = {"simples":"Armas Simples","marcial":"Armas Marciais"};
const ARMOR_PROF_LABEL = {"leve":"Armadura Leve","media":"Armadura Média","pesada":"Armadura Pesada","escudo":"Escudos"};
const CLASS_HIT_DIE = {"Bárbaro":12,"Guerreiro":10,"Paladino":10,"Guardião":10,"Bardo":8,"Bruxo":8,"Clérigo":8,"Druida":8,"Ladino":8,"Monge":8,"Psiônico":6,"Feiticeiro":6,"Mago":6};
const CLASS_SPELL_ABILITY = {"Mago":"Inteligência","Psiônico":"Inteligência","Clérigo":"Sabedoria","Druida":"Sabedoria","Guardião":"Sabedoria","Bruxo":"Carisma","Bardo":"Carisma","Paladino":"Carisma","Feiticeiro":"Carisma"};
`;

const NOMES_EXPORTADOS = [
  // Mecânica de arma/armadura/maestria
  "WEAPON_MASTERY", "MASTERY_PROPERTIES", "ARMOR_AC", "SHIELD_ITEM_ID",
  "WEAPON_PROF_LABEL", "ARMOR_PROF_LABEL",
  // Classe (nível 1)
  "CLASS_CONST", "CLASS_DATA_KEY", "CLASS_HIT_DIE", "CLASS_SPELL_ABILITY",
  // Antecedente
  "BACKGROUND_CONST", "BACKGROUND_DATA_KEY",
  // Espécie
  "SPECIES_CONST",
  // Loja / equipamento
  "SHOP", "EQUIPMENT_ALIASES",
  // Magias, talentos, perícias, idiomas, alinhamentos, ferramentas/instrumentos
  "SPELL_DETAILS", "FEAT_DETAILS", "ALL_SKILLS", "SKILL_ABILITY",
  "COMMON_LANGUAGES", "RARE_LANGUAGES", "ALIGNMENTS", "ALIGNMENT_INFO",
  "ALL_INSTRUMENTS", "ALL_GAME_SETS", "ALL_ARTISAN_TOOLS", "KIT_CONTENTS", "ALL_TOOLS",
  // Regras gerais de personagem
  "ABILITIES", "PROF_BONUS_BY_LEVEL", "STANDARD_ARRAY",
];

const scriptCompleto =
  partes.join("\n;\n") +
  "\n;\n" + recorteMapas +
  "\n;\n" + recorteConsts +
  "\n;\n" + recorteAllTools +
  "\n;\n" + mapasDeJs06 +
  `\nglobalThis.__EXPORT__ = { ${NOMES_EXPORTADOS.join(", ")} };\n`;

const sandbox = {};
vm.createContext(sandbox);
try {
  vm.runInContext(scriptCompleto, sandbox, { filename: "mecanicas-vanilla-concatenado.js" });
} catch (e) {
  console.error("Falha ao rodar os data/*.js concatenados numa sandbox:", e.message);
  process.exit(1);
}

const exportado = sandbox.__EXPORT__;
const faltando = NOMES_EXPORTADOS.filter((n) => exportado[n] === undefined);
if (faltando.length) {
  console.error("Consts esperadas mas não encontradas depois de rodar os arquivos:", faltando);
  process.exit(1);
}

for (const nome of NOMES_EXPORTADOS) {
  const arquivo = nome.toLowerCase().replace(/_/g, "-") + ".json";
  writeFileSync(join(OUT_DIR, arquivo), JSON.stringify(exportado[nome], null, 2) + "\n");
}

console.log(`OK — ${NOMES_EXPORTADOS.length} arquivos gerados em ${OUT_DIR}`);

// ---------------------------------------------------------------------------
// Dados DERIVADOS (Entrega 4c) — diferente de tudo acima, isto não é uma
// cópia fiel de um const do vanilla. É a mesma regra que hoje só existe como
// ramificação de código em computeAC() (js/07-compute-and-summary.js,
// `if(classe==='Bárbaro')`/`if(classe==='Monge' && !hasShield)`/
// `if(estiloDeLuta==='Defensivo')`), reescrita à mão como dado estruturado —
// porque o motor genérico em core/ não pode ter esses nomes de classe/estilo
// dentro dele (VISAO.md §4). Conferir sempre contra js/07-compute-and-summary.js
// se a regra vanilla mudar.

const defesaSemArmadura = {
  "Bárbaro": { nome: "Defesa sem Armadura (Bárbaro)", atributos: ["Destreza", "Constituição"], perdeComEscudo: false },
  "Monge": { nome: "Defesa sem Armadura (Monge)", atributos: ["Destreza", "Sabedoria"], perdeComEscudo: true },
};
writeFileSync(join(OUT_DIR, "defesa-sem-armadura.json"), JSON.stringify(defesaSemArmadura, null, 2) + "\n");

// Dos 10 Estilos de Luta do Guerreiro (GUERREIRO.estiloDeLuta), só o
// "Defensivo" muda a CA — os outros 9 são só texto informativo.
const estiloDeLutaEfeitoCA = {
  "Defensivo": { label: "Estilo de Luta (Defensivo)", valor: 1 },
};
writeFileSync(join(OUT_DIR, "estilo-de-luta-efeito-ca.json"), JSON.stringify(estiloDeLutaEfeitoCA, null, 2) + "\n");

// O bônus de +2 CA do Escudo está hardcoded em computeAC() (`base += 2`),
// não é um campo do próprio item na Loja — só existe 1 Escudo na Loja hoje.
const escudoBonusCA = { label: "Escudo (comprado na Loja)", labelFonte: "Escudo", valor: 2 };
writeFileSync(join(OUT_DIR, "escudo-bonus-ca.json"), JSON.stringify(escudoBonusCA, null, 2) + "\n");

console.log("OK — 3 arquivos derivados gerados (defesa-sem-armadura.json, estilo-de-luta-efeito-ca.json, escudo-bonus-ca.json)");

// Regra de atributo de ataque com arma (Entrega 4d) — hoje é
// `wm.tipo==='Corpo a Corpo' ? strMod : dexMod`, com Acuidade usando o
// melhor de Força/Destreza (weaponAttackBonus() em js/07). Idêntica pra
// TODAS as classes (não varia por classe, diferente da CA) — só existe uma
// vez, não por classe.
const regraAtributoDeArma = {
  atributoPorTipo: { "Corpo a Corpo": "Força", "À Distância": "Destreza" },
  propriedadeMelhorAtributo: { propriedade: "Acuidade", atributos: ["Força", "Destreza"] },
};
writeFileSync(join(OUT_DIR, "regra-atributo-arma.json"), JSON.stringify(regraAtributoDeArma, null, 2) + "\n");

// Conjuração por classe (Entrega 4d) — o switch(data.classe) de
// computeSpellcasting() (js/07), reescrito como dado: quais campos de
// data.<classe> contam como truque/magia, mais qualquer concessão fixa da
// própria classe (Falar com Animais do Druida, Marca do Predador do
// Guardião — sempre conjuradas, sem escolha do jogador).
const conjuracaoPorClasse = {
  "Bruxo": { camposTruques: ["cantrips", "tomoCantrips"], camposMagias: ["spells1", "tomoRituals"], extrasFixos: [] },
  "Mago": { camposTruques: ["cantrips"], camposMagias: ["prepared"], extrasFixos: [] },
  "Paladino": { camposTruques: [], camposMagias: ["prepared"], extrasFixos: [] },
  "Guardião": { camposTruques: [], camposMagias: ["spells1"], extrasFixos: ["Marca do Predador"] },
  "Druida": { camposTruques: ["cantrips"], camposMagias: ["spells1"], extrasFixos: ["Falar com Animais"] },
  "Bardo": { camposTruques: ["cantrips"], camposMagias: ["spells1"], extrasFixos: [] },
  "Psiônico": { camposTruques: ["cantrips"], camposMagias: ["spells1"], extrasFixos: [] },
  "Clérigo": { camposTruques: ["cantrips"], camposMagias: ["spells1"], extrasFixos: [] },
  "Feiticeiro": { camposTruques: ["cantrips"], camposMagias: ["spells1"], extrasFixos: [] },
};
writeFileSync(join(OUT_DIR, "conjuracao-por-classe.json"), JSON.stringify(conjuracaoPorClasse, null, 2) + "\n");

console.log("OK — 2 arquivos derivados gerados (regra-atributo-arma.json, conjuracao-por-classe.json)");
