import { mod } from "@core/motor/atributos.ts";
import { useRuleset, type LojaItem } from "../../ruleset/RulesetContext";
import { useWizard } from "../WizardContext";
import { bonusDoAntecedente } from "../bonusAntecedente";
import {
  classeAtivaConst, computeMaxPossibleGold, startingGold, spentGold, shopDiscountFactor,
  itemPrice, itemMatchesWeaponProf, weaponAttackBonus, maxAffordableQty,
} from "../lojaUtil";

function fmt(n: number): string {
  return (n >= 0 ? "+" : "") + n;
}
function fmtGold(n: number): string {
  return (Math.round(n * 100) / 100).toString().replace(".", ",");
}

const HAS_DANO_EFEITO = new Set(["simples", "marcial", "leve", "media", "pesada", "escudo"]);

/** Passo Loja — equivalente a renderShop() (js/06-idiomas-attrs-shop.js).
 * Simplificações deliberadas em relação ao vanilla, registradas aqui em
 * vez de escondidas: (1) sem popup ⓘ pra ferramentas/instrumentos — o
 * texto de Usar Objeto/Fabrica aparece direto na coluna Efeito, só um
 * pouco mais denso, em vez de atrás de um botão; (2) categorias sempre
 * abertas (o <details> nativo do navegador ainda deixa colapsar por
 * clique, só não persiste o estado entre re-renders). Nenhuma das duas
 * tira informação ou trava avanço — só reduz polish visual, adiável sem
 * custo de regra. Este passo nunca bloqueia "Avançar": igual o vanilla
 * (findFirstMissingGroup() não tem case pra ele), comprar é opcional. */
export function LojaStep() {
  const { dados: ruleset } = useRuleset();
  const { dados, definir } = useWizard();

  if (!ruleset || !dados.classe) return null;
  const clsConst = classeAtivaConst(ruleset, dados);
  if (!clsConst) return null;

  const maxGold = computeMaxPossibleGold(ruleset);
  const remaining = startingGold(ruleset, dados) - spentGold(ruleset, dados);
  const discount = shopDiscountFactor(ruleset, dados);
  const filtering = dados.shop.filterByProf;
  const purchases = dados.shop.purchases;

  const strMod = mod((dados.attrs["Força"] ?? 0) + bonusDoAntecedente(dados, "Força"));
  const dexMod = mod((dados.attrs["Destreza"] ?? 0) + bonusDoAntecedente(dados, "Destreza"));
  const atkProf = ruleset.bonusProficienciaNivel1;

  function setQty(id: string, qty: number) {
    definir((r) => {
      const max = maxAffordableQty(ruleset!, r, id);
      const v = Math.max(0, Math.min(qty, max));
      if (v <= 0) delete r.shop.purchases[id];
      else r.shop.purchases[id] = v;
    });
  }

  return (
    <section>
      <h2>Loja — Gaste seu Dinheiro Inicial</h2>
      <p className="intro">
        Itens mais caros que {fmtGold(maxGold)} PO (o máximo possível de ouro inicial) não aparecem, porque nunca dá pra
        comprá-los na criação do personagem.
      </p>
      {discount < 1 && <p className="intro">Talento Artifista: 20% de desconto em item não mágico, já aplicado nos preços abaixo.</p>}
      <label className="regra-da-casa">
        <input type="checkbox" checked={filtering} onChange={() => definir((r) => { r.shop.filterByProf = !r.shop.filterByProf; })} />
        Filtrar por proficiência (mostra só armas e armaduras que {dados.classe} usa bem)
      </label>
      <div className="wallet">
        <div>
          <div className="rotulo-pequeno">Ouro Inicial</div>
          <div>{fmtGold(startingGold(ruleset, dados))} PO</div>
        </div>
        <div>
          <div className="rotulo-pequeno">Restante</div>
          <div className={remaining < 0 ? "nota-erro" : ""}>{fmtGold(remaining)} PO</div>
        </div>
      </div>

      {Object.entries(ruleset.loja).map(([catNome, cat]) => {
        const isWeaponCat = cat.filterProf === "simples" || cat.filterProf === "marcial";
        const hasDanoEfeito = !!cat.filterProf && HAS_DANO_EFEITO.has(cat.filterProf);
        const catItemIds = new Set(cat.items.map((it) => it.id));
        const carrinho = Object.entries(purchases).filter(([id, q]) => q > 0 && catItemIds.has(id));

        const escondidaPorFiltro = filtering && cat.filterProf && !clsConst.weaponProf.includes(cat.filterProf) && !clsConst.armorProf.includes(cat.filterProf);
        const visiveis = escondidaPorFiltro
          ? []
          : cat.items.filter((it) => it.c <= maxGold && (!filtering || !isWeaponCat || itemMatchesWeaponProf(clsConst, ruleset.maestriaDeArmas, it.n)));

        if (visiveis.length === 0 && carrinho.length === 0) return null;

        return (
          <details key={catNome} className="shop-category" open>
            <summary>{catNome} {visiveis.length > 0 && `(${visiveis.length} ${visiveis.length === 1 ? "item" : "itens"})`}</summary>
            {visiveis.length > 0 && (
              <table className="shop-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    {hasDanoEfeito ? <><th>Dano/Efeito</th><th>Propriedades</th></> : <th>Efeito</th>}
                    {isWeaponCat && <th>Mod. de Ataque</th>}
                    <th>Custo</th>
                    <th>Qtd.</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((it) => (
                    <LinhaDeItem key={it.id} item={it} qty={purchases[it.id] || 0} maxQty={maxAffordableQty(ruleset, dados, it.id) + (purchases[it.id] || 0)}
                      hasDanoEfeito={hasDanoEfeito} isWeaponCat={isWeaponCat} discount={discount}
                      atk={isWeaponCat ? weaponAttackBonus(clsConst, ruleset.maestriaDeArmas, strMod, dexMod, atkProf, it.n) : null}
                      onSetQty={(q) => setQty(it.id, q)} />
                  ))}
                </tbody>
              </table>
            )}
            {carrinho.length > 0 && (
              <div className="cart-list">
                <div className="rotulo-pequeno">Comprado</div>
                {carrinho.map(([id, q]) => {
                  const item = cat.items.find((i) => i.id === id) ?? null;
                  if (!item) return null;
                  return (
                    <div key={id} className="cart-item">
                      <span>{item.n} ×{q}</span>
                      <span>{fmtGold(itemPrice(item, discount) * q)} PO</span>
                    </div>
                  );
                })}
              </div>
            )}
          </details>
        );
      })}
    </section>
  );
}

function LinhaDeItem({ item, qty, maxQty, hasDanoEfeito, isWeaponCat, discount, atk, onSetQty }: {
  item: LojaItem; qty: number; maxQty: number; hasDanoEfeito: boolean; isWeaponCat: boolean; discount: number;
  atk: { bonus: number; proficient: boolean } | null; onSetQty: (q: number) => void;
}) {
  const atCap = qty >= maxQty;
  return (
    <tr className={qty > 0 ? "shop-row-selected" : ""}>
      <td>{item.n}{item.cont && <div className="rotulo-pequeno">{item.cont}</div>}</td>
      {hasDanoEfeito ? (
        <>
          <td>{item.d}</td>
          <td className="rotulo-pequeno">{item.p}</td>
        </>
      ) : (
        <td className="rotulo-pequeno">{item.d ? `${item.p} — ${item.d}` : item.p}</td>
      )}
      {isWeaponCat && (
        <td>
          {atk ? (
            <>
              <b>{fmt(atk.bonus)}</b>
              {!atk.proficient && <span className="rotulo-pequeno"> (sem proficiência)</span>}
            </>
          ) : "—"}
        </td>
      )}
      <td>{discount < 1 ? <><s>{fmtGold(item.c)}</s> {fmtGold(itemPrice(item, discount))}</> : fmtGold(item.c)} PO</td>
      <td>
        <div className="qty-cell">
          <button type="button" className="btn small" onClick={() => onSetQty(qty - 1)}>−</button>
          <input type="number" min={0} max={maxQty} value={qty} onChange={(e) => onSetQty(parseInt(e.target.value, 10) || 0)} />
          <button type="button" className="btn small" disabled={atCap} title={atCap ? "Ouro insuficiente" : undefined} onClick={() => onSetQty(qty + 1)}>+</button>
        </div>
      </td>
    </tr>
  );
}
