import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStrings } from "../i18n/context";
import { listarFichas, type RegistroFicha } from "@core/armazenamento/armazenamento.ts";

/** Lista de fichas salvas — já chama a camada de armazenamento de verdade
 * (core/armazenamento, Entrega 3), não um mock. Fica vazia até a Entrega
 * 5e (wizard salvando de verdade) ou 5b+ ligar o resto do fluxo — a tela
 * em si já está completa, só não tem produtor de ficha ainda. */
export function CarregarPersonagem() {
  const strings = useStrings();
  const [fichas, setFichas] = useState<RegistroFicha[] | null>(null);

  useEffect(() => {
    listarFichas().then(setFichas);
  }, []);

  return (
    <main className="tela-carregar">
      <h1>{strings.carregarPersonagem.titulo}</h1>
      {fichas === null ? null : fichas.length === 0 ? (
        <p>{strings.carregarPersonagem.vazio}</p>
      ) : (
        <ul className="lista-fichas">
          {fichas.map((f) => (
            <li key={f.id}>
              <Link to={`/personagem/${f.id}/perfil`}>{String(f.resumo.nome ?? f.id)}</Link>
            </li>
          ))}
        </ul>
      )}
      <Link to="/">{strings.comum.voltarParaHome}</Link>
    </main>
  );
}
