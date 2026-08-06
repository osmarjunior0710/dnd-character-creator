const PSIONICO = {
  skills: ["Arcanismo","Intuição","Intimidação","Investigação","Medicina","Percepção","Persuasão"],
  weaponProf: ["simples"],
  armorProf: [],
  savingThrows: ["Inteligência","Sabedoria"],
  equipmentA: ["Lança", "2 Adagas", "Besta Leve", "20 Virotes", "Estojo", "Mochila de Explorador de Masmorras"],
  equipmentA_gold: 6,
  equipmentB_gold: 50,
  /* Truques e magias de 1º círculo da lista de Psiônico. NOMES
     PADRONIZADOS pela coluna "Psiônico" da planilha oficial de magias
     (D_D_5_5_-_Magias_e_Talentos.xlsx), não pelo texto literal do PDF do
     UA — a tradução do UA (Canal do Condado) usa nomes ligeiramente
     diferentes pra magias que já existem no PHB com outro nome oficial
     (ex: UA diz "Amizade", "Prestidigitação" e "Sifão de Vida"; a
     planilha oficial usa "Amigos", "Prestidigitação Arcana" e "Sifão
     Vital" pras MESMAS magias — são a mesma coisa, só tradução
     divergente entre as duas fontes). Sempre conferir contra a coluna
     "Psiônico" da planilha ao adicionar/revisar magias desta classe. */
  cantripsCount: 2,
  cantrips: ["Amigos","Arremesso Telecinético","Golpe Certeiro","Ilusão Menor","Luz","Luzes Dançantes","Mãos Mágicas","Mensagem","Prestidigitação Arcana","Proteção Contra Lâminas","Reparar","Talho Mental"],
  preparedCount: 4,
  spells1: ["Amizade Animal","Armadura Arcana","Comando","Compreender Idiomas","Detectar Magia","Disco Flutuante de Tenser","Enfeitiçar Pessoa","Escudo Arcano","Falar com Animais","Gargalhada Nefasta de Tasha","Identificar","Imagem Silenciosa","Onda Trovejante","Passos Largos","Queda Suave","Sifão Vital","Sono","Sussurros Dissonantes"],
  /* Poder Psiônico e Telecinese Sutil não têm escolha do jogador no
     nível 1 (recursos automáticos) — só texto informativo. */
  poderPsionico: "Você tem 4 Dados de Energia Psiônica (d6), recuperando 1 ao completar um Descanso Curto e todos ao completar um Descanso Longo. Alimentam dois recursos: Impulso Telecinético (Ação Bônus: empurra/puxa 1,5m uma criatura Grande ou menor a até 9m que falhe numa salvaguarda de Força; ou role um dado de Energia Psiônica e empurre/puxe 5x o valor rolado — o dado só é gasto se o alvo falhar) e Conexão Telepática (telepatia com alcance de 9m; Ação Bônus: gaste um dado de Energia Psiônica pra aumentar o alcance em 3x o valor rolado por 1 hora — a primeira vez após um Descanso Longo é grátis).",
  telecineseSutil: "Você conhece o truque Mão Mágica, pode conjurá-lo sem componentes somáticos e pode tornar a mão espectral invisível."
};
