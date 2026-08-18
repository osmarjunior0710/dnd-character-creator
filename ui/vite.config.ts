import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // core/ é um pacote TypeScript próprio (sem build step, sem
      // publicar no npm) — o Vite processa os .ts direto daqui, mesmo
      // esquema de "sem build" que o resto do repo já usa. Nunca importar
      // de data/rulesets/dnd2024/ direto de dentro de core/ (isso seria
      // regra de D&D vazando pro motor) — só ui/ e os scripts de
      // comparação fazem essa ponte.
      '@core': fileURLToPath(new URL('../core', import.meta.url)),
      // Dados do ruleset D&D 2024 — só JSON estático, nunca código. Se
      // aparecer um .ts/.js sendo importado por este alias, é sinal de que
      // regra de D&D vazou pra fora de data/rulesets/dnd2024/.
      '@dados': fileURLToPath(new URL('../data/rulesets/dnd2024', import.meta.url)),
    },
  },
})
