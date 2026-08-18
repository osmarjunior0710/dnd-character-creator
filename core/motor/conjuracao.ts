// Motor de cálculo — conjuração (CD, ataque mágico, truques e magias
// conhecidas). Zero literal de D&D: quais campos de escolha contam como
// truque/magia por classe (o `switch(data.classe)` do vanilla) é resolvido
// pelo adaptador do ruleset antes de chegar aqui — esta função só recebe
// duas listas de nomes já prontas.

export interface EntradaDeMagia<TDetalhe> {
  nome: string;
  detalhe: TDetalhe | null;
}

export interface ConjuracaoCalculada<TDetalhe> {
  atributo: string;
  cd: number;
  cdBreakdown: { label: string; value: number; plain?: boolean }[];
  ataque: number;
  ataqueBreakdown: { label: string; value: number; plain?: boolean }[];
  truques: EntradaDeMagia<TDetalhe>[];
  magias: EntradaDeMagia<TDetalhe>[];
}

/** `atributoDeConjuracao === null` → classe não conjura, devolve `null`
 * (mesmo comportamento do vanilla: Bárbaro/Guerreiro/Ladino/Monge). */
export function calcularConjuracao<TDetalhe>(
  atributoDeConjuracao: string | null,
  modPorAtributo: Record<string, number>,
  bonusProficiencia: number,
  nomesDeTruques: string[],
  nomesDeMagias: string[],
  detalheDaMagia: (nome: string) => TDetalhe | null
): ConjuracaoCalculada<TDetalhe> | null {
  if (atributoDeConjuracao === null) return null;
  const abMod = modPorAtributo[atributoDeConjuracao] ?? 0;

  const cdBreakdown = [
    { label: "Base", value: 8, plain: true },
    { label: "Bônus de Proficiência", value: bonusProficiencia },
    { label: `Mod. de ${atributoDeConjuracao}`, value: abMod },
  ];
  const ataqueBreakdown = [
    { label: "Bônus de Proficiência", value: bonusProficiencia },
    { label: `Mod. de ${atributoDeConjuracao}`, value: abMod },
  ];

  const paraEntrada = (nome: string): EntradaDeMagia<TDetalhe> => ({ nome, detalhe: detalheDaMagia(nome) });

  return {
    atributo: atributoDeConjuracao,
    cd: 8 + bonusProficiencia + abMod,
    cdBreakdown,
    ataque: bonusProficiencia + abMod,
    ataqueBreakdown,
    truques: [...new Set(nomesDeTruques)].map(paraEntrada),
    magias: [...new Set(nomesDeMagias)].map(paraEntrada),
  };
}
