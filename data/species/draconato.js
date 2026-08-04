const DRACONATO = {
  nome: "Draconato",
  flavor: "Descendem de ovos de dragões cromáticos ou metálicos, ligados por lenda a Bahamut e Tiamat. Parecem dragões bípedes sem asas — escamosos, com chifres e coloração que remetem ao seu ancestral dracônico. (Livro do Jogador, pág. 188)",
  tipo: "Humanoide",
  tamanho: {
    opcoes: ["Médio"],
    alturas: { "Médio": "cerca de 1,50 a 2,10 metros" }
  },
  deslocamento: "9 metros",
  visaoNoEscuro: "18 metros",
  tracosFixos: [
    {
      nome: "Ataque de Sopro",
      resumo: "Ao executar a ação Atacar, você pode substituir um dos seus ataques por uma emissão de energia num Cone de 4,5 metros ou numa Linha de 9x1,5 metros (escolha a forma a cada vez). <br>Cada criatura na área faz uma salvaguarda de Destreza (CD 8 + seu modificador de Constituição + Bônus de Proficiência); falha = 1d10 de dano do tipo da sua Herança Dracônica, sucesso = metade. <br>O dano aumenta para 2d10 no nível 5, 3d10 no nível 11 e 4d10 no nível 17. Usos = seu Bônus de Proficiência, recuperando todos ao completar um Descanso Longo.",
      concede: []
    },
    {
      nome: "Resistência a Dano",
      resumo: "Você tem Resistência ao tipo de dano determinado pela sua Herança Dracônica.",
      concede: []
    },
    {
      nome: "Voo Dracônico",
      resumo: "A partir do nível 5 de personagem, como uma Ação Bônus, você cria asas espectrais nas costas que duram 10 minutos ou até você as retrair (nenhuma ação necessária) ou ficar Incapacitado. Enquanto durar, você tem Deslocamento de Voo igual ao seu Deslocamento normal. <br>Depois de usar, não pode usar de novo até completar um Descanso Longo.",
      concede: []
    }
  ],
  /* Diferente do Tiferino: aqui a escolha NÃO concede magia nenhuma por
     nível — ela só define qual TIPO DE DANO os traços fixos acima (Ataque
     de Sopro, Resistência a Dano) vão usar. Por isso não tem nivel1/3/5,
     só um "tipoDano" por opção. */
  subespecie: {
    nome: "Herança Dracônica",
    escolhidaNaCriacao: true,
    semEscalonamento: true,
    opcoes: [
      {nome:"Azul", tipoDano:"Elétrico"},
      {nome:"Branco", tipoDano:"Gélido"},
      {nome:"Bronze", tipoDano:"Elétrico"},
      {nome:"Cobre", tipoDano:"Ácido"},
      {nome:"Latão", tipoDano:"Ígneo"},
      {nome:"Negro", tipoDano:"Ácido"},
      {nome:"Ouro", tipoDano:"Ígneo"},
      {nome:"Prata", tipoDano:"Gélido"},
      {nome:"Verde", tipoDano:"Venenoso"},
      {nome:"Vermelho", tipoDano:"Ígneo"}
    ]
  }
};
