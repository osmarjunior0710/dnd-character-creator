const MONGE = {
  skills: ["Acrobacia","Atletismo","Furtividade","História","Intuição","Religião"],
  /* Proficiência de arma restrita: Simples CORPO A CORPO + Marciais Corpo
     a Corpo com propriedade Leve (nem todas as Simples — exclui as à
     Distância também, diferente de todas as outras classes até agora).
     Sem Maestria em Arma no nível 1, então esse filtro não afeta escolha
     de Maestria — mas afeta o filtro de "proficiência" (opcional) da
     Loja, ver renderShop()/weaponProfMeleeOnly/weaponProfFiltroMarcial. */
  weaponProf: ["simples","marcial"],
  weaponProfMeleeOnly: true,
  weaponProfFiltroMarcial: ["Leve"],
  armorProf: [],
  savingThrows: ["Força","Destreza"],
  /* Ferramentas: escolha 1 CATEGORIA (Ferramentas de Artesão OU
     Instrumento Musical) e DEPOIS 1 item específico dentro dela —
     seletor de 2 níveis em renderMongeDetail(), usando ALL_ARTISAN_TOOLS
     (data/artisan-tools.js) e ALL_INSTRUMENTS (data/instruments.js).
     data.monge.toolCategory guarda a categoria, toolChoice o item. */
  toolsNote: "Escolha 1 tipo (Ferramentas de Artesão OU Instrumento Musical) e depois 1 item específico dessa categoria.",
  toolCategories: ["Ferramentas de Artesão", "Instrumento Musical"],
  equipmentA: ["Lança", "5 Adagas", "Ferramenta/Instrumento escolhido", "Kit de Aventureiro"],
  equipmentA_gold: 11,
  equipmentB_gold: 50,
  /* Artes Marciais e Defesa sem Armadura não têm escolha do jogador no
     nível 1 — só texto informativo. Sem Maestria em Arma nesse nível
     (só entra depois, se entrar — não confirmado, não assumir). */
  artesMarciais: "Enquanto estiver desarmado ou empunhando só armas de Monge, sem vestir armadura nem empunhar Escudo, você ganha: Ataque Desarmado Adicional (Ação Bônus), Dado de Artes Marciais (pode rolar 1d6 no lugar do dano normal do Ataque Desarmado ou de arma de Monge) e Ataques com Destreza (pode usar Destreza em vez de Força nas jogadas de ataque e dano desses ataques).",
  defesaSemArmadura: "Sem vestir armadura nem empunhar Escudo, sua Classe de Armadura é 10 + mod. Destreza + mod. Sabedoria."
};
