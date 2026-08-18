// Schema versionado da ficha de personagem — o contrato de longo prazo do
// projeto inteiro (VISAO.md §5.2). Não sabe nada de D&D: o conteúdo de
// `escolhido` e `calculado` é uma bolsa opaca (o formato real é definido
// pelo ruleset ativo — hoje o `data` de js/00-notes-and-state.js, com
// campos como `data.barbaro`/`data.especie`; o motor que vai popular
// `calculado` de verdade chega na Entrega 4). O que este arquivo garante é
// a ENVOLTÓRIA: versão, separação escolhido/calculado, separação
// personagem/estado-de-jogo, e a função de migração — nunca o conteúdo.

export const SCHEMA_VERSION_ATUAL = 1 as const;

/** Dados de personagem que não mudam entre sessões de jogo: classe, espécie,
 * atributos, equipamento inicial etc. — tudo que o wizard de criação
 * pergunta. Formato real definido pelo ruleset ativo, não por este arquivo. */
export interface DadosPersonagem {
  /** O que o jogador escolheu de verdade — a única parte persistida como
   * fonte de verdade. Se uma regra de cálculo mudar, uma ficha salva se
   * corrige sozinha na próxima carga, porque nada calculado foi salvo. */
  escolhido: Record<string, unknown>;
  /** Derivado de `escolhido` + dados do ruleset (CA, PV, perícias, ataques
   * etc.) — recalculado a cada carga, nunca persistido como fonte de
   * verdade. Fica `null` até o motor de cálculo existir (Entrega 4) — uma
   * ficha ainda é válida sem isso, só não tem os números derivados prontos. */
  calculado: Record<string, unknown> | null;
}

/** Estado que muda durante uma campanha: HP atual, condições ativas,
 * recursos de classe gastos, dinheiro. A Fase 1 não usa isso ainda (é Fase
 * 2 — ficha editável) — reservar o campo agora evita uma migração de
 * schema só pra criá-lo depois. */
export type EstadoDeJogo = Record<string, unknown>;

export interface FichaV1 {
  schemaVersion: 1;
  /** Qual ruleset gerou esta ficha (ex. "dnd2024") — permite uma mesma
   * instalação guardar fichas de sistemas diferentes lado a lado sem
   * ambiguidade sobre qual pasta de dados usar pra reabrir cada uma. */
  ruleset: string;
  personagem: DadosPersonagem;
  estadoDeJogo: EstadoDeJogo;
}

/** União de todas as versões de schema já existentes. Hoje só existe a v1 —
 * o tipo já está pronto pra crescer (`FichaV1 | FichaV2 | ...`) sem precisar
 * reescrever `migrarFicha` inteira quando a v2 chegar. */
export type FichaQualquerVersao = FichaV1;

/** Cria uma ficha nova, já na versão atual do schema. `calculado` começa
 * `null` porque o motor de cálculo (core/, Entrega 4) ainda não existe. */
export function novaFicha(ruleset: string, escolhido: Record<string, unknown>): FichaV1 {
  return {
    schemaVersion: SCHEMA_VERSION_ATUAL,
    ruleset,
    personagem: { escolhido, calculado: null },
    estadoDeJogo: {},
  };
}

/** Eleva qualquer ficha salva (de qualquer versão anterior) até a versão
 * atual do schema. Hoje é uma função "de passagem" — só existe uma versão —
 * mas o formato (validar versão, aplicar o próximo degrau, repetir) já é o
 * definitivo: a v2 adiciona um `case 1: ficha = migrarV1ParaV2(ficha); break;`
 * antes do `case 2`, sem precisar tocar no resto. Ficha salva nunca quebra
 * por causa de uma versão de schema mais nova do app (VISAO.md §3, item 4). */
export function migrarFicha(ficha: { schemaVersion: number }): FichaV1 {
  switch (ficha.schemaVersion) {
    case 1:
      return ficha as FichaV1;
    default:
      throw new Error(
        `Ficha com schemaVersion desconhecida: ${ficha.schemaVersion}. ` +
          `Versão atual do app: ${SCHEMA_VERSION_ATUAL}.`
      );
  }
}
