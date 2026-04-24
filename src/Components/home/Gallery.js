import React from "react";

const ETAPAS = [
  {
    titulo: "Segunda Etapa",
    numero: "02",
    links: [
      { label: "Dia 1", url: "https://drive.google.com/drive/folders/1IPlbyE8pnIJrxYVrnZ31pO8SJZPWXZDo" },
      { label: "Dia 2", url: "https://drive.google.com/drive/folders/1pZuEdsrrDzbzJtZTqnDdBrlau6UboXI0" },
    ],
  },
  {
    titulo: "Terceira Etapa",
    numero: "03",
    links: [
      { label: "Dia 1", url: "https://drive.google.com/drive/folders/17jNeEeFvuTZxlfgIt1zQMnok1eOuwRP6" },
      { label: "Dia 2 · Bloco 1", url: "https://drive.google.com/drive/folders/1CgDMIE4ya_M7mkkAj0Zku4NH-Xp9qWcm" },
      { label: "Dia 2 · Bloco 2", url: "https://drive.google.com/drive/folders/1kBj9SeldTfLnrgJyroLVxOdUsMRzXM82" },
    ],
  },
];

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="g-card__icon" aria-hidden="true">
      <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowOut() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="g-card__arrow" aria-hidden="true">
      <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Gallery() {
  return (
    <section className="gallery">
      <header className="gallery__head">
        <span className="gallery__eyebrow">Arquivo · Memórias</span>
        <h2 className="gallery__title">
          GALERIA <em>DE FOTOS</em>
        </h2>
        <p className="gallery__lead">
          Reviva os momentos das etapas anteriores. Selecione uma data abaixo
          para abrir o álbum no Google Drive.
        </p>
      </header>

      <div className="gallery__grid">
        {ETAPAS.map((etapa) => (
          <article key={etapa.titulo} className="g-stage">
            <div className="g-stage__head">
              <span className="g-stage__num">{etapa.numero}</span>
              <div className="g-stage__title-wrap">
                <span className="g-stage__kicker">Etapa</span>
                <h3 className="g-stage__title">{etapa.titulo}</h3>
              </div>
              <span className="g-stage__count">{etapa.links.length} álbuns</span>
            </div>

            <ul className="g-stage__list">
              {etapa.links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="g-card"
                  >
                    <CameraIcon />
                    <span className="g-card__body">
                      <span className="g-card__label">{link.label}</span>
                      <span className="g-card__meta">Google Drive · Álbum completo</span>
                    </span>
                    <ArrowOut />
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <style>{`
        .gallery {
          position: relative;
          padding: 56px 16px 80px;
          max-width: 1080px;
          margin: 0 auto;
        }
        .gallery__head {
          text-align: center;
          margin-bottom: 44px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .gallery__eyebrow {
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #f4b223;
        }
        .gallery__title {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: clamp(38px, 7vw, 64px);
          line-height: 0.9;
          letter-spacing: 0.04em;
          color: #fff;
          margin: 0;
        }
        .gallery__title em {
          font-style: normal;
          background: linear-gradient(90deg, #fcd462, #f4b223);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .gallery__lead {
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(239, 234, 255, 0.7);
          max-width: 520px;
          margin: 0;
        }

        .gallery__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
        }
        @media (min-width: 880px) {
          .gallery__grid { grid-template-columns: 1fr 1fr; }
        }

        .g-stage {
          position: relative;
          padding: 28px 22px 22px;
          border-radius: 16px;
          background:
            linear-gradient(180deg, rgba(244, 178, 35, 0.06), transparent 30%),
            linear-gradient(160deg, rgba(26, 15, 46, 0.95) 0%, rgba(13, 7, 23, 0.95) 100%);
          border: 1px solid rgba(244, 178, 35, 0.15);
          overflow: hidden;
          isolation: isolate;
        }
        .g-stage::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(136, 84, 255, 0.18), transparent 65%);
          pointer-events: none;
          z-index: -1;
        }
        .g-stage__head {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 18px;
          border-bottom: 1px dashed rgba(244, 178, 35, 0.25);
          margin-bottom: 18px;
        }
        .g-stage__num {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: 56px;
          line-height: 0.85;
          letter-spacing: 0.02em;
          background: linear-gradient(180deg, #fcd462, #a86d08);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 6px 18px rgba(244, 178, 35, 0.18);
        }
        .g-stage__title-wrap {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }
        .g-stage__kicker {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(239, 234, 255, 0.55);
        }
        .g-stage__title {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: 28px;
          letter-spacing: 0.05em;
          color: #fff;
          margin: 0;
        }
        .g-stage__count {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(244, 178, 35, 0.10);
          color: #f4b223;
          border: 1px solid rgba(244, 178, 35, 0.25);
          flex-shrink: 0;
        }

        .g-stage__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .g-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #fff;
          text-decoration: none;
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
        }
        .g-card::before {
          content: "";
          position: absolute;
          top: 14px;
          bottom: 14px;
          left: 0;
          width: 2px;
          background: #f4b223;
          border-radius: 2px;
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.3s ease;
        }
        .g-card:hover {
          background: rgba(244, 178, 35, 0.06);
          border-color: rgba(244, 178, 35, 0.4);
          transform: translateX(4px);
        }
        .g-card:hover::before { transform: scaleY(1); }
        .g-card:focus-visible {
          outline: 2px solid #f4b223;
          outline-offset: 3px;
        }
        .g-card__icon {
          width: 22px;
          height: 22px;
          color: #fcd462;
          flex-shrink: 0;
        }
        .g-card__body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .g-card__label {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: 18px;
          letter-spacing: 0.06em;
          line-height: 1;
          color: #fff;
        }
        .g-card__meta {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(239, 234, 255, 0.5);
        }
        .g-card__arrow {
          width: 16px;
          height: 16px;
          color: rgba(239, 234, 255, 0.4);
          transition: color 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
        }
        .g-card:hover .g-card__arrow {
          color: #f4b223;
          transform: translate(2px, -2px);
        }
      `}</style>
    </section>
  );
}
