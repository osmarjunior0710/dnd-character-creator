import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StringsProvider } from "./i18n/context";
import { RulesetProvider } from "./ruleset/RulesetContext";
import { SplashHome } from "./routes/SplashHome";
import { Wizard } from "./routes/Wizard";
import { CarregarPersonagem } from "./routes/CarregarPersonagem";
import { Ferramentas } from "./routes/Ferramentas";
import { PersonagemLayout, AbaPersonagemPlaceholder } from "./routes/Personagem";
import { definirBackend, criarBackendLocalStorage } from "@core/armazenamento/armazenamento.ts";

// Backend de armazenamento real do app (localStorage) — definido uma vez,
// no arranque. Trocar pra nuvem na Fase 4 é trocar só esta linha; nenhuma
// tela chama localStorage direto (VISAO.md §5.1).
definirBackend(criarBackendLocalStorage());

function App() {
  return (
    <StringsProvider>
      <RulesetProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashHome />} />
            <Route path="/novo" element={<Wizard />} />
            <Route path="/carregar" element={<CarregarPersonagem />} />
            <Route path="/ferramentas" element={<Ferramentas />} />
            <Route path="/personagem/:id" element={<PersonagemLayout />}>
              <Route path="perfil" element={<AbaPersonagemPlaceholder />} />
              <Route path="mochila" element={<AbaPersonagemPlaceholder />} />
              <Route path="magias" element={<AbaPersonagemPlaceholder />} />
              <Route path="play" element={<AbaPersonagemPlaceholder />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RulesetProvider>
    </StringsProvider>
  );
}

export default App;
