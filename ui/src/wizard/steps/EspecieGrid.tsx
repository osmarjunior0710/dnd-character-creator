import { useRuleset } from "../../ruleset/RulesetContext";
import { useWizard } from "../WizardContext";

/** Passo "Escolha sua Espécie" — grade simples, mesmo espírito de
 * AntecedenteGrid.tsx (simplificação visual deliberada: sem o card
 * expandido do vanilla, o resumo completo vem na tela de detalhe). */
export function EspecieGrid() {
  const { dados: ruleset } = useRuleset();
  const { dados, definir } = useWizard();

  if (!ruleset) return null;
  const nomes = Object.keys(ruleset.especies);

  return (
    <section id="grp-4-especie">
      <h2>Escolha sua Espécie</h2>
      <p className="intro">Sua espécie define traços físicos e sobrenaturais natos — visão no escuro, resistências, truques grátis.</p>
      <div className="choice-grid">
        {nomes.map((nome) => {
          const especie = ruleset.especies[nome];
          const selecionado = dados.especie === nome;
          return (
            <button
              key={nome}
              type="button"
              className={`choice${selecionado ? " selected" : ""}`}
              onClick={() => definir((r) => { r.especie = nome; })}
            >
              <strong>{nome}</strong>
              <span className="note">{especie.tipo}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
