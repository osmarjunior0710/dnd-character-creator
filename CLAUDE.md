# Instruções pro Claude Code neste repositório

## Sincronização entre sessões/aparelhos

O usuário usa o Claude Code em mais de um lugar (computador e celular, por
exemplo). Não existe sincronização automática entre sessões — o único
ponto de verdade compartilhado é o `origin` no GitHub. Uma sessão pode
avançar o `main` (via commit direto ou PR mesclado) sem que outra sessão,
já em andamento ou aberta depois, saiba disso.

**Por isso, no início de toda sessão de trabalho neste repositório, antes
de fazer qualquer alteração:**

1. Rode `git fetch origin` e `git status`.
2. Se o `main` local estiver atrás do `origin/main`, avise o usuário e
   atualize antes de começar (`git pull --ff-only origin main` — nunca
   force nem descarte trabalho local não commitado sem confirmar antes).
3. Se houver mudanças locais não commitadas de uma sessão anterior,
   avise o usuário sobre o que é antes de decidir descartar, comitar ou
   levar adiante.

Isso evita retrabalho baseado em código desatualizado (já aconteceu:
uma sessão implementou uma feature inteira em cima de uma versão do
`index.html` que já tinha sido reescrita/dividida em `js/*.js` por outra
sessão, 64 commits à frente).

## Fluxo de commit/push

- Prefira abrir PR (branch + `gh pr create`) a dar push direto no `main`
  quando a mudança for grande ou quando o usuário estiver alternando
  entre aparelhos — reduz a chance de duas sessões mexerem na mesma
  coisa ao mesmo tempo sem se ver.
- Sempre termine uma sessão com o trabalho enviado ao GitHub (commit +
  push, ou PR aberto/mesclado) — nunca deixe uma mudança só local. Se
  ficar só local, a próxima sessão (em outro aparelho) não vai saber que
  aquilo existe.

## Versão do app (header)

`js/00-notes-and-state.js` tem uma constante `APP_VERSION`
(`v<ano><mês><dia><hora 24h><minuto>`), mostrada na última linha do
header ao lado do indicador de Salvo/Salvando. Não é o horário em que o
navegador do jogador carregou a página — é "qual versão do código está
rodando", pra ajudar a saber se um relato de bug já inclui um fix
recente (cache do GitHub Pages/navegador pode segurar uma versão velha
por um tempo). Sem build step neste repo, então é mantida na mão:

- Toda vez que for **abrir uma PR nova**, atualize `APP_VERSION` pro
  horário atual (`date -u +"v%Y%m%d%H%M"`) antes do commit que vai nela.
- Se a mesma PR ainda estiver aberta e receber mais commits (ex.: fix
  depois de review, ou mais um item da mesma entrega), **não** bump de
  novo — a versão fica a do primeiro commit da PR até ela mesclar.
- Só bump de novo na PR seguinte.
