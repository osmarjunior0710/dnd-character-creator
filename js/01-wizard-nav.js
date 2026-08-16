/* 01-wizard-nav.js — Navegação do wizard: render() (dispatcher principal), progresso, next()/back()/goTo(), validação de passo (findFirstMissingGroup/canAdvance), 'Voltar ao Resumo', e o botão Randomizar (randomizeCurrentStep + randomizeXDetail por passo).
   Extraído de index.html (linhas 1429-1908 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
function renderProgress(){
  const bar = document.getElementById('progressBar');
  bar.innerHTML='';
  for(let i=0;i<TOTAL_STEPS;i++){
    const seg = document.createElement('div');
    seg.className = 'seg' + (i<step?' done':'') + (i===step?' current':'');
    bar.appendChild(seg);
  }
}
function goTo(newStep){ step = newStep; persist(); render(); }
function next(){
  const missing = findFirstMissingGroup();
  if(!missing){ goTo(step+1); return; }
  scrollToMissing(missing);
}
function back(){ if(step>0) goTo(step-1); }

function findFirstMissingGroup(){
  switch(step){
    case 0: return data.classe ? null : 'grp-0-classe';
    case 1: {
      if(data.classe==='Bárbaro'){
        const bb = data.barbaro;
        if(bb.skills.length!==2) return 'grp-1-skills';
        if(bb.maestria.length!==BARBARO.maestriaCount) return 'grp-1-maestria';
        if(!bb.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Bardo'){
        const bd = data.bardo;
        if(bd.skills.length!==BARDO.skillsCount) return 'grp-1-skills';
        if(bd.instruments.length!==BARDO.toolsCount) return 'grp-1-instruments';
        if(bd.cantrips.length!==2) return 'grp-1-cantrips';
        if(bd.spells1.length!==4) return 'grp-1-spells1';
        if(!bd.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Mago'){
        const mg = data.mago;
        if(mg.skills.length!==2) return 'grp-1-skills';
        if(mg.cantrips.length!==MAGO.cantripsCount) return 'grp-1-cantrips';
        if(mg.spellbook.length!==MAGO.spellbookCount) return 'grp-1-spellbook';
        if(mg.prepared.length!==MAGO.preparedCount) return 'grp-1-prepared';
        if(!mg.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Paladino'){
        const pl = data.paladino;
        if(pl.skills.length!==2) return 'grp-1-skills';
        if(pl.prepared.length!==PALADINO.preparedCount) return 'grp-1-prepared';
        if(pl.maestria.length!==PALADINO.maestriaCount) return 'grp-1-maestria';
        if(!pl.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Psiônico'){
        const ps = data.psionico;
        if(ps.skills.length!==2) return 'grp-1-skills';
        if(ps.cantrips.length!==PSIONICO.cantripsCount) return 'grp-1-cantrips';
        if(ps.spells1.length!==PSIONICO.preparedCount) return 'grp-1-spells1';
        if(!ps.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Clérigo'){
        const cl = data.clerigo;
        if(cl.skills.length!==2) return 'grp-1-skills';
        if(!cl.ordem) return 'grp-1-ordem';
        if(cl.cantrips.length!==clerigoEffectiveCantripsCount()) return 'grp-1-cantrips';
        if(cl.spells1.length!==CLERIGO.preparedCount) return 'grp-1-spells1';
        if(!cl.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Guerreiro'){
        const gr = data.guerreiro;
        if(gr.skills.length!==2) return 'grp-1-skills';
        if(!gr.estilo) return 'grp-1-estilo';
        if(gr.maestria.length!==GUERREIRO.maestriaCount) return 'grp-1-maestria';
        if(!gr.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Ladino'){
        const ld = data.ladino;
        if(ld.skills.length!==LADINO.skillsCount) return 'grp-1-skills';
        if(ld.especialista.length!==LADINO.especialistaCount) return 'grp-1-especialista';
        if(ld.maestria.length!==LADINO.maestriaCount) return 'grp-1-maestria';
        if(!ld.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Druida'){
        const dr = data.druida;
        if(dr.skills.length!==2) return 'grp-1-skills';
        if(!dr.ordem) return 'grp-1-ordem';
        if(dr.cantrips.length!==druidaEffectiveCantripsCount()) return 'grp-1-cantrips';
        if(dr.spells1.length!==DRUIDA.preparedCount) return 'grp-1-spells1';
        if(!dr.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Feiticeiro'){
        const ft = data.feiticeiro;
        if(ft.skills.length!==2) return 'grp-1-skills';
        if(ft.cantrips.length!==FEITICEIRO.cantripsCount) return 'grp-1-cantrips';
        if(ft.spells1.length!==FEITICEIRO.preparedCount) return 'grp-1-spells1';
        if(!ft.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Monge'){
        const mk = data.monge;
        if(mk.skills.length!==2) return 'grp-1-skills';
        if(!mk.toolCategory) return 'grp-1-toolcategory';
        if(!mk.toolChoice) return 'grp-1-toolchoice';
        if(!mk.equipment) return 'grp-1-equipment';
        return null;
      }
      if(data.classe==='Guardião'){
        const gd = data.guardiao;
        if(gd.skills.length!==GUARDIAO.skillsCount) return 'grp-1-skills';
        if(gd.spells1.length!==GUARDIAO.preparedCount) return 'grp-1-spells1';
        if(gd.maestria.length!==GUARDIAO.maestriaCount) return 'grp-1-maestria';
        if(!gd.equipment) return 'grp-1-equipment';
        return null;
      }
      const b = data.bruxo;
      if(b.skills.length!==2) return 'grp-1-skills';
      if(!b.pactBoon) return 'grp-1-pact';
      if(b.cantrips.length!==2) return 'grp-1-cantrips';
      if(b.pactBoon==='Pacto do Tomo' && b.tomoCantrips.length!==3) return 'grp-1-tomocantrips';
      if(b.spells1.length!==2) return 'grp-1-spells1';
      if(b.pactBoon==='Pacto do Tomo' && b.tomoRituals.length!==2) return 'grp-1-tomorituals';
      if(!b.equipment) return 'grp-1-equipment';
      return null;
    }
    case 2: return data.antecedente ? null : 'grp-2-antecedente';
    case 3: {
      const bg = activeBgData();
      const plan = bg.abilityPlan;
      const planOk = plan && (plan.type==='2-1' ? (!!plan.plus2 && !!plan.plus1) : (plan.plusOnes||[]).length===3);
      if(!planOk) return 'grp-3-abilityplan';
      if(activeBgConst().ferramentaOpcoes && !bg.ferramentaEscolhida) return 'grp-3-ferramenta';
      if(activeBgConst().iniciadoEmMagia){
        if(bg.iniciadoCantrips.length!==2) return 'grp-3-iniciado-truques';
        if(bg.iniciadoSpell1.length!==1) return 'grp-3-iniciado-magia1';
      }
      if(activeBgConst().feat.startsWith('Habilidoso') && bg.habilidoso.length!==3) return 'grp-3-habilidoso';
      if(!bg.equipment) return 'grp-3-equipment';
      return null;
    }
    case 4: return data.especie ? null : 'grp-4-especie';
    case 5:
      if(data.especie==='Pequenino') return null;
      if(data.especie==='Anão') return null;
      if(data.especie==='Orc') return null;
      if(data.especie==='Humano'){
        if(!data.humano.tamanho) return 'grp-5-tamanho';
        if(!data.humano.pericia) return 'grp-5-pericia';
        if(!data.humano.talento) return 'grp-5-talento';
        return null;
      }
      if(data.especie==='Draconato') return data.draconato.heranca ? null : 'grp-5-heranca';
      if(data.especie==='Elfo'){
        if(!data.elfo.pericia) return 'grp-5-pericia';
        if(!data.elfo.linhagem) return 'grp-5-linhagem';
        return null;
      }
      if(data.especie==='Gnomo'){
        if(!data.gnomo.linhagem) return 'grp-5-linhagem';
        if(!data.gnomo.atributoLinhagem) return 'grp-5-atributo';
        return null;
      }
      if(data.especie==='Golias') return data.golias.ancestralidade ? null : 'grp-5-ancestralidade';
      if(data.especie==='Aasimar') return data.aasimar.tamanho ? null : 'grp-5-tamanho';
      if(!data.tiefling.tamanho) return 'grp-5-tamanho';
      if(!data.tiefling.legado) return 'grp-5-legado';
      if(!data.tiefling.atributoLegado) return 'grp-5-atributo';
      return null;
    case 6: {
      if(data.idiomas.comuns.length!==2) return 'grp-6-comuns';
      if(data.classe==='Ladino' && data.idiomas.extra.length!==1) return 'grp-6-extra';
      return null;
    }
    case 7: {
      const missingAbility = ABILITIES.find(a=>data.attrs[a]===undefined);
      return missingAbility ? 'grp-7-attr-'+missingAbility : null;
    }
    case 8: return data.alinhamento ? null : 'grp-8-alinhamento';
    default: return null;
  }
}

function scrollToMissing(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.scrollIntoView({behavior:'smooth', block:'center'});
  el.classList.remove('highlight-missing');
  void el.offsetWidth; // força reflow pra reiniciar a animação se já tiver rodado
  el.classList.add('highlight-missing');
  setTimeout(()=>el.classList.remove('highlight-missing'), 1600);
}

function nav(canNext){
  /* "Voltar ao Resumo" (só existe editando a partir do Resumo) tinha um
     3º botão espremido do lado do "Avançar", empilhando/quebrando linha
     de forma feia no celular (achado real de usuário, com print). Vira
     uma linha própria, largura cheia, ACIMA da linha padrão Voltar/
     Avançar — 2 linhas previsíveis em vez de 2 botões brigando pelo
     mesmo espaço horizontal. positionNav() (perto de positionMochilaFloater())
     mede a altura real da barra pra reservar espaço certo embaixo do
     conteúdo, já que agora ela pode ter 1 ou 2 linhas. */
  const summaryRow = data.returnToSummary ? `<div class="nav-inner nav-summary-row"><button class="btn primary" style="width:100%;" onclick="returnToSummaryNow()">Voltar ao Resumo ✓</button></div>` : '';
  return `<div class="nav">
    ${summaryRow}
    <div class="nav-inner">
      <button class="btn" onclick="back()" ${step===0?'style="visibility:hidden"':''}>← Voltar</button>
      <button class="btn primary" id="nextBtn" onclick="next()">${step===TOTAL_STEPS-1?'Concluir':'Avançar →'}</button>
    </div>
  </div>`;
}
function editSection(idx){ data.returnToSummary=true; goTo(idx); }
/* Igual editSection(), mas também rola até (e destaca) um campo específico
   dentro do passo — usado pelo botão "Editar" de cada fonte no aviso de
   Duplicidade do Resumo (ver renderDuplicidadesBox() em 07), pra levar o
   jogador direto pra escolha que causou aquela duplicata específica em
   vez de só abrir o passo inteiro. Reaproveita scrollToMissing() (mesma
   animação de destaque já usada quando "Avançar" acha um campo faltando). */
function editSectionAt(idx, groupId){
  editSection(idx);
  if(groupId) scrollToMissing(groupId);
}
function returnToSummaryNow(){
  const missing = findFirstMissingGroup();
  if(missing){ scrollToMissing(missing); return; }
  data.returnToSummary=false; goTo(10);
}

/* Antes disso era um switch(step) de ~80 linhas reimplementando, campo por
   campo, exatamente a mesma validação de findFirstMissingGroup() (só que
   devolvendo bool em vez do id do grupo faltante) — toda classe/espécie
   nova precisava ser atualizada nas DUAS funções, em dois formatos
   diferentes, e era fácil esquecer uma. Verificado caso a caso (steps 0-8)
   que as duas eram logicamente equivalentes; steps 9 (Loja) e 10 (Resumo)
   não têm campo obrigatório nas duas (findFirstMissingGroup cai no
   default:null igual canAdvance caía em true). */
function canAdvance(){
  return findFirstMissingGroup()===null;
}

/* ==========================================================================
   RANDOMIZAR (botão flutuante do lado esquerdo, mesma ideia/altura da
   Mochila) — pedido do usuário pra acelerar o preenchimento: escolhe
   aleatoriamente TODAS as escolhas da tela ATUAL (não do wizard inteiro).
   Reaproveita as MESMAS pools/filtros já usados por cada render*Detail()
   (skillsGrantedElsewhere, chosenCantripsElsewhere, chosenSpells1Elsewhere,
   speciesGrantedCantrips/Spells etc.) — nunca é sorteado algo que a UI não
   deixaria o jogador escolher manualmente (perícia/truque/magia duplicada
   entre fontes, por exemplo). Sempre faz um reroll completo do passo
   (zera os campos daquele passo antes de sortear de novo), não só preenche
   o que estiver vazio — clicar de novo sorteia tudo de novo. Não aparece
   na Loja (passo 9) nem no Resumo (passo 10): nenhum dos dois tem campo
   obrigatório (findFirstMissingGroup() sempre null ali), então não haveria
   o que randomizar. */
function randPick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function randPickN(arr, n){
  const pool = [...arr];
  const out = [];
  while(out.length<n && pool.length){
    out.push(pool.splice(Math.floor(Math.random()*pool.length), 1)[0]);
  }
  return out;
}

function randomizeCurrentStep(){
  switch(step){
    case 0: data.classe = randPick(ENABLED_CLASSES); break;
    case 1: randomizeClassDetail(); break;
    case 2: data.antecedente = randPick(ENABLED_BACKGROUNDS); break;
    case 3: randomizeBackgroundDetail(); break;
    case 4: data.especie = randPick(ENABLED_SPECIES); break;
    case 5: randomizeSpeciesDetail(); break;
    case 6: randomizeIdiomasStep(); break;
    case 7: randomizeAttrsStep(); break;
    case 8: data.alinhamento = randPick(ALIGNMENTS); break;
    default: return;
  }
  persist();
  render();
}

function randomizeClassDetail(){
  const already = skillsGrantedElsewhere('classe');
  const alreadyCantrips = chosenCantripsElsewhere('classe');
  const alreadySpells1 = chosenSpells1Elsewhere('classe');
  const speciesCantrips = speciesGrantedCantrips();
  const speciesSpells = speciesGrantedSpells();

  if(data.classe==='Bárbaro'){
    const bb = data.barbaro;
    bb.skills = randPickN(BARBARO.skills.filter(s=>!already.includes(s)), 2);
    bb.maestria = randPickN(Object.keys(WEAPON_MASTERY).filter(n=>WEAPON_MASTERY[n].tipo==='Corpo a Corpo'), BARBARO.maestriaCount);
    bb.equipment = randPick(['A','B']);
  } else if(data.classe==='Bardo'){
    const bd = data.bardo;
    bd.skills = randPickN(ALL_SKILLS.filter(s=>!already.includes(s)), BARDO.skillsCount);
    bd.instruments = randPickN(ALL_INSTRUMENTS, BARDO.toolsCount);
    bd.cantrips = randPickN(BARDO.cantrips.filter(c=>!speciesCantrips.includes(c) && !alreadyCantrips.includes(c)), 2);
    bd.spells1 = randPickN(BARDO.spells1.filter(s=>!speciesSpells.includes(s) && !alreadySpells1.includes(s)), 4);
    bd.equipment = randPick(['A','B']);
  } else if(data.classe==='Mago'){
    const mg = data.mago;
    mg.skills = randPickN(MAGO.skills.filter(s=>!already.includes(s)), 2);
    mg.cantrips = randPickN(MAGO.cantrips.filter(c=>!speciesCantrips.includes(c) && !alreadyCantrips.includes(c)), MAGO.cantripsCount);
    mg.spellbook = randPickN(MAGO.spells1.filter(s=>!speciesSpells.includes(s) && !alreadySpells1.includes(s)), MAGO.spellbookCount);
    mg.prepared = randPickN(mg.spellbook, MAGO.preparedCount);
    mg.equipment = randPick(['A','B']);
  } else if(data.classe==='Paladino'){
    const pl = data.paladino;
    pl.skills = randPickN(PALADINO.skills.filter(s=>!already.includes(s)), 2);
    pl.prepared = randPickN(PALADINO.spells1.filter(s=>!speciesSpells.includes(s) && !alreadySpells1.includes(s)), PALADINO.preparedCount);
    pl.maestria = randPickN(Object.keys(WEAPON_MASTERY), PALADINO.maestriaCount);
    pl.equipment = randPick(['A','B']);
  } else if(data.classe==='Psiônico'){
    const ps = data.psionico;
    ps.skills = randPickN(PSIONICO.skills.filter(s=>!already.includes(s)), 2);
    ps.cantrips = randPickN(PSIONICO.cantrips.filter(c=>!speciesCantrips.includes(c) && !alreadyCantrips.includes(c)), PSIONICO.cantripsCount);
    ps.spells1 = randPickN(PSIONICO.spells1.filter(s=>!speciesSpells.includes(s) && !alreadySpells1.includes(s)), PSIONICO.preparedCount);
    ps.equipment = randPick(['A','B']);
  } else if(data.classe==='Clérigo'){
    const cl = data.clerigo;
    cl.skills = randPickN(CLERIGO.skills.filter(s=>!already.includes(s)), 2);
    cl.ordem = randPick(Object.keys(CLERIGO.ordemDivina));
    const cantripsMax = clerigoEffectiveCantripsCount();
    cl.cantrips = randPickN(CLERIGO.cantrips.filter(c=>!speciesCantrips.includes(c) && !alreadyCantrips.includes(c)), cantripsMax);
    cl.spells1 = randPickN(CLERIGO.spells1.filter(s=>!speciesSpells.includes(s) && !alreadySpells1.includes(s)), CLERIGO.preparedCount);
    cl.equipment = randPick(['A','B']);
  } else if(data.classe==='Guerreiro'){
    const gr = data.guerreiro;
    gr.skills = randPickN(GUERREIRO.skills.filter(s=>!already.includes(s)), 2);
    gr.estilo = randPick(Object.keys(GUERREIRO.estiloDeLuta));
    gr.maestria = randPickN(Object.keys(WEAPON_MASTERY), GUERREIRO.maestriaCount);
    gr.equipment = randPick(['A','B','C']);
  } else if(data.classe==='Ladino'){
    const ld = data.ladino;
    ld.skills = randPickN(LADINO.skills.filter(s=>!already.includes(s)), LADINO.skillsCount);
    const bgConst = activeBgConst();
    const jaProficiente = [...new Set([...ld.skills, ...bgConst.skills, ...activeBgData().habilidoso])].filter(s=>ALL_SKILLS.includes(s));
    ld.especialista = randPickN(jaProficiente, LADINO.especialistaCount);
    ld.maestria = randPickN(Object.keys(WEAPON_MASTERY).filter(n=>{
      const w = WEAPON_MASTERY[n];
      return w.categoria==='Simples' || w.propriedades.includes('Acuidade') || w.propriedades.includes('Leve');
    }), LADINO.maestriaCount);
    ld.equipment = randPick(['A','B']);
  } else if(data.classe==='Druida'){
    const dr = data.druida;
    dr.skills = randPickN(DRUIDA.skills.filter(s=>!already.includes(s)), 2);
    dr.ordem = randPick(Object.keys(DRUIDA.ordemPrimal));
    const cantripsMax = druidaEffectiveCantripsCount();
    dr.cantrips = randPickN(DRUIDA.cantrips.filter(c=>!speciesCantrips.includes(c) && !alreadyCantrips.includes(c)), cantripsMax);
    dr.spells1 = randPickN(DRUIDA.spells1.filter(s=>s!=='Falar com Animais' && !speciesSpells.includes(s) && !alreadySpells1.includes(s)), DRUIDA.preparedCount);
    dr.equipment = randPick(['A','B']);
  } else if(data.classe==='Feiticeiro'){
    const ft = data.feiticeiro;
    ft.skills = randPickN(FEITICEIRO.skills.filter(s=>!already.includes(s)), 2);
    ft.cantrips = randPickN(FEITICEIRO.cantrips.filter(c=>!speciesCantrips.includes(c) && !alreadyCantrips.includes(c)), FEITICEIRO.cantripsCount);
    ft.spells1 = randPickN(FEITICEIRO.spells1.filter(s=>!speciesSpells.includes(s) && !alreadySpells1.includes(s)), FEITICEIRO.preparedCount);
    ft.equipment = randPick(['A','B']);
  } else if(data.classe==='Monge'){
    const mk = data.monge;
    mk.skills = randPickN(MONGE.skills.filter(s=>!already.includes(s)), 2);
    mk.toolCategory = randPick(MONGE.toolCategories);
    mk.toolChoice = randPick(mk.toolCategory==='Instrumento Musical' ? ALL_INSTRUMENTS : ALL_ARTISAN_TOOLS);
    mk.equipment = randPick(['A','B']);
  } else if(data.classe==='Guardião'){
    const gd = data.guardiao;
    gd.skills = randPickN(GUARDIAO.skills.filter(s=>!already.includes(s)), GUARDIAO.skillsCount);
    gd.spells1 = randPickN(GUARDIAO.spells1.filter(s=>s!=='Marca do Predador' && !speciesSpells.includes(s) && !alreadySpells1.includes(s)), GUARDIAO.preparedCount);
    gd.maestria = randPickN(Object.keys(WEAPON_MASTERY), GUARDIAO.maestriaCount);
    gd.equipment = randPick(['A','B']);
  } else {
    const b = data.bruxo;
    b.skills = randPickN(BRUXO.skills.filter(s=>!already.includes(s)), 2);
    b.pactBoon = randPick(Object.keys(BRUXO.pactBoons));
    b.cantrips = randPickN(BRUXO.cantrips.filter(c=>!speciesCantrips.includes(c) && !alreadyCantrips.includes(c)), 2);
    b.tomoCantrips = b.pactBoon==='Pacto do Tomo' ? randPickN(ALL_CANTRIPS.filter(c=>!b.cantrips.includes(c) && !speciesCantrips.includes(c) && !alreadyCantrips.includes(c)), 3) : [];
    b.spells1 = randPickN(BRUXO.spells1.filter(s=>!speciesSpells.includes(s) && !alreadySpells1.includes(s)), 2);
    b.tomoRituals = b.pactBoon==='Pacto do Tomo' ? randPickN(ALL_1ST_RITUAL.filter(r=>!b.spells1.includes(r) && !speciesSpells.includes(r) && !alreadySpells1.includes(r)), 2) : [];
    b.equipment = randPick(['A','B']);
  }
}

function randomizeBackgroundDetail(){
  const bgConst = activeBgConst();
  const bg = activeBgData();
  const allowed = allowedAbilitiesFor(bgConst);
  const planType = randPick(['2-1','1-1-1']);
  if(planType==='2-1'){
    const [plus2, plus1] = randPickN(allowed, 2);
    bg.abilityPlan = {type:'2-1', plus2, plus1};
  } else {
    bg.abilityPlan = {type:'1-1-1', plusOnes: randPickN(allowed, 3)};
  }
  if(bgConst.ferramentaOpcoes) bg.ferramentaEscolhida = randPick(bgConst.ferramentaOpcoes);
  if(bgConst.iniciadoEmMagia){
    bg.iniciadoCantrips = randPickN(bgConst.iniciadoEmMagia.cantrips.filter(c=>!speciesGrantedCantrips().includes(c) && !chosenCantripsElsewhere('iniciadoEmMagia').includes(c)), 2);
    bg.iniciadoSpell1 = randPickN(bgConst.iniciadoEmMagia.spells1.filter(s=>!speciesGrantedSpells().includes(s) && !chosenSpells1Elsewhere('iniciadoEmMagia').includes(s)), 1);
  }
  if(bgConst.feat.startsWith('Habilidoso')){
    const excludedTool = bgConst.ferramentaOpcoes ? (bg.ferramentaEscolhida || bgConst.ferramentaCategoria) : bgConst.tool;
    const pool = [...ALL_SKILLS.filter(s=>!skillsGrantedElsewhere('habilidoso').includes(s)), ...ALL_TOOLS.filter(t=>t!==excludedTool)];
    bg.habilidoso = randPickN(pool, 3);
  }
  bg.equipment = randPick(['A','B']);
}

function randomizeSpeciesDetail(){
  if(data.especie==='Pequenino' || data.especie==='Anão' || data.especie==='Orc') return;
  if(data.especie==='Humano'){
    const h = data.humano;
    h.tamanho = randPick(HUMANO.tamanho.opcoes);
    /* Prefere uma perícia que ainda não veio de outro lugar; se a classe
       e o antecedente já cobriram TODAS as opções (esvaziando o pool),
       cai pro pool completo em vez de sortear undefined e travar o
       wizard — mesma lógica de "não deixa a escolha ficar impossível"
       usada na UI (groupedSinglePick). */
    const hPericiaPool = ALL_SKILLS.filter(s=>!skillsGrantedElsewhere('humano').includes(s));
    h.pericia = randPick(hPericiaPool.length ? hPericiaPool : ALL_SKILLS);
    const talentosOrigem = Object.keys(FEAT_DETAILS).filter(n=>FEAT_DETAILS[n].categoria==='Origem' && n!==backgroundFeatBaseName());
    const talentosSelvagens = Object.keys(FEAT_DETAILS).filter(n=>FEAT_DETAILS[n].categoria==='Talento Selvagem' && n!==backgroundFeatBaseName());
    h.talento = randPick([...talentosOrigem, ...talentosSelvagens]);
  } else if(data.especie==='Draconato'){
    data.draconato.heranca = randPick(DRACONATO.subespecie.opcoes.map(o=>o.nome));
  } else if(data.especie==='Elfo'){
    const e = data.elfo;
    /* Mesmo fallback do Hábil do Humano acima — evita sortear undefined
       (e travar o wizard) quando as 3 opções de Sentidos Aguçados já
       vieram todas de classe/antecedente. */
    const ePericiaPool = ELFO.sentidosAgucados.opcoes.filter(s=>!skillsGrantedElsewhere('elfo').includes(s));
    e.pericia = randPick(ePericiaPool.length ? ePericiaPool : ELFO.sentidosAgucados.opcoes);
    e.linhagem = randPick(ELFO.subespecie.opcoes.map(o=>o.nome));
  } else if(data.especie==='Gnomo'){
    data.gnomo.linhagem = randPick(GNOMO.subespecie.opcoes.map(o=>o.nome));
    data.gnomo.atributoLinhagem = randPick(['Inteligência','Sabedoria','Carisma']);
  } else if(data.especie==='Golias'){
    data.golias.ancestralidade = randPick(GOLIAS.subespecie.opcoes.map(o=>o.nome));
  } else if(data.especie==='Aasimar'){
    data.aasimar.tamanho = randPick(AASIMAR.tamanho.opcoes);
  } else {
    const t = data.tiefling;
    t.tamanho = randPick(TIEFLING.tamanho.opcoes);
    t.legado = randPick(TIEFLING.subespecie.opcoes.map(o=>o.nome));
    t.atributoLegado = randPick(['Inteligência','Sabedoria','Carisma']);
  }
}

function randomizeIdiomasStep(){
  const id = data.idiomas;
  id.comuns = randPickN(choosableLanguages(), 2);
  if(data.classe==='Ladino'){
    id.extra = randPickN(choosableLanguages().filter(l => !id.comuns.includes(l)), 1);
  } else {
    id.extra = [];
  }
}

function randomizeAttrsStep(){
  const shuffled = randPickN(STANDARD_ARRAY, STANDARD_ARRAY.length);
  data.attrs = {};
  ABILITIES.forEach((a,i)=>{ data.attrs[a] = shuffled[i]; });
}

function render(){
  renderProgress();
  const c = document.getElementById('cardContent');
  let html = '';
  if(step===0) html = renderClassStep();
  else if(step===1) html = (data.classe==='Bárbaro') ? renderBarbaroDetail() : (data.classe==='Bardo') ? renderBardoDetail() : (data.classe==='Mago') ? renderMagoDetail() : (data.classe==='Paladino') ? renderPaladinoDetail() : (data.classe==='Psiônico') ? renderPsionicoDetail() : (data.classe==='Clérigo') ? renderClerigoDetail() : (data.classe==='Guerreiro') ? renderGuerreiroDetail() : (data.classe==='Ladino') ? renderLadinoDetail() : (data.classe==='Druida') ? renderDruidaDetail() : (data.classe==='Feiticeiro') ? renderFeiticeiroDetail() : (data.classe==='Monge') ? renderMongeDetail() : (data.classe==='Guardião') ? renderGuardiaoDetail() : renderBruxoDetail();
  else if(step===2) html = renderBackgroundStep();
  else if(step===3) html = renderSimpleBackgroundDetail(activeBgConst());
  else if(step===4) html = renderSpeciesStep();
  else if(step===5) html = (data.especie==='Pequenino') ? renderPequeninoDetail() : (data.especie==='Anão') ? renderAnaoDetail() : (data.especie==='Orc') ? renderOrcDetail() : (data.especie==='Humano') ? renderHumanoDetail() : (data.especie==='Draconato') ? renderDraconatoDetail() : (data.especie==='Elfo') ? renderElfoDetail() : (data.especie==='Gnomo') ? renderGnomoDetail() : (data.especie==='Golias') ? renderGoliasDetail() : (data.especie==='Aasimar') ? renderAasimarDetail() : renderTieflingDetail();
  else if(step===6) html = renderIdiomasStep();
  else if(step===7) html = renderAttrs();
  else if(step===8) html = renderAlinhamentoStep();
  else if(step===9) html = renderShop();
  else if(step===10) html = renderSummary();
  else if(step===11) html = renderMestreIAExport();
  c.innerHTML = html + (step<11 ? renderPericiasTalentosFloater() + renderMagiasFloater() + renderMochilaFloater() + renderRandomizarFloater() : '') + renderSpellInfoPopup();
  attachStepHandlers();
  positionRightFloaters();
  positionRandomizarFloater();
  positionNav();
}

/* Reserva embaixo do <body> exatamente a altura real da barra .nav —
   ela pode ter 1 linha (Voltar/Avançar) ou 2 (+ "Voltar ao Resumo" em
   cima, só durante edição vinda do Resumo), então um padding-bottom
   fixo no CSS erra pra um dos dois casos. Mesma ideia de
   positionRightFloaters()/positionRandomizarFloater() pro header. */
function positionNav(){
  const nav = document.querySelector('.nav');
  if(!nav) return;
  document.body.style.paddingBottom = (nav.offsetHeight + 20) + 'px';
}
window.addEventListener('resize', positionNav);

