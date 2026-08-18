/* 06-idiomas-attrs-shop.js — Passos de Idiomas, Atributos, Alinhamento e a Loja (grade de itens, ouro inicial/gasto, filtro de proficiência).
   Extraído de index.html (linhas 3309-3522 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
/* Todo idioma que pode aparecer como ESCOLHA (comum + raro) — exceto
   Gíria dos Ladrões, que nunca é uma escolha de verdade pra ninguém: é
   automática pro Ladino (ver bloco isLadino abaixo) e não existe fora
   disso, mesmo pra quem pega um idioma raro por acordo com o Mestre.
   Centralizado aqui pra tela e Randomizar nunca divergirem. */
function choosableLanguages(){
  return [...COMMON_LANGUAGES, ...RARE_LANGUAGES].filter(l => l!=='Gíria dos Ladrões');
}

function renderIdiomasStep(){
  const id = data.idiomas;
  const isLadino = data.classe==='Ladino';
  return `<h2>Passo — Idiomas</h2>
  <div class="intro">Todo personagem conhece Comum, além de mais idiomas escolhidos abaixo.</div>

  <div class="check-list" style="margin-bottom:14px;">
    <span class="group-label" style="margin:0 2px 0 0;">Automático:</span>
    <div class="check-pill selected">Comum</div>
  </div>

  <h3 id="grp-6-comuns">Escolha 2 Idiomas</h3>
  <div class="intro" style="margin-bottom:8px;color:var(--parchment-dim);">Idiomas raros (grupo "Raros" abaixo) normalmente exigem contato direto com aquele povo ou cultura — combine com o Mestre antes de escolher um, e faça sentido com a história do seu personagem.</div>
  ${groupedChoiceList(languageGroupsByCategory(choosableLanguages()), id.comuns, 2, 'toggleIdiomaComum')}
  <div class="counter ${id.comuns.length===2?'ok':''}">${id.comuns.length}/2 escolhidos</div>

  ${isLadino ? `
  <h3>Ladino — Gíria dos Ladrões</h3>
  <div class="intro" style="margin-bottom:8px;">Como Ladino, você conhece a Gíria dos Ladrões automaticamente (não conta como uma das escolhas acima).</div>
  <div class="check-list" style="margin-bottom:14px;">
    <div class="check-pill selected">Gíria dos Ladrões</div>
  </div>

  <h3 id="grp-6-extra">Escolha 1 Idioma Adicional</h3>
  ${groupedChoiceList(languageGroupsByCategory(choosableLanguages()), id.extra, 1, 'toggleIdiomaExtra', id.comuns)}
  <div class="counter ${id.extra.length===1?'ok':''}">${id.extra.length}/1 escolhido</div>
  ` : ''}
  ${nav(canAdvance())}`;
}

function toggleIdiomaComum(v){
  const id = data.idiomas;
  const i = id.comuns.indexOf(v);
  if(i>=0){
    id.comuns.splice(i,1);
  } else if(id.comuns.length<2){
    id.comuns.push(v);
    const ei = id.extra.indexOf(v);
    if(ei>=0) id.extra.splice(ei,1); // idioma virou "comum escolhido" — sai do extra se estava lá
  }
  persist(); render();
}
function toggleIdiomaExtra(v){ const s=data.idiomas.extra; const i=s.indexOf(v); if(i>=0)s.splice(i,1); else if(s.length<1)s.push(v); persist(); render(); }

function renderAttrs(){
  const used = Object.values(data.attrs);
  return `<h2>Passo — Atributos (Array Padrão)</h2>
  <div class="intro">Distribua 15, 14, 13, 12, 10, 8 entre os seis atributos. Valores já usados aparecem em laranja — se você escolher um deles, ele é retirado de onde estava antes e movido pra cá. O bônus do antecedente (Charlatão) é somado automaticamente.</div>
  ${ABILITIES.map(a=>{
    const chosen = data.attrs[a];
    const bonus = getBonusFor(a);
    const final = chosen!==undefined ? chosen+bonus : null;
    return `<div class="attr-row" id="grp-7-attr-${a}">
      <div class="name">${a}</div>
      <select data-ability="${a}" onchange="setAttr('${a}', this.value)">
        <option value="">—</option>
        ${STANDARD_ARRAY.map(v=>{
          const usedElsewhere = used.includes(v) && chosen!==v;
          const label = usedElsewhere ? `${v} (em uso)` : `${v}`;
          const style = usedElsewhere ? 'style="color:#c98a5a;"' : '';
          return `<option value="${v}" ${chosen===v?'selected':''} ${style}>${label}</option>`;
        }).join('')}
      </select>
      <div class="bonus-tag">${bonus?('antecedente '+fmt(bonus)):''}</div>
      <div class="final">${final!==null?`Total ${final} (mod ${fmt(mod(final))})`:''}</div>
    </div>`;
  }).join('')}
  ${nav(canAdvance())}`;
}

/* Passo — Alinhamento (Cap. 4 do PHB 2024): eixo Ordem × eixo Moral, 9
   combinações. Sem restrição de escolha (ex: não bloqueia alinhamento
   Mau) — decisão consciente: diferente de uma mesa de verdade, aqui não
   tem Mestre pra aprovar nada, é só o jogador escolhendo pra si mesmo.
   Reaproveita choiceGridWithInfo() (mesmo componente já usado pro grid
   de Antecedentes) em vez de um layout novo — só precisa de `descricao`
   no infoMap, sem `fields` (não tem tabela de dado extra por
   alinhamento, só o texto). */
function renderAlinhamentoStep(){
  return `<h2>Passo — Alinhamento</h2>
  <div class="intro">Como seu personagem enxerga certo e errado, e como ele se relaciona com regras e tradição. Não muda nenhum número da ficha — é só interpretação.</div>
  <div id="grp-8-alinhamento">
    ${choiceGridWithInfo(ALIGNMENTS, ALIGNMENTS, data.alinhamento, 'pickAlinhamento', ALIGNMENT_INFO)}
  </div>
  ${nav(canAdvance())}`;
}
function pickAlinhamento(v){ data.alinhamento = v; persist(); render(); }

function startingGold(){
  const clsConst = activeClassConst();
  const cls = activeClassData();
  const clsGold = cls.equipment==='C' ? clsConst.equipmentC_gold : cls.equipment==='B' ? clsConst.equipmentB_gold : (cls.equipment==='A' ? clsConst.equipmentA_gold : 0);
  const bgConst = activeBgConst();
  const bg = activeBgData();
  const bgGold = bg.equipment==='B' ? bgConst.equipmentB_gold : (bg.equipment==='A' ? bgConst.equipmentA_gold : 0);
  return clsGold + bgGold;
}
/* Talento Artifista (Origem — vem fixo do Antecedente Artesão, ou
   escolhido no Versátil do Humano): "sempre que você compra um item não
   mágico, recebe um desconto de 20% nele". A Loja só vende item mundano
   (nenhum item mágico no SHOP hoje), então o desconto vale pra tudo.
   hasFeatByName() é a mesma função já usada pro bônus de Iniciativa do
   talento Alerta — cobre as duas fontes possíveis do talento sem
   duplicar a lógica de "onde ele pode vir". */
function shopDiscountFactor(){
  return hasFeatByName('Artifista') ? 0.8 : 1;
}
/* Preço que o personagem PAGA de verdade por 1 unidade do item — já com
   o desconto do Artifista aplicado, se houver. Todo lugar que soma custo
   de compra (gasto total, limite de quantidade, exibição na Loja/
   Carrinho/Resumo/PDF) usa esta função em vez de `item.c` direto, pra
   nunca ter 2 números diferentes de "quanto custa" no app.
   Limitação conhecida, aceita por ser um caso raro: o filtro que esconde
   item mais caro que computeMaxPossibleGold() (ver renderShop()) continua
   comparando contra o preço CHEIO, não o com desconto — computeMaxPossibleGold()
   é um teto teórico entre TODAS as combinações de classe/antecedente, não
   o orçamento deste personagem específico, então recalculá-lo por
   desconto exigiria refazer essa conta pra cada combinação só por causa
   de 1 talento. Na prática só afetaria alguém com Artesão + a combinação
   de maior ouro possível tentando comprar um item bem perto do teto. */
function itemPrice(item){
  return item.c * shopDiscountFactor();
}
function spentGold(){
  let total = 0;
  for(const [id, qty] of Object.entries(data.shop.purchases||{})){
    const item = findShopItem(id);
    if(item) total += itemPrice(item) * qty;
  }
  return total;
}
/* Busca por ID (não mais por nome de exibição — nome pode mudar sem
   quebrar compras salvas, ver nota em data/shop-items.js). */
function findShopItem(id){
  for(const cat of Object.values(SHOP)){
    const found = cat.items.find(i=>i.id===id);
    if(found) return found;
  }
  return null;
}
/* Checa se um item de Arma (categoria "simples"/"marcial" do SHOP) bate
   com a proficiência FINA da classe (não só a categoria) — cruza por nome
   com WEAPON_MASTERY (que tem tipo Corpo a Corpo/À Distância e a lista de
   propriedades de cada arma). weaponProfMeleeOnly e weaponProfFiltroMarcial
   são campos opcionais no CONST da classe (hoje só Monge e Ladino têm),
   ausentes = sem restrição extra além da categoria. Se o nome do item não
   bater com nada em WEAPON_MASTERY (não deveria acontecer — os 28 nomes de
   Armas Simples/Marciais do SHOP foram conferidos 1 a 1 contra
   WEAPON_MASTERY), falha fechado (esconde) em vez de aberto, pra nunca
   mostrar uma arma que a classe não usa bem só por causa de um typo futuro
   de nome entre os dois arquivos. */
function itemMatchesWeaponProf(clsConst, itemName){
  const wm = WEAPON_MASTERY[itemName];
  if(!wm) return false;
  if(clsConst.weaponProfMeleeOnly && wm.tipo!=='Corpo a Corpo') return false;
  if(wm.categoria==='Marcial' && clsConst.weaponProfFiltroMarcial){
    return wm.propriedades.some(p=>clsConst.weaponProfFiltroMarcial.includes(p));
  }
  return true;
}
function toggleShopProfFilter(){ data.shop.filterByProf = !data.shop.filterByProf; persist(); render(); }

/* Popup de detalhe de item da Loja (ⓘ) — só existe pra item com "d"
   preenchido e sem "Dano/Efeito" na própria tabela (Ferramentas/
   Instrumentos, ver hasDanoEfeito em renderShop()), já que é onde o
   texto de "d" (CD de Usar Objeto + o que a ferramenta fabrica) não
   cabe na linha. Mesmo padrão visual/interação de sempre (mochila-
   overlay/mochila-popup, clique fora fecha, guarda só o id — estado de
   UI puro, não entra em data/persist()). */
let shopItemInfoPopup = null;
function openShopItemInfoPopup(id){ shopItemInfoPopup = id; render(); }
function closeShopItemInfoPopup(){ shopItemInfoPopup = null; render(); }
function renderShopItemInfoPopup(){
  if(!shopItemInfoPopup) return '';
  const it = findShopItem(shopItemInfoPopup);
  if(!it || !it.d) return '';
  return `<div class="mochila-overlay" onclick="closeShopItemInfoPopup()">
    <div class="mochila-popup spell-info-popup" onclick="event.stopPropagation()">
      <div class="mochila-popup-header">
        <h3>${it.n}</h3>
        <button class="btn small" onclick="closeShopItemInfoPopup()">✕</button>
      </div>
      <div class="spell-detail">
        <div>${it.d}</div>
        ${it.p && it.p!=='—' ? `<div class="stats" style="margin-top:8px;"><span>${it.p}</span></div>` : ''}
      </div>
    </div>
  </div>`;
}

function renderShop(){
  const remaining = startingGold() - spentGold();
  const purchases = data.shop.purchases||{};
  const clsConst = activeClassConst();
  const maxGold = computeMaxPossibleGold();
  const filtering = data.shop.filterByProf;
  const discount = shopDiscountFactor(); // 0.8 com o talento Artifista, 1 sem
  /* Preview do Mod. de Ataque nas categorias de arma — mesma fórmula de
     computeAttacks()/computeCharacterSheet(), só que ANTES de comprar
     (não depende de posse do item), pro jogador comparar armas na hora
     de decidir a compra em vez de só descobrir no Resumo depois. */
  const finalScore = a => (data.attrs[a]||0) + getBonusFor(a);
  const atkStrMod = mod(finalScore('Força'));
  const atkDexMod = mod(finalScore('Destreza'));
  const atkProf = PROF_BONUS_BY_LEVEL[1];
  let html = `<h2>Loja — Gaste seu Dinheiro Inicial</h2>
  <div class="intro">Por padrão a Loja mostra TODAS as armas e armaduras, pra você conhecer as opções — ferramentas, focos, munição e equipamento de aventura valem pra qualquer um sempre. Itens mais caros que ${fmtGold(maxGold)} PO (o máximo possível de ouro inicial, somando classe + antecedente) não aparecem, porque nunca dá pra comprá-los na criação do personagem.</div>
  ${discount<1 ? `<div class="intro" style="color:var(--gold);">Talento Artifista: 20% de desconto em item não-mágico, já aplicado nos preços abaixo (preço cheio riscado ao lado).</div>` : ''}
  <div style="display:flex;align-items:center;gap:8px;cursor:pointer;margin:10px 0;" onclick="toggleShopProfFilter()">
    <input type="checkbox" style="width:16px;height:16px;flex:none;margin:0;pointer-events:none;" ${filtering?'checked':''}>
    <span>Filtrar por proficiência (mostra só armas e armaduras que ${data.classe} usa bem)</span>
  </div>
  <div class="wallet">
    <div><div class="label">Ouro Inicial</div><div style="font-size:0.85rem;color:var(--parchment-dim);">${fmtGold(startingGold())} PO</div></div>
    <div style="text-align:right;"><div class="label">Restante</div><div class="value ${remaining<0?'negative':''}">${fmtGold(remaining)} PO</div></div>
  </div>`;

  Object.entries(SHOP).forEach(([catName, cat])=>{
    const isWeaponCat = cat.filterProf==='simples' || cat.filterProf==='marcial';
    /* Armas/Armaduras/Escudos (filterProf não-null) sempre têm "d" (dado
       de dano, ou "CA X + Destreza") E "p" (propriedades) preenchidos —
       vale a pena mostrar as duas colunas separadas. Ferramentas/
       Instrumentos/Focos/Munição/Equipamento de Aventura (filterProf
       null) geralmente não têm "d" preenchido (só Ferramentas/
       Instrumentos têm, ver comentário no topo de data/shop-items.js) —
       o efeito básico desses itens (quando existe, ex: "2d6 dano Ácido
       ao arremessar") mora em "p". Mostrar "Dano/Efeito" sempre vazio +
       "Propriedades" só às vezes preenchido virava 2 colunas fantasma
       pra maioria dos itens (achado real de usuário, com screenshot) —
       esses tipos de item mostram 1 coluna só ("Efeito"), com o texto
       que existir; quando "d" também está preenchido (Ferramentas/
       Instrumentos), o texto mais longo dele — CD de Usar Objeto e o
       que a ferramenta fabrica — não cabe na linha da tabela, então vira
       um botão ⓘ do lado do nome que abre um popup (achado real de
       usuário: card só dizia "tem um teste" sem explicar do que se
       trata). */
    const hasDanoEfeito = ['simples','marcial','leve','media','pesada','escudo'].includes(cat.filterProf);
    if(filtering && cat.filterProf && !clsConst.weaponProf.includes(cat.filterProf) && !clsConst.armorProf.includes(cat.filterProf)) return;
    const visibleItems = cat.items.filter(it => it.c <= maxGold && (!filtering || !isWeaponCat || itemMatchesWeaponProf(clsConst, it.n)));
    if(visibleItems.length===0) return;
    const isOpen = !data.shop.collapsedCats[catName]; // aberto por padrão, fechado só se o usuário já minimizou antes
    html += `<details class="shop-category" data-cat="${catName}" ontoggle="toggleShopCategory(this)" ${isOpen?'open':''}>
    <summary>${catName} <span class="cat-count">(${visibleItems.length} ${visibleItems.length===1?'item':'itens'})</span></summary>
    <table class="shop-table"><thead><tr><th>Item</th>${hasDanoEfeito?'<th>Dano/Efeito</th><th>Propriedades</th>':'<th>Efeito</th>'}${isWeaponCat?'<th>Mod. de Ataque</th>':''}<th>Custo</th><th>Qtd.</th></tr></thead><tbody>
    ${visibleItems.map(it=>{
      const qty = purchases[it.id]||0;
      const maxQty = maxAffordableQty(it.id) + qty; // limite considerando o que já foi gasto neste item
      const atCap = qty>=maxQty;
      const contHtml = it.cont ? `<div class="shop-item-cont">${it.cont}</div>` : '';
      const atk = isWeaponCat ? weaponAttackBonus(clsConst, atkStrMod, atkDexMod, atkProf, it.n) : null;
      const atkHtml = atk ? `<td data-label="Mod. de Ataque"><b style="color:var(--gold);">${fmt(atk.bonus)}</b>${atk.proficient?'':' <span style="color:var(--parchment-dim);font-size:0.75rem;">(sem proficiência)</span>'}</td>` : (isWeaponCat ? '<td data-label="Mod. de Ataque">—</td>' : '');
      const efeitoHtml = hasDanoEfeito
        ? `<td data-label="Dano/Efeito">${it.d}</td><td data-label="Propriedades" style="color:var(--parchment-dim);font-size:0.78rem;">${it.p}</td>`
        : `<td data-label="Efeito" style="color:var(--parchment-dim);font-size:0.78rem;">${it.p}</td>`;
      const infoBtn = (!hasDanoEfeito && it.d) ? ` <button class="info-btn ${shopItemInfoPopup===it.id?'active':''}" data-pick="${it.id}" data-fn="openShopItemInfoPopup" title="Ver detalhes">ⓘ</button>` : '';
      return `<tr>
        <td data-label="Item">${it.n}${infoBtn}${contHtml}</td>
        ${efeitoHtml}
        ${atkHtml}
        <td data-label="Custo">${discount<1 ? `<s style="opacity:0.55;">${fmtGold(it.c)}</s> ${fmtGold(itemPrice(it))}` : fmtGold(it.c)} PO</td>
        <td data-label="Qtd."><div class="qty-cell">
          <button class="btn small" data-fn="shopDec" data-pick="${it.id}">−</button>
          <input type="number" min="0" max="${maxQty}" value="${qty}" data-fn="shopSet" data-item="${it.id}">
          <button class="btn small" data-fn="shopInc" data-pick="${it.id}" ${atCap?'disabled title="Ouro insuficiente"':''}>+</button>
        </div></td>
      </tr>`;
    }).join('')}
    </tbody></table>
    </details>`;
  });

  const cartEntries = Object.entries(purchases).filter(([,q])=>q>0);
  if(cartEntries.length){
    html += `<h3>Carrinho</h3><div class="cart-list">${cartEntries.map(([id,q])=>{
      const item = findShopItem(id);
      return `<div class="cart-item"><span>${item.n} ×${q}</span><span>${fmtGold(itemPrice(item)*q)} PO</span></div>`;
    }).join('')}</div>`;
  }

  html += nav(canAdvance());
  return html;
}

/* ==========================================================================
   RESUMO FINAL — cálculo (computeCharacterSheet) + render (renderSummary)
   ==========================================================================
   computeCharacterSheet() é uma função PURA (só lê `data`/consts, não toca
   DOM) que devolve um objeto já com TUDO calculado — modificadores,
   salvaguardas, perícias, CA/PV/iniciativa, ataques, conjuração (com ficha
   completa de cada truque/magia via SPELL_DETAILS), proficiências e
   equipamento. renderSummary() só formata esse objeto em HTML. Escopo
   nível 1 apenas (igual o resto do wizard) — progressão de nível fica pra
   quando o wizard cobrir nível 2+.
   NÃO cobre Traços de Personalidade/Ideais/Ligações/Defeitos/Aparência/
   História — são campos de interpretação livre que o wizard não coleta
   (decisão do usuário: resumo focado no que é mecânico/calculável, não
   precisa seguir a ficha física campo a campo). */

const WEAPON_PROF_LABEL = {"simples":"Armas Simples","marcial":"Armas Marciais"};
const ARMOR_PROF_LABEL = {"leve":"Armadura Leve","media":"Armadura Média","pesada":"Armadura Pesada","escudo":"Escudos"};
const CLASS_HIT_DIE = {"Bárbaro":12,"Guerreiro":10,"Paladino":10,"Guardião":10,"Bardo":8,"Bruxo":8,"Clérigo":8,"Druida":8,"Ladino":8,"Monge":8,"Psiônico":6,"Feiticeiro":6,"Mago":6};
const CLASS_SPELL_ABILITY = {"Mago":"Inteligência","Psiônico":"Inteligência","Clérigo":"Sabedoria","Druida":"Sabedoria","Guardião":"Sabedoria","Bruxo":"Carisma","Bardo":"Carisma","Paladino":"Carisma","Feiticeiro":"Carisma"};

/* Todos os ids de item que o personagem possui de verdade (herdados +
   comprados), sem duplicata — usado pra achar arma/armadura/escudo
   realmente em posse, tanto faz quantas unidades. */
