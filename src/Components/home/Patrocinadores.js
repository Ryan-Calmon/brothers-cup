import React from "react";

const PERKS = [
  {
    title: "Visibilidade de marca",
    text: "Logo no flyer oficial, redes sociais, banners de quadra e transmissões.",
  },
  {
    title: "Ativações no evento",
    text: "Espaço para estandes, ações experienciais e brindes para o público presente.",
  },
  {
    title: "Conteúdo exclusivo",
    text: "Co-produção de fotos, reels e cobertura para sua marca dialogar com o esporte.",
  },
];

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
      <path d="M19.05 4.91A10 10 0 0 0 4.7 19.06L3 22l3.04-1.66A10 10 0 1 0 19.05 4.9Zm-7 16.18a8.18 8.18 0 0 1-4.16-1.13l-.3-.18-2.42 1.32.79-2.5-.2-.32A8.2 8.2 0 1 1 12.05 21.1Zm4.5-6.13c-.25-.13-1.46-.72-1.69-.8-.23-.08-.4-.13-.56.13-.17.25-.65.8-.8.97-.15.17-.3.19-.55.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.39.11-.51.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.56-1.36-.77-1.86-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.32-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.55.13.17 1.74 2.66 4.22 3.73.59.26 1.05.41 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3Z" />
    </svg>
  );
}

export default function Patrocinadores() {
  return (
    <section className="patro">
      <div className="patro__hero">
        <span className="patro__eyebrow">Brothers Cup · Comercial</span>
        <h1 className="patro__title">
          PATROCÍNIO <em>BROTHERS CUP</em>
        </h1>
        <p className="patro__lead">
          Conecte sua marca a um dos circuitos de futevôlei mais vibrantes do Rio.
          Atletas amadores e profissionais, público engajado e cobertura
          completa em todas as etapas.
        </p>
      </div>

      <div className="patro__grid">
        {PERKS.map((p, i) => (
          <article key={p.title} className="perk">
            <span className="perk__num">0{i + 1}</span>
            <h3 className="perk__title">{p.title}</h3>
            <p className="perk__text">{p.text}</p>
          </article>
        ))}
      </div>

      <article className="patro__cta">
        <div className="patro__cta-decor" aria-hidden="true" />

        <div className="patro__cta-body">
          <span className="patro__cta-eyebrow">Vamos construir juntos?</span>
          <h2 className="patro__cta-title">
            INTERESSADO EM <em>PATROCINAR?</em>
          </h2>
          <p className="patro__cta-text">
            Envie um e-mail para o nosso time comercial e receba o
            <strong> media kit completo</strong> com formatos de cota,
            contrapartidas e datas das próximas etapas.
          </p>

          <div className="patro__cta-actions">
            <a
              className="btn btn--primary"
              href="mailto:comercial@brotherscup.com.br?subject=Interesse%20em%20patroc%C3%ADnio%20-%20Brothers%20Cup"
            >
              <MailIcon />
              <span>Enviar e-mail</span>
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14" aria-hidden="true" className="btn__arrow">
                <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>

            <a
              className="btn btn--ghost"
              href="https://wa.me/+5521988280800?text=Ol%C3%A1!%20Tenho%20interesse%20em%20patrocinar%20o%20Brothers%20Cup."
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsIcon />
              <span>Falar no WhatsApp</span>
            </a>
          </div>

          <div className="patro__cta-meta">
            <span>comercial@brotherscup.com.br</span>
            <span aria-hidden="true">·</span>
            <span>+55 21 95909-6545</span>
          </div>
        </div>
      </article>

      <style>{`
        .patro {
          position: relative;
          min-height: 100vh;
          padding: 56px 16px 96px;
          max-width: 1080px;
          margin: 0 auto;
        }
        .patro__hero {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 56px;
        }
        .patro__eyebrow {
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #f4b223;
        }
        .patro__title {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: clamp(44px, 9vw, 84px);
          line-height: 0.88;
          letter-spacing: 0.04em;
          color: #fff;
          margin: 0;
        }
        .patro__title em {
          font-style: normal;
          background: linear-gradient(90deg, #fcd462, #f4b223);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .patro__lead {
          font-family: 'Sora', sans-serif;
          font-size: 15px;
          line-height: 1.65;
          color: rgba(239, 234, 255, 0.72);
          max-width: 600px;
          margin: 0;
        }

        .patro__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin-bottom: 56px;
        }
        @media (min-width: 760px) {
          .patro__grid { grid-template-columns: repeat(3, 1fr); gap: 18px; }
        }

        .perk {
          position: relative;
          padding: 24px 20px 22px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(244, 178, 35, 0.14);
          transition: border-color 0.25s ease, transform 0.25s ease, background 0.25s ease;
        }
        .perk:hover {
          border-color: rgba(244, 178, 35, 0.45);
          background: rgba(244, 178, 35, 0.04);
          transform: translateY(-2px);
        }
        .perk__num {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: 32px;
          line-height: 1;
          letter-spacing: 0.04em;
          background: linear-gradient(180deg, #fcd462, #a86d08);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: block;
          margin-bottom: 10px;
        }
        .perk__title {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: 22px;
          letter-spacing: 0.05em;
          color: #fff;
          margin: 0 0 8px;
        }
        .perk__text {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          line-height: 1.55;
          color: rgba(239, 234, 255, 0.65);
          margin: 0;
        }

        /* CTA card */
        .patro__cta {
          position: relative;
          border-radius: 22px;
          padding: 44px 28px;
          overflow: hidden;
          isolation: isolate;
          background:
            radial-gradient(80% 100% at 0% 0%, rgba(244, 178, 35, 0.12), transparent 55%),
            radial-gradient(80% 100% at 100% 100%, rgba(136, 84, 255, 0.18), transparent 55%),
            linear-gradient(160deg, #1a0f2e, #0a0710);
          border: 1px solid rgba(244, 178, 35, 0.28);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 30px 60px -30px rgba(244, 178, 35, 0.4);
        }
        .patro__cta-decor {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(transparent 0, transparent calc(100% - 1px), rgba(244, 178, 35, 0.08) 100%),
            linear-gradient(90deg, transparent 0, transparent calc(100% - 1px), rgba(244, 178, 35, 0.08) 100%);
          background-size: 28px 28px;
          mask-image: radial-gradient(70% 80% at 100% 0%, #000, transparent 70%);
          -webkit-mask-image: radial-gradient(70% 80% at 100% 0%, #000, transparent 70%);
          pointer-events: none;
          z-index: -1;
        }
        .patro__cta-body {
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .patro__cta-eyebrow {
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #f4b223;
        }
        .patro__cta-title {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: clamp(32px, 6vw, 52px);
          line-height: 0.92;
          letter-spacing: 0.04em;
          color: #fff;
          margin: 0;
        }
        .patro__cta-title em {
          font-style: normal;
          background: linear-gradient(90deg, #fcd462, #f4b223);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .patro__cta-text {
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          line-height: 1.65;
          color: rgba(239, 234, 255, 0.78);
          margin: 6px 0 18px;
        }
        .patro__cta-text strong {
          color: #fcd462;
          font-weight: 600;
        }

        .patro__cta-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .btn {
          --btn-color: #f4b223;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 22px;
          border-radius: 999px;
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          border: 1px solid transparent;
          transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease, box-shadow 0.3s ease;
        }
        .btn__arrow {
          opacity: 0.85;
          transition: transform 0.25s ease;
        }
        .btn:hover { transform: translateY(-2px); }
        .btn:hover .btn__arrow { transform: translate(2px, -2px); }
        .btn:focus-visible {
          outline: 2px solid var(--btn-color);
          outline-offset: 3px;
        }

        .btn--primary {
          background: linear-gradient(135deg, #fcd462, #f4b223 60%, #d99413);
          color: #1a0f00;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.5),
            0 14px 32px -14px rgba(244, 178, 35, 0.7);
        }
        .btn--primary:hover {
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.6),
            0 18px 40px -14px rgba(244, 178, 35, 0.85);
        }

        .btn--ghost {
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.18);
        }
        .btn--ghost:hover {
          background: rgba(37, 211, 102, 0.10);
          border-color: rgba(37, 211, 102, 0.6);
          color: #25d366;
        }

        .patro__cta-meta {
          display: inline-flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 10px;
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(239, 234, 255, 0.45);
          padding-top: 16px;
          border-top: 1px dashed rgba(244, 178, 35, 0.2);
          width: 100%;
          max-width: 520px;
        }
      `}</style>
    </section>
  );
}
