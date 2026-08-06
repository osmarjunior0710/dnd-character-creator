const FEITICEIRO = {
  skills: ["Arcanismo","Enganação","Intimidação","Intuição","Persuasão","Religião"],
  weaponProf: ["simples"],
  armorProf: [],
  savingThrows: ["Constituição","Carisma"],
  equipmentA: ["Lança", "2 Adagas", "Foco Arcano (cristal)", "Kit de Explorador de Masmorras"],
  equipmentA_gold: 28,
  equipmentB_gold: 50,
  /* Truques e magias de 1º círculo da lista de Feiticeiro, extraídos da
     planilha Magias_PHB2024_Completo (coluna "Feiticeiro"=Sim), não do PDF. */
  cantripsCount: 4,
  cantrips: ["Amigos","Bolha Ácida","Elementalismo","Explosão Elemental","Golpe Certeiro","Ilusão Menor","Luz","Luzes Dançantes","Mensagem","Mãos Mágicas","Prestidigitação Arcana","Proteção Contra Lâminas","Raio de Fogo","Raio de Gelo","Rajada de Veneno","Reparar","Talho Mental","Toque Chocante","Toque Necrótico","Trovão"],
  preparedCount: 2,
  spells1: ["Armadura Arcana","Compreender Idiomas","Detectar Magia","Disfarçar-se","Enfeitiçar Pessoa","Escudo Arcano","Faca de Gelo","Graxa","Imagem Silenciosa","Leque Cromático","Mãos Flamejantes","Mísseis Mágicos","Névoa Obscurecente","Onda Trovejante","Orbe Cromático","Queda Suave","Raio Nauseante","Raio de Bruxa","Retirada Acelerada","Salto","Sono","Vitalidade Vazia"],
  /* Feitiçaria Inata não tem escolha do jogador — só texto informativo. */
  feiticariaInata: "Como uma Ação Bônus, você pode liberar sua magia latente por 1 minuto. Enquanto ativa: a CD para evitar suas magias de Feiticeiro aumenta em 1, e você tem Vantagem nas jogadas de ataque das magias de Feiticeiro que conjurar. Você pode usar essa característica 2 vezes, recuperando todos os usos ao completar um Descanso Longo."
};
