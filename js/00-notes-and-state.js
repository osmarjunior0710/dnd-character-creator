/* 00-notes-and-state.js — Notas de arquitetura/histórico do projeto + modelo de dados (data/step), listas mestras de classe/espécie/antecedente, consts compartilhadas (STANDARD_ARRAY, ABILITIES, BACKGROUND_INFO, CLASS_INFO), utilitários (mod/fmt/fmtGold), persist()/restore().
   Extraído de index.html (linhas 72-1428 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
/* ==========================================================================
   MAPA DOS ARQUIVOS EM js/ — o app inteiro era 1 <script> só de ~4600 linhas
   dentro do index.html (achado numa revisão geral: difícil de navegar, "código
   monolítico"). Dividido em 10 arquivos carregados em sequência (ordem importa
   MENOS do que parece — são todos script clássico global, funções são
   hoisted, e nada executa de verdade até init() no final; mas mantenha a
   ordem abaixo por consistência com o <body> do index.html):
     00-notes-and-state.js       — esta nota + modelo de dados + persist/restore
     01-wizard-nav.js            — render() dispatcher, navegação, validação, Randomizar
     02-render-helpers.js        — spellChoiceList/traitBox/choiceGrid e afins
     03-species-steps.js         — Passo de Espécie (grade + 10 telas de detalhe)
     04-background-steps.js      — Passo de Antecedente + floaters globais (Mochila/Perícias e Talentos/Randomizar)
     05-class-steps.js           — Passo de Classe (grade + 13 telas de detalhe)
     06-idiomas-attrs-shop.js    — Passos de Idiomas, Atributos e a Loja
     07-compute-and-summary.js   — cálculo do personagem (computeCharacterSheet) + Resumo
     08-handlers.js              — reset do wizard + TODOS os handlers "pick"/"toggle" de cada escolha
     09-init.js                  — restore() + 1ª renderização
   Split MECÂNICO (corte só em fronteiras de function/const de topo, nunca no
   meio de uma), sem reordenar nada — cada arquivo tem o conteúdo ORIGINAL de
   um intervalo de linhas do index.html antigo, só isso. Não é uma divisão
   100% pura por assunto (ex: os floaters da Mochila ficaram dentro do
   arquivo de Antecedente porque é ONDE ELES JÁ ESTAVAM no arquivo original)
   — decisão consciente: reordenar também traria risco sem ganho real.
   ========================================================================== */
/* ==========================================================================
   NOTA PARA A PRÓXIMA INSTÂNCIA DO CLAUDE — leia antes de editar este arquivo
   ==========================================================================
   Este é um assistente de criação de personagem D&D 2024 (estilo Roll20):
   passo a passo, só libera "Avançar" quando a etapa está completa, com foco
   automático (scroll + destaque) na primeira seleção faltante.

   🚀 MIGRAÇÃO PRO CLAUDE CODE (a partir daqui o trabalho de código passa a
   acontecer no terminal, com acesso direto ao repo — não mais em chat com
   arquivos anexados manualmente). Se você é essa sessão do Claude Code,
   comece por aqui:
   1. Leia esta nota inteira antes de tocar em qualquer arquivo — ela tem
      o histórico de decisões, convenções e armadilhas já conhecidas do
      projeto. Sim, é longa; leia mesmo assim.
   2. Confirme que enxerga o repo inteiro (index.html, todo js/*.js — ver
      MAPA DOS ARQUIVOS logo acima —, todo data/*.js, css/styles.css) antes
      de assumir que algo "não existe" — o chat anterior teve que pedir
      arquivos um por um porque não tinha acesso direto, e isso já causou
      pelo menos um caso de recriar um arquivo (styles.css) de memória por
      não ter certeza se existia. Isso não deveria mais acontecer aqui.
   3. Lista consolidada de pendências abertas (compiladas de várias notas
      espalhadas pelo arquivo, cada uma com mais detalhe no bloco da
      seção correspondente — procure pelo texto entre aspas):
      - ✅ RESOLVIDO (Claude Code): "floater/painel fixo" — inventário do
        personagem (classe + antecedente + compras da loja) sempre
        visível. Virou um floater no canto superior direito
        (renderMochilaFloater(), pill "🎒 Mochila (clique para abrir/
        fechar)") visível em QUALQUER passo do wizard a partir do
        momento em que há classe ou antecedente escolhido — não só na
        Loja, como uma 1ª versão interna desta mesma sessão tinha feito
        (painel embutido, substituído por pedido do usuário: "não
        precisa ter ui atrás dele... pode ficar voando mesmo"). Clicar
        abre um popup (renderMochilaPopup(), mochilaOpen controla
        aberto/fechado — estado de UI puro, não entra em `data`/
        persist()) com o mesmo conteúdo de antes. Passo prévio
        necessário: itens da Loja ganharam um
        "id" estável (data/shop-items.js), e data/equipment-aliases.js
        cruza o texto livre do equipamento inicial de classe/antecedente
        com esse id (ver characterStartingItems()/mochilaItems() em
        index.html). De brinde: Bardo e Monge ganharam seletor de
        verdade pro instrumento/ferramenta do equipamento (antes só
        texto placeholder nunca resolvido — Bardo reaproveita o 1º dos
        3 instrumentos escolhidos na proficiência, Monge ganhou um
        seletor novo de 2 níveis, categoria + item específico).
      - ✅ RESOLVIDO (Claude Code), e com um desenho diferente do que a
        pendência original sugeria: em vez de filtrar a Loja
        automaticamente, virou um checkbox opcional "Filtrar por
        proficiência" (desligado por padrão — a Loja mostra TUDO por
        padrão pra qualquer classe, decisão do usuário: "assim todo mundo
        sabe de tudo que pode fazer/comprar"). Com o checkbox ligado,
        usa itemMatchesWeaponProf() (perto de renderShop()) pra filtrar
        por propriedade individual via WEAPON_MASTERY — Ladino
        (weaponProfFiltroMarcial=["Acuidade","Leve"]) e Monge
        (weaponProfMeleeOnly=true + weaponProfFiltroMarcial=["Leve"]) já
        usam isso; Bárbaro/Guerreiro/Paladino/Guardião não têm restrição
        extra, então o checkbox não muda nada pra eles (proficiência
        plena com Simples+Marcial já era mostrada certa). Só afeta
        categorias de Arma/Armadura — Ferramentas/Instrumentos/Focos/
        Munição/Equipamento de Aventura continuam sempre visíveis, com
        ou sem o filtro.
      - ✅ RESOLVIDO (Claude Code): "perícia duplicada entre fontes" —
        dava pra escolher a mesma perícia na classe, no antecedente E na
        espécie ao mesmo tempo. Generalizado pra perícia, talento, truque
        E magia de 1º círculo — ver bloco "DEDUPLICAÇÃO DE ESCOLHAS ENTRE
        FONTES" perto de speciesFixedGrants()/skillsGrantedElsewhere()/
        chosenCantripsElsewhere() (fim do arquivo, logo depois de
        activeBgConst()). Regra: concessão FIXA (traço automático de
        espécie/classe, ex. truque do Legado do Tiferino) continua
        excluída das listas de ESCOLHA de outras fontes (comportamento
        que já existia, generalizado de Tiferino pra também cobrir
        Aasimar/Elfo/Gnomo) mas segue aparecendo no resumo; ESCOLHA do
        jogador numa fonte (perícia/truque/magia realmente selecionada)
        agora some da lista de escolha de TODAS as outras fontes também,
        não só contra o antecedente como antes. Talento também: o
        Versátil do Humano não deixa mais escolher o mesmo talento que o
        antecedente já concede fixo (backgroundFeatBaseName()).
      - ✅ RESOLVIDO (Claude Code): resetWizard() só zerava
        data.tiefling/data.pequenino entre personagens — as outras 8
        espécies carregavam sub-escolhas do personagem anterior. Ver
        freshSpeciesData() perto de resetWizard().
      - ✅ RESOLVIDO (Claude Code): "Talentos de Talento Selvagem" do UA
        (10 talentos do Psiônico, Atmocinese/Biocinese/etc.) já existiam
        completos em data/feats.js mas não estavam ligados a nenhuma UI.
        Ligados ao Versátil do Humano (único lugar do app que já era uma
        escolha livre de talento por nome) — ver talentosSelvagens em
        renderHumanoDetail(). Adicionado campo Fonte em
        renderFeatDetailCard() (ⓘ) pra deixar claro que é UA Psiônico
        2025, não PHB, já que agora aparecem lado a lado com talentos de
        Origem oficiais. PENDÊNCIA NOVA achada nesse meio-tempo, ✅
        RESOLVIDA junto com a reconstrução do Resumo (ver item abaixo): a
        tela de Resumo não mostrava NENHUMA escolha do passo 5 (detalhe de
        espécie).
      - ✅ RESOLVIDO (Claude Code): tela de Resumo final (passo 9)
        reconstruída do zero — antes era só "aqui está o que você
        escolheu" com CA/PV "não calculada automaticamente" hardcoded pra
        5 das 13 classes. Agora tudo é calculado de verdade a partir de
        computeCharacterSheet() (função pura, sem acesso a DOM, logo antes
        de renderSummary()): atributos finais, salvaguardas, perícias
        (com Especialista do Ladino = ◆ proficiência dobrada), Percepção
        Passiva, PV, CA (com fonte — armadura realmente possuída via
        ownedArmorAndShield()/ARMOR_AC, OU fórmula de Defesa sem Armadura
        do Bárbaro/Monge quando não há armadura equipada, escudo somando
        +2 à parte), Iniciativa, Deslocamento, ataques (1 linha por arma
        possuída que bate com WEAPON_MASTERY, Acuidade usa o melhor de
        Força/Destreza), conjuração (CD, bônus de ataque, truques/magias
        SEMPRE expandidos com o card de detalhe completo — tempo, alcance,
        componentes, duração, efeito, escalonamento — reaproveitando
        SPELL_DETAILS/renderSpellDetailCard() já usados nas telas de
        escolha). Truque/magia grátis de espécie (Legado do Tiferino etc)
        fica numa seção própria "Concedido pela Espécie", separada de
        "Conjuração", pra não sumir em classes não-conjuradoras (ex:
        Bárbaro Tiferino). Nome do personagem virou campo editável
        (data.characterName). Botão "Copiar Resumo" exporta tudo em texto
        puro (characterSheetAsText()) pra colar em qualquer lugar.
        Também resolvida nessa reconstrução: as escolhas do passo 5
        (detalhe de espécie) que ANTES não apareciam em lugar nenhum —
        ver speciesChoiceTraits() perto de speciesGrantedSpellEntries():
        resistência a dano do Legado Ínfero do Tiferino, texto completo
        (não só a magia) da Linhagem Élfica/Gnômica, tipo de dano
        resolvido da Herança Dracônica, regra completa da Ancestralidade
        Gigante do Golias, e o talento Versátil do Humano com card de
        detalhe (FEAT_DETAILS). Descoberto nesse processo: o Elfo
        Silvestre muda Deslocamento base de 9m pra 10,5m — só esse caso
        muda um número (os outros só mudam texto de traço/magia) — ver
        resolvedDeslocamento(). Também acrescentado savingThrows:[...] em
        cada um dos 13 data/classes/*.js (não existia como dado
        estruturado antes, só em texto livre) e um novo
        data/armor-ac.js com CA/limite de Destreza/categoria de cada
        armadura do Shop, por id. PENDÊNCIA DEIXADA DE FORA DE PROPÓSITO
        (pedido explícito do usuário, não é bug): revisar o
        formato/design de exibição dos itens agrupados na Loja — "tem item
        que não mostra o que é importante ou está com um design ruim".
      - ✅ RESOLVIDO (Claude Code): usuário mandou um MD com regras
        revisadas de CA/Iniciativa/atributo-de-ataque-de-arma pra validar
        contra a implementação. Conferido item a item: (1) atributo de
        ataque de arma (Força/Destreza/Acuidade/Arremessável) já estava
        certo em computeAttacks() — as armas arremessáveis sem Acuidade
        (Azagaia/Lança/Machadinha) já são tipo:"Corpo a Corpo" em
        data/weapon-mastery.js, então já caem no ramo de Força. (2) achados
        2 bugs de verdade e corrigidos: CA do Monge não desligava a Defesa
        sem Armadura ao empunhar Escudo (regra exige "sem armadura E sem
        escudo" pro Monge, diferente do Bárbaro que pode usar escudo
        normalmente) — computeAC() agora só entra no ramo do Monge se
        `!hasShield`, senão cai no padrão 10+Destreza+2 de escudo, igual
        preveem o documento e o pseudocódigo dele. Iniciativa nunca somava
        o Bônus de Proficiência do talento Alerta (fixo em Guarda/
        Criminoso, ou escolhido no Versátil do Humano) — nova
        hasFeatByName() (perto de backgroundFeatBaseName()) checa as duas
        fontes possíveis de talento por nome; sheet.combate.initiativeAlerta
        e o texto "(com Alerta)" mostram quando o bônus está ativo.
      - ✅ RESOLVIDO (Claude Code): tela de Resumo — Atributos, Salvaguardas
        e Perícias eram 3 seções separadas; usuário pediu pra agrupar por
        atributo, como na ficha física (atributo -> salvaguarda dele ->
        perícias que usam ele). Nova renderAttributeGroups() (perto de
        renderStatRows()) monta isso reaproveitando o mesmo componente
        visual de linha com bolinha de proficiência; characterSheetAsText()
        (botão Copiar Resumo) segue o mesmo agrupamento em texto puro.
      - ✅ RESOLVIDO (Claude Code): popup de detalhe (ⓘ) pra Atributos/
        Salvaguardas/Perícias no Resumo, mostrando de onde vem cada
        número (pedido do usuário, mesmo padrão de interação da Mochila —
        overlay cobrindo a tela, clique fora ou "✕" fecha). Cada entrada
        de attrs/savingThrows/skills em computeCharacterSheet() ganhou um
        campo `breakdown` (lista de {label,value}) além do valor final —
        ver computeSkills()/computeSavingThrows() e a construção de
        `attrs`. Especialista do Ladino (única fonte de proficiência
        dobrada em perícia no nível 1 — nenhuma classe/espécie mais tem
        isso nesse nível, conferido) aparece como 1 linha só já com o
        valor dobrado, não 2 linhas de +prof separadas. Estado da UI
        (statInfoOpen, guarda só a chave "tipo:nome") e renderização
        (renderStatInfoPopup(), openStatInfo()/closeStatInfo()) ficam
        perto de renderAttributeGroups(). Nova classe CSS
        .info-btn-inline (menor que .info-btn, com display:inline-flex
        em vez do display:flex herdado de .info-btn, que por ser "outer
        display:block" quebrava linha dentro de .stat-name/.group-label
        — só reaproveitar .info-btn direto ali causava esse bug visual,
        corrigido antes de dar como pronto).
      - ✅ RESOLVIDO (Claude Code): botão "🎲 Randomizar" — floater no
        canto superior ESQUERDO (espelho da Mochila, que fica no direito;
        mesma altura, calculada em JS por positionRandomizarFloater() do
        mesmo jeito que positionMochilaFloater()), visível só nos passos
        0-7 (os únicos com campo obrigatório de verdade — mesmo critério
        de findFirstMissingGroup()/canAdvance() — por isso já não aparece
        na Loja nem no Resumo sem precisar de exceção hardcoded pra
        nenhum dos dois). Clicar sorteia TODAS as escolhas do passo
        ATUAL — reroll completo, não só preenche o que estava vazio.
        randomizeCurrentStep() (perto de canAdvance()) tem um switch(step)
        que chama randomizeClassDetail()/randomizeBackgroundDetail()/
        randomizeSpeciesDetail()/randomizeIdiomasStep()/
        randomizeAttrsStep() — cada uma reaproveita EXATAMENTE as mesmas
        pools/filtros que os render*Detail() já usavam pra montar a UI de
        escolha (skillsGrantedElsewhere(), chosenCantripsElsewhere(),
        chosenSpells1Elsewhere(), speciesGrantedCantrips/Spells(),
        allowedAbilitiesFor() etc.), então nunca sorteia algo que a UI não
        deixaria escolher manualmente (perícia/truque/magia duplicada
        entre fontes). Ordem de dependência respeitada onde importa: Ordem
        Divina/Primal antes de contar truques (clerigoEffectiveCantripsCount
        /druidaEffectiveCantripsCount somam +1 se Taumaturgo/Xamã), Livro
        de Magias do Mago antes de sortear Preparadas (sorteia um
        subconjunto do que acabou de sortear no livro), ferramenta
        escolhida antes de excluir do pool de Habilidoso. Testado: 110
        chamadas isoladas (canAdvance()===true depois de randomizar, pra
        cada classe/antecedente/espécie) + 15 fluxos completos passo 0 a 7
        clicando o botão de verdade (Playwright) sem nenhum erro, sempre
        chegando na Loja com ficha válida.
      - ✅ RESOLVIDO (Claude Code): Guarda, Soldado e Nobre já usavam
        ferramentaCategoria/ferramentaOpcoes (não era mais o placeholder
        antigo de fato), mas cada um duplicava o mesmo array de 4
        variantes de Kit de Jogos — mesmo problema que ALL_INSTRUMENTS já
        tinha resolvido pro Bardo/Artista. Extraído pra ALL_GAME_SETS em
        data/game-sets.js (carregado logo depois de data/instruments.js),
        os três arquivos agora referenciam a const em vez de duplicar.
      - "CA não calculada automaticamente" repetida em 5 classes
        (Paladino/Clérigo/Guerreiro/Druida/Guardião) — candidata a virar
        uma função só.
      - Progressão de nível 2+ — nenhuma das 13 classes tem isso ainda,
        é tudo só nível 1.
      - ✅ RESOLVIDO (Claude Code): computeMaxPossibleGold() nunca tinha
        rodado de verdade com as 13 classes + 16 antecedentes carregados
        ao mesmo tempo. Rodei o cálculo real fora do navegador (Node,
        carregando os data/*.js na ordem certa): classMax=155 PO
        (Guerreiro, Opção C) + bgMax=50 PO (empate entre os 16
        antecedentes — a Opção B de todo antecedente vale exatamente 50
        PO, regra oficial do PHB 2024, não coincidência de dado) =
        teto de 205 PO, batendo exatamente com o que o usuário já tinha
        visto no celular. Conferi também os 179 itens do SHOP contra
        esse teto: 6 ficam acima (Placas 1500, Luneta 1000, Placas
        Parcial 750, Mosquete 500, Couraça Peitoral 400, Pistola 250) e
        são corretamente escondidos pelo filtro `it.c &lt;= maxGold`
        (inclusivo — nenhum item exatamente em 205 PO hoje, mas o
        operador está certo pra quando aparecer um). Nenhum bug
        encontrado, só verificação pendente que agora está feita.
   4. Prioridade sugerida: converse com o usuário antes de escolher —
      não presuma que a ordem acima é a ordem de importância.

   ⚠️ AVISO PRA QUALQUER SESSÃO NOVA — LEIA ISSO PRIMEIRO:
   Antes de abrir o PDF do livro (397 páginas, caro e lento de processar),
   PEÇA AO USUÁRIO os arquivos de contexto relevantes pro que você vai
   mexer: o data/*.js específico do assunto (ex: data/classes/bruxo.js se
   for mexer no Bruxo), as planilhas já existentes (classes_phb2024.xlsx,
   D_D_5_5_-_Magias_e_Talentos.xlsx), e o index.html mais atual. O livro é
   o ÚLTIMO recurso — só abrir quando a informação necessária não estiver
   em nada que já foi exportado/anexado. Isso já economizou bastante
   tempo/tokens nesta conversa; não regredir nisso numa sessão nova.

   🎓 LIÇÕES APRENDIDAS (aplicar sempre, não só quando alguém lembrar):
   - Antes de sair pesquisando algo no livro, perguntar se já existe um
     arquivo/planilha/anexo com a mesma informação — já aconteceu mais de
     uma vez de reprocessar o PDF quando a planilha de magias/talentos ou
     a de classes já tinha tudo parafraseado.
   - Se precisar abrir o livro mesmo assim, extrair só a página necessária
     (pdftotext -f/-l com o número certo do PDF, calculado contando
     marcadores de página \f no texto já extraído) em vez de reprocessar
     as 397 páginas de novo — funcionou bem quando a extração em coluna
     saiu bagunçada (caso da Ordem Primal do Druida).
   - Nomes vindos de fontes alternativas (ex: Unearthed Arcana) podem
     divergir da tradução "oficial" já usada no resto do app — sempre
     conferir contra a planilha oficial antes de assumir que é a mesma
     coisa ou uma coisa nova (caso do Psiônico: "Amizade"/"Prestidigitação"
     /"Sifão de Vida" do UA eram a mesma magia que "Amigos"/"Prestidigitação
     Arcana"/"Sifão Vital" já usados em outras classes).
   - Ao adicionar algo que parece seguir um padrão já visto em outra classe
     (Maestria em Arma, Ordem Divina/Primal, Estilo de Luta etc.), NÃO
     assumir que a redação é idêntica — conferir o texto exato no livro.
     Já rendeu descobertas reais: Bárbaro restringe Maestria em Arma a
     Corpo a Corpo, mas Paladino/Guerreiro/Ladino/Guardião não.
   - Fazer checagem cruzada por grep (campo usado no código vs. campo
     definido no const) depois de cada leva antes de entregar — pegou
     vários erros de digitação/campo esquecido ao longo da conversa.
   - Rodar `node --check` no bundle combinado (todos os data/*.js + o
     <script> principal extraído) antes de entregar — pega erro de
     sintaxe sem precisar de navegador (que não está disponível aqui).
   - Quando um arquivo de dados (classe, antecedente, espécie) não estiver
     disponível na conversa, NÃO recriar de memória — pedir pro usuário
     anexar, mesmo que pareça simples (risco de sobrescrever algo que já
     funciona com dados errados).
   - Depois de qualquer mudança estrutural (ex: inserir uma etapa nova no
     wizard), fazer uma varredura completa por TODOS os lugares que
     dependem de números de step/id (render(), canAdvance(),
     findFirstMissingGroup(), editSection(), goTo() hardcoded, ids
     grp-N-*) — é fácil esquecer um e deixar um botão "Editar" quebrado.

   ESCOPO ATUAL (funcionando): 🎉 TODAS AS 12 CLASSES DO PHB 2024 + o
   Psiônico (UA 2025), nível 1 apenas: Bárbaro, Bardo, Bruxo, Clérigo,
   Druida, Feiticeiro, Guardião, Guerreiro, Ladino, Mago, Monge, Paladino
   e Psiônico. Mais todas as 10 espécies do PHB 2024 e os 16 antecedentes
   do PHB 2024. Mais a etapa de Idiomas (passo 6). CONFERIDO duas vezes
   contra a lista real de 12 classes do PHB antes de declarar completo
   (já escrevi essa frase errado uma vez nesta mesma nota, esquecendo o
   Guardião — ver histórico logo abaixo).

   🔜 PRÓXIMA FRENTE — LOJA/SHOP (o usuário vai abrir uma conversa
   separada pra isso; se você é essa conversa, comece por aqui):
   1. ✅ FEITO nesta mesma sessão: banco de itens completo mapeado em
      shop_phb2024.xlsx (7 abas: Armaduras, Ferramentas, Equipamento de
      Aventura, Kits — Conteúdo, Focos e Símbolos, Munição, Montarias e
      Veículos — mais uma aba "Notas" com a pendência do teto de ouro,
      ver ponto 7). Pedir esse arquivo ao usuário antes de reabrir o PDF
      do capítulo 6 — ele já cobre tudo que foi extraído. Armas já
      tinham sido mapeadas antes em WEAPON_MASTERY (data/weapon-mastery.js)
      e na aba "Maestria — Armas" de classes_phb2024.xlsx.
   2. ✅ FEITO: SHOP expandido de ~35 pra 179 itens, mantendo EXATAMENTE o
      mesmo schema que já existia ({n,d,p,c,cont opcional} por categoria
      com filterProf), e EXTRAÍDO pra data/shop-items.js (padrão que
      todo o resto do projeto usa — inicialmente deixei inline no
      index.html por menor risco, o usuário perguntou por que não tinha
      virado arquivo próprio, e fez sentido migrar; carregado via
      <script src="data/instruments.js"> ANTES de shop-items.js).
   3. ✅ FEITO: filtro de proficiência por categoria já cobre as 13
      classes automaticamente (usa clsConst.weaponProf/armorProf.includes,
      testado que os valores batem: simples/marcial/leve/media/pesada/
      escudo). ✅ TAMBÉM FEITO (Claude Code, resolvido bem depois desta
      sessão original): filtro por PROPRIEDADE individual da arma
      (Ladino só Acuidade/Leve, Monge só Corpo a Corpo com Leve), usando
      o campo "propriedades" de WEAPON_MASTERY como já estava previsto
      aqui — mas o usuário pediu um desenho diferente do que "resolver
      automaticamente": virou um checkbox opcional "Filtrar por
      proficiência" em renderShop(), DESLIGADO por padrão (a Loja mostra
      tudo pra todo mundo por padrão, de propósito — ver
      itemMatchesWeaponProf()/toggleShopProfFilter()).
   4. ✅ Calculadora de ouro mantida (startingGold(), spentGold(),
      maxAffordableQty(), a lógica de troco em renderShop()) — não foi
      mexida, só reaproveitada pros itens novos.
   5. ✅ RESOLVIDO (Claude Code, bem depois desta sessão original): painel
      mostrando o inventário atual do personagem — o que já foi
      concedido pela classe + antecedente somado ao que for comprado na
      loja. Ver bloco ✅ RESOLVIDO sobre "floater/painel fixo" na lista
      consolidada de pendências, no topo desta nota.
   6. ✅ FEITO (usuário pediu explicitamente): nav() agora é
      position:fixed no rodapé da viewport (não mais dentro do fluxo
      normal da página), envolvido num .nav-inner que respeita o mesmo
      max-width:960px do .wrap pra não ficar esticado em telas largas.
      body ganhou padding-bottom maior (90px + env(safe-area-inset-
      bottom) pra iPhones com home indicator) pra o conteúdo não ficar
      escondido atrás da barra. Testado que .card/.wrap não têm
      transform/filter (o que quebraria position:fixed criando um novo
      containing block) e que scrollToMissing() usa block:'center' no
      scrollIntoView (não bate na barra fixa do rodapé). css/styles.css
      foi o arquivo alterado (não index.html, que só referencia a
      classe .nav).
   7. ✅ FEITO: teto de ouro dinâmico implementado —
      computeMaxPossibleGold() (perto de const SHOP) calcula
      classMax + bgMax a partir de CLASS_CONST/BACKGROUND_CONST, sem
      número fixo no código. renderShop() já usa isso pra esconder (não
      apagar dos dados) itens acima do teto. ATENÇÃO: BACKGROUND_CONST
      referencia os 16 consts de antecedente (CHARLATAO, NOBRE, etc.) que
      só existem de verdade quando os respectivos data/backgrounds/*.js
      estão carregados via <script> — nesta sessão eu só tinha
      artista.js e acolito.js, então não consegui testar em runtime aqui
      (só sintaxe com node --check). ✅ CONFIRMADO PELO USUÁRIO em teste
      real no celular: apareceu "205 PO" de Restante pra um Guerreiro —
      bate exatamente com 155 (Guerreiro Opção C) + 50 (algum
      antecedente com equipmentB_gold=50, ex. Artista) = 205. Funciona
      de verdade, não só no papel. ✅ CONFIRMADO DE NOVO (Claude Code,
      sessão com acesso ao repo inteiro): rodei o cálculo com os 16
      antecedentes de verdade — bgMax=50 é empate entre TODOS eles
      (Opção B de todo antecedente vale 50 PO, regra do livro), classMax
      continua 155 (Guerreiro). Teto = 205 PO, exatamente igual ao
      confirmado no celular. Ver pendência marcada ✅ mais acima nesta
      nota pra detalhe completo, incluindo os itens do SHOP acima do teto.
   8. ✅ FEITO (usuário testou no celular e pediu 2 ajustes): a tabela da
      Loja estourava a tela no mobile (coluna Qtd. cortada fora da
      viewport) — agora usa layout de "cartão" empilhado abaixo de
      700px (cada linha vira um bloco com rótulos, via atributo
      data-label + CSS, técnica clássica de tabela responsiva). Também
      virou colapsável: cada categoria agora é um <details>/<summary>
      nativo (shop-category), com contador de itens visível no
      cabeçalho. O estado aberto/fechado de cada categoria é lembrado em
      data.shop.collapsedCats (senão resetaria toda vez que o usuário
      mexe na quantidade de um item, já que render() reconstrói a tela
      inteira) — toggleShopCategory() só salva o estado, não chama
      render(). css/styles.css foi criado nesta sessão (reconstruído a
      partir do anexo original da conversa) já com esses estilos.
   9. ✅ RESOLVIDO (Claude Code, ver bloco "DEDUPLICAÇÃO DE ESCOLHAS ENTRE
      FONTES" perto do fim do arquivo): era possível escolher a MESMA
      perícia em fontes diferentes ao mesmo tempo (ex: classe E
      antecedente E espécie). skillsGrantedElsewhere(fonte) agora é a
      função central "todas as perícias já garantidas por qualquer
      fonte" que a nota antiga aqui embaixo já previa — reusada nos 13
      pickers de classe, no Habilidoso, no Hábil (Humano) e no Sentidos
      Aguçados (Elfo). Mesma generalização aplicada a talento (Versátil
      do Humano vs. talento fixo do antecedente) e truque/magia (classe
      vs. Iniciado em Magia do antecedente, e concessão fixa de espécie
      generalizada de Tiferino pra também cobrir Aasimar/Elfo/Gnomo).
   - Marco: fecha o ciclo "uma classe por vez" que começou com o Bárbaro.
     Depois da Loja, outras frentes possíveis: progressão de nível 2+,
     Talentos de Talento Selvagem do UA, arquivos de Guarda/Soldado/Nobre
     (mesma pendência de ferramenta que já resolvemos no Artista).

   ✅ GUARDIÃO (nível 1) — CONCLUÍDO. Dados em data/classes/guardiao.js.
   Estrutura parecida com Paladino: sem truques, magias preparadas (2) +
   Maestria em Arma (2, CONFERIDO no PDF — mesmo o próprio exemplo do
   livro mistura Arco Longo com Espada Curta, então SEM restrição a
   Corpo a Corpo, reforçando o padrão Paladino/Guerreiro/Ladino/Guardião
   "sem restrição" vs. só o Bárbaro "com restrição"). Inimigo Favorito
   (Marca do Predador sempre preparada, filtrada da lista de escolha,
   mesmo padrão do Falar com Animais no Druida). Perícias são 3 (não 2),
   de uma lista de 8. CA recebeu o tratamento "não calculada
   automaticamente" — equipamento padrão tem Couro Batido (Armadura
   Leve tipo diferente de Couro simples, CA base 12 em vez de 11, mais
   uma razão nova pra não usar a fórmula simplificada de qualquer classe
   já existente).

   ✅ MONGE (nível 1) — CONCLUÍDO. Dados em data/classes/monge.js. A
   implementação mais simples de todas: SEM nenhuma escolha de classe
   além de Perícias e Equipamento (Artes Marciais e Defesa sem Armadura
   são 100% informativas, e não há Maestria em Arma no nível 1 do Monge —
   CONFERIDO no PDF, não assumido). Duas particularidades registradas:
   - Proficiência de arma é a mais restrita de todas: só Armas Simples
     CORPO A CORPO (nem todas as Simples — exclui à distância!) + Marciais
     Corpo a Corpo com propriedade Leve. Só afeta CLASS_INFO/exibição por
     enquanto, já que não há Maestria em Arma pra filtrar de verdade.
   - Ferramentas: mesmo placeholder genérico do Bardo/Ladino ("escolha 1
     tipo: Ferramentas de Artesão OU Instrumento Musical", sem seletor
     real) — é a 3ª classe com essa pendência (Bardo, Ladino, Monge),
     reforça que vale resolver isso numa leva só quando o usuário pedir.
   - CA usa fórmula própria (10 + Destreza + Sabedoria, variável acMonge
     dedicada em renderSummary) — não reaproveitou nenhuma das fórmulas
     dos outros grupos porque Monge é a única classe com esse combo de
     atributos na CA sem-armadura.

   ✅ FEITICEIRO (nível 1) — CONCLUÍDO. Dados em data/classes/feiticeiro.js.
   Sem particularidade estrutural nova — mesmo formato do Bardo/Psiônico
   (N truques + N magias preparadas, sem sub-escolha extra tipo Ordem
   Divina/Primal ou livro separado). Feitiçaria Inata é só texto
   informativo (2 usos/dia, sem escolha do jogador). Sem armadura
   (armorProf=[]), então CA usa a fórmula "sem armadura: 10+Destreza"
   (mesmo grupo do Mago/Psiônico), não precisou do tratamento "não
   calculada automaticamente". Foi a implementação mais rápida até agora
   por não ter nenhuma mecânica nova pra desenhar — só copiar o padrão já
   validado do Bardo/Psiônico com os dados certos do Feiticeiro.

   ✅ DRUIDA (nível 1) — CONCLUÍDO. Dados em data/classes/druida.js.
   Estrutura quase idêntica ao Clérigo (Ordem Primal = mesmo formato da
   Ordem Divina: Protetor/Xamã em vez de Protetor/Taumaturgo, mesmo
   efeito — Xamã dá +1 truque igual Taumaturgo, druidaEffectiveCantrips
   Count() é cópia do padrão do Clérigo). Duas notas específicas:
   - A tabela/caixa da "Ordem Primal" saiu BAGUNÇADA na primeira extração
     de texto do PDF (colunas se misturaram, texto de Protetor/Xamã
     apareceu longe do título deles). Precisei reextrair só a página
     certa com pdftotext -layout -f/-l apontando pro número de página
     real do PDF (calculado contando marcadores \f no texto já
     extraído) — a extração de 397 páginas de uma vez só não capturou
     bem esse layout em colunas. Se aparecer esse tipo de bagunça de
     novo (texto de uma seção "vazando" pra outra coluna), tentar
     reextrair só a página específica antes de desistir/perguntar pro
     usuário.
   - Falar com Animais vem de graça pelo Idioma Druídico (não conta nas 4
     magias preparadas escolhidas) — por isso é FILTRADA da lista de
     escolha (spells1.filter(s=>s!=='Falar com Animais')), mesmo padrão
     de excluir truques concedidos pela espécie que já era usado em
     outras classes.
   - CA recebeu o tratamento "não calculada automaticamente" (Opção A tem
     Escudo, que muda a fórmula simplificada de Couro+Destreza) — já são
     4 classes com esse tratamento agora (Paladino, Clérigo, Guerreiro,
     Druida). Continua valendo a pena generalizar numa função só quando
     tiver tempo/pedido — a lista só cresce.

   ✅ LADINO (nível 1) — CONCLUÍDO. Dados em data/classes/ladino.js.
   Particularidades:
   - PRIMEIRA classe com proficiência de arma FILTRADA por propriedade,
     não só por categoria: Simples (todas) + Marciais que tenham Acuidade
     OU Leve. Isso motivou adicionar um campo novo "propriedades" (array)
     em CADA arma de WEAPON_MASTERY (data/weapon-mastery.js) — reaproveitei
     os dados que já tinha extraído pra planilha classes_phb2024.xlsx (aba
     Maestria — Armas) em vez de reabrir o PDF. A lista de Maestria em
     Arma do Ladino já usa esse filtro de verdade
     (categoria==='Simples' || propriedades.includes('Acuidade'|'Leve')).
     Monge também tem esse tipo de filtro (só Leve) — quando entrar, dá
     pra reusar o mesmo campo "propriedades".
   - CONFERIDO no PDF: Maestria em Arma do Ladino (2 armas) também NÃO se
     restringe a Corpo a Corpo, mesma regra de Paladino/Guerreiro.
   - Especialista (escolha 2 perícias já proficientes) só pode escolher
     entre perícias que o personagem JÁ tem (classe + antecedente +
     Habilidoso) — toggleLadinoSkill() faz cascade removendo do
     Especialista se a perícia de classe for desmarcada depois.
   - ✅ Gíria do Ladrão (Gíria dos Ladrões + 1 idioma à escolha) —
     RESOLVIDO na etapa de Idiomas (passo 6, ver mais abaixo): a pill
     "Gíria dos Ladrões" aparece automática pro Ladino, e a escolha de 1
     idioma extra usa a lista completa de COMMON_LANGUAGES+RARE_LANGUAGES
     (data/languages.js). Não fica mais dentro do renderLadinoDetail().
   - CA não precisou do tratamento "não calculada automaticamente" (ao
     contrário de Paladino/Clérigo/Guerreiro) — o equipamento padrão do
     Ladino é Armadura de Couro, então a fórmula simplificada de Couro +
     Destreza que já existia serve normalmente.

   ✅ GUERREIRO (nível 1) — CONCLUÍDO. Dados em data/classes/guerreiro.js.
   Duas particularidades novas:
   - PRIMEIRA classe com TRÊS opções de equipamento inicial (A/B/C), não
     só A/B. Schema mudou: equipmentB agora é lista de itens (igual A) +
     equipmentB_gold (sobra), e equipmentC_gold é a opção só-em-ouro (que
     nas outras classes era equipmentB_gold). startingGold() e o bloco de
     equipamento do renderSummary() foram generalizados pra checar 'C'
     também — como nenhuma outra classe tem equipmentC_gold definido,
     isso não afeta nada que já existia.
   - Estilo de Luta (escolha 1 talento entre 10) é um sub-sistema
     transversal (CONFIRMADO: outras classes também concedem Estilo de
     Luta — Paladino no nível 2, por exemplo), mas por enquanto os dados
     estão só dentro de GUERREIRO.estiloDeLuta, extraídos da aba
     "Talentos" da planilha de magias (coluna Categoria="Estilo de Luta").
     Se uma 2ª classe também conceder Estilo de Luta nível 1 (nenhuma
     tem, é sempre nível 2+ nas outras), vale extrair pra um arquivo
     separado tipo data/fighting-styles.js, no mesmo espírito do
     weapon-mastery.js.
   - Maestria em Arma do Guerreiro tem 3 armas (não 2) e, CONFERIDO no PDF
     (pág. 126), também não se restringe a Corpo a Corpo — mesma regra do
     Paladino, diferente do Bárbaro. Já são 2 classes "sem restrição" e 1
     "com restrição" (Bárbaro) — continuar conferindo caso a caso pras que
     faltam (Guardião, Ladino também têm Maestria em Arma nível 1).
   - CA não calculada automaticamente (mesmo tratamento de Paladino/
     Clérigo — Opção A vem com Cota de Malha). Já são 3 classes com esse
     tratamento — Guardião é a 4ª que provavelmente vai precisar (tem
     Escudo), pode valer a pena generalizar numa função só nessa hora.

   ✅ CLÉRIGO (nível 1) — CONCLUÍDO. Dados em data/classes/clerigo.js.
   Particularidade nova: Ordem Divina (Protetor ou Taumaturgo) é uma
   escolha nível 1 que MUDA a contagem de truques disponíveis —
   Taumaturgo dá +1 truque. clerigoEffectiveCantripsCount() calcula esse
   total dinâmico (CLERIGO.cantripsCount + 1 se Taumaturgo) e é usado
   tanto no render quanto em canAdvance/findFirstMissingGroup.
   pickClerigoOrdem() faz cascade: se o jogador trocar de Taumaturgo pra
   Protetor depois de já ter escolhido 4 truques, corta a lista pra 3
   automaticamente (mesmo espírito do cascade do Livro de Magias do Mago,
   adaptado pra um caso de "diminuir o teto", não "remover item
   específico").
   - CA do Clérigo, assim como a do Paladino, NÃO é calculada
     automaticamente (equipamento A vem com Cota de Malha Parcial +
     Escudo, não dá pra usar a fórmula simplificada de couro/sem-armadura
     sem arriscar número errado). Já são 2 classes com esse tratamento —
     se entrar uma 3ª (Guardião tem Escudo também), vale considerar migrar
     pra uma função de CA compartilhada em vez de repetir o texto.
   - Atributo de conjuração é Sabedoria (variável wisMod nova em
     renderSummary, ao lado de carMod/intMod).

   ✅ PSIÔNICO (nível 1) — CONCLUÍDO. Dados em data/classes/psionico.js.
   NÃO é conteúdo oficial do PHB — é Unearthed Arcana 2025 (playtest,
   tradução do Canal do Condado), registrado como tal no CLASS_INFO
   (campo "Fonte" extra nos fields, algo que nenhuma outra classe tem).
   Mesmo formato do Bardo (2 truques + 4 magias preparadas, sem livro
   separado como o Mago) — Poder Psiônico (Dados de Energia Psiônica,
   Impulso Telecinético, Conexão Telepática) e Telecinese Sutil (Mão
   Mágica grátis) são só texto informativo, sem escolha nível 1.
   - CORREÇÃO (feita depois da primeira versão): os nomes de truques/
     magias inicialmente vieram direto do texto do PDF do UA, mas a
     tradução do UA diverge da planilha oficial de magias em pelo menos 3
     casos ("Amizade"→"Amigos", "Prestidigitação"→"Prestidigitação
     Arcana", "Sifão de Vida"→"Sifão Vital" — mesma magia, nome
     diferente). Já corrigido em data/classes/psionico.js, com nota lá
     explicando. Ao usar qualquer nome de magia vindo do PDF do UA de
     novo, MELHOR conferir contra a coluna "Psiônico" da planilha de
     magias antes de usar o texto do UA direto — a planilha já cobre
     "PHB 2024 + UA Psion" no nome, é a fonte de nomes oficiais.
   - ✅ RESOLVIDO (Claude Code): o UA também tem "Talentos de Talento
     Selvagem" (Wild Talent feats — Atmocinese, Biocinese, Clarividência,
     Criocinese, Empata, Modelador de Carne, Sussurrador Mental,
     Trapaceiro Psiônico, Psicinético, Pirocinese), já cadastrados em
     data/feats.js mas sem UI. Resolvido pela opção "talento genérico"
     citada aqui embaixo (não pela troca de talento de antecedente, que
     continua sem implementar): ligados ao Versátil do Humano — ver
     talentosSelvagens em renderHumanoDetail(), perto de talentosOrigem.

   ✅ PALADINO (nível 1) — CONCLUÍDO. Dados em data/classes/paladino.js.
   Particularidades:
   - Maestria em Arma do Paladino NÃO se restringe a "Corpo a Corpo" (só
     exige proficiência) — diferente do Bárbaro. CONFERIDO NO PDF antes de
     assumir isso (pág. 167), porque o texto do livro só dizia "com as
     quais você tem proficiência", sem repetir a restrição que o Bárbaro
     tem. Guardião/Guerreiro/Ladino também têm Maestria em Arma — checar a
     redação exata de cada um antes de reusar a suposição de um ou outro
     (não assumir que todos seguem o mesmo padrão do Bárbaro OU do
     Paladino sem conferir).
   - Sem truques no nível 1 (só magias preparadas, 2 de uma lista de 16 —
     extraída da planilha de magias, coluna "Paladino").
   - Mãos Consagradas é só texto informativo (baseado no nível, sem
     escolha do jogador).
   - CA do Paladino no resumo NÃO é calculada automaticamente (fica só um
     texto "depende da armadura equipada") — diferente de Bárbaro/Mago/
     Bruxo/Bardo, que assumem sempre o cenário sem-armadura ou com a
     armadura padrão do equipamento A. Como o Paladino tem armadura Pesada
     na Opção A (Cota de Malha) e isso muda MUITO a CA (fixa, sem Destreza,
     ainda por cima com requisito de Força), não dava pra usar a mesma
     fórmula simplificada sem arriscar mostrar um número errado.

   ✅ PENDÊNCIA RESOLVIDA (perícias agrupadas por atributo): as escolhas
   de perícias das 5 classes (Bruxo, Bárbaro, Bardo, Mago, Paladino) agora
   usam groupedChoiceList(skillGroupsByAbility(pool), ...) — mesmo padrão
   já usado no Hábil (Humano) e Habilidoso (antecedentes), agrupado por
   atributo em vez de lista chapada. O usuário reparou que o Bardo tinha
   ficado diferente do resto (a pendência já estava anotada aqui desde a
   migração do Bruxo, mas só foi resolvida agora que tínhamos 5 classes
   pra padronizar de uma vez). O resumo final (renderSummary) CONTINUA
   com lista chapada de perícias — isso é intencional/consistente com o
   resto do app (Habilidoso também mostra flat no resumo, só o PICKER
   agrupa), não confundir com pendência de novo.

   ✅ MAGO (nível 1) — CONCLUÍDO. Dados em data/classes/mago.js. Única
   classe até agora com DOIS níveis de escolha de magia: primeiro o Livro
   de Magias (6 magias de 1º círculo — "estoque" conhecido), depois as
   Magias Preparadas (4, subconjunto do livro). toggleMagoSpellbook()
   remove em cascata da lista de Preparadas se uma magia sair do livro.
   Truques/magias extraídos da planilha de magias (coluna "Mago"), não do
   PDF. Adepto de Ritual e Recuperação Arcana são só texto informativo
   (sem escolha nível 1). Sem armadura (MAGO.armorProf = []) — o filtro de
   SHOP já lida bem com array vazio (nunca dá match, categoria de
   armadura simplesmente não aparece pro Mago).
   - renderSummary() agora calcula o atributo de conjuração por classe
     (spellMod: Inteligência pro Mago, Carisma pra Bruxo/Bardo) em vez de
     fixar Carisma — importante lembrar disso quando entrar Clérigo/
     Druida/Guardião (Sabedoria) ou Guerreiro com truques via talento.

   ✅ BARDO (nível 1) — CONCLUÍDO. Dados em data/classes/bardo.js.
   Particularidades registradas:
   - Perícias: Bardo escolhe 3 QUAISQUER, sem lista restrita (BARDO.skillsAll
     = true, BARDO.skillsCount = 3). renderBardoDetail() usa ALL_SKILLS
     (data/skills.js) direto em vez de um pool fixo tipo BARBARO.skills —
     por isso data/classes/bardo.js foi carregado DEPOIS de
     data/skills.js no <script>, mas mesmo se a ordem mudasse funcionaria
     igual, já que ALL_SKILLS só é lido dentro do corpo da função de
     render (chamada bem depois de todo script já ter carregado), nunca
     no top-level do bardo.js.
   - Truques/magias de 1º círculo: extraídos da planilha
     D_D_5_5_-_Magias_e_Talentos.xlsx (coluna "Bardo"=Sim), NÃO do PDF —
     13 truques, 23 magias de 1º círculo.
   - ✅ Ferramentas (Instrumento Musical ×3) — RESOLVIDO. Seletor de
     verdade agora, usando ALL_INSTRUMENTS (data/instruments.js, os 10 do
     capítulo 6: Alaúde, Flauta, Flauta de Pã, Gaita de Foles, Lira, Oboé,
     Tambor, Trombeta, Violino, Xilofone). Campo BARDO.toolsCount=3,
     escolha em data.bardo.instruments, grupo grp-1-instruments.
     ATUALIZAÇÃO: o antecedente Artista (data/backgrounds/artista.js) já
     tinha essa lista completa e correta desde antes — só precisou trocar
     pra referenciar ALL_INSTRUMENTS em vez de duplicar o array (evita
     desalinhamento futuro entre Bardo e Artista). Único ajuste de
     conteúdo: minha primeira extração do PDF tinha saído "Flauta de Pan"
     (sem til, provavelmente erro de OCR/extração) — corrigido pra
     "Flauta de Pã", que é o que o artista.js (já revisado antes) usava.
     Guarda/Soldado/Nobre ainda não foram conferidos (arquivos não
     chegaram nesta sessão) — se tiverem o mesmo tipo de escolha de
     ferramenta, aplicar ALL_INSTRUMENTS neles também quando chegar a vez.
   - Inspiração de Bardo não tem escolha do jogador no nível 1 (é sempre
     concedida) — só texto informativo, igual Fúria/Defesa sem Armadura
     do Bárbaro.

   ✅ BÁRBARO (nível 1) — CONCLUÍDO. Dados em data/classes/barbaro.js
   (BARBARO const). Maestria em Arma (transversal, também usada por
   Paladino/Guardião/Guerreiro/Ladino quando entrarem) ficou em
   data/weapon-mastery.js (MASTERY_PROPERTIES + WEAPON_MASTERY). Fúria e
   Defesa sem Armadura não têm escolha do jogador nível 1, então aparecem
   só como texto informativo em renderBarbaroDetail() (sem grp- id, não
   entram em canAdvance/findFirstMissingGroup). Maestria em Arma tem
   escolha (2 armas Corpo a Corpo, Simples ou Marcial) — a lista mostra
   TODAS as armas Corpo a Corpo de WEAPON_MASTERY, mesmo as Marciais que
   ainda não estão no SHOP (ver PENDÊNCIA do SHOP mais abaixo), com aviso
   na tela sobre isso.
   - Classe do Bruxo, weaponProf/armorProf agora são ARRAY em vez de
     string (BRUXO.weaponProf era "simples", virou ["simples"]) — decisão
     combinada com o usuário quando o Bárbaro entrou, porque cada classe
     pode ter mais de uma categoria de arma/armadura (Bárbaro tem Simples+
     Marcial, Leve+Média+Escudo). renderShop() usa .includes() nesse array
     via activeClassConst(), não mais comparação direta de string.
   - equipmentA_gold também é campo novo em ambos os CONST de classe
     (antes o "15 PO" do Bruxo tava hardcoded dentro do array equipmentA
     como string solta — foi extraído pra campo próprio, mesmo padrão que
     os antecedentes já usavam com bgConst.equipmentA_gold).

   ✅ ETAPA 2 (generalizar) — CONCLUÍDA junto com o Bárbaro: CLASS_DATA_KEY
   (nome->chave em `data`, ex. "Bárbaro"->"barbaro") e CLASS_CONST
   (nome->objeto de dados fixos, ex. "Bárbaro"->BARBARO), com
   activeClassData()/activeClassConst() — mesmo padrão do
   BACKGROUND_DATA_KEY/BACKGROUND_CONST. Usados em startingGold(),
   renderShop() e renderSummary(). IMPORTANTE: render()/canAdvance()/
   findFirstMissingGroup() do PASSO 1 (detalhe da classe) continuam
   ramificando por if/else de nome de classe (`data.classe==='Bárbaro' ?
   ... : ...`), NÃO viraram um mapa de funções — isso foi decisão
   consciente, não descuido: com só 2 classes de nível 1 muito diferentes
   entre si (uma conjuradora com pactos, outra marcial com Fúria/Maestria)
   ainda não dá pra ver um padrão comum o suficiente pra generalizar sem
   forçar. Mesmo estilo que já era usado no passo 5 (detalhe da espécie,
   também se ramifica por if/else). Reavaliar quando tivermos 3-4 classes
   nível 1 prontas — pode ser que dê pra extrair um "renderClassChoiceList"
   genérico pra perícias e outro pra equipamento A/B, já que essas duas
   partes SÃO idênticas em formato entre Bruxo e Bárbaro.
   - LIÇÃO APRENDIDA (antecedentes, ainda válida): não gaste tempo
     pesquisando no PDF de 397 páginas se já existir um arquivo
     estruturado (planilha, .js, etc) anexado na conversa com os mesmos
     dados prontos.

   🔜 PENDÊNCIA DO SHOP (registrada, não é bug, é escopo adiado com o
   usuário): SHOP só tem Armas Simples e Armadura Leve. Bárbaro (e toda
   futura classe marcial) tem proficiência com Armas Marciais e Armadura
   Média/Escudo/Pesada que não aparecem pra comprar — só dá pra pegar via
   equipamento inicial fixo (opção A). Expandir SHOP com Armas Marciais +
   Armadura Média/Pesada + Escudos fica pra quando o usuário pedir
   explicitamente (ele já disse "resolvemos loja depois" duas vezes).
   (✅ CLASS_DATA_KEY/CLASS_CONST já foram generalizados faz tempo — ver
   bloco do BÁRBARO mais abaixo — essa parte da nota antiga já não se aplica.)

   ✅ RESOLVIDO (Claude Code): resetWizard() (botão agora "Iniciar Novo
   Personagem", era "Criar Outro Personagem") só zerava data.tiefling/
   data.pequenino entre as espécies — as outras 8 (anao, orc, humano,
   draconato, elfo, gnomo, golias, aasimar) carregavam sub-escolhas do
   personagem anterior. Generalizado com freshSpeciesData() (função nova,
   perto de resetWizard() no fim do arquivo) com os defaults das 10
   espécies num só lugar, reaproveitada também na migração de saves
   antigos em restore() (que antes tinha os mesmos 8 defaults duplicados
   em ifs separados).

   NOTA SOBRE PEQUENINO (Halfling): diferente do Tiferino, essa espécie NÃO
   tem nenhuma escolha própria no PHB 2024 (sem subraça, sem legado, sem
   atributo de conjuração) — todos os traços são fixos (Corajoso, Agilidade
   Pequenina, Sorte, Furtividade Natural). Por isso o step 1 pra essa espécie
   é só informativo e canAdvance()/findFirstMissingGroup() retornam sempre
   liberado quando data.especie==='Pequenino'. Serve de modelo pra outras
   espécies "simples" (Humano, Anão, Elfo, Gnomo, Orc também têm poucas ou
   nenhuma escolha — só Aasimar e Draconato têm escolhas parecidas com o
   legado do Tiferino).

   O usuário provavelmente vai subir de novo, neste novo chat:
   1. O PDF do Livro do Jogador D&D 5e 2024
   2. A planilha "Magias_PHB2024_Completo.xlsx" (abas "Magias PHB 2024 + UA
      Psion" e "Talentos") — já tem TODAS as magias/truques/talentos do
      livro condensados (efeito + escalonamento em português, parafraseado,
      não copiado cru do livro). É a fonte mais rápida pra alimentar
      SPELL_DETAILS de qualquer classe nova.
   3. (Só se for mexer em Psiônico) o PDF do Unearthed Arcana Psiônico 2025

   ONDE MEXER PRA ADICIONAR CONTEÚDO NOVO:
   - Antes de ir atrás no PDF: tem um índice de páginas (por classe/espécie/
     antecedente/talentos) logo depois da declaração de CLASSES/SPECIES/
     BACKGROUNDS, uns 70 linhas abaixo desta nota. Confere ali primeiro.
   - CLASSES / SPECIES / BACKGROUNDS: arrays com os nomes oficiais (12/10/16).
     ENABLED_CLASSES / ENABLED_SPECIES / ENABLED_BACKGROUNDS controlam o que
     já é clicável na tela de seleção (resto fica cinza, "em breve").
   - Nova classe: criar objeto tipo BRUXO (skills, cantrips, spells1,
     equipmentA/B, weaponProf, armorProf...) + função renderXDetail() +
     handlers de toggle, no mesmo padrão do Bruxo. Adicionar entrada em
     CLASS_INFO (descrição + Atributo Principal + Dado de Vida + Complexidade
     — tirado da tabela "Visão Geral das Classes", página 33 do livro).
   - Nova espécie: objeto tipo TIEFLING com os traços/escolhas próprias.
   - Novo antecedente: objeto tipo CHARLATAO + entrada em BACKGROUND_INFO
     (nome do talento + descrição curta do QUE O TALENTO FAZ, não da
     "personalidade" do antecedente + perícias/ferramenta).
   - SPELL_DETAILS: nome -> {tempo, alcance, componentes, duracao, efeito,
     escalonamento}. Usado pelo botão "ⓘ" (spellChoiceList) nas listas de
     magia/truque. Puxar direto da planilha, mesmo texto já condensado.
   - SHOP: itens da loja final, filtrados por proficiência (campo filterProf
     bate com weaponProf/armorProf da classe). Kits com múltiplos itens usam
     o campo "cont" pra listar o conteúdo (evita duplicar comprando 2 kits
     parecidos, tipo Aventureiro + Explorador de Masmorras).
   - Ordem das etapas (mudar com cuidado, tudo sincronizado):
     0 Classe -> 1 detalhe classe -> 2 Antecedente -> 3 detalhe antecedente
     -> 4 Espécie -> 5 detalhe espécie -> 6 Atributos -> 7 Loja -> 8 Resumo.
     ATENÇÃO: essa ordem foi TROCADA (era Espécie->Antecedente->Classe) pra
     bater com a ordem do livro (Classe->Antecedente->Espécie) — o motivo é
     evitar duplicação de perícias/talentos/proficiências entre as 3 etapas
     (o livro assume que você já sabe a classe e o antecedente antes de
     escolher a espécie, pra não repetir escolha de algo que a espécie
     também poderia dar). Os grupos de campo (id="grp-N-nome") também foram
     renumerados nessa troca: prefixo grp-0- e grp-1- agora são da Classe,
     e prefixo grp-4- e grp-5- agora são da Espécie (Antecedente ficou nos
     prefixos grp-2- e grp-3-, não mudou de posição). Se adicionar/mudar
     etapa, atualizar
     TOTAL_STEPS, render(), canAdvance() E findFirstMissingGroup() juntos
     (os 3 têm um switch/case por step).
   - ✅ NOVA ETAPA "IDIOMAS" INSERIDA (passo 6, entre Espécie-detalhe e
     Atributos) — pedido do usuário com print das tabelas Idiomas Comuns
     e Idiomas Raros do cap. 2. TOTAL_STEPS virou 10 (era 9). Renumeração
     que isso causou: Atributos (id grp-6-attr-* → grp-7-attr-*, step 6→7,
     editSection(6)→editSection(7)), Loja (step 7→8, editSection(7)→
     editSection(8)), Resumo (step 8→9, inclusive o goTo(8) dentro de
     returnToSummaryNow() virou goTo(9)). Os headers "Passo 1/2/3" de
     Classe/Antecedente/Espécie NÃO mudaram (são só texto solto, não
     ligados ao valor de `step`) — segui o mesmo estilo de Atributos/Loja
     (headers sem número: "Passo — Idiomas", igual "Passo — Atributos").
   - Dados: COMMON_LANGUAGES (9) e RARE_LANGUAGES (9) em
     data/languages.js — "Comum" NÃO entra em nenhuma das duas, é
     concedido automático (pill fixa, sem grp- id, não entra em validação).
     Todo personagem escolhe 2 de COMMON_LANGUAGES (data.idiomas.comuns).
     Se a classe for Ladino, mostra uma seção extra "Ladino — Gíria dos
     Ladrões" com a pill fixa "Gíria dos Ladrões" (grátis, não conta) +
     escolha de 1 idioma adicional de QUALQUER um dos dois grupos
     (data.idiomas.extra, array de tamanho 1), excluindo os já escolhidos
     como comuns e a própria Gíria dos Ladrões. toggleIdiomaComum() faz
     cascade: se o idioma marcado como "comum" já estava escolhido como
     "extra", tira de lá (evita duplicata).
   - languageGroupsByCategory(pool) é o par de skillGroupsByAbility(pool),
     mesma função groupedChoiceList() por trás — quando o pool só tem
     idiomas Comuns (caso do primeiro grupo de 2), o grupo "Raros" fica
     vazio e some sozinho (groupedChoiceList já filtra grupos vazios).
   - findFirstMissingGroup(): cada grupo de escolha tem id="grp-{step}-nome"
     pra permitir o scroll+destaque automático. Grupo novo = id novo.
   - editSection(idx) / returnToSummary: sistema de "editar e voltar pro
     resumo" (usado nos links "Editar" da tela final).
   - ALL_SKILLS / ALL_TOOLS: catálogo oficial de perícias e FERRAMENTAS DE
     VERDADE (as que têm ficha de Atributo+Usar Objeto no livro). Cuidado:
     "Kit de Aventureiro", "Kit de Diplomata" etc. NÃO são ferramentas, são
     só pacotes de equipamento — não confundir na hora de montar talentos
     tipo Habilidoso pra outros antecedentes.

   PADRÕES A MANTER:
   - Nunca copiar parágrafo cru do livro — sempre parafrasear (mesma regra
     de direitos autorais usada nas outras conversas/planilha).
   - Todo texto em português, mesmo tom já usado no resto do arquivo.
   - Testar com Playwright headless (clicando o fluxo inteiro) depois de
     qualquer edição, antes de entregar — erro de sintaxe JS às vezes só
     aparece assim, o resto do app quebra silenciosamente.

   REGRA DA CASA — Sem Restrição de Antecedente (data.freeAbilityRule,
   default FALSE = comportamento oficial do livro, onde os bônus de
   atributo do antecedente ficam travados nos 3 "suggestedAbilities"
   daquele antecedente específico). Se o jogador MARCAR o checkbox na etapa
   de atributos do antecedente, libera escolher entre qualquer um dos 6
   atributos — é uma regra da casa, não a oficial. Lógica centralizada em
   allowedAbilitiesFor()/sanitizeAbilityPlans()/toggleFreeAbilityRule(), e a
   UI (bloco de +2/+1 ou +1/+1/+1) foi extraída pra
   renderAbilityPlanBlock(bgConst, plan) — usada por Charlatão e Nobre, que
   antes tinham esse bloco inteiro duplicado. Qualquer antecedente novo deve
   reusar essa mesma função, não duplicar de novo.
   ATENÇÃO CSS pra qualquer <input> novo (checkbox, radio etc.) que a gente
   adicionar: css/styles.css tem a regra global "select, input{ width:100%;
   ... }" (pensada pros campos de texto/atributo da Loja/Atributos). Isso
   estica QUALQUER input pra 100% do container, inclusive checkbox — sempre
   sobrescrever com width fixo em px (e idealmente height igual) no style
   inline desse input específico, tipo o que renderAbilityPlanBlock faz.
   Foi exatamente isso que causou o bug visual do checkbox "Regra da casa"
   (texto aparecendo longe, como se tivesse "pulado de coluna") — não era
   nada relacionado a .intro, label ou colunas, só o width:100% herdado.

   ATUALIZAÇÃO DE ARQUITETURA (reorganização em andamento, um arquivo por
   vez, com o usuário testando cada passo):
   - CSS já foi extraído para css/styles.css (linkado no <head>).
   - SPELL_DETAILS já foi extraído para data/spells.js (carregado via
     <script src="data/spells.js"> ANTES deste <script> principal, então a
     const SPELL_DETAILS já existe globalmente quando este arquivo roda).
   - ✅ CONCLUÍDO: as 10 espécies do PHB 2024 têm data/species/*.js: Tiferino,
     Pequenino, Aasimar, Anão, Orc, Humano, Draconato, Elfo, Gnomo, Golias.
     Padrão de dados: {nome, flavor, tipo, tamanho:{opcoes,alturas},
     deslocamento, visaoNoEscuro, tracosFixos:[{nome,resumo,
     concede:[{tipo,nome}]}], subespecie:{nome, escolhidaNaCriacao,
     semEscalonamento?, opcoes:[{nome,nivel1,nivel3,nivel5}]} ou null}. Uso
     de "concede" é só pra item que existe numa lista nossa (magia/truque
     hoje) — vira pill com ⓘ; texto solto (resistência, PV extra etc.) fica
     só em `resumo`, sem pill. Tamanho com 1 opção só = pill pré-selecionada
     e travada (tamanhoPickList cuida disso sozinho, sem texto de aviso).
   - data/feats.js (85 talentos) e data/skills.js (perícia->atributo) também
     já existem — usados pelo Humano (Hábil/Versátil) e pelo Habilidoso dos
     antecedentes, que agrupam perícias por atributo via
     skillGroupsByAbility()/groupedSinglePick() — rótulo do atributo e as
     pills ficam na MESMA linha (ex: "Força: Atletismo Acrobacia"), sem
     cabeçalho separado.
   ✅ ANTECEDENTES (Origens/Backgrounds) — CONCLUÍDO, os 16 do PHB 2024:
   - Charlatão, Nobre, Andarilho, Criminoso, Eremita, Fazendeiro,
     Marinheiro, Escriba, Mercador, Artesão, Artista, Guarda, Soldado,
     Acólito, Guia, Sábio. Todos em data/backgrounds/*.js.
   - O código que só sabia lidar com Charlatão/Nobre foi generalizado:
     BACKGROUND_DATA_KEY mapeia nome->chave em `data`, BACKGROUND_CONST
     mapeia nome->objeto de dados fixos, activeBgData()/activeBgConst()
     usam esses mapas. Toda função de antecedente (renderSimpleBackgroundDetail,
     canAdvance/findFirstMissingGroup case 3, renderSummary, resetWizard)
     passa por esses mapas — NUNCA hardcodar "data.antecedente==='X' ? ..."
     de novo, só adicionar a entrada nos mapas.
   - Ferramenta por escolha (Nobre, Artesão, Artista, Guarda, Soldado) usa
     bgConst.ferramentaCategoria (nome da categoria, ex. "Kit de Jogos") +
     bgConst.ferramentaOpcoes (array de variantes) em vez de bgConst.tool
     fixo. O valor escolhido fica em bg.ferramentaEscolhida (era kitJogos
     só pro Nobre antes; há migração em restore() pra saves antigos). O
     placeholder literal "{ferramenta}" dentro de bgConst.equipmentA marca
     onde a ferramenta escolhida entra na lista de equipamento — resolvido
     por resolvedEquipmentA(bgConst, bg), reutilizada tanto no detalhe do
     antecedente quanto no resumo final.
   - Iniciado em Magia (Acólito=Clérigo, Guia=Druida, Sábio=Mago) usa
     bgConst.iniciadoEmMagia = {classe, cantrips:[...], spells1:[...]} —
     listas fixas extraídas direto do PDF (cap. 3, Lista de Magias de cada
     classe), NÃO reaproveitadas de nenhum outro arquivo de dados. O
     jogador escolhe 2 truques (bg.iniciadoCantrips, máx 2) + 1 magia de
     1º círculo (bg.iniciadoSpell1, máx 1) usando o mesmo spellChoiceList()
     já usado pro Bruxo. A classe do "Iniciado em Magia" é FIXA pelo
     antecedente (não é escolha do jogador) — confirmado na planilha
     original, cada um desses 3 antecedentes só permite uma classe.
   - Talento é sempre string única (bgConst.feat), tipo "Nome — descrição
     curta". O bloco de "Talento Habilidoso — escolha 3 perícias" só
     aparece quando bgConst.feat.startsWith('Habilidoso'); o bloco de
     Iniciado em Magia só aparece quando bgConst.iniciadoEmMagia existe —
     os outros talentos fixos (Sortudo, Alerta, Curandeiro, Vigoroso,
     Valentão de Taverna, Artifista, Músico, Atacante Selvagem) não têm
     escolha nenhuma, só o texto informativo.
   - ✅ RESOLVIDO (Claude Code, ver bloco perto de freshSpeciesData() mais
     acima): "Iniciar Novo Personagem" (renomeado, era "Criar Outro
     Personagem") só zerava data.tiefling/data.pequenino entre as
     espécies — as outras 8 não eram resetadas. Não era bug de
     antecedente, só achado de bônus nesta mesma nota.
   - SHOP (linha ~285, itens da loja) também ainda está solto aqui dentro;
     pode virar data/shop.js separado depois, sem relação direta com os
     antecedentes — não misturar as duas tarefas.

   REVISÃO GERAL (engenharia + design mobile-first) — pedida pelo usuário
   quando o projeto tava perto de fechar, pra listar o que falta antes de
   perder de vista. Cada item tem o estado atual; times futuros: procure
   pelo texto entre aspas antes de assumir que já foi feito.
   - ✅ RESOLVIDO (Claude Code): "persistência nunca funcionou de verdade"
     — persist()/restore() chamavam window.storage.get/set (API de
     Artifact do claude.ai, injetada só naquele runtime), que nunca
     existiu num site estático do GitHub Pages. Todo clique tentava
     salvar, falhava calado, e o indicador no header ficava preso em "—"
     desde o 1º clique — qualquer reload/troca de app no celular perdia
     o personagem inteiro, sem aviso nenhum ao jogador. Trocado por
     localStorage direto (síncrono, sem precisar de API externa) —
     persist() grava em 'char_wizard_state', restore() lê de volta.
     Testado: escolher classe + perícias + navegar de passo, dar reload,
     e o estado volta certinho (classe, perícias, passo atual).
   - ✅ RESOLVIDO (Claude Code): "botões flutuantes cobrem conteúdo ao
     rolar" — Mochila/Randomizar eram pílulas com 2 linhas de texto
     sempre visíveis, cobrindo texto real de cards por baixo em listas
     longas (confirmado com screenshot em 375px). Encolhidos pra ícone
     só (.floater-fab, 44px circular, sem rótulo permanente — a
     explicação virou title/aria-label) — mesma posição fixa nos cantos
     superiores de antes, só ocupando bem menos área.
   - 🔜 PENDENTE: "Passo —" sem número nos títulos de Idiomas (passo 6) e
     Atributos (passo 7) — os outros 3 passos numerados (Classe/
     Antecedente/Espécie) têm "Passo 1/2/3", esses dois têm um "—" literal
     no lugar do número, parece placeholder esquecido.
   - ✅ RESOLVIDO PARCIAL (Claude Code): "código monolítico" — o único
     <script> de ~4600 linhas/230 funções dentro do index.html virou 10
     arquivos em js/ (ver MAPA DOS ARQUIVOS no topo deste arquivo), split
     mecânico em fronteiras de function/const de topo, sem reordenar nada
     — confirmado por diff que o código é byte-idêntico ao de antes, só
     dividido. Continua SEM módulos ES/bundler de verdade (de propósito:
     repo sem build step, GitHub Pages serve os arquivos direto — ver nota
     no topo de cada arquivo js/*.js) e SEM testes automatizados no repo
     (validação de sessão continua sendo Playwright ad-hoc escrito e
     descartado na hora — considerar deixar pelo menos o script de
     regressão das 2080 combinações versionado, próxima vez que mexer
     nisso). Os 50 <script src> pra data/*.js NÃO foram tocados aqui —
     ficam como pendência separada, é sobre performance (round-trips),
     não sobre "código difícil de navegar" (o que motivou este item).
   - 🔜 PENDENTE (limpeza pequena): CLASSES/ENABLED_CLASSES, SPECIES/
     ENABLED_SPECIES, BACKGROUNDS/ENABLED_BACKGROUNDS são hoje listas
     idênticas (tudo habilitado) — o mecanismo de "em breve" do
     choiceGrid() nunca mais dispara, dava pra virar uma lista só por
     categoria. Onclick inline (~30 lugares) e data-fn/data-pick
     delegado via attachStepHandlers() (~70 lugares) também coexistem
     sem motivo, valeria escolher um padrão só.
   - 🔜 IDEIA DE DESIGN (não é bug): sem modo escuro (paleta 100% clara);
     nome do personagem só aparece no Resumo (passo 9, nunca antes); sem
     "Passo 3 de 10" em texto (só os tracinhos, pequenos demais em
     375px); só Array Padrão pra atributos (sem Compra por Pontos/
     Rolagem) — simplificação legítima pro "free and easy" do README,
     mas é a limitação mais sentida por quem já joga.
   ========================================================================== */

/* CLASSES = lista MESTRE pra grade de seleção (todas as 12 do PHB + qualquer
   homebrew/UA, como Psiônico). ENABLED_CLASSES = quais dessas já têm nível 1
   implementado. Adicionar uma classe nova em ENABLED_CLASSES sem também
   colocar em CLASSES faz ela nunca aparecer na tela (bug já aconteceu com
   o Psiônico — CLASSES só tinha as 12 do PHB por padrão). */
const CLASSES = ["Bárbaro","Bardo","Bruxo","Clérigo","Druida","Feiticeiro","Guardião","Guerreiro","Ladino","Mago","Monge","Paladino","Psiônico"];
const ENABLED_CLASSES = ["Bruxo","Bárbaro","Bardo","Mago","Paladino","Psiônico","Clérigo","Guerreiro","Ladino","Druida","Feiticeiro","Monge","Guardião"];

/* Mesmo padrão do BACKGROUND_DATA_KEY/BACKGROUND_CONST, mas pra classes.
   NUNCA hardcodar "data.classe==='Bárbaro' ? BARBARO : BRUXO" de novo em
   lugar nenhum novo — adicionar aqui em vez disso. Funções de RENDER e de
   validação (canAdvance/findFirstMissingGroup) do passo 1 continuam
   se ramificando por nome de classe (if/else), porque cada classe nível 1
   tem recursos bem diferentes entre si — só os campos COMUNS (equipamento,
   proficiências de arma/armadura, perícias) usam esses mapas. */
const CLASS_DATA_KEY = { "Bruxo":"bruxo", "Bárbaro":"barbaro", "Bardo":"bardo", "Mago":"mago", "Paladino":"paladino", "Psiônico":"psionico", "Clérigo":"clerigo", "Guerreiro":"guerreiro", "Ladino":"ladino", "Druida":"druida", "Feiticeiro":"feiticeiro", "Monge":"monge", "Guardião":"guardiao" };
const CLASS_CONST = { "Bruxo":BRUXO, "Bárbaro":BARBARO, "Bardo":BARDO, "Mago":MAGO, "Paladino":PALADINO, "Psiônico":PSIONICO, "Clérigo":CLERIGO, "Guerreiro":GUERREIRO, "Ladino":LADINO, "Druida":DRUIDA, "Feiticeiro":FEITICEIRO, "Monge":MONGE, "Guardião":GUARDIAO };
function activeClassData(){
  const key = CLASS_DATA_KEY[data.classe] || 'bruxo';
  return data[key];
}
function activeClassConst(){
  return CLASS_CONST[data.classe] || BRUXO;
}
const SPECIES = ["Aasimar","Anão","Draconato","Elfo","Gnomo","Golias","Humano","Orc","Pequenino","Tiferino"];
const ENABLED_SPECIES = ["Tiferino","Pequenino","Aasimar","Anão","Orc","Humano","Draconato","Elfo","Gnomo","Golias"];
/* CORRIGIDO: o array original tinha "Órfão" (não existe como antecedente no PHB
   2024) e estava faltando "Andarilho" e "Escriba" (existem). Lista abaixo
   conferida contra o Sumário do livro — são os 16 antecedentes oficiais. */
const BACKGROUNDS = ["Acólito","Andarilho","Artesão","Artista","Charlatão","Criminoso","Eremita","Escriba","Fazendeiro","Guarda","Guia","Marinheiro","Mercador","Nobre","Sábio","Soldado"];
const ENABLED_BACKGROUNDS = ["Charlatão","Nobre","Andarilho","Criminoso","Eremita","Fazendeiro","Marinheiro","Escriba","Mercador","Artesão","Artista","Guarda","Soldado","Acólito","Guia","Sábio"];

/* Mapeia o nome oficial do antecedente (data.antecedente) pra sua chave em
   `data` (data.charlatao, data.andarilho etc.) e pro objeto de dados fixos
   (CHARLATAO, ANDARILHO etc.). Toda função genérica de antecedente usa
   esses 2 mapas — NUNCA hardcodar "data.antecedente==='Nobre' ? NOBRE :
   CHARLATAO" de novo em lugar nenhum; adicionar aqui em vez disso. */
const BACKGROUND_DATA_KEY = {
  "Charlatão":"charlatao", "Nobre":"nobre", "Andarilho":"andarilho",
  "Criminoso":"criminoso", "Eremita":"eremita", "Fazendeiro":"fazendeiro",
  "Marinheiro":"marinheiro", "Escriba":"escriba", "Mercador":"mercador",
  "Artesão":"artesao", "Artista":"artista", "Guarda":"guarda", "Soldado":"soldado",
  "Acólito":"acolito", "Guia":"guia", "Sábio":"sabio"
};
const BACKGROUND_CONST = {
  "Charlatão":CHARLATAO, "Nobre":NOBRE, "Andarilho":ANDARILHO,
  "Criminoso":CRIMINOSO, "Eremita":EREMITA, "Fazendeiro":FAZENDEIRO,
  "Marinheiro":MARINHEIRO, "Escriba":ESCRIBA, "Mercador":MERCADOR,
  "Artesão":ARTESAO, "Artista":ARTISTA, "Guarda":GUARDA, "Soldado":SOLDADO,
  "Acólito":ACOLITO, "Guia":GUIA, "Sábio":SABIO
};
/* Igual CLASS_CONST/BACKGROUND_CONST, mas pra espécie — usado só onde
   precisa de dados comuns entre todas (deslocamento, visão no escuro)
   sem ramificar por nome; o passo 5 (detalhe de espécie) continua
   ramificando por if/else como sempre (decisão já registrada no topo
   do arquivo, cada espécie tem escolhas próprias bem diferentes). */
const SPECIES_CONST = {
  "Tiferino":TIEFLING, "Pequenino":PEQUENINO, "Aasimar":AASIMAR, "Anão":ANAO,
  "Orc":ORC, "Humano":HUMANO, "Draconato":DRACONATO, "Elfo":ELFO,
  "Gnomo":GNOMO, "Golias":GOLIAS
};

/* ==========================================================================
   ÍNDICE DE PÁGINAS DO LIVRO (PHB 2024, tradução PT-BR) — só pra acelerar a
   busca manual quando for alimentar uma classe/espécie/antecedente nova.
   Não é usado em nenhuma lógica do app, é só referência de desenvolvimento.

   NÚMERO IMPRESSO x PÁGINA DO ARQUIVO PDF: os números abaixo são os que
   aparecem IMPRESSOS no rodapé de cada página do livro (os mesmos que
   aparecem no Sumário, pág. 4-5). Se for abrir o PDF num leitor comum
   (Adobe, Chrome, Preview) que numera pelo total de páginas do arquivo,
   SOME +6 ao número impresso pra achar a página no visualizador
   (ex.: "Bruxo, pág. 69" impresso = página 75 no visualizador de PDF).
   Faixas são aproximadas (±1 pág.) — algumas classes/espécies terminam
   com 1 página extra de ilustração/citação antes do próximo capítulo.

   CLASSES (Capítulo 3, cai. 48-175):
     Bárbaro 51-58 · Bardo 59-68 · Bruxo 69-80 · Clérigo 81-90
     Druida 91-102 · Feiticeiro 103-116 · Guardião 117-126
     Guerreiro 127-136 · Ladino 137-146 · Mago 147-158
     Monge 159-166 · Paladino 167-176
     (Tabela "Visão Geral das Classes" com Atributo Primário/Dado de
     Vida/Complexidade de todas as 12: pág. 33)

   ESPÉCIES (dentro do Capítulo 4, "Descrições das Espécies", pág. 186-198):
     Aasimar 186 · Anão 187 · Draconato 188 · Elfo 189-190 · Gnomo 191
     Golias 192 · Humano 193 · Orc 194 · Pequenino 195 · Tiferino 196-198

   ANTECEDENTES (dentro do Capítulo 4, "Descrições dos Antecedentes",
   pág. 177-185 — cada par abaixo divide a mesma página impressa):
     Acólito / Andarilho ......... 178
     Artesão / Artista ........... 179
     Charlatão / Criminoso ....... 180
     Eremita / Escriba ........... 181
     Fazendeiro / Guarda ......... 182
     Guia / Marinheiro ........... 183
     Mercador / Nobre ............ 184
     Sábio / Soldado .............. 185

   TALENTOS (Capítulo 5, pág. 199-211): Talentos de Origem pág. 200-201
     (é de lá que vem o talento de cada antecedente, tipo Habilidoso pro
     Charlatão) · Talentos Gerais 202-208 · Estilo de Luta 209 · Dádiva
     Épica 210-211.

   MAGIAS (Capítulo 7, pág. 234+): use a planilha condensada em vez de
   vasculhar aqui — é só pra casos em que a planilha não bater com o livro.
   ========================================================================== */


const STANDARD_ARRAY = [15,14,13,12,10,8];
const ABILITIES = ["Força","Destreza","Constituição","Inteligência","Sabedoria","Carisma"];
/* Bônus de Proficiência por nível (tabela "Evolução do Personagem", PHB
   2024) — só nível 1 hoje (+2), já como const nomeada em vez de número
   solto pra facilitar quando a progressão de nível 2+ existir. */
const PROF_BONUS_BY_LEVEL = {1:2};

const BACKGROUND_INFO = {
  "Charlatão": {
    talentoNome: "Habilidoso",
    talentoDesc: "ganha proficiência em 3 perícias ou ferramentas à sua escolha",
    fields: [["Perícias","Enganação, Prestidigitação"],["Ferramenta","Kit de Falsificação"]]
  },
  "Nobre": {
    talentoNome: "Habilidoso",
    talentoDesc: "ganha proficiência em 3 perícias ou ferramentas à sua escolha",
    fields: [["Perícias","História, Persuasão"],["Ferramenta","Kit de Jogos (escolha o tipo)"]]
  },
  "Andarilho": {
    talentoNome: "Sortudo",
    talentoDesc: "ganha pontos de sorte pra dar Vantagem, impor Desvantagem, ou anular um crítico sofrido",
    fields: [["Perícias","Furtividade, Intuição"],["Ferramenta","Ferramentas de Ladrão"]]
  },
  "Criminoso": {
    talentoNome: "Alerta",
    talentoDesc: "soma o bônus de proficiência na Iniciativa e pode trocá-la com a de um aliado",
    fields: [["Perícias","Furtividade, Prestidigitação"],["Ferramenta","Ferramentas de Ladrão"]]
  },
  "Eremita": {
    talentoNome: "Curandeiro",
    talentoDesc: "usa o Kit de Curandeiro pra tratar aliados, curando Dados de Vida extras",
    fields: [["Perícias","Medicina, Religião"],["Ferramenta","Kit de Herbalismo"]]
  },
  "Fazendeiro": {
    talentoNome: "Vigoroso",
    talentoDesc: "ganha PV máximo extra ao pegar o talento e a cada nível seguinte",
    fields: [["Perícias","Lidar com Animais, Natureza"],["Ferramenta","Ferramentas de Carpinteiro"]]
  },
  "Marinheiro": {
    talentoNome: "Valentão de Taverna",
    talentoDesc: "Ataque Desarmado mais forte, com proficiência em armas improvisadas",
    fields: [["Perícias","Acrobacia, Percepção"],["Ferramenta","Ferramentas de Navegador"]]
  },
  "Escriba": {
    talentoNome: "Habilidoso",
    talentoDesc: "ganha proficiência em 3 perícias ou ferramentas à sua escolha",
    fields: [["Perícias","Investigação, Percepção"],["Ferramenta","Suprimentos de Calígrafo"]]
  },
  "Mercador": {
    talentoNome: "Sortudo",
    talentoDesc: "ganha pontos de sorte pra dar Vantagem, impor Desvantagem, ou anular um crítico sofrido",
    fields: [["Perícias","Lidar com Animais, Persuasão"],["Ferramenta","Ferramentas de Navegador"]]
  },
  "Artesão": {
    talentoNome: "Artifista",
    talentoDesc: "ganha proficiência com 3 Ferramentas de Artesão e desconto em itens não-mágicos",
    fields: [["Perícias","Investigação, Persuasão"],["Ferramenta","Ferramentas de Artesão (escolha o tipo)"]]
  },
  "Artista": {
    talentoNome: "Músico",
    talentoDesc: "ganha proficiência com 3 Instrumentos Musicais e pode dar Inspiração Heroica",
    fields: [["Perícias","Acrobacia, Atuação"],["Ferramenta","Instrumento Musical (escolha o tipo)"]]
  },
  "Guarda": {
    talentoNome: "Alerta",
    talentoDesc: "soma o bônus de proficiência na Iniciativa e pode trocá-la com a de um aliado",
    fields: [["Perícias","Atletismo, Percepção"],["Ferramenta","Kit de Jogos (escolha o tipo)"]]
  },
  "Soldado": {
    talentoNome: "Atacante Selvagem",
    talentoDesc: "rola o dano da arma duas vezes e usa o melhor resultado, 1x por turno",
    fields: [["Perícias","Atletismo, Intimidação"],["Ferramenta","Kit de Jogos (escolha o tipo)"]]
  },
  "Acólito": {
    talentoNome: "Iniciado em Magia (Clérigo)",
    talentoDesc: "aprende 2 truques e 1 magia de 1º círculo da lista de Clérigo",
    fields: [["Perícias","Intuição, Religião"],["Ferramenta","Suprimentos de Calígrafo"]]
  },
  "Guia": {
    talentoNome: "Iniciado em Magia (Druida)",
    talentoDesc: "aprende 2 truques e 1 magia de 1º círculo da lista de Druida",
    fields: [["Perícias","Furtividade, Sobrevivência"],["Ferramenta","Ferramentas de Cartógrafo"]]
  },
  "Sábio": {
    talentoNome: "Iniciado em Magia (Mago)",
    talentoDesc: "aprende 2 truques e 1 magia de 1º círculo da lista de Mago",
    fields: [["Perícias","Arcanismo, História"],["Ferramenta","Suprimentos de Calígrafo"]]
  }
};

/* Tabela "Visão Geral das Classes", página 33 do livro — Interesse, Atributo Primário, Complexidade */
const CLASS_OVERVIEW_TABLE = {
  "Bárbaro": {interesse:"Batalha", atributo:"Força", complexidade:"Média"},
  "Bardo": {interesse:"Atuação", atributo:"Carisma", complexidade:"Alta"},
  "Bruxo": {interesse:"Conhecimento obscuro", atributo:"Carisma", complexidade:"Alta"},
  "Clérigo": {interesse:"Deuses", atributo:"Sabedoria", complexidade:"Média"},
  "Druida": {interesse:"Natureza", atributo:"Sabedoria", complexidade:"Alta"},
  "Feiticeiro": {interesse:"Poder", atributo:"Carisma", complexidade:"Alta"},
  "Guardião": {interesse:"Sobrevivência", atributo:"Destreza e Sabedoria", complexidade:"Média"},
  "Guerreiro": {interesse:"Armas", atributo:"Força ou Destreza", complexidade:"Baixa"},
  "Ladino": {interesse:"Furtividade", atributo:"Destreza", complexidade:"Baixa"},
  "Mago": {interesse:"Livros de magia", atributo:"Inteligência", complexidade:"Média"},
  "Monge": {interesse:"Combate desarmado", atributo:"Destreza e Sabedoria", complexidade:"Alta"},
  "Paladino": {interesse:"Proteção", atributo:"Força e Carisma", complexidade:"Média"},
};

const CLASS_INFO = {
  "Bruxo": {
    descricao: "Firma um pacto com uma entidade sobrenatural, trocando serviço por magia e poderes.",
    fields: [["Atributo Principal","Carisma"],["Dado de Vida","d8"],["Complexidade","Alta"]]
  },
  "Bárbaro": {
    descricao: "Guerreiro que canaliza uma fúria primitiva — mais que raiva, uma força ancestral que aumenta sua resistência e ferocidade em combate.",
    fields: [["Atributo Principal","Força"],["Dado de Vida","d12"],["Complexidade","Média"]]
  },
  "Bardo": {
    descricao: "Artista que tece magia através de música, palavras e performance, acreditando que o multiverso nasceu de palavras de criação que ainda ressoam.",
    fields: [["Atributo Principal","Carisma"],["Dado de Vida","d8"],["Complexidade","Alta"]]
  },
  "Mago": {
    descricao: "Estudioso da magia arcana, que aprende feitiços através de pesquisa metódica registrada em seu livro de magias.",
    fields: [["Atributo Principal","Inteligência"],["Dado de Vida","d6"],["Complexidade","Média"]]
  },
  "Paladino": {
    descricao: "Combatente ligado por um juramento sagrado, que une poder marcial e divino pra proteger os indefesos e combater a corrupção.",
    fields: [["Atributo Principal","Força e Carisma"],["Dado de Vida","d10"],["Complexidade","Média"]]
  },
  "Psiônico": {
    descricao: "Conjurador que manifesta magia através do poder da própria mente, usando Dados de Energia Psiônica pra abastecer habilidades telecinéticas e telepáticas.",
    fields: [["Atributo Principal","Inteligência"],["Dado de Vida","d6"],["Complexidade","Alta"],["Fonte","Unearthed Arcana 2025 — não é conteúdo oficial do PHB"]]
  },
  "Clérigo": {
    descricao: "Sacerdote que canaliza o poder divino de um deus, panteão ou entidade imortal para curar aliados e castigar inimigos.",
    fields: [["Atributo Principal","Sabedoria"],["Dado de Vida","d8"],["Complexidade","Média"]]
  },
  "Guerreiro": {
    descricao: "Mestre versátil de armas e armaduras, com treinamento amplo em técnicas de combate e destaque num estilo especializado.",
    fields: [["Atributo Principal","Força ou Destreza"],["Dado de Vida","d10"],["Complexidade","Baixa"]]
  },
  "Ladino": {
    descricao: "Especialista em furtividade e golpes precisos, que usa astúcia e as fraquezas do inimigo em vez de força bruta.",
    fields: [["Atributo Principal","Destreza"],["Dado de Vida","d8"],["Complexidade","Baixa"]]
  },
  "Druida": {
    descricao: "Guardião da natureza que extrai magia primal dos elementos, animais e plantas, e pode se transformar em criaturas selvagens.",
    fields: [["Atributo Principal","Sabedoria"],["Dado de Vida","d8"],["Complexidade","Alta"]]
  },
  "Feiticeiro": {
    descricao: "Conjurador com magia inata, gravada em sua própria essência por uma origem incomum — sangue de dragão, evento sobrenatural, dádiva divina.",
    fields: [["Atributo Principal","Carisma"],["Dado de Vida","d6"],["Complexidade","Alta"]]
  },
  "Monge": {
    descricao: "Artista marcial que canaliza um poder interior através de disciplina física e mental extremas, lutando desarmado ou com armas simples.",
    fields: [["Atributo Principal","Destreza e Sabedoria"],["Dado de Vida","d8"],["Complexidade","Alta"]]
  },
  "Guardião": {
    descricao: "Combatente errante das terras selvagens, que une técnica marcial e magia primitiva da natureza pra rastrear e enfrentar ameaças.",
    fields: [["Atributo Principal","Destreza e Sabedoria"],["Dado de Vida","d10"],["Complexidade","Média"]]
  }
};

const ALL_TOOLS = ["Ferramentas de Carpinteiro","Ferramentas de Cartógrafo","Ferramentas de Coureiro","Ferramentas de Tecelão","Ferramentas de Vidreiro","Suprimentos de Alquimista","Suprimentos de Calígrafo","Suprimentos de Cervejeiro","Suprimentos de Pintor","Utensílios de Cozinheiro","Ferramentas de Ladrão","Ferramentas de Navegador","Instrumento Musical (à escolha)","Kit de Disfarce","Kit de Herbalismo","Kit de Jogos (à escolha)","Kit de Veneno"];


/* Teto de ouro dinâmico — usado pra filtrar itens caros demais pra
   aparecerem na Loja (ver PENDÊNCIA sobre isso na nota de arquitetura no
   topo do arquivo). Some o maior valor possível do lado da classe com o
   maior valor possível do lado do antecedente. */
function computeMaxPossibleGold(){
  const classMax = Math.max(...Object.values(CLASS_CONST).map(c =>
    Math.max(c.equipmentA_gold||0, c.equipmentB_gold||0, c.equipmentC_gold||0)));
  const bgMax = Math.max(...Object.values(BACKGROUND_CONST).map(b =>
    Math.max(b.equipmentA_gold||0, b.equipmentB_gold||0)));
  return classMax + bgMax;
}

let step = 0;
const TOTAL_STEPS = 10;
let data = {
  characterName: '',
  especie: null, antecedente: null, classe: null,
  equippedArmorId: null, equippedShieldId: null,
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
  charlatao: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  nobre: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  andarilho: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  criminoso: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  eremita: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  fazendeiro: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  marinheiro: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  escriba: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  mercador: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  artesao: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  artista: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  guarda: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  soldado: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  acolito: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  guia: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  sabio: { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] },
  bruxo: { skills: [], pactBoon: null, cantrips: [], tomoCantrips: [], spells1: [], tomoRituals: [], equipment: null },
  barbaro: { skills: [], maestria: [], equipment: null },
  bardo: { skills: [], cantrips: [], spells1: [], instruments: [], equipment: null },
  mago: { skills: [], cantrips: [], spellbook: [], prepared: [], equipment: null },
  paladino: { skills: [], maestria: [], prepared: [], equipment: null },
  psionico: { skills: [], cantrips: [], spells1: [], equipment: null },
  clerigo: { skills: [], ordem: null, cantrips: [], spells1: [], equipment: null },
  guerreiro: { skills: [], estilo: null, maestria: [], equipment: null },
  ladino: { skills: [], especialista: [], maestria: [], equipment: null },
  druida: { skills: [], ordem: null, cantrips: [], spells1: [], equipment: null },
  feiticeiro: { skills: [], cantrips: [], spells1: [], equipment: null },
  monge: { skills: [], equipment: null, toolCategory: null, toolChoice: null },
  guardiao: { skills: [], spells1: [], maestria: [], equipment: null },
  idiomas: { comuns: [], extra: [] },
  attrs: {},
  shop: { purchases: {}, collapsedCats: {}, filterByProf: false },
  returnToSummary: false,
  freeAbilityRule: false
};

/* Versão do app mostrada na última linha do header (junto do indicador
   de Salvo/Salvando) — formato v<ano><mês><dia><hora 24h><minuto> do
   momento do último push. Sem build step neste repo (GitHub Pages serve
   os arquivos direto), então é atualizada NA MÃO a cada push que muda
   comportamento visível — não é o horário em que o navegador do jogador
   carregou a página, é "qual versão do código você está rodando", útil
   pra saber se um relato de bug já inclui um fix recente (cache do
   GitHub Pages/navegador pode segurar uma versão velha por um tempo). */
const APP_VERSION = 'v202608131903';

function mod(score){ return Math.floor((score-10)/2); }
function fmt(n){ return (n>=0?'+':'')+n; }
function fmtGold(n){ return (Math.round(n*100)/100).toString().replace('.',','); }

let saveTimer;
function persist(){
  clearTimeout(saveTimer);
  document.getElementById('saveText').textContent = 'salvando…';
  document.getElementById('saveDot').style.opacity='1';
  saveTimer = setTimeout(()=>{
    try{
      localStorage.setItem('char_wizard_state', JSON.stringify({step, data}));
      document.getElementById('saveText').textContent='salvo';
      document.getElementById('saveDot').style.opacity='0.3';
    }catch(e){
      document.getElementById('saveText').textContent='—';
    }
  }, 400);
}
async function restore(){
  try{
    const raw = localStorage.getItem('char_wizard_state');
    if(raw){
      const parsed = JSON.parse(raw);
      step = parsed.step || 0;
      data = Object.assign(data, parsed.data);
      if(!data.shop) data.shop = {purchases:{}};
      if(data.shop.filterByProf===undefined) data.shop.filterByProf = false;
      /* Migração de saves antigos: data.shop.purchases costumava ser
         chaveado pelo NOME de exibição do item (frágil — ver nota em
         data/shop-items.js), agora é chaveado pelo "id" estável. Se a
         chave já bate com um id válido, mantém; senão, tenta achar o
         item pelo NOME antigo e reescreve com o id certo. Chave que não
         bate com nada (item removido/renomeado sem deixar rastro) é
         descartada — mais seguro que manter uma compra órfã. */
      if(data.shop.purchases){
        const migrated = {};
        Object.entries(data.shop.purchases).forEach(([key, qty])=>{
          if(findShopItem(key)){ migrated[key] = qty; return; }
          const found = findShopItemByName(key);
          if(found) migrated[found.id] = qty;
        });
        data.shop.purchases = migrated;
      }
      /* Monge: save antigo pode não ter os campos de escolha de
         Ferramenta/Instrumento (adicionados quando o seletor de verdade
         foi implementado). */
      if(data.monge.toolCategory===undefined) data.monge.toolCategory = null;
      if(data.monge.toolChoice===undefined) data.monge.toolChoice = null;
      if(data.characterName===undefined) data.characterName = '';
      /* Espécies: garante que TODA chave de freshSpeciesData() exista em
         data (evita crash se um save antigo do navegador não tiver uma
         espécie mais recente que a gente adicionou depois) — mesma função
         usada por resetWizard(), pra não duplicar os defaults em dois
         lugares. */
      const speciesDefaults = freshSpeciesData();
      Object.keys(speciesDefaults).forEach(key=>{
        if(!data[key]) data[key] = speciesDefaults[key];
      });
      /* Antecedentes: garante que TODA chave de BACKGROUND_DATA_KEY exista
         em data (evita crash se um save antigo do navegador não tiver o
         antecedente mais recente que a gente adicionou depois). */
      Object.values(BACKGROUND_DATA_KEY).forEach(key=>{
        if(!data[key]) data[key] = { abilityPlan: null, equipment: null, habilidoso: [], ferramentaEscolhida: null, iniciadoCantrips: [], iniciadoSpell1: [] };
        if(!data[key].habilidoso) data[key].habilidoso = [];
        if(data[key].ferramentaEscolhida===undefined) data[key].ferramentaEscolhida = null;
        if(!data[key].iniciadoCantrips) data[key].iniciadoCantrips = [];
        if(!data[key].iniciadoSpell1) data[key].iniciadoSpell1 = [];
      });
      /* Migração de saves antigos: o Nobre usava um campo próprio kitJogos
         antes de virar o padrão genérico ferramentaEscolhida. */
      if(data.nobre.kitJogos && !data.nobre.ferramentaEscolhida){
        data.nobre.ferramentaEscolhida = data.nobre.kitJogos;
        delete data.nobre.kitJogos;
      }
      if(data.returnToSummary===undefined) data.returnToSummary = false;
      if(data.freeAbilityRule===undefined) data.freeAbilityRule = false;
    }
  }catch(e){}
}

