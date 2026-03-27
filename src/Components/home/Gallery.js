import { Button } from "../../Components/ui";

const ETAPAS = [
  {
    titulo: "Segunda Etapa",
    links: [
      { label: "📷 Dia 1", url: "https://drive.google.com/drive/folders/1IPlbyE8pnIJrxYVrnZ31pO8SJZPWXZDo" },
      { label: "📷 Dia 2", url: "https://drive.google.com/drive/folders/1pZuEdsrrDzbzJtZTqnDdBrlau6UboXI0" },
    ],
  },
  {
    titulo: "Terceira Etapa",
    links: [
      { label: "📷 Dia 1", url: "https://drive.google.com/drive/folders/17jNeEeFvuTZxlfgIt1zQMnok1eOuwRP6" },
      { label: "📷 Dia 2 - Link 1", url: "https://drive.google.com/drive/folders/1CgDMIE4ya_M7mkkAj0Zku4NH-Xp9qWcm" },
      { label: "📷 Dia 2 - Link 2", url: "https://drive.google.com/drive/folders/1kBj9SeldTfLnrgJyroLVxOdUsMRzXM82" },
    ],
  },
];

export default function Gallery() {
  return (
    <section className="py-12 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        📸 Galeria de Fotos
      </h2>

      <div className="space-y-8">
        {ETAPAS.map((etapa) => (
          <div key={etapa.titulo}>
            <h3 className="text-lg font-semibold text-brand-300 text-center mb-4">
              {etapa.titulo}
            </h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {etapa.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    {link.label}
                  </Button>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
