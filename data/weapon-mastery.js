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

/* Nome da arma -> {categoria: "Simples"|"Marcial", tipo: "Corpo a Corpo"|"À Distância", mastery, propriedades}.
   Cobre as armas do capítulo de Equipamento. "propriedades" é a lista de
   propriedades da arma (Leve, Acuidade, Duas Mãos, Pesada, Versátil,
   Arremesso, Munição, Recarga, Extensão) SEM os números de alcance/dado
   entre parênteses — útil pra filtrar por proficiência restrita (ex:
   Ladino só tem proficiência com Marciais que sejam Acuidade OU Leve).
   O campo "noShop" marca armas que ainda não existem no SHOP do app
   (armas Marciais, principalmente — ver PENDÊNCIA no index.html sobre
   expandir o SHOP). */
const WEAPON_MASTERY = {
  // Simples Corpo a Corpo
  "Adaga": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Ágil", propriedades:["Acuidade", "Arremesso", "Leve"]},
  "Azagaia": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Lentidão", propriedades:["Arremesso"]},
  "Cajado": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Derrubar", propriedades:["Versátil"]},
  "Clava": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Lentidão", propriedades:["Leve"]},
  "Clava Grande": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Empurrar", propriedades:["Duas Mãos"]},
  "Foice": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Ágil", propriedades:["Leve"]},
  "Lança": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Drenar", propriedades:["Arremesso", "Versátil"]},
  "Maça": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Drenar", propriedades:[]},
  "Machadinha": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Afligir", propriedades:["Arremesso", "Leve"]},
  "Martelo Leve": {categoria:"Simples", tipo:"Corpo a Corpo", mastery:"Ágil", propriedades:["Arremesso", "Leve"]},
  // Simples À Distância
  "Arco Curto": {categoria:"Simples", tipo:"À Distância", mastery:"Afligir", propriedades:["Duas Mãos", "Munição"]},
  "Besta Leve": {categoria:"Simples", tipo:"À Distância", mastery:"Lentidão", propriedades:["Duas Mãos", "Munição", "Recarga"]},
  "Dardo": {categoria:"Simples", tipo:"À Distância", mastery:"Afligir", noShop:true, propriedades:["Acuidade", "Arremesso"]},
  "Funda": {categoria:"Simples", tipo:"À Distância", mastery:"Lentidão", noShop:true, propriedades:["Munição"]},
  // Marciais Corpo a Corpo
  "Alabarda": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Trespassar", noShop:true, propriedades:["Duas Mãos", "Extensão", "Pesada"]},
  "Chicote": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Lentidão", noShop:true, propriedades:["Acuidade", "Extensão"]},
  "Cimitarra": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Ágil", noShop:true, propriedades:["Acuidade", "Leve"]},
  "Espada Curta": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Afligir", noShop:true, propriedades:["Acuidade", "Leve"]},
  "Espada Grande": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Garantido", noShop:true, propriedades:["Duas Mãos", "Pesada"]},
  "Espada Longa": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Drenar", noShop:true, propriedades:["Versátil"]},
  "Glaive": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Garantido", noShop:true, propriedades:["Duas Mãos", "Extensão", "Pesada"]},
  "Lança de Montaria": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Derrubar", noShop:true, propriedades:["Duas Mãos", "Extensão", "Pesada"]},
  "Lança Longa": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Empurrar", noShop:true, propriedades:["Duas Mãos", "Extensão", "Pesada"]},
  "Maça Estrela": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Drenar", noShop:true, propriedades:[]},
  "Machado de Batalha": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Derrubar", noShop:true, propriedades:["Versátil"]},
  "Machado Grande": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Trespassar", noShop:true, propriedades:["Duas Mãos", "Pesada"]},
  "Malho": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Derrubar", noShop:true, propriedades:["Duas Mãos", "Pesada"]},
  "Mangual": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Drenar", noShop:true, propriedades:[]},
  "Martelo de Guerra": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Empurrar", noShop:true, propriedades:["Versátil"]},
  "Picareta de Guerra": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Drenar", noShop:true, propriedades:["Versátil"]},
  "Rapieira": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Afligir", noShop:true, propriedades:["Acuidade"]},
  "Tridente": {categoria:"Marcial", tipo:"Corpo a Corpo", mastery:"Derrubar", noShop:true, propriedades:["Arremesso", "Versátil"]},
  // Marciais À Distância
  "Arco Longo": {categoria:"Marcial", tipo:"À Distância", mastery:"Lentidão", noShop:true, propriedades:["Duas Mãos", "Munição", "Pesada"]},
  "Besta de Mão": {categoria:"Marcial", tipo:"À Distância", mastery:"Afligir", noShop:true, propriedades:["Leve", "Munição", "Recarga"]},
  "Besta Pesada": {categoria:"Marcial", tipo:"À Distância", mastery:"Empurrar", noShop:true, propriedades:["Duas Mãos", "Munição", "Pesada", "Recarga"]},
  "Mosquete": {categoria:"Marcial", tipo:"À Distância", mastery:"Lentidão", noShop:true, propriedades:["Duas Mãos", "Munição", "Recarga"]},
  "Pistola": {categoria:"Marcial", tipo:"À Distância", mastery:"Afligir", noShop:true, propriedades:["Munição", "Recarga"]},
  "Zarabatana": {categoria:"Marcial", tipo:"À Distância", mastery:"Afligir", noShop:true, propriedades:["Munição", "Recarga"]}
};
