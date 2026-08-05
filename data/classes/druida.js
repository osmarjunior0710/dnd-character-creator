const DRUIDA = {
  skills: ["Arcanismo","Lidar com Animais","Intuição","Medicina","Natureza","Percepção","Religião","Sobrevivência"],
  weaponProf: ["simples"],
  armorProf: ["leve","escudo"],
  toolsFixed: "Kit de Herbalismo",
  equipmentA: ["Armadura de Couro", "Escudo", "Foice", "Foco Druídico (Cajado)", "Kit de Explorador de Masmorras", "Kit de Herbalismo"],
  equipmentA_gold: 9,
  equipmentB_gold: 50,
  /* Truques e magias de 1º círculo da lista de Druida, extraídos da
     planilha Magias_PHB2024_Completo (coluna "Druida"=Sim), não do PDF. */
  cantripsCount: 2,
  cantrips: ["Acudir os Moribundos","Arte Druídica","Bordão Místico","Chicote de Espinhos","Criar Chamas","Elementalismo","Fagulha Estelar","Mensagem","Orientação","Rajada de Veneno","Reparar","Resistência","Trovão"],
  preparedCount: 4,
  spells1: ["Amizade Animal","Bom Fruto","Criar ou Destruir Água","Curar Ferimentos","Detectar Magia","Detectar Veneno e Doença","Emaranhar","Enfeitiçar Pessoa","Faca de Gelo","Falar com Animais","Fogo das Fadas","Névoa Obscurecente","Onda Trovejante","Palavra Curativa","Passos Largos","Proteção Contra o Bem e o Mal","Purificar Alimentos e Bebidas","Salto"],
  /* Idioma Druídico não tem escolha do jogador — sempre concedido, e
     sempre vem com Falar com Animais preparada de graça (não conta nas
     magias preparadas escolhidas acima). Só texto informativo. */
  idiomaDruidico: "Você aprende o idioma Druídico (secreto dos Druidas) e sempre tem a magia Falar com Animais preparada (não conta contra o total de magias preparadas escolhidas acima).",
  /* Ordem Primal: escolha entre 2 papéis — mesma estrutura da Ordem
     Divina do Clérigo. Xamã concede +1 truque, então o cantripsCount
     efetivo é dinâmico (igual clerigoEffectiveCantripsCount()). */
  ordemPrimal: {
    "Protetor": "Você ganha proficiência com Armas Marciais e treinamento com Armadura Média.",
    "Xamã": "Você aprende mais um truque de Druida à sua escolha (some ao total de truques). Além disso, adiciona seu mod. de Sabedoria (mínimo +1) a qualquer teste de Inteligência (Arcanismo) ou Inteligência (Natureza) que fizer."
  }
};
