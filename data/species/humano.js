const HUMANO = {
  nome: "Humano",
  flavor: "A espécie mais numerosa e variada do multiverso, presente em praticamente todo cenário conhecido. Ambiciosos e adaptáveis; sem traço sobrenatural marcante, mas versáteis em habilidades práticas. (Livro do Jogador, pág. 193)",
  tipo: "Humanoide",
  tamanho: {
    opcoes: ["Médio", "Pequeno"],
    alturas: { "Médio": "cerca de 1,20 a 2,10 metros", "Pequeno": "cerca de 0,60 a 1,20 metro" }
  },
  deslocamento: "9 metros",
  visaoNoEscuro: null,
  tracosFixos: [
    {
      nome: "Eficiente",
      resumo: "Você adquire Inspiração Heroica sempre que completar um Descanso Longo.",
      concede: []
    }
  ],
  /* Hábil e Versátil são escolhas SIMPLES (perícia avulsa da lista de perícias,
     talento avulso da categoria Origem) — não são uma "subespécie" com
     sub-opções estruturadas por nível, então ficam fora do campo `subespecie`
     e são tratadas direto na tela de render (usam ALL_SKILLS e FEAT_DETAILS,
     que já existem no app). */
  subespecie: null
};
