import { Link } from "react-router-dom";
import { useStrings } from "../i18n/context";

/** Rota /novo — o wizard de criação de personagem em si. Placeholder por
 * enquanto: o passo a passo real (Classe, Antecedente, Espécie, Idiomas,
 * Atributos, Alinhamento, Loja, Resumo) chega nas Entregas 5b-5e, sempre
 * passando pela camada de armazenamento (core/armazenamento). */
export function Wizard() {
  const strings = useStrings();
  return (
    <main className="tela-em-construcao">
      <h1>{strings.wizard.titulo}</h1>
      <p>{strings.wizard.emConstrucao}</p>
      <Link to="/">{strings.comum.voltarParaHome}</Link>
    </main>
  );
}
