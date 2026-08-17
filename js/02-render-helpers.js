/* 02-render-helpers.js — Helpers de renderização reaproveitados em várias telas: spellChoiceList, traitBox, choiceGrid, groupedChoiceList, cards de detalhe de magia/talento.
   Extraído de index.html (linhas 1909-2056 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
/* Popup de detalhe de magia/truque (ⓘ) — substitui o antigo card que
   expandia inline junto da pill (era spellChoiceList/grantedItemList com
   expandedSpellInfo, removido). Mesmo padrão visual/interação da Mochila/
   Popup de Stat (overlay cobrindo a tela, clique fora fecha, "✕" fecha) —
   só que com uma escolha a mais: uma pill "Desc. curta"/"Desc. longa"
   dentro do popup pra trocar entre o resumo (SPELL_DETAILS[x].efeito, já
   existia) e o texto oficial completo do livro (SPELL_DETAILS[x].
   textoOficial, adicionado na revisão contra a planilha de referência —
   até agora sem nenhum lugar na UI que o usasse). Sempre abre em "curta".
   spellInfoPopup guarda só o NOME da magia (estado de UI puro, não entra
   em data/persist() — mesmo padrão de mochilaOpen/statInfoOpen). */
let spellInfoPopup = null;
let spellInfoTab = 'curta';
function openSpellInfoPopup(name){
  spellInfoPopup = name;
  spellInfoTab = 'curta';
  render();
}
function closeSpellInfoPopup(){
  spellInfoPopup = null;
  render();
}
function setSpellInfoTab(tab){
  spellInfoTab = tab;
  render();
}
function renderSpellInfoPopup(){
  if(!spellInfoPopup) return '';
  const d = SPELL_DETAILS[spellInfoPopup];
  if(!d) return '';
  const hasLonga = !!d.textoOficial;
  return `<div class="mochila-overlay" onclick="closeSpellInfoPopup()">
    <div class="mochila-popup spell-info-popup" onclick="event.stopPropagation()">
      <div class="mochila-popup-header">
        <h3>${spellInfoPopup}</h3>
        <button class="btn small" onclick="closeSpellInfoPopup()">✕</button>
      </div>
      <div class="check-list" style="margin-bottom:10px;">
        <span class="check-pill ${spellInfoTab==='curta'?'selected':''}" onclick="setSpellInfoTab('curta')">Desc. curta</span>
        <span class="check-pill ${spellInfoTab==='longa'?'selected':''} ${hasLonga?'':'disabled'}" ${hasLonga?`onclick="setSpellInfoTab('longa')"`:'title="Texto oficial completo não cadastrado pra esta magia"'}>Desc. longa</span>
      </div>
      ${renderSpellDetailCard(d, spellInfoTab==='longa' ? d.textoOficial : null)}
    </div>
  </div>`;
}

/* efeitoOverride (opcional) troca só o texto de efeito exibido — usada
   pelo popup acima pra mostrar o texto oficial completo em vez do
   resumo, sem duplicar o resto do card (stats + escalonamento). */
function renderSpellDetailCard(d, efeitoOverride){
  return `<div class="spell-detail">
    <div class="stats">
      <span><b>Tempo:</b> ${d.tempo}</span>
      <span><b>Alcance:</b> ${d.alcance}</span>
      <span><b>Componentes:</b> ${d.componentes}</span>
      <span><b>Duração:</b> ${d.duracao}</span>
    </div>
    <div>${efeitoOverride || d.efeito}</div>
    ${d.escalonamento && d.escalonamento!=='—' ? `<div class="escala">${d.escalonamento}</div>` : ''}
  </div>`;
}

function renderFeatDetailCard(d){
  return `<div class="spell-detail">
    <div class="stats">
      <span><b>Categoria:</b> ${d.categoria}</span>
      ${d.nivelMinimo?`<span><b>Nível mínimo:</b> ${d.nivelMinimo}</span>`:''}
      ${d.repetivel?`<span><b>Repetível</b></span>`:''}
      ${d.pagina?`<span><b>Página:</b> ${d.pagina}</span>`:''}
      ${d.fonte?`<span><b>Fonte:</b> ${d.fonte}</span>`:''}
    </div>
    ${d.outroPreRequisito?`<div><b>Pré-requisito:</b> ${d.outroPreRequisito}</div>`:''}
    <div>${d.beneficios}</div>
  </div>`;
}

/* 🪙 depois do nome da magia/truque na pill, quando o componente Material
   dela tem custo em PO (ex: "M (uma pérola no valor de 100 ou mais PO)") —
   pedido do usuário pra bater o olho e já saber que vai precisar comprar/
   ter esse componente, sem abrir o card de detalhe (ⓘ) pra ler
   "componentes" toda vez. Detecção por "PO" no texto de componentes (só
   aparece ali quando é custo de material; "V"/"S"/"M" sozinhos nunca têm
   "PO" no meio) — mais simples e confiável que tentar achar todo padrão de
   preço por extenso. Usada nas 3 telas que mostram pill de magia: escolha
   (spellChoiceList), concedida de graça (grantedItemList) e Resumo
   (renderSpellEntryList, 07-compute-and-summary.js). */
function spellCostMarker(name){
  const d = SPELL_DETAILS[name];
  return (d && /\bPO\b/.test(d.componentes)) ? ' <span title="Componente Material com custo em PO">🪙</span>' : '';
}

/* ⚔️/❤️‍🩹 — mesma ideia do 🪙 acima (heurística de texto, sem campo
   estruturado "dano"/"cura" nos dados), varrendo efeito+textoOficial.
   Dano: procura um dado explícito (NdM) seguido de "dano" perto (regra
   simples que evita pegar menções soltas de "dano" sem valor associado,
   tipo "resistência a dano" ou "anula dano de X"). Cura: dois padrões —
   "recupera"/"restaura" perto de "Pontos de Vida"/"PV" (com checagem de
   negação tipo "não pode recuperar", usado em Toque Necrótico pra negar
   cura do ALVO), ou "cura" isolado, mas excluindo quando é referência a
   nome próprio de outra magia/item ("Cura Completa", "Poção de Cura").
   Não tenta distinguir dano/cura direto vs. efeito colateral/condicional
   — dado o volume (146 magias com dano, 24 com cura na revisão manual
   feita ao implementar isso), aceito como heurística "boa o suficiente",
   não 100% precisa (ex: um buff que só aumenta o dano de ataques
   futuros, como Aumentar/Reduzir, também é pego). */
function spellDealsDamage(text){
  return /\d+d\d+(\s*\+\s*\d+)?\s*(?:pontos? de )?dano\b/i.test(text);
}
function spellHeals(text){
  const negBefore = /(não|sem)\s+\w*\s*$/i;
  const re1 = /\b(recupera|restaura)(m|r)?\b/gi;
  let m;
  while((m = re1.exec(text))){
    const before = text.slice(Math.max(0,m.index-20), m.index);
    const after = text.slice(m.index, m.index+70);
    if(negBefore.test(before)) continue;
    const pvMatch = after.match(/pontos? de vida|pv\b/i);
    if(pvMatch && !after.slice(0, pvMatch.index).includes('.')) return true;
  }
  const re2 = /\bcura(m|r)?\b/gi;
  while((m = re2.exec(text))){
    const before = text.slice(Math.max(0,m.index-20), m.index);
    const after = text.slice(m.index+m[0].length, m.index+m[0].length+20);
    if(negBefore.test(before)) continue;
    if(/poção de\s*$/i.test(before)) continue;
    if(/^\s*completa/i.test(after)) continue;
    return true;
  }
  return false;
}
function spellCombatIconMarker(name){
  const d = SPELL_DETAILS[name];
  if(!d) return '';
  const text = (d.efeito||'') + ' ' + (d.textoOficial||'');
  let out = '';
  if(spellDealsDamage(text)) out += ' <span title="Causa dano">⚔️</span>';
  if(spellHeals(text)) out += ' <span title="Cura Pontos de Vida">❤️‍🩹</span>';
  return out;
}

/* Lista de escolha de truques/magias, com botão "ⓘ" que expande um card de detalhe
   (tempo, alcance, componentes, duração, efeito, escalonamento) sem afetar a seleção.
   `items` é sempre a lista MESTRA completa (const estática da classe, ou
   ALL_CANTRIPS/ALL_1ST_RITUAL) — nunca filtrada pelo chamador. `elsewhere`
   (opcional) é a lista de nomes que outra fonte já concede/escolheu (ver
   chosenCantripsElsewhere()/speciesGrantedCantrips() etc.) — usada só pra
   marcar ⚠️/pill-orphan quando o nome estiver SELECIONADO aqui E também em
   `elsewhere` (duplicata de verdade). Item que está em `elsewhere` mas NÃO
   selecionado continua aparecendo normal, clicável — nunca escondido (antes
   uma versão prévia escondia da lista qualquer coisa já concedida/escolhida
   em outro lugar; motivo de sair: escolher errado ficava invisível, sem
   aviso, e trocar de espécie/antecedente depois podia fazer uma escolha já
   feita "sumir" da tela com a vaga presa, sem dar pra trocar — melhor
   sempre mostrar tudo e avisar). */
function spellChoiceList(items, selectedList, maxTotal, toggleFn, elsewhere){
  const elsewhereSet = new Set(elsewhere || []);
  return `<div class="check-list" style="margin-bottom:6px;">${items.map(name=>{
    const sel = selectedList.includes(name);
    const disabled = !sel && selectedList.length>=maxTotal;
    const isDup = sel && elsewhereSet.has(name);
    const detail = SPELL_DETAILS[name];
    return `<div class="spell-pill-wrap">
      <span class="check-pill ${sel?'selected':''} ${disabled?'disabled':''} ${isDup?'pill-orphan':''}" ${disabled?'':`data-pick="${name}" data-fn="${toggleFn}"`} ${isDup?'title="Já vem de outra fonte — considere trocar por outra"':''}>${name}${spellCombatIconMarker(name)}${spellCostMarker(name)}${isDup?' ⚠️':''}</span>
      ${detail?`<button class="info-btn ${spellInfoPopup===name?'active':''}" data-pick="${name}" data-fn="openSpellInfoPopup" title="Ver detalhes">ⓘ</button>`:''}
    </div>`;
  }).join('')}</div>`;
}

let expandedTraitInfo = null;
function toggleTraitInfo(name){
  expandedTraitInfo = (expandedTraitInfo===name) ? null : name;
  render();
}

/* Pills para itens ESPECÍFICOS concedidos de graça que existem numa lista
   nossa (magia/truque hoje — perícia/talento quando tivermos os bancos
   correspondentes). NÃO usar para o traço inteiro — só para o nome exato
   do item (ex: "Taumaturgia", "Rajada de Veneno"). O botão "ⓘ" só aparece
   se houver detalhe pra mostrar (hoje: banco de magias). */
function grantedItemList(items){
  if(!items || items.length===0) return '';
  return `<div class="check-list" style="margin:8px 0 2px;">${items.map(it=>{
    const spellDetail = SPELL_DETAILS[it.nome];
    return `<div class="spell-pill-wrap">
      <span class="check-pill selected">${it.nome}${spellCombatIconMarker(it.nome)}${spellCostMarker(it.nome)}</span>
      ${spellDetail?`<button class="info-btn ${spellInfoPopup===it.nome?'active':''}" data-pick="${it.nome}" data-fn="openSpellInfoPopup" title="Ver detalhes">ⓘ</button>`:''}
    </div>`;
  }).join('')}</div>`;
}

/* Caixa de traço concedido (texto completo + pills dos itens específicos que
   ele concede, se houver). Usada tanto pros traços fixos quanto, dentro da
   escolha de subespécie, pra cada bloco de nível. */
function traitBox(nome, resumo, concede){
  return `<div class="option-block">
    <h3 style="color:var(--gold);margin-top:0;">${nome}</h3>
    ${resumo?`<p>${resumo}</p>`:''}
    ${grantedItemList(concede)}
  </div>`;
}

/* Lista de escolha ÚNICA de talento, filtrada por categoria (ex: só "Origem"
   pro Versátil do Humano), com botão "ⓘ" que mostra a ficha do banco de
   talentos (categoria, pré-requisito, benefícios, página). `elsewhere`
   (opcional, mesmo espírito de spellChoiceList/groupedChoiceList): nomes já
   concedidos por outra fonte — nunca tira da lista, só marca ⚠️/pill-orphan
   se for o mesmo nome ESCOLHIDO aqui. */
function featPickList(names, selected, pickFn, elsewhere){
  const elsewhereSet = new Set(elsewhere || []);
  return `<div class="check-list" style="margin-bottom:6px;">${names.map(name=>{
    const sel = selected===name;
    const isDup = sel && elsewhereSet.has(name);
    const isExpanded = expandedTraitInfo===name;
    const detail = FEAT_DETAILS[name];
    return `<div class="spell-pill-wrap ${isExpanded?'expanded':''}">
      <span class="check-pill ${sel?'selected':''} ${isDup?'pill-orphan':''}" data-pick="${name}" data-fn="${pickFn}" ${isDup?'title="Já vem de outra fonte agora — considere trocar por outro"':''}>${name}${isDup?' ⚠️':''}</span>
      ${detail?`<button class="info-btn ${isExpanded?'active':''}" data-pick="${name}" data-fn="toggleTraitInfo" title="Ver detalhes">ⓘ</button>`:''}
      ${isExpanded && detail ? renderFeatDetailCard(detail) : ''}
    </div>`;
  }).join('')}</div>`;
}

function choiceGrid(list, enabledList, selected, onClickName){
  return `<div class="choice-grid">${list.map(n=>{
    const enabled = enabledList.includes(n);
    const sel = selected===n;
    return `<div class="choice ${enabled?'':'disabled'} ${sel?'selected':''}" ${enabled?`data-pick="${n}" data-fn="${onClickName}"`:''}>
      ${n}${enabled?'':'<span class="note">em breve</span>'}
    </div>`;
  }).join('')}</div>`;
}

/* Renderiza uma lista de escolha (checkbox-pill) separada em mini-grupos com cabeçalho,
   pra quando o talento/recurso permite escolher entre categorias diferentes
   (ex: Atributos / Perícias / Ferramentas). Grupos vazios não aparecem. `groups`
   é sempre a lista completa de opções (nunca filtrada pelo chamador pra tirar o
   que outra fonte já concede/escolheu — ver skillsGrantedElsewhere() etc.);
   `elsewhere` (opcional) é essa lista de nomes já concedidos/escolhidos alhures,
   só usada pra marcar ⚠️/pill-orphan quando o item estiver SELECIONADO aqui E
   também em `elsewhere` — mesmo espírito de spellChoiceList(), nunca esconde
   opção, só avisa quando vira duplicata de verdade. */
function groupedChoiceList(groups, selectedList, maxTotal, toggleFn, elsewhere){
  const elsewhereSet = new Set(elsewhere || []);
  return groups.filter(g=>g.items.length>0).map(g=>`
    <div class="check-list" style="margin-bottom:10px; align-items:center;">
      <span class="group-label" style="margin:0 2px 0 0;">${g.label}:</span>
      ${g.items.map(item=>{
        const sel = selectedList.includes(item);
        const disabled = !sel && selectedList.length>=maxTotal;
        const isDup = sel && elsewhereSet.has(item);
        return `<div class="check-pill ${sel?'selected':''} ${disabled?'disabled':''} ${isDup?'pill-orphan':''}" ${disabled?'':`data-pick="${item}" data-fn="${toggleFn}"`} ${isDup?'title="Já vem de outra fonte agora — considere trocar por outra"':''}>${item}${isDup?' ⚠️':''}</div>`;
      }).join('')}
    </div>`).join('');
}

