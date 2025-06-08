import React from 'react';
import Header from './Components/Header';
import Home from './Components/Home';
import Inscricao from './Components/FormularioInscricao';
import Lightning from './Components/Lightning';
import './App.css';

function App() {
  return (
    <div>
      {/* Fundo com efeito Lightning */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: '0',
          zIndex: -1,
          pointerEvents: 'none',
        }}
      >
        <Lightning
          hue={265}
          xOffset={0}
          speed={0.5}
          intensity={0.4}
          size={1.7}
        />
      </div>

      {/* Conteúdo principal */}
      <Header />

      <main>
        <section id="inicio">
          <Home />
        </section>

        <section id="inscricao">
          <Inscricao />
        </section>
      </main>
    </div>
  );
}

export default App;
