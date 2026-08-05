/* Equivalência entre o TEXTO do equipamento inicial de classe/antecedente
   (equipmentA/B/C, arrays de string livre) e o ID real de um item de
   data/shop-items.js — usada por resolveEquipmentText() (index.html) pra
   montar a "mochila do jogador" (itens herdados + comprados) na Loja.

   A maioria do texto já bate EXATO com o nome (n) de um item da Loja —
   resolveEquipmentText() tenta isso primeiro, sem precisar de entrada
   aqui. Esta tabela só cobre os casos que NÃO batem exato:
   - Quantidade embutida no texto ("20 Flechas" -> 1x o pacote "Flechas
     (20)" da Loja, não 20x um item "Flecha" que não existe avulso).
   - Formatação diferente (parênteses vs. travessão, variante genérica
     vs. específica).
   - Texto ambíguo mapeado pra UMA interpretação razoável, documentada
     no comentário ao lado (ex: "Estojo" do Psiônico, perto de Besta
     Leve/Virotes, quase certamente é o estojo de virote).

   Texto SEM entrada aqui E sem match exato de nome (ex: "Símbolo
   Sagrado" sozinho — a Loja só vende as 3 variantes Amuleto/Emblema/
   Relicário, texto genérico não diz qual) fica como item de sabor na
   mochila, sem ID — não força uma variante que o jogador não escolheu.
   Os placeholders "{ferramenta}" (antecedente), "Instrumento Musical à
   escolha" (Bardo) e "Ferramenta/Instrumento escolhido" (Monge) são
   resolvidos à parte, dinamicamente, não entram nesta tabela estática. */
const EQUIPMENT_ALIASES = {
  "4 Machadinhas": {id:"machadinha", qty:4},
  "2 Adagas": {id:"adaga", qty:2},
  "5 Adagas": {id:"adaga", qty:5},
  "8 Azagaias": {id:"azagaia", qty:8},
  "6 Azagaias": {id:"azagaia", qty:6},
  "20 Flechas": {id:"flechas-20", qty:1},
  "20 Virotes": {id:"virotes-20", qty:1},
  "2 Algibeiras": {id:"algibeira", qty:2},
  "2 Fantasias": {id:"roupas-fantasia", qty:2},
  "Fantasia": {id:"roupas-fantasia", qty:1},
  "Foco Arcano (orbe)": {id:"foco-arcano-orbe", qty:1},
  "Foco Arcano (cristal)": {id:"foco-arcano-cristal", qty:1},
  "Foco Arcano (Cajado)": {id:"foco-arcano-cajado", qty:1},
  "Foco Druídico (Cajado)": {id:"foco-druidico-cajado-de-madeira", qty:1},
  "Foco Druídico (ramo de visco)": {id:"foco-druidico-ramo-de-visco", qty:1},
  "Livro (conhecimento oculto)": {id:"livro", qty:1},
  "Livro de Magias": {id:"livro", qty:1},
  "Livro (orações)": {id:"livro", qty:1},
  "Livro (filosofia)": {id:"livro", qty:1},
  "Livro (história)": {id:"livro", qty:1},
  "Pergaminho (10 folhas)": {id:"pergaminho-folha-em-branco", qty:10},
  "Pergaminho (12 folhas)": {id:"pergaminho-folha-em-branco", qty:12},
  "Pergaminho (8 folhas)": {id:"pergaminho-folha-em-branco", qty:8},
  "Óleo (3 frascos)": {id:"oleo-frasco", qty:3},
  "Balde de Ferro": {id:"balde", qty:1},
  "Espelho": {id:"espelho-de-mao", qty:1},
  "Corda": {id:"corda-15m", qty:1},
  // Psiônico carrega Besta Leve + 20 Virotes — "Estojo" quase certo é o
  // de guardar virote, não o de mapa/pergaminho (mesmo custo nos dois).
  "Estojo": {id:"estojo-virote-de-besta", qty:1},
  // Interpretado como "uma mochila" (item genérico) — não existe item
  // "Mochila de Explorador de Masmorras" avulso na Loja, só a Mochila
  // dentro do conteúdo do Kit de Explorador de Masmorras.
  "Mochila de Explorador de Masmorras": {id:"mochila", qty:1},
  // Ambíguo de propósito — a Loja vende só as 3 variantes específicas
  // (Amuleto/Emblema/Relicário), o texto da classe não escolhe qual.
  "Símbolo Sagrado": null
};
