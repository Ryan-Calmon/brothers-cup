export default function Patrocinadores() {
  return (
    <div className="min-h-screen px-4 py-16 max-w-6xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-white mb-4">🤝 Patrocinadores</h1>
      <p className="text-brand-200/60 text-lg mb-12">
        Quer fazer parte deste evento? Seja um patrocinador do Brothers Cup!
      </p>

      <div className="bg-surface border border-surface-border rounded-2xl p-12">
        <p className="text-brand-200 text-xl mb-6">
          Interessado em patrocinar?
        </p>
        <a
          href="mailto:comercial@brotherscup.com.br"
          className="inline-flex items-center gap-2 bg-brand-400 hover:bg-brand-500 text-white font-semibold px-8 py-3 rounded-lg transition-all"
        >
          Entre em contato
        </a>
      </div>
    </div>
  );
}
