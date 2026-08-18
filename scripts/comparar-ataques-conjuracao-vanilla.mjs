#!/usr/bin/env node
// Prova de conceito da Entrega 4d (Fase 1): ataques e conjuração,
// comparados contra o motor vanilla de verdade (Playwright), mesmo padrão
// de comparar-atributos-vanilla.mjs / comparar-ca-vanilla.mjs.
//
// Requer o site vanilla servido em http://localhost:8000.
// Rodar: node scripts/comparar-ataques-conjuracao-vanilla.mjs

import { chromium } from "playwright";
import { calcularAtaques } from "../core/motor/ataques.ts";
import { calcularConjuracao } from "../core/motor/conjuracao.ts";
import { mod } from "../core/motor/atributos.ts";

const WEAPON_MASTERY = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/weapon-mastery.json", { with: { type: "json" } })).default;
const CLASS_CONST = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/class-const.json", { with: { type: "json" } })).default;
const CLASS_SPELL_ABILITY = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/class-spell-ability.json", { with: { type: "json" } })).default;
const SPELL_DETAILS = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/spell-details.json", { with: { type: "json" } })).default;
const REGRA_ATRIBUTO_ARMA = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/regra-atributo-arma.json", { with: { type: "json" } })).default;
const CONJURACAO_POR_CLASSE = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/conjuracao-por-classe.json", { with: { type: "json" } })).default;

const chaveDaCategoria = (categoria) => (categoria === "Simples" ? "simples" : "marcial");
const formatarModificador = (n) => (n >= 0 ? "+" : "") + n;

function proficienciaDeArma(clsConst) {
  return {
    categoriasProficientes: clsConst.weaponProf,
    restringirAoTipo: clsConst.weaponProfMeleeOnly ? "Corpo a Corpo" : null,
    filtroDePropriedade: clsConst.weaponProfFiltroMarcial ? { categoria: "Marcial", propriedades: clsConst.weaponProfFiltroMarcial } : null,
  };
}

const SHOP = (await import("../data/rulesets/dnd2024/mecanicas-nivel1/shop.json", { with: { type: "json" } })).default;
const SHOP_POR_NOME = {};
for (const categoria of Object.values(SHOP)) {
  for (const item of categoria.items || []) SHOP_POR_NOME[item.n] = item;
}

/** Monta o objeto "arma possuída" pro motor a partir do NOME de exibição —
 * junta a mecânica (WEAPON_MASTERY) com o texto de dano da Loja (mesma
 * fonte que o vanilla usa em findShopItem(id).d dentro de computeAttacks()). */
function itemComoArma(nome) {
  const wm = WEAPON_MASTERY[nome];
  const shopItem = SHOP_POR_NOME[nome];
  if (!wm || !shopItem) return null;
  return { id: shopItem.id, nome, dano: shopItem.d, arma: { categoria: wm.categoria, tipo: wm.tipo, propriedades: wm.propriedades } };
}

function conjuracaoAdaptador(classe, dataDaClasse, modPorAtributo, prof) {
  const atributo = CLASS_SPELL_ABILITY[classe] ?? null;
  const regra = CONJURACAO_POR_CLASSE[classe];
  const truques = regra ? regra.camposTruques.flatMap((campo) => dataDaClasse[campo] || []) : [];
  const magias = regra
    ? [...regra.camposMagias.flatMap((campo) => dataDaClasse[campo] || []), ...regra.extrasFixos]
    : [];
  return calcularConjuracao(atributo, modPorAtributo, prof, truques, magias, (nome) => SPELL_DETAILS[nome] || null);
}

async function rodarCenario(page, nome, dataLimpa, montarData, calcularCoreFn) {
  await page.evaluate((fresh) => {
    Object.keys(data).forEach((k) => delete data[k]);
    Object.assign(data, structuredClone(fresh));
  }, dataLimpa);
  await page.evaluate(montarData);
  const sheetVanilla = await page.evaluate(() => computeCharacterSheet());
  const { ataquesCore, conjuracaoCore } = calcularCoreFn();

  const ataquesVanilla = sheetVanilla.attacks.map((a) => ({ nome: a.nome, bonus: a.bonus, dano: a.dano, proficiente: a.proficient }));
  const ataquesCoreSimpl = ataquesCore.map((a) => ({ nome: a.nome, bonus: a.bonus, dano: a.dano, proficiente: a.proficiente }));
  const ataquesOk = JSON.stringify(ataquesVanilla) === JSON.stringify(ataquesCoreSimpl);

  const conjVanilla = sheetVanilla.spellcasting
    ? { cd: sheetVanilla.spellcasting.cd, ataque: sheetVanilla.spellcasting.ataque, truques: sheetVanilla.spellcasting.cantrips.map((c) => c.nome).sort(), magias: sheetVanilla.spellcasting.magias.map((m) => m.nome).sort() }
    : null;
  const conjCoreSimpl = conjuracaoCore
    ? { cd: conjuracaoCore.cd, ataque: conjuracaoCore.ataque, truques: conjuracaoCore.truques.map((c) => c.nome).sort(), magias: conjuracaoCore.magias.map((m) => m.nome).sort() }
    : null;
  const conjOk = JSON.stringify(conjVanilla) === JSON.stringify(conjCoreSimpl);

  console.log(`\n${nome}:`);
  console.log(`  Ataques:    ${ataquesOk ? "OK" : "DIVERGIU\n    vanilla=" + JSON.stringify(ataquesVanilla) + "\n    core=" + JSON.stringify(ataquesCoreSimpl)}`);
  console.log(`  Conjuração: ${conjOk ? "OK" : "DIVERGIU\n    vanilla=" + JSON.stringify(conjVanilla) + "\n    core=" + JSON.stringify(conjCoreSimpl)}`);
  return ataquesOk && conjOk;
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("pageerror", (err) => console.error("[erro na página]", err.message));
await page.goto("http://localhost:8000/index.html");
await page.waitForFunction(() => typeof computeCharacterSheet === "function");
const dataLimpa = await page.evaluate(() => structuredClone(data));

let tudoOk = true;

try {

// 1. Bárbaro — não conjura (null), arma Simples/Marcial sem restrição.
tudoOk &= await rodarCenario(page, "Bárbaro com Machado Grande", dataLimpa, () => {
  data.classe = "Bárbaro"; data.antecedente = "Soldado"; data.especie = "Anão";
  data.attrs = { Força: 16, Destreza: 12, Constituição: 14, Inteligência: 10, Sabedoria: 10, Carisma: 8 };
  data.barbaro.maestria = ["Machado Grande"];
  data.shop.purchases = { "machado-grande": 1 };
}, () => {
  const modPorAtributo = { Força: mod(16), Destreza: mod(12), Constituição: mod(14), Inteligência: mod(10), Sabedoria: mod(10), Carisma: mod(8) };
  const clsConst = CLASS_CONST["Bárbaro"];
  const armas = [itemComoArma("Machado Grande")].filter(Boolean);
  const ataquesCore = calcularAtaques(armas, proficienciaDeArma(clsConst), REGRA_ATRIBUTO_ARMA, chaveDaCategoria, modPorAtributo, 2, formatarModificador);
  const conjuracaoCore = conjuracaoAdaptador("Bárbaro", {}, modPorAtributo, 2);
  return { ataquesCore, conjuracaoCore };
});

// 2. Ladino — Espada Curta (Marcial+Acuidade/Leve, proficiente) e Arco
// Longo (Marcial, sem Acuidade/Leve, NÃO proficiente pelo filtro fino).
tudoOk &= await rodarCenario(page, "Ladino com Espada Curta e Arco Longo", dataLimpa, () => {
  data.classe = "Ladino"; data.antecedente = "Criminoso"; data.especie = "Pequenino";
  data.attrs = { Força: 8, Destreza: 16, Constituição: 13, Inteligência: 12, Sabedoria: 10, Carisma: 14 };
  data.ladino.maestria = ["Espada Curta"];
  data.shop.purchases = { "espada-curta": 1, "arco-longo": 1 };
}, () => {
  const modPorAtributo = { Força: mod(8), Destreza: mod(16), Constituição: mod(13), Inteligência: mod(12), Sabedoria: mod(10), Carisma: mod(14) };
  const clsConst = CLASS_CONST["Ladino"];
  const armas = [itemComoArma("Espada Curta"), itemComoArma("Arco Longo")].filter(Boolean);
  const ataquesCore = calcularAtaques(armas, proficienciaDeArma(clsConst), REGRA_ATRIBUTO_ARMA, chaveDaCategoria, modPorAtributo, 2, formatarModificador);
  const conjuracaoCore = conjuracaoAdaptador("Ladino", {}, modPorAtributo, 2);
  return { ataquesCore, conjuracaoCore };
});

// 3. Monge — Espada Curta (Corpo a Corpo+Leve, proficiente) e Arco Longo
// (À Distância, NÃO proficiente — weaponProfMeleeOnly).
tudoOk &= await rodarCenario(page, "Monge com Espada Curta e Arco Longo", dataLimpa, () => {
  data.classe = "Monge"; data.antecedente = "Eremita"; data.especie = "Elfo";
  data.attrs = { Força: 10, Destreza: 16, Constituição: 13, Inteligência: 10, Sabedoria: 14, Carisma: 8 };
  data.shop.purchases = { "espada-curta": 1, "arco-longo": 1 };
}, () => {
  const modPorAtributo = { Força: mod(10), Destreza: mod(16), Constituição: mod(13), Inteligência: mod(10), Sabedoria: mod(14), Carisma: mod(8) };
  const clsConst = CLASS_CONST["Monge"];
  const armas = [itemComoArma("Espada Curta"), itemComoArma("Arco Longo")].filter(Boolean);
  const ataquesCore = calcularAtaques(armas, proficienciaDeArma(clsConst), REGRA_ATRIBUTO_ARMA, chaveDaCategoria, modPorAtributo, 2, formatarModificador);
  const conjuracaoCore = conjuracaoAdaptador("Monge", {}, modPorAtributo, 2);
  return { ataquesCore, conjuracaoCore };
});

// 4. Mago — spellbook NÃO conta como truque/magia da ficha, só "prepared".
tudoOk &= await rodarCenario(page, "Mago (spellbook vs. prepared)", dataLimpa, () => {
  data.classe = "Mago"; data.antecedente = "Sábio"; data.especie = "Elfo";
  data.attrs = { Força: 8, Destreza: 14, Constituição: 13, Inteligência: 16, Sabedoria: 12, Carisma: 10 };
  data.mago.cantrips = ["Amigos", "Prestidigitação Arcana"];
  data.mago.spellbook = ["Mísseis Mágicos", "Escudo Arcano", "Detectar Magia", "Enfeitiçar Pessoa", "Sono", "Identificar"];
  data.mago.prepared = ["Mísseis Mágicos", "Escudo Arcano"];
}, () => {
  const modPorAtributo = { Força: mod(8), Destreza: mod(14), Constituição: mod(13), Inteligência: mod(16), Sabedoria: mod(12), Carisma: mod(10) };
  const conjuracaoCore = conjuracaoAdaptador("Mago", { cantrips: ["Amigos", "Prestidigitação Arcana"], prepared: ["Mísseis Mágicos", "Escudo Arcano"] }, modPorAtributo, 2);
  return { ataquesCore: [], conjuracaoCore };
});

// 5. Druida — "Falar com Animais" sempre entra, mesmo sem estar em spells1.
tudoOk &= await rodarCenario(page, "Druida (extra fixo: Falar com Animais)", dataLimpa, () => {
  data.classe = "Druida"; data.antecedente = "Eremita"; data.especie = "Humano";
  data.humano.tamanho = "Médio";
  data.attrs = { Força: 10, Destreza: 12, Constituição: 14, Inteligência: 10, Sabedoria: 16, Carisma: 8 };
  data.druida.cantrips = ["Orientação"];
  data.druida.spells1 = ["Enredar", "Curar Ferimentos"];
}, () => {
  const modPorAtributo = { Força: mod(10), Destreza: mod(12), Constituição: mod(14), Inteligência: mod(10), Sabedoria: mod(16), Carisma: mod(8) };
  const conjuracaoCore = conjuracaoAdaptador("Druida", { cantrips: ["Orientação"], spells1: ["Enredar", "Curar Ferimentos"] }, modPorAtributo, 2);
  return { ataquesCore: [], conjuracaoCore };
});

// 6. Guardião — "Marca do Predador" sempre entra, mais Maestria em Arma.
tudoOk &= await rodarCenario(page, "Guardião (extra fixo + arma)", dataLimpa, () => {
  data.classe = "Guardião"; data.antecedente = "Guia"; data.especie = "Elfo";
  data.attrs = { Força: 14, Destreza: 16, Constituição: 12, Inteligência: 10, Sabedoria: 13, Carisma: 8 };
  data.guardiao.spells1 = ["Enredar"];
  data.guardiao.maestria = ["Espada Curta"];
  data.shop.purchases = { "espada-curta": 1 };
}, () => {
  const modPorAtributo = { Força: mod(14), Destreza: mod(16), Constituição: mod(12), Inteligência: mod(10), Sabedoria: mod(13), Carisma: mod(8) };
  const clsConst = CLASS_CONST["Guardião"];
  const armas = [itemComoArma("Espada Curta")].filter(Boolean);
  const ataquesCore = calcularAtaques(armas, proficienciaDeArma(clsConst), REGRA_ATRIBUTO_ARMA, chaveDaCategoria, modPorAtributo, 2, formatarModificador);
  const conjuracaoCore = conjuracaoAdaptador("Guardião", { spells1: ["Enredar"] }, modPorAtributo, 2);
  return { ataquesCore, conjuracaoCore };
});

// 7. Bruxo — Pacto do Tomo: tomoCantrips/tomoRituals somam junto de
// cantrips/spells1.
tudoOk &= await rodarCenario(page, "Bruxo (Pacto do Tomo)", dataLimpa, () => {
  data.classe = "Bruxo"; data.antecedente = "Charlatão"; data.especie = "Tiferino";
  data.tiefling.tamanho = "Médio"; data.tiefling.legado = null;
  data.attrs = { Força: 8, Destreza: 12, Constituição: 14, Inteligência: 10, Sabedoria: 10, Carisma: 16 };
  data.bruxo.pactBoon = "Pacto do Tomo";
  data.bruxo.cantrips = ["Fogo Fátuo"];
  data.bruxo.tomoCantrips = ["Prestidigitação Arcana"];
  data.bruxo.spells1 = ["Comando"];
  data.bruxo.tomoRituals = ["Identificar"];
}, () => {
  const modPorAtributo = { Força: mod(8), Destreza: mod(12), Constituição: mod(14), Inteligência: mod(10), Sabedoria: mod(10), Carisma: mod(16) };
  const conjuracaoCore = conjuracaoAdaptador("Bruxo", { cantrips: ["Fogo Fátuo"], tomoCantrips: ["Prestidigitação Arcana"], spells1: ["Comando"], tomoRituals: ["Identificar"] }, modPorAtributo, 2);
  return { ataquesCore: [], conjuracaoCore };
});

// 8. Paladino — só "prepared" conta (sem truque).
tudoOk &= await rodarCenario(page, "Paladino (só magias, sem truques)", dataLimpa, () => {
  data.classe = "Paladino"; data.antecedente = "Nobre"; data.especie = "Humano";
  data.humano.tamanho = "Médio";
  data.attrs = { Força: 16, Destreza: 10, Constituição: 14, Inteligência: 8, Sabedoria: 10, Carisma: 13 };
  data.paladino.prepared = ["Curar Ferimentos"];
}, () => {
  const modPorAtributo = { Força: mod(16), Destreza: mod(10), Constituição: mod(14), Inteligência: mod(8), Sabedoria: mod(10), Carisma: mod(13) };
  const conjuracaoCore = conjuracaoAdaptador("Paladino", { prepared: ["Curar Ferimentos"] }, modPorAtributo, 2);
  return { ataquesCore: [], conjuracaoCore };
});

} finally {
  await browser.close();
}

if (!tudoOk) {
  console.error("\nProva de comparação de ataques/conjuração FALHOU em pelo menos um cenário.");
  process.exit(1);
}
console.log("\nOK — core/motor/ataques.ts e conjuracao.ts produzem exatamente os mesmos números que o motor vanilla, nos 8 cenários.");
