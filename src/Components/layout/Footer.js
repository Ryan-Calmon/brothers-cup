export default function Footer() {
  return (
    <footer className="mt-auto border-t border-brand-800/30 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="text-center text-brand-300/40 text-sm">
          <p>&copy; Brothers Cup {new Date().getFullYear()}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
