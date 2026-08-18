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

export interface EspecieEscolha {
  tamanho: string | null; // Tiferino, Humano, Aasimar (as outras espécies têm 1 opção só, sem escolha)
  pericia: string | null; // Humano (Hábil), Elfo (Sentidos Aguçados)
  talento: string | null; // Humano (Versátil)
  heranca: string | null; // Draconato (Herança Dracônica)
  linhagem: string | null; // Elfo, Gnomo
  atributoLinhagem: string | null; // Gnomo
  legado: string | null; // Tiferino
  atributoLegado: string | null; // Tiferino
  ancestralidade: string | null; // Golias
}

export function especieEscolhaVazia(): EspecieEscolha {
  return { tamanho: null, pericia: null, talento: null, heranca: null, linhagem: null, atributoLinhagem: null, legado: null, atributoLegado: null, ancestralidade: null };
}

/** Escolha de classe — superconjunto dos campos que QUALQUER uma das 13
 * classes usa (nem toda classe usa todo campo; cada passo de detalhe só
 * lê os campos que fazem sentido pra ela, igual o `data.bruxo`/`data.barbaro`/
 * etc. do vanilla, só que unificados num tipo só em vez de 13 tipos). */
export interface ClasseEscolha {
  skills: string[];
  maestria: string[];
  especialista: string[];
  pactBoon: string | null; // Bruxo
  cantrips: string[];
  tomoCantrips: string[]; // Bruxo/Pacto do Tomo
  spells1: string[];
  tomoRituals: string[]; // Bruxo/Pacto do Tomo
  spellbook: string[]; // Mago
  prepared: string[]; // Mago, Paladino
  ordem: string | null; // Clérigo, Druida
  estilo: string | null; // Guerreiro
  toolCategory: string | null; // Monge
  toolChoice: string | null; // Monge
  instruments: string[]; // Bardo
  equipment: "A" | "B" | "C" | null;
}

export function classeEscolhaVazia(): ClasseEscolha {
  return {
    skills: [], maestria: [], especialista: [], pactBoon: null, cantrips: [], tomoCantrips: [],
    spells1: [], tomoRituals: [], spellbook: [], prepared: [], ordem: null, estilo: null,
    toolCategory: null, toolChoice: null, instruments: [], equipment: null,
  };
}

export interface IdiomasEscolha {
  comuns: string[]; // sempre 2, do pool comuns+raros (choosableLanguages())
  extra: string[]; // só Ladino — 1 idioma além da Gíria dos Ladrões automática
}

function idiomasEscolhaVazia(): IdiomasEscolha {
  return { comuns: [], extra: [] };
}

export interface WizardData {
  classe: string | null;
  classes: Record<string, ClasseEscolha>;
  antecedente: string | null;
  freeAbilityRule: boolean;
  antecedentes: Record<string, AntecedenteEscolha>;
  especie: string | null;
  especies: Record<string, EspecieEscolha>;
  idiomas: IdiomasEscolha;
  attrs: Record<string, number>; // atributo -> valor bruto do Array Padrão (sem bônus de antecedente)
  alinhamento: string | null;
}

function dadosIniciais(): WizardData {
  // freeAbilityRule começa false — mesmo default de resetWizard()/`data`
  // no vanilla (js/00-notes-and-state.js linha 1339). Achado batendo este
  // valor contra o vanilla ao testar esta sub-entrega: eu tinha começado
  // com true por engano.
  return {
    classe: null, classes: {}, antecedente: null, freeAbilityRule: false, antecedentes: {}, especie: null, especies: {},
    idiomas: idiomasEscolhaVazia(), attrs: {}, alinhamento: null,
  };
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
    const rascunho: WizardData = {
      ...dados,
      classes: { ...dados.classes },
      antecedentes: { ...dados.antecedentes },
      especies: { ...dados.especies },
      idiomas: { comuns: [...dados.idiomas.comuns], extra: [...dados.idiomas.extra] },
      attrs: { ...dados.attrs },
    };
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

/** Escolha da espécie ATIVA — mesmo padrão de useAntecedenteAtivo() acima. */
export function useEspecieAtiva(): [EspecieEscolha, (mutar: (e: EspecieEscolha) => void) => void] {
  const { dados, definir } = useWizard();
  const nome = dados.especie;
  const atual = (nome && dados.especies[nome]) || especieEscolhaVazia();

  function mutarEspecie(mutar: (e: EspecieEscolha) => void) {
    definir((rascunho) => {
      if (!rascunho.especie) return;
      const copia = { ...(rascunho.especies[rascunho.especie] || especieEscolhaVazia()) };
      mutar(copia);
      rascunho.especies[rascunho.especie] = copia;
    });
  }

  return [atual, mutarEspecie];
}

/** Escolha da classe ATIVA — mesmo padrão de useAntecedenteAtivo()/useEspecieAtiva(). */
export function useClasseAtiva(): [ClasseEscolha, (mutar: (c: ClasseEscolha) => void) => void] {
  const { dados, definir } = useWizard();
  const nome = dados.classe;
  const atual = (nome && dados.classes[nome]) || classeEscolhaVazia();

  function mutarClasse(mutar: (c: ClasseEscolha) => void) {
    definir((rascunho) => {
      if (!rascunho.classe) return;
      const copia = { ...(rascunho.classes[rascunho.classe] || classeEscolhaVazia()) };
      mutar(copia);
      rascunho.classes[rascunho.classe] = copia;
    });
  }

  return [atual, mutarClasse];
}
