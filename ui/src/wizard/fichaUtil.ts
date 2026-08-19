import { calcularAtributos, calcularSalvaguardas, calcularPericias, calcularPontosDeVidaNivel1, type AtributoCalculado, type SalvaguardaCalculada, type PericiaCalculada, type PontosDeVidaCalculados } from "@core/motor/atributos.ts";
import { calcularCA, type ResultadoCA } from "@core/motor/ca.ts";
import { calcularAtaques, type AtaqueCalculado, type ArmaPossuida, type ProficienciaDeArma } from "@core/motor/ataques.ts";
import { calcularConjuracao, type ConjuracaoCalculada } from "@core/motor/conjuracao.ts";
import type { RulesetNivel1, AntecedenteConst, LojaItem, DetalheDeMagia } from "../ruleset/RulesetContext";
import type { WizardData, AntecedenteEscolha, ClasseEscolha } from "./WizardContext";
import { bonusDoAntecedente } from "./bonusAntecedente";
import { findShopItem, startingGold, spentGold } from "./lojaUtil";

/** Monta a ficha final calculada (equivalente a computeCharacterSheet(),
 * js/07-compute-and-summary.js) — reaproveitando core/motor/ (Entrega 4,
 * já provado 2080/2080 contra o vanilla) pra atributos/salvaguardas/
 * perícias/PV/CA/ataques/conjuração. Este arquivo é o ADAPTADOR: resolve
 * WizardData + JSON do ruleset nos parâmetros primitivos que o motor
 * espera — não reimplementa NENHUMA fórmula de novo, só monta os dados.
 *
 * Simplificações deliberadas em relação ao vanilla, registradas aqui:
 * (1) sem checagem de "Duplicidade" (detectDuplicidades) — as telas de
 * escolha já evitam a maior parte via `excluir`/marcação ⚠️, e uma
 * duplicata remanescente não quebra o cálculo, só não ganha o aviso
 * extra; (2) armadura equipada é sempre a de maior CA final calculada
 * automaticamente (sem o botão manual "Equipar" pra escolher outra,
 * quando o personagem tem mais de uma). */

function fmt(n: number): string {
  return (n >= 0 ? "+" : "") + n;
}

function chaveDeCategoria(categoria: string): string {
  return categoria === "Simples" ? "simples" : "marcial";
}

// --- Equipamento -----------------------------------------------------------

interface ItemResolvido {
  label: string;
  id: string | null;
  qty: number;
}

function findShopItemByName(ruleset: RulesetNivel1, name: string): LojaItem | null {
  for (const cat of Object.values(ruleset.loja)) {
    const found = cat.items.find((i) => i.n === name);
    if (found) return found;
  }
  return null;
}

function resolveEquipmentText(ruleset: RulesetNivel1, text: string): ItemResolvido {
  if (Object.prototype.hasOwnProperty.call(ruleset.aliasesDeEquipamento, text)) {
    const alias = ruleset.aliasesDeEquipamento[text];
    return alias ? { label: text, id: alias.id, qty: alias.qty } : { label: text, id: null, qty: 1 };
  }
  const exact = findShopItemByName(ruleset, text);
  if (exact) return { label: text, id: exact.id, qty: 1 };
  if (ruleset.conjuntosDeJogo.includes(text)) return { label: text, id: "kit-de-jogos", qty: 1 };
  return { label: text, id: null, qty: 1 };
}

function resolvedClassEquipmentList(classeEscolha: ClasseEscolha | null, list: string[] | undefined): string[] {
  if (!list) return [];
  return list.map((item) => {
    if (item === "Instrumento Musical à escolha") return classeEscolha?.instruments[0] || item;
    if (item === "Ferramenta/Instrumento escolhido") return classeEscolha?.toolChoice || item;
    return item;
  });
}

function resolvedEquipmentA(bgConst: AntecedenteConst, escolha: AntecedenteEscolha): string[] {
  if (!bgConst.ferramentaOpcoes) return bgConst.equipmentA;
  const escolhida = escolha.ferramentaEscolhida || bgConst.ferramentaCategoria!;
  return bgConst.equipmentA.map((item) => (item === "{ferramenta}" ? escolhida : item));
}

function characterStartingItems(ruleset: RulesetNivel1, dados: WizardData): ItemResolvido[] {
  const items: ItemResolvido[] = [];
  const clsConst = dados.classe ? ruleset.classes[dados.classe] : null;
  const clsEscolha = dados.classe ? (dados.classes[dados.classe] ?? null) : null;
  if (clsConst && clsEscolha) {
    const lista = clsEscolha.equipment === "A" ? clsConst.equipmentA : clsEscolha.equipment === "B" ? clsConst.equipmentB : undefined;
    resolvedClassEquipmentList(clsEscolha, lista).forEach((t) => items.push(resolveEquipmentText(ruleset, t)));
  }
  const bgConst = dados.antecedente ? ruleset.antecedentes[dados.antecedente] : null;
  const bgEscolha = dados.antecedente ? (dados.antecedentes[dados.antecedente] ?? null) : null;
  if (bgConst && bgEscolha?.equipment === "A") {
    resolvedEquipmentA(bgConst, bgEscolha).forEach((t) => items.push(resolveEquipmentText(ruleset, t)));
  }
  return items;
}

function ownedItemIdSet(ruleset: RulesetNivel1, dados: WizardData): Set<string> {
  const set = new Set<string>();
  characterStartingItems(ruleset, dados).forEach((it) => { if (it.id) set.add(it.id); });
  Object.entries(dados.shop.purchases).forEach(([id, q]) => { if (q > 0) set.add(id); });
  return set;
}

export interface ItemPossuido {
  label: string;
  id: string | null;
  qty: number;
}

function addOwnedItem(grouped: Record<string, ItemPossuido>, id: string | null, label: string, qty: number): void {
  const key = id || `flavor:${label}`;
  if (!grouped[key]) grouped[key] = { label, id, qty: 0 };
  grouped[key].qty += qty;
}

function mochilaItems(ruleset: RulesetNivel1, dados: WizardData): ItemPossuido[] {
  const grouped: Record<string, ItemPossuido> = {};
  characterStartingItems(ruleset, dados).forEach(({ label, id, qty }) => {
    addOwnedItem(grouped, id, id ? findShopItem(ruleset, id)!.n : label, qty);
  });
  return Object.values(grouped);
}

/** Lista de tudo que o personagem possui — herdado (classe/antecedente) +
 * comprado na Loja, com Kits abertos no conteúdo real (equivalente a
 * ownedEquipmentList()). */
export function ownedEquipmentList(ruleset: RulesetNivel1, dados: WizardData): ItemPossuido[] {
  const grouped: Record<string, ItemPossuido> = {};
  mochilaItems(ruleset, dados).forEach((it) => {
    const kit = it.id ? ruleset.conteudoDeKits[it.id] : undefined;
    if (kit) kit.forEach((c) => addOwnedItem(grouped, c.id, findShopItem(ruleset, c.id)!.n, c.qty * it.qty));
    else addOwnedItem(grouped, it.id, it.label, it.qty);
  });
  Object.entries(dados.shop.purchases).forEach(([id, qty]) => {
    if (qty <= 0) return;
    const item = findShopItem(ruleset, id);
    if (!item) return;
    const kit = ruleset.conteudoDeKits[id];
    if (kit) kit.forEach((c) => addOwnedItem(grouped, c.id, findShopItem(ruleset, c.id)!.n, c.qty * qty));
    else addOwnedItem(grouped, id, item.n, qty);
  });
  return Object.values(grouped);
}

// --- CA ----------------------------------------------------------------

interface ArmaduraPossuida {
  id: string;
  nome: string;
  ca: number;
  dexCap: number | null;
}

function ownedArmorList(ruleset: RulesetNivel1, dados: WizardData): ArmaduraPossuida[] {
  const out: ArmaduraPossuida[] = [];
  ownedItemIdSet(ruleset, dados).forEach((id) => {
    const armor = ruleset.armaduraCA[id];
    if (armor) out.push({ id, nome: findShopItem(ruleset, id)!.n, ca: armor.ca, dexCap: armor.dexCap });
  });
  return out;
}

/** Sem override manual (botão "Equipar" fica pra depois) — sempre a
 * armadura de maior CA FINAL para este personagem específico, mesma
 * fórmula do vanilla (resolveEquippedArmorId sem data.equippedArmorId). */
function melhorArmadura(armaduras: ArmaduraPossuida[], dexMod: number): ArmaduraPossuida | null {
  let melhor: ArmaduraPossuida | null = null;
  let melhorCA = -Infinity;
  armaduras.forEach((a) => {
    const dexBonus = a.dexCap === null ? dexMod : a.dexCap === 0 ? 0 : Math.min(dexMod, a.dexCap);
    const final = a.ca + dexBonus;
    if (final > melhorCA) { melhorCA = final; melhor = a; }
  });
  return melhor;
}

function computeAC(ruleset: RulesetNivel1, dados: WizardData, modPorAtributo: Record<string, number>): ResultadoCA {
  const armaduras = ownedArmorList(ruleset, dados);
  const armadura = melhorArmadura(armaduras, modPorAtributo["Destreza"] ?? 0);
  const temEscudo = ownedItemIdSet(ruleset, dados).has(ruleset.idDoEscudo);
  const classeEscolha = dados.classe ? (dados.classes[dados.classe] ?? null) : null;
  const estiloDeLuta = classeEscolha?.estilo ? (ruleset.efeitoDeEstiloDeLutaNaCA[classeEscolha.estilo] ?? null) : null;
  return calcularCA({
    armaduraEquipada: armadura ? { nome: armadura.nome, ca: armadura.ca, tetoBonusAtributo: armadura.dexCap } : null,
    atributoDeArmadura: "Destreza",
    temEscudo,
    bonusEscudo: ruleset.bonusDeEscudoNaCA,
    defesaSemArmadura: dados.classe ? (ruleset.defesaSemArmadura[dados.classe] ?? null) : null,
    modPorAtributo,
    bonusExtraComArmadura: estiloDeLuta,
  });
}

// --- Ataques -------------------------------------------------------------

function computeAttacks(ruleset: RulesetNivel1, dados: WizardData, modPorAtributo: Record<string, number>, prof: number): AtaqueCalculado[] {
  const clsConst = dados.classe ? ruleset.classes[dados.classe] : null;
  if (!clsConst) return [];
  const armasPossuidas: ArmaPossuida[] = [];
  ownedItemIdSet(ruleset, dados).forEach((id) => {
    const item = findShopItem(ruleset, id);
    if (!item) return;
    const wm = ruleset.maestriaDeArmas[item.n];
    if (!wm) return;
    armasPossuidas.push({ id, nome: item.n, dano: item.d, arma: { categoria: wm.categoria, tipo: wm.tipo, propriedades: wm.propriedades } });
  });
  const proficiencia: ProficienciaDeArma = {
    categoriasProficientes: clsConst.weaponProf,
    restringirAoTipo: clsConst.weaponProfMeleeOnly ? "Corpo a Corpo" : null,
    filtroDePropriedade: clsConst.weaponProfFiltroMarcial ? { categoria: "Marcial", propriedades: clsConst.weaponProfFiltroMarcial } : null,
  };
  return calcularAtaques(armasPossuidas, proficiencia, ruleset.regraDeAtributoDeArma, chaveDeCategoria, modPorAtributo, prof, fmt);
}

// --- Conjuração ------------------------------------------------------------

function detalheDaMagia(ruleset: RulesetNivel1, nome: string): DetalheDeMagia | null {
  return ruleset.detalheDaMagia[nome] ?? null;
}

function computeSpellcasting(ruleset: RulesetNivel1, dados: WizardData, modPorAtributo: Record<string, number>, prof: number): ConjuracaoCalculada<DetalheDeMagia> | null {
  if (!dados.classe) return null;
  const atributo = ruleset.atributoDeConjuracaoPorClasse[dados.classe] ?? null;
  if (!atributo) return null;
  const conjInfo = ruleset.conjuracaoPorClasse[dados.classe];
  const classeEscolha = dados.classes[dados.classe] as unknown as Record<string, string[]>;
  const truques: string[] = [];
  const magias: string[] = [...(conjInfo?.extrasFixos ?? [])];
  (conjInfo?.camposTruques ?? []).forEach((campo) => truques.push(...(classeEscolha[campo] ?? [])));
  (conjInfo?.camposMagias ?? []).forEach((campo) => magias.push(...(classeEscolha[campo] ?? [])));
  return calcularConjuracao(atributo, modPorAtributo, prof, truques, magias, (nome) => detalheDaMagia(ruleset, nome));
}

// --- Perícias/Talento fixo do antecedente/Ferramentas -----------------------

/** Perícias já proficientes, agregando classe + antecedente fixo +
 * Habilidoso + Humano(Hábil)/Elfo(Sentidos Aguçados) — equivalente a
 * skillsGrantedBySource() achatado num Set só. */
function periciasProficientes(ruleset: RulesetNivel1, dados: WizardData): Set<string> {
  const out = new Set<string>();
  const clsConst = dados.classe ? ruleset.classes[dados.classe] : null;
  const clsEscolha = dados.classe ? dados.classes[dados.classe] : null;
  (clsEscolha?.skills ?? []).forEach((s) => out.add(s));
  void clsConst;
  const bgConst = dados.antecedente ? ruleset.antecedentes[dados.antecedente] : null;
  const bgEscolha = dados.antecedente ? dados.antecedentes[dados.antecedente] : null;
  (bgConst?.skills ?? []).forEach((s) => out.add(s));
  (bgEscolha?.habilidoso ?? []).filter((x) => ruleset.todasAsPericias.includes(x)).forEach((s) => out.add(s));
  const especieEscolha = dados.especie ? dados.especies[dados.especie] : null;
  if (dados.especie === "Humano" && especieEscolha?.pericia) out.add(especieEscolha.pericia);
  if (dados.especie === "Elfo" && especieEscolha?.pericia) out.add(especieEscolha.pericia);
  return out;
}

function computeToolProficiencies(ruleset: RulesetNivel1, dados: WizardData): string[] {
  const tools: string[] = [];
  const clsConst = dados.classe ? ruleset.classes[dados.classe] : null;
  const clsEscolha = dados.classe ? dados.classes[dados.classe] : null;
  if (clsConst?.toolsFixed) tools.push(clsConst.toolsFixed);
  if (dados.classe === "Bardo") tools.push(...(clsEscolha?.instruments ?? []));
  if (dados.classe === "Monge" && clsEscolha?.toolChoice) tools.push(clsEscolha.toolChoice);
  const bgConst = dados.antecedente ? ruleset.antecedentes[dados.antecedente] : null;
  const bgEscolha = dados.antecedente ? dados.antecedentes[dados.antecedente] : null;
  if (bgConst?.ferramentaOpcoes) { if (bgEscolha?.ferramentaEscolhida) tools.push(bgEscolha.ferramentaEscolhida); }
  else if (bgConst?.tool) tools.push(bgConst.tool);
  (bgEscolha?.habilidoso ?? []).forEach((x) => { if (!ruleset.todasAsPericias.includes(x)) tools.push(x); });
  return [...new Set(tools)];
}

/** Nome "puro" do talento fixo do antecedente ativo (equivalente a
 * backgroundFeatBaseName()) — usado só pro talento Alerta (Iniciativa). */
function backgroundFeatBaseName(ruleset: RulesetNivel1, dados: WizardData): string {
  if (!dados.antecedente) return "";
  const feat = ruleset.antecedentes[dados.antecedente]?.feat ?? "";
  return feat.split(" — ")[0]!.split(" (")[0]!.trim();
}

function hasFeatByName(ruleset: RulesetNivel1, dados: WizardData, nome: string): boolean {
  if (backgroundFeatBaseName(ruleset, dados) === nome) return true;
  const especieEscolha = dados.especie ? dados.especies[dados.especie] : null;
  return dados.especie === "Humano" && especieEscolha?.talento === nome;
}

/** Truques/magias que a ESPÉCIE concede de graça (Tiferino/Elfo/Gnomo por
 * subespécie escolhida, Aasimar sempre) — equivalente a speciesFixedGrants(). */
function speciesGrantedSpellNames(ruleset: RulesetNivel1, dados: WizardData): string[] {
  const out: string[] = [];
  const especie = dados.especie ? ruleset.especies[dados.especie] : null;
  const escolha = dados.especie ? dados.especies[dados.especie] : null;
  if (!especie || !escolha) return out;
  const collect = (concede: { tipo: string; nome: string }[] | undefined) => (concede ?? []).forEach((c) => { if (c.tipo === "truque" || c.tipo === "magia") out.push(c.nome); });
  if (dados.especie === "Aasimar") especie.tracosFixos.forEach((t) => collect(t.concede));
  else if (especie.subespecie) {
    const linhagem = escolha.linhagem || escolha.legado;
    const opt = especie.subespecie.opcoes.find((o) => o.nome === linhagem);
    if (opt?.nivel1) collect(opt.nivel1.concede);
  }
  return out;
}

export interface FichaCalculada {
  identidade: { classe: string; nivel: 1; antecedente: string; especie: string; alinhamento: string | null; profBonus: number };
  attrs: AtributoCalculado[];
  savingThrows: SalvaguardaCalculada[];
  skills: PericiaCalculada[];
  passivePerception: number;
  hp: PontosDeVidaCalculados;
  ac: ResultadoCA;
  initiative: number;
  initiativeAlerta: boolean;
  deslocamento: string;
  visaoNoEscuro: string | null;
  attacks: AtaqueCalculado[];
  spellcasting: ConjuracaoCalculada<DetalheDeMagia> | null;
  especieMagias: { nome: string; detalhe: DetalheDeMagia | null }[];
  proficiencias: { idiomas: string[]; ferramentas: string[]; armas: string; armaduras: string };
  equipamento: { itens: ItemPossuido[]; poRestante: number };
}

/** Só é chamada com classe/antecedente/espécie/alinhamento/attrs todos
 * escolhidos (o wizard não deixa chegar no Resumo sem isso — mesma
 * garantia do vanilla, findFirstMissingGroup() bloqueando "Avançar"). */
export function calcularFichaCompleta(ruleset: RulesetNivel1, dados: WizardData): FichaCalculada {
  const classe = dados.classe!;
  const antecedente = dados.antecedente!;
  const especie = dados.especie!;
  const clsConst = ruleset.classes[classe]!;
  const especieConst = ruleset.especies[especie]!;
  const prof = ruleset.bonusProficienciaNivel1;

  const bonusPorAtributo: Record<string, number> = {};
  ruleset.atributosDoJogo.forEach((a) => { bonusPorAtributo[a] = bonusDoAntecedente(dados, a); });
  const attrs = calcularAtributos(ruleset.atributosDoJogo, dados.attrs, bonusPorAtributo);
  const modPorAtributo: Record<string, number> = {};
  attrs.forEach((a) => { modPorAtributo[a.atributo] = a.mod; });

  const savingThrows = calcularSalvaguardas(ruleset.atributosDoJogo, modPorAtributo, clsConst.savingThrows ?? [], prof);
  const clsEscolha = dados.classes[classe]!;
  const especialista = new Set(classe === "Ladino" ? clsEscolha.especialista : []);
  const skills = calcularPericias(ruleset.todasAsPericias, ruleset.atributoDaPericia, modPorAtributo, periciasProficientes(ruleset, dados), especialista, prof);
  const percepcao = skills.find((s) => s.pericia === "Percepção");
  const passivePerception = 10 + (percepcao?.bonus ?? 0);

  const hp = calcularPontosDeVidaNivel1(ruleset.dadoDeVidaPorClasse[classe]!, modPorAtributo["Constituição"] ?? 0);
  const ac = computeAC(ruleset, dados, modPorAtributo);
  const initiativeAlerta = hasFeatByName(ruleset, dados, "Alerta");
  const initiative = (modPorAtributo["Destreza"] ?? 0) + (initiativeAlerta ? prof : 0);
  const attacks = computeAttacks(ruleset, dados, modPorAtributo, prof);
  const spellcasting = computeSpellcasting(ruleset, dados, modPorAtributo, prof);
  const especieMagias = speciesGrantedSpellNames(ruleset, dados).map((nome) => ({ nome, detalhe: detalheDaMagia(ruleset, nome) }));

  const bgEscolha = dados.antecedentes[antecedente]!;
  const idiomas = ["Comum", ...dados.idiomas.comuns, ...(classe === "Ladino" ? ["Gíria dos Ladrões", ...dados.idiomas.extra] : [])];
  const tools = computeToolProficiencies(ruleset, dados);
  const weaponProfText = clsConst.weaponProf.map((w) => ruleset.rotuloDeProficienciaDeArma[w]).join(", ") || "Nenhuma";
  const armorProfText = clsConst.armorProf.length ? clsConst.armorProf.map((a) => ruleset.rotuloDeProficienciaDeArmadura[a]).join(", ") : "Nenhuma";
  void bgEscolha;

  const remaining = startingGold(ruleset, dados) - spentGold(ruleset, dados);

  return {
    identidade: { classe, nivel: 1, antecedente, especie, alinhamento: dados.alinhamento, profBonus: prof },
    attrs, savingThrows, skills, passivePerception,
    hp, ac, initiative, initiativeAlerta,
    deslocamento: especieConst.deslocamento, visaoNoEscuro: especieConst.visaoNoEscuro,
    attacks, spellcasting, especieMagias,
    proficiencias: { idiomas, ferramentas: tools, armas: weaponProfText, armaduras: armorProfText },
    equipamento: { itens: ownedEquipmentList(ruleset, dados), poRestante: remaining },
  };
}
