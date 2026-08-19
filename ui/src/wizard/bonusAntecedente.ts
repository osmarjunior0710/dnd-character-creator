import type { WizardData } from "./WizardContext";

/** Bônus de atributo do antecedente (equivalente a getBonusFor() em
 * js/05-class-steps.js) — lido do abilityPlan do antecedente ATIVO.
 * Extraído da Entrega 5d (só usado no passo de Atributos) pra cá na
 * Entrega 5e, porque a Loja também precisa dele pro preview de Mod. de
 * Ataque (mesma fórmula do vanilla: o ataque usa o atributo FINAL, já
 * com o bônus do antecedente somado). */
export function bonusDoAntecedente(dados: WizardData, ability: string): number {
  const plano = dados.antecedente ? dados.antecedentes[dados.antecedente]?.abilityPlan : null;
  if (!plano) return 0;
  if (plano.tipo === "1-1-1") return plano.mais1Tres.includes(ability) ? 1 : 0;
  if (plano.mais2 === ability) return 2;
  if (plano.mais1 === ability) return 1;
  return 0;
}
