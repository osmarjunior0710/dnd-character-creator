import { Link } from "react-router-dom";
import { useStrings } from "../i18n/context";

/** Placeholder — Fase 5/6 do roadmap (VISAO.md §6), não desta entrega. A
 * rota existe agora só pra o link "Ferramentas de mestre" da Home ter pra
 * onde ir sem precisar de um `if` especial. */
export function Ferramentas() {
  const strings = useStrings();
  return (
    <main className="tela-em-construcao">
      <h1>{strings.home.ferramentasDeMestre}</h1>
      <p>{strings.home.emBreve}</p>
      <Link to="/">{strings.comum.voltarParaHome}</Link>
    </main>
  );
}
