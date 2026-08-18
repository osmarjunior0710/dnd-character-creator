// Prova de conceito (não faz parte do app publicado): mostra que uma ficha
// no formato que o wizard vanilla monta hoje em `data`
// (js/00-notes-and-state.js, linha ~1292) cabe inteira em `personagem.escolhido`
// do schema v1 e sobrevive a um ciclo salvar→carregar (JSON.stringify →
// JSON.parse) sem perder ou alterar nenhum valor — o critério de conclusão
// da Entrega 1 do plano de Fase 1.
//
// Rodar: node core/ficha/schema.exemplo.ts

import { novaFicha, migrarFicha, type FichaV1 } from "./schema.ts";

// Recorte fiel do objeto `data` real (mesmos campos, valores plausíveis de
// um personagem realmente escolhido) — não é uma versão simplificada.
const dataDeExemplo: Record<string, unknown> = {
  characterName: "Thrain Punho-de-Ferro",
  especie: "Anão",
  antecedente: "Soldado",
  classe: "Bárbaro",
  alinhamento: "Leal e Bom",
  equippedArmorId: null,
  equippedShieldId: null,
  tiefling: { tamanho: null, legado: null, atributoLegado: null },
  pequenino: {},
  anao: {},
  orc: {},
  humano: { tamanho: null, pericia: null, talento: null },
  draconato: { heranca: null },
  elfo: { pericia: null, linhagem: null },
  gnomo: { linhagem: null, atributoLinhagem: null },
  golias: { ancestralidade: null },
  aasimar: { tamanho: null },
  soldado: {
    abilityPlan: "A",
    equipment: "A",
    habilidoso: [],
    ferramentaEscolhida: "Kit de Jogos (Dados)",
    iniciadoCantrips: [],
    iniciadoSpell1: [],
  },
  barbaro: { skills: ["Intimidação", "Sobrevivência"], maestria: ["Machado Grande"], equipment: "A" },
  idiomas: { comuns: ["Anão"], extra: [] },
  attrs: { Força: 15, Destreza: 13, Constituição: 14, Inteligência: 10, Sabedoria: 12, Carisma: 8 },
  shop: { purchases: { "racao-de-viagem": 5 }, collapsedCats: {}, filterByProf: false },
  returnToSummary: false,
  freeAbilityRule: false,
};

function estruturasIguais(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

const ficha: FichaV1 = novaFicha("dnd2024", dataDeExemplo);

// Ciclo completo salvar → carregar, exatamente como a camada de
// armazenamento (Entrega 3) vai fazer contra localStorage/arquivo .json.
const salva = JSON.stringify(ficha);
const carregada = migrarFicha(JSON.parse(salva));

const semPerda = estruturasIguais(ficha.personagem.escolhido, carregada.personagem.escolhido);
const versaoOk = carregada.schemaVersion === 1;
const calculadoReservado = carregada.personagem.calculado === null;
const estadoDeJogoReservado = typeof carregada.estadoDeJogo === "object";

console.log("schemaVersion preservada:      ", versaoOk ? "OK" : "FALHOU");
console.log("personagem.escolhido sem perda:", semPerda ? "OK" : "FALHOU");
console.log("personagem.calculado reservado:", calculadoReservado ? "OK" : "FALHOU");
console.log("estadoDeJogo reservado:        ", estadoDeJogoReservado ? "OK" : "FALHOU");

if (!versaoOk || !semPerda || !calculadoReservado || !estadoDeJogoReservado) {
  console.error("\nProva de losslessness FALHOU.");
  process.exit(1);
}
console.log("\nProva de losslessness OK — ficha equivalente ao `data` do wizard vanilla sobrevive ao ciclo salvar/carregar sem perda.");
