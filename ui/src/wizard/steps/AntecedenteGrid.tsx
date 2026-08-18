import { useRuleset } from "../../ruleset/RulesetContext";
import { useWizard } from "../WizardContext";

/** Passo "Escolha seu Antecedente" — grade simples de seleção. A versão
 * vanilla mostra um card expandido com talento/perícias/ferramenta ao
 * lado de cada opção (choiceGridWithInfo); aqui, por ora, cada opção só
 * mostra o nome — o resumo completo aparece na tela de detalhe logo em
 * seguida. Simplificação visual deliberada desta sub-entrega, não perda
 * de informação: nada que o jogador precisa pra decidir fica escondido,
 * só reorganizado num passo a mais. */
export function AntecedenteGrid() {
  const { dados: ruleset } = useRuleset();
  const { dados, definir } = useWizard();

  if (!ruleset) return null;
  const nomes = Object.keys(ruleset.antecedentes);

  return (
    <section id="grp-2-antecedente">
      <h2>Escolha seu Antecedente</h2>
      <p className="intro">
        O antecedente representa a vida do seu personagem antes da aventura: concede um talento, duas perícias, uma
        ferramenta e ajuda a definir os atributos.
      </p>
      <div className="choice-grid">
        {nomes.map((nome) => {
          const bg = ruleset.antecedentes[nome];
          const selecionado = dados.antecedente === nome;
          return (
            <button
              key={nome}
              type="button"
              className={`choice${selecionado ? " selected" : ""}`}
              onClick={() => definir((r) => { r.antecedente = nome; })}
            >
              <strong>{nome}</strong>
              <span className="note">{bg.skills.join(", ")}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
