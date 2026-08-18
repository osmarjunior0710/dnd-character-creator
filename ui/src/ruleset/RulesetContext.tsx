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

export interface RulesetNivel1 {
  classes: Record<string, unknown>;
  especies: Record<string, unknown>;
  antecedentes: Record<string, AntecedenteConst>;
  todasAsFerramentas: string[];
  todasAsPericias: string[];
  atributoDaPericia: Record<string, string>;
  atributosDoJogo: string[];
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
  const [classes, especies, antecedentes, todasAsFerramentas, todasAsPericias, atributoDaPericia, atributosDoJogo] = await Promise.all([
    import("@dados/mecanicas-nivel1/class-const.json"),
    import("@dados/mecanicas-nivel1/species-const.json"),
    import("@dados/mecanicas-nivel1/background-const.json"),
    import("@dados/mecanicas-nivel1/all-tools.json"),
    import("@dados/mecanicas-nivel1/all-skills.json"),
    import("@dados/mecanicas-nivel1/skill-ability.json"),
    import("@dados/mecanicas-nivel1/abilities.json"),
  ]);
  return {
    classes: classes.default,
    especies: especies.default,
    antecedentes: antecedentes.default as Record<string, AntecedenteConst>,
    todasAsFerramentas: todasAsFerramentas.default,
    todasAsPericias: todasAsPericias.default,
    atributoDaPericia: atributoDaPericia.default,
    atributosDoJogo: atributosDoJogo.default,
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
