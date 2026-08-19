#!/usr/bin/env node
// Entrega 5f (Fase 1): varredura de paridade do WIZARD REACT INTEIRO contra
// o vanilla — não mais "motor com estado vazio" (isso já foi a Entrega 4d,
// comparar-fase1-todas-combinacoes.mjs, 2080/2080), mas dois personagens
// COMPLETOS de ponta a ponta: Classe → Antecedente → Espécie → Idiomas →
// Atributos → Alinhamento → Loja → Resumo, escolhas de verdade em cada
// passo, comparando os números finais exibidos na tela React contra
// computeCharacterSheet() rodando no site vanilla de verdade (mesmas
// escolhas injetadas direto em `data`, sem precisar clicar 40 vezes lá).
//
// Requer: site vanilla em http://localhost:8000 E o dev server React em
// http://localhost:5173 (rodar `npm run dev -- --port 5173 --strictPort`
// dentro de ui/ antes).
// Rodar: node scripts/comparar-fase1-wizard-completo.mjs

import { chromium } from "playwright";

async function exact(page, selector, text) {
  return page.locator(selector).filter({ has: page.locator("strong", { hasText: new RegExp(`^${text}$`) }) });
}
async function avancar(page) {
  await page.locator(".nav-wizard button.primary").click();
}

// ============================================================
// COMBO 1 — Bruxo (Pacto do Tomo) + Charlatão + Humano
// Cobre: as 4 listas de magia do Bruxo (cantrips/tomoCantrips/spells1/
// tomoRituals), talento Alerta (bônus de Iniciativa), Versátil do Humano.
// ============================================================
async function preencherBruxoReact(page) {
  await page.goto("http://localhost:5173/novo");
  await page.waitForSelector("#grp-0-classe");
  await (await exact(page, "button.choice", "Bruxo")).click();
  await avancar(page);
  await page.waitForSelector('h2:has-text("Bruxo — Detalhes")');

  await page.locator("#grp-1-skills button", { hasText: /^Arcanismo$/ }).click();
  await page.locator("#grp-1-skills button", { hasText: /^História$/ }).click();
  await page.locator(".opcao-equipamento", { hasText: "Pacto do Tomo" }).locator("button").click();
  await page.locator("#grp-1-cantrips button", { hasText: /^Amigos$/ }).click();
  await page.locator("#grp-1-cantrips button", { hasText: /^Badalar Fúnebre$/ }).click();
  await page.locator("#grp-1-tomocantrips button", { hasText: /^Acudir os Moribundos$/ }).click();
  await page.locator("#grp-1-tomocantrips button", { hasText: /^Arremesso Telecinético$/ }).click();
  await page.locator("#grp-1-tomocantrips button", { hasText: /^Arte Druídica$/ }).click();
  await page.locator("#grp-1-spells1 button", { hasText: /^Armadura de Agathys$/ }).click();
  await page.locator("#grp-1-spells1 button", { hasText: /^Braços de Hadar$/ }).click();
  await page.locator("#grp-1-tomorituals button", { hasText: /^Alarme$/ }).click();
  await page.locator("#grp-1-tomorituals button", { hasText: /^Compreender Idiomas$/ }).click();
  await page.locator("#grp-1-equipment .opcao-equipamento", { hasText: "Opção A" }).locator("button").click();
  await avancar(page);

  await page.waitForSelector("#grp-2-antecedente");
  await (await exact(page, "button.choice", "Charlatão")).click();
  await avancar(page);
  await page.waitForSelector("#grp-3-abilityplan");
  await page.locator("#grp-3-abilityplan .check-list button.check-pill").first().click();
  await page.waitForTimeout(50);
  const plano21 = page.locator(".plano-2-1");
  await plano21.locator(".check-list").nth(0).locator("button", { hasText: /^Carisma$/ }).click();
  await page.waitForTimeout(50);
  await plano21.locator(".check-list").nth(1).locator("button", { hasText: /^Constituição$/ }).click();
  const habilidoso = page.locator("#grp-3-habilidoso");
  await habilidoso.locator("button", { hasText: /^Atletismo$/ }).click();
  await habilidoso.locator("button", { hasText: /^Acrobacia$/ }).click();
  await habilidoso.locator("button", { hasText: /^Furtividade$/ }).click();
  await page.locator("#grp-3-equipment .opcao-equipamento", { hasText: "Opção A" }).locator("button").click();
  await avancar(page);

  await page.waitForSelector("#grp-4-especie");
  await (await exact(page, "button.choice", "Humano")).click();
  await avancar(page);
  await page.waitForSelector("#grp-5-tamanho");
  await page.locator("#grp-5-tamanho button", { hasText: /^Médio\b/ }).click();
  await page.locator("#grp-5-pericia button", { hasText: /^Percepção$/ }).click();
  await page.locator("#grp-5-talento button", { hasText: /^Alerta$/ }).click();
  await avancar(page);

  await page.waitForSelector("#grp-6-comuns");
  await page.locator("#grp-6-comuns button", { hasText: /^Dracônico$/ }).click();
  await page.locator("#grp-6-comuns button", { hasText: /^Anão$/ }).click();
  await avancar(page);

  await page.waitForSelector(".attr-row");
  const ordemAttrs = [["Carisma", "15"], ["Constituição", "14"], ["Destreza", "13"], ["Sabedoria", "12"], ["Inteligência", "10"], ["Força", "8"]];
  for (const [nome, valor] of ordemAttrs) {
    await page.locator(".attr-row", { has: page.locator(".rotulo-pequeno", { hasText: new RegExp(`^${nome}$`) }) }).locator("select").selectOption(valor);
  }
  await avancar(page);

  await page.waitForSelector("#grp-8-alinhamento");
  await (await exact(page, "#grp-8-alinhamento button.choice", "Caótico e Neutro")).click();
  await avancar(page);

  await page.waitForSelector('h2:has-text("Loja")');
  await avancar(page); // sem compras — testa o personagem só com o equipamento inicial

  await page.waitForSelector('h2:has-text("Resumo")');
}

function dadosVanillaBruxo() {
  return {
    classe: "Bruxo", antecedente: "Charlatão", especie: "Humano", alinhamento: "Caótico e Neutro",
    humano: { tamanho: "Médio", pericia: "Percepção", talento: "Alerta" },
    charlatao: {
      abilityPlan: { type: "2-1", plus2: "Carisma", plus1: "Constituição" },
      equipment: "A", habilidoso: ["Atletismo", "Acrobacia", "Furtividade"], ferramentaEscolhida: null,
      iniciadoCantrips: [], iniciadoSpell1: [],
    },
    bruxo: {
      skills: ["Arcanismo", "História"], pactBoon: "Pacto do Tomo",
      cantrips: ["Amigos", "Badalar Fúnebre"],
      tomoCantrips: ["Acudir os Moribundos", "Arremesso Telecinético", "Arte Druídica"],
      spells1: ["Armadura de Agathys", "Braços de Hadar"],
      tomoRituals: ["Alarme", "Compreender Idiomas"],
      equipment: "A",
    },
    idiomas: { comuns: ["Dracônico", "Anão"], extra: [] },
    attrs: { Carisma: 15, Constituição: 14, Destreza: 13, Sabedoria: 12, Inteligência: 10, Força: 8 },
    shop: { purchases: {}, collapsedCats: {}, filterByProf: false },
  };
}

// ============================================================
// COMBO 2 — Guerreiro (Estilo Defensivo) + Andarilho + Anão
// Cobre: equipamento C (sem itens iniciais, só ouro), maestria em arma
// sem restrição de tipo, compra na Loja (arma+armadura), CA com Estilo
// de Luta Defensivo, espécie sem escolha nenhuma (Anão).
// ============================================================
async function preencherGuerreiroReact(page) {
  await page.goto("http://localhost:5173/novo");
  await page.waitForSelector("#grp-0-classe");
  await (await exact(page, "button.choice", "Guerreiro")).click();
  await avancar(page);
  await page.waitForSelector('h2:has-text("Guerreiro — Detalhes")');

  await page.locator("#grp-1-skills button", { hasText: /^Atletismo$/ }).click();
  await page.locator("#grp-1-skills button", { hasText: /^Percepção$/ }).click();
  await page.locator("#grp-1-estilo .opcao-equipamento", { hasText: "Defensivo" }).locator("button").click();
  await page.locator("#grp-1-maestria button", { hasText: /^Adaga /, exact: false }).first().click();
  await page.locator("#grp-1-maestria button", { hasText: /^Alabarda /, exact: false }).first().click();
  await page.locator("#grp-1-maestria button", { hasText: /^Azagaia /, exact: false }).first().click();
  await page.locator("#grp-1-equipment .opcao-equipamento", { hasText: "Opção C" }).locator("button").click();
  await avancar(page);

  await page.waitForSelector("#grp-2-antecedente");
  await (await exact(page, "button.choice", "Andarilho")).click();
  await avancar(page);
  await page.waitForSelector("#grp-3-abilityplan");
  await page.locator("#grp-3-abilityplan .check-list button.check-pill").first().click();
  await page.waitForTimeout(50);
  const plano21 = page.locator(".plano-2-1");
  await plano21.locator(".check-list").nth(0).locator("button", { hasText: /^Destreza$/ }).click();
  await page.waitForTimeout(50);
  await plano21.locator(".check-list").nth(1).locator("button", { hasText: /^Sabedoria$/ }).click();
  await page.locator("#grp-3-equipment .opcao-equipamento", { hasText: "Opção A" }).locator("button").click();
  await avancar(page);

  await page.waitForSelector("#grp-4-especie");
  await (await exact(page, "button.choice", "Anão")).click();
  await avancar(page);
  await page.waitForTimeout(100);
  await avancar(page);

  await page.waitForSelector("#grp-6-comuns");
  await page.locator("#grp-6-comuns button", { hasText: /^Gigante$/ }).click();
  await page.locator("#grp-6-comuns button", { hasText: /^Goblin$/ }).click();
  await avancar(page);

  await page.waitForSelector(".attr-row");
  const ordemAttrs = [["Destreza", "15"], ["Constituição", "14"], ["Força", "13"], ["Sabedoria", "12"], ["Carisma", "10"], ["Inteligência", "8"]];
  for (const [nome, valor] of ordemAttrs) {
    await page.locator(".attr-row", { has: page.locator(".rotulo-pequeno", { hasText: new RegExp(`^${nome}$`) }) }).locator("select").selectOption(valor);
  }
  await avancar(page);

  await page.waitForSelector("#grp-8-alinhamento");
  await (await exact(page, "#grp-8-alinhamento button.choice", "Neutro")).click();
  await avancar(page);

  await page.waitForSelector('h2:has-text("Loja")');
  const catMarcial = page.locator(".shop-category", { has: page.locator("summary", { hasText: "Marciais — Corpo a Corpo" }) });
  await catMarcial.locator("tr", { has: page.locator("td", { hasText: /^Espada Longa/ }) }).locator("button.btn.small").nth(1).click();
  const catArmaduraLeve = page.locator(".shop-category", { has: page.locator("summary", { hasText: /^Armadura Leve/ }) });
  await catArmaduraLeve.locator("tr", { has: page.locator("td", { hasText: /^Armadura de Couro\b/ }) }).locator("button.btn.small").nth(1).click();
  await avancar(page);

  await page.waitForSelector('h2:has-text("Resumo")');
}

function dadosVanillaGuerreiro() {
  return {
    classe: "Guerreiro", antecedente: "Andarilho", especie: "Anão", alinhamento: "Neutro",
    anao: {},
    andarilho: {
      abilityPlan: { type: "2-1", plus2: "Destreza", plus1: "Sabedoria" },
      equipment: "A", habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [],
    },
    guerreiro: { skills: ["Atletismo", "Percepção"], estilo: "Defensivo", maestria: ["Adaga", "Alabarda", "Azagaia"], equipment: "C" },
    idiomas: { comuns: ["Gigante", "Goblin"], extra: [] },
    attrs: { Destreza: 15, Constituição: 14, Força: 13, Sabedoria: 12, Carisma: 10, Inteligência: 8 },
    shop: { purchases: { "espada-longa": 1, "armadura-de-couro": 1 }, collapsedCats: {}, filterByProf: false },
  };
}

// ============================================================
// Extração — lado React (DOM do Resumo)
// ============================================================
async function extrairResumoReact(page) {
  const attrGroups = page.locator(".attr-group");
  const n = await attrGroups.count();
  const attrs = {};
  for (let i = 0; i < n; i++) {
    const grupo = attrGroups.nth(i);
    const rotulo = (await grupo.locator(".rotulo-grupo").textContent()).trim();
    const m = rotulo.match(/^(\S+)\s+(-?\d+)\s+\(([+-]\d+)\)$/);
    const nome = m[1];
    const rows = grupo.locator(".stat-row");
    const rn = await rows.count();
    const linhas = {};
    for (let j = 0; j < rn; j++) {
      const spans = rows.nth(j).locator("span");
      const label = (await spans.nth(0).textContent()).replace(/^[●○◆]\s*/, "").trim();
      const valor = parseInt((await spans.nth(1).textContent()).trim(), 10);
      linhas[label] = valor;
    }
    attrs[nome] = { score: parseInt(m[2], 10), mod: parseInt(m[3], 10), salvaguarda: linhas["Salvaguarda"], pericias: linhas };
  }

  const combateTexto = (await page.locator(".tela-resumo h3", { hasText: "Combate" }).locator("xpath=following-sibling::p[1]").textContent()).trim();
  const pv = parseInt(combateTexto.match(/PV (\d+)/)[1], 10);
  const ca = parseInt(combateTexto.match(/CA (\d+)/)[1], 10);
  const iniciativa = parseInt(combateTexto.match(/Iniciativa ([+-]\d+)/)[1], 10);

  const ataques = [];
  const ataqueBlocos = page.locator(".tela-resumo h3", { hasText: "Ataques" }).locator("xpath=following-sibling::div[1]").locator(".opcao-equipamento");
  const an = await ataqueBlocos.count();
  for (let i = 0; i < an; i++) {
    const t = (await ataqueBlocos.nth(i).textContent()).trim();
    const nome = t.split(":")[0].trim();
    const bonus = parseInt(t.match(/: ([+-]\d+) pra acertar/)[1], 10);
    ataques.push({ nome, bonus });
  }
  ataques.sort((a, b) => a.nome.localeCompare(b.nome));

  let conjuracao = null;
  const conjuracaoHeader = page.locator(".tela-resumo h3", { hasText: "Conjuração" });
  if (await conjuracaoHeader.count()) {
    const cdTexto = (await conjuracaoHeader.locator("xpath=following-sibling::p[1]").textContent()).trim();
    const cd = parseInt(cdTexto.match(/CD (\d+)/)[1], 10);
    const ataqueMagico = parseInt(cdTexto.match(/Ataque Mágico ([+-]\d+)/)[1], 10);
    conjuracao = { cd, ataqueMagico };
  }

  const equipTexto = (await page.locator(".tela-resumo p.contador", { hasText: "Dinheiro restante" }).textContent()).trim();
  const poRestante = parseFloat(equipTexto.match(/Dinheiro restante: ([\d,]+) PO/)[1].replace(",", "."));

  return { attrs, pv, ca, iniciativa, ataques, conjuracao, poRestante };
}

// ============================================================
// Extração — lado vanilla (injeta `data` e chama computeCharacterSheet())
// ============================================================
async function extrairResumoVanilla(page, dadosParciais) {
  await page.goto("http://localhost:8000/index.html");
  await page.waitForFunction(() => typeof window.computeCharacterSheet === "function");
  const sheet = await page.evaluate((parciais) => {
    // eslint-disable-next-line no-undef
    Object.assign(data, parciais);
    const s = computeCharacterSheet();
    return {
      attrs: Object.fromEntries(s.attrs.map((a) => [
        a.ability,
        {
          score: a.score, mod: a.mod,
          salvaguarda: s.savingThrows.find((x) => x.ability === a.ability).bonus,
          pericias: Object.fromEntries(s.skills.filter((x) => x.ability === a.ability).map((x) => [x.skill, x.bonus])),
        },
      ])),
      pv: s.combate.hp, ca: s.combate.ac.value, iniciativa: s.combate.initiative,
      ataques: s.attacks.map((a) => ({ nome: a.nome, bonus: a.bonus })).sort((a, b) => a.nome.localeCompare(b.nome)),
      conjuracao: s.spellcasting ? { cd: s.spellcasting.cd, ataqueMagico: s.spellcasting.ataque } : null,
      poRestante: s.equipamento.poRestante,
    };
  }, dadosParciais);
  return sheet;
}

// ============================================================
// Diff
// ============================================================
function comparar(nomeCombo, react, vanilla) {
  const problemas = [];
  const cmp = (label, a, b) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) problemas.push(`${label}: react=${JSON.stringify(a)} vanilla=${JSON.stringify(b)}`);
  };
  cmp("pv", react.pv, vanilla.pv);
  cmp("ca", react.ca, vanilla.ca);
  cmp("iniciativa", react.iniciativa, vanilla.iniciativa);
  cmp("poRestante", react.poRestante, vanilla.poRestante);
  cmp("ataques", react.ataques, vanilla.ataques);
  cmp("conjuracao", react.conjuracao, vanilla.conjuracao);
  for (const nome of Object.keys(vanilla.attrs)) {
    cmp(`attrs.${nome}.score`, react.attrs[nome]?.score, vanilla.attrs[nome].score);
    cmp(`attrs.${nome}.mod`, react.attrs[nome]?.mod, vanilla.attrs[nome].mod);
    cmp(`attrs.${nome}.salvaguarda`, react.attrs[nome]?.salvaguarda, vanilla.attrs[nome].salvaguarda);
    for (const pericia of Object.keys(vanilla.attrs[nome].pericias)) {
      cmp(`attrs.${nome}.pericias.${pericia}`, react.attrs[nome]?.pericias?.[pericia], vanilla.attrs[nome].pericias[pericia]);
    }
  }
  console.log(`\n=== ${nomeCombo} ===`);
  if (problemas.length === 0) console.log("OK — todos os números batem.");
  else problemas.forEach((p) => console.log("DIVERGÊNCIA: " + p));
  return problemas.length;
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const erros = [];
  page.on("pageerror", (e) => erros.push(String(e)));

  let totalProblemas = 0;

  await preencherBruxoReact(page);
  const reactBruxo = await extrairResumoReact(page);
  const vanillaBruxo = await extrairResumoVanilla(page, dadosVanillaBruxo());
  totalProblemas += comparar("Bruxo (Pacto do Tomo) + Charlatão + Humano", reactBruxo, vanillaBruxo);

  await preencherGuerreiroReact(page);
  const reactGuerreiro = await extrairResumoReact(page);
  const vanillaGuerreiro = await extrairResumoVanilla(page, dadosVanillaGuerreiro());
  totalProblemas += comparar("Guerreiro (Defensivo) + Andarilho + Anão", reactGuerreiro, vanillaGuerreiro);

  await browser.close();
  console.log("\nErros de página/console:", erros.length ? erros : "nenhum");
  console.log(`\nTOTAL DE DIVERGÊNCIAS: ${totalProblemas}`);
  process.exit(totalProblemas > 0 || erros.length > 0 ? 1 : 0);
}

main();
