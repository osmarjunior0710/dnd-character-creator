import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Dados de mecânica de nível 1 (Entrega 4a) — o mesmo que core/motor/
// consome, agora carregado no navegador pra alimentar as telas.

/** Formato de UM antecedente em BACKGROUND_CONST (data/rulesets/dnd2024/
 * mecanicas-nivel1/background-const.json) — os campos que o passo de
 * Antecedente (Entrega 5b) realmente lê. Descrever este formato aqui não é
 * regra de D&D vazando pra UI: é só o "shape" de índice de um arquivo de
 * dados, sem nenhum NOME de antecedente hardcoded (isso seria a violação). */
export interface AntecedenteConst {
  nome: string;
  suggestedAbilities: string[];
  feat: string;
  skills: string[];
  tool?: string;
  ferramentaCategoria?: string;
  ferramentaOpcoes?: string[];
  iniciadoEmMagia?: { classe: string; cantrips: string[]; spells1: string[] };
  equipmentA: string[];
  equipmentA_gold: number;
  equipmentB_gold: number;
}

export interface TracoFixo {
  nome: string;
  resumo: string;
  concede: { tipo: string; nome: string }[];
}

export interface OpcaoDeSubespecie {
  nome: string;
  tipoDano?: string; // Draconato
  nivel1?: { resumo: string; concede: { tipo: string; nome: string }[] } | null;
  nivel3?: { resumo: string; concede: { tipo: string; nome: string }[] } | null;
  nivel5?: { resumo: string; concede: { tipo: string; nome: string }[] } | null;
}

/** Formato de UMA espécie em SPECIES_CONST — os campos que o passo de
 * Espécie (Entrega 5c) lê. Mesma observação do AntecedenteConst acima:
 * shape de índice, nenhum nome de espécie hardcoded aqui. */
export interface EspecieConst {
  nome: string;
  flavor: string;
  tipo: string;
  deslocamento: string;
  visaoNoEscuro: string | null;
  tamanho: { opcoes: string[]; alturas: Record<string, string> };
  tracosFixos: TracoFixo[];
  subespecie: { nome: string; opcoes: OpcaoDeSubespecie[] } | null;
  sentidosAgucados?: { nome: string; opcoes: string[] };
  revelacaoCelestial?: { nome: string; nivelConcedido: number; aviso: string; opcoes: { nome: string; resumo: string; concede: { tipo: string; nome: string }[] }[] };
}

/** Formato de UMA classe em CLASS_CONST — os campos que o passo de Classe
 * (Entrega 5c) lê. Já vem normalizado com contagens (skillsCount,
 * cantripsCount, maestriaCount, etc.) como DADO, não como constante de
 * código — é por isso que dá pra ter um único tipo cobrindo as 13 classes
 * em vez de precisar de nome de classe espalhado por aqui. Nem toda classe
 * usa todo campo (ver comentário de ClasseEscolha em WizardContext.tsx). */
export interface ClasseConst {
  skills?: string[];
  skillsAll?: boolean; // Bardo: qualquer perícia, sem lista restrita
  skillsCount?: number; // default 2 quando ausente
  cantrips?: string[];
  cantripsCount?: number; // default 2 quando ausente
  spells1?: string[];
  preparedCount?: number;
  spellbookCount?: number; // Mago
  toolsCount?: number; // Bardo (instrumentos)
  toolsFixed?: string; // Ladino, Druida — ferramenta automática (sem escolha)
  maestriaCount?: number;
  maestriaTipoPermitido?: string; // Bárbaro: só "Corpo a Corpo"
  maestriaSemRestricaoDeTipo?: boolean; // Paladino/Guerreiro/Guardião: qualquer arma proficiente
  especialistaCount?: number; // Ladino
  toolCategories?: string[]; // Monge
  toolsNote?: string;
  pactBoons?: Record<string, string>; // Bruxo
  ordemDivina?: Record<string, string>; // Clérigo
  ordemPrimal?: Record<string, string>; // Druida
  estiloDeLuta?: Record<string, string>; // Guerreiro
  equipmentA: string[];
  equipmentA_gold: number;
  equipmentB?: string[]; // Guerreiro tem opção B com itens (não só ouro)
  equipmentB_gold: number;
  equipmentC_gold?: number; // Guerreiro
  // Blocos de texto só informativos (sem escolha) — exibidos se presentes.
  furia?: string; defesaSemArmadura?: string; inspiracao?: string; adeptoRitual?: string;
  recuperacaoArcana?: string; maosConsagradas?: string; poderPsionico?: string; telecineseSutil?: string;
  ataqueFurtivo?: string; giriaDoLadrao?: string; recuperarFolego?: string; idiomaDruidico?: string;
  feiticariaInata?: string; artesMarciais?: string; inimigoFavorito?: string;
}

export interface ArmaMaestria {
  categoria: string;
  tipo: string;
  mastery: string;
  propriedades: string[];
}

export interface RulesetNivel1 {
  classes: Record<string, ClasseConst>;
  especies: Record<string, EspecieConst>;
  antecedentes: Record<string, AntecedenteConst>;
  todasAsFerramentas: string[];
  todasAsPericias: string[];
  atributoDaPericia: Record<string, string>;
  atributosDoJogo: string[];
  talentosOrigem: string[];
  talentosSelvagens: string[];
  maestriaDeArmas: Record<string, ArmaMaestria>;
  propriedadesDeMaestria: Record<string, string>;
  todosOsInstrumentos: string[];
  todasAsFerramentasDeArtesao: string[];
  todosOsTruques: string[]; // derivado de spell-details.json — Bruxo/Pacto do Tomo
  todasAsMagiasRituais1: string[]; // idem, 1º círculo + ritual
  idiomasComuns: string[];
  idiomasRaros: string[];
  alinhamentos: string[];
  infoDeAlinhamento: Record<string, { descricao: string }>;
  arrayPadrao: number[];
}

interface EstadoRuleset {
  carregando: boolean;
  dados: RulesetNivel1 | null;
  erro: string | null;
}

const RulesetContext = createContext<EstadoRuleset>({ carregando: true, dados: null, erro: null });

/** Pré-carrega a mecânica de nível 1 — é o trabalho da tela de Splash
 * (handoff do usuário: "usada para pré-carregar os dados do ruleset antes
 * do usuário precisar"). Cresce a lista aqui conforme o wizard for
 * precisando de mais arquivos, sem mudar a forma do Provider. */
async function carregarRulesetNivel1(): Promise<RulesetNivel1> {
  const [
    classes, especies, antecedentes, todasAsFerramentas, todasAsPericias, atributoDaPericia, atributosDoJogo, featDetails,
    maestriaDeArmas, propriedadesDeMaestria, todosOsInstrumentos, todasAsFerramentasDeArtesao, spellDetails,
    idiomasComuns, idiomasRaros, alinhamentos, infoDeAlinhamento, arrayPadrao,
  ] = await Promise.all([
    import("@dados/mecanicas-nivel1/class-const.json"),
    import("@dados/mecanicas-nivel1/species-const.json"),
    import("@dados/mecanicas-nivel1/background-const.json"),
    import("@dados/mecanicas-nivel1/all-tools.json"),
    import("@dados/mecanicas-nivel1/all-skills.json"),
    import("@dados/mecanicas-nivel1/skill-ability.json"),
    import("@dados/mecanicas-nivel1/abilities.json"),
    import("@dados/mecanicas-nivel1/feat-details.json"),
    import("@dados/mecanicas-nivel1/weapon-mastery.json"),
    import("@dados/mecanicas-nivel1/mastery-properties.json"),
    import("@dados/mecanicas-nivel1/all-instruments.json"),
    import("@dados/mecanicas-nivel1/all-artisan-tools.json"),
    import("@dados/mecanicas-nivel1/spell-details.json"),
    import("@dados/mecanicas-nivel1/common-languages.json"),
    import("@dados/mecanicas-nivel1/rare-languages.json"),
    import("@dados/mecanicas-nivel1/alignments.json"),
    import("@dados/mecanicas-nivel1/alignment-info.json"),
    import("@dados/mecanicas-nivel1/standard-array.json"),
  ]);
  const feats = featDetails.default as Record<string, { categoria: string }>;
  // ALL_CANTRIPS/ALL_1ST_RITUAL do vanilla (só usados pelo Pacto do Tomo do
  // Bruxo) não foram exportados como consts próprias — derivados aqui, na
  // hora, a partir de spell-details.json, que já carrega círculo/ritual por
  // magia. Mesmo espírito dos "derivados" da Entrega 4a (defesa-sem-armadura.json
  // etc.): não duplica a fonte, só refiltra o que já existe.
  const spells = spellDetails.default as Record<string, { circulo: string; ritual: boolean }>;
  const todosOsTruques = Object.keys(spells).filter((n) => spells[n].circulo === "Truque");
  const todasAsMagiasRituais1 = Object.keys(spells).filter((n) => spells[n].circulo === "1º Círculo" && spells[n].ritual);
  return {
    classes: classes.default as Record<string, ClasseConst>,
    especies: especies.default as Record<string, EspecieConst>,
    antecedentes: antecedentes.default as Record<string, AntecedenteConst>,
    todasAsFerramentas: todasAsFerramentas.default,
    todasAsPericias: todasAsPericias.default,
    atributoDaPericia: atributoDaPericia.default,
    atributosDoJogo: atributosDoJogo.default,
    talentosOrigem: Object.keys(feats).filter((n) => feats[n].categoria === "Origem"),
    talentosSelvagens: Object.keys(feats).filter((n) => feats[n].categoria === "Talento Selvagem"),
    maestriaDeArmas: maestriaDeArmas.default as Record<string, ArmaMaestria>,
    propriedadesDeMaestria: propriedadesDeMaestria.default,
    todosOsInstrumentos: todosOsInstrumentos.default,
    todasAsFerramentasDeArtesao: todasAsFerramentasDeArtesao.default,
    todosOsTruques,
    todasAsMagiasRituais1,
    idiomasComuns: idiomasComuns.default,
    idiomasRaros: idiomasRaros.default,
    alinhamentos: alinhamentos.default,
    infoDeAlinhamento: infoDeAlinhamento.default,
    arrayPadrao: arrayPadrao.default,
  };
}

export function RulesetProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoRuleset>({ carregando: true, dados: null, erro: null });

  useEffect(() => {
    let cancelado = false;
    carregarRulesetNivel1()
      .then((dados) => {
        if (!cancelado) setEstado({ carregando: false, dados, erro: null });
      })
      .catch((e: unknown) => {
        if (!cancelado) setEstado({ carregando: false, dados: null, erro: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return <RulesetContext.Provider value={estado}>{children}</RulesetContext.Provider>;
}

export function useRuleset(): EstadoRuleset {
  return useContext(RulesetContext);
}
