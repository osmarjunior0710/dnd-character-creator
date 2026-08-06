const BARDO = {
  /* Diferente das outras classes, o Bardo escolhe 3 perícias QUAISQUER, sem
     lista restrita — renderBardoDetail() usa ALL_SKILLS (data/skills.js)
     em vez de um pool fixo aqui. */
  skillsAll: true,
  skillsCount: 3,
  /* Ferramentas: "Escolha 3 Instrumentos Musicais". Usa ALL_INSTRUMENTS
     (data/instruments.js) — os 10 do capítulo de Equipamento. */
  toolsCount: 3,
  weaponProf: ["simples"],
  armorProf: ["leve"],
  savingThrows: ["Destreza","Carisma"],
  equipmentA: ["Armadura de Couro", "2 Adagas", "Instrumento Musical à escolha", "Kit de Artista"],
  equipmentA_gold: 19,
  equipmentB_gold: 90,
  /* Truques e magias de 1º círculo da lista de Bardo, extraídos da planilha
     Magias_PHB2024_Completo (coluna "Bardo" = Sim), não do PDF. */
  cantrips: ["Amigos","Fagulha Estelar","Golpe Certeiro","Ilusão Menor","Luz","Luzes Dançantes","Mensagem","Mãos Mágicas","Prestidigitação Arcana","Proteção Contra Lâminas","Reparar","Trovão","Zombaria Perversa"],
  spells1: ["Amizade Animal","Comando","Compreender Idiomas","Curar Ferimentos","Detectar Magia","Disfarçar-se","Enfeitiçar Pessoa","Escrita Ilusória","Falar com Animais","Fogo das Fadas","Gargalhada Nefasta de Tasha","Heroísmo","Identificar","Imagem Silenciosa","Leque Cromático","Onda Trovejante","Palavra Curativa","Passos Largos","Perdição","Queda Suave","Servo Invisível","Sono","Sussurros Dissonantes"],
  /* Inspiração de Bardo não tem escolha do jogador no nível 1 (é sempre
     concedida) — só texto informativo, sem grupo de seleção. */
  inspiracao: "Como Ação Bônus, você pode dar um dado de Inspiração de Bardo (d6) a uma criatura a até 18 metros que possa vê-lo ou ouvi-lo. Dentro da próxima hora, ela pode somar esse dado a um Teste de D20 que tenha falhado, podendo transformar a falha em sucesso. Usos = seu mod. de Carisma (mínimo 1), recupera todos ao completar um Descanso Longo."
};
