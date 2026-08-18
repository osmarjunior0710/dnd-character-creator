import { createContext, useContext, type ReactNode } from "react";
import { ptBR, type Strings } from "./pt-BR";

// Contexto deliberadamente fino: hoje só existe PT-BR, então o Provider
// sempre entrega o mesmo dicionário. O ponto de existir já é a costura —
// quando um segundo idioma chegar, StringsProvider passa a escolher o
// dicionário certo (por preferência do usuário/navegador), e nenhum
// componente que já chama useStrings() precisa mudar uma linha.
const StringsContext = createContext<Strings>(ptBR);

export function StringsProvider({ children }: { children: ReactNode }) {
  return <StringsContext.Provider value={ptBR}>{children}</StringsContext.Provider>;
}

export function useStrings(): Strings {
  return useContext(StringsContext);
}
