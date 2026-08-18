// Motor de cálculo — proficiência e bônus de ataque com arma. Mesma regra
// de sempre: zero literal de D&D. "Acuidade", "Corpo a Corpo", "Simples"
// nunca aparecem como string comparada aqui dentro — são nomes que o
// adaptador do ruleset passa como parâmetro (propriedade/tipo/categoria),
// o motor só compara o que recebeu com o que recebeu.

export interface ArmaMestre {
  categoria: string;
  tipo: string;
  propriedades: string[];
}

export interface ProficienciaDeArma {
  /** Chaves de categoria que o personagem é proficiente (já convertidas
   * pelo adaptador — ex.: ["simples","marcial"]). */
  categoriasProficientes: string[];
  /** Restringe a proficiência a um único tipo de arma (ex.: só Corpo a
   * Corpo, regra do Monge) — `null` = sem restrição de tipo. */
  restringirAoTipo: string | null;
  /** Restringe armas de uma categoria específica a quem tiver ALGUMA das
   * propriedades listadas (ex.: Ladino só Marcial+Acuidade/Leve) —
   * `{categoria, propriedades}` ou `null` = sem essa restrição fina. */
  filtroDePropriedade: { categoria: string; propriedades: string[] } | null;
}

/** Converte a `categoria` de uma arma na chave usada em
 * `categoriasProficientes` (ex.: "Simples" -> "simples") — passada pelo
 * adaptador porque o motor não sabe quais categorias existem no ruleset. */
export type ChaveDeCategoria = (categoria: string) => string;

export function armaEhProficiente(
  prof: ProficienciaDeArma,
  arma: ArmaMestre,
  chaveDaCategoria: ChaveDeCategoria
): boolean {
  if (!prof.categoriasProficientes.includes(chaveDaCategoria(arma.categoria))) return false;
  if (prof.restringirAoTipo !== null && arma.tipo !== prof.restringirAoTipo) return false;
  if (prof.filtroDePropriedade && arma.categoria === prof.filtroDePropriedade.categoria) {
    return arma.propriedades.some((p) => prof.filtroDePropriedade!.propriedades.includes(p));
  }
  return true;
}

export interface RegraDeAtributoDeArma {
  /** Atributo padrão por tipo de arma (ex.: {"Corpo a Corpo":"Força","À Distância":"Destreza"}). */
  atributoPorTipo: Record<string, string>;
  /** Se a arma tiver esta propriedade, usa o MELHOR entre os atributos
   * listados em vez do padrão por tipo (ex.: Acuidade -> melhor de
   * Força/Destreza) — `null` = ruleset sem essa regra. */
  propriedadeMelhorAtributo: { propriedade: string; atributos: string[] } | null;
}

export function atributoDeAtaque(
  arma: ArmaMestre,
  regra: RegraDeAtributoDeArma,
  modPorAtributo: Record<string, number>
): number {
  if (regra.propriedadeMelhorAtributo && arma.propriedades.includes(regra.propriedadeMelhorAtributo.propriedade)) {
    return Math.max(...regra.propriedadeMelhorAtributo.atributos.map((a) => modPorAtributo[a] ?? 0));
  }
  const atributo = regra.atributoPorTipo[arma.tipo];
  return atributo !== undefined ? (modPorAtributo[atributo] ?? 0) : 0;
}

export interface ArmaPossuida {
  id: string;
  nome: string;
  dano: string;
  arma: ArmaMestre;
}

export interface AtaqueCalculado {
  nome: string;
  tipo: string;
  bonus: number;
  dano: string;
  proficiente: boolean;
}

export function calcularAtaques(
  armasPossuidas: ArmaPossuida[],
  prof: ProficienciaDeArma,
  regraAtributo: RegraDeAtributoDeArma,
  chaveDaCategoria: ChaveDeCategoria,
  modPorAtributo: Record<string, number>,
  bonusProficiencia: number,
  formatarModificador: (n: number) => string
): AtaqueCalculado[] {
  const ataques = armasPossuidas.map((item): AtaqueCalculado => {
    const abMod = atributoDeAtaque(item.arma, regraAtributo, modPorAtributo);
    const proficiente = armaEhProficiente(prof, item.arma, chaveDaCategoria);
    const bonus = abMod + (proficiente ? bonusProficiencia : 0);
    return {
      nome: item.nome,
      tipo: item.arma.tipo,
      bonus,
      dano: `${item.dano}${abMod !== 0 ? " " + formatarModificador(abMod) : ""}`,
      proficiente,
    };
  });
  return ataques.sort((a, b) => b.bonus - a.bonus);
}
