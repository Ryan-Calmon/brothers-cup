import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Header from "./Components/layout/Header";
import Footer from "./Components/layout/Footer";
import HeroBanner from "./Components/home/HeroBanner";
import FormularioInscricao from "./Components/inscricao/FormularioInscricao";
import LocalMap from "./Components/home/LocalMap";
import Gallery from "./Components/home/Gallery";
import Contato from "./Components/home/Contato";
import Patrocinadores from "./Components/home/Patrocinadores";
import TabelaTorneio from "./Components/torneio/TabelaTorneio";
import LoginPage from "./pages/LoginPage";
import Sucesso from "./pages/Sucesso";
import AdminPage from "./pages/admin/AdminPage";
import Lightning from "./Components/Lightning";
import { PageLoader } from "./Components/ui";
import "./App.css";

import Clarity from "@microsoft/clarity";

if (process.env.NODE_ENV === "production") {
  Clarity.init("s9fs2d34fp");
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader message="Verificando sessão..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function HomePage() {
  return (
    <>
      <section id="inicio">
        <HeroBanner />
      </section>
      <section id="inscricao">
        <FormularioInscricao />
      </section>
      <section id="local">
        <LocalMap />
      </section>
      <section id="primeiraetapa">
        <Gallery />
      </section>
      <section id="contato">
        <Contato />
      </section>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Background Effect */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <Lightning hue={265} xOffset={0} speed={0.5} intensity={0.4} size={1.7} />
        </div>

        <div className="flex flex-col min-h-screen">
          <Header />

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/sucesso" element={<Sucesso />} />
              <Route path="/tabelas" element={<TabelaTorneio />} />
              <Route path="/patrocinadores" element={<Patrocinadores />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;