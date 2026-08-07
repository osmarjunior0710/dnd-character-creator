/* Varredura de regressão — renderiza o Resumo e a Loja pra TODAS as
   2080 combinações de Classe (13) × Antecedente (16) × Espécie (10),
   checando só que nada lança exceção (não valida conteúdo específico,
   é uma rede de segurança contra "quebrou pra alguma combinação" —
   foi assim que a checagem de duplicidade pegou um crash real em todas
   as classes não-conjuradoras antes de virar código de produção).

   Antes disso rodava como script ad-hoc, escrito e descartado a cada
   sessão — toda vez que uma mudança precisava ser validada contra as
   2080 combinações, alguém tinha que reescrever isso do zero. Versionado
   aqui pra virar reutilizável.

   Como rodar:
     1. Servir o repo estático (ex: `python3 -m http.server 8000` na raiz)
     2. node tests/regression-sweep.js [http://localhost:8000/index.html]
        (a URL é opcional, default abaixo)

   Requer Playwright instalado (`npm install -D playwright` ou já
   disponível globalmente) e um navegador Chromium baixado
   (`npx playwright install chromium`, se ainda não tiver). */
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:8000/index.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const classes = await page.evaluate(() => Object.keys(CLASS_DATA_KEY));
  const backgrounds = await page.evaluate(() => Object.keys(BACKGROUND_DATA_KEY));
  const species = await page.evaluate(() => ENABLED_SPECIES);

  const errors = [];
  for (const c of classes) {
    for (const bg of backgrounds) {
      for (const sp of species) {
        const res = await page.evaluate(({ c, bg, sp }) => {
          try {
            /* Estado inicial "limpo" — mesmos defaults de `data` que o
               app usa em resetWizard()/init(), reescrito aqui em vez de
               recarregar a página inteira a cada combinação (bem mais
               rápido: só chama compute/render direto, sem passar pelo
               wizard passo a passo). Se os defaults de `data` mudarem
               no app (js/00-notes-and-state.js ou js/08-handlers.js),
               atualizar aqui também — sem import compartilhado de
               propósito (script clássico global, sem módulo pra
               reexportar isso pro Node). */
            data = Object.assign({ characterName:'', especie:null, antecedente:null, classe:null,
              equippedArmorId:null, equippedShieldId:null,
              attrs:{Força:8,Destreza:8,Constituição:8,Inteligência:8,Sabedoria:8,Carisma:8},
              freeAbilityRule:true, idiomas:{comuns:[],extra:[]}, shop:{purchases:{},collapsedCats:{},filterByProf:false},
              tiefling:{}, aasimar:{}, humano:{}, elfo:{}, gnomo:{}, golias:{}, draconato:{}, pequenino:{},
              bruxo:{skills:[],cantrips:[],tomoCantrips:[],spells1:[],tomoRituals:[],pactBoon:null,equipment:null},
              barbaro:{skills:[],maestria:[],equipment:null},
              bardo:{skills:[],cantrips:[],spells1:[],instruments:[],equipment:null},
              mago:{skills:[],cantrips:[],spellbook:[],prepared:[],equipment:null},
              paladino:{skills:[],prepared:[],equipment:null},
              psionico:{skills:[],cantrips:[],spells1:[],equipment:null},
              clerigo:{skills:[],cantrips:[],spells1:[],equipment:null},
              guerreiro:{skills:[],maestria:[],equipment:null},
              ladino:{skills:[],especialista:[],equipment:null},
              druida:{skills:[],cantrips:[],spells1:[],equipment:null},
              feiticeiro:{skills:[],cantrips:[],spells1:[],equipment:null},
              monge:{skills:[],toolChoice:null,equipment:null},
              guardiao:{skills:[],spells1:[],equipment:null},
              charlatao:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              nobre:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              andarilho:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              criminoso:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              eremita:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              fazendeiro:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              marinheiro:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              escriba:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              mercador:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              artesao:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              artista:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              guarda:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              soldado:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              acolito:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              guia:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]},
              sabio:{abilityPlan:null,equipment:null,habilidoso:[],ferramentaEscolhida:null,iniciadoCantrips:[],iniciadoSpell1:[]}
            });
            data.classe = c;
            data.antecedente = bg;
            data.especie = sp;
            data.humano.tamanho = 'Médio'; data.aasimar.tamanho = 'Médio'; data.tiefling.tamanho = 'Médio';
            data.tiefling.legado = 'Infernal';
            data.draconato.heranca = DRACONATO.subespecie.opcoes[0].nome;
            data.elfo.linhagem = ELFO.subespecie.opcoes[0].nome;
            data.gnomo.linhagem = GNOMO.subespecie.opcoes[0].nome;
            data.golias.ancestralidade = GOLIAS.subespecie.opcoes[0].nome;

            const sheet = computeCharacterSheet();
            renderSummary();
            renderShop();
            return { ok: true, dupCount: sheet.duplicidades.length };
          } catch (e) {
            return { ok: false, err: e.message };
          }
        }, { c, bg, sp });
        if (!res.ok) errors.push(`${c} / ${bg} / ${sp}: ${res.err}`);
      }
    }
  }

  const total = classes.length * backgrounds.length * species.length;
  console.log(`total combos: ${total}`);
  console.log(`errors: ${errors.length}`);
  errors.slice(0, 20).forEach(e => console.log(e));

  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
