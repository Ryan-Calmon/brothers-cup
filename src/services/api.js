const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.dispatchEvent(new Event("auth:logout"));
    throw new ApiError("Sessão expirada. Faça login novamente.", response.status);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.message || `Erro ${response.status}`,
      response.status,
      data
    );
  }

  return data;
};

// ─── Public Routes ───

export const checkVagas = async (categoria) => {
  const res = await fetch(`${API_BASE_URL}/vagas/${encodeURIComponent(categoria)}`);
  return handleResponse(res);
};

export const criarInscricao = async (dadosInscricao) => {
  const res = await fetch(`${API_BASE_URL}/inscricoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosInscricao),
  });
  return handleResponse(res);
};

export const getServerStatus = async () => {
  const res = await fetch(`${API_BASE_URL}/status`);
  return handleResponse(res);
};

// ─── Auth Routes ───

export const login = async (username, password) => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
};

export const verifyToken = async () => {
  const res = await fetch(`${API_BASE_URL}/verify-token`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ─── Protected Admin Routes ───

export const fetchInscricoes = async () => {
  const res = await fetch(`${API_BASE_URL}/inscricoes`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const updateInscricao = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/inscricao/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteInscricao = async (id) => {
  const res = await fetch(`${API_BASE_URL}/inscricao/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const fetchCategorias = async () => {
  const res = await fetch(`${API_BASE_URL}/categorias`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const criarInscricaoAdmin = async (dados) => {
  const res = await fetch(`${API_BASE_URL}/admin/inscricoes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(dados),
  });
  return handleResponse(res);
};
