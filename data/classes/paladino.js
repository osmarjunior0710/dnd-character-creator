const PALADINO = {
  skills: ["Atletismo","Intimidação","Intuição","Medicina","Persuasão","Religião"],
  weaponProf: ["simples","marcial"],
  armorProf: ["leve","media","pesada","escudo"],
  savingThrows: ["Sabedoria","Carisma"],
  equipmentA: ["Cota de Malha", "Escudo", "Espada Longa", "6 Azagaias", "Símbolo Sagrado", "Kit de Sacerdote"],
  equipmentA_gold: 9,
  equipmentB_gold: 150,
  /* Paladino não tem truques no nível 1 — só magias preparadas. Extraídas
     da planilha Magias_PHB2024_Completo (coluna "Paladino"=Sim), não do PDF. */
  preparedCount: 2,
  spells1: ["Bênção","Comando","Curar Ferimentos","Destruição Cauterizante","Destruição Colérica","Destruição Divina","Destruição Estrondosa","Detectar Magia","Detectar Veneno e Doença","Detectar o Bem e o Mal","Duelo Compelido","Escudo da Fé","Favor Divino","Heroísmo","Proteção Contra o Bem e o Mal","Purificar Alimentos e Bebidas"],
  /* Maestria em Arma tem escolha do jogador (2 armas, com proficiência —
     ver data/weapon-mastery.js). Diferente do Bárbaro, o texto do Paladino
     NÃO restringe a armas Corpo a Corpo (só exige proficiência, que ele
     tem com Simples e Marciais de ambos os tipos) — confirmado no PDF, pág.
     167, antes de assumir isso. Mãos Consagradas não tem escolha, é
     baseada no nível — só texto informativo. */
  maestriaCount: 2,
  maestriaSemRestricaoDeTipo: true,
  maosConsagradas: "Você tem uma reserva de cura = 5x seu nível de Paladino (5 no nível 1). Como Ação Bônus, toca uma criatura (pode ser você mesmo) e restaura PV dela usando a reserva, até o total disponível. Também pode gastar 5 PV da reserva pra remover a condição Envenenado de uma criatura (sem curar PV nesse caso). A reserva enche de novo ao completar um Descanso Longo."
};
