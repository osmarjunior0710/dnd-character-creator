// Prova de conceito (não faz parte do app publicado): salvar, listar,
// carregar, exportar e importar uma ficha de teste — sem nenhuma tela ainda,
// o critério de conclusão da Entrega 3 do plano de Fase 1. Usa o backend em
// memória porque este script roda em Node (sem navegador, logo sem
// localStorage) — o backend real de localStorage está implementado ao lado
// e será exercido de verdade quando a UI (Entrega 5) existir.
//
// Rodar: node core/armazenamento/armazenamento.exemplo.ts

import { novaFicha } from "../ficha/schema.ts";
import {
  definirBackend,
  criarBackendMemoria,
  salvarFicha,
  carregarFicha,
  listarFichas,
  exportarFichaComoJson,
  importarFichaDeJson,
} from "./armazenamento.ts";

definirBackend(criarBackendMemoria());

function checar(rotulo: string, condicao: boolean): void {
  console.log(`${rotulo.padEnd(40)} ${condicao ? "OK" : "FALHOU"}`);
  if (!condicao) {
    console.error(`\nProva de armazenamento FALHOU em: ${rotulo}`);
    process.exit(1);
  }
}

const fichaDeTeste = novaFicha("dnd2024", {
  characterName: "Thrain Punho-de-Ferro",
  classe: "Bárbaro",
  especie: "Anão",
  antecedente: "Soldado",
});

// 1. salvar
const id = await salvarFicha(fichaDeTeste, {
  resumo: { nome: "Thrain Punho-de-Ferro", classe: "Bárbaro", especie: "Anão", nivel: 1 },
});
checar("salvarFicha retornou um id", typeof id === "string" && id.length > 0);

// 2. listar
const lista = await listarFichas();
checar("listarFichas encontra a ficha salva", lista.some((r) => r.id === id));
checar("listarFichas traz o resumo sem carregar a ficha inteira", lista[0]?.resumo.nome === "Thrain Punho-de-Ferro");

// 3. carregar
const carregada = await carregarFicha(id);
checar("carregarFicha encontra a ficha", carregada !== null);
checar(
  "carregarFicha traz o mesmo personagem.escolhido salvo",
  JSON.stringify(carregada?.personagem.escolhido) === JSON.stringify(fichaDeTeste.personagem.escolhido)
);

// 4. exportar
const json = exportarFichaComoJson(carregada!);
checar("exportarFichaComoJson produz um JSON válido", (() => { try { JSON.parse(json); return true; } catch { return false; } })());

// 5. importar
const importada = importarFichaDeJson(json);
checar(
  "importarFichaDeJson reproduz a ficha exportada sem perda",
  JSON.stringify(importada) === JSON.stringify(carregada)
);

console.log("\nProva de armazenamento OK — salvar/listar/carregar/exportar/importar funcionam sem nenhuma tela.");
