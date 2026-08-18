#!/usr/bin/env node
// Comparação final da Entrega 4 (Fase 1): as MESMAS 2080 combinações de
// Classe (13) × Antecedente (16) × Espécie (10) do tests/regression-sweep.js
// — mesmo estado inicial "limpo" (mesmas escolhas vazias/default), pra
// garantir que estamos comparando exatamente a mesma coisa — só que aqui,
// em vez de só checar "não lançou exceção", comparamos os NÚMEROS de
// verdade: atributos, salvaguardas, perícias, PV, CA, ataques e conjuração,
// calculados pelo motor vanilla (no navegador) contra core/motor/*.ts.
//
// Requer o site vanilla servido em http://localhost:8000.
// Rodar: node scripts/comparar-fase1-todas-combinacoes.mjs

import { chromium } from "playwright";
import { calcularAtributos, calcularSalvaguardas, calcularPericias, calcularPontosDeVidaNivel1 } from "../core/motor/atributos.ts";
import { calcularCA } from "../core/motor/ca.ts";
import { calcularAtaques } from "../core/motor/ataques.ts";
import { calcularConjuracao } from "../core/motor/conjuracao.ts";

const M = "../data/rulesets/dnd2024/mecanicas-nivel1/";
async function carregar(nome) {
  return (await import(`${M}${nome}.json`, { with: { type: "json" } })).default;
}
const ABILITIES = await carregar("abilities");
const ALL_SKILLS = await carregar("all-skills");
const SKILL_ABILITY = await carregar("skill-ability");
const CLASS_CONST = await carregar("class-const");
const CLASS_HIT_DIE = await carregar("class-hit-die");
const CLASS_SPELL_ABILITY = await carregar("class-spell-ability");
const BACKGROUND_CONST = await carregar("background-const");
const DEFESA_SEM_ARMADURA = await carregar("defesa-sem-armadura");
const ESCUDO_BONUS_CA = await carregar("escudo-bonus-ca");
const CONJURACAO_POR_CLASSE = await carregar("conjuracao-por-classe");
const PROF_BONUS = (await carregar("prof-bonus-by-level"))["1"];

function calcularFichaCore(classe, antecedente) {
  const attrsBase = Object.fromEntries(ABILITIES.map((a) => [a, 8]));
  const atributosCore = calcularAtributos(ABILITIES, attrsBase, {}); // sem bônus de antecedente nesta base (abilityPlan sempre null)
  // Todo core/motor/ espera o MODIFICADOR pronto em `modPorAtributo` (só
  // calcularAtributos() lida com o valor bruto do atributo) — ver nota no
  // topo de core/motor/atributos.ts.
  const modPorAtributo = Object.fromEntries(atributosCore.map((a) => [a.atributo, a.mod]));

  const clsConst = CLASS_CONST[classe];
  const salvaguardasCore = calcularSalvaguardas(ABILITIES, modPorAtributo, clsConst.savingThrows, PROF_BONUS);

  // Única fonte de perícia proficiente nesta base "vazia": a lista fixa do
  // antecedente (classe/habilidoso/humano/elfo ficam vazios sem escolha).
  const periciasProficientes = new Set(BACKGROUND_CONST[antecedente].skills || []);
  const periciasCore = calcularPericias(ALL_SKILLS, SKILL_ABILITY, modPorAtributo, periciasProficientes, new Set(), PROF_BONUS);

  const pvCore = calcularPontosDeVidaNivel1(CLASS_HIT_DIE[classe], modPorAtributo["Constituição"]);

  // Sem nenhum item possuído nesta base — CA cai sempre em Defesa sem
  // Armadura (se a classe tiver) ou "Sem armadura", nunca com Escudo.
  const caCore = calcularCA({
    armaduraEquipada: null,
    atributoDeArmadura: "Destreza",
    temEscudo: false,
    bonusEscudo: ESCUDO_BONUS_CA,
    defesaSemArmadura: DEFESA_SEM_ARMADURA[classe] || null,
    modPorAtributo,
    bonusExtraComArmadura: null,
  });

  // Sem nenhuma arma possuída nesta base.
  const ataquesCore = calcularAtaques([], { categoriasProficientes: [], restringirAoTipo: null, filtroDePropriedade: null }, { atributoPorTipo: {}, propriedadeMelhorAtributo: null }, () => "", modPorAtributo, PROF_BONUS, (n) => (n >= 0 ? "+" : "") + n);

  // Nesta base "vazia" (mesma do regression-sweep), todo campo de escolha
  // de truque/magia é []: só os extras fixos da classe sobrevivem.
  const atributoConjuracao = CLASS_SPELL_ABILITY[classe] ?? null;
  const regraConj = CONJURACAO_POR_CLASSE[classe];
  const truques = [];
  const magias = regraConj ? regraConj.extrasFixos : [];
  const conjuracaoCore = calcularConjuracao(atributoConjuracao, modPorAtributo, PROF_BONUS, truques, magias, () => null);

  return { atributosCore, salvaguardasCore, periciasCore, pvCore, caCore, ataquesCore, conjuracaoCore };
}

function comparar(sheetVanilla, core) {
  const problemas = [];
  const attrsV = sheetVanilla.attrs.map((a) => ({ a: a.ability, v: a.score, m: a.mod }));
  const attrsC = core.atributosCore.map((a) => ({ a: a.atributo, v: a.valor, m: a.mod }));
  if (JSON.stringify(attrsV) !== JSON.stringify(attrsC)) problemas.push("attrs");

  const savesV = sheetVanilla.savingThrows.map((s) => ({ a: s.ability, p: s.proficient, b: s.bonus }));
  const savesC = core.salvaguardasCore.map((s) => ({ a: s.atributo, p: s.proficiente, b: s.bonus }));
  if (JSON.stringify(savesV) !== JSON.stringify(savesC)) problemas.push("savingThrows");

  const skillsV = sheetVanilla.skills.map((s) => ({ s: s.skill, p: s.proficient, e: s.expertise, b: s.bonus }));
  const skillsC = core.periciasCore.map((s) => ({ s: s.pericia, p: s.proficiente, e: s.especialista, b: s.bonus }));
  if (JSON.stringify(skillsV) !== JSON.stringify(skillsC)) problemas.push("skills");

  if (sheetVanilla.combate.hp !== core.pvCore.valor) problemas.push(`hp (vanilla=${sheetVanilla.combate.hp} core=${core.pvCore.valor})`);
  if (sheetVanilla.combate.ac.value !== core.caCore.valor || sheetVanilla.combate.ac.source !== core.caCore.fonte) {
    problemas.push(`ca (vanilla=${sheetVanilla.combate.ac.value}/"${sheetVanilla.combate.ac.source}" core=${core.caCore.valor}/"${core.caCore.fonte}")`);
  }

  if (JSON.stringify(sheetVanilla.attacks) !== JSON.stringify(core.ataquesCore)) problemas.push("attacks");

  const spV = sheetVanilla.spellcasting
    ? { cd: sheetVanilla.spellcasting.cd, at: sheetVanilla.spellcasting.ataque, t: sheetVanilla.spellcasting.cantrips.length, m: sheetVanilla.spellcasting.magias.length }
    : null;
  const spC = core.conjuracaoCore
    ? { cd: core.conjuracaoCore.cd, at: core.conjuracaoCore.ataque, t: core.conjuracaoCore.truques.length, m: core.conjuracaoCore.magias.length }
    : null;
  if (JSON.stringify(spV) !== JSON.stringify(spC)) problemas.push(`spellcasting (vanilla=${JSON.stringify(spV)} core=${JSON.stringify(spC)})`);

  return problemas;
}

const url = process.argv[2] || "http://localhost:8000/index.html";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url);

const classes = await page.evaluate(() => Object.keys(CLASS_DATA_KEY));
const backgrounds = await page.evaluate(() => Object.keys(BACKGROUND_DATA_KEY));
const species = await page.evaluate(() => ENABLED_SPECIES);

const divergencias = [];
let total = 0;

for (const c of classes) {
  for (const bg of backgrounds) {
    for (const sp of species) {
      total++;
      const sheetVanilla = await page.evaluate(
        ({ c, bg, sp }) => {
          data = Object.assign(
            { characterName: "", especie: null, antecedente: null, classe: null, alinhamento: null,
              equippedArmorId: null, equippedShieldId: null,
              attrs: { Força: 8, Destreza: 8, Constituição: 8, Inteligência: 8, Sabedoria: 8, Carisma: 8 },
              freeAbilityRule: true, idiomas: { comuns: [], extra: [] }, shop: { purchases: {}, collapsedCats: {}, filterByProf: false },
              tiefling: {}, aasimar: {}, humano: {}, elfo: {}, gnomo: {}, golias: {}, draconato: {}, pequenino: {},
              bruxo: { skills: [], cantrips: [], tomoCantrips: [], spells1: [], tomoRituals: [], pactBoon: null, equipment: null },
              barbaro: { skills: [], maestria: [], equipment: null },
              bardo: { skills: [], cantrips: [], spells1: [], instruments: [], equipment: null },
              mago: { skills: [], cantrips: [], spellbook: [], prepared: [], equipment: null },
              paladino: { skills: [], prepared: [], equipment: null },
              psionico: { skills: [], cantrips: [], spells1: [], equipment: null },
              clerigo: { skills: [], cantrips: [], spells1: [], equipment: null },
              guerreiro: { skills: [], maestria: [], equipment: null },
              ladino: { skills: [], especialista: [], equipment: null },
              druida: { skills: [], cantrips: [], spells1: [], equipment: null },
              feiticeiro: { skills: [], cantrips: [], spells1: [], equipment: null },
              monge: { skills: [], toolChoice: null, equipment: null },
              guardiao: { skills: [], spells1: [], equipment: null },
              charlatao: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              nobre: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              andarilho: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              criminoso: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              eremita: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              fazendeiro: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              marinheiro: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              escriba: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              mercador: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              artesao: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              artista: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              guarda: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              soldado: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              acolito: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              guia: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
              sabio: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
            }
          );
          data.classe = c;
          data.antecedente = bg;
          data.especie = sp;
          data.alinhamento = "Neutro";
          data.humano.tamanho = "Médio"; data.aasimar.tamanho = "Médio"; data.tiefling.tamanho = "Médio";
          data.tiefling.legado = "Infernal";
          data.draconato.heranca = DRACONATO.subespecie.opcoes[0].nome;
          data.elfo.linhagem = ELFO.subespecie.opcoes[0].nome;
          data.gnomo.linhagem = GNOMO.subespecie.opcoes[0].nome;
          data.golias.ancestralidade = GOLIAS.subespecie.opcoes[0].nome;
          return computeCharacterSheet();
        },
        { c, bg, sp }
      );

      const core = calcularFichaCore(c, bg);
      const problemas = comparar(sheetVanilla, core);
      if (problemas.length) divergencias.push(`${c} / ${bg} / ${sp}: ${problemas.join(", ")}`);
    }
  }
}

await browser.close();

console.log(`total combos: ${total}`);
console.log(`divergências: ${divergencias.length}`);
divergencias.slice(0, 30).forEach((d) => console.log(d));
process.exit(divergencias.length ? 1 : 0);
