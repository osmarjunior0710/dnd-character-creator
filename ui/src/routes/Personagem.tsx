import { NavLink, Outlet, useParams } from "react-router-dom";
import { useStrings } from "../i18n/context";

/** Layout da tela de personagem — as 4 abas fixas da Fase 2 (Perfil,
 * Mochila, Magias, Play), navegáveis por tab bar inferior. O swipe
 * horizontal entre abas é trabalho de UI da Fase 2 (cuidado técnico já
 * registrado no handoff: não pode conflitar com scroll/carrossel interno
 * de alguma aba) — esta entrega só garante que a rota/estrutura existe,
 * sem implementar o gesto. Nenhuma aba tem conteúdo real ainda: isso é
 * Fase 2 inteira, fora do escopo da Fase 1. */
export function PersonagemLayout() {
  const strings = useStrings();
  const { id } = useParams();
  return (
    <div className="tela-personagem">
      <Outlet />
      <nav className="tab-bar-inferior">
        <NavLink to={`/personagem/${id}/perfil`}>{strings.personagem.abaPerfil}</NavLink>
        <NavLink to={`/personagem/${id}/mochila`}>{strings.personagem.abaMochila}</NavLink>
        <NavLink to={`/personagem/${id}/magias`}>{strings.personagem.abaMagias}</NavLink>
        <NavLink to={`/personagem/${id}/play`}>{strings.personagem.abaPlay}</NavLink>
      </nav>
    </div>
  );
}

export function AbaPersonagemPlaceholder() {
  const strings = useStrings();
  return <p className="aba-em-construcao">{strings.personagem.emConstrucao}</p>;
}
