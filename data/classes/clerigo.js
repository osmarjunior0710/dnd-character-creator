const CLERIGO = {
  skills: ["História","Intuição","Medicina","Persuasão","Religião"],
  weaponProf: ["simples"],
  armorProf: ["leve","media","escudo"],
  savingThrows: ["Sabedoria","Carisma"],
  equipmentA: ["Cota de Malha Parcial", "Escudo", "Maça", "Símbolo Sagrado", "Kit de Sacerdote"],
  equipmentA_gold: 7,
  equipmentB_gold: 110,
  /* Truques e magias de 1º círculo da lista de Clérigo, extraídos da
     planilha Magias_PHB2024_Completo (coluna "Clérigo"=Sim), não do PDF. */
  cantripsCount: 3,
  cantrips: ["Acudir os Moribundos","Badalar Fúnebre","Chama Sagrada","Luz","Orientação","Palavra de Radiância","Reparar","Resistência","Taumaturgia"],
  preparedCount: 4,
  spells1: ["Bênção","Comando","Criar ou Destruir Água","Curar Ferimentos","Detectar Magia","Detectar Veneno e Doença","Detectar o Bem e o Mal","Escudo da Fé","Infligir Ferimentos","Palavra Curativa","Perdição","Proteção Contra o Bem e o Mal","Purificar Alimentos e Bebidas","Raio Guia","Santuário"],
  /* Ordem Divina: escolha entre 2 papéis. Taumaturgo concede +1 truque —
     por isso o cantripsCount efetivo é dinâmico (ver renderClerigoDetail). */
  ordemDivina: {
    "Protetor": "Você ganha proficiência com Armas Marciais e treinamento com Armadura Pesada.",
    "Taumaturgo": "Você aprende mais um truque de Clérigo à sua escolha (some ao total de truques). Além disso, adiciona seu mod. de Sabedoria (mínimo +1) a qualquer teste de Inteligência (Arcanismo) ou Inteligência (Religião) que fizer."
  }
};
