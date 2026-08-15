/* 04-background-steps.js — Passo de Antecedente: grade de escolha + tela de detalhe genérica, resolução de equipamento inicial, e os floaters globais (Mochila/Perícias e Talentos/Randomizar) — ficam fisicamente entre antecedente e classe no arquivo original, mantido aqui pra não reordenar nada.
   Extraído de index.html (linhas 2388-2680 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
function renderBackgroundStep(){
  return `<h2>Passo 2 — Escolha seu Antecedente</h2>
  <div class="intro">O antecedente representa a vida do seu personagem antes da aventura: concede um talento, duas perícias, uma ferramenta e ajuda a definir os atributos.</div>
  <div id="grp-2-antecedente">${choiceGridWithInfo(BACKGROUNDS, ENABLED_BACKGROUNDS, data.antecedente, 'pickBackground', BACKGROUND_INFO)}</div>
  ${nav(canAdvance())}`;
}

/* Antecedente "genérico": cobre TODO antecedente, incluindo os de
   ferramenta-por-escolha (Nobre, Artesão, Artista, Guarda, Soldado — via
   bgConst.ferramentaCategoria/ferramentaOpcoes) e os de talento fixo sem
   escolha nenhuma (Sortudo, Alerta, Curandeiro, Vigoroso, Valentão de
   Taverna etc. — nesse caso o bloco de Habilidoso simplesmente não
   aparece). O placeholder "{ferramenta}" dentro de bgConst.equipmentA é
   substituído pelo tipo escolhido (ou pelo nome da categoria, se ainda não
   escolheu) — ver resolvedEquipmentA(). */
function resolvedEquipmentA(bgConst, bg){
  if(!bgConst.ferramentaOpcoes) return bgConst.equipmentA;
  const chosen = bg.ferramentaEscolhida || bgConst.ferramentaCategoria;
  return bgConst.equipmentA.map(item => item==='{ferramenta}' ? chosen : item);
}

/* Mesma ideia de resolvedEquipmentA(), mas pro lado da CLASSE: só o
   Bardo ("Instrumento Musical à escolha") e o Monge ("Ferramenta/
   Instrumento escolhido") têm placeholder de equipamento — reaproveita
   a escolha que o jogador já fez em outro lugar (Bardo: o 1º dos 3
   instrumentos de data.bardo.instruments; Monge: data.monge.toolChoice,
   escolhido no próprio passo 1). Funciona pra equipmentA/B/C de
   qualquer classe — é um no-op pras que não têm esses textos. */
function resolvedClassEquipmentList(list){
  if(!list) return [];
  return list.map(item => {
    if(item==='Instrumento Musical à escolha') return (data.bardo.instruments && data.bardo.instruments.length) ? data.bardo.instruments[0] : item;
    if(item==='Ferramenta/Instrumento escolhido') return data.monge.toolChoice || item;
    return item;
  });
}

/* Acha um item da Loja pelo NOME de exibição (não pelo id) — usado só
   pra RESOLVER equipamento inicial contra a Loja (equipamento inicial é
   texto livre, então o cruzamento tem que ser por nome mesmo) e na
   migração de saves antigos em restore(). Em qualquer outro lugar do
   código, usar findShopItem(id). */
function findShopItemByName(name){
  for(const cat of Object.values(SHOP)){
    const found = cat.items.find(i=>i.n===name);
    if(found) return found;
  }
  return null;
}

/* Resolve UM texto de equipamento inicial (já com qualquer placeholder
   de classe/antecedente substituído, ver resolvedClassEquipmentList()/
   resolvedEquipmentA() acima) pro id real da Loja, quando existir.
   Ordem: 1) EQUIPMENT_ALIASES (data/equipment-aliases.js — cobre
   quantidade embutida tipo "20 Flechas" e formatação diferente tipo
   "Foco Arcano (orbe)"); 2) match exato de nome; 3) variante de Kit de
   Jogos escolhida via {ferramenta} (Guarda/Nobre/Soldado — a Loja só
   vende 1 item genérico "Kit de Jogos", nenhuma variante bate sozinha);
   4) sem resolução — vira item de sabor na mochila, sem id (ex:
   "Símbolo Sagrado" sozinho, ambíguo entre as 3 variantes vendidas). */
function resolveEquipmentText(text){
  if(Object.prototype.hasOwnProperty.call(EQUIPMENT_ALIASES, text)){
    const alias = EQUIPMENT_ALIASES[text];
    return alias ? {label:text, id:alias.id, qty:alias.qty} : {label:text, id:null, qty:1};
  }
  const exact = findShopItemByName(text);
  if(exact) return {label:text, id:exact.id, qty:1};
  if(ALL_GAME_SETS.includes(text)) return {label:text, id:'kit-de-jogos', qty:1};
  return {label:text, id:null, qty:1};
}

/* Todos os itens que o personagem já TEM antes de entrar na Loja —
   resolvidos da Opção de equipamento escolhida na classe (A/B/C — C só
   dá ouro, sem itens) e do antecedente (A só, B só dá ouro). Cada item
   vem como {label, id, qty}; id é null quando o texto não bate com
   nenhum item real da Loja (item de sabor, ver resolveEquipmentText()).
   Base da "mochila do jogador" (renderMochilaFloater()/renderMochilaPopup()). */
function characterStartingItems(){
  const clsConst = activeClassConst();
  const cls = activeClassData();
  const bgConst = activeBgConst();
  const bg = activeBgData();
  const items = [];
  const clsList = cls.equipment==='A' ? clsConst.equipmentA : cls.equipment==='B' ? clsConst.equipmentB : null;
  resolvedClassEquipmentList(clsList).forEach(text => items.push(resolveEquipmentText(text)));
  if(bg.equipment==='A'){
    resolvedEquipmentA(bgConst, bg).forEach(text => items.push(resolveEquipmentText(text)));
  }
  return items;
}

/* Agrupa characterStartingItems() por item (soma quantidade se a mesma
   coisa vier de duas fontes) e resolve o nome de EXIBIÇÃO pro nome
   canônico da Loja quando tem id (senão usa o texto original). Guarda o
   "id" no resultado (antes era descartado) — precisa dele pra cruzar
   com ARMOR_AC/SHIELD_ITEM_ID em ownedEquipmentList() logo abaixo. */
function mochilaItems(){
  const grouped = {};
  characterStartingItems().forEach(({label, id, qty})=>{
    const key = id || ('flavor:'+label);
    if(!grouped[key]) grouped[key] = {label: id ? findShopItem(id).n : label, id: id||null, qty:0};
    grouped[key].qty += qty;
  });
  return Object.values(grouped);
}

/* Lista ÚNICA de tudo que o personagem possui — herdado da Classe/
   Antecedente (mochilaItems()) + comprado na Loja (data.shop.purchases),
   somando quantidade se o MESMO item vier dos dois (ex: 2 Adagas de
   graça + 1 comprada = "Adaga ×3", uma linha só). Achado como pendência
   ao ligar o equipar de Armadura/Escudo no Resumo: sheet.equipamento.itens
   usava só mochilaItems(), então qualquer coisa comprada na Loja (a
   forma mais comum de conseguir Armadura/Escudo pra quem pegou só ouro
   na Opção B) nunca aparecia na seção "Equipamento" do Resumo nem no
   "Copiar Resumo" — só no popup da Mochila, que já somava as duas
   fontes separadamente. Mesmo padrão de "id" de mochilaItems() acima. */
/* Soma um item ao grupo (mesclando quantidade se já existir) — extraído
   pra reusar tanto pro item "normal" quanto pro conteúdo "aberto" de um
   Kit (ver KIT_CONTENTS, data/shop-items.js). */
function addOwnedItem(grouped, id, label, qty){
  const key = id || ('flavor:'+label);
  if(!grouped[key]) grouped[key] = {label, id, qty: 0};
  grouped[key].qty += qty;
}

function ownedEquipmentList(){
  const grouped = {};
  mochilaItems().forEach(it=>{
    if(it.id && KIT_CONTENTS[it.id]){
      KIT_CONTENTS[it.id].forEach(c=>addOwnedItem(grouped, c.id, findShopItem(c.id).n, c.qty * it.qty));
    } else {
      addOwnedItem(grouped, it.id, it.label, it.qty);
    }
  });
  Object.entries(data.shop.purchases||{}).forEach(([id, qty])=>{
    if(qty<=0) return;
    const item = findShopItem(id);
    if(!item) return;
    if(KIT_CONTENTS[id]){
      KIT_CONTENTS[id].forEach(c=>addOwnedItem(grouped, c.id, findShopItem(c.id).n, c.qty * qty));
    } else {
      addOwnedItem(grouped, id, item.n, qty);
    }
  });
  return Object.values(grouped);
}

/* Floater "Mochila" (canto superior direito, sempre visível a partir do
   momento em que há classe ou antecedente escolhido) + popup — itens
   herdados da escolha de equipamento de classe/antecedente + o que já
   foi comprado na Loja. Fecha o gap que existia antes: o equipamento
   inicial só aparecia no passo em que era escolhido e de novo no
   Resumo final, sumindo do resto do fluxo (incluindo a Loja inteira).
   Ao contrário da 1ª versão (painel embutido só na Loja), agora é
   global — dá pra conferir a qualquer momento do wizard, não só na
   hora de comprar. mochilaOpen é estado de UI puro (não entra em
   `data`/persist() — fechar sozinho ao recarregar a página é aceitável,
   mesmo padrão de expandedSpellInfo/expandedTraitInfo). */
let mochilaOpen = false;
function toggleMochilaOpen(){ mochilaOpen = !mochilaOpen; render(); }

/* Posiciona TODOS os floaters do lado DIREITO da tela, empilhados
   verticalmente um abaixo do outro, na ordem de RIGHT_FLOATERS — logo
   abaixo do <header> de verdade, medindo a altura real dele em vez de
   cravar um "top" fixo no CSS (o cabeçalho muda de altura conforme a
   largura da tela, já que o título quebra em 1 ou 2 linhas dependendo
   do aparelho — bug relatado antes por usuário com print do celular).
   Era só positionMochilaFloater() (1 floater só) até o de Perícias e
   Talentos aparecer do lado direito também — generalizada aqui em vez
   de escrever uma função de posição nova pra cada floater novo (o de
   Magias, ainda por vir, só precisa entrar nesta lista). Cada popup (se
   aberto) fica colado embaixo do SEU PRÓPRIO floater, não do primeiro
   da pilha. Chamada depois de todo render() e no resize da janela. */
const RIGHT_FLOATERS = [
  {floater:'.pericias-floater', popup:'.pericias-popup'},
  {floater:'.magias-floater', popup:'.magias-popup'},
  {floater:'.mochila-floater', popup:'.mochila-popup'}
];
function positionRightFloaters(){
  const header = document.querySelector('header');
  if(!header) return;
  let top = header.offsetTop + header.offsetHeight + 10;
  RIGHT_FLOATERS.forEach(({floater, popup})=>{
    const el = document.querySelector(floater);
    if(!el) return;
    el.style.top = top + 'px';
    const popupEl = document.querySelector(popup);
    if(popupEl) popupEl.style.top = (top + el.offsetHeight + 8) + 'px';
    top += el.offsetHeight + 10;
  });
}
window.addEventListener('resize', positionRightFloaters);

/* Ícone só (sem rótulo/subtítulo permanentes) — achado numa revisão
   geral: a versão anterior (pílula "🎒 Mochila" + "(clique pra abrir/
   fechar)") cobria conteúdo real da tela ao rolar em listas longas
   (Classe/Antecedente/Espécie/Loja), porque é position:fixed e não
   reage a scroll. Reduzido pra um círculo de 44px (.floater-fab no CSS)
   — cobre bem menos, mantém alvo de toque acessível, e a explicação
   agora é só o title/aria-label (tooltip), não texto sempre visível. */
function renderMochilaFloater(){
  /* Só aparece depois do equipamento inicial da CLASSE estar escolhido
     (data[classKey].equipment) — antes disso a Mochila não tem nada de
     verdade pra mostrar (achado real de usuário: aparecia já na 1ª tela,
     antes até do jogador ver o Passo de Detalhes da Classe, onde o
     dinheiro/itens são decididos). Checa o campo em `data`, não o
     `step` atual — assim continua aparecendo certinho se o jogador usar
     "Editar" no Resumo e voltar pro Passo 0 (step vira 0 de novo, mas o
     equipamento já escolhido antes continua valendo). */
  if(!data.classe || !activeClassData().equipment) return '';
  return `<div class="floater-fab mochila-floater" onclick="toggleMochilaOpen()" title="Mochila — ver itens" aria-label="Mochila — ver itens">🎒</div>
  ${mochilaOpen ? renderMochilaPopup() : ''}`;
}

/* Botão "Randomizar" — mesma ideia/altura da Mochila, mas do lado
   esquerdo (mochila-floater.css é reaproveitado quase todo, só a
   posição/left muda — ver .randomizar-floater no CSS). Só aparece nos
   passos 0-8 (os únicos com campo obrigatório de verdade, mesmo critério
   de findFirstMissingGroup()/canAdvance() — Alinhamento, passo 8,
   também entrou nessa lista) — não aparece na Loja (9) nem no Resumo
   (10), pedido explícito do usuário pra Loja, e o Resumo nunca teve
   campo pra randomizar mesmo. */
function positionRandomizarFloater(){
  const header = document.querySelector('header');
  const floater = document.querySelector('.randomizar-floater');
  if(!header || !floater) return;
  floater.style.top = (header.offsetTop + header.offsetHeight + 10) + 'px';
}
window.addEventListener('resize', positionRandomizarFloater);

function renderRandomizarFloater(){
  if(step>8) return '';
  return `<div class="floater-fab randomizar-floater" onclick="randomizeCurrentStep()" title="Randomizar — preenche esta tela" aria-label="Randomizar — preenche esta tela">🎲</div>`;
}

function renderMochilaPopup(){
  const inherited = mochilaItems();
  const purchases = data.shop.purchases||{};
  const purchasedEntries = Object.entries(purchases).filter(([,q])=>q>0).map(([id,q])=>({label: findShopItem(id).n, qty:q}));
  const total = inherited.length + purchasedEntries.length;
  return `<div class="mochila-overlay" onclick="toggleMochilaOpen()">
    <div class="mochila-popup" onclick="event.stopPropagation()">
      <div class="mochila-popup-header">
        <h3>Sua Mochila</h3>
        <button class="btn small" onclick="toggleMochilaOpen()">✕</button>
      </div>
      ${inherited.length ? `<div style="margin-bottom:10px;"><div class="group-label" style="margin-bottom:4px;">Herdado da Classe/Antecedente</div>${inherited.map(it=>`<span class="pill-static">${it.label}${it.qty>1?` ×${it.qty}`:''}</span>`).join('')}</div>` : ''}
      ${purchasedEntries.length ? `<div><div class="group-label" style="margin-bottom:4px;">Comprado na Loja</div>${purchasedEntries.map(it=>`<span class="pill-static">${it.label} ×${it.qty}</span>`).join('')}</div>` : ''}
      ${total===0 ? '<span style="color:var(--parchment-dim);">Nada ainda — escolha o equipamento inicial na Classe/Antecedente, ou compre algo na Loja.</span>' : ''}
    </div>
  </div>`;
}

/* Floater "Perícias e Talentos" (👤) — mesmo padrão da Mochila (ícone
   sozinho, popup ao clicar, empilhado logo ACIMA dela via
   RIGHT_FLOATERS), pedido do usuário pra conferir a qualquer momento do
   wizard tudo que o personagem já tem, sem esperar chegar no Resumo.
   Soma as MESMAS fontes que a checagem de Duplicidade já rastreia
   (skillsGrantedBySource(), perto do fim de 08-handlers.js) — não
   recalcula nada novo, só reaproveita e agrupa por fonte pra exibição.
   periciasTalentosOpen é estado de UI puro, mesmo padrão de
   mochilaOpen (não entra em `data`/persist()). */
let periciasTalentosOpen = false;
function togglePericiasTalentosOpen(){ periciasTalentosOpen = !periciasTalentosOpen; render(); }

function renderPericiasTalentosFloater(){
  if(!data.classe) return ''; // antes da Classe escolhida não tem nem perícia nem talento pra mostrar
  return `<div class="floater-fab pericias-floater" onclick="togglePericiasTalentosOpen()" title="Perícias e Talentos — ver tudo que você já tem" aria-label="Perícias e Talentos — ver tudo que você já tem">👤</div>
  ${periciasTalentosOpen ? renderPericiasTalentosPopup() : ''}`;
}

function renderPericiasTalentosPopup(){
  /* activeBgConst()/skillsGrantedBySource() caem no fallback CHARLATAO
     quando data.antecedente ainda é null (mesmo padrão usado no resto
     do app pra nunca quebrar antes da escolha) — mas aqui, diferente de
     um cálculo interno, isso apareceria NA TELA como se o jogador já
     tivesse escolhido Charlatão sem ter escolhido nada ainda. Por isso,
     ao contrário de skillsGrantedBySource() (reaproveitada como está),
     as partes que vêm do Antecedente só entram se data.antecedente
     estiver de fato preenchido. */
  const temAntecedente = !!data.antecedente;
  const bySource = skillsGrantedBySource();
  const grupos = [
    {label:'Classe', items: bySource.classe},
    {label:'Antecedente', items: temAntecedente ? bySource.antecedenteFixo : []},
    {label:'Espécie', items: [...bySource.humano, ...bySource.elfo]},
    {label:'Talento Habilidoso', items: temAntecedente ? bySource.habilidoso : []}
  ].filter(g=>g.items.length>0);
  const totalPericias = grupos.reduce((n,g)=>n+g.items.length, 0);

  /* Talento(s) de verdade (não a perícia que ele concede) — só existem 2
     fontes possíveis no nível 1: o talento fixo do Antecedente (sempre
     existe, qualquer que seja: Alerta, Habilidoso, Iniciado em Magia...)
     e o Versátil do Humano (opcional, só se a espécie for Humano e já
     tiver escolhido). Mesmas 2 fontes que hasFeatByName() já checa. */
  const talentos = [];
  if(temAntecedente){
    const talentoAntecedente = backgroundFeatBaseName();
    if(talentoAntecedente) talentos.push(talentoAntecedente);
  }
  if(data.especie==='Humano' && data.humano.talento) talentos.push(data.humano.talento);

  return `<div class="mochila-overlay" onclick="togglePericiasTalentosOpen()">
    <div class="mochila-popup pericias-popup" onclick="event.stopPropagation()">
      <div class="mochila-popup-header">
        <h3>Perícias e Talentos</h3>
        <button class="btn small" onclick="togglePericiasTalentosOpen()">✕</button>
      </div>
      <div class="group-label" style="margin-top:0;">Perícias</div>
      ${totalPericias===0 ? '<span style="color:var(--parchment-dim);">Nenhuma escolhida ainda.</span>' : grupos.map(g=>`
        <div style="margin-bottom:10px;">
          <div style="font-size:0.72rem;color:var(--parchment-dim);margin-bottom:4px;">${g.label}</div>
          ${g.items.map(s=>`<span class="pill-static">${s}</span>`).join('')}
        </div>`).join('')}
      <div class="group-label">Talentos</div>
      ${talentos.length===0 ? '<span style="color:var(--parchment-dim);">Nenhum ainda — escolha o Antecedente.</span>' : talentos.map(t=>`<span class="pill-static">${t}</span>`).join('')}
    </div>
  </div>`;
}

/* Floater "Truques e Magias" (🔮) — mesmo padrão dos outros dois (👤/🎒),
   empilhado no MEIO deles via RIGHT_FLOATERS. Popup com 2 seções
   (Truques, Magias), cada uma agrupada por fonte (Classe / Antecedente-
   Iniciado em Magia / Espécie), reaproveitando spellsGrantedBySource()
   (perto de classSpellNamesRaw() em 07-compute-and-summary.js) — mesma
   ideia de "não recalcular nada novo" já usada no floater de Perícias.
   magiasOpen é estado de UI puro, mesmo padrão de mochilaOpen/
   periciasTalentosOpen (não entra em `data`/persist()). */
let magiasOpen = false;
function toggleMagiasOpen(){ magiasOpen = !magiasOpen; render(); }

function renderMagiasFloater(){
  if(!data.classe) return ''; // antes da Classe escolhida não tem truque/magia de nenhuma fonte pra mostrar
  return `<div class="floater-fab magias-floater" onclick="toggleMagiasOpen()" title="Truques e Magias — ver tudo que você já tem" aria-label="Truques e Magias — ver tudo que você já tem">🔮</div>
  ${magiasOpen ? renderMagiasPopup() : ''}`;
}

/* Monta os grupos por fonte de UMA categoria (truques OU magias) — usada
   2x dentro de renderMagiasPopup() abaixo, uma pra cada categoria, pra
   não repetir a mesma lógica de "temAntecedente"/filter duas vezes. */
function spellSourceGroups(bySource, categoria, temAntecedente){
  return [
    {label:'Classe', items: bySource.classe[categoria]},
    {label:'Antecedente (Iniciado em Magia)', items: temAntecedente ? bySource.antecedenteIniciado[categoria] : []},
    {label:'Espécie', items: bySource.especie[categoria]}
  ].filter(g=>g.items.length>0);
}

function renderMagiasPopup(){
  /* Mesmo cuidado do floater de Perícias e Talentos: activeBgData() cai
     no fallback CHARLATAO antes de data.antecedente ser escolhido — as
     partes vindas do Antecedente só entram se ele estiver de fato
     preenchido, pra nunca mostrar magia que o jogador não escolheu. */
  const temAntecedente = !!data.antecedente;
  const bySource = spellsGrantedBySource();
  const gruposTruques = spellSourceGroups(bySource, 'truques', temAntecedente);
  const gruposMagias = spellSourceGroups(bySource, 'magias', temAntecedente);

  const renderGrupos = grupos => grupos.map(g=>`
    <div style="margin-bottom:10px;">
      <div style="font-size:0.72rem;color:var(--parchment-dim);margin-bottom:4px;">${g.label}</div>
      ${g.items.map(s=>`<span class="pill-static">${s}</span>`).join('')}
    </div>`).join('');

  return `<div class="mochila-overlay" onclick="toggleMagiasOpen()">
    <div class="mochila-popup magias-popup" onclick="event.stopPropagation()">
      <div class="mochila-popup-header">
        <h3>Truques e Magias</h3>
        <button class="btn small" onclick="toggleMagiasOpen()">✕</button>
      </div>
      <div class="group-label" style="margin-top:0;">Truques</div>
      ${gruposTruques.length===0 ? '<span style="color:var(--parchment-dim);">Nenhum ainda.</span>' : renderGrupos(gruposTruques)}
      <div class="group-label">Magias</div>
      ${gruposMagias.length===0 ? '<span style="color:var(--parchment-dim);">Nenhuma ainda.</span>' : renderGrupos(gruposMagias)}
    </div>
  </div>`;
}

function renderSimpleBackgroundDetail(bgConst){
  const bg = activeBgData();
  const plan = bg.abilityPlan;
  const isHabilidoso = bgConst.feat.startsWith('Habilidoso');
  const hasToolChoice = !!bgConst.ferramentaOpcoes;
  const excludedTool = hasToolChoice ? (bg.ferramentaEscolhida || bgConst.ferramentaCategoria) : bgConst.tool;
  const equipA = resolvedEquipmentA(bgConst, bg);
  return `<h2>${bgConst.nome} — Detalhes do Antecedente</h2>
  <div class="intro">Talento: ${bgConst.feat}<br>Perícias: ${bgConst.skills.join(', ')}<br>Ferramenta: ${hasToolChoice ? bgConst.ferramentaCategoria+' (escolha o tipo abaixo)' : bgConst.tool}</div>
  ${renderAbilityPlanBlock(bgConst, plan)}

  ${hasToolChoice ? `
  <h3 id="grp-3-ferramenta">Ferramenta — escolha o tipo de ${bgConst.ferramentaCategoria}</h3>
  <div class="intro" style="margin-bottom:8px;">O livro deixa livre entre as variantes vendidas no capítulo de Equipamento.</div>
  <div class="check-list" style="margin-bottom:20px;">
    ${bgConst.ferramentaOpcoes.map(k=>`<div class="check-pill ${bg.ferramentaEscolhida===k?'selected':''}" data-pick="${k}" data-fn="pickFerramentaEscolhida">${k}</div>`).join('')}
  </div>` : ''}

  ${bgConst.iniciadoEmMagia ? `
  <h3 id="grp-3-iniciado-truques">Iniciado em Magia — 2 truques de ${bgConst.iniciadoEmMagia.classe}</h3>
  ${speciesGrantedCantrips().length ? `<div class="intro" style="margin-bottom:8px;">Truques que você já conhece de graça pela espécie (${speciesGrantedCantrips().join(', ')}) não aparecem aqui.</div>` : ''}
  ${spellChoiceList(bgConst.iniciadoEmMagia.cantrips.filter(c=>!speciesGrantedCantrips().includes(c) && !chosenCantripsElsewhere('iniciadoEmMagia').includes(c)), bg.iniciadoCantrips, 2, 'toggleIniciadoCantrip')}
  <div class="counter ${bg.iniciadoCantrips.length===2?'ok':''}">${bg.iniciadoCantrips.length}/2 escolhidos</div>

  <h3 id="grp-3-iniciado-magia1">Iniciado em Magia — 1 magia de 1º círculo de ${bgConst.iniciadoEmMagia.classe}</h3>
  <div class="intro" style="margin-bottom:8px;">Essa magia fica sempre preparada e pode ser conjurada 1x grátis por Descanso Longo (ou com espaço de magia depois).</div>
  ${spellChoiceList(bgConst.iniciadoEmMagia.spells1.filter(s=>!speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('iniciadoEmMagia').includes(s)), bg.iniciadoSpell1, 1, 'toggleIniciadoSpell1')}
  <div class="counter ${bg.iniciadoSpell1.length===1?'ok':''}">${bg.iniciadoSpell1.length}/1 escolhida</div>` : ''}

  ${isHabilidoso ? `
  <h3 id="grp-3-habilidoso">Talento Habilidoso — escolha 3 perícias ou ferramentas</h3>
  <div class="intro" style="margin-bottom:8px;">${bgConst.skills.join(' e ')} (perícias) e ${excludedTool} (ferramenta) já vêm do ${bgConst.nome}, e perícias já escolhidas pela classe ou espécie, não aparecem aqui.</div>
  ${groupedChoiceList([
    ...skillGroupsByAbility(ALL_SKILLS.filter(s=>!skillsGrantedElsewhere('habilidoso').includes(s))),
    {label:'Ferramentas', items: ALL_TOOLS.filter(t=>t!==excludedTool)}
  ], bg.habilidoso, 3, 'toggleHabilidoso')}
  <div class="counter ${bg.habilidoso.length===3?'ok':''}">${bg.habilidoso.length}/3 escolhidos</div>` : ''}

  <h3 id="grp-3-equipment">Equipamento Inicial</h3>
  <div class="option-block ${bg.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${equipA.join(', ')}, ${bgConst.equipmentA_gold} PO</p>
    <button class="pick-btn" data-pick="A" data-fn="pickBgEquip">${bg.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${bg.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${bgConst.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickBgEquip">${bg.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

