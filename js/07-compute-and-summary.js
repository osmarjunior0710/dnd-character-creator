/* 07-compute-and-summary.js — Cálculo do personagem final (CA, perícias, salvaguardas, ataques, conjuração, checagem de duplicidade) e a tela de Resumo (computeCharacterSheet/renderSummary + popups de detalhe ⓘ).
   Extraído de index.html (linhas 3523-4249 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
function ownedItemIdSet(){
  const set = new Set();
  characterStartingItems().forEach(it=>{ if(it.id) set.add(it.id); });
  Object.entries(data.shop.purchases||{}).forEach(([id,q])=>{ if(q>0) set.add(id); });
  return set;
}

/* Armadura de maior CA que o personagem possui (entre as que tem) +
   se possui Escudo. Cobre tanto quem ganhou armadura fixa na Opção A
   quanto quem escolheu só ouro e comprou na Loja. */
function ownedArmorAndShield(){
  let bestArmor = null;
  let hasShield = false;
  ownedItemIdSet().forEach(id=>{
    if(id===SHIELD_ITEM_ID){ hasShield = true; return; }
    const armor = ARMOR_AC[id];
    if(armor && (!bestArmor || armor.ca > bestArmor.ca)) bestArmor = {id, ...armor};
  });
  return {armor: bestArmor, hasShield};
}

/* CA de verdade — resolve a pendência antiga "CA não calculada
   automaticamente" (Paladino/Clérigo/Guerreiro/Druida/Guardião), que
   antes só mostrava um texto explicando que dependia da armadura.
   Bárbaro/Monge usam a fórmula de Defesa sem Armadura SE não tiverem
   nenhuma armadura de verdade em posse (RAW: perdem o traço se vestirem
   armadura) — Escudo continua somando +2 em cima de qualquer caso, EXCETO
   pro Monge, que perde a Defesa sem Armadura ao empunhar escudo (regra
   exige "sem armadura E sem escudo") e cai no padrão 10+Destreza+2 de
   escudo, igual qualquer outra classe. Bárbaro não tem essa exceção: pode
   usar escudo e manter a fórmula com Constituição. */
function computeAC(classe, dexMod, conMod, wisMod){
  const {armor, hasShield} = ownedArmorAndShield();
  let base, source;
  const breakdown = [];
  if(armor){
    const dexBonus = armor.dexCap===null ? dexMod : armor.dexCap===0 ? 0 : Math.min(dexMod, armor.dexCap);
    base = armor.ca + dexBonus;
    source = findShopItem(armor.id).n;
    breakdown.push({label: source, value: armor.ca, plain:true});
    breakdown.push({label: armor.dexCap===0 ? 'Mod. de Destreza (armadura pesada, não soma)' : armor.dexCap!==null ? `Mod. de Destreza (máx. +${armor.dexCap})` : 'Mod. de Destreza', value: dexBonus});
  } else if(classe==='Bárbaro'){
    base = 10 + dexMod + conMod;
    source = 'Defesa sem Armadura (Bárbaro)';
    breakdown.push({label:'Base sem armadura', value:10, plain:true});
    breakdown.push({label:'Mod. de Destreza', value: dexMod});
    breakdown.push({label:'Mod. de Constituição', value: conMod});
  } else if(classe==='Monge' && !hasShield){
    base = 10 + dexMod + wisMod;
    source = 'Defesa sem Armadura (Monge)';
    breakdown.push({label:'Base sem armadura', value:10, plain:true});
    breakdown.push({label:'Mod. de Destreza', value: dexMod});
    breakdown.push({label:'Mod. de Sabedoria', value: wisMod});
  } else {
    base = 10 + dexMod;
    source = 'Sem armadura';
    breakdown.push({label:'Base sem armadura', value:10, plain:true});
    breakdown.push({label:'Mod. de Destreza', value: dexMod});
  }
  if(hasShield){
    base += 2;
    source += ' + Escudo';
    breakdown.push({label:'Escudo (comprado na Loja)', value:2});
  }
  return {value: base, source, breakdown};
}

/* Perícias proficientes (Set, nunca duplicado mesmo se 2+ fontes derem a
   mesma) + Especialista do Ladino (proficiência dobrada) — reusa
   skillsGrantedBySource() (já existia pro sistema de deduplicação de
   escolhas) em vez de montar a lista nas mãos de novo. */
/* Cada perícia/salvaguarda/atributo carrega um "breakdown" (lista de
   {label, value}) além do bônus final — é a fonte de dados do popup de
   detalhe (ⓘ) do Resumo, pedido do usuário pra mostrar de onde vem cada
   número em vez de só o total. Especialista do Ladino (única fonte de
   proficiência dobrada em nível 1 — nenhuma classe/espécie mais tem isso
   nesse nível) aparece como uma linha só, já com o valor dobrado, em vez
   de duas linhas de +prof cada, pra não confundir com 2 proficiências
   diferentes. */
function computeSkills(finalScore, prof){
  const bySource = skillsGrantedBySource();
  const proficient = new Set([].concat(...Object.values(bySource)));
  const expertise = new Set(data.classe==='Ladino' ? data.ladino.especialista : []);
  return ALL_SKILLS.map(skill=>{
    const ability = SKILL_ABILITY[skill];
    const abMod = mod(finalScore(ability));
    const isProf = proficient.has(skill);
    const isExpert = expertise.has(skill);
    const profBonus = isExpert ? prof*2 : isProf ? prof : 0;
    const bonus = abMod + profBonus;
    const breakdown = [{label:`Mod. de ${ability}`, value: abMod}];
    if(isExpert) breakdown.push({label:'Proficiência (Especialista — dobrada)', value: profBonus});
    else if(isProf) breakdown.push({label:'Proficiência', value: profBonus});
    else breakdown.push({label:'Sem proficiência', value: 0});
    return {skill, ability, proficient:isProf, expertise:isExpert, bonus, breakdown};
  });
}

function computeSavingThrows(clsConst, finalScore, prof){
  return ABILITIES.map(a=>{
    const abMod = mod(finalScore(a));
    const isProf = (clsConst.savingThrows||[]).includes(a);
    const profBonus = isProf ? prof : 0;
    const breakdown = [
      {label:`Mod. de ${a}`, value: abMod},
      isProf ? {label:'Proficiência', value: profBonus} : {label:'Sem proficiência', value: 0}
    ];
    return {ability:a, proficient:isProf, bonus: abMod + profBonus, breakdown};
  });
}

/* Proficiência de arma checando TUDO: categoria (Simples/Marcial contra
   weaponProf), e a restrição fina por propriedade/tipo quando a classe
   tiver (Ladino/Monge — mesmos campos weaponProfFiltroMarcial/
   weaponProfMeleeOnly já usados no filtro opcional da Loja,
   itemMatchesWeaponProf() reaproveitada daqui). */
function isProficientWithWeapon(clsConst, itemName){
  const wm = WEAPON_MASTERY[itemName];
  if(!wm) return false;
  const catKey = wm.categoria==='Simples' ? 'simples' : 'marcial';
  if(!clsConst.weaponProf.includes(catKey)) return false;
  return itemMatchesWeaponProf(clsConst, itemName);
}

/* Bônus de ataque com UMA arma específica (por nome, bate com
   WEAPON_MASTERY) — Acuidade usa o melhor entre Força/Destreza, senão
   Força se Corpo a Corpo ou Destreza se À Distância. Extraído de
   computeAttacks() pra ser reaproveitado também na Loja (preview do
   Mod. de Ataque ANTES de comprar, ver renderShop()) — mesma fórmula,
   só que sem exigir posse do item. Devolve null se o nome não bater com
   nenhuma arma de WEAPON_MASTERY (itens não-arma da Loja). */
function weaponAttackBonus(clsConst, strMod, dexMod, prof, itemName){
  const wm = WEAPON_MASTERY[itemName];
  if(!wm) return null;
  const finesse = wm.propriedades.includes('Acuidade');
  const abMod = finesse ? Math.max(strMod, dexMod) : (wm.tipo==='Corpo a Corpo' ? strMod : dexMod);
  const proficient = isProficientWithWeapon(clsConst, itemName);
  const bonus = abMod + (proficient ? prof : 0);
  return {tipo: wm.tipo, abMod, bonus, proficient};
}

/* Uma linha de "Ataque" por arma realmente possuída (herdada ou
   comprada) que bate com WEAPON_MASTERY. Mostra TODAS as armas
   possuídas, marcando quando não há proficiência (em vez de esconder —
   o jogador decide se usa mesmo assim, com desvantagem/sem o bônus). */
function computeAttacks(clsConst, strMod, dexMod, prof){
  const attacks = [];
  ownedItemIdSet().forEach(id=>{
    const item = findShopItem(id);
    if(!item) return;
    const atk = weaponAttackBonus(clsConst, strMod, dexMod, prof, item.n);
    if(!atk) return;
    attacks.push({nome: item.n, tipo: atk.tipo, bonus: atk.bonus, dano: `${item.d}${atk.abMod!==0?' '+fmt(atk.abMod):''}`, proficient: atk.proficient});
  });
  return attacks.sort((a,b)=>b.bonus-a.bonus);
}

const spellEntry = n => ({nome:n, detalhe: SPELL_DETAILS[n]||null});

/* Conjuração — null se a classe não conjurar (Bárbaro/Guerreiro/Ladino/
   Monge). Junta truques/magias de CADA campo específico por classe
   (cantrips/spells1/prepared/spellbook/tomoCantrips/tomoRituals — os
   mesmos nomes de campo já usados em classFeatureBlock) + concessão
   fixa da PRÓPRIA classe (Falar com Animais do Druida, Marca do
   Predador do Guardião — sempre casters, sem risco de sumir da ficha).
   NÃO inclui concessão fixa de ESPÉCIE aqui — isso é
   speciesGrantedSpellsEntries() à parte (ver abaixo), porque uma
   espécie pode conceder truque/magia pra QUALQUER classe, inclusive
   não-conjuradora (ex: Bárbaro Tiferino) — se ficasse só aqui dentro,
   sumiria da ficha de quem não conjura. Cada truque/magia vem com o
   detalhe completo de SPELL_DETAILS (tempo, alcance, componentes,
   duração, efeito, escalonamento) — é o pedido central desta tela: "a
   pessoa precisa saber o que a magia faz". */
function computeSpellcasting(cls, finalScore, prof){
  const ability = CLASS_SPELL_ABILITY[data.classe];
  if(!ability) return null;
  const abMod = mod(finalScore(ability));
  let cantripNames = [], spellNames = [];
  switch(data.classe){
    case 'Bruxo':
      cantripNames = [...cls.cantrips, ...cls.tomoCantrips];
      spellNames = [...cls.spells1, ...cls.tomoRituals];
      break;
    case 'Mago':
      cantripNames = [...cls.cantrips];
      spellNames = [...cls.prepared];
      break;
    case 'Paladino':
      spellNames = [...cls.prepared];
      break;
    case 'Guardião':
      spellNames = [...cls.spells1, 'Marca do Predador'];
      break;
    case 'Druida':
      cantripNames = [...cls.cantrips];
      spellNames = [...cls.spells1, 'Falar com Animais'];
      break;
    default: // Bardo, Psiônico, Clérigo, Feiticeiro
      cantripNames = [...cls.cantrips];
      spellNames = [...cls.spells1];
  }
  const cdBreakdown = [
    {label:'Base', value:8, plain:true},
    {label:'Bônus de Proficiência', value: prof},
    {label:`Mod. de ${ability}`, value: abMod}
  ];
  const ataqueBreakdown = [
    {label:'Bônus de Proficiência', value: prof},
    {label:`Mod. de ${ability}`, value: abMod}
  ];
  return {
    classe: data.classe,
    habilidade: ability,
    cd: 8 + prof + abMod, cdBreakdown,
    ataque: prof + abMod, ataqueBreakdown,
    cantrips: [...new Set(cantripNames)].map(spellEntry),
    magias: [...new Set(spellNames)].map(spellEntry)
  };
}

/* Truque/magia que a ESPÉCIE concede de graça (ex: Legado Ínfero do
   Tiferino) — separado de computeSpellcasting() de propósito, pra
   aparecer na ficha mesmo em classes que não conjuram (ex: Bárbaro
   Tiferino não some com o truque grátis só porque Bárbaro não tem
   seção de Conjuração). */
function speciesGrantedSpellEntries(){
  return [...speciesGrantedCantrips(), ...speciesGrantedSpells()].map(spellEntry);
}

/* Traços extras que vêm de uma escolha de subespécie/herança e por isso NÃO
   estão em especieConst.tracosFixos (que só tem o que é automático pra
   qualquer personagem da espécie, sem depender de escolha nenhuma) — ex:
   resistência a dano do Legado do Tiferino, o texto completo da Linhagem
   Élfica/Gnômica (que tem efeito além do truque/magia já listado em
   "Concedido pela Espécie"), o tipo de dano da Herança Dracônica, a
   Ancestralidade Gigante do Golias. Cada affix retorna {nome, resumo} pra
   reaproveitar o mesmo layout de traitBox usado nas telas de escolha.
   Achado como pendência ao montar o Resumo: essas escolhas do passo 5
   (detalhe de espécie) não apareciam em NENHUM lugar da ficha final. */
function speciesChoiceTraits(){
  const out = [];
  if(data.especie==='Tiferino' && data.tiefling.legado){
    const opt = TIEFLING.subespecie.opcoes.find(o=>o.nome===data.tiefling.legado);
    if(opt && opt.nivel1 && opt.nivel1.resumo) out.push({nome:`Legado Ínfero: ${opt.nome}`, resumo:opt.nivel1.resumo});
  }
  if(data.especie==='Draconato' && data.draconato.heranca){
    const opt = DRACONATO.subespecie.opcoes.find(o=>o.nome===data.draconato.heranca);
    if(opt) out.push({nome:`Herança Dracônica: ${opt.nome}`, resumo:`Seu Ataque de Sopro e sua Resistência a Dano usam dano do tipo ${opt.tipoDano}.`});
  }
  if(data.especie==='Elfo' && data.elfo.linhagem){
    const opt = ELFO.subespecie.opcoes.find(o=>o.nome===data.elfo.linhagem);
    if(opt && opt.nivel1 && opt.nivel1.resumo) out.push({nome:`Linhagem Élfica: ${opt.nome}`, resumo:opt.nivel1.resumo});
  }
  if(data.especie==='Gnomo' && data.gnomo.linhagem){
    const opt = GNOMO.subespecie.opcoes.find(o=>o.nome===data.gnomo.linhagem);
    if(opt && opt.nivel1 && opt.nivel1.resumo) out.push({nome:`Linhagem Gnômica: ${opt.nome}`, resumo:opt.nivel1.resumo});
  }
  if(data.especie==='Golias' && data.golias.ancestralidade){
    const opt = GOLIAS.subespecie.opcoes.find(o=>o.nome===data.golias.ancestralidade);
    if(opt && opt.nivel1 && opt.nivel1.resumo) out.push({nome:`Ancestralidade Gigante: ${opt.nome}`, resumo:opt.nivel1.resumo});
  }
  return out;
}

/* Deslocamento base da espécie ajustado pela subespécie — hoje o único
   caso que muda o número no nível 1 é o Elfo Silvestre (9m -> 10,5m); as
   demais escolhas de subespécie só afetam texto de traço ou magia. */
function resolvedDeslocamento(){
  if(data.especie==='Elfo' && data.elfo.linhagem==='Elfo Silvestre') return '10,5 metros';
  return SPECIES_CONST[data.especie].deslocamento;
}

/* Ferramentas/kits com proficiência — de todas as fontes possíveis
   (classe, Bardo/Monge, antecedente fixo ou por escolha, Habilidoso
   dentro do antecedente). bg.habilidoso pode ter perícia OU ferramenta
   misturado (é uma escolha "3 perícias OU ferramentas") — !ALL_SKILLS.
   includes() separa qual é qual. */
function computeToolProficiencies(clsConst, bgConst, bg){
  const tools = [];
  if(clsConst.toolsFixed) tools.push(clsConst.toolsFixed);
  if(data.classe==='Bardo') tools.push(...data.bardo.instruments);
  if(data.classe==='Monge' && data.monge.toolChoice) tools.push(data.monge.toolChoice);
  if(bgConst.ferramentaOpcoes){ if(bg.ferramentaEscolhida) tools.push(bg.ferramentaEscolhida); }
  else if(bgConst.tool) tools.push(bgConst.tool);
  (bg.habilidoso||[]).forEach(x=>{ if(!ALL_SKILLS.includes(x)) tools.push(x); });
  return [...new Set(tools)];
}

/* Checagem de duplicidade pro aviso no Resumo — as telas de escolha já
   filtram a maioria das colisões em tempo real (ex: spellChoiceList()
   tirando da lista o que a espécie já concede de graça), mas isso só
   evita ESCOLHER de novo; não limpa uma escolha que já existia se o
   jogador voltar e trocar espécie/antecedente/legado depois (só o Bruxo
   trocando de Legado tem essa limpeza, em pickLegado()). Esta função
   comprova o estado final inteiro, pegando qualquer coisa (perícia,
   ferramenta, magia/truque ou talento) que apareça em mais de uma fonte
   ao mesmo tempo, não importa como chegou lá. */
const DUP_SOURCE_LABEL = {
  classe: 'Classe',
  antecedenteFixo: 'Antecedente',
  habilidoso: 'Antecedente (Habilidoso)',
  humano: 'Traço de Espécie (Humano)',
  elfo: 'Traço de Espécie (Elfo)',
  antecedenteIniciado: 'Antecedente (Iniciado em Magia)',
  especie: 'Espécie',
  humanoTalento: 'Talento Versátil (Humano)'
};

function mapDuplicatesBySource(bySource){
  const nameToSources = {};
  Object.keys(bySource).forEach(src=>{
    (bySource[src]||[]).forEach(name=>{
      if(!name) return;
      if(!nameToSources[name]) nameToSources[name] = new Set();
      nameToSources[name].add(DUP_SOURCE_LABEL[src] || src);
    });
  });
  return Object.keys(nameToSources).filter(name=>nameToSources[name].size>1)
    .map(name=>({nome:name, fontes:[...nameToSources[name]]}));
}

/* Mesmo switch por classe de computeSpellcasting(), mas devolvendo TODOS
   os nomes escolhidos (sem o new Set() final) — pro Mago usa o Livro de
   Magias inteiro (spellbook), não só o Preparado (prepared é só um
   subconjunto do que já foi escolhido, então checar o livro cobre tudo). */
function classSpellNamesRaw(cls){
  if(!CLASS_SPELL_ABILITY[data.classe]) return [];
  switch(data.classe){
    case 'Bruxo': return [...cls.cantrips, ...cls.tomoCantrips, ...cls.spells1, ...cls.tomoRituals];
    case 'Mago': return [...cls.cantrips, ...cls.spellbook];
    case 'Paladino': return [...cls.prepared];
    case 'Guardião': return [...cls.spells1, 'Marca do Predador'];
    case 'Druida': return [...cls.cantrips, ...cls.spells1, 'Falar com Animais'];
    default: return [...cls.cantrips, ...cls.spells1];
  }
}

function detectDuplicidades(sheet){
  const pericias = mapDuplicatesBySource(skillsGrantedBySource())
    .map(d=>({...d, tipo:'Perícia'}));
  const ferramentas = mapDuplicatesBySource({
    classe: (sheet.clsConst.toolsFixed ? [sheet.clsConst.toolsFixed] : []).concat(data.classe==='Bardo' ? data.bardo.instruments : []).concat(data.classe==='Monge' && data.monge.toolChoice ? [data.monge.toolChoice] : []),
    antecedenteFixo: sheet.bgConst.ferramentaOpcoes ? (sheet.bg.ferramentaEscolhida ? [sheet.bg.ferramentaEscolhida] : []) : (sheet.bgConst.tool ? [sheet.bgConst.tool] : []),
    habilidoso: (sheet.bg.habilidoso||[]).filter(x=>!ALL_SKILLS.includes(x))
  }).map(d=>({...d, tipo:'Ferramenta'}));
  const magias = mapDuplicatesBySource({
    classe: classSpellNamesRaw(sheet.cls),
    antecedenteIniciado: [...(sheet.bg.iniciadoCantrips||[]), ...(sheet.bg.iniciadoSpell1||[])],
    especie: [...speciesGrantedCantrips(), ...speciesGrantedSpells()]
  }).map(d=>({...d, tipo:'Magia/Truque'}));
  const talentos = (data.especie==='Humano' && data.humano.talento && data.humano.talento===backgroundFeatBaseName())
    ? [{nome:data.humano.talento, fontes:[DUP_SOURCE_LABEL.antecedenteFixo, DUP_SOURCE_LABEL.humanoTalento], tipo:'Talento'}]
    : [];
  return [...pericias, ...ferramentas, ...magias, ...talentos];
}

function renderDuplicidadesBox(dups){
  if(!dups.length) return '';
  return `<div class="dup-warning">
    <div class="dup-warning-title">⚠️ Duplicidade ⚠️</div>
    <div class="dup-warning-intro">O que está abaixo foi adquirido em mais de um lugar — a repetição não soma benefício extra, considere trocar uma das escolhas.</div>
    ${dups.map(d=>`<div class="dup-warning-item"><b>${d.nome}</b> <span class="dup-warning-tipo">(${d.tipo})</span> — adquirido em ${d.fontes.length} lugares: ${d.fontes.join(', ')}</div>`).join('')}
  </div>`;
}

function computeCharacterSheet(){
  const clsConst = activeClassConst();
  const cls = activeClassData();
  const bgConst = activeBgConst();
  const bg = activeBgData();
  const especieConst = SPECIES_CONST[data.especie];
  const prof = PROF_BONUS_BY_LEVEL[1];
  const finalScore = a => (data.attrs[a]||0) + getBonusFor(a);
  const attrs = ABILITIES.map(a=>{
    const base = data.attrs[a]||0;
    const bgBonus = getBonusFor(a);
    const breakdown = [{label:'Valor Base', value: base, plain:true}];
    if(bgBonus) breakdown.push({label:'Bônus do Antecedente', value: bgBonus});
    return {ability:a, score: base+bgBonus, mod: mod(base+bgBonus), breakdown};
  });
  const modOf = a => mod(finalScore(a));

  const savingThrows = computeSavingThrows(clsConst, finalScore, prof);
  const skills = computeSkills(finalScore, prof);
  const perceptionSkill = skills.find(s=>s.skill==='Percepção');
  const passivePerception = 10 + perceptionSkill.bonus;

  const hitDie = CLASS_HIT_DIE[data.classe];
  const hp = hitDie + modOf('Constituição');
  const hpBreakdown = [
    {label:`Dado de Vida (nível 1, valor máximo — d${hitDie})`, value: hitDie, plain:true},
    {label:'Mod. de Constituição', value: modOf('Constituição')}
  ];
  const ac = computeAC(data.classe, modOf('Destreza'), modOf('Constituição'), modOf('Sabedoria'));
  const initiativeAlerta = hasFeatByName('Alerta');
  const initiative = modOf('Destreza') + (initiativeAlerta ? prof : 0);
  const initiativeBreakdown = [{label:'Mod. de Destreza', value: modOf('Destreza')}];
  if(initiativeAlerta) initiativeBreakdown.push({label:'Bônus de Proficiência (talento Alerta)', value: prof});
  const attacks = computeAttacks(clsConst, modOf('Força'), modOf('Destreza'), prof);
  const spellcasting = computeSpellcasting(cls, finalScore, prof);
  const especieMagias = speciesGrantedSpellEntries();
  const especieTracosExtras = speciesChoiceTraits();
  const humanoTalento = (data.especie==='Humano' && data.humano.talento) ? { nome: data.humano.talento, detalhe: FEAT_DETAILS[data.humano.talento]||null } : null;

  const classFeatureLines = [];
  if(cls.maestria && cls.maestria.length) classFeatureLines.push(`Maestria em Arma: ${cls.maestria.map(m=>`${m} (${WEAPON_MASTERY[m].mastery})`).join(', ')}`);
  if(cls.estilo) classFeatureLines.push(`Estilo de Luta: ${cls.estilo}`);
  if(cls.ordem) classFeatureLines.push(`Ordem: ${cls.ordem}`);
  if(cls.pactBoon) classFeatureLines.push(`Vínculo de Pacto: ${cls.pactBoon}`);
  if(cls.especialista && cls.especialista.length) classFeatureLines.push(`Especialista (proficiência dobrada): ${cls.especialista.join(', ')}`);

  const talentoAntecedente = bgConst.feat.startsWith('Habilidoso')
    ? { tipo:'habilidoso', skills: bg.habilidoso }
    : bgConst.iniciadoEmMagia
    ? { tipo:'iniciado', classe: bgConst.iniciadoEmMagia.classe, entries: [...bg.iniciadoCantrips, ...bg.iniciadoSpell1].map(spellEntry) }
    : { tipo:'texto', texto: bgConst.feat };

  const idiomas = ['Comum', ...data.idiomas.comuns, ...(data.classe==='Ladino' ? ['Gíria dos Ladrões', ...data.idiomas.extra] : [])];
  const tools = computeToolProficiencies(clsConst, bgConst, bg);
  const weaponProfText = clsConst.weaponProf.map(w=>WEAPON_PROF_LABEL[w]).join(', ') || 'Nenhuma';
  const armorProfText = clsConst.armorProf.length ? clsConst.armorProf.map(a=>ARMOR_PROF_LABEL[a]).join(', ') : 'Nenhuma';

  const remaining = startingGold() - spentGold();

  const sheet = {
    identidade: {
      classe: data.classe, nivel: 1, antecedente: data.antecedente, especie: data.especie,
      profBonus: prof
    },
    attrs, savingThrows, skills, passivePerception,
    combate: { hp, hpBreakdown, hitDie: `1d${hitDie}`, ac, initiative, initiativeBreakdown, initiativeAlerta, deslocamento: resolvedDeslocamento(), visaoNoEscuro: especieConst.visaoNoEscuro },
    attacks, spellcasting, especieMagias, especieTracosExtras, humanoTalento,
    classFeatureLines, talentoAntecedente,
    proficiencias: { idiomas, ferramentas: tools, armas: weaponProfText, armaduras: armorProfText },
    equipamento: { itens: mochilaItems(), poRestante: remaining },
    especieConst, clsConst, bgConst, bg, cls
  };
  sheet.duplicidades = detectDuplicidades(sheet);
  return sheet;
}

function setCharacterName(v){ data.characterName = v; persist(); }

/* Linha de estatística com "bolinha" de proficiência (○ nenhuma, ●
   proficiente, ◆ com Especialista/dobrada) + valor com sinal — usada
   tanto pra Salvaguardas quanto Perícias, mesmo formato visual. */
/* infoKey (opcional, "tipo:nome") liga a linha ao popup de detalhe (ⓘ) —
   ver statInfoOpen/openStatInfo() logo abaixo. */
function renderStatRows(rows){
  return `<div class="stat-grid">${rows.map(r=>`<div class="stat-row ${r.marked?'prof':''}"><span class="stat-name">${r.dot} ${r.label}${r.infoKey?`<button class="info-btn-inline" onclick="event.stopPropagation();openStatInfo('${r.infoKey}')" title="Ver de onde vem esse número">ⓘ</button>`:''}</span><span class="stat-bonus">${fmt(r.bonus)}</span></div>`).join('')}</div>`;
}

/* Atributos + Salvaguardas + Perícias agrupados por atributo (como na
   ficha física), em vez de 3 blocos separados — cada atributo mostra sua
   salvaguarda (sempre 1) seguida das perícias que usam ele (0 a 5,
   Constituição nunca tem nenhuma). Pedido do usuário depois de comparar
   com a ficha em papel. */
function renderAttributeGroups(sheet){
  return ABILITIES.map(ability=>{
    const attr = sheet.attrs.find(a=>a.ability===ability);
    const save = sheet.savingThrows.find(s=>s.ability===ability);
    const skillsForAbility = sheet.skills.filter(s=>s.ability===ability);
    const rows = [
      {label:'Salvaguarda', bonus:save.bonus, marked:save.proficient, dot:save.proficient?'●':'○', infoKey:`salvaguarda:${ability}`},
      ...skillsForAbility.map(s=>({label:s.skill, bonus:s.bonus, marked:s.proficient, dot:s.expertise?'◆':s.proficient?'●':'○', infoKey:`pericia:${s.skill}`}))
    ];
    return `<div class="attr-group" style="margin-bottom:14px;">
      <div class="group-label">${ability} ${attr.score} (${fmt(attr.mod)})<button class="info-btn-inline" onclick="event.stopPropagation();openStatInfo('atributo:${ability}')" title="Ver de onde vem esse número">ⓘ</button></div>
      ${renderStatRows(rows)}
    </div>`;
  }).join('');
}

/* Popup de detalhe (ⓘ) — mostra de onde vem o número de um atributo/
   salvaguarda/perícia específico, mesmo padrão visual/interação da
   Mochila (overlay cobrindo a tela, clique fora fecha, "✕" fecha).
   statInfoOpen guarda só a chave "tipo:nome" (estado de UI puro, não
   entra em data/persist() — mesmo padrão de mochilaOpen/
   expandedSpellInfo). Pedido do usuário: "colocar um I que abre um popup
   simples... mostrando de onde vem o valor". */
let statInfoOpen = null;
function openStatInfo(key){ statInfoOpen = (statInfoOpen===key) ? null : key; render(); }
function closeStatInfo(){ statInfoOpen = null; render(); }

function renderStatInfoPopup(sheet){
  if(!statInfoOpen) return '';
  const [tipo, nome] = statInfoOpen.split(':');
  let title, total, totalPlain, breakdown;
  if(tipo==='atributo'){
    const a = sheet.attrs.find(x=>x.ability===nome);
    if(!a) return '';
    title = `${a.ability} — Valor Final`;
    total = a.score; totalPlain = true; breakdown = a.breakdown;
  } else if(tipo==='salvaguarda'){
    const s = sheet.savingThrows.find(x=>x.ability===nome);
    if(!s) return '';
    title = `Salvaguarda de ${s.ability}`;
    total = s.bonus; breakdown = s.breakdown;
  } else if(tipo==='pericia'){
    const s = sheet.skills.find(x=>x.skill===nome);
    if(!s) return '';
    title = s.skill;
    total = s.bonus; breakdown = s.breakdown;
  } else if(tipo==='combate' && nome==='pv'){
    title = 'Pontos de Vida';
    total = sheet.combate.hp; totalPlain = true; breakdown = sheet.combate.hpBreakdown;
  } else if(tipo==='combate' && nome==='ca'){
    title = 'Classe de Armadura';
    total = sheet.combate.ac.value; totalPlain = true; breakdown = sheet.combate.ac.breakdown;
  } else if(tipo==='combate' && nome==='iniciativa'){
    title = 'Iniciativa';
    total = sheet.combate.initiative; breakdown = sheet.combate.initiativeBreakdown;
  } else if(tipo==='conjuracao' && nome==='cd'){
    if(!sheet.spellcasting) return '';
    title = 'CD de Magia';
    total = sheet.spellcasting.cd; totalPlain = true; breakdown = sheet.spellcasting.cdBreakdown;
  } else if(tipo==='conjuracao' && nome==='ataque'){
    if(!sheet.spellcasting) return '';
    title = 'Ataque Mágico';
    total = sheet.spellcasting.ataque; breakdown = sheet.spellcasting.ataqueBreakdown;
  } else return '';
  return `<div class="mochila-overlay" onclick="closeStatInfo()">
    <div class="mochila-popup stat-info-popup" onclick="event.stopPropagation()">
      <div class="mochila-popup-header">
        <h3>${title}</h3>
        <button class="btn small" onclick="closeStatInfo()">✕</button>
      </div>
      <div class="stat-grid">${breakdown.map(b=>`<div class="stat-row"><span class="stat-name">${b.label}</span><span class="stat-bonus">${b.plain?b.value:fmt(b.value)}</span></div>`).join('')}</div>
      <div class="stat-row prof" style="margin-top:6px;border-top:1px solid var(--line);padding-top:8px;"><span class="stat-name"><b>Total</b></span><span class="stat-bonus">${totalPlain?total:fmt(total)}</span></div>
    </div>
  </div>`;
}

/* Truque/magia sempre expandido (não é a lista de ESCOLHA — aqui é só
   exibição da ficha final, sem toggle) — reaproveita renderSpellDetailCard
   já usado no botão "ⓘ" das telas de escolha. */
function renderSpellEntryList(entries){
  if(!entries.length) return '<span style="color:var(--parchment-dim);">Nenhuma.</span>';
  return entries.map(e=>`<div class="spell-pill-wrap expanded" style="display:block;width:100%;margin-bottom:8px;">
    <div class="check-pill selected" style="cursor:default;">${e.nome}</div>
    ${e.detalhe ? renderSpellDetailCard(e.detalhe) : '<div style="color:var(--parchment-dim);font-size:0.8rem;margin-top:4px;">Sem ficha detalhada cadastrada.</div>'}
  </div>`).join('');
}

/* Texto puro (pra "Copiar Resumo") — mesma informação da tela, sem HTML,
   bom pra colar em qualquer lugar (chat, bloco de notas, editor de texto
   antes de preencher a ficha em PDF na mão). */
function characterSheetAsText(sheet){
  const L = [];
  const push = (...s) => L.push(s.join(''));
  const t = data.tiefling;
  push(data.characterName || '(sem nome)');
  push(`Classe: ${sheet.identidade.classe} 1`);
  push(`Antecedente: ${sheet.identidade.antecedente}`);
  push(`Espécie: ${sheet.identidade.especie}${data.especie==='Tiferino' ? ` (${t.tamanho}, Legado ${t.legado})` : ''}${data.especie==='Aasimar' ? ` (${data.aasimar.tamanho})` : ''}`);
  push(`Bônus de Proficiência: ${fmt(sheet.identidade.profBonus)}`);
  push('');
  push('ATRIBUTOS, SALVAGUARDAS E PERÍCIAS:');
  ABILITIES.forEach(ability=>{
    const attr = sheet.attrs.find(a=>a.ability===ability);
    const save = sheet.savingThrows.find(s=>s.ability===ability);
    const skillsForAbility = sheet.skills.filter(s=>s.ability===ability);
    push(`  ${ability} ${attr.score} (${fmt(attr.mod)})`);
    push(`    Salvaguarda ${fmt(save.bonus)}${save.proficient?'*':''}`);
    skillsForAbility.forEach(s=>push(`    ${s.skill} ${fmt(s.bonus)}${s.expertise?'**':s.proficient?'*':''}`));
  });
  push(`  Percepção Passiva: ${sheet.passivePerception}`);
  push('');
  push(`COMBATE: PV ${sheet.combate.hp} (${sheet.combate.hitDie}) · CA ${sheet.combate.ac.value} (${sheet.combate.ac.source}) · Iniciativa ${fmt(sheet.combate.initiative)}${sheet.combate.initiativeAlerta ? ' (com Alerta)' : ''} · Deslocamento ${sheet.combate.deslocamento}${sheet.combate.visaoNoEscuro ? ` · Visão no Escuro ${sheet.combate.visaoNoEscuro}` : ''}`);
  if(sheet.attacks.length){
    push('');
    push('ATAQUES:');
    sheet.attacks.forEach(a=>push(`  ${a.nome}: ${fmt(a.bonus)} pra acertar, ${a.dano}${a.proficient?'':' (sem proficiência)'}`));
  }
  if(sheet.spellcasting){
    push('');
    push(`CONJURAÇÃO (${sheet.spellcasting.classe}): Atributo ${sheet.spellcasting.habilidade} · CD ${sheet.spellcasting.cd} · Ataque Mágico ${fmt(sheet.spellcasting.ataque)}`);
    if(sheet.spellcasting.cantrips.length) push('  Truques: ', sheet.spellcasting.cantrips.map(c=>c.nome).join(', '));
    if(sheet.spellcasting.magias.length) push('  Magias: ', sheet.spellcasting.magias.map(c=>c.nome).join(', '));
  }
  if(sheet.especieMagias.length){
    push('');
    push('CONCEDIDO PELA ESPÉCIE: ', sheet.especieMagias.map(e=>e.nome).join(', '));
  }
  if(sheet.classFeatureLines.length){
    push('');
    push('CARACTERÍSTICAS DE CLASSE:');
    sheet.classFeatureLines.forEach(l=>push(`  ${l}`));
  }
  push('');
  const ta = sheet.talentoAntecedente;
  push('TALENTO DO ANTECEDENTE:');
  if(ta.tipo==='habilidoso') push(`  Habilidoso: ${ta.skills.join(', ')}`);
  else if(ta.tipo==='iniciado') push(`  Iniciado em Magia (${ta.classe}): ${ta.entries.map(e=>e.nome).join(', ')}`);
  else push(`  ${ta.texto}`);
  push('');
  push('TRAÇOS DE ESPÉCIE:');
  [...(sheet.especieConst.tracosFixos||[]), ...sheet.especieTracosExtras].forEach(tr=>push(`  ${tr.nome}: ${tr.resumo.replace(/<br>/g,' ')}`));
  if(sheet.humanoTalento) push(`  Versátil: ${sheet.humanoTalento.nome}`);
  push('');
  push('PROFICIÊNCIAS E IDIOMAS:');
  push(`  Armas: ${sheet.proficiencias.armas}`);
  push(`  Armaduras: ${sheet.proficiencias.armaduras}`);
  push(`  Ferramentas: ${sheet.proficiencias.ferramentas.join(', ') || 'Nenhuma'}`);
  push(`  Idiomas: ${sheet.proficiencias.idiomas.join(', ')}`);
  push('');
  push('EQUIPAMENTO:');
  sheet.equipamento.itens.forEach(it=>push(`  ${it.label}${it.qty>1?` ×${it.qty}`:''}`));
  push(`  Dinheiro restante: ${fmtGold(sheet.equipamento.poRestante)} PO`);
  return L.join('\n');
}

let copyFeedback = false;
function copySummaryText(){
  const sheet = computeCharacterSheet();
  const text = characterSheetAsText(sheet);
  navigator.clipboard.writeText(text).then(()=>{
    copyFeedback = true;
    render();
    setTimeout(()=>{ copyFeedback = false; render(); }, 2000);
  }).catch(()=>{
    alert('Não consegui copiar automaticamente — selecione o texto manualmente.');
  });
}

function renderSummary(){
  const sheet = computeCharacterSheet();
  const { clsConst, bgConst, bg, cls, especieConst, classFeatureLines } = sheet;
  const t = data.tiefling;

  const ta = sheet.talentoAntecedente;
  const talentoBlock = ta.tipo==='habilidoso'
    ? `<div class="content">Habilidoso: ${ta.skills.map(s=>`<span class="pill-static">${s}</span>`).join('')}</div>`
    : ta.tipo==='iniciado'
    ? `<div class="content">Iniciado em Magia (${ta.classe})<br>${renderSpellEntryList(ta.entries)}</div>`
    : `<div class="content">${ta.texto}</div>`;

  return `<h2>Ficha Concluída</h2>
  ${renderDuplicidadesBox(sheet.duplicidades)}

  <div class="summary-section"><h3>Identidade <button class="edit-link" onclick="editSection(0)">Editar</button></h3>
  <div class="content">
    <input type="text" placeholder="Nome do personagem" value="${(data.characterName||'').replace(/"/g,'&quot;')}" oninput="setCharacterName(this.value)" style="margin-bottom:8px;">
    <div style="margin-bottom:4px;"><b>Classe:</b> ${data.classe} 1</div>
    <div style="margin-bottom:4px;"><b>Antecedente:</b> ${data.antecedente}</div>
    <div style="margin-bottom:4px;"><b>Espécie:</b> ${data.especie}${data.especie==='Tiferino' ? ` (${t.tamanho}, Legado ${t.legado})` : ''}${data.especie==='Aasimar' ? ` (${data.aasimar.tamanho})` : ''}</div>
    <div><b>Bônus de Proficiência:</b> ${fmt(sheet.identidade.profBonus)}</div>
  </div></div>

  <div class="summary-section"><h3>Atributos, Salvaguardas e Perícias <button class="edit-link" onclick="editSection(7)">Editar</button></h3>
  <div class="content">${renderAttributeGroups(sheet)}
  <div style="margin-top:4px;font-size:0.78rem;color:var(--parchment-dim);">Percepção Passiva: <b style="color:var(--gold);">${sheet.passivePerception}</b></div>
  </div></div>

  <div class="summary-section"><h3>Combate</h3>
  <div class="content">
    <div style="margin-bottom:4px;">
      <span class="pill-static">PV ${sheet.combate.hp}<button class="info-btn-inline" onclick="event.stopPropagation();openStatInfo('combate:pv')" title="Ver de onde vem esse número">ⓘ</button></span>
      <span class="pill-static">Dado de Vida ${sheet.combate.hitDie}</span>
    </div>
    <div style="margin-bottom:4px;">
      <span class="pill-static">CA ${sheet.combate.ac.value} (${sheet.combate.ac.source})<button class="info-btn-inline" onclick="event.stopPropagation();openStatInfo('combate:ca')" title="Ver de onde vem esse número">ⓘ</button></span>
      <span class="pill-static">Iniciativa ${fmt(sheet.combate.initiative)}${sheet.combate.initiativeAlerta ? ' (com Alerta)' : ''}<button class="info-btn-inline" onclick="event.stopPropagation();openStatInfo('combate:iniciativa')" title="Ver de onde vem esse número">ⓘ</button></span>
    </div>
    <div>
      <span class="pill-static">Deslocamento ${sheet.combate.deslocamento}</span>
      ${sheet.combate.visaoNoEscuro ? `<span class="pill-static">Visão no Escuro ${sheet.combate.visaoNoEscuro}</span>` : ''}
    </div>
  </div></div>

  ${sheet.attacks.length ? `
  <div class="summary-section"><h3>Ataques</h3>
  <div class="content">
    <table class="shop-table"><thead><tr><th>Arma</th><th>Bônus</th><th>Dano</th></tr></thead><tbody>
    ${sheet.attacks.map(a=>`<tr>
      <td data-label="Arma">${a.nome}${a.proficient?'':' <span style="color:var(--parchment-dim);font-size:0.75rem;">(sem proficiência)</span>'}</td>
      <td data-label="Bônus">${fmt(a.bonus)}</td>
      <td data-label="Dano">${a.dano}</td>
    </tr>`).join('')}
    </tbody></table>
  </div></div>` : ''}

  ${sheet.spellcasting ? `
  <div class="summary-section"><h3>Conjuração — ${sheet.spellcasting.classe} <button class="edit-link" onclick="editSection(1)">Editar</button></h3>
  <div class="content">
    <div style="margin-bottom:10px;">
      <span class="pill-static">Atributo: ${sheet.spellcasting.habilidade}</span>
      <span class="pill-static">CD de Magia: ${sheet.spellcasting.cd}<button class="info-btn-inline" onclick="event.stopPropagation();openStatInfo('conjuracao:cd')" title="Ver de onde vem esse número">ⓘ</button></span>
      <span class="pill-static">Ataque Mágico: ${fmt(sheet.spellcasting.ataque)}<button class="info-btn-inline" onclick="event.stopPropagation();openStatInfo('conjuracao:ataque')" title="Ver de onde vem esse número">ⓘ</button></span>
    </div>
    ${sheet.spellcasting.cantrips.length ? `<div class="group-label">Truques</div>${renderSpellEntryList(sheet.spellcasting.cantrips)}` : ''}
    ${sheet.spellcasting.magias.length ? `<div class="group-label">Magias Preparadas/Conhecidas</div>${renderSpellEntryList(sheet.spellcasting.magias)}` : ''}
  </div></div>` : ''}

  ${sheet.especieMagias.length ? `
  <div class="summary-section"><h3>Concedido pela Espécie</h3>
  <div class="content">${renderSpellEntryList(sheet.especieMagias)}</div></div>` : ''}

  ${classFeatureLines.length ? `
  <div class="summary-section"><h3>Características de Classe <button class="edit-link" onclick="editSection(1)">Editar</button></h3>
  <div class="content">${classFeatureLines.map(l=>`<div style="margin-bottom:4px;">${l}</div>`).join('')}</div></div>` : ''}

  <div class="summary-section"><h3>Talento do Antecedente <button class="edit-link" onclick="editSection(3)">Editar</button></h3>
  ${talentoBlock}</div>

  <div class="summary-section"><h3>Traços de Espécie <button class="edit-link" onclick="editSection(5)">Editar</button></h3>
  <div class="content">${[...(especieConst.tracosFixos||[]), ...sheet.especieTracosExtras].map(tr=>traitBox(tr.nome, tr.resumo, tr.concede)).join('')}
  ${sheet.humanoTalento ? `<div class="option-block"><h3 style="color:var(--gold);margin-top:0;">Versátil: ${sheet.humanoTalento.nome}</h3>${sheet.humanoTalento.detalhe ? renderFeatDetailCard(sheet.humanoTalento.detalhe) : ''}</div>` : ''}
  </div></div>

  <div class="summary-section"><h3>Proficiências e Idiomas <button class="edit-link" onclick="editSection(6)">Editar</button></h3>
  <div class="content">
    <div style="margin-bottom:4px;"><b>Armas:</b> ${sheet.proficiencias.armas}</div>
    <div style="margin-bottom:4px;"><b>Armaduras:</b> ${sheet.proficiencias.armaduras}</div>
    <div style="margin-bottom:4px;"><b>Ferramentas:</b> ${sheet.proficiencias.ferramentas.map(t=>`<span class="pill-static">${t}</span>`).join('') || 'Nenhuma'}</div>
    <div><b>Idiomas:</b> ${sheet.proficiencias.idiomas.map(s=>`<span class="pill-static">${s}</span>`).join('')}</div>
  </div></div>

  <div class="summary-section"><h3>Equipamento <button class="edit-link" onclick="editSection(8)">Editar</button></h3>
  <div class="content">
    ${sheet.equipamento.itens.length ? sheet.equipamento.itens.map(it=>`<span class="pill-static">${it.label}${it.qty>1?` ×${it.qty}`:''}</span>`).join('') : '<span style="color:var(--parchment-dim);">Nenhum item.</span>'}
    <div style="margin-top:8px;font-family:'Cinzel',serif;color:var(--gold);">Dinheiro restante: ${fmtGold(sheet.equipamento.poRestante)} PO</div>
  </div></div>

  <div style="margin:16px 0;">
    <button class="btn primary" onclick="copySummaryText()">${copyFeedback ? 'Copiado! ✓' : '📋 Copiar Resumo'}</button>
  </div>

  <div class="nav">
    <button class="btn" onclick="back()">← Voltar</button>
    <button class="btn primary" onclick="resetWizard()">Iniciar Novo Personagem</button>
  </div>
  ${renderStatInfoPopup(sheet)}`;
}

/* Defaults "vazios" das 10 espécies (data.<chave>), num só lugar — usado
   tanto por resetWizard() quanto pela migração de saves antigos em
   restore(). Antes só tiefling/pequenino eram zeradas no reset; as outras
   8 (aasimar, anao, orc, humano, draconato, elfo, gnomo, golias) ficavam
   com sub-escolhas do personagem anterior. Não existe um SPECIES_DATA_KEY
   tipo o de classes/antecedentes (passo 5 continua ramificando por
   if/else de nome, decisão já registrada na nota do topo), então as 10
   chaves ficam hardcoded aqui mesmo — se uma espécie nova entrar, some a
   entrada aqui também. */
