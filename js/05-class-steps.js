/* 05-class-steps.js — Passo de Classe: grade de escolha + as 13 telas de detalhe (Bruxo, Bárbaro, Bardo, Mago, Paladino, Psiônico, Clérigo, Guerreiro, Ladino, Druida, Feiticeiro, Monge, Guardião).
   Extraído de index.html (linhas 2681-3308 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
function renderClassStep(){
  return `<h2>Passo 1 — Escolha sua Classe</h2>
  <div class="intro">A classe define seu papel central: como você luta, sobrevive e (se aplicável) conjura magia.</div>
  <div id="grp-0-classe">${choiceGridWithInfo(CLASSES, ENABLED_CLASSES, data.classe, 'pickClass', CLASS_INFO)}</div>
  ${nav(canAdvance())}`;
}

function renderBruxoDetail(){
  const b = data.bruxo;
  return `<h2>Bruxo — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Carisma · Dado de Vida: d8 · Salvaguardas: Sabedoria e Carisma · Armas Simples · Armadura Leve</div>

  <h3 id="grp-1-skills">Perícias (escolha 2)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = BRUXO.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), b.skills, 2, 'toggleBruxoSkill');
  })()}
  <div class="counter ${b.skills.length===2?'ok':''}">${b.skills.length}/2 escolhidas</div>

  <h3 id="grp-1-pact">Vínculo de Pacto</h3>
  ${Object.entries(BRUXO.pactBoons).map(([name,desc])=>`
    <div class="option-block ${b.pactBoon===name?'selected':''}">
      <h3 style="color:var(--gold);margin-top:0;">${name}</h3><p>${desc}</p>
      <button class="pick-btn" data-pick="${name}" data-fn="pickPactBoon">${b.pactBoon===name?'Selecionado':'Escolher'}</button>
    </div>
  `).join('')}

  <h3 id="grp-1-cantrips">Truques da Classe (escolha 2, da lista de Bruxo)</h3>
  ${speciesGrantedCantrips().length ? `<div class="intro" style="margin-bottom:8px;">Truques que você já conhece de graça pela espécie (${speciesGrantedCantrips().join(', ')}) não aparecem aqui.</div>` : ''}
  ${spellChoiceList(BRUXO.cantrips.filter(c=>!speciesGrantedCantrips().includes(c) && !chosenCantripsElsewhere('classe').includes(c)), b.cantrips, 2, 'toggleCantrip')}
  <div class="counter ${b.cantrips.length===2?'ok':''}">${b.cantrips.length}/2 escolhidos</div>

  ${b.pactBoon==='Pacto do Tomo' ? `
  <h3 id="grp-1-tomocantrips">Truques do Pacto do Tomo (escolha 3, de qualquer classe)</h3>
  ${spellChoiceList(ALL_CANTRIPS.filter(c=>!b.cantrips.includes(c) && !speciesGrantedCantrips().includes(c) && !chosenCantripsElsewhere('classe').includes(c)), b.tomoCantrips, 3, 'toggleTomoCantrip')}
  <div class="counter ${b.tomoCantrips.length===3?'ok':''}">${b.tomoCantrips.length}/3 escolhidos</div>
  `:''}

  <h3 id="grp-1-spells1">Magias Preparadas de 1º Círculo (escolha 2, da lista de Bruxo)</h3>
  ${spellChoiceList(BRUXO.spells1.filter(s=>!speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('classe').includes(s)), b.spells1, 2, 'toggleSpell1')}
  <div class="counter ${b.spells1.length===2?'ok':''}">${b.spells1.length}/2 escolhidas</div>

  ${b.pactBoon==='Pacto do Tomo' ? `
  <h3 id="grp-1-tomorituals">Magias Rituais do Pacto do Tomo (escolha 2, 1º círculo, de qualquer classe)</h3>
  ${spellChoiceList(ALL_1ST_RITUAL.filter(r=>!b.spells1.includes(r) && !speciesGrantedSpells().includes(r) && !chosenSpells1Elsewhere('classe').includes(r)), b.tomoRituals, 2, 'toggleTomoRitual')}
  <div class="counter ${b.tomoRituals.length===2?'ok':''}">${b.tomoRituals.length}/2 escolhidas</div>
  `:''}

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${b.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...BRUXO.equipmentA, BRUXO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickBruxoEquip">${b.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${b.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${BRUXO.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickBruxoEquip">${b.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function renderBarbaroDetail(){
  const bb = data.barbaro;
  return `<h2>Bárbaro — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Força · Dado de Vida: d12 · Salvaguardas: Força e Constituição · Armas Simples e Marciais · Armadura Leve, Média e Escudo</div>

  <h3 id="grp-1-skills">Perícias (escolha 2)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = BARBARO.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), bb.skills, 2, 'toggleBarbaroSkill');
  })()}
  <div class="counter ${bb.skills.length===2?'ok':''}">${bb.skills.length}/2 escolhidas</div>

  <h3>Fúria</h3>
  <div class="option-block">${BARBARO.furia}</div>

  <h3>Defesa sem Armadura</h3>
  <div class="option-block">${BARBARO.defesaSemArmadura}</div>

  <h3 id="grp-1-maestria">Maestria em Arma (escolha ${BARBARO.maestriaCount}, armas Corpo a Corpo Simples ou Marciais)</h3>
  <div class="intro" style="margin-bottom:8px;">Você pode trocar essa escolha ao completar um Descanso Longo.</div>
  <div class="check-list" style="margin-bottom:6px;">
    ${Object.entries(WEAPON_MASTERY).filter(([,w])=>w.tipo==='Corpo a Corpo').map(([name,w])=>{
      const sel = bb.maestria.includes(name);
      const disabled = !sel && bb.maestria.length>=BARBARO.maestriaCount;
      return `<div class="check-pill ${sel?'selected':''} ${disabled?'disabled':''}" ${disabled?'':`data-pick="${name}" data-fn="toggleBarbaroMaestria"`} title="${w.mastery}: ${MASTERY_PROPERTIES[w.mastery]}">${name} (${w.mastery})</div>`;
    }).join('')}
  </div>
  <div class="counter ${bb.maestria.length===BARBARO.maestriaCount?'ok':''}">${bb.maestria.length}/${BARBARO.maestriaCount} escolhidas</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${bb.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...BARBARO.equipmentA, BARBARO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickBarbaroEquip">${bb.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${bb.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${BARBARO.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickBarbaroEquip">${bb.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function renderBardoDetail(){
  const bd = data.bardo;
  return `<h2>Bardo — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Carisma · Dado de Vida: d8 · Salvaguardas: Destreza e Carisma · Armas Simples · Armadura Leve</div>

  <h3 id="grp-1-skills">Perícias (escolha ${BARDO.skillsCount}, QUAISQUER — sem lista restrita)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = ALL_SKILLS.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), bd.skills, BARDO.skillsCount, 'toggleBardoSkill');
  })()}
  <div class="counter ${bd.skills.length===BARDO.skillsCount?'ok':''}">${bd.skills.length}/${BARDO.skillsCount} escolhidas</div>

  <h3 id="grp-1-instruments">Ferramentas — Instrumentos Musicais (escolha ${BARDO.toolsCount})</h3>
  <div class="check-list" style="margin-bottom:6px;">
    ${ALL_INSTRUMENTS.map(name=>{
      const sel = bd.instruments.includes(name);
      const disabled = !sel && bd.instruments.length>=BARDO.toolsCount;
      return `<div class="check-pill ${sel?'selected':''} ${disabled?'disabled':''}" ${disabled?'':`data-pick="${name}" data-fn="toggleBardoInstrument"`}>${name}</div>`;
    }).join('')}
  </div>
  <div class="counter ${bd.instruments.length===BARDO.toolsCount?'ok':''}">${bd.instruments.length}/${BARDO.toolsCount} escolhidos</div>

  <h3>Inspiração de Bardo</h3>
  <div class="option-block">${BARDO.inspiracao}</div>

  <h3 id="grp-1-cantrips">Truques da Classe (escolha 2, da lista de Bardo)</h3>
  ${speciesGrantedCantrips().length ? `<div class="intro" style="margin-bottom:8px;">Truques que você já conhece de graça pela espécie (${speciesGrantedCantrips().join(', ')}) não aparecem aqui.</div>` : ''}
  ${spellChoiceList(BARDO.cantrips.filter(c=>!speciesGrantedCantrips().includes(c) && !chosenCantripsElsewhere('classe').includes(c)), bd.cantrips, 2, 'toggleBardoCantrip')}
  <div class="counter ${bd.cantrips.length===2?'ok':''}">${bd.cantrips.length}/2 escolhidos</div>

  <h3 id="grp-1-spells1">Magias Preparadas de 1º Círculo (escolha 4, da lista de Bardo)</h3>
  ${spellChoiceList(BARDO.spells1.filter(s=>!speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('classe').includes(s)), bd.spells1, 4, 'toggleBardoSpell1')}
  <div class="counter ${bd.spells1.length===4?'ok':''}">${bd.spells1.length}/4 escolhidas</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${bd.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...resolvedClassEquipmentList(BARDO.equipmentA), BARDO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickBardoEquip">${bd.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${bd.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${BARDO.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickBardoEquip">${bd.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function renderMagoDetail(){
  const mg = data.mago;
  return `<h2>Mago — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Inteligência · Dado de Vida: d6 · Salvaguardas: Inteligência e Sabedoria · Armas Simples · Sem treinamento com Armadura</div>

  <h3 id="grp-1-skills">Perícias (escolha 2)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = MAGO.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), mg.skills, 2, 'toggleMagoSkill');
  })()}
  <div class="counter ${mg.skills.length===2?'ok':''}">${mg.skills.length}/2 escolhidas</div>

  <h3>Adepto de Ritual</h3>
  <div class="option-block">${MAGO.adeptoRitual}</div>

  <h3 id="grp-1-cantrips">Truques da Classe (escolha ${MAGO.cantripsCount}, da lista de Mago)</h3>
  ${speciesGrantedCantrips().length ? `<div class="intro" style="margin-bottom:8px;">Truques que você já conhece de graça pela espécie (${speciesGrantedCantrips().join(', ')}) não aparecem aqui.</div>` : ''}
  ${spellChoiceList(MAGO.cantrips.filter(c=>!speciesGrantedCantrips().includes(c) && !chosenCantripsElsewhere('classe').includes(c)), mg.cantrips, MAGO.cantripsCount, 'toggleMagoCantrip')}
  <div class="counter ${mg.cantrips.length===MAGO.cantripsCount?'ok':''}">${mg.cantrips.length}/${MAGO.cantripsCount} escolhidos</div>

  <h3>Recuperação Arcana</h3>
  <div class="option-block">${MAGO.recuperacaoArcana}</div>

  <h3 id="grp-1-spellbook">Livro de Magias (escolha ${MAGO.spellbookCount}, da lista de Mago)</h3>
  <div class="intro" style="margin-bottom:8px;">São as magias que você conhece de verdade — seu "estoque". No passo seguinte você escolhe quais delas ficam Preparadas (prontas pra conjurar sem reler o livro).</div>
  ${spellChoiceList(MAGO.spells1.filter(s=>!speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('classe').includes(s)), mg.spellbook, MAGO.spellbookCount, 'toggleMagoSpellbook')}
  <div class="counter ${mg.spellbook.length===MAGO.spellbookCount?'ok':''}">${mg.spellbook.length}/${MAGO.spellbookCount} escolhidas</div>

  <h3 id="grp-1-prepared">Magias Preparadas (escolha ${MAGO.preparedCount}, do seu Livro de Magias)</h3>
  ${mg.spellbook.length===0 ? `<div class="intro">Escolha primeiro as magias do seu Livro de Magias acima.</div>` : spellChoiceList(mg.spellbook, mg.prepared, MAGO.preparedCount, 'toggleMagoPrepared')}
  <div class="counter ${mg.prepared.length===MAGO.preparedCount?'ok':''}">${mg.prepared.length}/${MAGO.preparedCount} escolhidas</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${mg.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...MAGO.equipmentA, MAGO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickMagoEquip">${mg.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${mg.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${MAGO.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickMagoEquip">${mg.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function renderPaladinoDetail(){
  const pl = data.paladino;
  return `<h2>Paladino — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Força e Carisma · Dado de Vida: d10 · Salvaguardas: Sabedoria e Carisma · Armas Simples e Marciais · Armadura Leve, Média, Pesada e Escudo</div>

  <h3 id="grp-1-skills">Perícias (escolha 2)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = PALADINO.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), pl.skills, 2, 'togglePaladinoSkill');
  })()}
  <div class="counter ${pl.skills.length===2?'ok':''}">${pl.skills.length}/2 escolhidas</div>

  <h3 id="grp-1-prepared">Magias Preparadas de 1º Círculo (escolha ${PALADINO.preparedCount}, da lista de Paladino)</h3>
  <div class="intro" style="margin-bottom:8px;">Paladino não conhece truques no nível 1, só magias preparadas.</div>
  ${spellChoiceList(PALADINO.spells1.filter(s=>!speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('classe').includes(s)), pl.prepared, PALADINO.preparedCount, 'togglePaladinoPrepared')}
  <div class="counter ${pl.prepared.length===PALADINO.preparedCount?'ok':''}">${pl.prepared.length}/${PALADINO.preparedCount} escolhidas</div>

  <h3 id="grp-1-maestria">Maestria em Arma (escolha ${PALADINO.maestriaCount}, com as quais você tem proficiência)</h3>
  <div class="intro" style="margin-bottom:8px;">Você pode trocar essa escolha ao completar um Descanso Longo.</div>
  <div class="check-list" style="margin-bottom:6px;">
    ${Object.entries(WEAPON_MASTERY).map(([name,w])=>{
      const sel = pl.maestria.includes(name);
      const disabled = !sel && pl.maestria.length>=PALADINO.maestriaCount;
      return `<div class="check-pill ${sel?'selected':''} ${disabled?'disabled':''}" ${disabled?'':`data-pick="${name}" data-fn="togglePaladinoMaestria"`} title="${w.mastery}: ${MASTERY_PROPERTIES[w.mastery]}">${name} (${w.mastery})</div>`;
    }).join('')}
  </div>
  <div class="counter ${pl.maestria.length===PALADINO.maestriaCount?'ok':''}">${pl.maestria.length}/${PALADINO.maestriaCount} escolhidas</div>

  <h3>Mãos Consagradas</h3>
  <div class="option-block">${PALADINO.maosConsagradas}</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${pl.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...PALADINO.equipmentA, PALADINO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickPaladinoEquip">${pl.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${pl.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${PALADINO.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickPaladinoEquip">${pl.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function renderPsionicoDetail(){
  const ps = data.psionico;
  return `<h2>Psiônico — Detalhes da Classe <span style="font-size:0.6em;color:var(--parchment-dim);">(Unearthed Arcana 2025)</span></h2>
  <div class="intro">Atributo Primário: Inteligência · Dado de Vida: d6 · Salvaguardas: Inteligência e Sabedoria · Armas Simples · Sem treinamento com Armadura</div>

  <h3 id="grp-1-skills">Perícias (escolha 2)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = PSIONICO.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), ps.skills, 2, 'togglePsionicoSkill');
  })()}
  <div class="counter ${ps.skills.length===2?'ok':''}">${ps.skills.length}/2 escolhidas</div>

  <h3 id="grp-1-cantrips">Truques da Classe (escolha ${PSIONICO.cantripsCount}, da lista de Psiônico)</h3>
  ${speciesGrantedCantrips().length ? `<div class="intro" style="margin-bottom:8px;">Truques que você já conhece de graça pela espécie (${speciesGrantedCantrips().join(', ')}) não aparecem aqui.</div>` : ''}
  ${spellChoiceList(PSIONICO.cantrips.filter(c=>!speciesGrantedCantrips().includes(c) && !chosenCantripsElsewhere('classe').includes(c)), ps.cantrips, PSIONICO.cantripsCount, 'togglePsionicoCantrip')}
  <div class="counter ${ps.cantrips.length===PSIONICO.cantripsCount?'ok':''}">${ps.cantrips.length}/${PSIONICO.cantripsCount} escolhidos</div>

  <h3>Poder Psiônico</h3>
  <div class="option-block">${PSIONICO.poderPsionico}</div>

  <h3>Telecinese Sutil</h3>
  <div class="option-block">${PSIONICO.telecineseSutil}</div>

  <h3 id="grp-1-spells1">Magias Preparadas de 1º Círculo (escolha ${PSIONICO.preparedCount}, da lista de Psiônico)</h3>
  ${spellChoiceList(PSIONICO.spells1.filter(s=>!speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('classe').includes(s)), ps.spells1, PSIONICO.preparedCount, 'togglePsionicoSpell1')}
  <div class="counter ${ps.spells1.length===PSIONICO.preparedCount?'ok':''}">${ps.spells1.length}/${PSIONICO.preparedCount} escolhidas</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${ps.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...PSIONICO.equipmentA, PSIONICO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickPsionicoEquip">${ps.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${ps.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${PSIONICO.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickPsionicoEquip">${ps.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

/* Taumaturgo concede +1 truque de Clérigo — por isso o total de truques
   disponíveis pro jogador escolher depende da Ordem Divina escolhida. */
function clerigoEffectiveCantripsCount(){
  return CLERIGO.cantripsCount + (data.clerigo.ordem==='Taumaturgo' ? 1 : 0);
}

function renderClerigoDetail(){
  const cl = data.clerigo;
  const cantripsMax = clerigoEffectiveCantripsCount();
  return `<h2>Clérigo — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Sabedoria · Dado de Vida: d8 · Salvaguardas: Sabedoria e Carisma · Armas Simples · Armadura Leve, Média e Escudo</div>

  <h3 id="grp-1-skills">Perícias (escolha 2)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = CLERIGO.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), cl.skills, 2, 'toggleClerigoSkill');
  })()}
  <div class="counter ${cl.skills.length===2?'ok':''}">${cl.skills.length}/2 escolhidas</div>

  <h3 id="grp-1-ordem">Ordem Divina (escolha 1)</h3>
  ${Object.entries(CLERIGO.ordemDivina).map(([name,desc])=>`
    <div class="option-block ${cl.ordem===name?'selected':''}">
      <h3 style="color:var(--gold);margin-top:0;">${name}</h3><p>${desc}</p>
      <button class="pick-btn" data-pick="${name}" data-fn="pickClerigoOrdem">${cl.ordem===name?'Selecionado':'Escolher'}</button>
    </div>`).join('')}

  <h3 id="grp-1-cantrips">Truques da Classe (escolha ${cantripsMax}, da lista de Clérigo)</h3>
  ${speciesGrantedCantrips().length ? `<div class="intro" style="margin-bottom:8px;">Truques que você já conhece de graça pela espécie (${speciesGrantedCantrips().join(', ')}) não aparecem aqui.</div>` : ''}
  ${spellChoiceList(CLERIGO.cantrips.filter(c=>!speciesGrantedCantrips().includes(c) && !chosenCantripsElsewhere('classe').includes(c)), cl.cantrips, cantripsMax, 'toggleClerigoCantrip')}
  <div class="counter ${cl.cantrips.length===cantripsMax?'ok':''}">${cl.cantrips.length}/${cantripsMax} escolhidos</div>

  <h3 id="grp-1-spells1">Magias Preparadas de 1º Círculo (escolha ${CLERIGO.preparedCount}, da lista de Clérigo)</h3>
  ${spellChoiceList(CLERIGO.spells1.filter(s=>!speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('classe').includes(s)), cl.spells1, CLERIGO.preparedCount, 'toggleClerigoSpell1')}
  <div class="counter ${cl.spells1.length===CLERIGO.preparedCount?'ok':''}">${cl.spells1.length}/${CLERIGO.preparedCount} escolhidas</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${cl.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...CLERIGO.equipmentA, CLERIGO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickClerigoEquip">${cl.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${cl.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${CLERIGO.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickClerigoEquip">${cl.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function renderGuerreiroDetail(){
  const gr = data.guerreiro;
  return `<h2>Guerreiro — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Força ou Destreza · Dado de Vida: d10 · Salvaguardas: Força e Constituição · Armas Simples e Marciais · Armadura Leve, Média, Pesada e Escudo</div>

  <h3 id="grp-1-skills">Perícias (escolha 2)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = GUERREIRO.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), gr.skills, 2, 'toggleGuerreiroSkill');
  })()}
  <div class="counter ${gr.skills.length===2?'ok':''}">${gr.skills.length}/2 escolhidas</div>

  <h3 id="grp-1-estilo">Estilo de Luta (escolha 1 talento)</h3>
  ${Object.entries(GUERREIRO.estiloDeLuta).map(([name,desc])=>`
    <div class="option-block ${gr.estilo===name?'selected':''}">
      <h3 style="color:var(--gold);margin-top:0;">${name}</h3><p>${desc}</p>
      <button class="pick-btn" data-pick="${name}" data-fn="pickGuerreiroEstilo">${gr.estilo===name?'Selecionado':'Escolher'}</button>
    </div>`).join('')}

  <h3 id="grp-1-maestria">Maestria em Arma (escolha ${GUERREIRO.maestriaCount}, com as quais você tem proficiência)</h3>
  <div class="intro" style="margin-bottom:8px;">Você pode trocar essa escolha ao completar um Descanso Longo.</div>
  <div class="check-list" style="margin-bottom:6px;">
    ${Object.entries(WEAPON_MASTERY).map(([name,w])=>{
      const sel = gr.maestria.includes(name);
      const disabled = !sel && gr.maestria.length>=GUERREIRO.maestriaCount;
      return `<div class="check-pill ${sel?'selected':''} ${disabled?'disabled':''}" ${disabled?'':`data-pick="${name}" data-fn="toggleGuerreiroMaestria"`} title="${w.mastery}: ${MASTERY_PROPERTIES[w.mastery]}">${name} (${w.mastery})</div>`;
    }).join('')}
  </div>
  <div class="counter ${gr.maestria.length===GUERREIRO.maestriaCount?'ok':''}">${gr.maestria.length}/${GUERREIRO.maestriaCount} escolhidas</div>

  <h3>Recuperar Fôlego</h3>
  <div class="option-block">${GUERREIRO.recuperarFolego}</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${gr.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...GUERREIRO.equipmentA, GUERREIRO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickGuerreiroEquip">${gr.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${gr.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${[...GUERREIRO.equipmentB, GUERREIRO.equipmentB_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="B" data-fn="pickGuerreiroEquip">${gr.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${gr.equipment==='C'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção C</h3><p>${GUERREIRO.equipmentC_gold} PO</p>
    <button class="pick-btn" data-pick="C" data-fn="pickGuerreiroEquip">${gr.equipment==='C'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function renderLadinoDetail(){
  const ld = data.ladino;
  return `<h2>Ladino — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Destreza · Dado de Vida: d8 · Salvaguardas: Destreza e Inteligência · Armas Simples e Marciais com Acuidade ou Leve · Armadura Leve · Ferramentas de Ladrão (automático)</div>

  <h3 id="grp-1-skills">Perícias (escolha ${LADINO.skillsCount})</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = LADINO.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), ld.skills, LADINO.skillsCount, 'toggleLadinoSkill');
  })()}
  <div class="counter ${ld.skills.length===LADINO.skillsCount?'ok':''}">${ld.skills.length}/${LADINO.skillsCount} escolhidas</div>

  <h3>Ataque Furtivo</h3>
  <div class="option-block">${LADINO.ataqueFurtivo}</div>

  <h3 id="grp-1-especialista">Especialista (escolha ${LADINO.especialistaCount} perícias já proficientes)</h3>
  <div class="intro" style="margin-bottom:8px;">Dobra o bônus de proficiência nessas perícias. Só pode escolher entre as que você já tem (da classe, do antecedente, ou de Habilidoso).</div>
  ${(()=>{
    const bgConst = activeBgConst();
    const jaProficiente = [...new Set([...ld.skills, ...bgConst.skills, ...activeBgData().habilidoso])].filter(s=>ALL_SKILLS.includes(s));
    if(jaProficiente.length===0) return `<div class="intro">Escolha primeiro suas perícias acima.</div>`;
    return groupedChoiceList(skillGroupsByAbility(jaProficiente), ld.especialista, LADINO.especialistaCount, 'toggleLadinoEspecialista');
  })()}
  <div class="counter ${ld.especialista.length===LADINO.especialistaCount?'ok':''}">${ld.especialista.length}/${LADINO.especialistaCount} escolhidas</div>

  <h3>Gíria do Ladrão</h3>
  <div class="option-block">${LADINO.giriaDoLadrao}</div>

  <h3 id="grp-1-maestria">Maestria em Arma (escolha ${LADINO.maestriaCount}, com as quais você tem proficiência)</h3>
  <div class="intro" style="margin-bottom:8px;">Só armas Simples ou Marciais com Acuidade/Leve aparecem aqui — é o que o Ladino tem proficiência pra usar. Você pode trocar essa escolha ao completar um Descanso Longo.</div>
  <div class="check-list" style="margin-bottom:6px;">
    ${Object.entries(WEAPON_MASTERY).filter(([,w])=>w.categoria==='Simples' || w.propriedades.includes('Acuidade') || w.propriedades.includes('Leve')).map(([name,w])=>{
      const sel = ld.maestria.includes(name);
      const disabled = !sel && ld.maestria.length>=LADINO.maestriaCount;
      return `<div class="check-pill ${sel?'selected':''} ${disabled?'disabled':''}" ${disabled?'':`data-pick="${name}" data-fn="toggleLadinoMaestria"`} title="${w.mastery}: ${MASTERY_PROPERTIES[w.mastery]}">${name} (${w.mastery})</div>`;
    }).join('')}
  </div>
  <div class="counter ${ld.maestria.length===LADINO.maestriaCount?'ok':''}">${ld.maestria.length}/${LADINO.maestriaCount} escolhidas</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${ld.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...LADINO.equipmentA, LADINO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickLadinoEquip">${ld.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${ld.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${LADINO.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickLadinoEquip">${ld.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

/* Xamã concede +1 truque — mesmo padrão do clerigoEffectiveCantripsCount(). */
function druidaEffectiveCantripsCount(){
  return DRUIDA.cantripsCount + (data.druida.ordem==='Xamã' ? 1 : 0);
}

function renderDruidaDetail(){
  const dr = data.druida;
  const cantripsMax = druidaEffectiveCantripsCount();
  return `<h2>Druida — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Sabedoria · Dado de Vida: d8 · Salvaguardas: Inteligência e Sabedoria · Armas Simples · Armadura Leve e Escudos · Kit de Herbalismo (automático)</div>

  <h3 id="grp-1-skills">Perícias (escolha 2)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = DRUIDA.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), dr.skills, 2, 'toggleDruidaSkill');
  })()}
  <div class="counter ${dr.skills.length===2?'ok':''}">${dr.skills.length}/2 escolhidas</div>

  <h3>Idioma Druídico</h3>
  <div class="option-block">${DRUIDA.idiomaDruidico}</div>

  <h3 id="grp-1-ordem">Ordem Primal (escolha 1)</h3>
  ${Object.entries(DRUIDA.ordemPrimal).map(([name,desc])=>`
    <div class="option-block ${dr.ordem===name?'selected':''}">
      <h3 style="color:var(--gold);margin-top:0;">${name}</h3><p>${desc}</p>
      <button class="pick-btn" data-pick="${name}" data-fn="pickDruidaOrdem">${dr.ordem===name?'Selecionado':'Escolher'}</button>
    </div>`).join('')}

  <h3 id="grp-1-cantrips">Truques da Classe (escolha ${cantripsMax}, da lista de Druida)</h3>
  ${speciesGrantedCantrips().length ? `<div class="intro" style="margin-bottom:8px;">Truques que você já conhece de graça pela espécie (${speciesGrantedCantrips().join(', ')}) não aparecem aqui.</div>` : ''}
  ${spellChoiceList(DRUIDA.cantrips.filter(c=>!speciesGrantedCantrips().includes(c) && !chosenCantripsElsewhere('classe').includes(c)), dr.cantrips, cantripsMax, 'toggleDruidaCantrip')}
  <div class="counter ${dr.cantrips.length===cantripsMax?'ok':''}">${dr.cantrips.length}/${cantripsMax} escolhidos</div>

  <h3 id="grp-1-spells1">Magias Preparadas de 1º Círculo (escolha ${DRUIDA.preparedCount}, da lista de Druida)</h3>
  <div class="intro" style="margin-bottom:8px;">Falar com Animais não aparece aqui — você já tem ela sempre preparada de graça pelo Idioma Druídico.</div>
  ${spellChoiceList(DRUIDA.spells1.filter(s=>s!=='Falar com Animais' && !speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('classe').includes(s)), dr.spells1, DRUIDA.preparedCount, 'toggleDruidaSpell1')}
  <div class="counter ${dr.spells1.length===DRUIDA.preparedCount?'ok':''}">${dr.spells1.length}/${DRUIDA.preparedCount} escolhidas</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${dr.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...DRUIDA.equipmentA, DRUIDA.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickDruidaEquip">${dr.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${dr.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${DRUIDA.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickDruidaEquip">${dr.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function renderFeiticeiroDetail(){
  const ft = data.feiticeiro;
  return `<h2>Feiticeiro — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Carisma · Dado de Vida: d6 · Salvaguardas: Constituição e Carisma · Armas Simples · Sem treinamento com Armadura</div>

  <h3 id="grp-1-skills">Perícias (escolha 2)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = FEITICEIRO.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), ft.skills, 2, 'toggleFeiticeiroSkill');
  })()}
  <div class="counter ${ft.skills.length===2?'ok':''}">${ft.skills.length}/2 escolhidas</div>

  <h3 id="grp-1-cantrips">Truques da Classe (escolha ${FEITICEIRO.cantripsCount}, da lista de Feiticeiro)</h3>
  ${speciesGrantedCantrips().length ? `<div class="intro" style="margin-bottom:8px;">Truques que você já conhece de graça pela espécie (${speciesGrantedCantrips().join(', ')}) não aparecem aqui.</div>` : ''}
  ${spellChoiceList(FEITICEIRO.cantrips.filter(c=>!speciesGrantedCantrips().includes(c) && !chosenCantripsElsewhere('classe').includes(c)), ft.cantrips, FEITICEIRO.cantripsCount, 'toggleFeiticeiroCantrip')}
  <div class="counter ${ft.cantrips.length===FEITICEIRO.cantripsCount?'ok':''}">${ft.cantrips.length}/${FEITICEIRO.cantripsCount} escolhidos</div>

  <h3>Feitiçaria Inata</h3>
  <div class="option-block">${FEITICEIRO.feiticariaInata}</div>

  <h3 id="grp-1-spells1">Magias Preparadas de 1º Círculo (escolha ${FEITICEIRO.preparedCount}, da lista de Feiticeiro)</h3>
  ${spellChoiceList(FEITICEIRO.spells1.filter(s=>!speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('classe').includes(s)), ft.spells1, FEITICEIRO.preparedCount, 'toggleFeiticeiroSpell1')}
  <div class="counter ${ft.spells1.length===FEITICEIRO.preparedCount?'ok':''}">${ft.spells1.length}/${FEITICEIRO.preparedCount} escolhidas</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${ft.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...FEITICEIRO.equipmentA, FEITICEIRO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickFeiticeiroEquip">${ft.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${ft.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${FEITICEIRO.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickFeiticeiroEquip">${ft.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function renderMongeDetail(){
  const mk = data.monge;
  return `<h2>Monge — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Destreza e Sabedoria · Dado de Vida: d8 · Salvaguardas: Força e Destreza · Armas Simples Corpo a Corpo e Marciais Corpo a Corpo com Leve · Sem treinamento com Armadura · ${MONGE.toolsNote}</div>

  <h3 id="grp-1-skills">Perícias (escolha 2)</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = MONGE.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), mk.skills, 2, 'toggleMongeSkill');
  })()}
  <div class="counter ${mk.skills.length===2?'ok':''}">${mk.skills.length}/2 escolhidas</div>

  <h3>Artes Marciais</h3>
  <div class="option-block">${MONGE.artesMarciais}</div>

  <h3>Defesa sem Armadura</h3>
  <div class="option-block">${MONGE.defesaSemArmadura}</div>

  <h3 id="grp-1-toolcategory">Ferramenta ou Instrumento — escolha 1 categoria</h3>
  <div class="check-list" style="margin-bottom:10px;">
    ${MONGE.toolCategories.map(cat=>`<div class="check-pill ${mk.toolCategory===cat?'selected':''}" data-pick="${cat}" data-fn="pickMongeToolCategory">${cat}</div>`).join('')}
  </div>
  ${mk.toolCategory ? `
  <h3 id="grp-1-toolchoice">${mk.toolCategory} — escolha 1</h3>
  <div class="check-list" style="margin-bottom:10px;">
    ${(mk.toolCategory==='Instrumento Musical' ? ALL_INSTRUMENTS : ALL_ARTISAN_TOOLS).map(t=>`<div class="check-pill ${mk.toolChoice===t?'selected':''}" data-pick="${t}" data-fn="pickMongeToolChoice">${t}</div>`).join('')}
  </div>` : ''}

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${mk.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...resolvedClassEquipmentList(MONGE.equipmentA), MONGE.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickMongeEquip">${mk.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${mk.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${MONGE.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickMongeEquip">${mk.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function renderGuardiaoDetail(){
  const gd = data.guardiao;
  return `<h2>Guardião — Detalhes da Classe</h2>
  <div class="intro">Atributo Primário: Destreza e Sabedoria · Dado de Vida: d10 · Salvaguardas: Força e Destreza · Armas Simples e Marciais · Armadura Leve, Média e Escudo</div>

  <h3 id="grp-1-skills">Perícias (escolha ${GUARDIAO.skillsCount})</h3>
  <div class="intro" style="margin-bottom:8px;">Perícias que você já tem por outro recurso não aparecem aqui (escolhê-las de novo não dá benefício extra).</div>
  ${(()=>{
    const alreadyHave = skillsGrantedElsewhere('classe');
    const available = GUARDIAO.skills.filter(s=>!alreadyHave.includes(s));
    return groupedChoiceList(skillGroupsByAbility(available), gd.skills, GUARDIAO.skillsCount, 'toggleGuardiaoSkill');
  })()}
  <div class="counter ${gd.skills.length===GUARDIAO.skillsCount?'ok':''}">${gd.skills.length}/${GUARDIAO.skillsCount} escolhidas</div>

  <h3>Inimigo Favorito</h3>
  <div class="option-block">${GUARDIAO.inimigoFavorito}</div>

  <h3 id="grp-1-spells1">Magias Preparadas de 1º Círculo (escolha ${GUARDIAO.preparedCount}, da lista de Guardião)</h3>
  <div class="intro" style="margin-bottom:8px;">Sem truques no nível 1. Marca do Predador não aparece aqui — você já tem ela sempre preparada de graça pelo Inimigo Favorito.</div>
  ${spellChoiceList(GUARDIAO.spells1.filter(s=>s!=='Marca do Predador' && !speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('classe').includes(s)), gd.spells1, GUARDIAO.preparedCount, 'toggleGuardiaoSpell1')}
  <div class="counter ${gd.spells1.length===GUARDIAO.preparedCount?'ok':''}">${gd.spells1.length}/${GUARDIAO.preparedCount} escolhidas</div>

  <h3 id="grp-1-maestria">Maestria em Arma (escolha ${GUARDIAO.maestriaCount}, com as quais você tem proficiência)</h3>
  <div class="intro" style="margin-bottom:8px;">Você pode trocar essa escolha ao completar um Descanso Longo.</div>
  <div class="check-list" style="margin-bottom:6px;">
    ${Object.entries(WEAPON_MASTERY).map(([name,w])=>{
      const sel = gd.maestria.includes(name);
      const disabled = !sel && gd.maestria.length>=GUARDIAO.maestriaCount;
      return `<div class="check-pill ${sel?'selected':''} ${disabled?'disabled':''}" ${disabled?'':`data-pick="${name}" data-fn="toggleGuardiaoMaestria"`} title="${w.mastery}: ${MASTERY_PROPERTIES[w.mastery]}">${name} (${w.mastery})</div>`;
    }).join('')}
  </div>
  <div class="counter ${gd.maestria.length===GUARDIAO.maestriaCount?'ok':''}">${gd.maestria.length}/${GUARDIAO.maestriaCount} escolhidas</div>

  <h3 id="grp-1-equipment">Equipamento Inicial</h3>
  <div class="option-block ${gd.equipment==='A'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção A</h3><p>${[...GUARDIAO.equipmentA, GUARDIAO.equipmentA_gold+' PO'].join(', ')}</p>
    <button class="pick-btn" data-pick="A" data-fn="pickGuardiaoEquip">${gd.equipment==='A'?'Selecionado':'Escolher'}</button>
  </div>
  <div class="option-block ${gd.equipment==='B'?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">Opção B</h3><p>${GUARDIAO.equipmentB_gold} PO</p>
    <button class="pick-btn" data-pick="B" data-fn="pickGuardiaoEquip">${gd.equipment==='B'?'Selecionado':'Escolher'}</button>
  </div>
  ${nav(canAdvance())}`;
}

function getBonusFor(ability){
  const plan = activeBgData().abilityPlan;
  if(!plan) return 0;
  if(plan.type==='1-1-1'){
    return (plan.plusOnes||[]).includes(ability) ? 1 : 0;
  }
  if(plan.type==='2-1'){
    if(plan.plus2===ability) return 2;
    if(plan.plus1===ability) return 1;
  }
  return 0;
}

