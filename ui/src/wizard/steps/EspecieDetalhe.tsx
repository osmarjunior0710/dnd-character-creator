import { useRuleset, type EspecieConst, type OpcaoDeSubespecie, type TracoFixo } from "../../ruleset/RulesetContext";
import { useWizard, useEspecieAtiva, type EspecieEscolha } from "../WizardContext";

/** Dispatcher por espécie — mesmo padrão do vanilla (10 telas, uma função
 * por espécie), porque cada uma tem uma combinação diferente de escolhas
 * (Pequenino/Anão/Orc não têm nenhuma; Humano tem 3 campos; Tiferino tem
 * 3 campos de tipo diferente). Tentar generalizar isso numa função só, do
 * jeito que deu certo pro Antecedente, produziria um `if` gigante pior que
 * 10 componentes pequenos — decisão consciente, mesmo espírito da nota em
 * js/00-notes-and-state.js sobre não forçar generalização sem padrão real. */
export function EspecieDetalhe() {
  const { dados: ruleset } = useRuleset();
  const { dados } = useWizard();
  const [escolha, mutar] = useEspecieAtiva();

  if (!ruleset || !dados.especie) return null;
  const especie = ruleset.especies[dados.especie];

  switch (dados.especie) {
    case "Pequenino":
    case "Anão":
    case "Orc":
      return <EspecieSemEscolha especie={especie} />;
    case "Humano":
      return <HumanoDetalhe especie={especie} escolha={escolha} mutar={mutar} />;
    case "Draconato":
      return <DraconatoDetalhe especie={especie} escolha={escolha} mutar={mutar} />;
    case "Elfo":
      return <ElfoDetalhe especie={especie} escolha={escolha} mutar={mutar} />;
    case "Gnomo":
      return <GnomoDetalhe especie={especie} escolha={escolha} mutar={mutar} />;
    case "Golias":
      return <GoliasDetalhe especie={especie} escolha={escolha} mutar={mutar} />;
    case "Aasimar":
      return <AasimarDetalhe especie={especie} escolha={escolha} mutar={mutar} />;
    case "Tiferino":
      return <TiferinoDetalhe especie={especie} escolha={escolha} mutar={mutar} />;
    default:
      return null;
  }
}

type Mutar = (mutar: (e: EspecieEscolha) => void) => void;
interface PropsDetalhe {
  especie: EspecieConst;
  escolha: EspecieEscolha;
  mutar: Mutar;
}

function Fatos({ especie }: { especie: EspecieConst }) {
  return (
    <div className="species-facts">
      <div className="fact"><strong>Tipo:</strong> {especie.tipo}</div>
      <div className="fact"><strong>Deslocamento:</strong> {especie.deslocamento}</div>
      {especie.visaoNoEscuro && <div className="fact"><strong>Visão no Escuro:</strong> {especie.visaoNoEscuro}</div>}
    </div>
  );
}

function TracosNatos({ tracos }: { tracos: TracoFixo[] }) {
  return (
    <>
      <h3>Traços Natos</h3>
      {tracos.map((tr) => (
        <div key={tr.nome} className="option-block">
          <h4>{tr.nome}</h4>
          <p>{tr.resumo}</p>
          <ListaConcedida itens={tr.concede} />
        </div>
      ))}
    </>
  );
}

function ListaConcedida({ itens }: { itens: { tipo: string; nome: string }[] }) {
  if (!itens || itens.length === 0) return null;
  return (
    <div className="check-list">
      {itens.map((it) => (
        <span key={it.nome} className="check-pill selected">{it.nome}</span>
      ))}
    </div>
  );
}

/** Mostra as opções de tamanho — se só existe UMA, aparece travada (sem
 * pedir clique); com 2+, vira picker interativo. Mesma regra de
 * tamanhoPickList() no vanilla. */
function TamanhoPicker({ tamanho, valor, onEscolher }: { tamanho: EspecieConst["tamanho"]; valor: string | null; onEscolher?: (s: string) => void }) {
  if (tamanho.opcoes.length === 1) {
    const unica = tamanho.opcoes[0]!;
    return (
      <div className="check-list">
        <span className="check-pill selected">
          {unica} <small>({tamanho.alturas[unica]})</small>
        </span>
      </div>
    );
  }
  return (
    <div className="check-list">
      {tamanho.opcoes.map((s) => (
        <button key={s} type="button" className={`check-pill${valor === s ? " selected" : ""}`} onClick={() => onEscolher?.(s)}>
          {s} <small>({tamanho.alturas[s]})</small>
        </button>
      ))}
    </div>
  );
}

/** Bloco de escolha de subespécie (Legado do Tiferino / Linhagem Élfica) —
 * nivel1 sempre existe, nivel3/nivel5 são opcionais (só Tiferino/Elfo têm). */
function OpcaoDeSubespecieBlock({ opcao, selecionada, onEscolher }: { opcao: OpcaoDeSubespecie; selecionada: boolean; onEscolher: () => void }) {
  return (
    <div className={`option-block${selecionada ? " selected" : ""}`}>
      <h4>{opcao.nome}</h4>
      {opcao.nivel1 && (
        <>
          <div className="rotulo-pequeno">Nível 1</div>
          <p>{opcao.nivel1.resumo}</p>
          <ListaConcedida itens={opcao.nivel1.concede} />
        </>
      )}
      {opcao.nivel3 && (
        <>
          <div className="rotulo-pequeno">Nível 3</div>
          <ListaConcedida itens={opcao.nivel3.concede} />
        </>
      )}
      {opcao.nivel5 && (
        <>
          <div className="rotulo-pequeno">Nível 5</div>
          <ListaConcedida itens={opcao.nivel5.concede} />
        </>
      )}
      <button type="button" className="btn" onClick={onEscolher}>
        {selecionada ? "Selecionado" : "Escolher"}
      </button>
    </div>
  );
}

function EspecieSemEscolha({ especie }: { especie: EspecieConst }) {
  return (
    <section>
      <h2>{especie.nome}</h2>
      <p className="species-flavor">{especie.flavor}</p>
      <Fatos especie={especie} />
      <TamanhoPicker tamanho={especie.tamanho} valor={especie.tamanho.opcoes[0] ?? null} />
      <TracosNatos tracos={especie.tracosFixos} />
    </section>
  );
}

function HumanoDetalhe({ especie, escolha, mutar }: PropsDetalhe) {
  const { dados: ruleset } = useRuleset();
  if (!ruleset) return null;
  return (
    <section>
      <h2>Humano</h2>
      <p className="species-flavor">{especie.flavor}</p>
      <Fatos especie={especie} />
      <div id="grp-5-tamanho">
        <TamanhoPicker tamanho={especie.tamanho} valor={escolha.tamanho} onEscolher={(s) => mutar((e) => { e.tamanho = s; })} />
      </div>
      <TracosNatos tracos={especie.tracosFixos} />
      <div id="grp-5-pericia">
        <h3>Hábil — escolha 1 perícia</h3>
        <div className="check-list">
          {ruleset.todasAsPericias.map((p) => (
            <button key={p} type="button" className={`check-pill${escolha.pericia === p ? " selected" : ""}`} onClick={() => mutar((e) => { e.pericia = p; })}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div id="grp-5-talento">
      <h3>Versátil — escolha 1 talento de Origem</h3>
      <div className="check-list">
        {ruleset.talentosOrigem.map((t) => (
          <button key={t} type="button" className={`check-pill${escolha.talento === t ? " selected" : ""}`} onClick={() => mutar((e) => { e.talento = t; })}>
            {t}
          </button>
        ))}
      </div>
      <p className="intro">Talentos Selvagens (Unearthed Arcana 2025 — não é conteúdo oficial do PHB): o Versátil também permite escolher um destes em vez de um talento de Origem.</p>
      <div className="check-list">
        {ruleset.talentosSelvagens.map((t) => (
          <button key={t} type="button" className={`check-pill${escolha.talento === t ? " selected" : ""}`} onClick={() => mutar((e) => { e.talento = t; })}>
            {t}
          </button>
        ))}
      </div>
      </div>
    </section>
  );
}

function DraconatoDetalhe({ especie, escolha, mutar }: PropsDetalhe) {
  const opcoes = especie.subespecie!.opcoes;
  return (
    <section>
      <h2>Draconato</h2>
      <p className="species-flavor">{especie.flavor}</p>
      <Fatos especie={especie} />
      <TamanhoPicker tamanho={especie.tamanho} valor={especie.tamanho.opcoes[0] ?? null} />
      <div id="grp-5-heranca">
        <h3>{especie.subespecie!.nome}</h3>
        <p className="intro">Define o tipo de dano do seu Ataque de Sopro e da sua Resistência a Dano.</p>
        <div className="choice-grid">
          {opcoes.map((o) => (
            <button key={o.nome} type="button" className={`choice${escolha.heranca === o.nome ? " selected" : ""}`} onClick={() => mutar((e) => { e.heranca = o.nome; })}>
              <strong>{o.nome}</strong>
              <span className="note">{o.tipoDano}</span>
            </button>
          ))}
        </div>
      </div>
      <TracosNatos tracos={especie.tracosFixos} />
    </section>
  );
}

function ElfoDetalhe({ especie, escolha, mutar }: PropsDetalhe) {
  const opcoesLinhagem = especie.subespecie!.opcoes;
  return (
    <section>
      <h2>Elfo</h2>
      <p className="species-flavor">{especie.flavor}</p>
      <Fatos especie={especie} />
      <TamanhoPicker tamanho={especie.tamanho} valor={especie.tamanho.opcoes[0] ?? null} />
      <TracosNatos tracos={especie.tracosFixos} />
      <div id="grp-5-pericia">
        <h3>{especie.sentidosAgucados!.nome} — escolha 1 perícia</h3>
        <div className="check-list">
          {especie.sentidosAgucados!.opcoes.map((p) => (
            <button key={p} type="button" className={`check-pill${escolha.pericia === p ? " selected" : ""}`} onClick={() => mutar((e) => { e.pericia = p; })}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div id="grp-5-linhagem">
        <h3>{especie.subespecie!.nome}</h3>
        {opcoesLinhagem.map((o) => (
          <OpcaoDeSubespecieBlock key={o.nome} opcao={o} selecionada={escolha.linhagem === o.nome} onEscolher={() => mutar((e) => { e.linhagem = o.nome; })} />
        ))}
      </div>
    </section>
  );
}

function GnomoDetalhe({ especie, escolha, mutar }: PropsDetalhe) {
  const opcoes = especie.subespecie!.opcoes;
  return (
    <section>
      <h2>Gnomo</h2>
      <p className="species-flavor">{especie.flavor}</p>
      <Fatos especie={especie} />
      <TamanhoPicker tamanho={especie.tamanho} valor={especie.tamanho.opcoes[0] ?? null} />
      <TracosNatos tracos={especie.tracosFixos} />
      <div id="grp-5-linhagem">
        <h3>{especie.subespecie!.nome}</h3>
        {opcoes.map((o) => (
          <OpcaoDeSubespecieBlock key={o.nome} opcao={o} selecionada={escolha.linhagem === o.nome} onEscolher={() => mutar((e) => { e.linhagem = o.nome; })} />
        ))}
      </div>
      <div id="grp-5-atributo">
        <h3>Atributo de Conjuração da Linhagem</h3>
        <div className="check-list">
          {["Inteligência", "Sabedoria", "Carisma"].map((a) => (
            <button key={a} type="button" className={`check-pill${escolha.atributoLinhagem === a ? " selected" : ""}`} onClick={() => mutar((e) => { e.atributoLinhagem = a; })}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function GoliasDetalhe({ especie, escolha, mutar }: PropsDetalhe) {
  const opcoes = especie.subespecie!.opcoes;
  return (
    <section>
      <h2>Golias</h2>
      <p className="species-flavor">{especie.flavor}</p>
      <Fatos especie={especie} />
      <TamanhoPicker tamanho={especie.tamanho} valor={especie.tamanho.opcoes[0] ?? null} />
      <TracosNatos tracos={especie.tracosFixos} />
      <div id="grp-5-ancestralidade">
        <h3>{especie.subespecie!.nome} — escolha 1</h3>
        {opcoes.map((o) => (
          <OpcaoDeSubespecieBlock key={o.nome} opcao={o} selecionada={escolha.ancestralidade === o.nome} onEscolher={() => mutar((e) => { e.ancestralidade = o.nome; })} />
        ))}
      </div>
    </section>
  );
}

function AasimarDetalhe({ especie, escolha, mutar }: PropsDetalhe) {
  return (
    <section>
      <h2>Aasimar</h2>
      <p className="species-flavor">{especie.flavor}</p>
      <Fatos especie={especie} />
      <div id="grp-5-tamanho">
        <TamanhoPicker tamanho={especie.tamanho} valor={escolha.tamanho} onEscolher={(s) => mutar((e) => { e.tamanho = s; })} />
      </div>
      <TracosNatos tracos={especie.tracosFixos} />
      <h3>
        {especie.revelacaoCelestial!.nome} <small>(nível {especie.revelacaoCelestial!.nivelConcedido}+, escolhida em jogo — não faz parte da ficha inicial)</small>
      </h3>
      <p className="intro">{especie.revelacaoCelestial!.aviso}</p>
      {especie.revelacaoCelestial!.opcoes.map((o) => (
        <div key={o.nome} className="option-block">
          <h4>{o.nome}</h4>
          <p>{o.resumo}</p>
          <ListaConcedida itens={o.concede} />
        </div>
      ))}
    </section>
  );
}

function TiferinoDetalhe({ especie, escolha, mutar }: PropsDetalhe) {
  const opcoes = especie.subespecie!.opcoes;
  return (
    <section>
      <h2>Tiferino</h2>
      <p className="species-flavor">{especie.flavor}</p>
      <Fatos especie={especie} />
      <div id="grp-5-tamanho">
        <TamanhoPicker tamanho={especie.tamanho} valor={escolha.tamanho} onEscolher={(s) => mutar((e) => { e.tamanho = s; })} />
      </div>
      <TracosNatos tracos={especie.tracosFixos} />
      <div id="grp-5-legado">
        <h3>{especie.subespecie!.nome}</h3>
        {opcoes.map((o) => (
          <OpcaoDeSubespecieBlock key={o.nome} opcao={o} selecionada={escolha.legado === o.nome} onEscolher={() => mutar((e) => { e.legado = o.nome; })} />
        ))}
      </div>
      <div id="grp-5-atributo">
        <h3>Atributo de Conjuração do Legado</h3>
        <p className="intro">Usado para a CD/ataque das magias do legado e da Presença Sobrenatural (Taumaturgia).</p>
        <div className="check-list">
          {["Inteligência", "Sabedoria", "Carisma"].map((a) => (
            <button key={a} type="button" className={`check-pill${escolha.atributoLegado === a ? " selected" : ""}`} onClick={() => mutar((e) => { e.atributoLegado = a; })}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
