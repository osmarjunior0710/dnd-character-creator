/* 02-render-helpers.js — Helpers de renderização reaproveitados em várias telas: spellChoiceList, traitBox, choiceGrid, groupedChoiceList, cards de detalhe de magia/talento.
   Extraído de index.html (linhas 1909-2056 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
function toggleSpellInfo(name){
  expandedSpellInfo = (expandedSpellInfo===name) ? null : name;
  render();
}

function renderSpellDetailCard(d){
  return `<div class="spell-detail">
    <div class="stats">
      <span><b>Tempo:</b> ${d.tempo}</span>
      <span><b>Alcance:</b> ${d.alcance}</span>
      <span><b>Componentes:</b> ${d.componentes}</span>
      <span><b>Duração:</b> ${d.duracao}</span>
    </div>
    <div>${d.efeito}</div>
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

/* Lista de escolha de truques/magias, com botão "ⓘ" que expande um card de detalhe
   (tempo, alcance, componentes, duração, efeito, escalonamento) sem afetar a seleção.
   `items` já vem filtrado pelo chamador (tira o que outra fonte já concede/escolheu —
   ver chosenCantripsElsewhere()/speciesGrantedCantrips() etc.), mas esse filtro é
   sobre o ESTADO ATUAL, que pode mudar DEPOIS de uma escolha já feita (ex: escolher
   um truque no Passo 1 e só depois, no Passo 5, escolher uma espécie que passa a
   conceder esse mesmo truque de graça). Achado real de usuário: se o nome
   escolhido não está mais em `items`, a pill sumia da tela inteira, sem aviso, e a
   contagem "X/N escolhidas" ficava presa (ocupando uma vaga invisível, sem dar pra
   trocar por outra coisa). Agora QUALQUER nome de `selectedList` sempre aparece,
   mesmo se caiu fora de `items` — marcado como "extra" (pill-orphan) pra deixar
   claro que precisa de atenção, mas continua clicável pra desmarcar e liberar a
   vaga. */
function spellChoiceList(items, selectedList, maxTotal, toggleFn){
  const orphans = selectedList.filter(name=>!items.includes(name));
  const allNames = [...items, ...orphans];
  return `<div class="check-list" style="margin-bottom:6px;">${allNames.map(name=>{
    const sel = selectedList.includes(name);
    const disabled = !sel && selectedList.length>=maxTotal;
    const isOrphan = orphans.includes(name);
    const detail = SPELL_DETAILS[name];
    const isExpanded = expandedSpellInfo===name;
    return `<div class="spell-pill-wrap ${isExpanded?'expanded':''}">
      <span class="check-pill ${sel?'selected':''} ${disabled?'disabled':''} ${isOrphan?'pill-orphan':''}" ${disabled?'':`data-pick="${name}" data-fn="${toggleFn}"`} ${isOrphan?'title="Já vem de outra fonte agora (ex: espécie) — considere trocar por outro"':''}>${name}${spellCostMarker(name)}${isOrphan?' ⚠️':''}</span>
      ${detail?`<button class="info-btn ${isExpanded?'active':''}" data-pick="${name}" data-fn="toggleSpellInfo" title="Ver detalhes">ⓘ</button>`:''}
      ${isExpanded && detail ? renderSpellDetailCard(detail) : ''}
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
    const isExpanded = expandedTraitInfo===it.nome;
    const spellDetail = SPELL_DETAILS[it.nome];
    return `<div class="spell-pill-wrap ${isExpanded?'expanded':''}">
      <span class="check-pill selected">${it.nome}${spellCostMarker(it.nome)}</span>
      ${spellDetail?`<button class="info-btn ${isExpanded?'active':''}" data-pick="${it.nome}" data-fn="toggleTraitInfo" title="Ver detalhes">ⓘ</button>`:''}
      ${isExpanded && spellDetail ? renderSpellDetailCard(spellDetail) : ''}
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
   talentos (categoria, pré-requisito, benefícios, página). */
function featPickList(names, selected, pickFn){
  return `<div class="check-list" style="margin-bottom:6px;">${names.map(name=>{
    const sel = selected===name;
    const isExpanded = expandedTraitInfo===name;
    const detail = FEAT_DETAILS[name];
    return `<div class="spell-pill-wrap ${isExpanded?'expanded':''}">
      <span class="check-pill ${sel?'selected':''}" data-pick="${name}" data-fn="${pickFn}">${name}</span>
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
   (ex: Atributos / Perícias / Ferramentas). Grupos vazios não aparecem.
   Mesma correção de spellChoiceList(): se uma perícia já escolhida caiu fora de
   TODOS os grupos (porque outra fonte passou a concedê-la depois, filtrada via
   skillsGrantedElsewhere() no chamador), não pode simplesmente sumir da tela —
   isso escondia a escolha E prendia a vaga (contagem "X/N" sem dar pra trocar).
   Aparece num grupo extra no fim, marcada, ainda clicável pra desmarcar. */
function groupedChoiceList(groups, selectedList, maxTotal, toggleFn){
  const groupedNames = new Set();
  groups.forEach(g=>g.items.forEach(item=>groupedNames.add(item)));
  const orphans = selectedList.filter(item=>!groupedNames.has(item));
  const allGroups = orphans.length ? [...groups, {label:'⚠️ Verifique — já vem de outra fonte', items:orphans, orphan:true}] : groups;
  return allGroups.filter(g=>g.items.length>0).map(g=>`
    <div class="check-list" style="margin-bottom:10px; align-items:center;">
      <span class="group-label" style="margin:0 2px 0 0;">${g.label}:</span>
      ${g.items.map(item=>{
        const sel = selectedList.includes(item);
        const disabled = !sel && selectedList.length>=maxTotal;
        const isOrphan = !!g.orphan;
        return `<div class="check-pill ${sel?'selected':''} ${disabled?'disabled':''} ${isOrphan?'pill-orphan':''}" ${disabled?'':`data-pick="${item}" data-fn="${toggleFn}"`} ${isOrphan?'title="Já vem de outra fonte agora — considere trocar por outra"':''}>${item}</div>`;
      }).join('')}
    </div>`).join('');
}

