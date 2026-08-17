/* 08-handlers.js — Reset do wizard, ligação dos event handlers (attachStepHandlers) e TODOS os handlers "pick" / "toggle" — um por escolha de cada classe/espécie/antecedente/loja/atributo.
   Extraído de index.html (linhas 4250-4700 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
function freshSpeciesData(){
  return {
    tiefling:{tamanho:null,legado:null,atributoLegado:null},
    pequenino:{},
    aasimar:{tamanho:null},
    anao:{},
    orc:{},
    humano:{tamanho:null,pericia:null,talento:null},
    draconato:{heranca:null},
    elfo:{pericia:null,linhagem:null},
    gnomo:{linhagem:null,atributoLinhagem:null},
    golias:{ancestralidade:null}
  };
}
function resetWizard(){
  if(!confirm('Isso apaga o personagem atual e começa do zero. Continuar?')) return;
  step = 0;
  const bgDataInit = {};
  Object.values(BACKGROUND_DATA_KEY).forEach(key=>{
    bgDataInit[key] = { abilityPlan:null, equipment:null, habilidoso:[], ferramentaEscolhida:null, iniciadoCantrips:[], iniciadoSpell1:[] };
  });
  data = Object.assign({ characterName:'', especie:null, antecedente:null, classe:null, alinhamento:null,
    equippedArmorId:null, equippedShieldId:null,
    bruxo:{skills:[],pactBoon:null,cantrips:[],tomoCantrips:[],spells1:[],tomoRituals:[],equipment:null},
    barbaro:{skills:[],maestria:[],equipment:null},
    bardo:{skills:[],cantrips:[],spells1:[],instruments:[],equipment:null},
    mago:{skills:[],cantrips:[],spellbook:[],prepared:[],equipment:null},
    paladino:{skills:[],maestria:[],prepared:[],equipment:null},
    psionico:{skills:[],cantrips:[],spells1:[],equipment:null},
    clerigo:{skills:[],ordem:null,cantrips:[],spells1:[],equipment:null},
    guerreiro:{skills:[],estilo:null,maestria:[],equipment:null},
    ladino:{skills:[],especialista:[],maestria:[],equipment:null},
    druida:{skills:[],ordem:null,cantrips:[],spells1:[],equipment:null},
    feiticeiro:{skills:[],cantrips:[],spells1:[],equipment:null},
    monge:{skills:[],equipment:null,toolCategory:null,toolChoice:null},
    guardiao:{skills:[],spells1:[],maestria:[],equipment:null},
    idiomas:{comuns:[],extra:[]},
    attrs:{}, shop:{purchases:{},collapsedCats:{},filterByProf:false}, returnToSummary:false, freeAbilityRule:false },
    freshSpeciesData(), bgDataInit);
  persist(); render();
}

function attachStepHandlers(){
  document.querySelectorAll('[data-fn]').forEach(el=>{
    if(el.tagName==='INPUT'){
      el.addEventListener('input', ()=>{
        const item = el.getAttribute('data-item');
        let v = parseInt(el.value)||0;
        if(v<0) v=0;
        shopSetQty(item, v);
      });
    } else {
      el.addEventListener('click', ()=>{
        const fn = el.getAttribute('data-fn');
        const val = el.getAttribute('data-pick');
        window[fn](val);
      });
    }
  });
}

function pickSpecies(v){ data.especie=v; persist(); render(); }
function pickBackground(v){ data.antecedente=v; persist(); render(); }
function pickClass(v){ data.classe=v; persist(); render(); }

function pickTamanho(v){ data.tiefling.tamanho=v; persist(); render(); }
function pickTamanhoAasimar(v){ data.aasimar.tamanho=v; persist(); render(); }
function pickTamanhoHumano(v){ data.humano.tamanho=v; persist(); render(); }
function pickHumanoPericia(v){ data.humano.pericia=v; persist(); render(); }
function pickHumanoTalento(v){ data.humano.talento=v; persist(); render(); }
function pickHerancaDraconica(v){ data.draconato.heranca=v; persist(); render(); }
function pickElfoPericia(v){ data.elfo.pericia=v; persist(); render(); }
function pickLinhagemElfica(v){ data.elfo.linhagem=v; persist(); render(); }
function pickLinhagemGnomica(v){ data.gnomo.linhagem=v; persist(); render(); }
function pickAtributoLinhagemGnomica(v){ data.gnomo.atributoLinhagem=v; persist(); render(); }
function pickAncestralidadeGigante(v){ data.golias.ancestralidade=v; persist(); render(); }
/* Antes tinha uma limpeza automática aqui que apagava da lista da
   classe/Tomo o truque que virou redundante ao trocar de legado — META
   PENDÊNCIA RESOLVIDA (achado real de usuário: "troquei de legado, um
   truque que eu tinha escolhido sumiu da tela e ficou faltando 1
   escolha, sem aviso nenhum do porquê"). Tirado de propósito: agora o
   truque continua escolhido (spellChoiceList() passa a mostrar seleções
   que caíram fora do filtro, marcadas, em vez de escondê-las — ver nota
   lá) e a caixa de Duplicidade do Resumo avisa se ficar mesmo
   duplicado. O jogador decide se troca ou deixa (redundante, mas sem
   erro de dados nem escolha sumindo sem explicação). */
function pickLegado(v){
  data.tiefling.legado=v;
  persist(); render();
}
function pickAtributoLegado(v){ data.tiefling.atributoLegado=v; persist(); render(); }

function toggleBruxoSkill(v){ const s=data.bruxo.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function pickPactBoon(v){ data.bruxo.pactBoon=v; if(v!=='Pacto do Tomo'){data.bruxo.tomoCantrips=[];data.bruxo.tomoRituals=[];} persist(); render(); }
function toggleCantrip(v){ const s=data.bruxo.cantrips; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function toggleTomoCantrip(v){ const s=data.bruxo.tomoCantrips; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<3)s.push(v); persist(); render(); }
function toggleSpell1(v){ const s=data.bruxo.spells1; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function toggleTomoRitual(v){ const s=data.bruxo.tomoRituals; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function pickBruxoEquip(v){ data.bruxo.equipment=v; persist(); render(); }
function toggleBarbaroSkill(v){ const s=data.barbaro.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function toggleBarbaroMaestria(v){ const s=data.barbaro.maestria; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<BARBARO.maestriaCount)s.push(v); persist(); render(); }
function pickBarbaroEquip(v){ data.barbaro.equipment=v; persist(); render(); }
function toggleBardoSkill(v){ const s=data.bardo.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<BARDO.skillsCount)s.push(v); persist(); render(); }
function toggleBardoCantrip(v){ const s=data.bardo.cantrips; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function toggleBardoSpell1(v){ const s=data.bardo.spells1; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<4)s.push(v); persist(); render(); }
function toggleBardoInstrument(v){ const s=data.bardo.instruments; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<BARDO.toolsCount)s.push(v); persist(); render(); }
function pickBardoEquip(v){ data.bardo.equipment=v; persist(); render(); }
function toggleMagoSkill(v){ const s=data.mago.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function toggleMagoCantrip(v){ const s=data.mago.cantrips; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<MAGO.cantripsCount)s.push(v); persist(); render(); }
function toggleMagoSpellbook(v){
  const mg = data.mago;
  const i = mg.spellbook.indexOf(v);
  if(i>=0){
    mg.spellbook.splice(i,1);
    const pi = mg.prepared.indexOf(v);
    if(pi>=0) mg.prepared.splice(pi,1); // sai do livro, sai também das preparadas
  } else if(mg.spellbook.length<MAGO.spellbookCount){
    mg.spellbook.push(v);
  }
  persist(); render();
}
function toggleMagoPrepared(v){ const s=data.mago.prepared; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<MAGO.preparedCount)s.push(v); persist(); render(); }
function pickMagoEquip(v){ data.mago.equipment=v; persist(); render(); }
function togglePaladinoSkill(v){ const s=data.paladino.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function togglePaladinoPrepared(v){ const s=data.paladino.prepared; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<PALADINO.preparedCount)s.push(v); persist(); render(); }
function togglePaladinoMaestria(v){ const s=data.paladino.maestria; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<PALADINO.maestriaCount)s.push(v); persist(); render(); }
function pickPaladinoEquip(v){ data.paladino.equipment=v; persist(); render(); }
function togglePsionicoSkill(v){ const s=data.psionico.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function togglePsionicoCantrip(v){ const s=data.psionico.cantrips; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<PSIONICO.cantripsCount)s.push(v); persist(); render(); }
function togglePsionicoSpell1(v){ const s=data.psionico.spells1; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<PSIONICO.preparedCount)s.push(v); persist(); render(); }
function pickPsionicoEquip(v){ data.psionico.equipment=v; persist(); render(); }
function toggleClerigoSkill(v){ const s=data.clerigo.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function pickClerigoOrdem(v){
  const cl = data.clerigo;
  cl.ordem = v;
  const max = clerigoEffectiveCantripsCount();
  if(cl.cantrips.length>max) cl.cantrips.length = max; // trocar de Taumaturgo pra Protetor perde o truque extra
  persist(); render();
}
function toggleClerigoCantrip(v){ const s=data.clerigo.cantrips; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<clerigoEffectiveCantripsCount())s.push(v); persist(); render(); }
function toggleClerigoSpell1(v){ const s=data.clerigo.spells1; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<CLERIGO.preparedCount)s.push(v); persist(); render(); }
function pickClerigoEquip(v){ data.clerigo.equipment=v; persist(); render(); }
function toggleGuerreiroSkill(v){ const s=data.guerreiro.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function pickGuerreiroEstilo(v){ data.guerreiro.estilo=v; persist(); render(); }
function toggleGuerreiroMaestria(v){ const s=data.guerreiro.maestria; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<GUERREIRO.maestriaCount)s.push(v); persist(); render(); }
function pickGuerreiroEquip(v){ data.guerreiro.equipment=v; persist(); render(); }
function toggleLadinoSkill(v){
  const ld = data.ladino;
  const i = ld.skills.indexOf(v);
  if(i>=0){
    ld.skills.splice(i,1);
    const ei = ld.especialista.indexOf(v);
    if(ei>=0) ld.especialista.splice(ei,1); // perícia saiu do pool de "já proficiente", sai do Especialista também
  } else if(ld.skills.length<LADINO.skillsCount){
    ld.skills.push(v);
  }
  persist(); render();
}
function toggleLadinoEspecialista(v){ const s=data.ladino.especialista; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<LADINO.especialistaCount)s.push(v); persist(); render(); }
function toggleLadinoMaestria(v){ const s=data.ladino.maestria; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<LADINO.maestriaCount)s.push(v); persist(); render(); }
function pickLadinoEquip(v){ data.ladino.equipment=v; persist(); render(); }
function toggleDruidaSkill(v){ const s=data.druida.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function pickDruidaOrdem(v){
  const dr = data.druida;
  dr.ordem = v;
  const max = druidaEffectiveCantripsCount();
  if(dr.cantrips.length>max) dr.cantrips.length = max;
  persist(); render();
}
function toggleDruidaCantrip(v){ const s=data.druida.cantrips; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<druidaEffectiveCantripsCount())s.push(v); persist(); render(); }
function toggleDruidaSpell1(v){ const s=data.druida.spells1; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<DRUIDA.preparedCount)s.push(v); persist(); render(); }
function pickDruidaEquip(v){ data.druida.equipment=v; persist(); render(); }
function toggleFeiticeiroSkill(v){ const s=data.feiticeiro.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function toggleFeiticeiroCantrip(v){ const s=data.feiticeiro.cantrips; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<FEITICEIRO.cantripsCount)s.push(v); persist(); render(); }
function toggleFeiticeiroSpell1(v){ const s=data.feiticeiro.spells1; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<FEITICEIRO.preparedCount)s.push(v); persist(); render(); }
function pickFeiticeiroEquip(v){ data.feiticeiro.equipment=v; persist(); render(); }
function toggleMongeSkill(v){ const s=data.monge.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function pickMongeToolCategory(v){
  if(data.monge.toolCategory!==v) data.monge.toolChoice=null; // troca de categoria zera o item específico já escolhido
  data.monge.toolCategory=v; persist(); render();
}
function pickMongeToolChoice(v){ data.monge.toolChoice=v; persist(); render(); }
function pickMongeEquip(v){ data.monge.equipment=v; persist(); render(); }
function toggleGuardiaoSkill(v){ const s=data.guardiao.skills; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<GUARDIAO.skillsCount)s.push(v); persist(); render(); }
function toggleGuardiaoSpell1(v){ const s=data.guardiao.spells1; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<GUARDIAO.preparedCount)s.push(v); persist(); render(); }
function toggleGuardiaoMaestria(v){ const s=data.guardiao.maestria; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<GUARDIAO.maestriaCount)s.push(v); persist(); render(); }
function pickGuardiaoEquip(v){ data.guardiao.equipment=v; persist(); render(); }

/* Retorna o objeto de dados do antecedente ativo (data.charlatao, data.nobre,
   data.andarilho etc.) — os handlers abaixo (plano de atributos, Habilidoso,
   equipamento) são compartilhados entre TODOS os antecedentes, via o mapa
   BACKGROUND_DATA_KEY. Se data.antecedente ainda não tiver sido escolhido,
   cai no charlatao só pra nunca retornar undefined. */
function activeBgData(){
  const key = BACKGROUND_DATA_KEY[data.antecedente] || 'charlatao';
  return data[key];
}
/* Mesma ideia, mas retorna o objeto de dados FIXOS (CHARLATAO, NOBRE,
   ANDARILHO etc.), via BACKGROUND_CONST. */
function activeBgConst(){
  return BACKGROUND_CONST[data.antecedente] || CHARLATAO;
}

/* ==========================================================================
   DEDUPLICAÇÃO DE ESCOLHAS ENTRE FONTES (Classe / Antecedente / Espécie)
   ==========================================================================
   Perícia, talento, truque e magia de 1º círculo podem vir de mais de uma
   fonte ao mesmo tempo — seja uma CONCESSÃO FIXA (espécie ou classe dá
   automático, sem escolha do jogador — ex: truque do Legado Ínfero do
   Tiferino, Falar com Animais do Druida) ou uma ESCOLHA do jogador feita
   noutra fonte (ex: perícia da classe, truque da classe, talento Versátil
   do Humano). Nas duas situações o item NUNCA é escondido das listas de
   escolha de outras fontes — versão anterior escondia (evitava "escolher"
   de novo algo que já tem e não ganha nada com isso), mas trocar de
   espécie/antecedente DEPOIS de já ter escolhido algo que virou redundante
   fazia a escolha sumir da tela sem aviso, com a vaga presa. Agora toda
   lista de escolha (spellChoiceList/groupedChoiceList/featPickList/
   groupedSinglePick) recebe o resultado destas funções como `elsewhere` —
   item continua aparecendo, clicável, e só ganha ⚠️/pill-orphan se for
   ESCOLHIDO aqui E também estiver em `elsewhere` (duplicata de verdade,
   sem benefício real). Cada função abaixo recebe a fonte que está sendo
   renderizada (pra não se auto-excluir) e devolve tudo que as OUTRAS
   fontes já garantem. */

/* Truques/magias que a ESPÉCIE concede de graça no nível 1 (Tiferino: Legado
   Ínfero; Aasimar: Portador da Luz; Elfo: Linhagem Élfica; Gnomo: Linhagem
   Gnômica — cada uma lida com nivel1.concede da subespécie escolhida, ou
   tracosFixos quando não depende de subespécie, como o Aasimar). Generaliza
   o que antes só cobria o Tiferino. tipo é 'truque' ou 'magia'. */
function speciesFixedGrants(tipo){
  const out = [];
  const collect = concede => (concede||[]).forEach(item => { if(item.tipo===tipo) out.push(item.nome); });
  if(data.especie==='Aasimar'){
    AASIMAR.tracosFixos.forEach(tr=>collect(tr.concede));
  } else if(data.especie==='Tiferino' && data.tiefling.legado){
    const opt = TIEFLING.subespecie.opcoes.find(o=>o.nome===data.tiefling.legado);
    if(opt) collect(opt.nivel1.concede);
  } else if(data.especie==='Elfo' && data.elfo.linhagem){
    const opt = ELFO.subespecie.opcoes.find(o=>o.nome===data.elfo.linhagem);
    if(opt) collect(opt.nivel1.concede);
  } else if(data.especie==='Gnomo' && data.gnomo.linhagem){
    const opt = GNOMO.subespecie.opcoes.find(o=>o.nome===data.gnomo.linhagem);
    if(opt) collect(opt.nivel1.concede);
  }
  return out;
}
function speciesGrantedCantrips(){ return speciesFixedGrants('truque'); }
function speciesGrantedSpells(){ return speciesFixedGrants('magia'); }

/* Mapa classe -> campo em data.<classe> que guarda as magias de 1º círculo
   ESCOLHIDAS de uma lista (não usado pra truques, que são sempre .cantrips
   em toda classe conjuradora). Mago não tem spells1: a escolha de verdade
   acontece no Livro de Magias (.spellbook); .prepared é só um subconjunto
   do que já está no livro, não uma nova escolha da lista mestra, por isso
   não teria com o que colidir de novo aqui. */
const CLASS_SPELL1_FIELD = { "Bruxo":"spells1", "Bardo":"spells1", "Mago":"spellbook", "Paladino":"prepared", "Psiônico":"spells1", "Clérigo":"spells1", "Druida":"spells1", "Feiticeiro":"spells1", "Guardião":"spells1" };

/* Perícias já garantidas por QUALQUER fonte (classe, antecedente fixo,
   Habilidoso, Humano/Hábil, Elfo/Sentidos Aguçados), separadas por fonte —
   quem chama exclui a própria fonte antes de filtrar a própria lista.
   antecedenteFixo só entra se data.antecedente estiver de fato preenchido:
   activeBgConst() cai no fallback CHARLATAO quando ainda é null (padrão
   usado no app inteiro pra nunca quebrar antes da escolha), mas CHARLATAO.
   skills não é "nada" — é uma lista de verdade (Enganação, Prestidigitação).
   Sem essa guarda, um Bruxo (que também tem Enganação na sua própria lista)
   já começava com Enganação marcada ⚠️ antes mesmo de chegar no passo de
   Antecedente, achando que Charlatão já tinha sido escolhido (achado real
   de usuário: ficha zerada, só Bruxo escolhido, Enganação já veio marcada).
   classe não precisa da mesma guarda porque activeClassData() (diferente de
   activeClassConst()) devolve o objeto de DADOS do jogador (data.bruxo etc,
   não a lista de opções da classe) — o fallback pra 'bruxo' ainda aponta pra
   um .skills vazio (nada escolhido), não pra uma lista fixa não-vazia. */
function skillsGrantedBySource(){
  return {
    classe: (activeClassData().skills || []),
    antecedenteFixo: data.antecedente ? (activeBgConst().skills || []) : [],
    habilidoso: (activeBgData().habilidoso || []).filter(s=>ALL_SKILLS.includes(s)),
    humano: (data.especie==='Humano' && data.humano.pericia) ? [data.humano.pericia] : [],
    elfo: (data.especie==='Elfo' && data.elfo.pericia) ? [data.elfo.pericia] : []
  };
}
function skillsGrantedElsewhere(excludeSource){
  const bySource = skillsGrantedBySource();
  return [].concat(...Object.keys(bySource).filter(k=>k!==excludeSource).map(k=>bySource[k]));
}

/* Nome "puro" do talento fixo do antecedente ativo (bgConst.feat guarda
   "Nome — descrição", ou "Iniciado em Magia (Classe) — descrição" nos 3
   antecedentes de Iniciado em Magia) — usado pra excluir esse talento da
   lista do Versátil (Humano), que hoje já usa os mesmos 10 nomes da
   categoria "Origem" do banco de talentos. Mesma guarda de
   skillsGrantedBySource() acima: sem data.antecedente escolhido, o fallback
   CHARLATAO faria "Habilidoso" (talento fixo dele, que também é um nome
   válido na lista de Origem) aparecer marcado ⚠️ sem nenhum antecedente
   ter sido escolhido de verdade. */
function backgroundFeatBaseName(){
  if(!data.antecedente) return '';
  return (activeBgConst().feat || '').split(' — ')[0].split(' (')[0].trim();
}

/* Confere se o personagem tem um talento específico por NOME, olhando as
   duas fontes possíveis de talento fixo/escolhido no nível 1: o talento
   fixo do antecedente (backgroundFeatBaseName()) e o Versátil do Humano
   (data.humano.talento). Usado hoje só pro Alerta (bônus de Proficiência
   na Iniciativa), mas serve pra qualquer talento por nome no futuro. */
function hasFeatByName(name){
  return backgroundFeatBaseName()===name || (data.especie==='Humano' && data.humano.talento===name);
}

/* Truques/magias de 1º círculo já ESCOLHIDOS (não concedidos de graça) por
   outra fonte — hoje as duas fontes que escolhem de uma lista de verdade
   são a própria Classe e o Iniciado em Magia do Antecedente (Acólito/Guia/
   Sábio), cujas listas podem se sobrepor com a de outra classe. Bruxo tem
   mais 2 campos de escolha (Truques/Magias Rituais do Pacto do Tomo,
   tomoCantrips/tomoRituals — "de qualquer classe", então colidem com
   QUALQUER lista) que ficaram de fora daqui até essa checagem (achado
   real de usuário: escolher "Detectar Magia" via Pacto do Tomo e DEPOIS
   via Sábio/Iniciado em Magia criava duplicata de verdade sem nenhum
   aviso na tela do Antecedente — só aparecia ⚠️ ao voltar pra tela da
   Classe, porque cd.cantrips/cd[field] sozinhos não cobriam os campos do
   Tomo). cd.tomoCantrips/cd.tomoRituals só existem em data.bruxo — em
   qualquer outra classe active ficam undefined, então o push simplesmente
   não roda, sem precisar de um switch por classe aqui. */
function chosenCantripsElsewhere(excludeSource){
  const out = [];
  if(excludeSource!=='classe'){
    const cd = activeClassData();
    if(cd && cd.cantrips) out.push(...cd.cantrips);
    if(cd && cd.tomoCantrips) out.push(...cd.tomoCantrips);
  }
  if(excludeSource!=='iniciadoEmMagia'){
    out.push(...(activeBgData().iniciadoCantrips || []));
  }
  return out;
}
function chosenSpells1Elsewhere(excludeSource){
  const out = [];
  if(excludeSource!=='classe'){
    const field = CLASS_SPELL1_FIELD[data.classe];
    const cd = activeClassData();
    if(field && cd && cd[field]) out.push(...cd[field]);
    if(cd && cd.tomoRituals) out.push(...cd.tomoRituals);
  }
  if(excludeSource!=='iniciadoEmMagia'){
    out.push(...(activeBgData().iniciadoSpell1 || []));
  }
  return out;
}

/* Regra da casa: por padrão (freeAbilityRule=true) os bônus de atributo do
   antecedente podem ir em qualquer um dos 6 atributos (como o livro já
   permite oficialmente). Se o jogador desmarcar o checkbox, trava a escolha
   só nos 3 atributos sugeridos daquele antecedente específico — uma
   restrição EXTRA, mais dura que a regra oficial. */
function allowedAbilitiesFor(bgConst){ return data.freeAbilityRule ? ABILITIES : bgConst.suggestedAbilities; }

function sanitizeAbilityPlans(){
  Object.keys(BACKGROUND_CONST).map(nome=>[data[BACKGROUND_DATA_KEY[nome]], BACKGROUND_CONST[nome]]).forEach(([bgData, bgConst])=>{
    const plan = bgData.abilityPlan;
    if(!plan) return;
    const allowed = allowedAbilitiesFor(bgConst);
    if(plan.type==='2-1'){
      if(plan.plus2 && !allowed.includes(plan.plus2)) plan.plus2=null;
      if(plan.plus1 && (!allowed.includes(plan.plus1) || plan.plus1===plan.plus2)) plan.plus1=null;
    } else if(plan.type==='1-1-1'){
      plan.plusOnes = (plan.plusOnes||[]).filter(a=>allowed.includes(a));
    }
  });
}
function toggleFreeAbilityRule(){ data.freeAbilityRule = !data.freeAbilityRule; sanitizeAbilityPlans(); persist(); render(); }

/* Bloco de UI "Distribuição de Atributos", compartilhado entre Charlatão e
   Nobre (era duplicado igual nos dois antes desta função existir). */
function renderAbilityPlanBlock(bgConst, plan){
  const allowed = allowedAbilitiesFor(bgConst);
  return `<h3 id="grp-3-abilityplan">Distribuição de Atributos</h3>
  <div style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:10px;" onclick="toggleFreeAbilityRule()">
    <input type="checkbox" style="width:16px;height:16px;flex:none;margin:0;pointer-events:none;" ${data.freeAbilityRule?'checked':''}>
    <span>Regra da casa: Sem restrição de antecedente</span>
  </div>
  <div class="intro" style="margin-bottom:8px;">
    ${data.freeAbilityRule
      ? `Com a regra da casa marcada, você pode colocar os bônus em qualquer um dos 6 atributos.`
      : `Regra oficial do livro: os bônus ficam travados nos atributos sugeridos pra este antecedente — <b>${bgConst.suggestedAbilities.join(', ')}</b>. Marque a regra da casa acima pra liberar todos os 6.`}
    Escolha +2 em um e +1 em outro, OU +1 em três.
  </div>
  <div class="check-list" style="margin-bottom:10px;">
    <div class="check-pill ${plan && plan.type==='2-1'?'selected':''}" data-pick="2-1" data-fn="pickAbilityPlanType">+2 / +1</div>
    <div class="check-pill ${plan && plan.type==='1-1-1'?'selected':''}" data-pick="1-1-1" data-fn="pickAbilityPlanType">+1 / +1 / +1</div>
  </div>
  ${plan && plan.type==='2-1' ? `
    <div style="display:flex; gap:20px; margin-bottom:16px; flex-wrap:wrap;">
      <div>
        <div style="font-size:0.75rem;color:var(--parchment-dim);margin-bottom:6px;">+2 em:</div>
        <div class="check-list">${allowed.map(a=>`<div class="check-pill ${plan.plus2===a?'selected':''}" data-pick="${a}" data-fn="pickPlus2">${a}</div>`).join('')}</div>
      </div>
      <div>
        <div style="font-size:0.75rem;color:var(--parchment-dim);margin-bottom:6px;">+1 em:</div>
        <div class="check-list">${allowed.filter(a=>a!==plan.plus2).map(a=>`<div class="check-pill ${plan.plus1===a?'selected':''}" data-pick="${a}" data-fn="pickPlus1">${a}</div>`).join('')}</div>
      </div>
    </div>` : ''}
  ${plan && plan.type==='1-1-1' ? `
    <div style="margin-bottom:16px;">
      <div style="font-size:0.75rem;color:var(--parchment-dim);margin-bottom:6px;">+1 em (escolha 3):</div>
      <div class="check-list">${allowed.map(a=>{
        const sel = (plan.plusOnes||[]).includes(a);
        const disabled = !sel && (plan.plusOnes||[]).length>=3;
        return `<div class="check-pill ${sel?'selected':''} ${disabled?'disabled':''}" ${disabled?'':`data-pick="${a}" data-fn="pickPlusOneOf3"`}>${a}</div>`;
      }).join('')}</div>
      <div class="counter ${(plan.plusOnes||[]).length===3?'ok':''}">${(plan.plusOnes||[]).length}/3 escolhidos</div>
    </div>` : ''}`;
}

function pickAbilityPlanType(v){ activeBgData().abilityPlan = v==='1-1-1' ? {type:'1-1-1', plusOnes:[]} : {type:'2-1', plus2:null, plus1:null}; persist(); render(); }
function pickPlusOneOf3(v){
  const plan = activeBgData().abilityPlan;
  if(!plan.plusOnes) plan.plusOnes=[];
  const i = plan.plusOnes.indexOf(v);
  if(i>=0) plan.plusOnes.splice(i,1); else if(plan.plusOnes.length<3) plan.plusOnes.push(v);
  persist(); render();
}
function pickPlus2(v){ const bg=activeBgData(); bg.abilityPlan.plus2=v; if(bg.abilityPlan.plus1===v) bg.abilityPlan.plus1=null; persist(); render(); }
function pickPlus1(v){ activeBgData().abilityPlan.plus1=v; persist(); render(); }
function pickBgEquip(v){ activeBgData().equipment=v; persist(); render(); }
function toggleHabilidoso(v){ const s=activeBgData().habilidoso; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<3)s.push(v); persist(); render(); }
function toggleIniciadoCantrip(v){ const s=activeBgData().iniciadoCantrips; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<2)s.push(v); persist(); render(); }
function toggleIniciadoSpell1(v){ const s=activeBgData().iniciadoSpell1; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<1)s.push(v); persist(); render(); }
function pickFerramentaEscolhida(v){ activeBgData().ferramentaEscolhida=v; persist(); render(); }

/* "Equipar" Armadura/Escudo no Resumo (renderSummary(), cards com pill
   Equipar/Equipado — mesmo padrão de pickLegado() pra Legado do
   Tiferino). Só entra em `data` quando o jogador CLICA numa opção — o
   padrão (melhor CA calculada) é decidido on-the-fly por
   resolveEquippedArmorId()/resolveEquippedShieldId() (js/07-compute-
   and-summary.js) sem precisar disso aqui, então essas duas funções só
   existem pra guardar uma escolha EXPLÍCITA que sobrescreve o padrão. */
function pickEquippedArmor(id){ data.equippedArmorId=id; persist(); render(); }
function pickEquippedShield(id){ data.equippedShieldId=id; persist(); render(); }


function setAttr(ability, value){
  if(value===''){
    delete data.attrs[ability];
  } else {
    const v = parseInt(value);
    // se outro atributo já tem esse valor, tira de lá (rouba/troca) antes de atribuir aqui
    for(const other of ABILITIES){
      if(other!==ability && data.attrs[other]===v){
        delete data.attrs[other];
        break;
      }
    }
    data.attrs[ability] = v;
  }
  persist(); render();
}

/* Quantidade máxima que dá pra comprar de um item sem estourar o ouro
   disponível, considerando o que já tá no carrinho pros OUTROS itens. */
function maxAffordableQty(id){
  const item = findShopItem(id);
  if(!item) return 0;
  const price = itemPrice(item);
  if(price<=0) return 999; // item de custo 0 (mesmo com desconto), sem limite prático
  const purchases = data.shop.purchases||{};
  let othersCost = 0;
  for(const [otherId,q] of Object.entries(purchases)){
    if(otherId===id) continue;
    const it = findShopItem(otherId);
    if(it) othersCost += itemPrice(it)*q;
  }
  const budget = startingGold() - othersCost;
  if(budget<=0) return 0;
  return Math.floor((budget / price) + 1e-9); // epsilon evita erro de ponto flutuante
}

function shopSetQty(id, qty){
  if(!data.shop.purchases) data.shop.purchases={};
  if(qty<0) qty=0;
  const maxQty = maxAffordableQty(id);
  if(qty>maxQty) qty=maxQty;
  if(qty<=0) delete data.shop.purchases[id];
  else data.shop.purchases[id]=qty;
  persist(); render();
}
function shopInc(id){ shopSetQty(id, (data.shop.purchases[id]||0)+1); }
function shopDec(id){ shopSetQty(id, Math.max(0,(data.shop.purchases[id]||0)-1)); }
function toggleShopCategory(detailsEl){
  if(!data.shop.collapsedCats) data.shop.collapsedCats={};
  data.shop.collapsedCats[detailsEl.dataset.cat] = !detailsEl.open;
  persist(); // não chama render() — o <details> já se abre/fecha sozinho, só precisamos lembrar o estado pra próxima renderização
}

