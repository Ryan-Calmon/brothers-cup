import { Card } from "../Components/ui";

export default function Sucesso() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="text-6xl mb-6">🏆</div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Inscrição Realizada!
        </h1>
        <h2 className="text-lg text-brand-200 mb-6">
          Nossa equipe enviará uma mensagem para o representante confirmando a inscrição.
        </h2>
        <p className="text-brand-300/60">
          Boa sorte e bons jogos! ⚽🏐
        </p>
        <a
          href="/"
          className="inline-block mt-8 bg-brand-400 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-lg transition-all"
        >
          Voltar ao Início
        </a>
      </Card>
    </div>
  );
}
