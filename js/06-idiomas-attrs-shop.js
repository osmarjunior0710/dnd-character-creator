/* 06-idiomas-attrs-shop.js — Passos de Idiomas, Atributos e a Loja (grade de itens, ouro inicial/gasto, filtro de proficiência).
   Extraído de index.html (linhas 3309-3522 originais) numa refatoração pra sair
   do arquivo monolítico único — ver ordem de carregamento no <head>/fim do
   <body> do index.html. Escopo global clássico (sem import/export ES module,
   de propósito: sem build step nesse repo, GitHub Pages serve os arquivos
   direto) — funções/consts declaradas aqui viram globais como sempre foram,
   só divididas em arquivos menores. */
function renderIdiomasStep(){
  const id = data.idiomas;
  const isLadino = data.classe==='Ladino';
  const comunsPool = COMMON_LANGUAGES;
  return `<h2>Passo — Idiomas</h2>
  <div class="intro">Todo personagem conhece Comum, além de mais idiomas escolhidos abaixo.</div>

  <div class="check-list" style="margin-bottom:14px;">
    <span class="group-label" style="margin:0 2px 0 0;">Automático:</span>
    <div class="check-pill selected">Comum</div>
  </div>

  <h3 id="grp-6-comuns">Escolha 2 Idiomas Comuns</h3>
  ${groupedChoiceList(languageGroupsByCategory(comunsPool), id.comuns, 2, 'toggleIdiomaComum')}
  <div class="counter ${id.comuns.length===2?'ok':''}">${id.comuns.length}/2 escolhidos</div>

  ${isLadino ? `
  <h3>Ladino — Gíria dos Ladrões</h3>
  <div class="intro" style="margin-bottom:8px;">Como Ladino, você conhece a Gíria dos Ladrões automaticamente (não conta como uma das escolhas acima).</div>
  <div class="check-list" style="margin-bottom:14px;">
    <div class="check-pill selected">Gíria dos Ladrões</div>
  </div>

  <h3 id="grp-6-extra">Escolha 1 Idioma Adicional (Comum ou Raro)</h3>
  ${(()=>{
    const pool = [...COMMON_LANGUAGES, ...RARE_LANGUAGES].filter(l => l!=='Gíria dos Ladrões' && !id.comuns.includes(l));
    return groupedChoiceList(languageGroupsByCategory(pool), id.extra, 1, 'toggleIdiomaExtra');
  })()}
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

function startingGold(){
  const clsConst = activeClassConst();
  const cls = activeClassData();
  const clsGold = cls.equipment==='C' ? clsConst.equipmentC_gold : cls.equipment==='B' ? clsConst.equipmentB_gold : (cls.equipment==='A' ? clsConst.equipmentA_gold : 0);
  const bgConst = activeBgConst();
  const bg = activeBgData();
  const bgGold = bg.equipment==='B' ? bgConst.equipmentB_gold : (bg.equipment==='A' ? bgConst.equipmentA_gold : 0);
  return clsGold + bgGold;
}
function spentGold(){
  let total = 0;
  for(const [id, qty] of Object.entries(data.shop.purchases||{})){
    const item = findShopItem(id);
    if(item) total += item.c * qty;
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

function renderShop(){
  const remaining = startingGold() - spentGold();
  const purchases = data.shop.purchases||{};
  const clsConst = activeClassConst();
  const maxGold = computeMaxPossibleGold();
  const filtering = data.shop.filterByProf;
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
    if(filtering && cat.filterProf && !clsConst.weaponProf.includes(cat.filterProf) && !clsConst.armorProf.includes(cat.filterProf)) return;
    const visibleItems = cat.items.filter(it => it.c <= maxGold && (!filtering || !isWeaponCat || itemMatchesWeaponProf(clsConst, it.n)));
    if(visibleItems.length===0) return;
    const isOpen = !data.shop.collapsedCats[catName]; // aberto por padrão, fechado só se o usuário já minimizou antes
    html += `<details class="shop-category" data-cat="${catName}" ontoggle="toggleShopCategory(this)" ${isOpen?'open':''}>
    <summary>${catName} <span class="cat-count">(${visibleItems.length} ${visibleItems.length===1?'item':'itens'})</span></summary>
    <table class="shop-table"><thead><tr><th>Item</th><th>Dano/Efeito</th><th>Propriedades</th>${isWeaponCat?'<th>Mod. de Ataque</th>':''}<th>Custo</th><th>Qtd.</th></tr></thead><tbody>
    ${visibleItems.map(it=>{
      const qty = purchases[it.id]||0;
      const maxQty = maxAffordableQty(it.id) + qty; // limite considerando o que já foi gasto neste item
      const atCap = qty>=maxQty;
      const contHtml = it.cont ? `<div style="font-size:0.68rem; color:var(--parchment-dim); font-style:italic; margin-top:2px;">${it.cont}</div>` : '';
      const atk = isWeaponCat ? weaponAttackBonus(clsConst, atkStrMod, atkDexMod, atkProf, it.n) : null;
      const atkHtml = atk ? `<td data-label="Mod. de Ataque"><b style="color:var(--gold);">${fmt(atk.bonus)}</b>${atk.proficient?'':' <span style="color:var(--parchment-dim);font-size:0.75rem;">(sem proficiência)</span>'}</td>` : (isWeaponCat ? '<td data-label="Mod. de Ataque">—</td>' : '');
      return `<tr>
        <td data-label="Item">${it.n}${contHtml}</td>
        <td data-label="Dano/Efeito">${it.d}</td>
        <td data-label="Propriedades" style="color:var(--parchment-dim);font-size:0.78rem;">${it.p}</td>
        ${atkHtml}
        <td data-label="Custo">${fmtGold(it.c)} PO</td>
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
      return `<div class="cart-item"><span>${item.n} ×${q}</span><span>${fmtGold(item.c*q)} PO</span></div>`;
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
