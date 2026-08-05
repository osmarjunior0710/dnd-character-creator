/* Nobre — PHB 2024, pág. 184 (impresso). A ferramenta não é fixa: o livro
   manda "Escolha um tipo de Kit de Jogos" (pág. 221 lista as variantes,
   hoje centralizadas em ALL_GAME_SETS, data/game-sets.js — Guarda e
   Soldado usam a mesma lista). Por isso usa ferramentaCategoria/
   ferramentaOpcoes em vez de "tool" fixo — mesmo padrão usado por
   Artesão/Artista/Guarda/Soldado. O "{ferramenta}" dentro de equipmentA é
   um placeholder que o código genérico substitui pelo tipo escolhido na
   hora de montar o equipamento. */
const NOBRE = {
  nome: "Nobre",
  suggestedAbilities: ["Força","Inteligência","Carisma"],
  feat: "Habilidoso — proficiência em 3 perícias ou ferramentas à escolha",
  skills: ["História","Persuasão"],
  ferramentaCategoria: "Kit de Jogos",
  ferramentaOpcoes: ALL_GAME_SETS, // data/game-sets.js — mesma lista do Guarda/Soldado
  equipmentA: ["{ferramenta}","Perfume","Roupas Finas"],
  equipmentA_gold: 29,
  equipmentB_gold: 50
};
