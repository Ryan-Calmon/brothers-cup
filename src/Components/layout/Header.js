import { Link, useLocation } from "react-router-dom";
import logo from "../../images/logo-brothers.png";
import MenuMobile from "./MenuMobile";

export default function Header() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full bg-black/70 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={isHomePage ? "#home" : "/"} className="flex items-center gap-3">
          <img
            className="h-12 w-auto"
            src={logo}
            alt="Brothers Cup Logo"
          />
        </Link>

        <h1 className="text-xl md:text-2xl font-bold tracking-widest text-white uppercase hidden sm:block">
          BROTHERS CUP
        </h1>

        <MenuMobile />
      </div>
    </header>
  );
}
