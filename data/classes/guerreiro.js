const GUERREIRO = {
  skills: ["Acrobacia","Atletismo","História","Intimidação","Intuição","Lidar com Animais","Percepção","Persuasão","Sobrevivência"],
  weaponProf: ["simples","marcial"],
  armorProf: ["leve","media","pesada","escudo"],
  savingThrows: ["Força","Constituição"],
  /* Única classe até agora com TRÊS opções de equipamento inicial (A, B
     ou C), não só A/B — schema novo: equipmentB agora é uma lista de
     itens (igual A), e equipmentC_gold é a opção só-em-ouro (que nas
     outras classes era "equipmentB_gold"). */
  equipmentA: ["Cota de Malha", "Espada Grande", "Mangual", "8 Azagaias", "Kit de Explorador de Masmorras"],
  equipmentA_gold: 4,
  equipmentB: ["Armadura de Couro Batido", "Cimitarra", "Espada Curta", "Arco Longo", "20 Flechas", "Aljava", "Kit de Explorador de Masmorras"],
  equipmentB_gold: 11,
  equipmentC_gold: 155,
  /* Estilo de Luta: escolha 1 talento entre os 10 da categoria "Estilo de
     Luta", extraídos da planilha de Talentos (aba Talentos, coluna
     Categoria="Estilo de Luta"), não do PDF. Pode trocar a cada nível de
     Guerreiro (não implementado ainda, só nível 1). */
  estiloDeLuta: {
    "Arquearia": "+2 nas jogadas de ataque com armas à distância.",
    "Combate com Armas de Arremesso": "+2 no dano ao acertar ataque à distância com arma de Arremesso.",
    "Combate com Armas Grandes": "Ao rolar dano com arma corpo a corpo de duas mãos (Duas Mãos ou Versátil empunhada com 2 mãos): trata 1s e 2s como 3.",
    "Combate com Duas Armas": "Soma mod. de atributo no dano do ataque adicional de arma Leve, se ainda não somava.",
    "Combate Desarmado": "Ataque Desarmado causa 1d6+Força Contundente (1d8 se sem arma/escudo em mãos). Início do turno: 1d4 Contundente extra a criatura Imobilizada por você.",
    "Defensivo": "+1 CA enquanto usa armadura Leve, Média ou Pesada.",
    "Duelismo": "Com 1 arma corpo a corpo numa mão e nenhuma outra arma: +2 no dano dessa arma.",
    "Interceptação": "Reação: quando alguém à vista acerta outra criatura a 1,5m de você, reduz o dano em 1d10+Bônus de Proficiência. Precisa empunhar Escudo ou arma Simples/Marcial.",
    "Luta às Cegas": "Visão às Cegas 3m.",
    "Protetivo": "Reação: quando alguém à vista ataca alvo (não você) a 1,5m de você, interpõe Escudo (se empunhado) — Desvantagem no ataque desencadeador e em todos contra o alvo até seu próximo turno, enquanto você ficar a 1,5m dele."
  },
  /* Maestria em Arma do Guerreiro tem 3 armas (não 2) e, igual o Paladino
     e diferente do Bárbaro, NÃO se restringe a Corpo a Corpo — CONFERIDO
     no PDF antes de assumir (pág. 126): "três tipos de armas Simples ou
     Marciais à sua escolha", sem repetir "Corpo a Corpo". */
  maestriaCount: 3,
  /* Recuperar Fôlego não tem escolha do jogador — só texto informativo. */
  recuperarFolego: "Como uma Ação Bônus, você pode recuperar Pontos de Vida iguais a 1d10 + seu nível de Guerreiro. Você pode usar essa característica 2 vezes: recupera 1 uso ao completar um Descanso Curto e todos ao completar um Descanso Longo."
};
