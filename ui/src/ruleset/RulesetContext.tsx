import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// Dados de mecânica de nível 1 (Entrega 4a) — o mesmo que core/motor/
// consome, agora carregado no navegador pra alimentar as telas. Tipado
// solto de propósito (só o "formato de índice", nunca os NOMES de dentro,
// tipo "Bárbaro") — ui/ não é o lugar de descrever o formato de uma classe
// de D&D campo a campo; isso é trabalho de um adaptador que ainda não
// existe (chega quando o wizard de verdade precisar, Entrega 5b+).
export interface RulesetNivel1 {
  classes: Record<string, unknown>;
  especies: Record<string, unknown>;
  antecedentes: Record<string, unknown>;
}

interface EstadoRuleset {
  carregando: boolean;
  dados: RulesetNivel1 | null;
  erro: string | null;
}

const RulesetContext = createContext<EstadoRuleset>({ carregando: true, dados: null, erro: null });

/** Pré-carrega a mecânica de nível 1 — é o trabalho da tela de Splash
 * (VISAO §2.1 do handoff: "usada para pré-carregar os dados do ruleset
 * antes do usuário precisar"). Só os 3 arquivos mais usados por enquanto;
 * crescer a lista aqui é barato conforme o wizard for precisando de mais
 * (Entrega 5b em diante), sem mudar a forma do Provider. */
async function carregarRulesetNivel1(): Promise<RulesetNivel1> {
  const [classes, especies, antecedentes] = await Promise.all([
    import("@dados/mecanicas-nivel1/class-const.json"),
    import("@dados/mecanicas-nivel1/species-const.json"),
    import("@dados/mecanicas-nivel1/background-const.json"),
  ]);
  return { classes: classes.default, especies: especies.default, antecedentes: antecedentes.default };
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
