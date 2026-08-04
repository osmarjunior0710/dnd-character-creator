const ELFO = {
  nome: "Elfo",
  flavor: "Criados por Corellon, perderam a habilidade ancestral de mudar de forma após um conflito mítico envolvendo Lolth. Vivem cerca de 750 anos, não dormem (entram em transe), e se dividem em variações moldadas pelo ambiente ao longo de séculos. (Livro do Jogador, pág. 189-190)",
  tipo: "Humanoide",
  tamanho: {
    opcoes: ["Médio"],
    alturas: { "Médio": "cerca de 1,50 a 1,80 metro" }
  },
  deslocamento: "9 metros",
  visaoNoEscuro: "18 metros",
  tracosFixos: [
    {
      nome: "Ancestralidade Feérica",
      resumo: "Você tem Vantagem nas salvaguardas que realizar para evitar ou encerrar a condição Enfeitiçado.",
      concede: []
    },
    {
      nome: "Transe",
      resumo: "Você pode completar um Descanso Longo em 4 horas ao meditar, sem a necessidade de dormir.",
      concede: []
    }
  ],
  /* Sentidos Aguçados NÃO é um traço fixo — é uma escolha real de perícia
     entre 3 opções, então fica de fora de tracosFixos (que são só coisas
     automáticas) e vira um campo próprio, tratado na tela com o mesmo
     componente de escolha agrupada por atributo que já usamos no Humano. */
  sentidosAgucados: {
    nome: "Sentidos Aguçados",
    opcoes: ["Intuição", "Percepção", "Sobrevivência"]
  },
  subespecie: {
    nome: "Linhagem Élfica",
    escolhidaNaCriacao: true,
    opcoes: [
      {
        nome: "Alto Elfo",
        nivel1: { resumo: "Você conhece o truque abaixo. Sempre que completar um Descanso Longo, pode substituí-lo por outro truque da lista de magias de Mago.", concede: [{tipo:"truque", nome:"Prestidigitação Arcana"}] },
        nivel3: { resumo: "", concede: [{tipo:"magia", nome:"Detectar Magia"}] },
        nivel5: { resumo: "", concede: [{tipo:"magia", nome:"Passo Nebuloso"}] }
      },
      {
        nome: "Drow",
        nivel1: { resumo: "Sua Visão no Escuro aumenta para 36 metros. Você também conhece o truque abaixo.", concede: [{tipo:"truque", nome:"Luzes Dançantes"}] },
        nivel3: { resumo: "", concede: [{tipo:"magia", nome:"Fogo das Fadas"}] },
        nivel5: { resumo: "", concede: [{tipo:"magia", nome:"Escuridão"}] }
      },
      {
        nome: "Elfo Silvestre",
        nivel1: { resumo: "Seu Deslocamento aumenta para 10,5 metros. Você também conhece o truque abaixo.", concede: [{tipo:"truque", nome:"Arte Druídica"}] },
        nivel3: { resumo: "", concede: [{tipo:"magia", nome:"Passos Largos"}] },
        nivel5: { resumo: "", concede: [{tipo:"magia", nome:"Passo Sem Rastro"}] }
      }
    ]
  }
};
