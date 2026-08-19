import type { RulesetNivel1, ClasseConst, LojaItem } from "../ruleset/RulesetContext";
import type { WizardData } from "./WizardContext";

/** Cálculos puros da Loja (equivalentes ao bloco startingGold()/spentGold()/
 * itemMatchesWeaponProf()/weaponAttackBonus()/maxAffordableQty() de
 * js/06-idiomas-attrs-shop.js e js/07-compute-and-summary.js) — extraídos
 * pra este arquivo (em vez de morar dentro de LojaStep.tsx) porque o
 * Resumo (Entrega 5e, próxima parte) também vai precisar de startingGold/
 * spentGold/attackBonus pro cálculo final da ficha, mesma fórmula. */

export function classeAtivaConst(ruleset: RulesetNivel1, dados: WizardData): ClasseConst | null {
  return dados.classe ? ruleset.classes[dados.classe] ?? null : null;
}

export function computeMaxPossibleGold(ruleset: RulesetNivel1): number {
  const classMax = Math.max(...Object.values(ruleset.classes).map((c) => Math.max(c.equipmentA_gold || 0, c.equipmentB_gold || 0, c.equipmentC_gold || 0)));
  const bgMax = Math.max(...Object.values(ruleset.antecedentes).map((b) => Math.max(b.equipmentA_gold || 0, b.equipmentB_gold || 0)));
  return classMax + bgMax;
}

export function startingGold(ruleset: RulesetNivel1, dados: WizardData): number {
  const clsConst = classeAtivaConst(ruleset, dados);
  const clsEscolha = dados.classe ? dados.classes[dados.classe] : null;
  const clsGold = !clsConst || !clsEscolha?.equipment ? 0
    : clsEscolha.equipment === "C" ? clsConst.equipmentC_gold ?? 0
    : clsEscolha.equipment === "B" ? clsConst.equipmentB_gold
    : clsConst.equipmentA_gold;
  const bgConst = dados.antecedente ? ruleset.antecedentes[dados.antecedente] : null;
  const bgEscolha = dados.antecedente ? dados.antecedentes[dados.antecedente] : null;
  const bgGold = !bgConst || !bgEscolha?.equipment ? 0 : bgEscolha.equipment === "B" ? bgConst.equipmentB_gold : bgConst.equipmentA_gold;
  return clsGold + bgGold;
}

/** Nome "puro" do talento fixo do antecedente ativo (equivalente a
 * backgroundFeatBaseName()) — "Habilidoso — proficiência..." vira só
 * "Habilidoso"; "Iniciado em Magia (Clérigo) — ..." vira "Iniciado em
 * Magia". Usado só pra achar o talento Artifista (desconto na Loja). */
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

/** Talento Artifista: 20% de desconto em item não mágico — a Loja só
 * vende item mundano, então vale pra tudo nela. */
export function shopDiscountFactor(ruleset: RulesetNivel1, dados: WizardData): number {
  return hasFeatByName(ruleset, dados, "Artifista") ? 0.8 : 1;
}

export function itemPrice(item: LojaItem, discount: number): number {
  return item.c * discount;
}

export function findShopItem(ruleset: RulesetNivel1, id: string): LojaItem | null {
  for (const cat of Object.values(ruleset.loja)) {
    const found = cat.items.find((i) => i.id === id);
    if (found) return found;
  }
  return null;
}

export function spentGold(ruleset: RulesetNivel1, dados: WizardData): number {
  const discount = shopDiscountFactor(ruleset, dados);
  let total = 0;
  for (const [id, qty] of Object.entries(dados.shop.purchases)) {
    const item = findShopItem(ruleset, id);
    if (item) total += itemPrice(item, discount) * qty;
  }
  return total;
}

/** Equivalente a itemMatchesWeaponProf() — cruza o nome do item de arma
 * com WEAPON_MASTERY (tipo/propriedades), não só a categoria Simples/
 * Marcial. Falha fechado (esconde) se o nome não bater com nada. */
export function itemMatchesWeaponProf(clsConst: ClasseConst, maestriaDeArmas: RulesetNivel1["maestriaDeArmas"], itemName: string): boolean {
  const wm = maestriaDeArmas[itemName];
  if (!wm) return false;
  if (clsConst.weaponProfMeleeOnly && wm.tipo !== "Corpo a Corpo") return false;
  if (wm.categoria === "Marcial" && clsConst.weaponProfFiltroMarcial) {
    return wm.propriedades.some((p) => clsConst.weaponProfFiltroMarcial!.includes(p));
  }
  return true;
}

export function isProficientWithWeapon(clsConst: ClasseConst, maestriaDeArmas: RulesetNivel1["maestriaDeArmas"], itemName: string): boolean {
  const wm = maestriaDeArmas[itemName];
  if (!wm) return false;
  const catKey = wm.categoria === "Simples" ? "simples" : "marcial";
  if (!clsConst.weaponProf.includes(catKey)) return false;
  return itemMatchesWeaponProf(clsConst, maestriaDeArmas, itemName);
}

export interface AtaqueComArma {
  tipo: string;
  abMod: number;
  bonus: number;
  proficient: boolean;
}

/** Equivalente a weaponAttackBonus() — Acuidade usa o melhor entre
 * Força/Destreza, senão Força se Corpo a Corpo ou Destreza se À
 * Distância. null se o nome não bater com nenhuma arma. */
export function weaponAttackBonus(clsConst: ClasseConst, maestriaDeArmas: RulesetNivel1["maestriaDeArmas"], strMod: number, dexMod: number, prof: number, itemName: string): AtaqueComArma | null {
  const wm = maestriaDeArmas[itemName];
  if (!wm) return null;
  const finesse = wm.propriedades.includes("Acuidade");
  const abMod = finesse ? Math.max(strMod, dexMod) : wm.tipo === "Corpo a Corpo" ? strMod : dexMod;
  const proficient = isProficientWithWeapon(clsConst, maestriaDeArmas, itemName);
  const bonus = abMod + (proficient ? prof : 0);
  return { tipo: wm.tipo, abMod, bonus, proficient };
}

export function maxAffordableQty(ruleset: RulesetNivel1, dados: WizardData, id: string): number {
  const item = findShopItem(ruleset, id);
  if (!item) return 0;
  const discount = shopDiscountFactor(ruleset, dados);
  const price = itemPrice(item, discount);
  if (price <= 0) return 999;
  let othersCost = 0;
  for (const [otherId, q] of Object.entries(dados.shop.purchases)) {
    if (otherId === id) continue;
    const it = findShopItem(ruleset, otherId);
    if (it) othersCost += itemPrice(it, discount) * q;
  }
  const budget = startingGold(ruleset, dados) - othersCost;
  if (budget <= 0) return 0;
  return Math.floor(budget / price + 1e-9);
}
