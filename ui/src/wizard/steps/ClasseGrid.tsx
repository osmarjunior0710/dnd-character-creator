import { useRuleset } from "../../ruleset/RulesetContext";
import { useWizard } from "../WizardContext";

/** Passo "Escolha sua Classe" — grade simples, mesmo padrão visual de
 * AntecedenteGrid/EspecieGrid (nome + resumo curto; o card expandido do
 * vanilla com atributo/dado de vida/salvaguardas fica pro passo de
 * detalhe, igual já foi feito nas outras duas grades). */
export function ClasseGrid() {
  const { dados: ruleset } = useRuleset();
  const { dados, definir } = useWizard();

  if (!ruleset) return null;
  const nomes = Object.keys(ruleset.classes);

  return (
    <section id="grp-0-classe">
      <h2>Escolha sua Classe</h2>
      <p className="intro">A classe define seu papel central: como você luta, sobrevive e (se aplicável) conjura magia.</p>
      <div className="choice-grid">
        {nomes.map((nome) => {
          const cl = ruleset.classes[nome];
          const selecionado = dados.classe === nome;
          return (
            <button
              key={nome}
              type="button"
              className={`choice${selecionado ? " selected" : ""}`}
              onClick={() => definir((r) => { r.classe = nome; })}
            >
              <strong>{nome}</strong>
              <span className="note">{(cl.skills ?? ruleset.todasAsPericias).length} perícias disponíveis</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
