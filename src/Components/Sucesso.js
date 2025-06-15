import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/sucesso.css";

function Sucesso() {
  const [searchParams] = useSearchParams();
  const [inscricaoId, setInscricaoId] = useState(null);

  useEffect(() => {
    const id = searchParams.get("inscricaoId");
    if (id) {
      setInscricaoId(id);
    }
  }, [searchParams]);

  return (
    <div className="sucesso-container">
      <h1>Obrigado por se inscrever!</h1>
      {inscricaoId ? (
        <h2>O número da sua inscrição é: <span className="destaque">#{inscricaoId}</span></h2>
      ) : (
        <h2>Estamos processando sua inscrição...</h2>
      )}
      <p>Boa sorte e bons jogos! ⚽🏆</p>
    </div>
  );
}

export default Sucesso;
