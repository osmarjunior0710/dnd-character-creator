/* Nobre — PHB 2024, pág. 184 (impresso). Diferente do Charlatão, a
   ferramenta não é fixa: o livro manda "Escolha um tipo de Kit de Jogos"
   (pág. 221 lista as variantes: Dados, Xadrez-do-Dragão, Baralho, Conjunto
   do Jogo dos Três Dragões). Por isso tem um campo extra kitJogos com sua
   própria escolha, além do plano de atributos/Habilidoso/equipamento que
   já existiam pro Charlatão (reaproveitados via activeBgData()). */
const NOBRE = {
  nome: "Nobre",
  suggestedAbilities: ["Força","Inteligência","Carisma"],
  feat: "Habilidoso — proficiência em 3 perícias ou ferramentas à escolha",
  skills: ["História","Persuasão"],
  kitJogosOpcoes: ["Dados","Xadrez-do-Dragão","Baralho","Conjunto do Jogo dos Três Dragões"],
  equipmentA: ["Kit de Jogos (o escolhido)","Perfume","Roupas Finas"],
  equipmentA_gold: 29,
  equipmentB_gold: 50
};
