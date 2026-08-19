import { mod } from "@core/motor/atributos.ts";
import { useRuleset } from "../../ruleset/RulesetContext";
import { useWizard } from "../WizardContext";
import { bonusDoAntecedente } from "../bonusAntecedente";

function fmt(n: number): string {
  return (n >= 0 ? "+" : "") + n;
}

/** Passo de Atributos — equivalente a renderAttrs() (js/06-idiomas-attrs-shop.js).
 * Array Padrão: cada valor só pode estar em uso por 1 atributo por vez —
 * escolher um valor já usado em outro atributo ROUBA ele de lá (mesma
 * troca de setAttr() no vanilla), nunca duplica. */
export function AtributosStep() {
  const { dados: ruleset } = useRuleset();
  const { dados, definir } = useWizard();

  if (!ruleset) return null;
  const usados = Object.values(dados.attrs);

  function setAttr(ability: string, valorStr: string) {
    definir((r) => {
      if (valorStr === "") {
        delete r.attrs[ability];
        return;
      }
      const v = parseInt(valorStr, 10);
      for (const outro of ruleset!.atributosDoJogo) {
        if (outro !== ability && r.attrs[outro] === v) {
          delete r.attrs[outro];
          break;
        }
      }
      r.attrs[ability] = v;
    });
  }

  return (
    <section>
      <h2>Atributos (Array Padrão)</h2>
      <p className="intro">
        Distribua {ruleset.arrayPadrao.join(", ")} entre os seis atributos. Valores já usados aparecem marcados — se você
        escolher um deles, ele é retirado de onde estava antes e movido pra cá. O bônus do antecedente é somado
        automaticamente.
      </p>
      {ruleset.atributosDoJogo.map((a) => {
        const escolhido = dados.attrs[a];
        const bonus = bonusDoAntecedente(dados, a);
        const final = escolhido !== undefined ? escolhido + bonus : null;
        return (
          <div key={a} className="attr-row" id={`grp-7-attr-${a}`}>
            <div className="rotulo-pequeno">{a}</div>
            <select value={escolhido ?? ""} onChange={(e) => setAttr(a, e.target.value)}>
              <option value="">—</option>
              {ruleset.arrayPadrao.map((v) => {
                const emUsoEmOutro = usados.includes(v) && escolhido !== v;
                return (
                  <option key={v} value={v}>
                    {emUsoEmOutro ? `${v} (em uso)` : v}
                  </option>
                );
              })}
            </select>
            <div className="bonus-tag">{bonus ? `antecedente ${fmt(bonus)}` : ""}</div>
            <div className="final">{final !== null ? `Total ${final} (mod ${fmt(mod(final))})` : ""}</div>
          </div>
        );
      })}
    </section>
  );
}
