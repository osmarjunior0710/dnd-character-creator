const GNOMO = {
  nome: "Gnomo",
  flavor: "Povo mágico pequeno, ligado a deuses da invenção e das ilusões, com vida longa (~425 anos). Compensam a estatura com engenhosidade, vivendo em túneis e florestas; divididos entre gnomos das rochas e gnomos do bosque. (Livro do Jogador, pág. 191)",
  tipo: "Humanoide",
  tamanho: {
    opcoes: ["Pequeno"],
    alturas: { "Pequeno": "cerca de 0,90 a 1,20 metro" }
  },
  deslocamento: "9 metros",
  visaoNoEscuro: "18 metros",
  tracosFixos: [
    {
      nome: "Astúcia de Gnomo",
      resumo: "Você tem Vantagem em salvaguardas de Inteligência, Sabedoria e Carisma.",
      concede: []
    }
  ],
  /* Igual ao Draconato: a Linhagem Gnômica NÃO tem escalonamento por nível
     (semEscalonamento) — mas, diferente do Draconato, ela concede itens de
     lista de verdade (truques/magia), não só define um tipo de dano. Por
     isso ainda precisa da escolha de atributo de conjuração, como o
     Tiferino. */
  subespecie: {
    nome: "Linhagem Gnômica",
    escolhidaNaCriacao: true,
    semEscalonamento: true,
    opcoes: [
      {
        nome: "Gnomo das Rochas",
        nivel1: {
          resumo: "Você pode gastar 10 minutos conjurando Prestidigitação Arcana para fabricar um dispositivo mecânico minúsculo (CA 5, 1 PV) — um brinquedo, isqueiro mecânico ou caixa de música, por exemplo. <br>Ao fabricar, você escolhe um efeito de Prestidigitação Arcana; o dispositivo produz esse efeito sempre que alguém executa uma Ação Bônus pra ativá-lo com um toque. <br>Você pode ter até 3 desses dispositivos ao mesmo tempo; cada um se desfaz 8 horas depois de fabricado (ou quando desmontado com um toque).",
          concede: [ {tipo:"truque", nome:"Prestidigitação Arcana"}, {tipo:"truque", nome:"Reparar"} ]
        },
        nivel3: null,
        nivel5: null
      },
      {
        nome: "Gnomo do Bosque",
        nivel1: {
          resumo: "Você sempre tem a magia abaixo preparada. Pode conjurá-la sem gastar um espaço de magia um número de vezes igual ao seu Bônus de Proficiência, recuperando todos os usos ao completar um Descanso Longo — ou pode conjurá-la usando qualquer espaço de magia que tiver.",
          concede: [ {tipo:"truque", nome:"Ilusão Menor"}, {tipo:"magia", nome:"Falar com Animais"} ]
        },
        nivel3: null,
        nivel5: null
      }
    ]
  }
};
