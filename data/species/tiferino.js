const TIEFLING = {
  nome: "Tiferino",
  flavor: "Tiferinos carregam em suas veias um legado ínfero — um vínculo de sangue com um diabo, demônio ou outra entidade dos Planos Inferiores, herdado ou nascido diretamente lá. Esse laço concede poder, mas não determina o caráter ou a moral de quem o carrega: cada tiferino escolhe abraçar ou lamentar essa herança. (Livro do Jogador, pág. 196-198)",
  tipo: "Humanoide",
  tamanho: {
    opcoes: ["Médio", "Pequeno"],
    alturas: { "Médio": "cerca de 1,20 a 2,10 metros", "Pequeno": "cerca de 0,90 a 1,20 metro" }
  },
  deslocamento: "9 metros",
  visaoNoEscuro: "18 metros",
  tracosFixos: [
    {
      nome: "Presença Sobrenatural",
      resumo: "Ao conjurar o truque abaixo com este traço, a magia usa o mesmo atributo de conjuração escolhido para o seu Legado Ínfero.",
      concede: [ {tipo:"truque", nome:"Taumaturgia"} ]
    }
  ],
  subespecie: {
    nome: "Legado Ínfero",
    escolhidaNaCriacao: true,
    opcoes: [
      {
        nome: "Abissal",
        nivel1: { resumo: "Você tem Resistência a dano Venenoso.", concede: [{tipo:"truque", nome:"Rajada de Veneno"}] },
        nivel3: { resumo: "", concede: [{tipo:"magia", nome:"Raio Nauseante"}] },
        nivel5: { resumo: "", concede: [{tipo:"magia", nome:"Paralisar Pessoa"}] }
      },
      {
        nome: "Ctônico",
        nivel1: { resumo: "Você tem Resistência a dano Necrótico.", concede: [{tipo:"truque", nome:"Toque Necrótico"}] },
        nivel3: { resumo: "", concede: [{tipo:"magia", nome:"Vitalidade Vazia"}] },
        nivel5: { resumo: "", concede: [{tipo:"magia", nome:"Raio do Enfraquecimento"}] }
      },
      {
        nome: "Infernal",
        nivel1: { resumo: "Você tem Resistência a dano Ígneo.", concede: [{tipo:"truque", nome:"Raio de Fogo"}] },
        nivel3: { resumo: "", concede: [{tipo:"magia", nome:"Repreensão Diabólica"}] },
        nivel5: { resumo: "", concede: [{tipo:"magia", nome:"Escuridão"}] }
      }
    ]
  }
};
