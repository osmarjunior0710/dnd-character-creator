const AASIMAR = {
  nome: "Aasimar",
  flavor: "Mortais que carregam uma centelha dos Planos Superiores na alma — descendência angelical ou infusão de poder celestial. Vivem até 160 anos; sinais físicos sutis da herança (marcas metálicas, olhos brilhantes, leve halo) ficam mais evidentes quando revelam sua natureza. (Livro do Jogador, pág. 186)",
  tipo: "Humanoide",
  tamanho: {
    opcoes: ["Médio", "Pequeno"],
    alturas: { "Médio": "cerca de 1,20 a 2,10 metros", "Pequeno": "cerca de 0,60 a 1,20 metro" }
  },
  deslocamento: "9 metros",
  visaoNoEscuro: "18 metros",
  tracosFixos: [
    {
      nome: "Resistência Celestial",
      resumo: "Você tem Resistência a dano Necrótico e Radiante.",
      concede: []
    },
    {
      nome: "Mãos Curativas",
      resumo: "Você executa uma ação Usar Magia, toca uma criatura e joga um número de d4s igual ao seu Bônus de Proficiência. A criatura restaura Pontos de Vida iguais ao total jogado. Depois de usar esse traço, você não pode usá-lo novamente até completar um Descanso Longo.",
      concede: []
    },
    {
      nome: "Portador da Luz",
      resumo: "Carisma é seu atributo de conjuração para o truque abaixo.",
      concede: [ {tipo:"truque", nome:"Luz"} ]
    }
  ],
  /* Diferente do Tiferino e das demais espécies com "subespécie", a Revelação
     Celestial do Aasimar NÃO é fixada na criação — o jogador escolhe qual das
     3 formas usar toda vez que ativa a habilidade em jogo (nível 3+).
     DECISÃO (combinada com o usuário): pular a escolha na tela de criação;
     mostrar só um aviso + as 3 opções como pills informativas (sem seleção). */
  revelacaoCelestial: {
    nome: "Revelação Celestial",
    nivelConcedido: 3,
    aviso: "A partir do nível 3, como uma Ação Bônus você pode se transformar usando uma das formas abaixo (escolhida a cada vez que se transforma, não fixada agora). A transformação dura 1 minuto, e uma vez por turno seus ataques ou magias causam dano adicional igual ao seu Bônus de Proficiência. Você só pode se transformar 1 vez por Descanso Longo.",
    opcoes: [
      {
        nome: "Asas Celestiais",
        resumo: "Duas asas espectrais brotam nas suas costas. Enquanto durar, você tem Deslocamento de Voo igual ao seu Deslocamento normal.",
        concede: []
      },
      {
        nome: "Manto Necrótico",
        resumo: "Seus olhos se tornam poças de escuridão e asas que não voam brotam nas suas costas. Criaturas não-aliadas a até 3 metros devem ser bem-sucedidas numa salvaguarda de Carisma (CD 8 + seu modificador de Carisma + Bônus de Proficiência) ou ficam Amedrontadas até o final do seu próximo turno.",
        concede: []
      },
      {
        nome: "Transfiguração Radiante",
        resumo: "Luz abrasadora irradia de seus olhos e boca. Você emite Luz Plena num raio de 3 metros e Meia-luz por mais 3 metros; no fim de cada um dos seus turnos, criaturas a até 3 metros de você sofrem dano Radiante igual ao seu Bônus de Proficiência.",
        concede: []
      }
    ]
  },
  subespecie: null
};
