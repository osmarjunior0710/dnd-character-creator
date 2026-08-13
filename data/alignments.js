/* Os 9 Alinhamentos do Capítulo 4 do PHB 2024 — eixo Ordem (Ordeiro/
   Neutro/Caótico) × eixo Moral (Bom/Neutro/Mau). "Neutro" sozinho (sem
   qualificador) é o centro dos dois eixos ao mesmo tempo, não só do
   eixo Moral — por isso não tem "Neutro e Neutro" na lista, só "Neutro". */
const ALIGNMENTS = ["Ordeiro e Bom","Neutro e Bom","Caótico e Bom","Ordeiro e Neutro","Neutro","Caótico e Neutro","Ordeiro e Mau","Neutro e Mau","Caótico e Mau"];

const ALIGNMENT_INFO = {
  "Ordeiro e Bom": {descricao: "Esforça-se para fazer a coisa certa conforme esperado pela sociedade; luta contra a injustiça e protege inocentes."},
  "Neutro e Bom": {descricao: "Faz o melhor que pode, trabalhando dentro das regras mas sem se sentir obrigado por elas."},
  "Caótico e Bom": {descricao: "Age conforme a própria consciência, sem se importar com o que os outros esperam."},
  "Ordeiro e Neutro": {descricao: "Age de acordo com lei, tradição ou código pessoal; segue uma vida disciplinada."},
  "Neutro": {descricao: "Prefere evitar questões morais, não toma partido, faz o que parece melhor no momento."},
  "Caótico e Neutro": {descricao: "Segue seus impulsos, valorizando a liberdade pessoal acima de tudo."},
  "Ordeiro e Mau": {descricao: "Toma metodicamente o que quer dentro dos limites de um código de tradição, lealdade ou ordem."},
  "Neutro e Mau": {descricao: "Não se preocupa com o mal que causa enquanto persegue seus desejos."},
  "Caótico e Mau": {descricao: "Age com violência arbitrária, impulsionado por ódio ou sede de sangue."}
};
