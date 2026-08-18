import type { AntecedenteConst } from "../ruleset/RulesetContext";
import type { AntecedenteEscolha } from "./WizardContext";

/** Equivalente ao trecho `case 3` de findFirstMissingGroup() (js/01-wizard-nav.js)
 * pro antecedente — mesma regra, só devolvendo bool em vez do id do grupo
 * faltante (o destaque de campo faltando via scrollToMissing() é um
 * detalhe de UI que ainda não foi portado, não uma perda de regra). */
export function antecedenteDetalheCompleto(bg: AntecedenteConst, escolha: AntecedenteEscolha): boolean {
  const plano = escolha.abilityPlan;
  const planoOk = plano ? (plano.tipo === "2-1" ? !!plano.mais2 && !!plano.mais1 : plano.mais1Tres.length === 3) : false;
  if (!planoOk) return false;
  if (bg.ferramentaOpcoes && !escolha.ferramentaEscolhida) return false;
  if (bg.iniciadoEmMagia) {
    if (escolha.iniciadoCantrips.length !== 2) return false;
    if (escolha.iniciadoSpell1.length !== 1) return false;
  }
  if (bg.feat.startsWith("Habilidoso") && escolha.habilidoso.length !== 3) return false;
  if (!escolha.equipment) return false;
  return true;
}
