import React from "react";

/**
 * Instagram CTA — premium "ticket" style component
 * Designed to sit just below the flyer banner on the home page.
 */
const INSTAGRAM_URL = "https://www.instagram.com/brotherscup_ftv/";

function InstagramGlyph({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
    </svg>
  );
}

export default function InstagramCta() {
  return (
    <div className="ig-cta-wrapper">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="ig-cta"
        aria-label="Inscrições pelo Instagram (abre em nova aba)"
      >
        {/* perforation strip on the left */}
        <span className="ig-cta__perf" aria-hidden="true" />

        <div className="ig-cta__icon">
          <InstagramGlyph className="ig-cta__icon-svg" />
        </div>

        <div className="ig-cta__body">
          <span className="ig-cta__eyebrow">Inscrições · Quarta etapa</span>
          <span className="ig-cta__title">
            INSCREVA-SE PELO <em>INSTAGRAM</em>
          </span>
          <span className="ig-cta__handle">@brotherscup_ftv</span>
        </div>

        <div className="ig-cta__action" aria-hidden="true">
          <span className="ig-cta__action-label">Abrir</span>
          <svg viewBox="0 0 24 24" fill="none" className="ig-cta__action-arrow">
            <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </a>

      <style>{`
        .ig-cta-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 28px 16px 36px;
        }
        .ig-cta {
          --ig-bg-1: #1a0f2e;
          --ig-bg-2: #0d0717;
          --ig-gold: #f4b223;
          --ig-gold-soft: #fcd462;
          --ig-purple: #a987ff;
          position: relative;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 18px;
          width: 100%;
          max-width: 680px;
          padding: 22px 24px 22px 36px;
          border-radius: 14px;
          background:
            radial-gradient(120% 120% at 0% 0%, rgba(244, 178, 35, 0.10), transparent 55%),
            radial-gradient(120% 120% at 100% 100%, rgba(136, 84, 255, 0.18), transparent 55%),
            linear-gradient(160deg, var(--ig-bg-1), var(--ig-bg-2));
          border: 1px solid rgba(244, 178, 35, 0.22);
          color: #fff;
          text-decoration: none;
          overflow: hidden;
          isolation: isolate;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.4s ease;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 18px 40px -22px rgba(244, 178, 35, 0.45),
            0 6px 16px -8px rgba(0, 0, 0, 0.6);
        }
        .ig-cta::before {
          /* top-light sheen */
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), transparent 30%);
          pointer-events: none;
          z-index: -1;
        }
        .ig-cta::after {
          /* hover glow */
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 14px;
          background: conic-gradient(from 180deg at 50% 50%, rgba(244, 178, 35, 0), rgba(244, 178, 35, 0.5), rgba(252, 212, 98, 0.3), rgba(244, 178, 35, 0));
          opacity: 0;
          z-index: -2;
          filter: blur(14px);
          transition: opacity 0.45s ease;
        }
        .ig-cta:hover { transform: translateY(-2px); border-color: rgba(244, 178, 35, 0.55); }
        .ig-cta:hover::after { opacity: 0.9; }
        .ig-cta:focus-visible {
          outline: 2px solid var(--ig-gold);
          outline-offset: 4px;
        }

        /* Left ticket perforation */
        .ig-cta__perf {
          position: absolute;
          top: 10px;
          bottom: 10px;
          left: 14px;
          width: 1px;
          background-image: linear-gradient(180deg, rgba(244, 178, 35, 0.55) 50%, transparent 50%);
          background-size: 1px 6px;
        }

        .ig-cta__icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f4b223 0%, #ec4f8c 50%, #8854ff 100%);
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 8px 24px -8px rgba(244, 79, 140, 0.55);
        }
        .ig-cta__icon-svg { width: 28px; height: 28px; }

        .ig-cta__body {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .ig-cta__eyebrow {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: var(--ig-gold);
        }
        .ig-cta__title {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: clamp(22px, 4.4vw, 30px);
          line-height: 0.95;
          letter-spacing: 0.04em;
          color: #fff;
        }
        .ig-cta__title em {
          font-style: normal;
          background: linear-gradient(90deg, #fcd462, #f4b223);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .ig-cta__handle {
          font-family: 'Sora', monospace;
          font-size: 12px;
          letter-spacing: 0.05em;
          color: rgba(239, 234, 255, 0.65);
        }

        .ig-cta__action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(244, 178, 35, 0.35);
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
        }
        .ig-cta__action-arrow {
          width: 14px;
          height: 14px;
          color: var(--ig-gold-soft);
          transition: transform 0.25s ease;
        }
        .ig-cta:hover .ig-cta__action {
          background: rgba(244, 178, 35, 0.12);
          border-color: var(--ig-gold);
        }
        .ig-cta:hover .ig-cta__action-arrow {
          transform: translate(2px, -2px);
        }

        @media (max-width: 540px) {
          .ig-cta {
            grid-template-columns: auto 1fr;
            padding: 18px 18px 18px 28px;
            gap: 14px;
          }
          .ig-cta__action {
            grid-column: 1 / -1;
            justify-content: center;
            margin-top: 6px;
          }
          .ig-cta__action-label { letter-spacing: 0.28em; }
        }
      `}</style>
    </div>
  );
}
