import React from "react";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";

const CHANNELS = [
  {
    icon: FaWhatsapp,
    href: "https://wa.me/+5521959096545",
    label: "WhatsApp",
    handle: "+55 21 95909-6545",
    accent: "#25d366",
    description: "Resposta rápida",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/brotherscup_ftv/",
    label: "Instagram",
    handle: "@brotherscup_ftv",
    accent: "#ec4f8c",
    description: "Bastidores · Inscrições",
  },
  {
    icon: FaTiktok,
    href: "https://www.tiktok.com/@brotherscup_ftv",
    label: "TikTok",
    handle: "@brotherscup_ftv",
    accent: "#22d3ee",
    description: "Melhores momentos",
  },
  {
    icon: MdOutlineEmail,
    href: "mailto:comercial@brotherscup.com.br",
    label: "Email",
    handle: "comercial@brotherscup.com.br",
    accent: "#fcd462",
    description: "Comercial · Patrocínio",
  },
];

export default function Contato() {
  return (
    <section className="contato">
      <div className="contato__head">
        <span className="contato__eyebrow">Fale com a organização</span>
        <h2 className="contato__title">
          ENTRE EM <em>CONTATO</em>
        </h2>
        <p className="contato__lead">
          Dúvidas, parcerias ou imprensa — escolha o canal que preferir.
          Costumamos responder em poucas horas.
        </p>
      </div>

      <ul className="contato__grid">
        {CHANNELS.map(({ icon: Icon, href, label, handle, description, accent }) => (
          <li key={label}>
            <a
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="ch-card"
              style={{ "--accent": accent }}
              aria-label={`${label}: ${handle}`}
            >
              <span className="ch-card__icon-wrap">
                <Icon className="ch-card__icon" />
              </span>
              <span className="ch-card__body">
                <span className="ch-card__label">{label}</span>
                <span className="ch-card__handle">{handle}</span>
                <span className="ch-card__desc">{description}</span>
              </span>
              <svg viewBox="0 0 24 24" fill="none" className="ch-card__arrow" aria-hidden="true">
                <path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </li>
        ))}
      </ul>

      <style>{`
        .contato {
          position: relative;
          padding: 64px 16px 80px;
          max-width: 1080px;
          margin: 0 auto;
        }
        .contato__head {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
        }
        .contato__eyebrow {
          font-family: 'Sora', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #f4b223;
        }
        .contato__title {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: clamp(38px, 7vw, 64px);
          line-height: 0.9;
          letter-spacing: 0.04em;
          color: #fff;
          margin: 0;
        }
        .contato__title em {
          font-style: normal;
          background: linear-gradient(90deg, #fcd462, #f4b223);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .contato__lead {
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(239, 234, 255, 0.7);
          max-width: 540px;
          margin: 0;
        }

        .contato__grid {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 720px) {
          .contato__grid { grid-template-columns: 1fr 1fr; }
        }

        .ch-card {
          --accent: #f4b223;
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 18px;
          border-radius: 14px;
          background:
            linear-gradient(160deg, rgba(26, 15, 46, 0.95) 0%, rgba(13, 7, 23, 0.95) 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #fff;
          text-decoration: none;
          overflow: hidden;
          isolation: isolate;
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.4s ease;
        }
        .ch-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(120% 100% at 0% 0%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 60%);
          opacity: 0;
          transition: opacity 0.35s ease;
          z-index: -1;
        }
        .ch-card::after {
          content: "";
          position: absolute;
          left: 0;
          top: 16px;
          bottom: 16px;
          width: 2px;
          background: var(--accent);
          border-radius: 2px;
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.3s ease;
        }
        .ch-card:hover,
        .ch-card:focus-visible {
          outline: none;
          transform: translateY(-2px);
          border-color: color-mix(in srgb, var(--accent) 50%, transparent);
          box-shadow: 0 18px 40px -22px color-mix(in srgb, var(--accent) 60%, transparent);
        }
        .ch-card:hover::before,
        .ch-card:focus-visible::before { opacity: 1; }
        .ch-card:hover::after,
        .ch-card:focus-visible::after { transform: scaleY(1); }

        .ch-card__icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
          color: var(--accent);
          flex-shrink: 0;
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .ch-card__icon { font-size: 22px; }
        .ch-card:hover .ch-card__icon-wrap {
          background: color-mix(in srgb, var(--accent) 22%, transparent);
        }

        .ch-card__body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .ch-card__label {
          font-family: 'Bebas Neue', 'Anton', Impact, sans-serif;
          font-size: 20px;
          letter-spacing: 0.06em;
          line-height: 1;
          color: #fff;
        }
        .ch-card__handle {
          font-family: 'Sora', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(239, 234, 255, 0.85);
          word-break: break-all;
        }
        .ch-card__desc {
          font-family: 'Sora', sans-serif;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(239, 234, 255, 0.45);
        }

        .ch-card__arrow {
          width: 16px;
          height: 16px;
          color: rgba(239, 234, 255, 0.4);
          transition: color 0.25s ease, transform 0.25s ease;
          flex-shrink: 0;
        }
        .ch-card:hover .ch-card__arrow {
          color: var(--accent);
          transform: translate(2px, -2px);
        }
      `}</style>
    </section>
  );
}
