import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { useLocation, useNavigate, Link } from "react-router-dom";

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
      // Navigate home first, then scroll after render
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
        className="text-white text-3xl p-1 hover:text-brand-400 transition-colors"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menu"
      >
        <IoMdMenu />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              style={{ zIndex: 9998 }}
              onClick={close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.nav
              className="fixed top-0 right-0 h-full w-72 border-l border-brand-800/30 flex flex-col"
              style={{ zIndex: 9999, backgroundColor: "#0a0a0f" }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
            >
              <div className="flex items-center justify-between p-5 border-b border-brand-800/30">
                <span className="text-brand-300 font-bold text-lg tracking-wider">
                  MENU
                </span>
                <button
                  onClick={close}
                  className="text-brand-300 hover:text-white text-2xl transition-colors"
                  aria-label="Fechar menu"
                >
                  <IoMdClose />
                </button>
              </div>

              <ul className="flex-1 py-4 space-y-1 list-none m-0 p-0">
                {NAV_ITEMS.map((item) => (
                  <li key={item.label}>
                    {item.isRoute ? (
                      <Link
                        to={item.path}
                        onClick={close}
                        className="block px-6 py-3 text-brand-200 hover:bg-brand-800/40 hover:text-white transition-all font-medium no-underline"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => scrollToSection(item.sectionId)}
                        className="block w-full text-left px-6 py-3 text-brand-200 hover:bg-brand-800/40 hover:text-white transition-all font-medium bg-transparent border-0 cursor-pointer"
                      >
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              <div className="p-5 border-t border-brand-800/30">
                <p className="text-brand-300/40 text-xs text-center">
                  BROTHERS CUP &copy; {new Date().getFullYear()}
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
