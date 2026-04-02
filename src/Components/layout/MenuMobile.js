import { useState, useEffect, useCallback } from "react";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "../../styles/MenuMobile.css";

const NAV_ITEMS = [
  { label: "Início", sectionId: "inicio" },
  { label: "Inscrição", sectionId: "inscricao" },
  { label: "Tabelas", path: "/tabelas", isRoute: true },
  { label: "Local", sectionId: "local" },
  { label: "Galeria", sectionId: "primeiraetapa" },
  { label: "Patrocinadores", path: "/patrocinadores", isRoute: true },
  { label: "Contato", sectionId: "contato" },
];

export default function MenuMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
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
      >
        <IoMdMenu />
      </button>

      {/* Backdrop */}
      <div
        className={`menu-backdrop ${isOpen ? "menu-backdrop--open" : ""}`}
        onClick={close}
      />

      {/* Drawer */}
      <nav className={`menu-drawer ${isOpen ? "menu-drawer--open" : ""}`}>
        <div className="menu-drawer__header">
          <span className="menu-drawer__title">MENU</span>
          <button
            onClick={close}
            className="menu-drawer__close"
            aria-label="Fechar menu"
          >
            <IoMdClose />
          </button>
        </div>

        <ul className="menu-drawer__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.isRoute ? (
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
          <p>BROTHERS CUP &copy; {new Date().getFullYear()}</p>
        </div>
      </nav>
    </>
  );
}
