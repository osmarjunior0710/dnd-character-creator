#!/usr/bin/env node
// Prova de conceito da Entrega 4b (Fase 1): roda os MESMOS personagens no
// motor vanilla de verdade (via Playwright, chamando computeCharacterSheet()
// na página real) e nas novas funções puras de core/motor/atributos.ts,
// depois compara atributos/salvaguardas/perícias/PV número a número. Não é
// "eu calculei duas vezes e bati com a minha própria conta" — é comparação
// contra o motor vanilla rodando de verdade no navegador.
//
// Dois cenários: um sem nenhuma proficiência dobrada (Bárbaro) e um com
// Especialista do Ladino (a única fonte de proficiência dobrada em nível 1),
// pra exercitar os dois ramos de calcularPericias().
//
// Requer o site vanilla servido em http://localhost:8000 (ex.:
// `python3 -m http.server 8000` na raiz do repo) antes de rodar.
//
// Rodar: node scripts/comparar-atributos-vanilla.mjs

import { chromium } from "playwright";
import {
  calcularAtributos,
  calcularSalvaguardas,
  calcularPericias,
  calcularPontosDeVidaNivel1,
} from "../core/motor/atributos.ts";

const ABILITIES = ["Força", "Destreza", "Constituição", "Inteligência", "Sabedoria", "Carisma"];
const SKILL_ABILITY = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/skill-ability.json", { with: { type: "json" } })).default;
const ALL_SKILLS = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/all-skills.json", { with: { type: "json" } })).default;
const BACKGROUND_CONST = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/background-const.json", { with: { type: "json" } })).default;
const CLASS_HIT_DIE = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/class-hit-die.json", { with: { type: "json" } })).default;
const CLASS_CONST = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/class-const.json", { with: { type: "json" } })).default;

function diferencas(a, b, caminho = "") {
  const out = [];
  if (typeof a !== typeof b) return [`${caminho}: tipos diferentes`];
  if (typeof a === "number") {
    if (a !== b) out.push(`${caminho}: vanilla=${a} core=${b}`);
    return out;
  }
  if (Array.isArray(a)) {
    a.forEach((_, i) => out.push(...diferencas(a[i], b[i], `${caminho}[${i}]`)));
    return out;
  }
  if (a && typeof a === "object") {
    for (const k of Object.keys(a)) out.push(...diferencas(a[k], b?.[k], `${caminho}.${k}`));
    return out;
  }
  if (a !== b) out.push(`${caminho}: vanilla=${JSON.stringify(a)} core=${JSON.stringify(b)}`);
  return out;
}

async function rodarCenario(page, nome, montarData, calcularCore) {
  await page.evaluate(() => { location.reload(); });
  await page.waitForFunction(() => typeof computeCharacterSheet === "function");
  await page.evaluate(montarData);
  const sheetVanilla = await page.evaluate(() => computeCharacterSheet());

  const { atributosCore, salvaguardasCore, periciasCore, pvCore } = calcularCore();

  const attrsVanilla = sheetVanilla.attrs.map((a) => ({ atributo: a.ability, valor: a.score, mod: a.mod }));
  const attrsCore = atributosCore.map((a) => ({ atributo: a.atributo, valor: a.valor, mod: a.mod }));
  const savesVanilla = sheetVanilla.savingThrows.map((s) => ({ atributo: s.ability, proficiente: s.proficient, bonus: s.bonus }));
  const savesCore = salvaguardasCore.map((s) => ({ atributo: s.atributo, proficiente: s.proficiente, bonus: s.bonus }));
  const skillsVanilla = sheetVanilla.skills.map((s) => ({ pericia: s.skill, proficiente: s.proficient, especialista: s.expertise, bonus: s.bonus }));
  const skillsCore = periciasCore.map((s) => ({ pericia: s.pericia, proficiente: s.proficiente, especialista: s.especialista, bonus: s.bonus }));

  const problemas = [
    ...diferencas(attrsVanilla, attrsCore, "attrs"),
    ...diferencas(savesVanilla, savesCore, "savingThrows"),
    ...diferencas(skillsVanilla, skillsCore, "skills"),
    ...diferencas(sheetVanilla.combate.hp, pvCore.valor, "hp"),
  ];

  console.log(`\n${nome}:`);
  console.log(`  Atributos:    ${JSON.stringify(attrsVanilla) === JSON.stringify(attrsCore) ? "OK" : "DIVERGIU"}`);
  console.log(`  Salvaguardas: ${JSON.stringify(savesVanilla) === JSON.stringify(savesCore) ? "OK" : "DIVERGIU"}`);
  console.log(`  Perícias:     ${JSON.stringify(skillsVanilla) === JSON.stringify(skillsCore) ? "OK" : "DIVERGIU"}`);
  console.log(`  PV:           vanilla=${sheetVanilla.combate.hp} core=${pvCore.valor} ${sheetVanilla.combate.hp === pvCore.valor ? "OK" : "DIVERGIU"}`);
  if (problemas.length) {
    console.error("  Divergências:");
    problemas.forEach((p) => console.error("    " + p));
  }
  return problemas.length === 0;
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:8000/index.html");

const PROF_BONUS = 2;
let tudoOk = true;

// Cenário 1: Bárbaro Anão Soldado — sem proficiência dobrada.
tudoOk &= await rodarCenario(
  page,
  "Bárbaro Anão Soldado",
  () => {
    data.classe = "Bárbaro";
    data.antecedente = "Soldado";
    data.especie = "Anão";
    data.alinhamento = "Leal e Bom";
    data.attrs = { Força: 15, Destreza: 13, Constituição: 14, Inteligência: 10, Sabedoria: 12, Carisma: 8 };
    data.barbaro.skills = ["Intimidação", "Sobrevivência"];
    data.barbaro.maestria = ["Machado Grande"];
    data.soldado.abilityPlan = { type: "2-1", plus2: "Constituição", plus1: "Força" };
    data.soldado.equipment = "A";
  },
  () => {
    const bonusPorAtributo = { Força: 1, Constituição: 2 };
    const atributosCore = calcularAtributos(ABILITIES, { Força: 15, Destreza: 13, Constituição: 14, Inteligência: 10, Sabedoria: 12, Carisma: 8 }, bonusPorAtributo);
    const modPorAtributo = Object.fromEntries(atributosCore.map((a) => [a.atributo, a.mod]));
    const salvaguardasCore = calcularSalvaguardas(ABILITIES, modPorAtributo, CLASS_CONST["Bárbaro"].savingThrows, PROF_BONUS);
    const periciasProficientes = new Set(["Intimidação", "Sobrevivência", ...BACKGROUND_CONST["Soldado"].skills]);
    const periciasCore = calcularPericias(ALL_SKILLS, SKILL_ABILITY, modPorAtributo, periciasProficientes, new Set(), PROF_BONUS);
    const pvCore = calcularPontosDeVidaNivel1(CLASS_HIT_DIE["Bárbaro"], modPorAtributo["Constituição"]);
    return { atributosCore, salvaguardasCore, periciasCore, pvCore };
  }
);

// Cenário 2: Ladino Elfo Charlatão — com Especialista (proficiência dobrada
// em 2 perícias), o outro ramo de calcularPericias().
tudoOk &= await rodarCenario(
  page,
  "Ladino Elfo Charlatão (com Especialista)",
  () => {
    data.classe = "Ladino";
    data.antecedente = "Charlatão";
    data.especie = "Elfo";
    data.alinhamento = "Caótico e Neutro";
    data.attrs = { Força: 8, Destreza: 15, Constituição: 13, Inteligência: 12, Sabedoria: 10, Carisma: 14 };
    data.ladino.skills = ["Furtividade", "Percepção"];
    data.ladino.especialista = ["Furtividade", "Enganação"];
    data.ladino.maestria = ["Espada Curta", "Adaga"];
    data.charlatao.abilityPlan = { type: "2-1", plus2: "Carisma", plus1: "Destreza" };
    data.charlatao.equipment = "A";
  },
  () => {
    const bonusPorAtributo = { Carisma: 2, Destreza: 1 };
    const baseAttrs = { Força: 8, Destreza: 15, Constituição: 13, Inteligência: 12, Sabedoria: 10, Carisma: 14 };
    const atributosCore = calcularAtributos(ABILITIES, baseAttrs, bonusPorAtributo);
    const modPorAtributo = Object.fromEntries(atributosCore.map((a) => [a.atributo, a.mod]));
    const salvaguardasCore = calcularSalvaguardas(ABILITIES, modPorAtributo, CLASS_CONST["Ladino"].savingThrows, PROF_BONUS);
    const periciasProficientes = new Set(["Furtividade", "Percepção", ...BACKGROUND_CONST["Charlatão"].skills]);
    const periciasEspecialista = new Set(["Furtividade", "Enganação"]);
    const periciasCore = calcularPericias(ALL_SKILLS, SKILL_ABILITY, modPorAtributo, periciasProficientes, periciasEspecialista, PROF_BONUS);
    const pvCore = calcularPontosDeVidaNivel1(CLASS_HIT_DIE["Ladino"], modPorAtributo["Constituição"]);
    return { atributosCore, salvaguardasCore, periciasCore, pvCore };
  }
);

await browser.close();

if (!tudoOk) {
  console.error("\nProva de comparação FALHOU em pelo menos um cenário.");
  process.exit(1);
}
console.log("\nOK — core/motor/atributos.ts produz exatamente os mesmos números que o motor vanilla, nos dois cenários.");
