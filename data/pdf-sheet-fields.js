/* Mapa de campos do PDF preenchível assets/ficha-dnd-2024.pdf (ficha oficial
   redesenhada do PHB 2024, tradução PT-BR, 2 páginas). Esse PDF foi gerado
   por uma ferramenta de terceiros que dá nomes aleatórios aos campos
   (text_26tliz, checkbox_156ajbg etc.) — NÃO dá pra saber o que cada campo
   é só pelo nome. Todo esse mapa foi reconstruído cruzando a posição (x/y)
   de cada campo com o texto mais próximo na página (via pdf-lib + pdfjs-dist,
   fora deste app) e CONFIRMADO visualmente pelo usuário em duas rodadas de
   teste (preenchendo cada campo com o nome do que a gente achava que ele
   era, e abrindo o PDF resultado). Não mexer nesses nomes sem repetir esse
   processo — não tem como adivinhar de novo só olhando o nome do campo.

   Sobre "salvaguardas" (proficiência de teste de resistência): esse dado
   não existe em lugar nenhum do app antes disso — foi extraído do texto
   solto "Salvaguardas: X e Y" que já existia na linha .intro de cada
   render*Detail() de classe, e virou o campo saves:[...] em cada
   data/classes/*.js. */
const SHEET_FIELDS = {
  identidade: {
    nome: 'text_1aoob', origem: 'text_2flth', especie: 'text_4wwck',
    classe: 'text_3nuh', subclasse: 'text_5jrjt', nivel: 'text_6zece', exp: 'text_7rwjo'
  },
  combate: {
    ca: 'text_8izmy',
    /* Escudo: só marca se a pessoa TEM escudo no equipamento — não é
       proficiência (isso é o Treino de Armadura, campo separado abaixo). */
    escudo: 'checkbox_148cprb',
    pvAtual: 'text_9dyuu', pvMax: 'text_11jfgo', pvTemp: 'text_10iwcm',
    dadoVidaTotal: 'text_13kgoy', dadoVidaGasto: 'text_12ssbr',
    mortesSucesso: ['checkbox_149wrcs', 'checkbox_150rivk', 'checkbox_151anck'],
    mortesFalha: ['checkbox_152qorb', 'checkbox_153bfif', 'checkbox_154pzrz'],
    iniciativa: 'text_21mpbm', velocidade: 'text_22zico', tamanho: 'text_23izdr',
    percepcaoPassiva: 'text_24dqfn', bonusProf: 'text_14hfyo',
    inspiracao: 'checkbox_174cik'
  },
  atributos: {
    'Força': { mod: 'text_16ljqm', valor: 'text_50jovf' },
    'Destreza': { mod: 'text_18ewiu', valor: 'text_52nepg' },
    'Constituição': { mod: 'text_20wsze', valor: 'text_53xwyj' },
    'Inteligência': { mod: 'text_15bxvo', valor: 'text_49swbc' },
    'Sabedoria': { mod: 'text_17fyyp', valor: 'text_51jzpy' },
    'Carisma': { mod: 'text_19eccb', valor: 'text_54jmfy' }
  },
  salvaguardas: {
    'Força': { cb: 'checkbox_161uxhr', valor: 'text_31muji' },
    'Destreza': { cb: 'checkbox_163psjp', valor: 'text_33zoxn' },
    'Constituição': { cb: 'checkbox_173fypr', valor: 'text_43noxw' },
    'Inteligência': { cb: 'checkbox_155clsx', valor: 'text_25jyjb' },
    'Sabedoria': { cb: 'checkbox_167kfjh', valor: 'text_37hqrf' },
    'Carisma': { cb: 'checkbox_175sftt', valor: 'text_44inbx' }
  },
  /* Perícias: essa ficha só tem 1 checkbox por perícia (proficiência) — não
     existe uma 2ª marca pra Especialização/Expertise (ex: Ladino). Quando o
     personagem tem Especialização numa perícia, a gente só marca a
     proficiência normal aqui; o dobro do bônus de proficiência entra no
     cálculo do "valor", mas não tem como sinalizar visualmente que é
     Especialização — limitação do PDF, não do app. */
  pericias: {
    'Atletismo': { cb: 'checkbox_162oonu', valor: 'text_32gkcr' },
    'Acrobacia': { cb: 'checkbox_164bozr', valor: 'text_34gtmf' },
    'Prestidigitação': { cb: 'checkbox_165vjtz', valor: 'text_35thxg' },
    'Furtividade': { cb: 'checkbox_166ftbk', valor: 'text_36lpll' },
    'Arcanismo': { cb: 'checkbox_156ajbg', valor: 'text_26tliz' },
    'História': { cb: 'checkbox_157ldxn', valor: 'text_27bqtw' },
    'Investigação': { cb: 'checkbox_158pmwq', valor: 'text_28kewv' },
    'Natureza': { cb: 'checkbox_159vfpc', valor: 'text_29navp' },
    'Religião': { cb: 'checkbox_160aaud', valor: 'text_30yhjl' },
    'Lidar com Animais': { cb: 'checkbox_168ttw', valor: 'text_38kcat' },
    'Intuição': { cb: 'checkbox_169jjck', valor: 'text_39jknh' },
    'Medicina': { cb: 'checkbox_170sfjg', valor: 'text_40innv' },
    'Percepção': { cb: 'checkbox_171mwai', valor: 'text_41enee' },
    'Sobrevivência': { cb: 'checkbox_172vqbb', valor: 'text_42zfcc' },
    'Enganação': { cb: 'checkbox_176bkku', valor: 'text_45drlt' },
    'Intimidação': { cb: 'checkbox_177husr', valor: 'text_46mmwf' },
    'Atuação': { cb: 'checkbox_178ydvd', valor: 'text_47btcg' },
    'Persuasão': { cb: 'checkbox_179mjzi', valor: 'text_48njog' }
  },
  /* Treino de Armadura vem da PROFICIÊNCIA DE ARMADURA DA CLASSE
     (armorProf de data/classes/*.js: 'leve'|'media'|'pesada'|'escudo'),
     NÃO do equipamento comprado. */
  treinoArmadura: {
    leve: 'checkbox_180jnac', media: 'checkbox_181kvqx',
    pesada: 'checkbox_182glwy', escudos: 'checkbox_183ootk'
  },
  /* Tabela "Armas & Truques de Dano" — 6 linhas (nome / bônus de ataque-CD /
     dano & tipo / anotações), ao lado do bloco de FORÇA. Achei essa tabela
     só na 2ª rodada (tinha confundido esses campos com as perícias de
     Inteligência na 1ª análise, por causa de um alinhamento de x parecido —
     usuário reparou que ela tinha ficado sem mapear). */
  armas: [
    { nome: 'text_57zdom', bonus: 'text_75pqzn', dano: 'text_69bfge', anotacoes: 'text_63looj' },
    { nome: 'text_58ylyp', bonus: 'text_76mqyg', dano: 'text_70cros', anotacoes: 'text_64syxl' },
    { nome: 'text_59pvyl', bonus: 'text_77wjft', dano: 'text_71zqff', anotacoes: 'text_65byds' },
    { nome: 'text_60puik', bonus: 'text_78mhak', dano: 'text_72qncu', anotacoes: 'text_66mtkj' },
    { nome: 'text_61fskk', bonus: 'text_79sqgq', dano: 'text_73sgjc', anotacoes: 'text_67rdkj' },
    { nome: 'text_62znay', bonus: 'text_80mqng', dano: 'text_74oyar', anotacoes: 'text_68ecij' }
  ],
  textos: {
    armas: 'textarea_55cuqv',
    ferramentas: 'textarea_56maty',
    caracteristicasRaciais: 'textarea_120zvmx',
    talentos: 'textarea_121oryi',
    caracteristicasClasse1: 'textarea_118xiuy',
    caracteristicasClasse2: 'textarea_119wweb'
  },
  bio: {
    aparencia: 'textarea_125avaq',
    historia: 'textarea_126gxsf',
    alinhamento: 'text_287hdss',
    idiomas: 'textarea_128qxfn',
    equipamento: 'textarea_127svto',
    moedas: { cp: 'text_352gosh', pp: 'text_353gznv', pe: 'text_354lgve', po: 'text_355kiok', pl: 'text_356djsp' }
  },
  conjuracao: {
    atributo: 'text_209qhmj', modificador: 'text_122huay',
    cd: 'text_123sqib', bonusAtaque: 'text_124ceqd',
    /* Índice 0 = espaços de 1º círculo, 1 = 2º círculo, etc. */
    espacosTotal: ['text_434fmhi', 'text_435bazu', 'text_436difh', 'text_437sndm', 'text_438idcz', 'text_439duno', 'text_440txei', 'text_441koa', 'text_442jqio']
  },
  /* Tabela de Truques & Magias Preparadas — 30 linhas, de cima pra baixo.
     Cada linha: nível (0=truque, 1-9=círculo), nome, tempo de conjuração,
     alcance, 3 checkboxes (Concentração/Ritual/Material) e anotações. */
  magias: [
    { nivel: 'text_318anec', nome: 'text_288qujt', tempo: 'text_357kgvr', alcance: 'text_404mdly', concentracao: 'checkbox_206oxpl', ritual: 'checkbox_207rxuq', material: 'checkbox_208etdw', anotacoes: 'text_443feqr' },
    { nivel: 'text_319zemp', nome: 'text_289axhd', tempo: 'text_358uuoz', alcance: 'text_405udro', concentracao: 'checkbox_211lqvi', ritual: 'checkbox_212rcfn', material: 'checkbox_213yhlf', anotacoes: 'text_444rbsd' },
    { nivel: 'text_320achd', nome: 'text_290lmio', tempo: 'text_359mowm', alcance: 'text_406ybgs', concentracao: 'checkbox_216gmow', ritual: 'checkbox_215cpdg', material: 'checkbox_214uxrl', anotacoes: 'text_445jykv' },
    { nivel: 'text_321nfkr', nome: 'text_291ljgr', tempo: 'text_360frxp', alcance: 'text_407uigd', concentracao: 'checkbox_217xqun', ritual: 'checkbox_218puos', material: 'checkbox_219eyon', anotacoes: 'text_446vcmy' },
    { nivel: 'text_322wzbx', nome: 'text_292upnd', tempo: 'text_361nyas', alcance: 'text_408uvhe', concentracao: 'checkbox_220kfzx', ritual: 'checkbox_221oxhn', material: 'checkbox_222zdas', anotacoes: 'text_447ykxt' },
    { nivel: 'text_323prpm', nome: 'text_293zwds', tempo: 'text_362irmn', alcance: 'text_409lgal', concentracao: 'checkbox_223vfon', ritual: 'checkbox_224pscn', material: 'checkbox_225xteb', anotacoes: 'text_448ymgm' },
    { nivel: 'text_324eazm', nome: 'text_294pxhc', tempo: 'text_364wufj', alcance: 'text_410xkad', concentracao: 'checkbox_228zflc', ritual: 'checkbox_227xut', material: 'checkbox_226lrgq', anotacoes: 'text_449jx' },
    { nivel: 'text_325ijwg', nome: 'text_295cvzt', tempo: 'text_365blgq', alcance: 'text_411mscu', concentracao: 'checkbox_229bnn', ritual: 'checkbox_230parc', material: 'checkbox_231puyq', anotacoes: 'text_450erxn' },
    { nivel: 'text_326bfre', nome: 'text_296luha', tempo: 'text_366thgx', alcance: 'text_412tnax', concentracao: 'checkbox_234dqwb', ritual: 'checkbox_233gfan', material: 'checkbox_232ushd', anotacoes: 'text_451fczs' },
    { nivel: 'text_327htfm', nome: 'text_297htaz', tempo: 'text_367rrph', alcance: 'text_413mqcz', concentracao: 'checkbox_235l', ritual: 'checkbox_236sgtt', material: 'checkbox_237tyxi', anotacoes: 'text_452zthf' },
    { nivel: 'text_329ogxi', nome: 'text_298wbzm', tempo: 'text_368zt', alcance: 'text_414krn', concentracao: 'checkbox_238yhpg', ritual: 'checkbox_239qwui', material: 'checkbox_240cxsc', anotacoes: 'text_453vfvy' },
    { nivel: 'text_330vrso', nome: 'text_299sigr', tempo: 'text_369raip', alcance: 'text_415lqlz', concentracao: 'checkbox_241zkxw', ritual: 'checkbox_242hkec', material: 'checkbox_243eqmc', anotacoes: 'text_454wndj' },
    { nivel: 'text_331bz', nome: 'text_300ahxk', tempo: 'text_370jbwc', alcance: 'text_416aczh', concentracao: 'checkbox_246jqok', ritual: 'checkbox_245iujz', material: 'checkbox_244umvn', anotacoes: 'text_455lnnp' },
    { nivel: 'text_332hynk', nome: 'text_301cwbz', tempo: 'text_371qoav', alcance: 'text_417rymg', concentracao: 'checkbox_247znbt', ritual: 'checkbox_403jjwm', material: 'checkbox_402spwa', anotacoes: 'text_456vfx' },
    { nivel: 'text_333cuyl', nome: 'text_302ewwp', tempo: 'text_372icub', alcance: 'text_418zwhg', concentracao: 'checkbox_248yjrz', ritual: 'checkbox_399puja', material: 'checkbox_400bcfd', anotacoes: 'text_457dmpj' },
    { nivel: 'text_334ntcq', nome: 'text_303cuix', tempo: 'text_373ortg', alcance: 'text_419tful', concentracao: 'checkbox_249tplf', ritual: 'checkbox_395cmyc', material: 'checkbox_398ukum', anotacoes: 'text_458rlgp' },
    { nivel: 'text_335auux', nome: 'text_304xskb', tempo: 'text_374idrr', alcance: 'text_420aybs', concentracao: 'checkbox_250wqqy', ritual: 'checkbox_394vyhd', material: 'checkbox_397aecs', anotacoes: 'text_459izzc' },
    { nivel: 'text_336edfl', nome: 'text_305gwig', tempo: 'text_375ro', alcance: 'text_421qlje', concentracao: 'checkbox_251qotd', ritual: 'checkbox_393lhrs', material: 'checkbox_396yxtx', anotacoes: 'text_460vdsq' },
    { nivel: 'text_337bkcl', nome: 'text_306sorf', tempo: 'text_376maeb', alcance: 'text_422phcl', concentracao: 'checkbox_252toiv', ritual: 'checkbox_390hjem', material: 'checkbox_392glfj', anotacoes: 'text_461ktek' },
    { nivel: 'text_338cxow', nome: 'text_307ykqn', tempo: 'text_377mswu', alcance: 'text_423msyf', concentracao: 'checkbox_253bfkr', ritual: 'checkbox_388xvfu', material: 'checkbox_389taoe', anotacoes: 'text_462btzt' },
    { nivel: 'text_339wwdm', nome: 'text_308wwhe', tempo: 'text_378tgsm', alcance: 'text_424ziee', concentracao: 'checkbox_254cefe', ritual: 'checkbox_264vkzj', material: 'checkbox_265yjq', anotacoes: 'text_463vmvl' },
    { nivel: 'text_340tcz', nome: 'text_309enjs', tempo: 'text_379kpkj', alcance: 'text_425acls', concentracao: 'checkbox_255bqjh', ritual: 'checkbox_266cvnz', material: 'checkbox_267yyjj', anotacoes: 'text_464dg' },
    { nivel: 'text_341atzt', nome: 'text_310jdm', tempo: 'text_380qipb', alcance: 'text_426mdta', concentracao: 'checkbox_256cvcf', ritual: 'checkbox_268uqjs', material: 'checkbox_269biot', anotacoes: 'text_465asee' },
    { nivel: 'text_342ksij', nome: 'text_311ghoq', tempo: 'text_381iphd', alcance: 'text_427fhan', concentracao: 'checkbox_257fbxk', ritual: 'checkbox_270dlx', material: 'checkbox_271bauq', anotacoes: 'text_466xdmn' },
    { nivel: 'text_343fmhw', nome: 'text_312llsw', tempo: 'text_382ghpc', alcance: 'text_428nfjy', concentracao: 'checkbox_258rxhb', ritual: 'checkbox_272rwmv', material: 'checkbox_273khxl', anotacoes: 'text_467bjap' },
    { nivel: 'text_344ddyl', nome: 'text_313pcur', tempo: 'text_383hzpz', alcance: 'text_429fgpb', concentracao: 'checkbox_259ewlq', ritual: 'checkbox_274taza', material: 'checkbox_275mhyf', anotacoes: 'text_468xpmq' },
    { nivel: 'text_345lnzn', nome: 'text_314hhga', tempo: 'text_384wszw', alcance: 'text_430djh', concentracao: 'checkbox_260cgys', ritual: 'checkbox_277nfwm', material: 'checkbox_276yyjz', anotacoes: 'text_469jrpc' },
    { nivel: 'text_346ekxu', nome: 'text_315enji', tempo: 'text_385lquj', alcance: 'text_431hixa', concentracao: 'checkbox_261vhmn', ritual: 'checkbox_278ojqa', material: 'checkbox_279zdzj', anotacoes: 'text_470hxrc' },
    { nivel: 'text_347hqlw', nome: 'text_316bkoo', tempo: 'text_386bzlm', alcance: 'text_432vrah', concentracao: 'checkbox_262xkon', ritual: 'checkbox_281tscv', material: 'checkbox_280rxqc', anotacoes: 'text_471yekd' },
    { nivel: 'text_348onem', nome: 'text_317qlqa', tempo: 'text_387lpjj', alcance: 'text_433labc', concentracao: 'checkbox_263hguk', ritual: 'checkbox_282rgtr', material: 'checkbox_283bfnq', anotacoes: 'text_472tbdo' }
  ]
};
