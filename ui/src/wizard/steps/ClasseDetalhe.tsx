import { useRuleset, type ClasseConst, type ArmaMaestria } from "../../ruleset/RulesetContext";
import { useWizard, useClasseAtiva, type ClasseEscolha } from "../WizardContext";
import { clerigoCantripsEfetivo, druidaCantripsEfetivo } from "../validacao";

/** Passo de detalhe da Classe — ao contrário do Antecedente (uma função
 * genérica só) e mais perto da Espécie (um switch pra 13 telas
 * genuinely diferentes): cada classe tem sua própria combinação de
 * perícias/truques/magias/maestria/equipamento, então aqui tem 13
 * render<Classe>() de verdade, igual js/05-class-steps.js, só que
 * remontados sobre um punhado de blocos compartilhados (perícias, lista
 * de magias, opção única, maestria em arma, equipamento) em vez de HTML
 * repetido 13 vezes. */
export function ClasseDetalhe() {
  const { dados: ruleset } = useRuleset();
  const { escolha, mutar, classeAtiva: classe, nomeAtivo: nome } = useClasseContexto();

  if (!ruleset || !nome || !classe) return null;

  const props: PropsClasse = { classe, escolha, mutar };

  return (
    <section>
      <h2>{nome} — Detalhes da Classe</h2>
      {nome === "Bruxo" && <BruxoDetalhe {...props} />}
      {nome === "Bárbaro" && <BarbaroDetalhe {...props} />}
      {nome === "Bardo" && <BardoDetalhe {...props} />}
      {nome === "Mago" && <MagoDetalhe {...props} />}
      {nome === "Paladino" && <PaladinoDetalhe {...props} />}
      {nome === "Psiônico" && <PsionicoDetalhe {...props} />}
      {nome === "Clérigo" && <ClerigoDetalhe {...props} />}
      {nome === "Guerreiro" && <GuerreiroDetalhe {...props} />}
      {nome === "Ladino" && <LadinoDetalhe {...props} />}
      {nome === "Druida" && <DruidaDetalhe {...props} />}
      {nome === "Feiticeiro" && <FeiticeiroDetalhe {...props} />}
      {nome === "Monge" && <MongeDetalhe {...props} />}
      {nome === "Guardião" && <GuardiaoDetalhe {...props} />}
    </section>
  );
}

function useClasseContexto() {
  const { dados: ruleset } = useRuleset();
  const { dados } = useWizard();
  const [escolha, mutar] = useClasseAtiva();
  const nomeAtivo = dados.classe;
  const classeAtiva = ruleset && nomeAtivo ? ruleset.classes[nomeAtivo] : null;
  return { escolha, mutar, classeAtiva, nomeAtivo };
}

type Mutar = (mutar: (c: ClasseEscolha) => void) => void;
interface PropsClasse {
  classe: ClasseConst;
  escolha: ClasseEscolha;
  mutar: Mutar;
}

/* ---------- blocos compartilhados ---------- */

function ListaEscolha({ itens, selecionados, max, onToggle, excluir = [] }: { itens: string[]; selecionados: string[]; max: number; onToggle: (nome: string) => void; excluir?: string[] }) {
  return (
    <div className="check-list">
      {itens.map((nome) => {
        const sel = selecionados.includes(nome);
        const disabled = !sel && selecionados.length >= max;
        const jaConcedida = excluir.includes(nome) && !sel;
        return (
          <button key={nome} type="button" disabled={disabled} className={`check-pill${sel ? " selected" : ""}`} onClick={() => onToggle(nome)}>
            {jaConcedida ? `⚠️ ${nome}` : nome}
          </button>
        );
      })}
    </div>
  );
}

function PericiaPicker({ opcoes, count, escolha, mutar, campo }: { opcoes: string[]; count: number; escolha: ClasseEscolha; mutar: Mutar; campo: "skills" }) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  const grupos = ruleset.atributosDoJogo
    .map((atributo) => ({ label: atributo, itens: opcoes.filter((p) => ruleset.atributoDaPericia[p] === atributo) }))
    .filter((g) => g.itens.length > 0);
  const selecionadas = escolha[campo];
  return (
    <div id="grp-1-skills">
      <h3>Perícias (escolha {count})</h3>
      {grupos.map((g) => (
        <div key={g.label} className="check-list grupo-habilidoso">
          <span className="rotulo-grupo">{g.label}:</span>
          {g.itens.map((item) => {
            const sel = selecionadas.includes(item);
            const disabled = !sel && selecionadas.length >= count;
            return (
              <button
                key={item}
                type="button"
                disabled={disabled}
                className={`check-pill${sel ? " selected" : ""}`}
                onClick={() =>
                  mutar((c) => {
                    const i = c[campo].indexOf(item);
                    if (i >= 0) c[campo].splice(i, 1);
                    else if (c[campo].length < count) c[campo].push(item);
                  })
                }
              >
                {item}
              </button>
            );
          })}
        </div>
      ))}
      <div className="contador">{selecionadas.length}/{count} escolhidas</div>
    </div>
  );
}

function OpcaoUnica({ opcoes, selecionado, onEscolher }: { opcoes: Record<string, string>; selecionado: string | null; onEscolher: (nome: string) => void }) {
  return (
    <>
      {Object.entries(opcoes).map(([nome, desc]) => (
        <div key={nome} className={`opcao-equipamento${selecionado === nome ? " selected" : ""}`}>
          <h4>{nome}</h4>
          <p>{desc}</p>
          <button type="button" onClick={() => onEscolher(nome)}>
            {selecionado === nome ? "Selecionado" : "Escolher"}
          </button>
        </div>
      ))}
    </>
  );
}

function MaestriaPicker({ candidatos, count, selecionadas, onToggle, propriedades }: { candidatos: [string, ArmaMaestria][]; count: number; selecionadas: string[]; onToggle: (nome: string) => void; propriedades: Record<string, string> }) {
  return (
    <div id="grp-1-maestria">
      <h3>Maestria em Arma (escolha {count})</h3>
      <p className="intro">Você pode trocar essa escolha ao completar um Descanso Longo.</p>
      <div className="check-list">
        {candidatos.map(([nome, w]) => {
          const sel = selecionadas.includes(nome);
          const disabled = !sel && selecionadas.length >= count;
          return (
            <button key={nome} type="button" disabled={disabled} className={`check-pill${sel ? " selected" : ""}`} title={`${w.mastery}: ${propriedades[w.mastery] ?? ""}`} onClick={() => onToggle(nome)}>
              {nome} ({w.mastery})
            </button>
          );
        })}
      </div>
      <div className="contador">{selecionadas.length}/{count} escolhidas</div>
    </div>
  );
}

function EquipamentoPicker({ classe, escolha, mutar, resolver }: { classe: ClasseConst; escolha: ClasseEscolha; mutar: Mutar; resolver?: (itens: string[]) => string[] }) {
  const resolve = resolver ?? ((itens: string[]) => itens);
  return (
    <div id="grp-1-equipment">
      <h3>Equipamento Inicial</h3>
      <div className={`opcao-equipamento${escolha.equipment === "A" ? " selected" : ""}`}>
        <h4>Opção A</h4>
        <p>{[...resolve(classe.equipmentA), classe.equipmentA_gold + " PO"].join(", ")}</p>
        <button type="button" onClick={() => mutar((c) => { c.equipment = "A"; })}>{escolha.equipment === "A" ? "Selecionado" : "Escolher"}</button>
      </div>
      <div className={`opcao-equipamento${escolha.equipment === "B" ? " selected" : ""}`}>
        <h4>Opção B</h4>
        <p>{classe.equipmentB ? [...classe.equipmentB, classe.equipmentB_gold + " PO"].join(", ") : `${classe.equipmentB_gold} PO`}</p>
        <button type="button" onClick={() => mutar((c) => { c.equipment = "B"; })}>{escolha.equipment === "B" ? "Selecionado" : "Escolher"}</button>
      </div>
      {classe.equipmentC_gold !== undefined && (
        <div className={`opcao-equipamento${escolha.equipment === "C" ? " selected" : ""}`}>
          <h4>Opção C</h4>
          <p>{classe.equipmentC_gold} PO</p>
          <button type="button" onClick={() => mutar((c) => { c.equipment = "C"; })}>{escolha.equipment === "C" ? "Selecionado" : "Escolher"}</button>
        </div>
      )}
    </div>
  );
}

function Texto({ titulo, texto }: { titulo: string; texto?: string }) {
  if (!texto) return null;
  return (
    <>
      <h3>{titulo}</h3>
      <div className="opcao-equipamento">{texto}</div>
    </>
  );
}

/* ---------- 13 telas de detalhe ---------- */

function BruxoDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  const tomo = escolha.pactBoon === "Pacto do Tomo";
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={2} escolha={escolha} mutar={mutar} campo="skills" />

      <div id="grp-1-pact">
        <h3>Vínculo de Pacto</h3>
        <OpcaoUnica opcoes={classe.pactBoons!} selecionado={escolha.pactBoon} onEscolher={(nome) => mutar((c) => { c.pactBoon = nome; })} />
      </div>

      <div id="grp-1-cantrips">
        <h3>Truques da Classe (escolha 2, da lista de Bruxo)</h3>
        <ListaEscolha itens={classe.cantrips!} selecionados={escolha.cantrips} max={2} excluir={escolha.tomoCantrips} onToggle={(n) => mutar((c) => { const i = c.cantrips.indexOf(n); if (i >= 0) c.cantrips.splice(i, 1); else if (c.cantrips.length < 2) c.cantrips.push(n); })} />
        <div className="contador">{escolha.cantrips.length}/2 escolhidos</div>
      </div>

      {tomo && (
        <div id="grp-1-tomocantrips">
          <h3>Truques do Pacto do Tomo (escolha 3, de qualquer classe)</h3>
          <ListaEscolha itens={ruleset.todosOsTruques} selecionados={escolha.tomoCantrips} max={3} excluir={escolha.cantrips} onToggle={(n) => mutar((c) => { const i = c.tomoCantrips.indexOf(n); if (i >= 0) c.tomoCantrips.splice(i, 1); else if (c.tomoCantrips.length < 3) c.tomoCantrips.push(n); })} />
          <div className="contador">{escolha.tomoCantrips.length}/3 escolhidos</div>
        </div>
      )}

      <div id="grp-1-spells1">
        <h3>Magias Preparadas de 1º Círculo (escolha 2, da lista de Bruxo)</h3>
        <ListaEscolha itens={classe.spells1!} selecionados={escolha.spells1} max={2} excluir={escolha.tomoRituals} onToggle={(n) => mutar((c) => { const i = c.spells1.indexOf(n); if (i >= 0) c.spells1.splice(i, 1); else if (c.spells1.length < 2) c.spells1.push(n); })} />
        <div className="contador">{escolha.spells1.length}/2 escolhidas</div>
      </div>

      {tomo && (
        <div id="grp-1-tomorituals">
          <h3>Magias Rituais do Pacto do Tomo (escolha 2, 1º círculo, de qualquer classe)</h3>
          <ListaEscolha itens={ruleset.todasAsMagiasRituais1} selecionados={escolha.tomoRituals} max={2} excluir={escolha.spells1} onToggle={(n) => mutar((c) => { const i = c.tomoRituals.indexOf(n); if (i >= 0) c.tomoRituals.splice(i, 1); else if (c.tomoRituals.length < 2) c.tomoRituals.push(n); })} />
          <div className="contador">{escolha.tomoRituals.length}/2 escolhidas</div>
        </div>
      )}

      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}

function BarbaroDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  const candidatos = Object.entries(ruleset.maestriaDeArmas).filter(([, w]) => w.tipo === classe.maestriaTipoPermitido) as [string, ArmaMaestria][];
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={2} escolha={escolha} mutar={mutar} campo="skills" />
      <Texto titulo="Fúria" texto={classe.furia} />
      <Texto titulo="Defesa sem Armadura" texto={classe.defesaSemArmadura} />
      <MaestriaPicker candidatos={candidatos} count={classe.maestriaCount ?? 0} selecionadas={escolha.maestria} propriedades={ruleset.propriedadesDeMaestria} onToggle={(n) => mutar((c) => { const i = c.maestria.indexOf(n); if (i >= 0) c.maestria.splice(i, 1); else if (c.maestria.length < (classe.maestriaCount ?? 0)) c.maestria.push(n); })} />
      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}

function BardoDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  const skillsCount = classe.skillsCount ?? 2;
  const toolsCount = classe.toolsCount ?? 0;
  const resolver = (itens: string[]) => itens.map((item) => (item === "Instrumento Musical à escolha" ? escolha.instruments[0] || item : item));
  return (
    <>
      <PericiaPicker opcoes={ruleset.todasAsPericias} count={skillsCount} escolha={escolha} mutar={mutar} campo="skills" />

      <h3 id="grp-1-instruments">Ferramentas — Instrumentos Musicais (escolha {toolsCount})</h3>
      <ListaEscolha itens={ruleset.todosOsInstrumentos} selecionados={escolha.instruments} max={toolsCount} onToggle={(n) => mutar((c) => { const i = c.instruments.indexOf(n); if (i >= 0) c.instruments.splice(i, 1); else if (c.instruments.length < toolsCount) c.instruments.push(n); })} />
      <div className="contador">{escolha.instruments.length}/{toolsCount} escolhidos</div>

      <Texto titulo="Inspiração de Bardo" texto={classe.inspiracao} />

      <div id="grp-1-cantrips">
        <h3>Truques da Classe (escolha 2, da lista de Bardo)</h3>
        <ListaEscolha itens={classe.cantrips!} selecionados={escolha.cantrips} max={2} onToggle={(n) => mutar((c) => { const i = c.cantrips.indexOf(n); if (i >= 0) c.cantrips.splice(i, 1); else if (c.cantrips.length < 2) c.cantrips.push(n); })} />
        <div className="contador">{escolha.cantrips.length}/2 escolhidos</div>
      </div>

      <div id="grp-1-spells1">
        <h3>Magias Preparadas de 1º Círculo (escolha 4, da lista de Bardo)</h3>
        <ListaEscolha itens={classe.spells1!} selecionados={escolha.spells1} max={4} onToggle={(n) => mutar((c) => { const i = c.spells1.indexOf(n); if (i >= 0) c.spells1.splice(i, 1); else if (c.spells1.length < 4) c.spells1.push(n); })} />
        <div className="contador">{escolha.spells1.length}/4 escolhidas</div>
      </div>

      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} resolver={resolver} />
    </>
  );
}

function MagoDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const cantripsCount = classe.cantripsCount ?? 2;
  const spellbookCount = classe.spellbookCount ?? 0;
  const preparedCount = classe.preparedCount ?? 0;
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={2} escolha={escolha} mutar={mutar} campo="skills" />
      <Texto titulo="Adepto de Ritual" texto={classe.adeptoRitual} />

      <div id="grp-1-cantrips">
        <h3>Truques da Classe (escolha {cantripsCount}, da lista de Mago)</h3>
        <ListaEscolha itens={classe.cantrips!} selecionados={escolha.cantrips} max={cantripsCount} onToggle={(n) => mutar((c) => { const i = c.cantrips.indexOf(n); if (i >= 0) c.cantrips.splice(i, 1); else if (c.cantrips.length < cantripsCount) c.cantrips.push(n); })} />
        <div className="contador">{escolha.cantrips.length}/{cantripsCount} escolhidos</div>
      </div>

      <Texto titulo="Recuperação Arcana" texto={classe.recuperacaoArcana} />

      <div id="grp-1-spellbook">
        <h3>Livro de Magias (escolha {spellbookCount}, da lista de Mago)</h3>
        <p className="intro">São as magias que você conhece de verdade — seu "estoque". Em seguida você escolhe quais delas ficam Preparadas.</p>
        <ListaEscolha
          itens={classe.spells1!}
          selecionados={escolha.spellbook}
          max={spellbookCount}
          onToggle={(n) =>
            mutar((c) => {
              const i = c.spellbook.indexOf(n);
              if (i >= 0) {
                c.spellbook.splice(i, 1);
                const j = c.prepared.indexOf(n);
                if (j >= 0) c.prepared.splice(j, 1);
              } else if (c.spellbook.length < spellbookCount) c.spellbook.push(n);
            })
          }
        />
        <div className="contador">{escolha.spellbook.length}/{spellbookCount} escolhidas</div>
      </div>

      <div id="grp-1-prepared">
        <h3>Magias Preparadas (escolha {preparedCount}, do seu Livro de Magias)</h3>
        {escolha.spellbook.length === 0 ? (
          <p className="intro">Escolha primeiro as magias do seu Livro de Magias acima.</p>
        ) : (
          <ListaEscolha itens={escolha.spellbook} selecionados={escolha.prepared} max={preparedCount} onToggle={(n) => mutar((c) => { const i = c.prepared.indexOf(n); if (i >= 0) c.prepared.splice(i, 1); else if (c.prepared.length < preparedCount) c.prepared.push(n); })} />
        )}
        <div className="contador">{escolha.prepared.length}/{preparedCount} escolhidas</div>
      </div>

      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}

function PaladinoDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  const preparedCount = classe.preparedCount ?? 0;
  const maestriaCount = classe.maestriaCount ?? 0;
  const candidatos = Object.entries(ruleset.maestriaDeArmas) as [string, ArmaMaestria][];
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={2} escolha={escolha} mutar={mutar} campo="skills" />

      <div id="grp-1-prepared">
        <h3>Magias Preparadas de 1º Círculo (escolha {preparedCount}, da lista de Paladino)</h3>
        <p className="intro">Paladino não conhece truques no nível 1, só magias preparadas.</p>
        <ListaEscolha itens={classe.spells1!} selecionados={escolha.prepared} max={preparedCount} onToggle={(n) => mutar((c) => { const i = c.prepared.indexOf(n); if (i >= 0) c.prepared.splice(i, 1); else if (c.prepared.length < preparedCount) c.prepared.push(n); })} />
        <div className="contador">{escolha.prepared.length}/{preparedCount} escolhidas</div>
      </div>

      <MaestriaPicker candidatos={candidatos} count={maestriaCount} selecionadas={escolha.maestria} propriedades={ruleset.propriedadesDeMaestria} onToggle={(n) => mutar((c) => { const i = c.maestria.indexOf(n); if (i >= 0) c.maestria.splice(i, 1); else if (c.maestria.length < maestriaCount) c.maestria.push(n); })} />

      <Texto titulo="Mãos Consagradas" texto={classe.maosConsagradas} />
      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}

function PsionicoDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const cantripsCount = classe.cantripsCount ?? 2;
  const preparedCount = classe.preparedCount ?? 0;
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={2} escolha={escolha} mutar={mutar} campo="skills" />

      <div id="grp-1-cantrips">
        <h3>Truques da Classe (escolha {cantripsCount}, da lista de Psiônico)</h3>
        <ListaEscolha itens={classe.cantrips!} selecionados={escolha.cantrips} max={cantripsCount} onToggle={(n) => mutar((c) => { const i = c.cantrips.indexOf(n); if (i >= 0) c.cantrips.splice(i, 1); else if (c.cantrips.length < cantripsCount) c.cantrips.push(n); })} />
        <div className="contador">{escolha.cantrips.length}/{cantripsCount} escolhidos</div>
      </div>

      <Texto titulo="Poder Psiônico" texto={classe.poderPsionico} />
      <Texto titulo="Telecinese Sutil" texto={classe.telecineseSutil} />

      <div id="grp-1-spells1">
        <h3>Magias Preparadas de 1º Círculo (escolha {preparedCount}, da lista de Psiônico)</h3>
        <ListaEscolha itens={classe.spells1!} selecionados={escolha.spells1} max={preparedCount} onToggle={(n) => mutar((c) => { const i = c.spells1.indexOf(n); if (i >= 0) c.spells1.splice(i, 1); else if (c.spells1.length < preparedCount) c.spells1.push(n); })} />
        <div className="contador">{escolha.spells1.length}/{preparedCount} escolhidas</div>
      </div>

      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}

function ClerigoDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const preparedCount = classe.preparedCount ?? 0;
  const cantripsMax = clerigoCantripsEfetivo(classe, escolha);
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={2} escolha={escolha} mutar={mutar} campo="skills" />

      <div id="grp-1-ordem">
        <h3>Ordem Divina (escolha 1)</h3>
        <OpcaoUnica opcoes={classe.ordemDivina!} selecionado={escolha.ordem} onEscolher={(nome) => mutar((c) => { c.ordem = nome; })} />
      </div>

      <div id="grp-1-cantrips">
        <h3>Truques da Classe (escolha {cantripsMax}, da lista de Clérigo)</h3>
        <ListaEscolha itens={classe.cantrips!} selecionados={escolha.cantrips} max={cantripsMax} onToggle={(n) => mutar((c) => { const i = c.cantrips.indexOf(n); if (i >= 0) c.cantrips.splice(i, 1); else if (c.cantrips.length < cantripsMax) c.cantrips.push(n); })} />
        <div className="contador">{escolha.cantrips.length}/{cantripsMax} escolhidos</div>
      </div>

      <div id="grp-1-spells1">
        <h3>Magias Preparadas de 1º Círculo (escolha {preparedCount}, da lista de Clérigo)</h3>
        <ListaEscolha itens={classe.spells1!} selecionados={escolha.spells1} max={preparedCount} onToggle={(n) => mutar((c) => { const i = c.spells1.indexOf(n); if (i >= 0) c.spells1.splice(i, 1); else if (c.spells1.length < preparedCount) c.spells1.push(n); })} />
        <div className="contador">{escolha.spells1.length}/{preparedCount} escolhidas</div>
      </div>

      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}

function GuerreiroDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  const maestriaCount = classe.maestriaCount ?? 0;
  const candidatos = Object.entries(ruleset.maestriaDeArmas) as [string, ArmaMaestria][];
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={2} escolha={escolha} mutar={mutar} campo="skills" />

      <div id="grp-1-estilo">
        <h3>Estilo de Luta (escolha 1 talento)</h3>
        <OpcaoUnica opcoes={classe.estiloDeLuta!} selecionado={escolha.estilo} onEscolher={(nome) => mutar((c) => { c.estilo = nome; })} />
      </div>

      <MaestriaPicker candidatos={candidatos} count={maestriaCount} selecionadas={escolha.maestria} propriedades={ruleset.propriedadesDeMaestria} onToggle={(n) => mutar((c) => { const i = c.maestria.indexOf(n); if (i >= 0) c.maestria.splice(i, 1); else if (c.maestria.length < maestriaCount) c.maestria.push(n); })} />

      <Texto titulo="Recuperar Fôlego" texto={classe.recuperarFolego} />
      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}

function LadinoDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  const skillsCount = classe.skillsCount ?? 0;
  const especialistaCount = classe.especialistaCount ?? 0;
  const maestriaCount = classe.maestriaCount ?? 0;
  const jaProficiente = [...new Set(escolha.skills)];
  const candidatos = Object.entries(ruleset.maestriaDeArmas).filter(
    ([, w]) => w.categoria === "Simples" || w.propriedades.includes("Acuidade") || w.propriedades.includes("Leve")
  ) as [string, ArmaMaestria][];
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={skillsCount} escolha={escolha} mutar={mutar} campo="skills" />
      <Texto titulo="Ataque Furtivo" texto={classe.ataqueFurtivo} />

      <div id="grp-1-especialista">
        <h3>Especialista (escolha {especialistaCount} perícias já proficientes)</h3>
        <p className="intro">Dobra o bônus de proficiência nessas perícias. Só entre as que você já tem (por enquanto, só as da classe — antecedente/Habilidoso ainda não entram nesse cruzamento nesta sub-entrega).</p>
        {jaProficiente.length === 0 ? (
          <p className="intro">Escolha primeiro suas perícias acima.</p>
        ) : (
          <ListaEscolha itens={jaProficiente} selecionados={escolha.especialista} max={especialistaCount} onToggle={(n) => mutar((c) => { const i = c.especialista.indexOf(n); if (i >= 0) c.especialista.splice(i, 1); else if (c.especialista.length < especialistaCount) c.especialista.push(n); })} />
        )}
        <div className="contador">{escolha.especialista.length}/{especialistaCount} escolhidas</div>
      </div>

      <Texto titulo="Gíria do Ladrão" texto={classe.giriaDoLadrao} />
      <MaestriaPicker candidatos={candidatos} count={maestriaCount} selecionadas={escolha.maestria} propriedades={ruleset.propriedadesDeMaestria} onToggle={(n) => mutar((c) => { const i = c.maestria.indexOf(n); if (i >= 0) c.maestria.splice(i, 1); else if (c.maestria.length < maestriaCount) c.maestria.push(n); })} />

      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}

function DruidaDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const preparedCount = classe.preparedCount ?? 0;
  const cantripsMax = druidaCantripsEfetivo(classe, escolha);
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={2} escolha={escolha} mutar={mutar} campo="skills" />
      <Texto titulo="Idioma Druídico" texto={classe.idiomaDruidico} />

      <div id="grp-1-ordem">
        <h3>Ordem Primal (escolha 1)</h3>
        <OpcaoUnica opcoes={classe.ordemPrimal!} selecionado={escolha.ordem} onEscolher={(nome) => mutar((c) => { c.ordem = nome; })} />
      </div>

      <div id="grp-1-cantrips">
        <h3>Truques da Classe (escolha {cantripsMax}, da lista de Druida)</h3>
        <ListaEscolha itens={classe.cantrips!} selecionados={escolha.cantrips} max={cantripsMax} onToggle={(n) => mutar((c) => { const i = c.cantrips.indexOf(n); if (i >= 0) c.cantrips.splice(i, 1); else if (c.cantrips.length < cantripsMax) c.cantrips.push(n); })} />
        <div className="contador">{escolha.cantrips.length}/{cantripsMax} escolhidos</div>
      </div>

      <div id="grp-1-spells1">
        <h3>Magias Preparadas de 1º Círculo (escolha {preparedCount}, da lista de Druida)</h3>
        <p className="intro">Falar com Animais fica marcada com ⚠️ se escolhida aqui — você já tem ela sempre preparada de graça pelo Idioma Druídico.</p>
        <ListaEscolha itens={classe.spells1!} selecionados={escolha.spells1} max={preparedCount} excluir={["Falar com Animais"]} onToggle={(n) => mutar((c) => { const i = c.spells1.indexOf(n); if (i >= 0) c.spells1.splice(i, 1); else if (c.spells1.length < preparedCount) c.spells1.push(n); })} />
        <div className="contador">{escolha.spells1.length}/{preparedCount} escolhidas</div>
      </div>

      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}

function FeiticeiroDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const cantripsCount = classe.cantripsCount ?? 2;
  const preparedCount = classe.preparedCount ?? 0;
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={2} escolha={escolha} mutar={mutar} campo="skills" />

      <div id="grp-1-cantrips">
        <h3>Truques da Classe (escolha {cantripsCount}, da lista de Feiticeiro)</h3>
        <ListaEscolha itens={classe.cantrips!} selecionados={escolha.cantrips} max={cantripsCount} onToggle={(n) => mutar((c) => { const i = c.cantrips.indexOf(n); if (i >= 0) c.cantrips.splice(i, 1); else if (c.cantrips.length < cantripsCount) c.cantrips.push(n); })} />
        <div className="contador">{escolha.cantrips.length}/{cantripsCount} escolhidos</div>
      </div>

      <Texto titulo="Feitiçaria Inata" texto={classe.feiticariaInata} />

      <div id="grp-1-spells1">
        <h3>Magias Preparadas de 1º Círculo (escolha {preparedCount}, da lista de Feiticeiro)</h3>
        <ListaEscolha itens={classe.spells1!} selecionados={escolha.spells1} max={preparedCount} onToggle={(n) => mutar((c) => { const i = c.spells1.indexOf(n); if (i >= 0) c.spells1.splice(i, 1); else if (c.spells1.length < preparedCount) c.spells1.push(n); })} />
        <div className="contador">{escolha.spells1.length}/{preparedCount} escolhidas</div>
      </div>

      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}

function MongeDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  const resolver = (itens: string[]) => itens.map((item) => (item === "Ferramenta/Instrumento escolhido" ? escolha.toolChoice || item : item));
  const opcoesFerramenta = escolha.toolCategory === "Instrumento Musical" ? ruleset.todosOsInstrumentos : ruleset.todasAsFerramentasDeArtesao;
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={2} escolha={escolha} mutar={mutar} campo="skills" />
      <Texto titulo="Artes Marciais" texto={classe.artesMarciais} />
      <Texto titulo="Defesa sem Armadura" texto={classe.defesaSemArmadura} />

      <div id="grp-1-toolcategory">
        <h3>Ferramenta ou Instrumento — escolha 1 categoria</h3>
        <div className="check-list">
          {classe.toolCategories!.map((cat) => (
            <button key={cat} type="button" className={`check-pill${escolha.toolCategory === cat ? " selected" : ""}`} onClick={() => mutar((c) => { c.toolCategory = cat; c.toolChoice = null; })}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {escolha.toolCategory && (
        <div id="grp-1-toolchoice">
          <h3>{escolha.toolCategory} — escolha 1</h3>
          <div className="check-list">
            {opcoesFerramenta.map((t) => (
              <button key={t} type="button" className={`check-pill${escolha.toolChoice === t ? " selected" : ""}`} onClick={() => mutar((c) => { c.toolChoice = t; })}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} resolver={resolver} />
    </>
  );
}

function GuardiaoDetalhe({ classe, escolha, mutar }: PropsClasse) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  const skillsCount = classe.skillsCount ?? 0;
  const preparedCount = classe.preparedCount ?? 0;
  const maestriaCount = classe.maestriaCount ?? 0;
  const candidatos = Object.entries(ruleset.maestriaDeArmas) as [string, ArmaMaestria][];
  return (
    <>
      <PericiaPicker opcoes={classe.skills!} count={skillsCount} escolha={escolha} mutar={mutar} campo="skills" />
      <Texto titulo="Inimigo Favorito" texto={classe.inimigoFavorito} />

      <div id="grp-1-spells1">
        <h3>Magias Preparadas de 1º Círculo (escolha {preparedCount}, da lista de Guardião)</h3>
        <p className="intro">Sem truques no nível 1. Marca do Predador fica marcada com ⚠️ se escolhida aqui — você já tem ela de graça pelo Inimigo Favorito.</p>
        <ListaEscolha itens={classe.spells1!} selecionados={escolha.spells1} max={preparedCount} excluir={["Marca do Predador"]} onToggle={(n) => mutar((c) => { const i = c.spells1.indexOf(n); if (i >= 0) c.spells1.splice(i, 1); else if (c.spells1.length < preparedCount) c.spells1.push(n); })} />
        <div className="contador">{escolha.spells1.length}/{preparedCount} escolhidas</div>
      </div>

      <MaestriaPicker candidatos={candidatos} count={maestriaCount} selecionadas={escolha.maestria} propriedades={ruleset.propriedadesDeMaestria} onToggle={(n) => mutar((c) => { const i = c.maestria.indexOf(n); if (i >= 0) c.maestria.splice(i, 1); else if (c.maestria.length < maestriaCount) c.maestria.push(n); })} />

      <EquipamentoPicker classe={classe} escolha={escolha} mutar={mutar} />
    </>
  );
}
