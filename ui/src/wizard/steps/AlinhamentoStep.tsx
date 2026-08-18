import { useRuleset } from "../../ruleset/RulesetContext";
import { useWizard } from "../WizardContext";

/** Passo de Alinhamento — equivalente a renderAlinhamentoStep()
 * (js/06-idiomas-attrs-shop.js). Sem restrição de escolha (ex: não
 * bloqueia alinhamento Mau) — mesma decisão do vanilla: sem Mestre pra
 * aprovar nada aqui, é só o jogador escolhendo pra si mesmo. Não muda
 * nenhum número da ficha, só interpretação. */
export function AlinhamentoStep() {
  const { dados: ruleset } = useRuleset();
  const { dados, definir } = useWizard();

  if (!ruleset) return null;

  return (
    <section id="grp-8-alinhamento">
      <h2>Alinhamento</h2>
      <p className="intro">Como seu personagem enxerga certo e errado, e como ele se relaciona com regras e tradição. Não muda nenhum número da ficha.</p>
      <div className="choice-grid">
        {ruleset.alinhamentos.map((nome) => {
          const selecionado = dados.alinhamento === nome;
          return (
            <button
              key={nome}
              type="button"
              className={`choice${selecionado ? " selected" : ""}`}
              onClick={() => definir((r) => { r.alinhamento = nome; })}
            >
              <strong>{nome}</strong>
              <span className="note">{ruleset.infoDeAlinhamento[nome]?.descricao}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
