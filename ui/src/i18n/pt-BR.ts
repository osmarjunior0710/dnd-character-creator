// Dicionário de textos da interface — PT-BR. Nenhuma tela importa este
// arquivo direto (VISAO.md §7: "nenhuma string de UI hardcoded em
// componente"); todo componente usa o hook useStrings() de ./context.tsx,
// que hoje sempre devolve este dicionário mas já deixa o lugar certo pra
// um segundo idioma entrar depois sem reestruturar componente nenhum.
export const ptBR = {
  splash: {
    carregando: "Carregando…",
  },
  home: {
    titulo: "D&D Character Creator",
    novoPersonagem: "Novo personagem",
    carregarPersonagem: "Carregar personagem",
    ferramentasDeMestre: "Ferramentas de mestre",
    emBreve: "Em breve",
  },
  carregarPersonagem: {
    titulo: "Carregar personagem",
    vazio: "Nenhuma ficha salva ainda.",
    emConstrucao: "Esta tela ainda não está pronta — volta na Entrega 5e.",
  },
  personagem: {
    abaPerfil: "Perfil",
    abaMochila: "Mochila",
    abaMagias: "Magias",
    abaPlay: "Play",
    emConstrucao: "Esta aba é da Fase 2 — ainda não implementada.",
  },
  wizard: {
    titulo: "Criar personagem",
    emConstrucao: "O assistente de criação de personagem ainda está sendo portado pra cá.",
    avancar: "Avançar",
    voltar: "Voltar",
  },
  comum: {
    voltarParaHome: "Voltar para o início",
  },
} as const;

export type Strings = typeof ptBR;
