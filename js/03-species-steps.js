/* 03-species-steps.js — Passo de Espécie: grade de escolha + as 10 telas de detalhe (Tiferino, Pequenino, Aasimar, Anão, Orc, Humano, Draconato, Elfo, Gnomo, Golias).
   Extraído de index.html (linhas 2057-2387 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
function renderSpeciesStep(){
  return `<h2>Passo 3 — Escolha sua Espécie</h2>
  <div class="intro">Sua espécie define traços físicos e sobrenaturais natos — visão no escuro, resistências, truques grátis.</div>
  <div id="grp-4-especie">${choiceGrid(SPECIES, ENABLED_SPECIES, data.especie, 'pickSpecies')}</div>
  ${nav(canAdvance())}`;
}

function renderTieflingDetail(){
  const t = data.tiefling;
  return `<h2>Tiferino</h2>
  <p class="species-flavor">${TIEFLING.flavor}</p>
  <div class="species-facts">
    <div class="fact"><b>Tipo:</b> ${TIEFLING.tipo}</div>
    <div class="fact"><b>Deslocamento:</b> ${TIEFLING.deslocamento}</div>
    <div class="fact"><b>Visão no Escuro:</b> ${TIEFLING.visaoNoEscuro}</div>
    <div class="fact"><b>Tamanho:</b></div>
  </div>
  <div id="grp-5-tamanho" class="check-list" style="margin-bottom:20px;">
    ${TIEFLING.tamanho.opcoes.map(s=>`
      <div class="check-pill ${t.tamanho===s?'selected':''}" data-pick="${s}" data-fn="pickTamanho">${s} <span style="opacity:0.65;font-size:0.85em;">(${TIEFLING.tamanho.alturas[s]})</span></div>
    `).join('')}
  </div>
  <h3>Traços Natos</h3>
  ${TIEFLING.tracosFixos.map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  <h3 id="grp-5-legado">${TIEFLING.subespecie.nome}</h3>
  ${TIEFLING.subespecie.opcoes.map(opt=>`
    <div class="option-block ${t.legado===opt.nome?'selected':''}">
      <h3 style="color:var(--gold);margin-top:0;">${opt.nome}</h3>
      <div class="group-label">Nível 1</div>
      <p>${opt.nivel1.resumo}</p>
      ${grantedItemList(opt.nivel1.concede)}
      <div class="group-label">Nível 3</div>
      ${grantedItemList(opt.nivel3.concede)}
      <div class="group-label">Nível 5</div>
      ${grantedItemList(opt.nivel5.concede)}
      <button class="pick-btn" data-pick="${opt.nome}" data-fn="pickLegado" style="margin-top:10px;">${t.legado===opt.nome?'Selecionado':'Escolher'}</button>
    </div>
  `).join('')}
  <h3 id="grp-5-atributo">Atributo de Conjuração do Legado</h3>
  <div class="intro" style="margin-bottom:8px;">Usado para a CD/ataque das magias do legado e da Presença Sobrenatural (Taumaturgia).</div>
  <div class="check-list">
    ${['Inteligência','Sabedoria','Carisma'].map(a=>`<div class="check-pill ${t.atributoLegado===a?'selected':''}" data-pick="${a}" data-fn="pickAtributoLegado">${a}</div>`).join('')}
  </div>
  ${nav(canAdvance())}`;
}

function renderPequeninoDetail(){
  return `<h2>Pequenino</h2>
  <p class="species-flavor">${PEQUENINO.flavor}</p>
  <div class="species-facts">
    <div class="fact"><b>Tipo:</b> ${PEQUENINO.tipo}</div>
    <div class="fact"><b>Deslocamento:</b> ${PEQUENINO.deslocamento}</div>
    <div class="fact"><b>Tamanho:</b></div>
  </div>
  ${tamanhoPickList(PEQUENINO.tamanho, null, null)}
  <h3>Traços Natos</h3>
  ${PEQUENINO.tracosFixos.map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  ${nav(canAdvance())}`;
}

function renderAnaoDetail(){
  return `<h2>Anão</h2>
  <p class="species-flavor">${ANAO.flavor}</p>
  <div class="species-facts">
    <div class="fact"><b>Tipo:</b> ${ANAO.tipo}</div>
    <div class="fact"><b>Deslocamento:</b> ${ANAO.deslocamento}</div>
    <div class="fact"><b>Visão no Escuro:</b> ${ANAO.visaoNoEscuro}</div>
    <div class="fact"><b>Tamanho:</b></div>
  </div>
  ${tamanhoPickList(ANAO.tamanho, null, null)}
  <h3>Traços Natos</h3>
  ${ANAO.tracosFixos.map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  ${nav(canAdvance())}`;
}

function renderOrcDetail(){
  return `<h2>Orc</h2>
  <p class="species-flavor">${ORC.flavor}</p>
  <div class="species-facts">
    <div class="fact"><b>Tipo:</b> ${ORC.tipo}</div>
    <div class="fact"><b>Deslocamento:</b> ${ORC.deslocamento}</div>
    <div class="fact"><b>Visão no Escuro:</b> ${ORC.visaoNoEscuro}</div>
    <div class="fact"><b>Tamanho:</b></div>
  </div>
  ${tamanhoPickList(ORC.tamanho, null, null)}
  <h3>Traços Natos</h3>
  ${ORC.tracosFixos.map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  ${nav(canAdvance())}`;
}

function renderHumanoDetail(){
  const h = data.humano;
  const talentosOrigem = Object.keys(FEAT_DETAILS).filter(n=>FEAT_DETAILS[n].categoria==='Origem' && n!==backgroundFeatBaseName());
  const talentosSelvagens = Object.keys(FEAT_DETAILS).filter(n=>FEAT_DETAILS[n].categoria==='Talento Selvagem' && n!==backgroundFeatBaseName());
  return `<h2>Humano</h2>
  <p class="species-flavor">${HUMANO.flavor}</p>
  <div class="species-facts">
    <div class="fact"><b>Tipo:</b> ${HUMANO.tipo}</div>
    <div class="fact"><b>Deslocamento:</b> ${HUMANO.deslocamento}</div>
    <div class="fact"><b>Tamanho:</b></div>
  </div>
  <div id="grp-5-tamanho" class="check-list" style="margin-bottom:20px;">
    ${HUMANO.tamanho.opcoes.map(s=>`
      <div class="check-pill ${h.tamanho===s?'selected':''}" data-pick="${s}" data-fn="pickTamanhoHumano">${s} <span style="opacity:0.65;font-size:0.85em;">(${HUMANO.tamanho.alturas[s]})</span></div>
    `).join('')}
  </div>
  <h3>Traços Natos</h3>
  ${HUMANO.tracosFixos.map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  <h3 id="grp-5-pericia">Hábil — escolha 1 perícia</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias marcadas com ⚠️ já vêm da classe ou do antecedente — ainda dá pra escolher, mas aí vira duplicidade (veja o aviso no Resumo).</div>
  ${groupedSinglePick(skillGroupsByAbility(ALL_SKILLS), h.pericia, 'pickHumanoPericia', skillsGrantedElsewhere('humano'))}
  <h3 id="grp-5-talento">Versátil — escolha 1 talento de Origem</h3>
  <div class="intro" style="margin-bottom:8px;">O talento ${backgroundFeatBaseName()} já vem do antecedente e não aparece aqui.</div>
  ${featPickList(talentosOrigem, h.talento, 'pickHumanoTalento')}
  <div class="intro" style="margin:10px 0 8px;">Talentos Selvagens (Unearthed Arcana 2025 — não é conteúdo oficial do PHB, ligado ao Psiônico): o Versátil também permite escolher um destes em vez de um talento de Origem.</div>
  ${featPickList(talentosSelvagens, h.talento, 'pickHumanoTalento')}
  ${nav(canAdvance())}`;
}

function renderDraconatoDetail(){
  const d = data.draconato;
  const escolhida = DRACONATO.subespecie.opcoes.find(o=>o.nome===d.heranca);
  const tipoDano = escolhida ? escolhida.tipoDano : null;
  const tracos = DRACONATO.tracosFixos.map(tr=>{
    let resumo = tr.resumo;
    if(tipoDano){
      resumo = resumo
        .replace('do tipo da sua Herança Dracônica', `do tipo ${tipoDano} (sua Herança Dracônica)`)
        .replace('determinado pela sua Herança Dracônica', `${tipoDano}, determinado pela sua Herança Dracônica`);
    }
    return {nome: tr.nome, resumo, concede: tr.concede};
  });
  return `<h2>Draconato</h2>
  <p class="species-flavor">${DRACONATO.flavor}</p>
  <div class="species-facts">
    <div class="fact"><b>Tipo:</b> ${DRACONATO.tipo}</div>
    <div class="fact"><b>Deslocamento:</b> ${DRACONATO.deslocamento}</div>
    <div class="fact"><b>Visão no Escuro:</b> ${DRACONATO.visaoNoEscuro}</div>
    <div class="fact"><b>Tamanho:</b></div>
  </div>
  ${tamanhoPickList(DRACONATO.tamanho, null, null)}
  <h3 id="grp-5-heranca">${DRACONATO.subespecie.nome}</h3>
  <div class="intro" style="margin-bottom:8px;">Define o tipo de dano do seu Ataque de Sopro e da sua Resistência a Dano — sem conceder magia nenhuma (diferente do Legado do Tiferino).</div>
  <div class="choice-grid" style="margin-bottom:20px;">
    ${DRACONATO.subespecie.opcoes.map(o=>`<div class="choice ${d.heranca===o.nome?'selected':''}" data-pick="${o.nome}" data-fn="pickHerancaDraconica">${o.nome}<span class="note">${o.tipoDano}</span></div>`).join('')}
  </div>
  <h3>Traços Natos</h3>
  ${tracos.map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  ${nav(canAdvance())}`;
}

function renderElfoDetail(){
  const e = data.elfo;
  return `<h2>Elfo</h2>
  <p class="species-flavor">${ELFO.flavor}</p>
  <div class="species-facts">
    <div class="fact"><b>Tipo:</b> ${ELFO.tipo}</div>
    <div class="fact"><b>Deslocamento:</b> ${ELFO.deslocamento}</div>
    <div class="fact"><b>Visão no Escuro:</b> ${ELFO.visaoNoEscuro}</div>
    <div class="fact"><b>Tamanho:</b></div>
  </div>
  ${tamanhoPickList(ELFO.tamanho, null, null)}
  <h3>Traços Natos</h3>
  ${ELFO.tracosFixos.map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  <h3 id="grp-5-pericia">${ELFO.sentidosAgucados.nome} — escolha 1 perícia</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias marcadas com ⚠️ já vêm da classe ou do antecedente — ainda dá pra escolher, mas aí vira duplicidade (veja o aviso no Resumo).</div>
  ${groupedSinglePick(skillGroupsByAbility(ELFO.sentidosAgucados.opcoes), e.pericia, 'pickElfoPericia', skillsGrantedElsewhere('elfo'))}
  <h3 id="grp-5-linhagem">${ELFO.subespecie.nome}</h3>
  ${ELFO.subespecie.opcoes.map(opt=>`
    <div class="option-block ${e.linhagem===opt.nome?'selected':''}">
      <h3 style="color:var(--gold);margin-top:0;">${opt.nome}</h3>
      <div class="group-label">Nível 1</div>
      <p>${opt.nivel1.resumo}</p>
      ${grantedItemList(opt.nivel1.concede)}
      <div class="group-label">Nível 3</div>
      ${grantedItemList(opt.nivel3.concede)}
      <div class="group-label">Nível 5</div>
      ${grantedItemList(opt.nivel5.concede)}
      <button class="pick-btn" data-pick="${opt.nome}" data-fn="pickLinhagemElfica" style="margin-top:10px;">${e.linhagem===opt.nome?'Selecionado':'Escolher'}</button>
    </div>
  `).join('')}
  ${nav(canAdvance())}`;
}

function renderGnomoDetail(){
  const g = data.gnomo;
  return `<h2>Gnomo</h2>
  <p class="species-flavor">${GNOMO.flavor}</p>
  <div class="species-facts">
    <div class="fact"><b>Tipo:</b> ${GNOMO.tipo}</div>
    <div class="fact"><b>Deslocamento:</b> ${GNOMO.deslocamento}</div>
    <div class="fact"><b>Visão no Escuro:</b> ${GNOMO.visaoNoEscuro}</div>
    <div class="fact"><b>Tamanho:</b></div>
  </div>
  ${tamanhoPickList(GNOMO.tamanho, null, null)}
  <h3>Traços Natos</h3>
  ${GNOMO.tracosFixos.map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  <h3 id="grp-5-linhagem">${GNOMO.subespecie.nome}</h3>
  ${GNOMO.subespecie.opcoes.map(opt=>`
    <div class="option-block ${g.linhagem===opt.nome?'selected':''}">
      <h3 style="color:var(--gold);margin-top:0;">${opt.nome}</h3>
      <p>${opt.nivel1.resumo}</p>
      ${grantedItemList(opt.nivel1.concede)}
      <button class="pick-btn" data-pick="${opt.nome}" data-fn="pickLinhagemGnomica" style="margin-top:10px;">${g.linhagem===opt.nome?'Selecionado':'Escolher'}</button>
    </div>
  `).join('')}
  <h3 id="grp-5-atributo">Atributo de Conjuração da Linhagem</h3>
  <div class="intro" style="margin-bottom:8px;">Usado para a CD/ataque dos truques e magias concedidos pela sua Linhagem Gnômica.</div>
  <div class="check-list">
    ${['Inteligência','Sabedoria','Carisma'].map(a=>`<div class="check-pill ${g.atributoLinhagem===a?'selected':''}" data-pick="${a}" data-fn="pickAtributoLinhagemGnomica">${a}</div>`).join('')}
  </div>
  ${nav(canAdvance())}`;
}

function renderGoliasDetail(){
  const gl = data.golias;
  return `<h2>Golias</h2>
  <p class="species-flavor">${GOLIAS.flavor}</p>
  <div class="species-facts">
    <div class="fact"><b>Tipo:</b> ${GOLIAS.tipo}</div>
    <div class="fact"><b>Deslocamento:</b> ${GOLIAS.deslocamento}</div>
    <div class="fact"><b>Tamanho:</b></div>
  </div>
  ${tamanhoPickList(GOLIAS.tamanho, null, null)}
  <h3>Traços Natos</h3>
  ${GOLIAS.tracosFixos.map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  <h3 id="grp-5-ancestralidade">${GOLIAS.subespecie.nome} — escolha 1</h3>
  ${GOLIAS.subespecie.opcoes.map(opt=>`
    <div class="option-block ${gl.ancestralidade===opt.nome?'selected':''}">
      <h3 style="color:var(--gold);margin-top:0;">${opt.nome}</h3>
      <p>${opt.nivel1.resumo}</p>
      <button class="pick-btn" data-pick="${opt.nome}" data-fn="pickAncestralidadeGigante" style="margin-top:10px;">${gl.ancestralidade===opt.nome?'Selecionado':'Escolher'}</button>
    </div>
  `).join('')}
  ${nav(canAdvance())}`;
}

function renderAasimarDetail(){
  const a = data.aasimar;
  return `<h2>Aasimar</h2>
  <p class="species-flavor">${AASIMAR.flavor}</p>
  <div class="species-facts">
    <div class="fact"><b>Tipo:</b> ${AASIMAR.tipo}</div>
    <div class="fact"><b>Deslocamento:</b> ${AASIMAR.deslocamento}</div>
    <div class="fact"><b>Visão no Escuro:</b> ${AASIMAR.visaoNoEscuro}</div>
    <div class="fact"><b>Tamanho:</b></div>
  </div>
  <div id="grp-5-tamanho" class="check-list" style="margin-bottom:20px;">
    ${AASIMAR.tamanho.opcoes.map(s=>`
      <div class="check-pill ${a.tamanho===s?'selected':''}" data-pick="${s}" data-fn="pickTamanhoAasimar">${s} <span style="opacity:0.65;font-size:0.85em;">(${AASIMAR.tamanho.alturas[s]})</span></div>
    `).join('')}
  </div>
  <h3>Traços Natos</h3>
  ${AASIMAR.tracosFixos.map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  <h3>${AASIMAR.revelacaoCelestial.nome} <span style="font-family:'Spectral',serif;font-weight:400;font-size:0.7em;color:var(--parchment-dim);">(nível ${AASIMAR.revelacaoCelestial.nivelConcedido}+, escolhida em jogo — não faz parte da ficha inicial)</span></h3>
  <div class="intro" style="margin-bottom:12px;">${AASIMAR.revelacaoCelestial.aviso}</div>
  ${AASIMAR.revelacaoCelestial.opcoes.map(opt=>traitBox(opt.nome, opt.resumo, opt.concede)).join('')}
  ${nav(canAdvance())}`;
}

function choiceGridWithInfo(list, enabledList, selected, onClickName, infoMap){
  return `<div class="choice-grid">${list.map(n=>{
    const enabled = enabledList.includes(n);
    const sel = selected===n;
    const info = infoMap && infoMap[n];
    let infoHtml = '';
    if(info){
      const fields = [...(info.fields||[])];
      if(info.talentoNome){
        fields.unshift(["Talento", `${info.talentoNome} <i style="color:var(--parchment-dim);">(${info.talentoDesc})</i>`]);
      }
      if(info.descricao){
        infoHtml += `<span class="note" style="display:block;font-style:italic;text-align:left;margin-top:6px;">${info.descricao}</span>`;
      }
      if(fields.length){
        infoHtml += `<span class="note" style="display:block;text-align:left;line-height:1.4;margin-top:6px;">
          ${fields.map(([label,val])=>`<b>${label}:</b> ${val}`).join('<br>')}
        </span>`;
      }
    } else if(!enabled){
      infoHtml = '<span class="note">em breve</span>';
    }
    return `<div class="choice ${enabled?'':'disabled'} ${sel?'selected':''}" ${enabled?`data-pick="${n}" data-fn="${onClickName}"`:''}>
      ${n}${infoHtml}
    </div>`;
  }).join('')}</div>`;
}

/* Agrupa uma lista de perícias pelos 6 atributos (Força, Destreza, ...),
   na mesma ordem de ABILITIES. Grupos sem nenhuma perícia da lista dada
   simplesmente não aparecem — não precisa filtrar manualmente na chamada. */
function skillGroupsByAbility(skillList){
  return ABILITIES.map(ab => ({
    label: ab,
    items: skillList.filter(s => SKILL_ABILITY[s]===ab)
  }));
}

/* Mesma ideia do skillGroupsByAbility, mas agrupando idiomas em Comuns/
   Raros em vez de por atributo — usado no passo de Idiomas. */
function languageGroupsByCategory(pool){
  return [
    { label: "Comuns", items: pool.filter(l => COMMON_LANGUAGES.includes(l)) },
    { label: "Raros", items: pool.filter(l => RARE_LANGUAGES.includes(l)) }
  ];
}

/* Igual ao groupedChoiceList, mas de escolha ÚNICA (radio, não checkbox) —
   usado quando só se pode marcar 1 item no total, como o Hábil do Humano.

   `elsewhere` (opcional): lista de itens já concedidos por outra fonte
   (ex: skillsGrantedElsewhere('elfo')). Não tira mais nada da lista —
   antes filtrávamos esses itens no chamador, o que podia esvaziar o
   grupo inteiro e travar o wizard numa escolha obrigatória sem nenhuma
   opção sobrando (ex: Elfo com Intuição+Percepção+Sobrevivência já
   escolhidas antes de chegar no Sentidos Aguçados). Agora eles continuam
   aparecendo e continuam clicáveis, só marcados com o mesmo tratamento
   ⚠️/mostarda (.pill-orphan) usado pelas listas de magia — a checagem de
   Duplicidade do Resumo (detectDuplicidades/skillsGrantedBySource) já
   pega qualquer duplicata real que resultar disso. */
function groupedSinglePick(groups, selected, pickFn, elsewhere){
  const elsewhereSet = new Set(elsewhere || []);
  return groups.filter(g=>g.items.length>0).map(g=>`
    <div class="check-list" style="margin-bottom:10px; align-items:center;">
      <span class="group-label" style="margin:0 2px 0 0;">${g.label}:</span>
      ${g.items.map(item=>{
        const isElsewhere = elsewhereSet.has(item);
        return `<div class="check-pill ${selected===item?'selected':''} ${isElsewhere?'pill-orphan':''}" data-pick="${item}" data-fn="${pickFn}" ${isElsewhere?'title="Já vem de outra fonte (classe ou antecedente) — dá pra escolher mesmo assim, mas provavelmente vira duplicidade (veja o aviso no Resumo)"':''}>${item}${isElsewhere?' ⚠️':''}</div>`;
      }).join('')}
    </div>`).join('');
}

/* Mostra as opções de tamanho de uma espécie. Se só existe UMA opção, ela
   aparece já pré-selecionada e travada (mesmo padrão de "traço concedido"
   que usamos em outros lugares) — sem texto avisando que é única. Se
   existirem 2+ opções, vira a lista interativa normal. */
function tamanhoPickList(tamanho, selected, pickFn){
  if(tamanho.opcoes.length===1){
    const unica = tamanho.opcoes[0];
    return `<div class="check-list" style="margin-bottom:20px;">
      <div class="check-pill selected">${unica} <span style="opacity:0.65;font-size:0.85em;">(${tamanho.alturas[unica]})</span></div>
    </div>`;
  }
  return `<div class="check-list" style="margin-bottom:20px;">
    ${tamanho.opcoes.map(s=>`<div class="check-pill ${selected===s?'selected':''}" data-pick="${s}" data-fn="${pickFn}">${s} <span style="opacity:0.65;font-size:0.85em;">(${tamanho.alturas[s]})</span></div>`).join('')}
  </div>`;
}

