#!/usr/bin/env node
// Prova de conceito da Entrega 4c (Fase 1): mesma ideia de
// comparar-atributos-vanilla.mjs, agora pra Classe de Armadura (CA) — a
// parte mais ramificada por classe do motor vanilla (Bárbaro/Monge com
// Defesa sem Armadura, Guerreiro com Estilo de Luta Defensivo). 4 cenários,
// um por ramo de calcularCA() em core/motor/ca.ts.
//
// Requer o site vanilla servido em http://localhost:8000.
// Rodar: node scripts/comparar-ca-vanilla.mjs

import { chromium } from "playwright";
import { calcularCA } from "../core/motor/ca.ts";
import { mod } from "../core/motor/atributos.ts";

const DEFESA_SEM_ARMADURA = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/defesa-sem-armadura.json", { with: { type: "json" } })).default;
const ESTILO_EFEITO_CA = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/estilo-de-luta-efeito-ca.json", { with: { type: "json" } })).default;
const ESCUDO_BONUS_CA = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/escudo-bonus-ca.json", { with: { type: "json" } })).default;
const ARMOR_AC = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/armor-ac.json", { with: { type: "json" } })).default;

function nomeArmaduraVanilla(id) {
  // Nomes de exibição — bate com o "n" de data/shop-items.js pros ids usados abaixo.
  const nomes = { "armadura-de-couro": "Armadura de Couro", "cota-de-malha": "Cota de Malha" };
  return nomes[id];
}

async function rodarCenario(page, nome, dataLimpa, montarData, calcularCoreFn) {
  // Evita reload de página entre cenários (page.goto repetido se mostrou
  // instável neste ambiente, provavelmente por limite de recursos do
  // sandbox) — em vez disso, restaura `data` pro estado inicial limpo
  // (capturado uma vez logo após o primeiro carregamento) direto na mesma
  // página, sem navegação nova.
  await page.evaluate((fresh) => {
    Object.keys(data).forEach((k) => delete data[k]);
    Object.assign(data, structuredClone(fresh));
  }, dataLimpa);
  await page.evaluate(montarData);
  const sheetVanilla = await page.evaluate(() => computeCharacterSheet());
  const caVanilla = sheetVanilla.combate.ac;
  const caCore = calcularCoreFn();

  const ok = caVanilla.value === caCore.valor && caVanilla.source === caCore.fonte;
  console.log(`\n${nome}:`);
  console.log(`  CA:     vanilla=${caVanilla.value} core=${caCore.valor} ${caVanilla.value === caCore.valor ? "OK" : "DIVERGIU"}`);
  console.log(`  Fonte:  vanilla="${caVanilla.source}" core="${caCore.fonte}" ${caVanilla.source === caCore.fonte ? "OK" : "DIVERGIU"}`);
  return ok;
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (err) => console.error("[erro na página]", err.message));
await page.goto("http://localhost:8000/index.html");
await page.waitForFunction(() => typeof computeCharacterSheet === "function");
const dataLimpa = await page.evaluate(() => structuredClone(data));

let tudoOk = true;

try {

// 1. Bárbaro sem armadura, sem escudo — Defesa sem Armadura (Destreza+Constituição).
tudoOk &= await rodarCenario(
  page,
  "Bárbaro sem armadura",
  dataLimpa,
  () => {
    data.classe = "Bárbaro";
    data.antecedente = "Soldado";
    data.especie = "Anão";
    data.attrs = { Força: 15, Destreza: 14, Constituição: 13, Inteligência: 10, Sabedoria: 12, Carisma: 8 };
    data.soldado.equipment = "B";
    data.soldado.abilityPlan = { type: "2-1", plus2: "Força", plus1: "Constituição" };
  },
  () => {
    const modPorAtributo = { Força: mod(15), Destreza: mod(14), Constituição: mod(13 + 1), Inteligência: mod(10), Sabedoria: mod(12), Carisma: mod(8) };
    return calcularCA({
      armaduraEquipada: null,
      atributoDeArmadura: "Destreza",
      temEscudo: false,
      bonusEscudo: ESCUDO_BONUS_CA,
      defesaSemArmadura: DEFESA_SEM_ARMADURA["Bárbaro"],
      modPorAtributo,
      bonusExtraComArmadura: null,
    });
  }
);

// 2. Monge sem armadura MAS com Escudo — perde a Defesa sem Armadura (regra
// exige "sem armadura E sem escudo"), cai no padrão 10+Destreza+2.
tudoOk &= await rodarCenario(
  page,
  "Monge sem armadura, com Escudo comprado",
  dataLimpa,
  () => {
    data.classe = "Monge";
    data.antecedente = "Eremita";
    data.especie = "Elfo";
    data.attrs = { Força: 10, Destreza: 15, Constituição: 13, Inteligência: 10, Sabedoria: 14, Carisma: 8 };
    data.eremita.equipment = "B";
    data.eremita.abilityPlan = { type: "2-1", plus2: "Destreza", plus1: "Sabedoria" };
    data.shop.purchases = { escudo: 1 };
  },
  () => {
    const modPorAtributo = { Força: mod(10), Destreza: mod(15 + 1), Constituição: mod(13), Inteligência: mod(10), Sabedoria: mod(14 + 1), Carisma: mod(8) };
    return calcularCA({
      armaduraEquipada: null,
      atributoDeArmadura: "Destreza",
      temEscudo: true,
      bonusEscudo: ESCUDO_BONUS_CA,
      defesaSemArmadura: DEFESA_SEM_ARMADURA["Monge"],
      modPorAtributo,
      bonusExtraComArmadura: null,
    });
  }
);

// 3. Guerreiro com armadura comprada (Cota de Malha) + Estilo Defensivo.
tudoOk &= await rodarCenario(
  page,
  "Guerreiro com armadura + Estilo Defensivo",
  dataLimpa,
  () => {
    data.classe = "Guerreiro";
    data.antecedente = "Soldado";
    data.especie = "Humano";
    data.attrs = { Força: 15, Destreza: 12, Constituição: 14, Inteligência: 10, Sabedoria: 8, Carisma: 13 };
    data.humano.tamanho = "Médio";
    data.soldado.equipment = "B";
    data.soldado.abilityPlan = { type: "2-1", plus2: "Força", plus1: "Constituição" };
    data.guerreiro.estilo = "Defensivo";
    data.shop.purchases = { "cota-de-malha": 1 };
    data.equippedArmorId = "cota-de-malha";
  },
  () => {
    const modPorAtributo = { Força: mod(16), Destreza: mod(12), Constituição: mod(15), Inteligência: mod(10), Sabedoria: mod(8), Carisma: mod(13) };
    const armadura = ARMOR_AC["cota-de-malha"];
    return calcularCA({
      armaduraEquipada: { nome: nomeArmaduraVanilla("cota-de-malha"), ca: armadura.ca, tetoBonusAtributo: armadura.dexCap },
      atributoDeArmadura: "Destreza",
      temEscudo: false,
      bonusEscudo: ESCUDO_BONUS_CA,
      defesaSemArmadura: null,
      modPorAtributo,
      bonusExtraComArmadura: ESTILO_EFEITO_CA["Defensivo"],
    });
  }
);

// 4. Ladino com armadura de couro comprada (leve, sem teto de Destreza) —
// caminho "armadura sem nenhum bônus extra de classe".
tudoOk &= await rodarCenario(
  page,
  "Ladino com Armadura de Couro",
  dataLimpa,
  () => {
    data.classe = "Ladino";
    data.antecedente = "Criminoso";
    data.especie = "Pequenino";
    data.attrs = { Força: 8, Destreza: 15, Constituição: 13, Inteligência: 12, Sabedoria: 10, Carisma: 14 };
    data.criminoso.equipment = "B";
    data.criminoso.abilityPlan = { type: "2-1", plus2: "Destreza", plus1: "Constituição" };
    data.shop.purchases = { "armadura-de-couro": 1 };
    data.equippedArmorId = "armadura-de-couro";
  },
  () => {
    const modPorAtributo = { Força: mod(8), Destreza: mod(16), Constituição: mod(14), Inteligência: mod(12), Sabedoria: mod(10), Carisma: mod(14) };
    const armadura = ARMOR_AC["armadura-de-couro"];
    return calcularCA({
      armaduraEquipada: { nome: nomeArmaduraVanilla("armadura-de-couro"), ca: armadura.ca, tetoBonusAtributo: armadura.dexCap },
      atributoDeArmadura: "Destreza",
      temEscudo: false,
      bonusEscudo: ESCUDO_BONUS_CA,
      defesaSemArmadura: null,
      modPorAtributo,
      bonusExtraComArmadura: null,
    });
  }
);

} finally {
  await browser.close();
}

if (!tudoOk) {
  console.error("\nProva de comparação de CA FALHOU em pelo menos um cenário.");
  process.exit(1);
}
console.log("\nOK — core/motor/ca.ts produz exatamente a mesma CA (valor e fonte) que o motor vanilla, nos 4 cenários.");
