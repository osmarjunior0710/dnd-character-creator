import { useState } from "react";
import { Link } from "react-router-dom";
import { WizardProvider, useWizard, antecedenteEscolhaVazia, especieEscolhaVazia, classeEscolhaVazia } from "./WizardContext";
import { useRuleset } from "../ruleset/RulesetContext";
import { ClasseGrid } from "./steps/ClasseGrid";
import { ClasseDetalhe } from "./steps/ClasseDetalhe";
import { AntecedenteGrid } from "./steps/AntecedenteGrid";
import { AntecedenteDetalhe } from "./steps/AntecedenteDetalhe";
import { EspecieGrid } from "./steps/EspecieGrid";
import { EspecieDetalhe } from "./steps/EspecieDetalhe";
import { IdiomasStep } from "./steps/IdiomasStep";
import { AtributosStep } from "./steps/AtributosStep";
import { AlinhamentoStep } from "./steps/AlinhamentoStep";
import { LojaStep } from "./steps/LojaStep";
import { antecedenteDetalheCompleto, especieDetalheCompleto, classeDetalheCompleto, idiomasCompleto, atributosCompleto, alinhamentoCompleto } from "./validacao";
import { useStrings } from "../i18n/context";

// Ordem igual o vanilla: Classe, Antecedente, Espécie, Idiomas, Atributos,
// Alinhamento, Loja, Resumo — só falta o Resumo (com wiring de storage de
// verdade), que fica pra Entrega 5e. A numeração interna aqui é só desta
// sub-entrega. Loja nunca bloqueia "Avançar" — comprar é opcional, igual
// o vanilla (findFirstMissingGroup() não tem case pra ela).
const PASSOS = [
  "classe-grade", "classe-detalhe",
  "antecedente-grade", "antecedente-detalhe",
  "especie-grade", "especie-detalhe",
  "idiomas", "atributos", "alinhamento", "loja",
] as const;

function passoEstaCompleto(passo: (typeof PASSOS)[number], ctx: ReturnType<typeof useWizardEstado>): boolean {
  if (!ctx.ruleset) return false;
  if (passo === "classe-grade") return ctx.dados.classe !== null;
  if (passo === "classe-detalhe") {
    if (!ctx.dados.classe) return false;
    const classe = ctx.ruleset.classes[ctx.dados.classe];
    const escolha = ctx.dados.classes[ctx.dados.classe] || classeEscolhaVazia();
    return classeDetalheCompleto(ctx.dados.classe, classe, escolha);
  }
  if (passo === "antecedente-grade") return ctx.dados.antecedente !== null;
  if (passo === "antecedente-detalhe") {
    if (!ctx.dados.antecedente) return false;
    const bg = ctx.ruleset.antecedentes[ctx.dados.antecedente];
    const escolha = ctx.dados.antecedentes[ctx.dados.antecedente] || antecedenteEscolhaVazia();
    return antecedenteDetalheCompleto(bg, escolha);
  }
  if (passo === "especie-grade") return ctx.dados.especie !== null;
  if (passo === "especie-detalhe") {
    if (!ctx.dados.especie) return false;
    const especie = ctx.ruleset.especies[ctx.dados.especie];
    const escolha = ctx.dados.especies[ctx.dados.especie] || especieEscolhaVazia();
    return especieDetalheCompleto(ctx.dados.especie, especie, escolha);
  }
  if (passo === "idiomas") return idiomasCompleto(ctx.dados.classe, ctx.dados.idiomas);
  if (passo === "atributos") return atributosCompleto(ctx.ruleset.atributosDoJogo, ctx.dados.attrs);
  if (passo === "alinhamento") return alinhamentoCompleto(ctx.dados.alinhamento);
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

  const passo = PASSOS[passoIdx]!;
  const completo = passoEstaCompleto(passo, ctx);

  return (
    <div className="tela-wizard">
      <div className="progresso-wizard">
        {PASSOS.map((_, i) => (
          <div key={i} className={`seg${i < passoIdx ? " done" : ""}${i === passoIdx ? " current" : ""}`} />
        ))}
      </div>
      <div className="conteudo-wizard">
        {passo === "classe-grade" && <ClasseGrid />}
        {passo === "classe-detalhe" && <ClasseDetalhe />}
        {passo === "antecedente-grade" && <AntecedenteGrid />}
        {passo === "antecedente-detalhe" && <AntecedenteDetalhe />}
        {passo === "especie-grade" && <EspecieGrid />}
        {passo === "especie-detalhe" && <EspecieDetalhe />}
        {passo === "idiomas" && <IdiomasStep />}
        {passo === "atributos" && <AtributosStep />}
        {passo === "alinhamento" && <AlinhamentoStep />}
        {passo === "loja" && <LojaStep />}
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
 * enquanto Antecedente + Espécie; Entrega 5c continua a partir daqui). */
export function WizardShell() {
  return (
    <WizardProvider>
      <WizardConteudo />
    </WizardProvider>
  );
}
