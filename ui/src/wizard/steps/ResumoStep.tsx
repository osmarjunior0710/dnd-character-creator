import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { novaFicha } from "@core/ficha/schema.ts";
import { salvarFicha } from "@core/armazenamento/armazenamento.ts";
import { useRuleset } from "../../ruleset/RulesetContext";
import { useWizard } from "../WizardContext";
import { calcularFichaCompleta, type FichaCalculada } from "../fichaUtil";

function fmt(n: number): string {
  return (n >= 0 ? "+" : "") + n;
}
function fmtGold(n: number): string {
  return (Math.round(n * 100) / 100).toString().replace(".", ",");
}

/** Passo final — Resumo (equivalente a computeCharacterSheet()+renderSummary(),
 * js/07-compute-and-summary.js) + "Salvar Personagem" de verdade, ligando
 * o wizard na camada de armazenamento (core/armazenamento, Entrega 3) pela
 * primeira vez. Simplificações registradas em fichaUtil.ts (sem aviso de
 * Duplicidade, sem popup ⓘ de breakdown, sem botão manual de Equipar
 * Armadura/Escudo) — o que está aqui é o número final certo, só a camada
 * de polish/edição fica pra depois. */
export function ResumoStep() {
  const { dados: ruleset } = useRuleset();
  const { dados, definir } = useWizard();
  const navigate = useNavigate();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!ruleset || !dados.classe || !dados.antecedente || !dados.especie) return null;

  const ficha = calcularFichaCompleta(ruleset, dados);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      const nova = novaFicha("dnd2024", dados as unknown as Record<string, unknown>);
      const id = await salvarFicha(nova, {
        resumo: { nome: dados.characterName || "(sem nome)", classe: dados.classe, antecedente: dados.antecedente, especie: dados.especie, nivel: 1 },
      });
      navigate(`/personagem/${id}/perfil`);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
      setSalvando(false);
    }
  }

  return (
    <section className="tela-resumo">
      <h2>Resumo</h2>

      <label className="rotulo-pequeno">
        Nome do Personagem
        <input
          type="text"
          value={dados.characterName}
          onChange={(e) => definir((r) => { r.characterName = e.target.value; })}
          placeholder="(opcional)"
        />
      </label>

      <p className="intro">
        {ficha.identidade.classe} 1 · {ficha.identidade.antecedente} · {ficha.identidade.especie} · {ficha.identidade.alinhamento} ·
        Bônus de Proficiência {fmt(ficha.identidade.profBonus)}
      </p>

      <GruposDeAtributo ficha={ficha} atributosDoJogo={ruleset.atributosDoJogo} />
      <p className="contador">Percepção Passiva: {ficha.passivePerception}</p>

      <h3>Combate</h3>
      <p className="intro">
        PV {ficha.hp.valor} (1d{ficha.hp.breakdown[0]!.value}) · CA {ficha.ac.valor} ({ficha.ac.fonte}) ·
        Iniciativa {fmt(ficha.initiative)}{ficha.initiativeAlerta ? " (com Alerta)" : ""} · Deslocamento {ficha.deslocamento}
        {ficha.visaoNoEscuro ? ` · Visão no Escuro ${ficha.visaoNoEscuro}` : ""}
      </p>

      {ficha.attacks.length > 0 && (
        <>
          <h3>Ataques</h3>
          <div className="check-list">
            {ficha.attacks.map((a) => (
              <div key={a.nome} className="opcao-equipamento">
                <b>{a.nome}</b>: {fmt(a.bonus)} pra acertar, {a.dano}{!a.proficiente && " (sem proficiência)"}
              </div>
            ))}
          </div>
        </>
      )}

      {ficha.spellcasting && (
        <>
          <h3>Conjuração ({ficha.spellcasting.atributo})</h3>
          <p className="intro">CD {ficha.spellcasting.cd} · Ataque Mágico {fmt(ficha.spellcasting.ataque)}</p>
          {ficha.spellcasting.truques.length > 0 && (
            <p className="contador">Truques: {ficha.spellcasting.truques.map((t) => t.nome).join(", ")}</p>
          )}
          {ficha.spellcasting.magias.length > 0 && (
            <p className="contador">Magias: {ficha.spellcasting.magias.map((m) => m.nome).join(", ")}</p>
          )}
        </>
      )}

      {ficha.especieMagias.length > 0 && (
        <p className="contador">Concedido pela Espécie: {ficha.especieMagias.map((e) => e.nome).join(", ")}</p>
      )}

      <h3>Proficiências e Idiomas</h3>
      <p className="intro">
        Armas: {ficha.proficiencias.armas}
        <br />
        Armaduras: {ficha.proficiencias.armaduras}
        <br />
        Ferramentas: {ficha.proficiencias.ferramentas.join(", ") || "Nenhuma"}
        <br />
        Idiomas: {ficha.proficiencias.idiomas.join(", ")}
      </p>

      <h3>Equipamento</h3>
      <div className="check-list">
        {ficha.equipamento.itens.map((it) => (
          <div key={it.id ?? it.label} className="check-pill selected">
            {it.label}{it.qty > 1 ? ` ×${it.qty}` : ""}
          </div>
        ))}
      </div>
      <p className="contador">Dinheiro restante: {fmtGold(ficha.equipamento.poRestante)} PO</p>

      {erro && <p className="nota-erro">Erro ao salvar: {erro}</p>}
      <div className="resumo-salvar">
        <button type="button" className="btn primary" disabled={salvando} onClick={salvar}>
          {salvando ? "Salvando…" : "Salvar Personagem"}
        </button>
      </div>
    </section>
  );
}

function GruposDeAtributo({ ficha, atributosDoJogo }: { ficha: FichaCalculada; atributosDoJogo: string[] }) {
  return (
    <>
      {atributosDoJogo.map((ability) => {
        const attr = ficha.attrs.find((a) => a.atributo === ability)!;
        const save = ficha.savingThrows.find((s) => s.atributo === ability)!;
        const skillsForAbility = ficha.skills.filter((s) => s.atributo === ability);
        return (
          <div key={ability} className="attr-group">
            <div className="rotulo-grupo">{ability} {attr.valor} ({fmt(attr.mod)})</div>
            <div className="stat-grid">
              <div className={`stat-row${save.proficiente ? " prof" : ""}`}>
                <span>{save.proficiente ? "●" : "○"} Salvaguarda</span>
                <span>{fmt(save.bonus)}</span>
              </div>
              {skillsForAbility.map((s) => (
                <div key={s.pericia} className={`stat-row${s.proficiente ? " prof" : ""}`}>
                  <span>{s.especialista ? "◆" : s.proficiente ? "●" : "○"} {s.pericia}</span>
                  <span>{fmt(s.bonus)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
