import { useState } from "react";
import { Link } from "react-router-dom";
import { WizardProvider, useWizard, useAntecedenteAtivo, antecedenteEscolhaVazia } from "./WizardContext";
import { useRuleset } from "../ruleset/RulesetContext";
import { AntecedenteGrid } from "./steps/AntecedenteGrid";
import { AntecedenteDetalhe } from "./steps/AntecedenteDetalhe";
import { antecedenteDetalheCompleto } from "./validacao";
import { useStrings } from "../i18n/context";

// Só 2 passos por enquanto (grade + detalhe de Antecedente) — a Entrega 5c
// adiciona Classe antes destes dois (ordem final do wizard: Classe,
// Antecedente, Espécie, Idiomas, Atributos, Alinhamento, Loja, Resumo,
// igual o vanilla). A numeração interna aqui é só desta sub-entrega.
const PASSOS = ["antecedente-grade", "antecedente-detalhe"] as const;

function passoEstaCompleto(passo: (typeof PASSOS)[number], ctx: ReturnType<typeof useWizardEstado>): boolean {
  if (passo === "antecedente-grade") return ctx.dados.antecedente !== null;
  if (passo === "antecedente-detalhe") {
    if (!ctx.ruleset || !ctx.dados.antecedente) return false;
    const bg = ctx.ruleset.antecedentes[ctx.dados.antecedente];
    const escolha = ctx.dados.antecedentes[ctx.dados.antecedente] || antecedenteEscolhaVazia();
    return antecedenteDetalheCompleto(bg, escolha);
  }
  return true;
}

function useWizardEstado() {
  const { dados } = useWizard();
  const { dados: ruleset } = useRuleset();
  return { dados, ruleset };
}

function WizardConteudo() {
  const strings = useStrings();
  const [passoIdx, setPassoIdx] = useState(0);
  const ctx = useWizardEstado();
  useAntecedenteAtivo(); // garante que a leitura reativa dispara re-render ao mutar

  const passo = PASSOS[passoIdx];
  const completo = passoEstaCompleto(passo, ctx);

  return (
    <div className="tela-wizard">
      <div className="progresso-wizard">
        {PASSOS.map((_, i) => (
          <div key={i} className={`seg${i < passoIdx ? " done" : ""}${i === passoIdx ? " current" : ""}`} />
        ))}
      </div>
      <div className="conteudo-wizard">
        {passo === "antecedente-grade" && <AntecedenteGrid />}
        {passo === "antecedente-detalhe" && <AntecedenteDetalhe />}
      </div>
      <div className="nav-wizard">
        {passoIdx > 0 ? (
          <button type="button" className="btn" onClick={() => setPassoIdx((i) => i - 1)}>
            {strings.wizard.voltar}
          </button>
        ) : (
          <Link to="/" className="btn">
            {strings.comum.voltarParaHome}
          </Link>
        )}
        <button
          type="button"
          className="btn primary"
          disabled={!completo}
          onClick={() => setPassoIdx((i) => Math.min(i + 1, PASSOS.length - 1))}
        >
          {strings.wizard.avancar}
        </button>
      </div>
    </div>
  );
}

/** Rota /novo — wizard de criação, agora com passos de verdade (por
 * enquanto só Antecedente; Entrega 5c continua a partir daqui). */
export function WizardShell() {
  return (
    <WizardProvider>
      <WizardConteudo />
    </WizardProvider>
  );
}
