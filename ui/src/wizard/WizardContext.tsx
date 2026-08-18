import { createContext, useContext, useState, type ReactNode } from "react";

// Estado de escolhas do wizard — cresce a cada sub-entrega (5b só tem
// antecedente; 5c adiciona classe; etc). Indexado pelo NOME do antecedente
// (não pela chave interna tipo "nobre" que o vanilla usa) — é uma escolha
// de implementação da UI, não do schema: core/ficha/schema.ts trata
// `escolhido` como bolsa opaca, então este formato só precisa ser
// consistente aqui dentro, sem precisar espelhar BACKGROUND_DATA_KEY.
export type PlanoAtributos =
  | { tipo: "2-1"; mais2: string | null; mais1: string | null }
  | { tipo: "1-1-1"; mais1Tres: string[] }
  | null;

export interface AntecedenteEscolha {
  abilityPlan: PlanoAtributos;
  equipment: "A" | "B" | null;
  habilidoso: string[];
  ferramentaEscolhida: string | null;
  iniciadoCantrips: string[];
  iniciadoSpell1: string[];
}

export function antecedenteEscolhaVazia(): AntecedenteEscolha {
  return { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] };
}

export interface WizardData {
  antecedente: string | null;
  freeAbilityRule: boolean;
  antecedentes: Record<string, AntecedenteEscolha>;
}

function dadosIniciais(): WizardData {
  // freeAbilityRule começa false — mesmo default de resetWizard()/`data`
  // no vanilla (js/00-notes-and-state.js linha 1339). Achado batendo este
  // valor contra o vanilla ao testar esta sub-entrega: eu tinha começado
  // com true por engano.
  return { antecedente: null, freeAbilityRule: false, antecedentes: {} };
}

interface WizardContextValor {
  dados: WizardData;
  definir: (atualizar: (rascunho: WizardData) => void) => void;
}

const WizardContext = createContext<WizardContextValor | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [dados, setDados] = useState<WizardData>(dadosIniciais);

  // `atualizar` recebe uma cópia rasa + estrutura já clonada onde precisa
  // (mesmo espírito do `data.x = y; render()` do vanilla, só que
  // imutável o suficiente pro React perceber a mudança).
  //
  // Bug real encontrado testando esta sub-entrega: com `setDados(atual =>
  // {...})` (forma funcional), o React 18 StrictMode chama o updater DUAS
  // vezes em dev pra flagrar efeito colateral não-puro — e como `atualizar`
  // faz um toggle imperativo (push/splice) em vez de calcular um valor
  // novo, a 2ª chamada desfazia a 1ª (clique em perícia do Habilidoso não
  // marcava nada). Ler `dados` direto do escopo do componente (em vez da
  // forma funcional do setState) evita o double-invoke, porque ele só
  // acontece quando se passa uma FUNÇÃO pro setState.
  function definir(atualizar: (rascunho: WizardData) => void) {
    const rascunho: WizardData = { ...dados, antecedentes: { ...dados.antecedentes } };
    atualizar(rascunho);
    setDados(rascunho);
  }

  return <WizardContext.Provider value={{ dados, definir }}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValor {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard() precisa estar dentro de <WizardProvider>.");
  return ctx;
}

/** Escolha do antecedente ATIVO — cria uma entrada vazia na primeira vez
 * que é lida, mesmo padrão de activeBgData() no vanilla (nunca undefined). */
export function useAntecedenteAtivo(): [AntecedenteEscolha, (mutar: (a: AntecedenteEscolha) => void) => void] {
  const { dados, definir } = useWizard();
  const nome = dados.antecedente;
  const atual = (nome && dados.antecedentes[nome]) || antecedenteEscolhaVazia();

  function mutarAntecedente(mutar: (a: AntecedenteEscolha) => void) {
    definir((rascunho) => {
      if (!rascunho.antecedente) return;
      const copia = { ...(rascunho.antecedentes[rascunho.antecedente] || antecedenteEscolhaVazia()) };
      mutar(copia);
      rascunho.antecedentes[rascunho.antecedente] = copia;
    });
  }

  return [atual, mutarAntecedente];
}
