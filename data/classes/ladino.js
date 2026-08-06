const LADINO = {
  skills: ["Acrobacia","Atletismo","Enganação","Furtividade","Intimidação","Intuição","Investigação","Percepção","Persuasão","Prestidigitação"],
  skillsCount: 4,
  /* Proficiência de arma é FILTRADA: Simples (todas) + Marciais que
     tenham a propriedade Acuidade OU Leve (não é "todas as Marciais"
     como Bárbaro/Guerreiro/Paladino). weaponProf aqui ainda lista
     ["simples","marcial"] pra exibição/CLASS_INFO — o filtro fino por
     propriedade é aplicado em renderShop() via weaponProfFiltroMarcial,
     só quando o jogador liga o checkbox "Filtrar por proficiência"
     (desligado por padrão — com ele desligado a Loja mostra tudo, pra
     qualquer classe, de propósito). */
  weaponProf: ["simples","marcial"],
  weaponProfFiltroMarcial: ["Acuidade","Leve"],
  armorProf: ["leve"],
  savingThrows: ["Destreza","Inteligência"],
  toolsFixed: "Ferramentas de Ladrão",
  equipmentA: ["Armadura de Couro", "2 Adagas", "Espada Curta", "Arco Curto", "20 Flechas", "Aljava", "Ferramentas de Ladrão", "Kit de Assaltante"],
  equipmentA_gold: 8,
  equipmentB_gold: 100,
  /* Ataque Furtivo e Gíria do Ladrão não têm escolha de MECÂNICA (só o
     idioma extra da Gíria, que fica como placeholder — ver nota abaixo).
     Especialista (2 perícias) e Maestria em Arma (2 armas) têm escolha. */
  ataqueFurtivo: "Uma vez por turno, ao atingir uma criatura com uma jogada de ataque em que você tem Vantagem, usando uma arma com a propriedade Acuidade ou uma arma à Distância, você causa 1d6 de dano adicional do tipo de dano da arma. Você não precisa ter Vantagem se um aliado (sem a condição Incapacitado, e você sem Desvantagem no ataque) estiver a até 1,5 metro do alvo.",
  especialistaCount: 2,
  /* Idioma extra da Gíria do Ladrão: PLACEHOLDER genérico por decisão do
     usuário (mesmo tratamento dos instrumentos do Bardo) — o app ainda
     não tem uma lista de idiomas do PHB 2024 implementada em lugar
     nenhum. Ao revisar isso, CHECAR O LIVRO DO JOGADOR (capítulo 2,
     tabelas de idiomas) antes de codar a lista — não usar de memória. */
  giriaDoLadrao: "Você conhece a Gíria dos Ladrões automaticamente, mais 1 idioma à sua escolha das tabelas de idiomas do capítulo 2 (escolhido no passo de Idiomas, mais adiante).",
  maestriaCount: 2
};
