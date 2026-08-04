const ORC = {
  nome: "Orc",
  flavor: "Descendem espiritualmente de Gruumsh, herdando resistência, determinação e visão apurada no escuro. Fisicamente robustos; a relação com o legado de Gruumsh varia — alguns o abraçam, outros seguem caminho próprio. (Livro do Jogador, pág. 194)",
  tipo: "Humanoide",
  tamanho: {
    opcoes: ["Médio"],
    alturas: { "Médio": "cerca de 1,80 a 2,10 metros" }
  },
  deslocamento: "9 metros",
  visaoNoEscuro: "36 metros",
  tracosFixos: [
    {
      nome: "Pico de Adrenalina",
      resumo: "Você pode executar a ação Correr como uma Ação Bônus. <br>Ao fazer isso, você adquire um número de Pontos de Vida Temporários igual ao seu Bônus de Proficiência. <br>Você pode usar este traço um número de vezes igual ao seu Bônus de Proficiência, recuperando todos os usos ao completar um Descanso Curto ou Longo.",
      concede: []
    },
    {
      nome: "Vigor Implacável",
      resumo: "Ao ser reduzido a 0 Pontos de Vida, mas não morto imediatamente, você fica com 1 Ponto de Vida. <br>Depois de usar este traço, você não pode usá-lo novamente até completar um Descanso Longo.",
      concede: []
    }
  ],
  subespecie: null
};
