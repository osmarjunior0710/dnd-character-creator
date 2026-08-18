import { Link } from "react-router-dom";
import { useStrings } from "../i18n/context";
import { useRuleset } from "../ruleset/RulesetContext";

/** Splash (carregando) + Home (3 opções) na mesma rota "/" — a splash é um
 * ESTADO de carregamento desta tela, não uma URL própria: não faz sentido
 * o jogador conseguir voltar pra uma tela de loading pelo histórico do
 * navegador. Preload de verdade da mecânica de nível 1 via useRuleset(). */
export function SplashHome() {
  const strings = useStrings();
  const { carregando, erro } = useRuleset();

  if (carregando) {
    return (
      <main className="tela-splash">
        <p>{strings.splash.carregando}</p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="tela-splash">
        <p>Erro ao carregar dados do ruleset: {erro}</p>
      </main>
    );
  }

  return (
    <main className="tela-home">
      <h1>{strings.home.titulo}</h1>
      <nav className="home-opcoes">
        <Link to="/novo" className="home-opcao">
          {strings.home.novoPersonagem}
        </Link>
        <Link to="/carregar" className="home-opcao">
          {strings.home.carregarPersonagem}
        </Link>
        <Link to="/ferramentas" className="home-opcao home-opcao-desabilitada">
          {strings.home.ferramentasDeMestre}
          <span className="home-opcao-badge">{strings.home.emBreve}</span>
        </Link>
      </nav>
    </main>
  );
}
