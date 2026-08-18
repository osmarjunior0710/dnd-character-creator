// Camada de armazenamento (VISAO.md §5.1): a UI nunca fala direto com
// localStorage, arquivo ou servidor — só com salvarFicha/carregarFicha/
// listarFichas. Por dentro, hoje, o backend padrão escreve em localStorage;
// trocar para nuvem (Fase 4) é trocar só o backend passado a
// definirBackend(), sem mudar uma linha de quem chama estas três funções.

import { migrarFicha, type FichaV1 } from "../ficha/schema.ts";

/** Metadados de uma ficha salva, sem o conteúdo completo — o suficiente
 * para listarFichas() popular a tela "Carregar personagem" (Fase 2:
 * avatar, nome, classe, origem, nível) sem precisar carregar cada ficha
 * inteira. O storage nunca lê o que tem dentro de `resumo` — é uma bolsa
 * opaca que quem chama salvarFicha decide como preencher (ruleset-aware,
 * não é responsabilidade desta camada saber o que é "classe" ou "nível"). */
export interface RegistroFicha {
  id: string;
  ruleset: string;
  criadoEm: string;
  atualizadoEm: string;
  resumo: Record<string, unknown>;
}

export interface FichaArmazenada extends RegistroFicha {
  ficha: FichaV1;
}

/** Contrato que qualquer backend de armazenamento precisa cumprir. A troca
 * de localStorage para um servidor na nuvem (Fase 4) é escrever uma nova
 * implementação disto — o resto do arquivo não muda. */
export interface BackendArmazenamento {
  salvar(registro: FichaArmazenada): Promise<void>;
  carregar(id: string): Promise<FichaArmazenada | null>;
  listar(): Promise<RegistroFicha[]>;
  remover(id: string): Promise<void>;
}

function gerarId(): string {
  return `ficha-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// --- Backend em memória: usado nos exemplos/testes que rodam em Node (sem
// navegador, logo sem localStorage) — nunca é o backend de um app publicado.
export function criarBackendMemoria(): BackendArmazenamento {
  const fichas = new Map<string, FichaArmazenada>();
  return {
    async salvar(registro) {
      fichas.set(registro.id, registro);
    },
    async carregar(id) {
      return fichas.get(id) ?? null;
    },
    async listar() {
      return [...fichas.values()].map(({ ficha: _ficha, ...registro }) => registro);
    },
    async remover(id) {
      fichas.delete(id);
    },
  };
}

// --- Backend em localStorage: o backend real de hoje (Fase 1). Recebe a
// implementação de storage por parâmetro em vez de assumir a lib DOM
// global — deixa core/ testável fora de navegador e pronto pra injeção de
// outro key-value store no futuro sem reescrever nada aqui.
interface ArmazenamentoChaveValor {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
  removeItem(chave: string): void;
}

const CHAVE_INDICE = "dnd_fichas_index_v1";
const chaveFicha = (id: string) => `dnd_ficha_${id}_v1`;

export function criarBackendLocalStorage(
  storage: ArmazenamentoChaveValor | undefined = (
    globalThis as unknown as { localStorage?: ArmazenamentoChaveValor }
  ).localStorage
): BackendArmazenamento {
  if (!storage) {
    throw new Error(
      "criarBackendLocalStorage: nenhum localStorage disponível neste ambiente. " +
        "Passe um storage compatível explicitamente, ou use criarBackendMemoria() fora do navegador."
    );
  }
  // Reatribuído a uma const própria: o TypeScript não propaga o
  // estreitamento de "storage não é undefined" acima para dentro das
  // closures abaixo (limitação conhecida do compilador com parâmetros
  // capturados) — esta const resolve isso sem precisar de "!" no meio do
  // código depois.
  const kv: ArmazenamentoChaveValor = storage;

  function lerIndice(): RegistroFicha[] {
    const bruto = kv.getItem(CHAVE_INDICE);
    return bruto ? (JSON.parse(bruto) as RegistroFicha[]) : [];
  }
  function escreverIndice(indice: RegistroFicha[]): void {
    kv.setItem(CHAVE_INDICE, JSON.stringify(indice));
  }

  return {
    async salvar(registro) {
      const { ficha, ...meta } = registro;
      kv.setItem(chaveFicha(registro.id), JSON.stringify(ficha));
      const indice = lerIndice().filter((r) => r.id !== registro.id);
      indice.push(meta);
      escreverIndice(indice);
    },
    async carregar(id) {
      const bruto = kv.getItem(chaveFicha(id));
      if (!bruto) return null;
      const meta = lerIndice().find((r) => r.id === id);
      if (!meta) return null;
      return { ...meta, ficha: JSON.parse(bruto) as FichaV1 };
    },
    async listar() {
      return lerIndice();
    },
    async remover(id) {
      kv.removeItem(chaveFicha(id));
      escreverIndice(lerIndice().filter((r) => r.id !== id));
    },
  };
}

// --- API pública: as três funções que a UI de fato chama, mais
// exportar/importar como cópia de segurança manual (arquivo .json).

let backendAtivo: BackendArmazenamento | null = null;

/** Troca o backend por trás das três funções públicas. Chamado uma vez no
 * arranque do app (localStorage hoje; um backend de nuvem na Fase 4) — quem
 * chama salvarFicha/carregarFicha/listarFichas nunca precisa saber qual
 * backend está ativo. */
export function definirBackend(backend: BackendArmazenamento): void {
  backendAtivo = backend;
}

function backend(): BackendArmazenamento {
  if (!backendAtivo) {
    throw new Error("Nenhum backend de armazenamento definido — chame definirBackend() antes.");
  }
  return backendAtivo;
}

export async function salvarFicha(
  ficha: FichaV1,
  opcoes: { id?: string; resumo?: Record<string, unknown> } = {}
): Promise<string> {
  const id = opcoes.id ?? gerarId();
  const existente = await backend().carregar(id);
  const agora = new Date().toISOString();
  await backend().salvar({
    id,
    ruleset: ficha.ruleset,
    criadoEm: existente?.criadoEm ?? agora,
    atualizadoEm: agora,
    resumo: opcoes.resumo ?? existente?.resumo ?? {},
    ficha,
  });
  return id;
}

export async function carregarFicha(id: string): Promise<FichaV1 | null> {
  const registro = await backend().carregar(id);
  return registro ? migrarFicha(registro.ficha) : null;
}

export async function listarFichas(): Promise<RegistroFicha[]> {
  return backend().listar();
}

export async function removerFicha(id: string): Promise<void> {
  await backend().remover(id);
}

/** Cópia de segurança manual: baixa/cola a ficha inteira como um arquivo
 * .json — independente de qual backend está ativo. */
export function exportarFichaComoJson(ficha: FichaV1): string {
  return JSON.stringify(ficha, null, 2);
}

export function importarFichaDeJson(json: string): FichaV1 {
  return migrarFicha(JSON.parse(json));
}
