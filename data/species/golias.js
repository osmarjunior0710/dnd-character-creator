const GOLIAS = {
  nome: "Golias",
  flavor: "Descendentes distantes de gigantes, herdando dons sobrenaturais conforme a linhagem ancestral (gelo, fogo, pedra, nuvem, colina ou tempestade). Buscam superar seus próprios limites, sem os conflitos que historicamente dividiram os gigantes. (Livro do Jogador, pág. 192)",
  tipo: "Humanoide",
  tamanho: {
    opcoes: ["Médio"],
    alturas: { "Médio": "cerca de 2,10 a 2,40 metros" }
  },
  deslocamento: "10,5 metros",
  visaoNoEscuro: null,
  tracosFixos: [
    {
      nome: "Forma Grande",
      resumo: "A partir do nível 5 de personagem, como uma Ação Bônus, você pode alterar seu tamanho para Grande (se estiver num espaço grande o suficiente).<br>A transformação dura 10 minutos ou até você a encerrar (nenhuma ação necessária).<br>Enquanto durar, você tem Vantagem em testes de Força e seu Deslocamento aumenta em 3 metros. Depois de usar, não pode usar de novo até completar um Descanso Longo.",
      concede: []
    },
    {
      nome: "Porte Poderoso",
      resumo: "Você tem Vantagem em qualquer teste de atributo que realizar para encerrar a condição Imobilizado. Você também conta como um tamanho maior ao determinar sua capacidade de carga.",
      concede: []
    }
  ],
  /* Igual ao Gnomo: sem escalonamento por nível. Diferente do Gnomo, aqui
     nenhuma opção concede item de lista (magia/truque) — são só efeitos
     mecânicos numéricos — então nenhuma delas usa "concede" nem precisa de
     atributo de conjuração. */
  subespecie: {
    nome: "Ancestralidade Gigante",
    escolhidaNaCriacao: true,
    semEscalonamento: true,
    opcoes: [
      {
        nome: "Arrepio do Gelo (Gigante do Gelo)",
        nivel1: { resumo: "Ao acertar um ataque, você também pode causar 1d6 de dano Gélido ao alvo e reduzir o Deslocamento dele em 3 metros até o início do seu próximo turno. <br>Usos = Bônus de Proficiência, recuperando todos ao completar um Descanso Longo.", concede: [] },
        nivel3: null, nivel5: null
      },
      {
        nome: "Queimadura de Fogo (Gigante de Fogo)",
        nivel1: { resumo: "Ao acertar um ataque e causar dano, você também pode causar 1d10 de dano Ígneo ao alvo. <br>Usos = Bônus de Proficiência, recuperando todos ao completar um Descanso Longo.", concede: [] },
        nivel3: null, nivel5: null
      },
      {
        nome: "Resistência da Pedra (Gigante da Pedra)",
        nivel1: { resumo: "Ao sofrer dano, você pode executar uma Reação para rolar 1d12, somar seu modificador de Constituição, e reduzir o dano sofrido nesse total. <br>Usos = Bônus de Proficiência, recuperando todos ao completar um Descanso Longo.", concede: [] },
        nivel3: null, nivel5: null
      },
      {
        nome: "Salto da Nuvem (Gigante das Nuvens)",
        nivel1: { resumo: "Como uma Ação Bônus, você se teleporta magicamente até 9 metros para um espaço desocupado que possa ver. <br>Usos = Bônus de Proficiência, recuperando todos ao completar um Descanso Longo.", concede: [] },
        nivel3: null, nivel5: null
      },
      {
        nome: "Tombo da Colina (Gigante da Colina)",
        nivel1: { resumo: "Ao acertar uma criatura Grande ou menor com um ataque e causar dano, você pode impor a condição Caído a esse alvo. <br>Usos = Bônus de Proficiência, recuperando todos ao completar um Descanso Longo.", concede: [] },
        nivel3: null, nivel5: null
      },
      {
        nome: "Trovão da Tempestade (Gigante da Tempestade)",
        nivel1: { resumo: "Ao sofrer dano de uma criatura a até 18 metros de você, pode executar uma Reação para causar 1d8 de dano Trovejante a essa criatura. <br>Usos = Bônus de Proficiência, recuperando todos ao completar um Descanso Longo.", concede: [] },
        nivel3: null, nivel5: null
      }
    ]
  }
};
