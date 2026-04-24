import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../../styles/MenuMobile.css";

const TABELAS_URL = "https://tabelas-brotherscup.vercel.app/";

const NAV_ITEMS = [
  { label: "Início", sectionId: "inicio" },
  { label: "Inscrição", sectionId: "inscricao" },
  { label: "Tabelas", href: TABELAS_URL, isExternal: true },
  { label: "Local", sectionId: "local" },
  { label: "Galeria", sectionId: "primeiraetapa" },
  { label: "Patrocinadores", path: "/patrocinadores", isRoute: true },
  { label: "Contato", sectionId: "contato" },
];

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      <line x1="4" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function MenuMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const scrollToSection = useCallback((sectionId) => {
    close();
    if (!isHomePage) {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [isHomePage, navigate]);

  return (
    <>
      <button
        className="menu-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menu"
        aria-expanded={isOpen}
      >
        <HamburgerIcon />
      </button>

      <div
        className={`menu-backdrop ${isOpen ? "menu-backdrop--open" : ""}`}
        onClick={close}
      />

      <nav className={`menu-drawer ${isOpen ? "menu-drawer--open" : ""}`} aria-hidden={!isOpen}>
        <div className="menu-drawer__header">
          <div className="menu-drawer__brand">
            <span className="menu-drawer__eyebrow">Menu</span>
            <span className="menu-drawer__title">
              BROTHERS<em>·</em>CUP
            </span>
          </div>
          <button
            onClick={close}
            className="menu-drawer__close"
            aria-label="Fechar menu"
          >
            <CloseIcon />
          </button>
        </div>

        <ul className="menu-drawer__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.isExternal ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="menu-drawer__link menu-drawer__link--external"
                >
                  {item.label}
                </a>
              ) : item.isRoute ? (
                <Link
                  to={item.path}
                  onClick={close}
                  className="menu-drawer__link"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => scrollToSection(item.sectionId)}
                  className="menu-drawer__link menu-drawer__link--btn"
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="menu-drawer__footer">
          <span className="menu-drawer__footer-mark">Futevôlei · {new Date().getFullYear()}</span>
          <p>Brothers Cup &copy; Todos os direitos reservados</p>
        </div>
      </nav>
    </>
  );
}
