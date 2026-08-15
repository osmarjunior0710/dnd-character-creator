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

/* Todas as armaduras que o personagem possui (id + regras de CA de
   ARMOR_AC + nome de exibição) — usado tanto pra resolver qual está
   "equipada" quanto pra desenhar os cards de Armadura/Escudo no
   Resumo. */
function ownedArmorList(){
  const out = [];
  ownedItemIdSet().forEach(id=>{
    const armor = ARMOR_AC[id];
    if(armor) out.push({id, ...armor, nome: findShopItem(id).n});
  });
  return out;
}

/* Qual armadura está "equipada" — usada tanto pro cálculo de CA quanto
   pro card com o pill Equipar/Equipado no Resumo (renderSummary()).
   Por padrão (data.equippedArmorId ainda não escolhido, ou apontando pra
   uma armadura que o personagem não tem mais) calcula sozinho a de
   maior CA FINAL pra ESSE personagem — não só maior "CA base" do item:
   uma armadura Leve com Destreza sem teto pode dar CA final maior que
   uma Média/Pesada com CA base maior, dependendo do Mod. de Destreza
   (bug sutil que já existia aqui antes, corrigido de brinde). Se o
   jogador clicar em "Equipar" noutra (pickEquippedArmor(), em
   08-handlers.js), essa escolha fica salva e passa a valer até ele
   vender/trocar de armadura. */
function resolveEquippedArmorId(ownedArmors, dexMod){
  if(!ownedArmors.length) return null;
  if(data.equippedArmorId && ownedArmors.some(a=>a.id===data.equippedArmorId)) return data.equippedArmorId;
  let bestId = null, bestCA = -Infinity;
  ownedArmors.forEach(a=>{
    const dexBonus = a.dexCap===null ? dexMod : a.dexCap===0 ? 0 : Math.min(dexMod, a.dexCap);
    const finalCA = a.ca + dexBonus;
    if(finalCA > bestCA){ bestCA = finalCA; bestId = a.id; }
  });
  return bestId;
}

/* Mesma ideia do Escudo — hoje só existe 1 item "Escudo" na Loja (ver
   nota em data/armor-ac.js), então "equipar" não tem entre o quê
   escolher de verdade, mas mantém o mesmo padrão de data.equippedShieldId/
   pickEquippedShield() da Armadura por consistência (e caso um dia
   apareça uma 2ª variante de escudo). */
function resolveEquippedShieldId(){
  if(!ownedItemIdSet().has(SHIELD_ITEM_ID)) return null;
  return SHIELD_ITEM_ID;
}

/* Armadura EQUIPADA (não mais "a de maior CA" cega — respeita a escolha
   do jogador, ver resolveEquippedArmorId() acima) + se tem Escudo
   equipado. Cobre tanto quem ganhou armadura fixa na Opção A quanto
   quem escolheu só ouro e comprou na Loja. */
function ownedArmorAndShield(dexMod){
  const armors = ownedArmorList();
  const equippedId = resolveEquippedArmorId(armors, dexMod);
  const armor = equippedId ? armors.find(a=>a.id===equippedId) : null;
  const shieldId = resolveEquippedShieldId();
  return {armor, hasShield: !!shieldId, shieldId};
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
   usar escudo e manter a fórmula com Constituição.

   estiloDeLuta (opcional, só o Guerreiro tem isso no nível 1 — ver
   GUERREIRO.estiloDeLuta em data/classes/guerreiro.js): dos 10 Estilos de
   Luta, só o "Defensivo" muda a CA (+1 enquanto veste armadura Leve/
   Média/Pesada — os outros 9 são só texto informativo, não mexem nesse
   número). Não somava antes — achado ao montar um exemplo de ficha pro
   plano de migração React, confirmado contra regras.md e o PDF. Só entra
   dentro do ramo "armor" porque a regra exige estar USANDO armadura;
   Bárbaro/Monge sem armadura não têm Estilo de Luta nesta versão do app
   (é exclusivo do Guerreiro), então não precisa de exceção nos ramos
   deles. */
function computeAC(classe, dexMod, conMod, wisMod, estiloDeLuta){
  const {armor, hasShield} = ownedArmorAndShield(dexMod);
  let base, source;
  const breakdown = [];
  if(armor){
    const dexBonus = armor.dexCap===null ? dexMod : armor.dexCap===0 ? 0 : Math.min(dexMod, armor.dexCap);
    base = armor.ca + dexBonus;
    source = findShopItem(armor.id).n;
    breakdown.push({label: source, value: armor.ca, plain:true});
    breakdown.push({label: armor.dexCap===0 ? 'Mod. de Destreza (armadura pesada, não soma)' : armor.dexCap!==null ? `Mod. de Destreza (máx. +${armor.dexCap})` : 'Mod. de Destreza', value: dexBonus});
    if(estiloDeLuta==='Defensivo'){
      base += 1;
      source += ' + Estilo de Luta (Defensivo)';
      breakdown.push({label:'Estilo de Luta (Defensivo)', value:1});
    }
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
  return {value: base, source, breakdown, armorId: armor ? armor.id : null, shieldEquipped: hasShield};
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

/* `targetFor(src, name)` (opcional): calcula pra onde o botão "Editar" de
   cada fonte deve levar o jogador — devolve {step, groupId} (mesmos step/
   groupId de editSection()/scrollToMissing()) ou null quando essa fonte é
   um traço FIXO sem tela de escolha própria (aí não tem o que "editar":
   só dá pra resolver trocando a origem inteira — classe/antecedente/
   espécie — e nenhuma dessas é "um campo" pra apontar). Sem targetFor,
   fontes ficam sem botão (usado por quem só precisa da lista de nomes,
   sem link de edição). */
function mapDuplicatesBySource(bySource, targetFor){
  const nameToSources = {};
  Object.keys(bySource).forEach(src=>{
    (bySource[src]||[]).forEach(name=>{
      if(!name) return;
      if(!nameToSources[name]) nameToSources[name] = [];
      const label = DUP_SOURCE_LABEL[src] || src;
      if(nameToSources[name].some(f=>f.label===label)) return;
      const target = targetFor ? targetFor(src, name) : null;
      nameToSources[name].push({ label, step: target ? target.step : null, groupId: target ? target.groupId : null });
    });
  });
  return Object.keys(nameToSources).filter(name=>nameToSources[name].length>1)
    .map(name=>({nome:name, fontes:nameToSources[name]}));
}

/* Dentro de "classe", qual grupo/tela específica guarda o nome escolhido —
   cada classe conjuradora tem seus próprios campos (truque vs magia de 1º
   círculo, mais os extras do Pacto do Tomo no Bruxo) e cada um vira uma
   seção própria no passo 1 (ver ids grp-1-* em js/05-class-steps.js). */
function classSpellGroupId(cls, name){
  switch(data.classe){
    case 'Bruxo':
      if(cls.tomoCantrips.includes(name)) return 'grp-1-tomocantrips';
      if(cls.tomoRituals.includes(name)) return 'grp-1-tomorituals';
      if(cls.spells1.includes(name)) return 'grp-1-spells1';
      return 'grp-1-cantrips';
    case 'Mago':
      return cls.cantrips.includes(name) ? 'grp-1-cantrips' : 'grp-1-spellbook';
    case 'Paladino':
      return 'grp-1-prepared';
    default:
      return (cls.cantrips||[]).includes(name) ? 'grp-1-cantrips' : 'grp-1-spells1';
  }
}

/* Fonte "espécie" nas magias/truques: só 3 espécies concedem magia por uma
   ESCOLHA (Tiferino via Legado, Elfo/Gnomo via Linhagem) — Aasimar concede
   Luz de forma fixa, sem tela pra editar. */
function especieSpellGroupId(){
  if(data.especie==='Tiferino') return 'grp-5-legado';
  if(data.especie==='Elfo' || data.especie==='Gnomo') return 'grp-5-linhagem';
  return null;
}

/* Truques (nível 0) que a CLASSE concede, separados das magias de fato
   (1º círculo+) — cada classe guarda isso num campo diferente de
   data.<classe> (nem toda classe tem truque: Paladino e Guardião não
   têm nenhum campo de truque no modelo de dados). Split de
   classSpellNamesRaw() (usada pra checagem de Duplicidade, que não
   precisa separar truque de magia) pro floater de Truques e Magias, que
   precisa. */
function classGrantedTruques(cls){
  if(!CLASS_SPELL_ABILITY[data.classe]) return [];
  switch(data.classe){
    case 'Bruxo': return [...cls.cantrips, ...cls.tomoCantrips];
    case 'Paladino': case 'Guardião': return [];
    default: return [...cls.cantrips];
  }
}
/* Mesma ideia, mas magia de 1º círculo+ — pro Mago é o Livro de Magias
   inteiro (spellbook), não só o Preparado (prepared é só um subconjunto
   do que já foi escolhido, então checar o livro cobre tudo). Inclui as
   concessões FIXAS da própria classe (Falar com Animais do Druida,
   Marca do Predador do Guardião — sempre conjuradas por essas classes,
   sem escolha, mas ainda contam como magia que o personagem tem). */
function classGrantedMagias(cls){
  if(!CLASS_SPELL_ABILITY[data.classe]) return [];
  switch(data.classe){
    case 'Bruxo': return [...cls.spells1, ...cls.tomoRituals];
    case 'Mago': return [...cls.spellbook];
    case 'Paladino': return [...cls.prepared];
    case 'Guardião': return [...cls.spells1, 'Marca do Predador'];
    case 'Druida': return [...cls.spells1, 'Falar com Animais'];
    default: return [...cls.spells1];
  }
}
/* Mesmo switch de computeSpellcasting(), mas devolvendo TODOS os nomes
   escolhidos (sem o new Set() final) — usada pela checagem de
   Duplicidade, que não precisa separar truque de magia, só achar nome
   repetido entre fontes. */
function classSpellNamesRaw(cls){
  return [...classGrantedTruques(cls), ...classGrantedMagias(cls)];
}

/* Truques e magias que o personagem tem, agrupados por FONTE (Classe /
   Antecedente-Iniciado em Magia / Espécie) — usado pelo floater 🔮
   Truques e Magias (mesmo espírito de skillsGrantedBySource() pra
   perícias, em 08-handlers.js). */
function spellsGrantedBySource(){
  const cls = activeClassData();
  const bg = activeBgData();
  return {
    classe: { truques: classGrantedTruques(cls), magias: classGrantedMagias(cls) },
    antecedenteIniciado: { truques: bg.iniciadoCantrips || [], magias: bg.iniciadoSpell1 || [] },
    especie: { truques: speciesGrantedCantrips(), magias: speciesGrantedSpells() }
  };
}

function detectDuplicidades(sheet){
  const pericias = mapDuplicatesBySource(skillsGrantedBySource(), (src)=>{
    switch(src){
      case 'classe': return {step:1, groupId:'grp-1-skills'};
      case 'habilidoso': return {step:3, groupId:'grp-3-habilidoso'};
      case 'humano': case 'elfo': return {step:5, groupId:'grp-5-pericia'};
      case 'antecedenteFixo': return {step:2, groupId:'grp-2-antecedente'};
      default: return null;
    }
  }).map(d=>({...d, tipo:'Perícia'}));
  const ferramentas = mapDuplicatesBySource({
    classe: (sheet.clsConst.toolsFixed ? [sheet.clsConst.toolsFixed] : []).concat(data.classe==='Bardo' ? data.bardo.instruments : []).concat(data.classe==='Monge' && data.monge.toolChoice ? [data.monge.toolChoice] : []),
    antecedenteFixo: sheet.bgConst.ferramentaOpcoes ? (sheet.bg.ferramentaEscolhida ? [sheet.bg.ferramentaEscolhida] : []) : (sheet.bgConst.tool ? [sheet.bgConst.tool] : []),
    habilidoso: (sheet.bg.habilidoso||[]).filter(x=>!ALL_SKILLS.includes(x))
  }, (src, name)=>{
    switch(src){
      case 'classe':
        if(data.classe==='Bardo' && data.bardo.instruments.includes(name)) return {step:1, groupId:'grp-1-instruments'};
        if(data.classe==='Monge' && data.monge.toolChoice===name) return {step:1, groupId:'grp-1-toolchoice'};
        return null; // ferramenta fixa da classe (toolsFixed), sem tela de escolha
      case 'antecedenteFixo':
        return sheet.bgConst.ferramentaOpcoes ? {step:3, groupId:'grp-3-ferramenta'} : null;
      case 'habilidoso': return {step:3, groupId:'grp-3-habilidoso'};
      default: return null;
    }
  }).map(d=>({...d, tipo:'Ferramenta'}));
  const magias = mapDuplicatesBySource({
    classe: classSpellNamesRaw(sheet.cls),
    antecedenteIniciado: [...(sheet.bg.iniciadoCantrips||[]), ...(sheet.bg.iniciadoSpell1||[])],
    especie: [...speciesGrantedCantrips(), ...speciesGrantedSpells()]
  }, (src, name)=>{
    switch(src){
      case 'classe': return {step:1, groupId: classSpellGroupId(sheet.cls, name)};
      case 'antecedenteIniciado': return {step:3, groupId: (sheet.bg.iniciadoCantrips||[]).includes(name) ? 'grp-3-iniciado-truques' : 'grp-3-iniciado-magia1'};
      case 'especie': { const gid = especieSpellGroupId(); return gid ? {step:5, groupId:gid} : null; }
      default: return null;
    }
  }).map(d=>({...d, tipo:'Magia/Truque'}));
  const talentos = (data.especie==='Humano' && data.humano.talento && data.humano.talento===backgroundFeatBaseName())
    ? [{nome:data.humano.talento, tipo:'Talento', fontes:[
        {label:DUP_SOURCE_LABEL.antecedenteFixo, step:2, groupId:'grp-2-antecedente'},
        {label:DUP_SOURCE_LABEL.humanoTalento, step:5, groupId:'grp-5-talento'}
      ]}]
    : [];
  return [...pericias, ...ferramentas, ...magias, ...talentos];
}

function renderDuplicidadesBox(dups){
  if(!dups.length) return '';
  return `<div class="dup-warning">
    <div class="dup-warning-title">⚠️ Duplicidade ⚠️</div>
    <div class="dup-warning-intro">O que está abaixo foi adquirido em mais de um lugar — a repetição não soma benefício extra, considere trocar uma das escolhas.</div>
    ${dups.map(d=>`<div class="dup-warning-item"><b>${d.nome}</b> <span class="dup-warning-tipo">(${d.tipo})</span> — adquirido em ${d.fontes.length} lugares: ${d.fontes.map(f=>`<span class="dup-source">${f.label}${f.groupId?` <button class="dup-edit-link" onclick="editSectionAt(${f.step},'${f.groupId}')">Editar</button>`:''}</span>`).join(', ')}</div>`).join('')}
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
  const ac = computeAC(data.classe, modOf('Destreza'), modOf('Constituição'), modOf('Sabedoria'), data.classe==='Guerreiro' ? data.guerreiro.estilo : null);
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
      alinhamento: data.alinhamento, profBonus: prof
    },
    attrs, savingThrows, skills, passivePerception,
    combate: { hp, hpBreakdown, hitDie: `1d${hitDie}`, ac, initiative, initiativeBreakdown, initiativeAlerta, deslocamento: resolvedDeslocamento(), visaoNoEscuro: especieConst.visaoNoEscuro },
    attacks, spellcasting, especieMagias, especieTracosExtras, humanoTalento,
    classFeatureLines, talentoAntecedente,
    proficiencias: { idiomas, ferramentas: tools, armas: weaponProfText, armaduras: armorProfText },
    equipamento: { itens: ownedEquipmentList(), poRestante: remaining },
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
  push(`Alinhamento: ${sheet.identidade.alinhamento}`);
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

/* Campos de texto informativo fixo por classe (ex: Fúria do Bárbaro,
   Ataque Furtivo do Ladino) que NÃO entram em classFeatureLines (esse
   array só tem ESCOLHAS — maestria, estilo, ordem, pacto, especialista).
   Usado só pela exportação MestreIA (characterSheetAsMestreIAMarkdown)
   pra preencher "Características de Classe relevantes" com o texto
   completo dessas características automáticas, não só o nome. */
const CLASS_FEATURE_TEXT_FIELDS = {
  'Bárbaro': [['Fúria','furia'], ['Defesa sem Armadura','defesaSemArmadura']],
  'Bardo': [['Inspiração de Bardo','inspiracao']],
  'Druida': [['Idioma Druídico','idiomaDruidico']],
  'Feiticeiro': [['Feitiçaria Inata','feiticariaInata']],
  'Guardião': [['Inimigo Favorito','inimigoFavorito']],
  'Guerreiro': [['Recuperar Fôlego','recuperarFolego']],
  'Ladino': [['Ataque Furtivo','ataqueFurtivo'], ['Gíria do Ladrão','giriaDoLadrao']],
  'Mago': [['Adepto de Ritual','adeptoRitual'], ['Recuperação Arcana','recuperacaoArcana']],
  'Monge': [['Artes Marciais','artesMarciais'], ['Defesa sem Armadura','defesaSemArmadura']],
  'Paladino': [['Mãos Consagradas','maosConsagradas']],
  'Psiônico': [['Poder Psiônico','poderPsionico'], ['Telecinese Sutil','telecineseSutil']]
};

/* Espaços de magia de 1º círculo no nível 1, por classe — conferido
   contra a aba Progressão de Classe na revisão da planilha de
   referência (passo 5/9 da revisão). Bruxo é à parte (Magia de Pacto: 1
   espaço, sempre do círculo mostrado na tabela, não "1º círculo fixo"
   como as outras). Só usado na exportação MestreIA — o app não gasta/
   rastreia espaço de magia hoje (ficha estática de criação, sem uso em
   jogo ainda). */
const SPELL_SLOTS_LV1_TEXT = {
  'Bardo': '2 espaços de 1º círculo', 'Clérigo': '2 espaços de 1º círculo',
  'Druida': '2 espaços de 1º círculo', 'Feiticeiro': '2 espaços de 1º círculo',
  'Guardião': '2 espaços de 1º círculo', 'Mago': '2 espaços de 1º círculo',
  'Paladino': '2 espaços de 1º círculo', 'Bruxo': '1 espaço de Magia de Pacto (1º círculo)'
};

/* Características de classe com texto completo (não só nome) — junta as
   ESCOLHAS já resumidas em classFeatureLines (mas com a descrição
   completa de Ordem/Pacto/Estilo de Luta em vez de só o nome escolhido)
   com os recursos AUTOMÁTICOS de CLASS_FEATURE_TEXT_FIELDS acima. */
function classFeatureTextEntries(sheet){
  const out = [];
  const clsConst = sheet.clsConst, cls = sheet.cls;
  if(cls.maestria && cls.maestria.length) out.push({nome:'Maestria em Arma', texto: cls.maestria.map(m=>`${m} (${WEAPON_MASTERY[m].mastery})`).join(', ')});
  if(cls.estilo) out.push({nome:`Estilo de Luta: ${cls.estilo}`, texto: FEAT_DETAILS[cls.estilo] ? FEAT_DETAILS[cls.estilo].beneficios : ''});
  if(cls.ordem){
    const desc = (clsConst.ordemDivina && clsConst.ordemDivina[cls.ordem]) || (clsConst.ordemPrimal && clsConst.ordemPrimal[cls.ordem]) || '';
    out.push({nome:`Ordem: ${cls.ordem}`, texto: desc});
  }
  if(cls.pactBoon) out.push({nome:`Vínculo de Pacto: ${cls.pactBoon}`, texto: (clsConst.pactBoons && clsConst.pactBoons[cls.pactBoon]) || ''});
  if(cls.especialista && cls.especialista.length) out.push({nome:'Especialista (proficiência dobrada)', texto: cls.especialista.join(', ')});
  (CLASS_FEATURE_TEXT_FIELDS[data.classe]||[]).forEach(([nome,field])=>{
    if(clsConst[field]) out.push({nome, texto: clsConst[field].replace(/<br>/g,' ')});
  });
  return out;
}

/* Traços de espécie que ainda vão desbloquear em nível futuro (3 ou 5)
   — pro bloco "Progressão Futura" do template da Seção 13.6 do guia de
   Mestre IA. Aasimar/Tiferino/Elfo têm dado estruturado (nivel3/nivel5
   em data/species/*.js); Draconato (Voo Dracônico) e Golias (Forma
   Grande) não têm campo estruturado pra isso — o traço já vem escrito
   como "a partir do nível X de personagem" dentro do próprio texto em
   tracosFixos, então o 2º bloco abaixo pega isso genericamente por
   busca de texto, sem precisar de caso especial por espécie. */
function speciesFutureTraits(sheet){
  const out = [];
  if(data.especie==='Aasimar'){
    out.push({nivel:3, texto:'Revelação Celestial — pode se transformar (Asas Celestiais, Manto Necrótico ou Transfiguração Radiante, escolhida a cada vez) como Ação Bônus, 1x por Descanso Longo.'});
  }
  if(data.especie==='Tiferino' && data.tiefling.legado){
    const opt = TIEFLING.subespecie.opcoes.find(o=>o.nome===data.tiefling.legado);
    if(opt){
      if(opt.nivel3) out.push({nivel:3, texto:`Legado Ínfero (${opt.nome}): aprende ${opt.nivel3.concede.map(c=>c.nome).join(', ')}.`});
      if(opt.nivel5) out.push({nivel:5, texto:`Legado Ínfero (${opt.nome}): aprende ${opt.nivel5.concede.map(c=>c.nome).join(', ')}.`});
    }
  }
  if(data.especie==='Elfo' && data.elfo.linhagem){
    const opt = ELFO.subespecie.opcoes.find(o=>o.nome===data.elfo.linhagem);
    if(opt){
      if(opt.nivel3) out.push({nivel:3, texto:`Linhagem Élfica (${opt.nome}): aprende ${opt.nivel3.concede.map(c=>c.nome).join(', ')}.`});
      if(opt.nivel5) out.push({nivel:5, texto:`Linhagem Élfica (${opt.nome}): aprende ${opt.nivel5.concede.map(c=>c.nome).join(', ')}.`});
    }
  }
  (sheet.especieConst.tracosFixos||[]).forEach(tr=>{
    const m = tr.resumo.match(/n[íi]vel (\d+) de personagem/i);
    if(m && (m[1]==='3' || m[1]==='5')) out.push({nivel: parseInt(m[1]), texto:`${tr.nome} — ainda bloqueado.`});
  });
  return out.sort((a,b)=>a.nivel-b.nivel);
}

/* Ficha em Markdown no formato EXATO da Seção 13.6 do guia "D&D 5e
   (2024) — Guia de Regras para uma IA Mestre" (guiamestreia.md) — pra
   anexar junto com esse guia numa conversa com uma IA mestrando a
   campanha, sem ela ter que reformatar nada. Reaproveita o mesmo
   `sheet` de computeCharacterSheet() (a mesma fonte de
   characterSheetAsText()/PDF), só muda a formatação de saída.

   Três blocos do template não têm de onde vir hoje — nome do JOGADOR
   (só o nome do personagem é coletado), gancho de bugiganga (é conceito
   de mesa/sessão, não de criação de ficha) e a história de fundo do
   personagem (texto livre que ninguém digitou ainda) — todos marcados
   com o placeholder combinado com o usuário, pra IA Mestre saber que
   precisa perguntar ao jogador antes de considerar isso preenchido. */
function characterSheetAsMestreIAMarkdown(sheet){
  const PLACEHOLDER = '*(Placeholder — IA conferir com jogador para preencher)*';
  const L = [];
  const push = (...s) => L.push(s.join(''));

  const especieVariante = (() => {
    if(data.especie==='Tiferino' && data.tiefling.legado) return `Legado ${data.tiefling.legado}`;
    if(data.especie==='Draconato' && data.draconato.heranca) return `Herança ${data.draconato.heranca}`;
    if(data.especie==='Elfo' && data.elfo.linhagem) return data.elfo.linhagem;
    if(data.especie==='Gnomo' && data.gnomo.linhagem) return data.gnomo.linhagem;
    if(data.especie==='Golias' && data.golias.ancestralidade) return data.golias.ancestralidade;
    return null;
  })();
  const especieLinha = `${sheet.identidade.especie}${especieVariante ? ` (${especieVariante})` : ''}`;
  const classeExtra = (data.classe==='Bruxo' && data.bruxo.pactBoon) ? data.bruxo.pactBoon : '';
  const classeLinha = `${sheet.identidade.classe} — Nível 1${classeExtra ? ' — '+classeExtra : ''}`;

  push(`# Ficha de ${data.characterName || '(sem nome)'}`);
  push('');
  push('## Identificação');
  push(`- **Jogador:** ${PLACEHOLDER}`);
  push(`- **Classe:** ${classeLinha}`);
  push(`- **Origem:** ${sheet.identidade.antecedente}`);
  push(`- **Espécie:** ${especieLinha}`);
  push(`- **Alinhamento:** ${sheet.identidade.alinhamento}`);
  push(`- **Idiomas:** ${sheet.proficiencias.idiomas.join(', ')}`);
  push('');
  push('## Atributos');
  push('');
  push('| Atributo | Valor | Mod | Extra | Salvaguarda |');
  push('|---|---|---|---|---|');
  ABILITIES.forEach(ability=>{
    const attr = sheet.attrs.find(a=>a.ability===ability);
    const save = sheet.savingThrows.find(s=>s.ability===ability);
    push(`| ${ability} | ${attr.score} | ${fmt(attr.mod)} | — | ${fmt(save.bonus)}${save.proficient?' (proficiente)':''} |`);
  });
  push('');
  push(`**Bônus de Proficiência:** ${fmt(sheet.identidade.profBonus)}`);
  push('');
  push('## Perícias');
  push('');
  push('| Perícia | Atributo | Prof.? | Mod. Atributo | Bônus Prof. | Extra | **Total** |');
  push('|---|---|---|---|---|---|---|');
  sheet.skills.forEach(s=>{
    push(`| ${s.skill} | ${s.ability} | ${s.expertise?'Especialista':s.proficient?'Sim':'Não'} | ${fmt(s.breakdown[0].value)} | ${fmt(s.breakdown[1].value)} | — | **${fmt(s.bonus)}** |`);
  });
  push('');
  push(`**Percepção Passiva:** ${sheet.passivePerception}`);
  push('');
  push('## Combate');
  push('');
  push('| PV Máx. | CA | Iniciativa | Deslocamento | Dado de Vida |');
  push('|---|---|---|---|---|');
  push(`| ${sheet.combate.hp} | ${sheet.combate.ac.value} | ${fmt(sheet.combate.initiative)} | ${sheet.combate.deslocamento} | ${sheet.combate.hitDie} |`);
  push('');
  push('**Ataques** (armas E qualquer truque/magia ofensiva que role pra acertar ou cause dano — fica tudo aqui, porque na mesa isso é usado de graça a cada rodada):');
  sheet.attacks.forEach(a=>push(`- **${a.nome}** — ${fmt(a.bonus)} para acertar, ${a.dano}${a.proficient?'':' (sem proficiência)'}`));
  /* Heurística combinada com o usuário: truque/magia de classe cujo
     "efeito" menciona "dano" conta como ofensiva e entra aqui também
     (com CD e bônus de ataque mágico, já que a magia pode pedir um ou
     outro dependendo do efeito) — não é 100% preciso pra todo caso, mas
     cobre a maioria. Só olha magia de CLASSE (sheet.spellcasting) — não
     inclui a de espécie porque o app não calcula CD/ataque separado pra
     magia inata de espécie em lugar nenhum ainda. */
  const classSpellEntries = sheet.spellcasting ? [...sheet.spellcasting.cantrips, ...sheet.spellcasting.magias] : [];
  const offensiveSpells = classSpellEntries.filter(e=>e.detalhe && /\bdano\b/i.test(e.detalhe.efeito));
  offensiveSpells.forEach(e=>push(`- **${e.nome}** (${e.detalhe.circulo}) — CD ${sheet.spellcasting.cd} ou ${fmt(sheet.spellcasting.ataque)} pra acertar (conforme a magia pedir salvaguarda ou ataque) — ${e.detalhe.efeito}`));
  if(!sheet.attacks.length && !offensiveSpells.length) push('- Nenhum ataque ainda.');
  push('');
  push('## Truques e Magias (referência rápida — só o efeito principal, não o texto completo)');
  push('');
  const allSpellEntries = [...classSpellEntries, ...sheet.especieMagias];
  const nonOffensiveSpells = allSpellEntries.filter(e=>!offensiveSpells.includes(e));
  if(nonOffensiveSpells.length){
    nonOffensiveSpells.forEach(e=>push(`- **${e.nome}** (${e.detalhe ? e.detalhe.circulo : '—'}) — ${e.detalhe ? e.detalhe.efeito : 'Sem ficha detalhada cadastrada.'}`));
  } else {
    push('*Nenhuma.*');
  }
  push('');
  const invocacoes = [];
  if(data.classe==='Bruxo' && data.bruxo.pactBoon) invocacoes.push({nome:data.bruxo.pactBoon, texto: BRUXO.pactBoons[data.bruxo.pactBoon]});
  push('**Invocações Místicas / Habilidades passivas equivalentes** (não gastam magia — liste separado):');
  if(invocacoes.length) invocacoes.forEach(i=>push(`- **${i.nome}** — ${i.texto}`));
  else push('- Nenhuma.');
  push('');
  if(sheet.spellcasting){
    push(`**Espaços de Magia:** ${SPELL_SLOTS_LV1_TEXT[data.classe] || '—'} · **CD para resistir à magia:** ${sheet.spellcasting.cd} · **Bônus de ataque mágico:** ${fmt(sheet.spellcasting.ataque)}`);
  } else {
    push('**Espaços de Magia:** — · **CD para resistir à magia:** — · **Bônus de ataque mágico:** —');
  }
  push('');
  push('## Progressão Futura (traços de nível que ainda vão desbloquear)');
  push('');
  const futureTraits = speciesFutureTraits(sheet);
  if(futureTraits.length){
    futureTraits.forEach(t=>push(`- **Nível ${t.nivel} — ${sheet.identidade.especie}:** ${t.texto} *Ainda bloqueado — personagem está no nível 1.*`));
  } else {
    push('*Nenhum traço com gancho de nível futuro nesta espécie/classe.*');
  }
  push('');
  push('## Talentos e Características');
  push('');
  const ta = sheet.talentoAntecedente;
  const taTexto = ta.tipo==='habilidoso' ? `Habilidoso — proficiência em: ${ta.skills.join(', ')}`
    : ta.tipo==='iniciado' ? `Iniciado em Magia (${ta.classe}) — ${ta.entries.map(e=>e.nome).join(', ')}`
    : ta.texto;
  push(`- **Talento de Origem:** ${taTexto}`);
  const classFeatures = classFeatureTextEntries(sheet);
  push(`- **Características de Classe relevantes:**${classFeatures.length ? '' : ' Nenhuma além das automáticas.'}`);
  classFeatures.forEach(f=>push(`  - **${f.nome}** — ${f.texto}`));
  const tracos = [...(sheet.especieConst.tracosFixos||[]), ...sheet.especieTracosExtras];
  push(`- **Traços de Espécie:**`);
  tracos.forEach(tr=>push(`  - **${tr.nome}** — ${tr.resumo.replace(/<br>/g,' ')}`));
  if(sheet.humanoTalento) push(`  - **Versátil (talento extra):** ${sheet.humanoTalento.nome}`);
  push('');
  push('## Equipamento e Dinheiro');
  push('');
  sheet.equipamento.itens.forEach(it=>push(`- ${it.label}${it.qty>1?` ×${it.qty}`:''}`));
  push(`- **Bugiganga / Gancho de história:** ${PLACEHOLDER}`);
  push(`- **Dinheiro:** ${fmtGold(sheet.equipamento.poRestante)} PO`);
  push('');
  push('## Progresso da Campanha');
  push('');
  push('- **Nível atual:** 1 — **XP:** 0');
  push('- **Sessões:**');
  push('  - *(nenhuma ainda — personagem recém-criado)*');
  push('');
  push('## História');
  push('');
  push('### Background do Jogador');
  push(PLACEHOLDER);
  push('');
  push('### Campanha (Conhecimentos da Campanha)');
  push('- *(nenhuma ainda — personagem recém-criado)*');
  return L.join('\n');
}

/* Baixa a ficha formatada pro guia de IA Mestre
   (characterSheetAsMestreIAMarkdown) como arquivo .md — mesmo padrão de
   Blob+<a download> já usado em exportCharacterPdf() (js/pdf-export.js),
   só que com texto em vez de PDF. */
function exportMestreIA(){
  const sheet = computeCharacterSheet();
  const text = characterSheetAsMestreIAMarkdown(sheet);
  const blob = new Blob([text], {type:'text/markdown;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Ficha de ${data.characterName || data.classe || 'Personagem'}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(url), 10000);
}

/* Navega pra tela de instruções "Exportar para MestreIA" (step 11) —
   NÃO é uma página HTML separada, é mais uma "tela" do wizard, igual
   Resumo/Loja/etc., só que fora da progressão linear (só se chega
   aqui clicando no botão do Resumo, nunca via next()/back() normal).
   O "Voltar" desta tela volta direto pro Resumo (goTo(10)), não
   decrementa step cegamente. */
function goToMestreIAExport(){ step = 11; persist(); render(); }

/* Prompt fixo pra colar no Claude junto com os arquivos — texto
   escrito pelo usuário, mantido literal (não é o app tentando "narrar"
   o que a IA deve fazer, é o comando dele pra ela). Uma const separada
   do HTML pra poder reusar no textarea E no botão "Copiar", sem
   duplicar o texto em dois lugares. */
const MESTREIA_PROMPT = `Claude, você vai atuar como um mestre de campanha, comece lendo o Guia Mestre IA pois ele vai te explicar tudo que precisa saber para essa campanha.
Use a ficha de personagem já criada em anexo caso haja uma, se não existir, vamos criar um novo personagem.`;

let copyPromptFeedback = false;
function copyMestreIAPrompt(){
  navigator.clipboard.writeText(MESTREIA_PROMPT).then(()=>{
    copyPromptFeedback = true;
    render();
    setTimeout(()=>{ copyPromptFeedback = false; render(); }, 2000);
  }).catch(()=>{
    alert('Não consegui copiar automaticamente — selecione o texto manualmente.');
  });
}

/* Tela "Exportar para MestreIA" — passo a passo pra levar o
   personagem pra uma mesa jogada com IA (Claude ou outra), usando a
   config de Mestre IA do jogador (guia de regras + planilhas de
   referência) por fora deste site.

   DECISÃO (combinada com o usuário): o app só gera e baixa a FICHA
   (dado do próprio personagem, sem problema de licença). Os outros
   arquivos da config (guia, regras de criação, planilhas) NÃO ficam
   hospedados neste repositório nem neste site — são extraídos de uma
   tradução paga de terceiros do Livro do Jogador, e este é um site
   público. Por isso o Passo 1 só lembra o jogador de separar os
   arquivos que ele já tem, em vez de oferecer um link de download
   pra eles. Ver discussão no PR sobre "Exportar para MestreIA". */
function renderMestreIAExport(){
  return `<h2>Exportar para MestreIA</h2>
  <p class="intro">Leve esse personagem pra uma mesa jogada com IA — dois passos, sem precisar reformatar nada.</p>

  <div class="summary-section"><h3>Passo 1 — Baixe os arquivos</h3>
  <div class="content">
    <p style="font-size:0.85rem;color:var(--parchment);line-height:1.6;margin:0 0 10px;">Baixe a ficha deste personagem, já formatada no padrão que o Guia de Mestre IA espera:</p>
    <button class="btn primary" onclick="exportMestreIA()">📥 Baixar Ficha (Markdown)</button>
    <p style="font-size:0.85rem;color:var(--parchment);line-height:1.6;margin:16px 0 6px;">Separe também os arquivos da sua config de Mestre IA (os mesmos que você já usa — não fazem parte deste site, então não têm link de download aqui):</p>
    <ul style="font-size:0.85rem;color:var(--parchment-dim);line-height:1.8;margin:0;padding-left:20px;">
      <li>Guia de Mestre IA (regras + comportamento da IA)</li>
      <li>Regras de Criação e Consulta (arquivo companheiro do guia)</li>
      <li>Planilha de referência do Livro do Jogador</li>
      <li>Planilha de referência do Guia do Mestre</li>
    </ul>
  </div></div>

  <div class="summary-section"><h3>Passo 2 — Cole no Claude</h3>
  <div class="content">
    <p style="font-size:0.85rem;color:var(--parchment);line-height:1.6;margin:0 0 10px;">Abra uma conversa nova no Claude, anexe os 5 arquivos (a ficha que você baixou + os 4 do Passo 1) e cole este prompt:</p>
    <textarea readonly rows="4" style="width:100%;font-family:'Spectral',serif;font-size:0.85rem;line-height:1.5;resize:vertical;box-sizing:border-box;">${MESTREIA_PROMPT}</textarea>
    <button class="btn primary" style="margin-top:10px;" onclick="copyMestreIAPrompt()">${copyPromptFeedback ? 'Copiado! ✓' : '📋 Copiar Prompt'}</button>
  </div></div>

  <div class="nav">
    <button class="btn" onclick="goTo(10)">← Voltar ao Resumo</button>
  </div>`;
}

/* "Exportar PDF" — usa o diálogo de impressão nativo do navegador
   (window.print() + CSS @media print em styles.css) em vez de gerar o
   PDF em JS puro (jsPDF/html2pdf) — sem precisar de nenhuma biblioteca
   externa nova, funciona offline, e todo navegador (incluindo mobile:
   Chrome Android e Safari iOS têm "Salvar como PDF"/"Opções de
   Impressão" nativos no diálogo de impressão) já sabe fazer isso bem.
   O CSS de impressão esconde tudo que não faz sentido no papel (header,
   barra de progresso, floaters, botões ⓘ/Editar/navegação) e deixa só
   o conteúdo da ficha. */
function exportPDF(){
  window.print();
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

/* Card de Armadura/Escudo com pill "Equipar"/"Equipado" no Resumo —
   mesmo padrão visual/interação de traitBox()+pick-btn já usado pra
   Legado do Tiferino/Linhagem Élfica etc. (.option-block.selected fica
   azul clarinho, o botão vira preenchido). Clicável mesmo quando já
   equipado (reafirma a mesma escolha, no-op inofensivo) — mesmo
   comportamento que os outros pick-btn de escolha única já têm. */
function renderEquipCard(it, isEquipped, pickFn){
  const item = it.id ? findShopItem(it.id) : null;
  return `<div class="option-block ${isEquipped?'selected':''}">
    <h3 style="color:var(--gold);margin-top:0;">${it.label}${it.qty>1?` ×${it.qty}`:''}</h3>
    ${item && item.d ? `<p>${item.d}</p>` : ''}
    <button class="pick-btn" data-pick="${it.id}" data-fn="${pickFn}">${isEquipped?'Equipado':'Equipar'}</button>
  </div>`;
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

  <div class="summary-section"><h3>Alinhamento <button class="edit-link" onclick="editSection(8)">Editar</button></h3>
  <div class="content">${data.alinhamento}</div></div>

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

  ${(()=>{
    /* Armadura(s)/Escudo(s) possuídos ganham um card com pill "Equipar"/
       "Equipado" (pedido do usuário, pra ajudar a preencher a Ficha
       Oficial em PDF certa: qual armadura vale pro cálculo de CA, e se
       marca a caixinha de Escudo). O resto do equipamento continua como
       lista simples de pills, igual antes. */
    const armorItems = sheet.equipamento.itens.filter(it=>it.id && ARMOR_AC[it.id]);
    const shieldItems = sheet.equipamento.itens.filter(it=>it.id===SHIELD_ITEM_ID);
    const otherItems = sheet.equipamento.itens.filter(it=>!(it.id && ARMOR_AC[it.id]) && it.id!==SHIELD_ITEM_ID);
    const equippedArmorId = sheet.combate.ac.armorId;
    return `
  ${armorItems.length ? `
  <div class="summary-section"><h3>Armadura Equipada</h3>
  <div class="content">${armorItems.map(it=>renderEquipCard(it, it.id===equippedArmorId, 'pickEquippedArmor')).join('')}</div></div>` : ''}

  ${shieldItems.length ? `
  <div class="summary-section"><h3>Escudo Equipado</h3>
  <div class="content">${shieldItems.map(it=>renderEquipCard(it, sheet.combate.ac.shieldEquipped, 'pickEquippedShield')).join('')}</div></div>` : ''}

  <div class="summary-section"><h3>Equipamento <button class="edit-link" onclick="editSection(9)">Editar</button></h3>
  <div class="content">
    ${otherItems.length ? otherItems.map(it=>`<span class="pill-static">${it.label}${it.qty>1?` ×${it.qty}`:''}</span>`).join('') : (sheet.equipamento.itens.length ? '' : '<span style="color:var(--parchment-dim);">Nenhum item.</span>')}
    <div style="margin-top:8px;font-family:'Cinzel',serif;color:var(--gold);">Dinheiro restante: ${fmtGold(sheet.equipamento.poRestante)} PO</div>
  </div></div>`;
  })()}

  <div class="no-print" style="margin:16px 0;display:flex;flex-wrap:wrap;gap:10px;">
    <button class="btn primary" onclick="copySummaryText()">${copyFeedback ? 'Copiado! ✓' : '📋 Copiar Resumo'}</button>
    <button class="btn primary" onclick="exportPDF()">📄 Exportar PDF</button>
    <button class="btn primary" id="exportOfficialPdfBtn" onclick="exportCharacterPdf()">📥 Baixar Ficha Oficial (PDF)</button>
    <button class="btn primary" onclick="goToMestreIAExport()">🧙 Exportar para MestreIA</button>
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
