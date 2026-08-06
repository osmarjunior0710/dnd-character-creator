const MAGO = {
  skills: ["Arcanismo","História","Intuição","Investigação","Medicina","Natureza","Religião"],
  weaponProf: ["simples"],
  armorProf: [],
  savingThrows: ["Inteligência","Sabedoria"],
  equipmentA: ["2 Adagas", "Foco Arcano (Cajado)", "Kit de Erudito", "Livro de Magias", "Túnica"],
  equipmentA_gold: 5,
  equipmentB_gold: 55,
  /* Truques e magias de 1º círculo da lista de Mago, extraídos da planilha
     Magias_PHB2024_Completo (coluna "Mago"=Sim), não do PDF. */
  cantripsCount: 3,
  cantrips: ["Amigos","Badalar Fúnebre","Bolha Ácida","Elementalismo","Golpe Certeiro","Ilusão Menor","Luz","Luzes Dançantes","Mensagem","Mãos Mágicas","Prestidigitação Arcana","Proteção Contra Lâminas","Raio de Fogo","Raio de Gelo","Rajada de Veneno","Reparar","Talho Mental","Toque Chocante","Toque Necrótico","Trovão"],
  /* Diferente de Bruxo/Bardo, o Mago tem DOIS níveis de escolha: primeiro
     o Livro de Magias (6 magias de 1º círculo, seu "estoque" de magias
     conhecidas), depois as Magias Preparadas (4, um SUBCONJUNTO do livro —
     as que ele pode conjurar sem reler o livro até trocar de novo). */
  spellbookCount: 6,
  preparedCount: 4,
  spells1: ["Alarme","Armadura Arcana","Compreender Idiomas","Convocar Familiar","Detectar Magia","Disco Flutuante de Tenser","Disfarçar-se","Enfeitiçar Pessoa","Escrita Ilusória","Escudo Arcano","Faca de Gelo","Gargalhada Nefasta de Tasha","Graxa","Identificar","Imagem Silenciosa","Leque Cromático","Mãos Flamejantes","Mísseis Mágicos","Névoa Obscurecente","Onda Trovejante","Orbe Cromático","Passos Largos","Proteção Contra o Bem e o Mal","Queda Suave","Raio Nauseante","Raio de Bruxa","Retirada Acelerada","Salto","Servo Invisível","Sono","Vitalidade Vazia"],
  /* Adepto de Ritual e Recuperação Arcana não têm escolha do jogador no
     nível 1 — só texto informativo, sem grupo de seleção. */
  adeptoRitual: "Você pode conjurar como Ritual qualquer magia com o marcador Ritual que esteja no seu livro de magias, sem precisar tê-la preparada — só precisa ler o livro nesse momento.",
  recuperacaoArcana: "Ao completar um Descanso Curto (1x por Descanso Longo), você pode recuperar espaços de magia gastos, com círculo combinado de até metade do seu nível de Mago (arredondado pra cima), nenhum de 6º círculo ou superior."
};
