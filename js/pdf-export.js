/* Exporta o personagem pra assets/ficha-dnd-2024.pdf (ficha oficial PHB 2024,
   PT-BR, formulário preenchível de verdade) usando lib/pdf-lib.min.js
   (vendorizado localmente, sem CDN — mesmo espírito do resto do app) e os
   nomes de campo em data/pdf-sheet-fields.js.

   Diferente de exportPDF() (js/07-compute-and-summary.js — usa
   window.print() pra gerar um PDF a partir da tela de Resumo), esta função
   preenche os CAMPOS DE FORMULÁRIO da ficha oficial digitalizada — o
   arquivo resultante continua editável em qualquer leitor de PDF (nunca
   chama form.flatten()).

   Toda a aritmética (atributos, salvaguardas, perícias, CA, ataques,
   conjuração, equipamento) vem de computeCharacterSheet() — este arquivo
   só SABE os nomes dos campos do PDF e como formatar cada valor pra caber
   neles. Não duplica nenhum cálculo que já exista lá.

   Fica em branco de propósito (sem campo correspondente nesta ficha, ou
   sem dado no app): Subclasse, EXP, Alinhamento, Aparência, História &
   Personalidade. Escudo (dentro da caixa de CA) marca sozinho conforme
   o Escudo "equipado" no Resumo (sheet.combate.ac.shieldEquipped, ver
   renderEquipCard()/pickEquippedShield() em js/07-compute-and-summary.js
   e js/08-handlers.js) — antes ficava sempre desmarcado de propósito,
   porque o app não tinha como saber se a pessoa realmente empunhava o
   escudo que comprou; agora tem. */

/* "9 metros" -> "9m" (campo de Velocidade é estreito na ficha; o texto por
   extenso não cabe). Não mexe no texto "9 metros" usado no resto do app,
   só encurta aqui na hora de exportar. */
function pdfShortDistance(s){
  const m = /(\d+(?:,\d+)?)/.exec(s || '');
  return m ? m[1] + 'm' : (s || '');
}
function stripHtml(s){
  return (s || '').replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim();
}
/* Tamanho ativo da espécie: só Tiferino/Humano/Aasimar têm escolha
   própria — as outras 7 têm 1 opção só em tamanho.opcoes. Mesmo padrão
   inline já usado no Resumo (js/07) pra "Espécie: X (tamanho, ...)". */
function pdfTamanho(){
  if(data.especie === 'Tiferino') return data.tiefling.tamanho;
  if(data.especie === 'Humano') return data.humano.tamanho;
  if(data.especie === 'Aasimar') return data.aasimar.tamanho;
  return SPECIES_CONST[data.especie].tamanho.opcoes[0];
}
/* Extrai "XdY TIPO" do texto livre "efeito" de SPELL_DETAILS (formato
   inconsistente na planilha de origem: "1d10 dano Necrótico" ou "1d10
   dano de Força") — usado só pra popular Dano & Tipo de truques na tabela
   de Armas. Sem match = truque sem dano óbvio (ou sem dano nenhum) —
   melhor deixar de fora da tabela do que arriscar errar. */
function pdfSpellDamage(detalhe){
  const m = detalhe && /(\d+d\d+)\s+dano(?:\s+de)?\s+([A-Za-zÀ-ÖØ-öø-ÿ]+)/i.exec(detalhe.efeito || '');
  return m ? `${m[1]} ${m[2]}` : '';
}
/* Linhas da tabela "Armas & Truques de Dano": sheet.attacks já cobre as
   armas (bônus/dano certos, incluindo proficiência); truques de dano são
   filtrados de sheet.spellcasting.cantrips (só entra quem casar com
   pdfSpellDamage acima). */
function pdfWeaponRows(sheet){
  const rows = sheet.attacks.map(a => ({ nome: a.nome, bonus: fmt(a.bonus), dano: a.dano }));
  if(sheet.spellcasting){
    sheet.spellcasting.cantrips.forEach(c => {
      const dano = pdfSpellDamage(c.detalhe);
      if(dano) rows.push({ nome: c.nome, bonus: fmt(sheet.spellcasting.ataque), dano });
    });
  }
  return rows;
}
/* Truques + magias na ordem em que entram na tabela da ficha (truques
   primeiro). Junta o que a CLASSE concede (sheet.spellcasting) com o que
   a ESPÉCIE concede de graça (sheet.especieMagias — ex: Taumaturgia do
   Tiferino), que existe mesmo pra classes sem conjuração. */
function pdfSpellRows(sheet){
  const rows = [];
  if(sheet.spellcasting){
    sheet.spellcasting.cantrips.forEach(c => rows.push({ nivel: 'T', nome: c.nome }));
    sheet.spellcasting.magias.forEach(c => rows.push({ nivel: '1', nome: c.nome }));
  }
  sheet.especieMagias.forEach(c => {
    const nivel = (c.detalhe && c.detalhe.circulo === 'Truque') ? 'T' : '1';
    if(!rows.some(r => r.nome === c.nome)) rows.push({ nivel, nome: c.nome, detalhe: c.detalhe });
  });
  return rows;
}
function pdfTalentosText(sheet){
  const lines = [];
  const ta = sheet.talentoAntecedente;
  if(ta.tipo === 'texto') lines.push(ta.texto);
  else if(ta.tipo === 'habilidoso') lines.push('Habilidoso: ' + ta.skills.join(', '));
  else if(ta.tipo === 'iniciado') lines.push(`Iniciado em Magia (${ta.classe}): ` + ta.entries.map(e => e.nome).join(', '));
  if(sheet.humanoTalento) lines.push('Versátil: ' + sheet.humanoTalento.nome);
  return lines.join('\n');
}
function pdfEquipmentText(sheet){
  return sheet.equipamento.itens.map(it => it.label + (it.qty > 1 ? ` x${it.qty}` : '')).join(', ');
}

async function exportCharacterPdf(){
  const btn = document.getElementById('exportOfficialPdfBtn');
  const origLabel = btn ? btn.textContent : null;
  if(btn){ btn.disabled = true; btn.textContent = 'Gerando PDF…'; }
  try {
    const sheet = computeCharacterSheet();
    const res = await fetch('assets/ficha-dnd-2024.pdf');
    const bytes = await res.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(bytes);
    const form = pdfDoc.getForm();
    const setText = (name, value) => { try{ form.getTextField(name).setText(value == null ? '' : String(value)); }catch(e){} };
    const setCheck = (name, checked) => { try{ const f = form.getCheckBox(name); if(checked) f.check(); else f.uncheck(); }catch(e){} };
    const F = SHEET_FIELDS;

    // Identidade
    setText(F.identidade.nome, data.characterName || '');
    setText(F.identidade.origem, data.antecedente);
    setText(F.identidade.especie, data.especie);
    setText(F.identidade.classe, data.classe);
    setText(F.identidade.nivel, sheet.identidade.nivel);

    // Atributos
    sheet.attrs.forEach(a => {
      setText(F.atributos[a.ability].mod, fmt(a.mod));
      setText(F.atributos[a.ability].valor, a.score);
    });

    // Salvaguardas
    sheet.savingThrows.forEach(s => {
      setText(F.salvaguardas[s.ability].valor, fmt(s.bonus));
      setCheck(F.salvaguardas[s.ability].cb, s.proficient);
    });

    // Perícias (essa ficha só tem 1 checkbox por perícia — Especialista do
    // Ladino não tem como aparecer marcado diferente de proficiência normal)
    sheet.skills.forEach(s => {
      if(!F.pericias[s.skill]) return;
      setText(F.pericias[s.skill].valor, fmt(s.bonus));
      setCheck(F.pericias[s.skill].cb, s.proficient || s.expertise);
    });

    // Combate
    setText(F.combate.ca, sheet.combate.ac.value);
    setCheck(F.combate.escudo, !!sheet.combate.ac.shieldEquipped);
    setText(F.combate.pvAtual, sheet.combate.hp);
    setText(F.combate.pvMax, sheet.combate.hp);
    setText(F.combate.dadoVidaTotal, sheet.combate.hitDie);
    setText(F.combate.dadoVidaGasto, '0');
    setText(F.combate.iniciativa, fmt(sheet.combate.initiative));
    setText(F.combate.velocidade, pdfShortDistance(sheet.combate.deslocamento));
    setText(F.combate.tamanho, pdfTamanho());
    setText(F.combate.percepcaoPassiva, sheet.passivePerception);
    setText(F.combate.bonusProf, fmt(sheet.identidade.profBonus));

    // Treino de Armadura (proficiência da CLASSE, não equipamento)
    const armorProf = sheet.clsConst.armorProf || [];
    setCheck(F.treinoArmadura.leve, armorProf.includes('leve'));
    setCheck(F.treinoArmadura.media, armorProf.includes('media'));
    setCheck(F.treinoArmadura.pesada, armorProf.includes('pesada'));
    setCheck(F.treinoArmadura.escudos, armorProf.includes('escudo'));

    // Armas & Truques de Dano
    pdfWeaponRows(sheet).forEach((row, i) => {
      const fRow = F.armas[i];
      if(!fRow) return;
      setText(fRow.nome, row.nome);
      setText(fRow.bonus, row.bonus);
      setText(fRow.dano, row.dano);
    });

    // Textos livres
    setText(F.textos.armas, sheet.proficiencias.armas);
    setText(F.textos.ferramentas, sheet.proficiencias.ferramentas.join('; '));
    setText(F.textos.caracteristicasRaciais, [...(sheet.especieConst.tracosFixos || []), ...sheet.especieTracosExtras].map(t => `${t.nome}: ${stripHtml(t.resumo)}`).join('\n'));
    setText(F.textos.talentos, pdfTalentosText(sheet));
    setText(F.textos.caracteristicasClasse1, sheet.classFeatureLines.join('\n'));

    // Bio (página 2) — Alinhamento/Aparência/História ficam em branco (sem dado)
    setText(F.bio.idiomas, sheet.proficiencias.idiomas.join(', '));
    setText(F.bio.equipamento, pdfEquipmentText(sheet));
    setText(F.bio.moedas.po, fmtGold(sheet.equipamento.poRestante));

    // Conjuração + tabela de magias (só quando a classe conjura)
    if(sheet.spellcasting){
      setText(F.conjuracao.atributo, sheet.spellcasting.habilidade);
      setText(F.conjuracao.modificador, fmt(sheet.spellcasting.ataque - sheet.identidade.profBonus));
      setText(F.conjuracao.cd, sheet.spellcasting.cd);
      setText(F.conjuracao.bonusAtaque, fmt(sheet.spellcasting.ataque));
    }
    pdfSpellRows(sheet).forEach((sp, i) => {
      const row = F.magias[i];
      if(!row) return; // mais magias que linhas na ficha (não deveria acontecer no nível 1)
      setText(row.nivel, sp.nivel);
      setText(row.nome, sp.nome);
      const detail = sp.detalhe || (typeof SPELL_DETAILS !== 'undefined' ? SPELL_DETAILS[sp.nome] : null);
      if(detail){
        setText(row.tempo, detail.tempo);
        setText(row.alcance, detail.alcance);
        setCheck(row.concentracao, !!detail.concentracao);
        setCheck(row.ritual, !!detail.ritual);
        const comps = (detail.componentes || '').split(',').map(s => s.trim());
        setCheck(row.material, comps.some(c => c === 'M' || c.startsWith('M ')));
      }
    });

    const outBytes = await pdfDoc.save();
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ficha - ${data.characterName || data.classe || 'Personagem'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch(e){
    console.error('Falha ao exportar PDF:', e);
    alert('Não foi possível gerar o PDF. Veja o console (F12) pra detalhes.');
  } finally {
    if(btn){ btn.disabled = false; btn.textContent = origLabel; }
  }
}
