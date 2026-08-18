import { useRuleset, type AntecedenteConst } from "../../ruleset/RulesetContext";
import { useWizard, useAntecedenteAtivo, type AntecedenteEscolha } from "../WizardContext";

/** Antecedente escolhido tem 1 talento fixo ("Sortudo", "Alerta"...) sem
 * nenhuma sub-escolha — só os 3 blocos condicionais abaixo (ferramenta,
 * iniciado em magia, habilidoso) já cobrem toda a variedade dos 16
 * antecedentes, mesmo espírito de renderSimpleBackgroundDetail() no
 * vanilla (uma função só pra todos, não 16 telas). */
export function AntecedenteDetalhe() {
  const { dados: ruleset } = useRuleset();
  const { dados } = useWizard();
  const [escolha, mutar] = useAntecedenteAtivo();

  if (!ruleset || !dados.antecedente) return null;
  const bg = ruleset.antecedentes[dados.antecedente];

  return (
    <section>
      <h2>{bg.nome} — Detalhes do Antecedente</h2>
      <p className="intro">
        Talento: {bg.feat}
        <br />
        Perícias: {bg.skills.join(", ")}
        <br />
        Ferramenta: {bg.ferramentaOpcoes ? `${bg.ferramentaCategoria} (escolha o tipo abaixo)` : bg.tool}
      </p>

      <PlanoDeAtributos bg={bg} escolha={escolha} mutar={mutar} />

      {bg.ferramentaOpcoes && <EscolhaDeFerramenta bg={bg} escolha={escolha} mutar={mutar} />}

      {bg.iniciadoEmMagia && <IniciadoEmMagia bg={bg} escolha={escolha} mutar={mutar} />}

      {bg.feat.startsWith("Habilidoso") && <EscolhaHabilidoso bg={bg} escolha={escolha} mutar={mutar} />}

      <EquipamentoInicial bg={bg} escolha={escolha} mutar={mutar} />
    </section>
  );
}

type Mutar = (mutar: (a: AntecedenteEscolha) => void) => void;
interface PropsBloco {
  bg: AntecedenteConst;
  escolha: AntecedenteEscolha;
  mutar: Mutar;
}

function PlanoDeAtributos({ bg, escolha, mutar }: PropsBloco) {
  const { dados, definir } = useWizard();
  const { dados: ruleset } = useRuleset();
  const permitidos = dados.freeAbilityRule ? ruleset!.atributosDoJogo : bg.suggestedAbilities;
  const plano = escolha.abilityPlan;

  return (
    <div id="grp-3-abilityplan">
      <h3>Distribuição de Atributos</h3>
      <label className="regra-da-casa">
        <input
          type="checkbox"
          checked={dados.freeAbilityRule}
          onChange={() => definir((r) => { r.freeAbilityRule = !r.freeAbilityRule; })}
        />
        Regra da casa: Sem restrição de antecedente
      </label>
      <p className="intro">
        {dados.freeAbilityRule
          ? "Com a regra da casa marcada, você pode colocar os bônus em qualquer um dos 6 atributos."
          : `Regra oficial do livro: os bônus ficam travados nos atributos sugeridos pra este antecedente — ${bg.suggestedAbilities.join(", ")}. Marque a regra da casa acima pra liberar todos os 6.`}{" "}
        Escolha +2 em um e +1 em outro, OU +1 em três.
      </p>
      <div className="check-list">
        <button
          type="button"
          className={`check-pill${plano?.tipo === "2-1" ? " selected" : ""}`}
          onClick={() => mutar((a) => { a.abilityPlan = { tipo: "2-1", mais2: null, mais1: null }; })}
        >
          +2 / +1
        </button>
        <button
          type="button"
          className={`check-pill${plano?.tipo === "1-1-1" ? " selected" : ""}`}
          onClick={() => mutar((a) => { a.abilityPlan = { tipo: "1-1-1", mais1Tres: [] }; })}
        >
          +1 / +1 / +1
        </button>
      </div>
      {plano?.tipo === "2-1" && (
        <div className="plano-2-1">
          <div>
            <div className="rotulo-pequeno">+2 em:</div>
            <div className="check-list">
              {permitidos.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`check-pill${plano.mais2 === a ? " selected" : ""}`}
                  onClick={() =>
                    mutar((x) => {
                      if (x.abilityPlan?.tipo !== "2-1") return;
                      x.abilityPlan.mais2 = a;
                      if (x.abilityPlan.mais1 === a) x.abilityPlan.mais1 = null;
                    })
                  }
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="rotulo-pequeno">+1 em:</div>
            <div className="check-list">
              {permitidos
                .filter((a) => a !== plano.mais2)
                .map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`check-pill${plano.mais1 === a ? " selected" : ""}`}
                    onClick={() =>
                      mutar((x) => {
                        if (x.abilityPlan?.tipo === "2-1") x.abilityPlan.mais1 = a;
                      })
                    }
                  >
                    {a}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
      {plano?.tipo === "1-1-1" && (
        <div className="check-list plano-1-1-1">
          {permitidos.map((a) => {
            const sel = plano.mais1Tres.includes(a);
            const disabled = !sel && plano.mais1Tres.length >= 3;
            return (
              <button
                key={a}
                type="button"
                disabled={disabled}
                className={`check-pill${sel ? " selected" : ""}`}
                onClick={() =>
                  mutar((x) => {
                    if (x.abilityPlan?.tipo !== "1-1-1") return;
                    const i = x.abilityPlan.mais1Tres.indexOf(a);
                    if (i >= 0) x.abilityPlan.mais1Tres.splice(i, 1);
                    else if (x.abilityPlan.mais1Tres.length < 3) x.abilityPlan.mais1Tres.push(a);
                  })
                }
              >
                {a}
              </button>
            );
          })}
        </div>
      )}
      {escolha.abilityPlan === null && <p className="nota-erro">Sem escolher a distribuição, o passo não avança — falta preencher (VISAO §0, item 1 do audit da UI).</p>}
    </div>
  );
}

function EscolhaDeFerramenta({ bg, escolha, mutar }: PropsBloco) {
  return (
    <div id="grp-3-ferramenta">
      <h3>Ferramenta — escolha o tipo de {bg.ferramentaCategoria}</h3>
      <p className="intro">O livro deixa livre entre as variantes vendidas no capítulo de Equipamento.</p>
      <div className="check-list">
        {bg.ferramentaOpcoes!.map((k) => (
          <button
            key={k}
            type="button"
            className={`check-pill${escolha.ferramentaEscolhida === k ? " selected" : ""}`}
            onClick={() => mutar((a) => { a.ferramentaEscolhida = k; })}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

function IniciadoEmMagia({ bg, escolha, mutar }: PropsBloco) {
  const im = bg.iniciadoEmMagia!;
  return (
    <>
      <div id="grp-3-iniciado-truques">
        <h3>Iniciado em Magia — 2 truques de {im.classe}</h3>
        <ListaDeEscolhaSimples
          itens={im.cantrips}
          selecionados={escolha.iniciadoCantrips}
          max={2}
          onToggle={(nome) =>
            mutar((a) => {
              const i = a.iniciadoCantrips.indexOf(nome);
              if (i >= 0) a.iniciadoCantrips.splice(i, 1);
              else if (a.iniciadoCantrips.length < 2) a.iniciadoCantrips.push(nome);
            })
          }
        />
        <div className="contador">{escolha.iniciadoCantrips.length}/2 escolhidos</div>
      </div>
      <div id="grp-3-iniciado-magia1">
        <h3>Iniciado em Magia — 1 magia de 1º círculo de {im.classe}</h3>
        <p className="intro">Essa magia fica sempre preparada e pode ser conjurada 1x grátis por Descanso Longo (ou com espaço de magia depois).</p>
        <ListaDeEscolhaSimples
          itens={im.spells1}
          selecionados={escolha.iniciadoSpell1}
          max={1}
          onToggle={(nome) =>
            mutar((a) => {
              const i = a.iniciadoSpell1.indexOf(nome);
              if (i >= 0) a.iniciadoSpell1.splice(i, 1);
              else if (a.iniciadoSpell1.length < 1) a.iniciadoSpell1.push(nome);
            })
          }
        />
        <div className="contador">{escolha.iniciadoSpell1.length}/1 escolhida</div>
      </div>
    </>
  );
}

function ListaDeEscolhaSimples({ itens, selecionados, max, onToggle }: { itens: string[]; selecionados: string[]; max: number; onToggle: (nome: string) => void }) {
  return (
    <div className="check-list">
      {itens.map((nome) => {
        const sel = selecionados.includes(nome);
        const disabled = !sel && selecionados.length >= max;
        return (
          <button key={nome} type="button" disabled={disabled} className={`check-pill${sel ? " selected" : ""}`} onClick={() => onToggle(nome)}>
            {nome}
          </button>
        );
      })}
    </div>
  );
}

function EscolhaHabilidoso({ bg, escolha, mutar }: PropsBloco) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  const excluida = bg.ferramentaOpcoes ? escolha.ferramentaEscolhida || bg.ferramentaCategoria : bg.tool;
  const grupos = [
    ...ruleset.atributosDoJogo.map((atributo) => ({
      label: atributo,
      itens: ruleset.todasAsPericias.filter((p) => ruleset.atributoDaPericia[p] === atributo),
    })),
    { label: "Ferramentas", itens: ruleset.todasAsFerramentas.filter((t) => t !== excluida) },
  ].filter((g) => g.itens.length > 0);

  return (
    <div id="grp-3-habilidoso">
      <h3>Talento Habilidoso — escolha 3 perícias ou ferramentas</h3>
      <p className="intro">
        {bg.skills.join(" e ")} (perícias) e {excluida} (ferramenta) já vêm do {bg.nome}.
      </p>
      {grupos.map((g) => (
        <div key={g.label} className="check-list grupo-habilidoso">
          <span className="rotulo-grupo">{g.label}:</span>
          {g.itens.map((item) => {
            const sel = escolha.habilidoso.includes(item);
            const disabled = !sel && escolha.habilidoso.length >= 3;
            return (
              <button
                key={item}
                type="button"
                disabled={disabled}
                className={`check-pill${sel ? " selected" : ""}`}
                onClick={() =>
                  mutar((a) => {
                    const i = a.habilidoso.indexOf(item);
                    if (i >= 0) a.habilidoso.splice(i, 1);
                    else if (a.habilidoso.length < 3) a.habilidoso.push(item);
                  })
                }
              >
                {item}
              </button>
            );
          })}
        </div>
      ))}
      <div className="contador">{escolha.habilidoso.length}/3 escolhidos</div>
    </div>
  );
}

function EquipamentoInicial({ bg, escolha, mutar }: PropsBloco) {
  const equipA = bg.equipmentA.map((item) => (item === "{ferramenta}" ? escolha.ferramentaEscolhida || bg.ferramentaCategoria : item));
  return (
    <div id="grp-3-equipment">
      <h3>Equipamento Inicial</h3>
      <div className={`opcao-equipamento${escolha.equipment === "A" ? " selected" : ""}`}>
        <h4>Opção A</h4>
        <p>{equipA.join(", ")}, {bg.equipmentA_gold} PO</p>
        <button type="button" onClick={() => mutar((a) => { a.equipment = "A"; })}>
          {escolha.equipment === "A" ? "Selecionado" : "Escolher"}
        </button>
      </div>
      <div className={`opcao-equipamento${escolha.equipment === "B" ? " selected" : ""}`}>
        <h4>Opção B</h4>
        <p>{bg.equipmentB_gold} PO</p>
        <button type="button" onClick={() => mutar((a) => { a.equipment = "B"; })}>
          {escolha.equipment === "B" ? "Selecionado" : "Escolher"}
        </button>
      </div>
    </div>
  );
}
