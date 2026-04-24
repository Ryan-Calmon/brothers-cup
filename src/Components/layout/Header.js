import { Link, useLocation } from "react-router-dom";
import logo from "../../images/logo-brothers.png";
import MenuMobile from "./MenuMobile";

export default function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full bg-black/70 backdrop-blur-md border-b border-amber-400/15">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={isHomePage ? "#home" : "/"} className="flex items-center gap-3 group">
          <img
            className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            src={logo}
            alt="Brothers Cup Logo"
          />
        </Link>

        <h1 className="font-display text-2xl md:text-3xl tracking-[0.18em] text-white uppercase hidden sm:flex items-center gap-2">
          <span>BROTHERS</span>
          <span className="text-amber-400">·</span>
          <span>CUP</span>
        </h1>

        <MenuMobile />
      </div>
    </header>
  );
}
