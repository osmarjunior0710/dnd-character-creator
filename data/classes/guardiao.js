const GUARDIAO = {
  skills: ["Atletismo","Furtividade","Intuição","Investigação","Lidar com Animais","Natureza","Percepção","Sobrevivência"],
  skillsCount: 3,
  weaponProf: ["simples","marcial"],
  armorProf: ["leve","media","escudo"],
  savingThrows: ["Força","Destreza"],
  equipmentA: ["Armadura de Couro Batido", "Cimitarra", "Espada Curta", "Arco Longo", "20 Flechas", "Aljava", "Foco Druídico (ramo de visco)", "Kit de Aventureiro"],
  equipmentA_gold: 7,
  equipmentB_gold: 150,
  /* Sem truques no nível 1 — só magias preparadas. Extraídas da planilha
     Magias_PHB2024_Completo (coluna "Guardião"=Sim), não do PDF. Marca do
     Predador fica de fora da lista de escolha (é concedida de graça pelo
     Inimigo Favorito, filtrada no render). */
  preparedCount: 2,
  spells1: ["Alarme","Amizade Animal","Bom Fruto","Curar Ferimentos","Detectar Magia","Detectar Veneno e Doença","Emaranhar","Falar com Animais","Golpe Constritor","Marca do Predador","Névoa Obscurecente","Passos Largos","Salto","Saraivada de Espinhos"],
  /* Inimigo Favorito não tem escolha do jogador — só texto informativo. */
  inimigoFavorito: "Você sempre tem a magia Marca do Predador preparada (não conta contra o total de magias preparadas escolhidas acima). Pode conjurá-la 2 vezes sem gastar espaço de magia, recuperando todos os usos ao completar um Descanso Longo.",
  /* Maestria em Arma (2 armas, com as quais você tem proficiência) —
     CONFERIDO no PDF (pág. 117): "dois tipos de armas à sua escolha com
     as quais você tem proficiência", exemplo mistura Arco Longo (à
     distância) com Espada Curta (corpo a corpo) — SEM restrição a Corpo
     a Corpo, mesma regra de Paladino/Guerreiro/Ladino, diferente do
     Bárbaro. */
  maestriaCount: 2
};
