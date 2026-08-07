/* 04-background-steps.js — Passo de Antecedente: grade de escolha + tela de detalhe genérica, resolução de equipamento inicial, e os floaters globais (Mochila/Randomizar/Novidades) — ficam fisicamente entre antecedente e classe no arquivo original, mantido aqui pra não reordenar nada.
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
function ownedEquipmentList(){
  const grouped = {};
  mochilaItems().forEach(it=>{
    const key = it.id || ('flavor:'+it.label);
    grouped[key] = {label: it.label, id: it.id, qty: it.qty};
  });
  Object.entries(data.shop.purchases||{}).forEach(([id, qty])=>{
    if(qty<=0) return;
    const item = findShopItem(id);
    if(!item) return;
    if(!grouped[id]) grouped[id] = {label: item.n, id, qty: 0};
    grouped[id].qty += qty;
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

/* Posiciona o floater (e o popup, se estiver aberto) logo abaixo do
   <header> de verdade, medindo a altura real dele em vez de cravar um
   "top" fixo no CSS — o cabeçalho muda de altura conforme a largura da
   tela (o título "Criador de Personagens" quebra em 1 ou 2 linhas
   dependendo do aparelho), então um número fixo ficava certo numa
   largura e em cima do título ou do resumo em outra (bug relatado pelo
   usuário com print do celular). Chamada depois de todo render() e no
   resize da janela (rotação de tela, redimensionar o browser). */
function positionMochilaFloater(){
  const header = document.querySelector('header');
  const floater = document.querySelector('.mochila-floater');
  if(!header || !floater) return;
  const topBase = header.offsetTop + header.offsetHeight + 10;
  floater.style.top = topBase + 'px';
  const popup = document.querySelector('.mochila-popup');
  if(popup) popup.style.top = (topBase + floater.offsetHeight + 8) + 'px';
}
window.addEventListener('resize', positionMochilaFloater);

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
   passos 0-7 (os únicos com campo obrigatório de verdade, mesmo critério
   de findFirstMissingGroup()/canAdvance()) — não aparece na Loja (8) nem
   no Resumo (9), pedido explícito do usuário pra Loja, e o Resumo nunca
   teve campo pra randomizar mesmo. */
function positionRandomizarFloater(){
  const header = document.querySelector('header');
  const floater = document.querySelector('.randomizar-floater');
  if(!header || !floater) return;
  floater.style.top = (header.offsetTop + header.offsetHeight + 10) + 'px';
}
window.addEventListener('resize', positionRandomizarFloater);

function renderRandomizarFloater(){
  if(step>7) return '';
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

/* Popup "Novidades" — resumo das últimas atualizações, mostrado uma vez
   na 1ª tela (Passo 1) quando há update novo desde a última vez que o
   jogador fechou o popup (guardado em localStorage numa chave própria,
   separada da chave 'char_wizard_state' do persist() — é preferência do
   navegador sobre o QUE JÁ VIU, não estado de ficha). Sempre só os 3
   mais recentes: ao adicionar um
   novo no topo, apaga o mais antigo do array em vez de deixar crescer.
   changelogOpen decidido 1x em init() (ver final do arquivo) comparando
   CHANGELOG[0].id salvo; fechar (✕ ou clique fora) grava esse id como
   visto, então só reaparece sozinho quando o item mais novo mudar. */
const CHANGELOG_SEEN_KEY = 'char_wizard_changelog_seen';
const CHANGELOG = [
  { id:'2026-08-07-b', titulo:'Equipar Armadura/Escudo e Duplicidade mais esperta', bullets:[
    '🛡️ Escolha qual armadura/escudo "equipar" no Resumo — CA e Ficha Oficial em PDF acompanham a escolha automaticamente',
    '⚠️ O aviso de Duplicidade agora tem um "Editar" em cada fonte, te levando direto pra escolha que causou aquela duplicata',
    'Corrigida uma trava: escolhas de perícia única (Sentidos Aguçados do Elfo, Hábil do Humano) não ficam mais sem opção nenhuma se a classe/antecedente já cobriu tudo'
  ]},
  { id:'2026-08-07-a', titulo:'Ficha Oficial em PDF', bullets:[
    '📥 Baixe a ficha oficial do PHB 2024 já preenchida com seu personagem — continua editável, pra ajustar ou imprimir',
    'CA agora é calculada de verdade em TODAS as classes (inclusive Paladino, Clérigo, Guerreiro, Druida e Guardião, que antes ficavam sem cálculo automático)'
  ]},
  { id:'2026-08-06-c', titulo:'Resumo e Loja mais completos', bullets:[
    '⚠️ Aviso quando algo foi adquirido em dois lugares diferentes (perícia, ferramenta, magia...)',
    'Loja mostra o Mod. de Ataque de cada arma antes de comprar'
  ]}
];

let changelogOpen = false;
function closeChangelog(){
  changelogOpen = false;
  try{ localStorage.setItem(CHANGELOG_SEEN_KEY, CHANGELOG[0].id); }catch(e){}
  render();
}
function renderChangelogPopup(){
  if(!changelogOpen) return '';
  return `<div class="changelog-overlay" onclick="closeChangelog()">
    <div class="changelog-popup" onclick="event.stopPropagation()">
      <div class="mochila-popup-header">
        <h3>📣 Novidades</h3>
        <button class="btn small" onclick="closeChangelog()">✕</button>
      </div>
      ${CHANGELOG.slice(0,3).map(entry=>`<div class="changelog-entry">
        <h4>${entry.titulo}</h4>
        <ul>${entry.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>
      </div>`).join('')}
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

