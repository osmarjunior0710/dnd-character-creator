// Motor de cálculo — atributos, salvaguardas, perícias, pontos de vida.
// Funções puras, sem nenhuma constante de D&D: nomes de atributo/perícia,
// quais salvaguardas são proficientes, qual perícia é "especialista"
// (proficiência dobrada) etc. são todos PARÂMETROS vindos de quem chama —
// nunca um literal tipo "Bárbaro" ou "Ladino" aqui dentro (VISAO.md §4,
// "regra de ouro"). Quem sabe que o Ladino tem Especialista é o adaptador
// do ruleset (data/rulesets/dnd2024/), não o motor.
//
// Convenção usada em TODO core/motor/ (aqui e em ca.ts/ataques.ts/
// conjuracao.ts): todo parâmetro chamado `modPorAtributo` já é o
// MODIFICADOR pronto (ex.: -1 pra um atributo 8), nunca o valor bruto do
// atributo (15, 8...) — só calcularAtributos() lida com valor bruto, e é
// quem produz o `mod` que todo o resto consome. Não misturar as duas
// convenções foi um bug real encontrado ao montar a comparação de todas as
// 2080 combinações (Entrega 4d).

export interface ItemDeBreakdown {
  label: string;
  value: number;
  plain?: boolean;
}

export function mod(valor: number): number {
  return Math.floor((valor - 10) / 2);
}

// --- Atributos ---------------------------------------------------------

export interface AtributoCalculado {
  atributo: string;
  valor: number;
  mod: number;
  breakdown: ItemDeBreakdown[];
}

/** `ordem`: lista de nomes de atributo (ex. os 6 de D&D, mas o motor não
 * assume que são 6 nem quais são os nomes). `base`/`bonus`: valor
 * escolhido pelo jogador e bônus adicional (ex. de antecedente), por
 * atributo — ambos vêm de fora. */
export function calcularAtributos(
  ordem: string[],
  base: Record<string, number>,
  bonus: Record<string, number> = {}
): AtributoCalculado[] {
  return ordem.map((atributo) => {
    const valorBase = base[atributo] ?? 0;
    const valorBonus = bonus[atributo] ?? 0;
    const breakdown: ItemDeBreakdown[] = [{ label: "Valor Base", value: valorBase, plain: true }];
    if (valorBonus) breakdown.push({ label: "Bônus do Antecedente", value: valorBonus });
    return {
      atributo,
      valor: valorBase + valorBonus,
      mod: mod(valorBase + valorBonus),
      breakdown,
    };
  });
}

// --- Salvaguardas --------------------------------------------------------

export interface SalvaguardaCalculada {
  atributo: string;
  proficiente: boolean;
  bonus: number;
  breakdown: ItemDeBreakdown[];
}

export function calcularSalvaguardas(
  ordem: string[],
  modPorAtributo: Record<string, number>,
  atributosProficientes: string[],
  bonusProficiencia: number
): SalvaguardaCalculada[] {
  const proficientes = new Set(atributosProficientes);
  return ordem.map((atributo) => {
    const abMod = modPorAtributo[atributo] ?? 0;
    const proficiente = proficientes.has(atributo);
    const bonusProf = proficiente ? bonusProficiencia : 0;
    return {
      atributo,
      proficiente,
      bonus: abMod + bonusProf,
      breakdown: [
        { label: `Mod. de ${atributo}`, value: abMod },
        proficiente
          ? { label: "Proficiência", value: bonusProf }
          : { label: "Sem proficiência", value: 0 },
      ],
    };
  });
}

// --- Perícias ------------------------------------------------------------

export interface PericiaCalculada {
  pericia: string;
  atributo: string;
  proficiente: boolean;
  especialista: boolean;
  bonus: number;
  breakdown: ItemDeBreakdown[];
}

/** `atributoDaPericia`: mapa perícia -> nome do atributo associado (dado
 * de ruleset). `proficientes`/`comEspecialista`: quais perícias o
 * personagem tem proficiência/proficiência dobrada — decidido por quem
 * chama (agregando classe+antecedente+espécie+talentos), nunca aqui. */
export function calcularPericias(
  todasAsPericias: string[],
  atributoDaPericia: Record<string, string>,
  modPorAtributo: Record<string, number>,
  proficientes: Set<string>,
  comEspecialista: Set<string>,
  bonusProficiencia: number
): PericiaCalculada[] {
  return todasAsPericias.map((pericia) => {
    const atributo = atributoDaPericia[pericia];
    if (atributo === undefined) {
      throw new Error(`calcularPericias: nenhum atributo associado à perícia "${pericia}".`);
    }
    const abMod = modPorAtributo[atributo] ?? 0;
    const proficiente = proficientes.has(pericia);
    const especialista = comEspecialista.has(pericia);
    const bonusProf = especialista ? bonusProficiencia * 2 : proficiente ? bonusProficiencia : 0;
    const breakdown: ItemDeBreakdown[] = [{ label: `Mod. de ${atributo}`, value: abMod }];
    if (especialista) breakdown.push({ label: "Proficiência (Especialista — dobrada)", value: bonusProf });
    else if (proficiente) breakdown.push({ label: "Proficiência", value: bonusProf });
    else breakdown.push({ label: "Sem proficiência", value: 0 });
    return { pericia, atributo, proficiente, especialista, bonus: abMod + bonusProf, breakdown };
  });
}

// --- Pontos de vida --------------------------------------------------------

export interface PontosDeVidaCalculados {
  valor: number;
  breakdown: ItemDeBreakdown[];
}

/** Nível 1 sempre usa o valor MÁXIMO do dado de vida (regra do PHB 2024) —
 * `dadoDeVida` (ex. 12 pro d12 do Bárbaro) vem de ruleset. Progressão de
 * nível 2+ (rolagem ou média) é Fase 3, fora do escopo desta função. */
export function calcularPontosDeVidaNivel1(
  dadoDeVida: number,
  modConstituicao: number
): PontosDeVidaCalculados {
  return {
    valor: dadoDeVida + modConstituicao,
    breakdown: [
      { label: `Dado de Vida (nível 1, valor máximo — d${dadoDeVida})`, value: dadoDeVida, plain: true },
      { label: "Mod. de Constituição", value: modConstituicao },
    ],
  };
}
