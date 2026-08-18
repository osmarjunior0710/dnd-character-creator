import { useRuleset } from "../../ruleset/RulesetContext";
import { useWizard } from "../WizardContext";

/** Passo de Idiomas — equivalente a renderIdiomasStep() (js/06-idiomas-attrs-shop.js).
 * Todo mundo escolhe 2 (comuns+raros); Ladino ganha Gíria dos Ladrões de
 * graça e escolhe mais 1. Gíria dos Ladrões nunca é uma escolha de
 * verdade pra ninguém (nem pro Ladino, que já tem ela automática) — por
 * isso sai da lista escolhível, igual choosableLanguages() no vanilla. */
export function IdiomasStep() {
  const { dados: ruleset } = useRuleset();
  const { dados, definir } = useWizard();

  if (!ruleset) return null;
  const pool = [...ruleset.idiomasComuns, ...ruleset.idiomasRaros].filter((l) => l !== "Gíria dos Ladrões");
  const grupos = [
    { label: "Comuns", itens: pool.filter((l) => ruleset.idiomasComuns.includes(l)) },
    { label: "Raros", itens: pool.filter((l) => ruleset.idiomasRaros.includes(l)) },
  ];
  const isLadino = dados.classe === "Ladino";

  function toggleComum(v: string) {
    definir((r) => {
      const i = r.idiomas.comuns.indexOf(v);
      if (i >= 0) {
        r.idiomas.comuns.splice(i, 1);
      } else if (r.idiomas.comuns.length < 2) {
        r.idiomas.comuns.push(v);
        const ei = r.idiomas.extra.indexOf(v);
        if (ei >= 0) r.idiomas.extra.splice(ei, 1); // virou "comum escolhido" — sai do extra
      }
    });
  }

  function toggleExtra(v: string) {
    definir((r) => {
      const i = r.idiomas.extra.indexOf(v);
      if (i >= 0) r.idiomas.extra.splice(i, 1);
      else if (r.idiomas.extra.length < 1) r.idiomas.extra.push(v);
    });
  }

  return (
    <section>
      <h2>Idiomas</h2>
      <p className="intro">Todo personagem conhece Comum, além de mais idiomas escolhidos abaixo.</p>
      <div className="check-list">
        <span className="rotulo-grupo">Automático:</span>
        <div className="check-pill selected">Comum</div>
      </div>

      <div id="grp-6-comuns">
        <h3>Escolha 2 Idiomas</h3>
        <p className="intro">Idiomas raros normalmente exigem contato direto com aquele povo ou cultura — combine com a história do seu personagem.</p>
        <Grupos grupos={grupos} selecionados={dados.idiomas.comuns} max={2} onToggle={toggleComum} />
        <div className="contador">{dados.idiomas.comuns.length}/2 escolhidos</div>
      </div>

      {isLadino && (
        <>
          <h3>Ladino — Gíria dos Ladrões</h3>
          <p className="intro">Como Ladino, você conhece a Gíria dos Ladrões automaticamente (não conta como uma das escolhas acima).</p>
          <div className="check-list">
            <div className="check-pill selected">Gíria dos Ladrões</div>
          </div>

          <div id="grp-6-extra">
            <h3>Escolha 1 Idioma Adicional</h3>
            <Grupos grupos={grupos} selecionados={dados.idiomas.extra} max={1} onToggle={toggleExtra} excluir={dados.idiomas.comuns} />
            <div className="contador">{dados.idiomas.extra.length}/1 escolhido</div>
          </div>
        </>
      )}
    </section>
  );
}

function Grupos({ grupos, selecionados, max, onToggle, excluir = [] }: { grupos: { label: string; itens: string[] }[]; selecionados: string[]; max: number; onToggle: (v: string) => void; excluir?: string[] }) {
  return (
    <>
      {grupos.filter((g) => g.itens.length > 0).map((g) => (
        <div key={g.label} className="check-list grupo-habilidoso">
          <span className="rotulo-grupo">{g.label}:</span>
          {g.itens.map((item) => {
            const sel = selecionados.includes(item);
            const disabled = !sel && selecionados.length >= max;
            const jaEscolhido = excluir.includes(item) && !sel;
            return (
              <button key={item} type="button" disabled={disabled} className={`check-pill${sel ? " selected" : ""}`} onClick={() => onToggle(item)}>
                {jaEscolhido ? `⚠️ ${item}` : item}
              </button>
            );
          })}
        </div>
      ))}
    </>
  );
}
