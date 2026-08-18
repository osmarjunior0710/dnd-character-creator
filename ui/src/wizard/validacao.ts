import type { AntecedenteConst, EspecieConst, ClasseConst } from "../ruleset/RulesetContext";
import type { AntecedenteEscolha, EspecieEscolha, ClasseEscolha } from "./WizardContext";

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

/** Equivalente ao `case 5` de findFirstMissingGroup() pra espécie —
 * Pequenino/Anão/Orc nunca têm nada faltando (sem escolha nenhuma). */
export function especieDetalheCompleto(nome: string, especie: EspecieConst, escolha: EspecieEscolha): boolean {
  switch (nome) {
    case "Pequenino":
    case "Anão":
    case "Orc":
      return true;
    case "Humano":
      return !!escolha.tamanho && !!escolha.pericia && !!escolha.talento;
    case "Draconato":
      return !!escolha.heranca;
    case "Elfo":
      return !!escolha.pericia && !!escolha.linhagem;
    case "Gnomo":
      return !!escolha.linhagem && !!escolha.atributoLinhagem;
    case "Golias":
      return !!escolha.ancestralidade;
    case "Aasimar":
      return !!escolha.tamanho;
    case "Tiferino":
      return !!escolha.tamanho && !!escolha.legado && !!escolha.atributoLegado;
    default:
      return especie.tamanho.opcoes.length <= 1; // fallback conservador, nunca deveria bater
  }
}

/* Taumaturgo (Clérigo) e Xamã (Druida) concedem +1 truque disponível pra
 * escolher — mesmo cálculo de clerigoEffectiveCantripsCount()/
 * druidaEffectiveCantripsCount() em js/05-class-steps.js. Os nomes das
 * Ordens que concedem o bônus são fato de regra (não vêm estruturados em
 * ordemDivina/ordemPrimal, só em texto solto), por isso hardcoded aqui —
 * mesmo nível de "nome específico na camada de UI" já usado em
 * especieDetalheCompleto() acima, nunca em core/. */
export function clerigoCantripsEfetivo(classe: ClasseConst, escolha: ClasseEscolha): number {
  return (classe.cantripsCount ?? 2) + (escolha.ordem === "Taumaturgo" ? 1 : 0);
}
export function druidaCantripsEfetivo(classe: ClasseConst, escolha: ClasseEscolha): number {
  return (classe.cantripsCount ?? 2) + (escolha.ordem === "Xamã" ? 1 : 0);
}

/** Equivalente ao `case 1` de findFirstMissingGroup() pra classe — o bloco
 * mais ramificado do vanilla (13 branches, um por classe). */
export function classeDetalheCompleto(nome: string, classe: ClasseConst, escolha: ClasseEscolha): boolean {
  const e = escolha;
  switch (nome) {
    case "Bárbaro":
      return e.skills.length === 2 && e.maestria.length === (classe.maestriaCount ?? 0) && !!e.equipment;
    case "Bardo":
      return (
        e.skills.length === (classe.skillsCount ?? 2) &&
        e.instruments.length === (classe.toolsCount ?? 0) &&
        e.cantrips.length === 2 &&
        e.spells1.length === 4 &&
        !!e.equipment
      );
    case "Mago":
      return (
        e.skills.length === 2 &&
        e.cantrips.length === (classe.cantripsCount ?? 2) &&
        e.spellbook.length === (classe.spellbookCount ?? 0) &&
        e.prepared.length === (classe.preparedCount ?? 0) &&
        !!e.equipment
      );
    case "Paladino":
      return (
        e.skills.length === 2 &&
        e.prepared.length === (classe.preparedCount ?? 0) &&
        e.maestria.length === (classe.maestriaCount ?? 0) &&
        !!e.equipment
      );
    case "Psiônico":
      return (
        e.skills.length === 2 &&
        e.cantrips.length === (classe.cantripsCount ?? 2) &&
        e.spells1.length === (classe.preparedCount ?? 0) &&
        !!e.equipment
      );
    case "Clérigo":
      return (
        e.skills.length === 2 &&
        !!e.ordem &&
        e.cantrips.length === clerigoCantripsEfetivo(classe, e) &&
        e.spells1.length === (classe.preparedCount ?? 0) &&
        !!e.equipment
      );
    case "Guerreiro":
      return (
        e.skills.length === 2 &&
        !!e.estilo &&
        e.maestria.length === (classe.maestriaCount ?? 0) &&
        !!e.equipment
      );
    case "Ladino":
      return (
        e.skills.length === (classe.skillsCount ?? 0) &&
        e.especialista.length === (classe.especialistaCount ?? 0) &&
        e.maestria.length === (classe.maestriaCount ?? 0) &&
        !!e.equipment
      );
    case "Druida":
      return (
        e.skills.length === 2 &&
        !!e.ordem &&
        e.cantrips.length === druidaCantripsEfetivo(classe, e) &&
        e.spells1.length === (classe.preparedCount ?? 0) &&
        !!e.equipment
      );
    case "Feiticeiro":
      return (
        e.skills.length === 2 &&
        e.cantrips.length === (classe.cantripsCount ?? 2) &&
        e.spells1.length === (classe.preparedCount ?? 0) &&
        !!e.equipment
      );
    case "Monge":
      return e.skills.length === 2 && !!e.toolCategory && !!e.toolChoice && !!e.equipment;
    case "Guardião":
      return (
        e.skills.length === (classe.skillsCount ?? 0) &&
        e.spells1.length === (classe.preparedCount ?? 0) &&
        e.maestria.length === (classe.maestriaCount ?? 0) &&
        !!e.equipment
      );
    case "Bruxo":
    default:
      if (e.skills.length !== 2) return false;
      if (!e.pactBoon) return false;
      if (e.cantrips.length !== 2) return false;
      if (e.pactBoon === "Pacto do Tomo" && e.tomoCantrips.length !== 3) return false;
      if (e.spells1.length !== 2) return false;
      if (e.pactBoon === "Pacto do Tomo" && e.tomoRituals.length !== 2) return false;
      if (!e.equipment) return false;
      return true;
  }
}
