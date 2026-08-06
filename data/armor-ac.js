/* CA de cada armadura vendável na Loja (data/shop-items.js), por ID —
   fonte estruturada equivalente ao texto livre já em shop-items.js
   (campo "d", tipo "CA 14 + Destreza (máx. 2)"), usada por
   computeCharacterSheet() (index.html) pra calcular CA de verdade em
   vez do texto "não calculada automaticamente neste protótipo" que as
   classes com armadura variável (Paladino/Clérigo/Guerreiro/Druida/
   Guardião) mostravam antes.
   dexCap: null = soma Destreza sem limite (Leve); 2 = soma Destreza até
   +2 (Média); 0 = não soma Destreza (Pesada, CA fixa).
   reqForca: Força mínima pra não sofrer penalidade de Deslocamento (não
   afeta o CÁLCULO de CA em si, só registrado aqui pra eventual aviso). */
const ARMOR_AC = {
  "armadura-acolchoada": {ca:11, dexCap:null, categoria:"Leve", reqForca:null},
  "armadura-de-couro": {ca:11, dexCap:null, categoria:"Leve", reqForca:null},
  "armadura-de-couro-batido": {ca:12, dexCap:null, categoria:"Leve", reqForca:null},
  "gibao-de-peles": {ca:12, dexCap:2, categoria:"Média", reqForca:null},
  "cota-de-malha-parcial": {ca:13, dexCap:2, categoria:"Média", reqForca:null},
  "loriga-de-escamas": {ca:14, dexCap:2, categoria:"Média", reqForca:null},
  "couraca-peitoral": {ca:14, dexCap:2, categoria:"Média", reqForca:null},
  "placas-parcial": {ca:15, dexCap:2, categoria:"Média", reqForca:null},
  "cota-de-aneis": {ca:14, dexCap:0, categoria:"Pesada", reqForca:null},
  "cota-de-malha": {ca:16, dexCap:0, categoria:"Pesada", reqForca:13},
  "armadura-de-talas": {ca:17, dexCap:0, categoria:"Pesada", reqForca:15},
  "placas": {ca:18, dexCap:0, categoria:"Pesada", reqForca:15}
};
/* Escudo é tratado à parte (não é "armadura" pra fins de dexCap/categoria
   acima) — soma +2 fixo à CA de quem estiver empunhando um, não importa
   a armadura de baixo. */
const SHIELD_ITEM_ID = "escudo";
