/* 09-init.js — Inicialização: restore() do save + 1ª renderização.
   Extraído de index.html (linhas 4701-4710 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
async function init(){
  document.getElementById('appVersion').textContent = APP_VERSION;
  await restore();
  render();
}
init();
