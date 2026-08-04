/* Propriedades de Maestria em Arma (Capítulo 6 do PHB 2024, pág. 213-215).
   Transversal — não é específico de nenhuma classe. Usado por qualquer
   classe com o recurso "Maestria em Arma" (Bárbaro, Paladino, Guardião,
   Guerreiro, Ladino no nível 1; outras podem ganhar depois). */
const MASTERY_PROPERTIES = {
  "Afligir": "Se atingir a criatura e causar dano, você tem Vantagem no seu próximo ataque contra ela até o final do seu próximo turno.",
  "Ágil": "O ataque adicional da propriedade Leve pode ser feito como parte da ação Atacar, em vez de precisar de uma Ação Bônus (1x por turno).",
  "Derrubar": "Se atingir, pode forçar uma salvaguarda de Constituição (CD 8 + seu bônus de proficiência + mod. de atributo usado); falha = criatura fica Caída.",
  "Drenar": "Se atingir e causar dano, a criatura fica com Desvantagem no próximo ataque dela até o início do seu próximo turno.",
  "Empurrar": "Se atingir uma criatura Grande ou menor, pode empurrá-la até 3 metros para longe de você.",
  "Garantido": "Se a jogada de ataque errar, ainda causa dano igual ao seu mod. de atributo (mesmo tipo da arma).",
  "Lentidão": "Se atingir e causar dano, reduz o Deslocamento do alvo em 3 metros até o início do seu próximo turno (não acumula além de 3m mesmo com múltiplos acertos).",
  "Trespassar": "Se atingir corpo a corpo, pode fazer um segundo ataque com a mesma arma contra outra criatura próxima ao alvo, sem somar seu mod. de atributo ao dano extra (1x por turno)."
};

/* Nome da arma -> {categoria: "Simples"|"Marcial", tipo: "Corpo a Corpo"|"À Distância", mastery}.
   Cobre as armas do capítulo de Equipamento. O campo "noShop" marca armas
   que ainda não existem no SHOP do app (armas Marciais, principalmente —
   ver PENDÊNCIA no index.html sobre expandir o SHOP). */
const WEAPON_MASTERY = {
  // Simples Corpo a Corpo
  "Adaga": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Ágil"},
  "Azagaia": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Lentidão"},
  "Cajado": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Derrubar"},
  "Clava": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Lentidão"},
  "Clava Grande": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Empurrar"},
  "Foice": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Ágil"},
  "Lança": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Drenar"},
  "Maça": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Drenar"},
  "Machadinha": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Afligir"},
  "Martelo Leve": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Ágil"},
  // Simples À Distância
  "Arco Curto": {categoria:"Simples", tipo:"À Distância", mastery:"Afligir"},
  "Besta Leve": {categoria:"Simples", tipo:"À Distância", mastery:"Lentidão"},
  "Dardo": {categoria:"Simples", tipo:"À Distância", mastery:"Afligir", noShop:true},
  "Funda": {categoria:"Simples", tipo:"À Distância", mastery:"Lentidão", noShop:true},
  // Marciais Corpo a Corpo
  "Alabarda": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Trespassar", noShop:true},
  "Chicote": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Lentidão", noShop:true},
  "Cimitarra": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Ágil", noShop:true},
  "Espada Curta": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Afligir", noShop:true},
  "Espada Grande": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Garantido", noShop:true},
  "Espada Longa": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Drenar", noShop:true},
  "Glaive": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Garantido", noShop:true},
  "Lança de Montaria": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Derrubar", noShop:true},
  "Lança Longa": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Empurrar", noShop:true},
  "Maça Estrela": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Drenar", noShop:true},
  "Machado de Batalha": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Derrubar", noShop:true},
  "Machado Grande": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Trespassar", noShop:true},
  "Malho": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Derrubar", noShop:true},
  "Mangual": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Drenar", noShop:true},
  "Martelo de Guerra": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Empurrar", noShop:true},
  "Picareta de Guerra": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Drenar", noShop:true},
  "Rapieira": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Afligir", noShop:true},
  "Tridente": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Derrubar", noShop:true},
  // Marciais À Distância
  "Arco Longo": {categoria:"Marcial", tipo:"À Distância", mastery:"Lentidão", noShop:true},
  "Besta de Mão": {categoria:"Marcial", tipo:"À Distância", mastery:"Afligir", noShop:true},
  "Besta Pesada": {categoria:"Marcial", tipo:"À Distância", mastery:"Empurrar", noShop:true},
  "Mosquete": {categoria:"Marcial", tipo:"À Distância", mastery:"Lentidão", noShop:true},
  "Pistola": {categoria:"Marcial", tipo:"À Distância", mastery:"Afligir", noShop:true},
  "Zarabatana": {categoria:"Marcial", tipo:"À Distância", mastery:"Afligir", noShop:true}
};
