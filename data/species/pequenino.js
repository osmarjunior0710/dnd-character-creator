/* Pequenino (Halfling) — PHB 2024, pág. 195. Diferente do Tiferino, não tem
   nenhuma escolha própria (sem subespécie): todos os traços são fixos,
   INCLUSIVE o tamanho (só existe uma opção, "Pequeno"). */
const PEQUENINO = {
  nome: "Pequenino",
  flavor: "Devotados a deuses que valorizam o lar, a família e a comunidade, os pequeninos costumam sonhar com uma vida tranquila — mas muitos sentem o chamado da aventura. Seu tamanho discreto, parecido com o de uma criança humana, os ajuda a passar despercebidos e a se espremer em espaços que outros povos não conseguem. (Livro do Jogador, pág. 195)",
  tipo: "Humanoide",
  tamanho: {
    opcoes: ["Pequeno"],
    alturas: { "Pequeno": "cerca de 0,60 a 0,90 metro" }
  },
  deslocamento: "9 metros",
  visaoNoEscuro: null,
  tracosFixos: [
    {nome:"Corajoso", resumo:"Você tem Vantagem nas salvaguardas que realizar para evitar ou encerrar a condição Amedrontado."},
    {nome:"Agilidade Pequenina", resumo:"Você pode se mover pelo espaço de qualquer criatura que seja um tamanho maior que você, mas não pode parar no mesmo espaço."},
    {nome:"Sorte", resumo:"Ao tirar 1 no d20 de um Teste de d20, você pode jogar novamente o dado e deve usar a nova jogada."},
    {nome:"Furtividade Natural", resumo:"Você pode executar a ação Esconder mesmo quando estiver encoberto apenas por uma criatura que seja pelo menos um tamanho maior que você."}
  ],
  subespecie: null
};
