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

export interface RulesetNivel1 {
  classes: Record<string, unknown>;
  especies: Record<string, EspecieConst>;
  antecedentes: Record<string, AntecedenteConst>;
  todasAsFerramentas: string[];
  todasAsPericias: string[];
  atributoDaPericia: Record<string, string>;
  atributosDoJogo: string[];
  talentosOrigem: string[];
  talentosSelvagens: string[];
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
  const [classes, especies, antecedentes, todasAsFerramentas, todasAsPericias, atributoDaPericia, atributosDoJogo, featDetails] = await Promise.all([
    import("@dados/mecanicas-nivel1/class-const.json"),
    import("@dados/mecanicas-nivel1/species-const.json"),
    import("@dados/mecanicas-nivel1/background-const.json"),
    import("@dados/mecanicas-nivel1/all-tools.json"),
    import("@dados/mecanicas-nivel1/all-skills.json"),
    import("@dados/mecanicas-nivel1/skill-ability.json"),
    import("@dados/mecanicas-nivel1/abilities.json"),
    import("@dados/mecanicas-nivel1/feat-details.json"),
  ]);
  const feats = featDetails.default as Record<string, { categoria: string }>;
  return {
    classes: classes.default,
    especies: especies.default as Record<string, EspecieConst>,
    antecedentes: antecedentes.default as Record<string, AntecedenteConst>,
    todasAsFerramentas: todasAsFerramentas.default,
    todasAsPericias: todasAsPericias.default,
    atributoDaPericia: atributoDaPericia.default,
    atributosDoJogo: atributosDoJogo.default,
    talentosOrigem: Object.keys(feats).filter((n) => feats[n].categoria === "Origem"),
    talentosSelvagens: Object.keys(feats).filter((n) => feats[n].categoria === "Talento Selvagem"),
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
