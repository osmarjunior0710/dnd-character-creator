// Motor de cálculo — Classe de Armadura (CA). Igual a atributos.ts: função
// pura e genérica, zero literal de D&D. Nomes de classe ("Bárbaro"),
// nomes de estilo ("Defensivo") e a regra "perde a Defesa sem Armadura ao
// usar Escudo" nunca aparecem aqui — tudo isso é dado que o adaptador do
// ruleset (data/rulesets/dnd2024/mecanicas-nivel1/) já resolveu antes de
// chamar esta função. O único conceito "de sistema" que sobrevive aqui é
// "existe um atributo cujo modificador, até um teto, soma na CA de
// armadura" — comum a D&D e a praticamente qualquer d20 (o NOME desse
// atributo é sempre passado por parâmetro, nunca hardcoded).

import type { ItemDeBreakdown } from "./atributos.ts";

export interface ArmaduraEquipada {
  nome: string;
  ca: number;
  /** Teto do bônus do atributo somado à CA desta armadura: `null` = sem
   * teto (armadura leve), `0` = não soma nada (armadura pesada), `N` =
   * capado em N (armadura média). */
  tetoBonusAtributo: number | null;
}

export interface DefesaSemArmadura {
  nome: string;
  /** Soma o modificador de CADA atributo nesta lista (ex.: Bárbaro soma
   * Destreza + Constituição; a maioria dos sistemas só soma um). */
  atributos: string[];
  /** Se true, este traço deixa de valer quando o personagem tem Escudo
   * equipado (regra do Monge) — se false, o traço soma normalmente mesmo
   * com Escudo (regra do Bárbaro). */
  perdeComEscudo: boolean;
}

export interface BonusCondicionalDeCA {
  /** Rótulo usado na linha de breakdown (detalhado). */
  label: string;
  /** Rótulo usado no texto curto da fonte final (`fonte`) — pode ser mais
   * curto que `label` (ex.: fonte diz "+ Escudo", o breakdown diz "Escudo
   * (comprado na Loja)"). Usa `label` se omitido. */
  labelFonte?: string;
  valor: number;
}

export interface ResultadoCA {
  valor: number;
  fonte: string;
  breakdown: ItemDeBreakdown[];
}

export function calcularCA(opcoes: {
  armaduraEquipada: ArmaduraEquipada | null;
  /** Nome do atributo que soma (até o teto da armadura, ou sem teto se
   * desarmado) — em D&D 2024 é sempre "Destreza", mas a função não sabe
   * disso: é só o valor que o adaptador passou. */
  atributoDeArmadura: string;
  temEscudo: boolean;
  bonusEscudo: BonusCondicionalDeCA | null;
  /** Traço de Defesa sem Armadura da classe ativa, se ela tiver um —
   * `null` pra qualquer classe sem esse traço no nível 1. */
  defesaSemArmadura: DefesaSemArmadura | null;
  modPorAtributo: Record<string, number>;
  /** Bônus condicional que só se aplica enquanto USANDO armadura de
   * verdade (ex.: Estilo de Luta Defensivo do Guerreiro) — `null` se o
   * personagem não tem nada assim escolhido. */
  bonusExtraComArmadura: BonusCondicionalDeCA | null;
}): ResultadoCA {
  const { armaduraEquipada, atributoDeArmadura, temEscudo, bonusEscudo, defesaSemArmadura, modPorAtributo, bonusExtraComArmadura } = opcoes;
  const breakdown: ItemDeBreakdown[] = [];
  let base: number;
  let fonte: string;

  if (armaduraEquipada) {
    const modAtributo = modPorAtributo[atributoDeArmadura] ?? 0;
    const teto = armaduraEquipada.tetoBonusAtributo;
    const bonusAtributo = teto === null ? modAtributo : teto === 0 ? 0 : Math.min(modAtributo, teto);
    base = armaduraEquipada.ca + bonusAtributo;
    fonte = armaduraEquipada.nome;
    breakdown.push({ label: fonte, value: armaduraEquipada.ca, plain: true });
    breakdown.push({
      label:
        teto === 0
          ? `Mod. de ${atributoDeArmadura} (armadura pesada, não soma)`
          : teto !== null
            ? `Mod. de ${atributoDeArmadura} (máx. +${teto})`
            : `Mod. de ${atributoDeArmadura}`,
      value: bonusAtributo,
    });
    if (bonusExtraComArmadura) {
      base += bonusExtraComArmadura.valor;
      fonte += ` + ${bonusExtraComArmadura.labelFonte ?? bonusExtraComArmadura.label}`;
      breakdown.push({ label: bonusExtraComArmadura.label, value: bonusExtraComArmadura.valor });
    }
  } else if (defesaSemArmadura && !(defesaSemArmadura.perdeComEscudo && temEscudo)) {
    base = 10 + defesaSemArmadura.atributos.reduce((soma, atr) => soma + (modPorAtributo[atr] ?? 0), 0);
    fonte = defesaSemArmadura.nome;
    breakdown.push({ label: "Base sem armadura", value: 10, plain: true });
    defesaSemArmadura.atributos.forEach((atr) => breakdown.push({ label: `Mod. de ${atr}`, value: modPorAtributo[atr] ?? 0 }));
  } else {
    const modAtributo = modPorAtributo[atributoDeArmadura] ?? 0;
    base = 10 + modAtributo;
    fonte = "Sem armadura";
    breakdown.push({ label: "Base sem armadura", value: 10, plain: true });
    breakdown.push({ label: `Mod. de ${atributoDeArmadura}`, value: modAtributo });
  }

  if (temEscudo && bonusEscudo) {
    base += bonusEscudo.valor;
    fonte += ` + ${bonusEscudo.labelFonte ?? bonusEscudo.label}`;
    breakdown.push({ label: bonusEscudo.label, value: bonusEscudo.valor });
  }

  return { valor: base, fonte, breakdown };
}
