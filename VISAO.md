# VISÃO DO PROJETO — Plataforma de RPG (sem nome definido)

> Documento vivo. É a fonte de verdade sobre **para onde o projeto vai** e **por quê**.
> Decisões técnicas de curto prazo continuam na nota de arquitetura do código.
> Ao concluir uma fase, atualize a seção STATUS e o log de decisões deste arquivo.
>
> **Nota para quem lê isso sem saber programar:** este documento assume que você,
> como PM/designer, vai auditar se o código respeita as fronteiras descritas aqui —
> não que você vai escrever ou revisar código linha a linha. A seção 0 explica como
> fazer essa auditoria mesmo sem saber ler código.

---

## 0. GLOSSÁRIO E COMO AUDITAR SEM SABER PROGRAMAR

**SRD (System Reference Document):** documento que a Wizards of the Coast publica
com uma fatia das regras de D&D liberada para uso por terceiros — parte das classes,
magias, itens, regras de combate. Não é o livro inteiro: fora do SRD ficam a maioria
dos monstros, cenários oficiais e boa parte do conteúdo de ambientação.

**CC-BY-4.0:** a licença sob a qual o SRD é publicado. Permite uso comercial,
inclusive venda, desde que você dê crédito à Wizards. É a licença que praticamente
todo produto de terceiros para D&D usa hoje.

**Por que separar SRD de "resto do livro"/homebrew:** o criador de ficha atual usa
o PHB 2024 inteiro (direitos reservados) e material de UA. Isso é normal e sem
problema como projeto pessoal/gratuito. Vira problema legal apenas no dia em que
o projeto cobrar dinheiro — e nesse dia você precisa saber, item por item, o que
pode ser vendido (SRD), o que não pode (resto do PHB) e o que é seu (homebrew,
criado por você ou pelo usuário). Não é um bloqueio agora, é uma marcação a fazer
desde já para não precisar re-auditar tudo depois.

**LGPD (Lei Geral de Proteção de Dados):** lei brasileira que regula o que se pode
fazer com dado pessoal de usuário (e-mail, nome, o que ele joga). Só vira relevante
quando existir login/conta. Não é motivo de medo — é motivo para não guardar mais
dado do que o necessário e ter uma política de privacidade quando chegar a hora.

**Como auditar fronteira de código sem ler código, na prática:**
Peça ao Claude Code, a cada entrega relevante, para responder três perguntas em
português antes de você aceitar:
1. "Essa mudança escreveu alguma regra específica de D&D fora da pasta de dados
   do D&D?" (resposta esperada: não)
2. "Essa mudança salva ou lê ficha em algum lugar que não seja a camada de
   armazenamento (§5.1)?" (resposta esperada: não)
3. "Que arquivos essa mudança tocou, e por quê?"
Se a resposta 1 ou 2 for "sim", pare e pergunte o motivo antes de aceitar — mesmo
sem entender o código, você já sabe que a fronteira foi violada.

## 1. O QUE É

Uma plataforma web para jogadores de RPG de mesa. **Não** é um repositório de livros
(risco de direito autoral) e **não** é um VTT de combate tático. É um **assistente de
mesa**: ferramentas que tiram do jogador o trabalho de decorar regras e fazer contas,
para mesas que acontecem presencialmente ou com amigos por voz.

**Diferencial pretendido:** ficha viva, em português, para mesa presencial.
Roll20 / Foundry / D&D Beyond atendem mal esse nicho — são feitos para jogo remoto,
em inglês, e centrados no mapa.

**Sobre parecer "vários produtos":** a experiência final pode (e deve) ser tão
integrada quanto o Roll20 — ficha, mestre e mapa na mesma interface, um produto só
do ponto de vista de quem joga. O roadmap separa isso em fases de *lançamento*,
não de *arquitetura*: cada fase entrega algo público e usável antes de começar a
próxima, em vez de sumir meses construindo tudo junto para lançar de uma vez.

**Público inicial:** comunidade brasileira de RPG. Inglês vem depois (ver §8).

## 2. STATUS ATUAL

- Wizard de criação de personagem D&D 2024, vanilla HTML/CSS/JS, GitHub Pages.
- Cobre: 12 classes do PHB 2024 + Psiônico (UA 2025) no nível 1, 16 antecedentes,
  espécies, idiomas, sistema de loja com 179 itens.
- Dados em `data/*.js` (um arquivo por classe + arquivos de maestria de arma,
  idiomas, instrumentos, itens de loja).
- Regras de cálculo consolidadas em `regras.md`.
- Termina em resumo para copiar manualmente ou export de ficha em PDF editável.
  **Este é o MVP que prova que a ideia é viável — está entregue (Fase 0).**

## 3. PRINCÍPIOS INEGOCIÁVEIS

1. **Uma fase por vez, em produção.** Cada fase termina com algo público e usável.
2. **Dados separados de motor, motor separado de UI, UI separada de onde se salva.**
   Esta é a decisão estrutural que permite tudo que vem depois. Detalhada em §5.
3. **Não abstrair antes da segunda instância existir.** Desenhar a costura, não
   construir o framework genérico. Abstração feita contra um único sistema
   (ou um único destino de armazenamento) quase sempre sai errada.
4. **A ficha do usuário é sagrada.** Nenhuma mudança pode corromper ficha existente.
   Schema versionado desde o dia 1, com migração automática.
5. **Só conteúdo licenciável no produto pago.** Ver §9.
6. **O gargalo é revisão, não geração de código.** Entregas pequenas e verificáveis.
7. **Todo código relevante é comentado em português, explicando o "porquê", não
   só o "o quê".** Isso não é estilo — é o que permite a você, sem ler código
   fluentemente, entender a intenção de um trecho e notar quando algo foge do
   combinado. Peça isso explicitamente ao Claude Code em toda sessão.

## 4. ARQUITETURA-ALVO

Três camadas, com fronteiras explícitas:

```
data/rulesets/dnd2024/*     → dados puros de regras (classes, magias, itens...)
core/                       → motor de ficha: estado, recursos, cálculos, rolagem
ui/                         → React (componentes, wizard, ficha viva)
```

**Regra de ouro:** `core/` nunca contém constante específica de D&D. Se aparecer
algo como "se a classe for Bárbaro" dentro de `core/`, a fronteira foi violada —
isso pertence aos dados do ruleset ou a um adaptador do ruleset. Esta é
exatamente a pergunta 1 do checklist de auditoria em §0.

**Sobre multi-sistema (D&D hoje, outros sistemas — inclusive muito diferentes,
como Vampiro a Máscara — no futuro):** o objetivo agora não é suportar um segundo
sistema, é garantir que suportá-lo depois não exija reescrever tudo. Vampiro não
tem "espaço de magia", tem Humanidade e Fome — mas ambos são formas de "recurso
que enche e esvazia dentro de limites", e "condição" já existe como conceito
genérico. Concretamente: todo dado de D&D 2024 vive sob `data/rulesets/dnd2024/`,
e nada fora dessa pasta assume que D&D existe. Quando o segundo sistema chegar,
cria-se uma pasta de dados nova; o quanto do motor é reaproveitado se mede então,
não se garante agora.

**Migração para React:** é reescrita da **camada de UI**, não do projeto.
Os arquivos `data/*.js` são o ativo mais valioso e migram praticamente intactos.
O que muda é a manipulação manual de DOM, que inviabilizaria uma ficha reativa.

## 5. ARMAZENAMENTO — separar "o que a ficha faz" de "onde ela mora"

Esta é a decisão que resolve a dúvida de "será que vou ter que refazer tudo se
decidir salvar na nuvem depois". A resposta é: não, se a camada abaixo existir
desde o primeiro código da ficha editável.

### 5.1 A camada de armazenamento

A UI (componentes de HP, magias, inventário, botões de usar habilidade) **nunca**
fala diretamente com `localStorage`, arquivo ou servidor. Ela fala só com três
funções:

```
salvarFicha(ficha)
carregarFicha(id)
listarFichas()
```

Hoje, por dentro, essas três funções escrevem em `localStorage` do navegador.
Se um dia houver conta na nuvem, troca-se apenas o miolo dessas três funções para
chamar um servidor — a ficha, os componentes, a lógica de usar habilidade, nada
disso muda uma linha. É o mesmo princípio de "separar dados de motor" (§4),
aplicado a onde salvar em vez de que regras usar.

**Consequência prática:** você não precisa decidir "nuvem ou não" agora. Precisa
só garantir que ninguém escreva direto em `localStorage` fora dessa camada —
essa é a pergunta 2 do checklist de auditoria em §0.

### 5.2 Schema da ficha — o artefato mais importante do projeto

O objeto de ficha em JSON é o contrato de longo prazo do projeto inteiro.

- Campo `schemaVersion` (inteiro) na raiz, desde a primeira versão.
- Toda leitura de ficha passa por uma função de migração que eleva versões
  antigas até a atual. Ficha antiga nunca quebra.
- Separar **o que foi escolhido** de **o que foi calculado**. Persistir escolhas;
  recalcular derivados na carga. Se a regra de CA mudar, fichas salvas se
  corrigem sozinhas.
- Separar **o personagem** (imutável entre sessões: classe, atributos, equipamento)
  do **estado de jogo** (HP atual, condições, recursos gastos, dinheiro).
- Identificadores estáveis e legíveis (`"barbaro"`, não índice numérico).
- Campo de origem por item de conteúdo (`SRD` / `não-SRD` / `homebrew`) — ver §9.
  Classificar isso depois, item a item, é retrabalho garantido.

## 6. ROADMAP

### Fase 1 — Fundação React + schema (próxima)
- Migrar o wizard existente para React, sem adicionar funcionalidade nova.
- Definir e implementar o schema de ficha v1 (§5.2).
- Implementar a camada de armazenamento (§5.1) com back-end em `localStorage`.
- Export / import de arquivo `.json` como cópia de segurança manual.
- Manter o export em PDF funcionando.
- **Critério de conclusão:** paridade total com a versão vanilla, mais
  import/export e a camada de armazenamento em funcionamento.

### Fase 2 — Ficha editável (o "pouco a mais" que justifica o próximo passo)
Primeiro produto público além do MVP. Ficha que deixa de ser estática e passa a
acompanhar a campanha, sempre através da camada de armazenamento definida na
Fase 1:
- HP atual/máximo, HP temporário, dados de vida.
- Condições (com o texto da regra acessível).
- Descanso curto e longo (recuperação automática dos recursos corretos).
- Recursos de classe com usos gastos/recuperados.
- Magias preparadas e espaços de magia.
- Inventário e dinheiro.
- Rolagem de dados integrada, com log da sessão.
- **Persistência:** local, via camada de armazenamento — decisão de nuvem
  fica livre para depois, sem custo de retrabalho.
- **Isca de demanda:** botão "Salvar na nuvem" que coleta e-mail para lista de
  espera. Mede apetite real antes de qualquer gasto com infraestrutura.

### Fase 3 — XP e evolução de nível
Deliberadamente separada: exige progressão completa das 13 classes, escolhas de
subclasse, talentos e magias novas. É essencialmente um segundo wizard.
- **Atalho na Fase 2:** permitir editar o nível manualmente, sem automação.
  Cobre a maior parte da dor por uma fração do esforço.

### Fase 4 — Contas e nuvem
A fronteira em que o projeto deixa de ser hobby e vira operação: custo recorrente,
LGPD, backup, suporte, incidentes. Só cruzar com demanda comprovada (Fase 2).
- Login, ficha na nuvem, multi-dispositivo.
- O schema não muda: mesmo objeto, outro lugar — troca-se só o miolo de §5.1.

### Fase 5 — Mesa e mestre
- Grupos/campanhas, mestre vê as fichas dos jogadores.
- Distribuir XP, itens, mensagens secretas durante a partida.
- Continua sendo apoio a uma mesa real, **não** um chat.

### Fase 6 — Campanha com IA
- Interface de ficha + narrador de IA, usando personagens salvos.
- **Custo variável por resposta.** Sistema de créditos e limite rígido de gasto
  são requisitos de lançamento, não melhorias futuras.

### Fase 7 — Mapas / combate visual
Prioridade mais baixa por decisão explícita: é a parte mais cara de construir e
onde a concorrência é mais forte. Pode nunca ser feita.

## 7. INTERNACIONALIZAÇÃO

PT-BR primeiro, inglês depois. Consequência prática desde a Fase 1: nenhuma
string de interface hardcoded em componente — todo texto visível sai de arquivo
de tradução. Nomes de regra (classes, magias, condições) precisam de identificador
estável independente do idioma exibido.

## 8. LICENCIAMENTO — restrição de produto pago

Ver definições de SRD e CC-BY-4.0 em §0. Resumo da ação prática:

- Marcar na base de dados a origem de cada item (`SRD` / `não-SRD` / `homebrew`) —
  já incluído no schema, §5.2.
- Conteúdo não-SRD não pode ser distribuído como parte de produto pago.
- Incluir a atribuição exigida pela CC-BY quando houver cobrança.
- Não usar marcas, logos ou o nome "Dungeons & Dragons" como se fosse produto oficial.
- Sem custo/urgência enquanto o projeto for gratuito.

## 9. MONETIZAÇÃO

Adiada por decisão consciente. Não construir infraestrutura de pagamento antes da
Fase 4. Direção provável, a revisar quando houver usuários: gratuito com o
essencial da ficha, pago para nuvem/campanha/IA, cosméticos (dados, avatares,
temas de ficha) como compra avulsa. Anúncios foram considerados e descartados
como prioridade — receita baixa em relação ao dano à experiência.

### 9.1 A linha real: conteúdo, não valor cobrado

Não é orientação jurídica formal — é uma linha de segurança prática. Ads, Pix de
doação e cobrar R$1 são, para efeito de licença, a mesma coisa: dinheiro
circulando por causa do conteúdo. A licença do SRD não olha *quanto* se cobra,
olha *o que* foi usado para construir o produto.

- **Conteúdo dentro do SRD 5.2.1** (parte das classes, magias, itens, regras de
  combate — não é o PHB inteiro) pode ser monetizado de qualquer forma: ads,
  doação, assinatura, cobrança avulsa — desde que com a atribuição correta
  (§9.2). Isso vale mesmo com fins comerciais e para plataformas de apoio
  contínuo.
- **Conteúdo fora do SRD** (o restante do PHB 2024, material de UA, nomes e
  monstros icônicos como Strahd) não pode ser usado como base de nada monetizado
  — nem com ads, nem com doação, nem por R$1. O valor cobrado é irrelevante;
  o que importa é que esse conteúdo não é livre para redistribuição.
- **Enquanto o projeto for 100% gratuito, sem ads e sem doação**, usar PHB
  completo/UA é uso pessoal e o risco é baixo. O ponto de atenção é o dia em
  que qualquer dinheiro passar a entrar — a partir daí, o que fica exposto ao
  público pagante precisa vir só do SRD ou ser homebrew.

Consequência prática: o campo de origem por item no schema (§5.2) não é
burocracia antecipada — é o que permite, no dia da monetização, filtrar o
catálogo sem reescrever o motor.

### 9.2 Onde pegar o SRD e a atribuição exigida

PDF oficial (inglês), gratuito, direto da Wizards of the Coast:
`https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf`

Tradução comunitária PT-BR (Artifício RPG), também sob CC-BY-4.0:
`https://artificiorpg.com/wp-content/uploads/2025/05/SRD-2024-PT-BR-v5.5.9.pdf`

**Atenção:** a tradução é uma camada de licença separada da original. O texto
traduzido em si é obra derivada protegida por direito autoral do Artifício RPG,
sob a lei brasileira 9.610/98 — eles liberam uso comercial, mas exigem
atribuição própria além da atribuição à Wizards. Se o site usar essa tradução
como fonte de texto, são **duas** notas de atribuição no rodapé quando houver
monetização, não uma só.

Ele já traz o texto de atribuição exigido pela licença CC-BY-4.0, que deve ser
incluído (por exemplo no rodapé do site) assim que houver qualquer monetização:

> This work includes material from the System Reference Document 5.2.1
> ("SRD 5.2.1") by Wizards of the Coast LLC, available at
> https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative
> Commons Attribution 4.0 International License, available at
> https://creativecommons.org/licenses/by/4.0/legalcode.

A licença é mundial, sem royalties, não exclusiva e **irrevogável** — uma vez
que o conteúdo usado é só SRD e a atribuição está correta, a Wizards não pode
retirar essa permissão depois.

## 10. INFRAESTRUTURA — do GitHub Pages a algo maior

Não é preciso infraestrutura nova até a Fase 4 (contas/nuvem). As Fases 1–3
continuam cabendo em hospedagem estática gratuita — só troca-se o serviço de
hospedagem, sem banco de dados ainda.

### 12.1 Sequência, amarrada ao roadmap

| Quando | O que muda | Ferramenta sugerida |
|---|---|---|
| Fase 1 | Hospedagem estática com build automático (a cada push no GitHub, o site atualiza sozinho) | Netlify (ou Vercel/Cloudflare Pages) |
| Fase 1 | Domínio próprio (opcional, pode ser feito a qualquer momento, independente do resto) | Registro.br (`.com.br`) ou Namecheap/GoDaddy (`.com`) |
| Fase 2–3 | Nada novo de infraestrutura — continua estático, ficha salva local (§5.1) | mesmo Netlify |
| Fase 4 | Conta de usuário + banco de dados na nuvem | Supabase |
| Fase 6 | Chamadas de IA (custo variável por resposta) | API da Anthropic, chamada a partir de uma função no Supabase/Netlify |

**Por que Netlify em vez de continuar no GitHub Pages:** GitHub Pages é hospedagem
básica — sem build automático de projeto React sofisticado e mais limitado para
uso comercial. Netlify conecta direto no repositório GitHub, faz o build sozinho
a cada entrega do Claude Code, e permite uso comercial já no plano gratuito —
evita trocar de plataforma de novo se o projeto for monetizado depois.

**Por que Supabase na Fase 4:** entrega banco de dados relacional, autenticação
de usuário e armazenamento de arquivo numa ferramenta só, com plano gratuito que
permite uso comercial — evita integrar três serviços separados para resolver
"criar conta" + "salvar ficha na nuvem".

### 12.2 O ponto de atenção do Supabase: pausa por inatividade

No plano gratuito, um projeto sem nenhum acesso por 7 dias seguidos pausa
sozinho até alguém reativar manualmente. **Não há perda de dado** — a ficha
salva continua intacta — mas a reativação não é instantânea, e isso pode
assustar num teste ao vivo se ninguém souber que vai acontecer.

Isso é relevante especificamente para o padrão de uso esperado do projeto:
sessão de RPG a cada ~15 dias, com poucos usuários no início. Nesse ritmo, a
pausa por inatividade é bem provável de acontecer sem os pings abaixo.

**Detalhe que reduz o risco:** a pausa é por atividade do projeto inteiro, não
por grupo de jogo — qualquer acesso de qualquer pessoa conta. O risco real de
pausa existe principalmente enquanto for só uma mesa testando esporadicamente;
some naturalmente com mais de um grupo usando.

**Duas soluções, ambas gratuitas, resolver na Fase 4 junto com a criação do
projeto Supabase:**

1. **Ping automático externo.** Serviço gratuito (ex.: UptimeRobot) faz uma
   requisição vazia ao banco a cada poucos dias só para mantê-lo ativo.
   Configuração única via formulário, sem código.
2. **Cron do GitHub Actions.** Já que o projeto mora no GitHub, uma ação
   agendada (gratuita) pode bater no banco periodicamente. Fica no mesmo lugar
   que o resto do código; o Claude Code monta isso quando chegar a hora.

Qualquer um dos dois evita a pausa por completo. Ação para a Fase 4: configurar
um dos dois já na criação do projeto Supabase, não depois de um susto.

## 11. REGRAS DE TRABALHO

- Comentar código relevante em português, explicando a intenção — não é estilo,
  é o que permite auditoria de fronteira sem ler código fluentemente (§0, §3.7).
- A cada entrega relevante, responder o checklist de auditoria de §0 antes de
  considerar a entrega concluída.
- Sempre conferir com `grep` antes de entregar código. Nunca supor que um padrão
  se repete igual entre classes.
- Rodar `node --check` (ou equivalente do build) antes de entregar.
- Usar arquivos estruturados existentes (planilhas, `data/*.js`, `regras.md`)
  antes de recorrer ao PDF do livro.
- Manter a nota de arquitetura do código atualizada; este arquivo cobre a visão.
- Trabalhar em passos pequenos e validar o conceito antes de implementar.
- Pendências abertas continuam registradas no código, não aqui.

## 12. LOG DE DECISÕES

| Data | Decisão | Motivo |
|---|---|---|
| 2026-08 | Migrar para React na Fase 1 | Ficha viva reativa é inviável com DOM manual |
| 2026-08 | Camada de armazenamento trocável desde a Fase 1 | Adiar decisão de nuvem sem custo de retrabalho |
| 2026-08 | Mapas/VTT em último lugar | Maior custo, maior concorrência, menor diferencial |
| 2026-08 | Level up separado da ficha editável | Escopo equivalente a um segundo wizard |
| 2026-08 | Multi-sistema: costura sim, framework não | Abstrair contra um sistema só produz abstração errada |
| 2026-08 | i18n estrutural desde a Fase 1 | Barato agora, caríssimo depois |
| 2026-08 | Fases são de lançamento, não de arquitetura | Produto final pode ser integrado como o Roll20 |
| 2026-08 | Comentários em português + checklist de auditoria obrigatórios | PM não lê código fluentemente; precisa de meio de verificar fronteiras |
| 2026-08 | Netlify (não GitHub Pages) a partir da Fase 1; Supabase só na Fase 4 | Build automático e uso comercial liberado desde já; banco de dados só quando houver conta |
| 2026-08 | Ping automático configurado junto com o Supabase na Fase 4 | Uso esperado é esporádico (sessão a cada ~15 dias); evita pausa por inatividade do plano gratuito |
