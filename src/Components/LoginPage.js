import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Substituindo useHistory por useNavigate

  const handleLogin = () => {
    if (username === 'adminBrothersCup' && password === 'Calmon@05') {
      onLogin(); // Chama a função para alterar o estado do login
      navigate('/admin'); // Redireciona para a página de administração
    } else {
      setError('Usuário ou senha incorretos');
    }
  };

  return (
    <div className="login-container">
        <div className='login-menu'>
      <p className='login'>Login</p>

      {error && <div className="error-message">{error}</div>}

      <div className="input-group">
        <label htmlFor="username">Usuário:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Digite o usuário"
        />
      </div>

      <div className="input-group">
        <label htmlFor="password">Senha:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite a senha"
        />
      </div>

      <button className='entrar' onClick={handleLogin}>Entrar</button>
      </div>
    </div>
  );
}

export default LoginPage;
