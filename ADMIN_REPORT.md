# Relatório Completo — Painel Administrativo Brothers Cup

## 1. Visão Geral da Arquitetura

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Tailwind CSS v3 |
| Backend | Express.js + PostgreSQL |
| Autenticação | JWT (jsonwebtoken) + bcrypt |
| Deploy | Vercel (backend), static host (frontend) |
| Pagamentos | Mercado Pago SDK |

**Rota:** `/admin` — protegida via `<ProtectedRoute>` em `App.js`

---

## 2. Fluxo de Autenticação

### 2.1 Login — `src/pages/LoginPage.js`
- Formulário simples: `username` + `password`
- Chama `POST /login` via `src/services/api.js`
- Backend compara `bcrypt.compare(password, ADMIN_PASSWORD_HASH)` — credenciais do admin via `.env` (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`)
- Retorna JWT com `{ username, role: "admin" }`, expiração de **8 horas**
- Token e user salvos em `localStorage` via `AuthContext`

### 2.2 Rate Limiting
- **5 tentativas** máximas por IP
- **Lockout de 15 minutos** após exceder
- Implementado via `Map` em memória no `backend/server.js`

### 2.3 AuthContext — `src/contexts/AuthContext.js`
- **Estado global** via React Context: `user`, `token`, `isAuthenticated`, `isLoading`
- **Validação no mount:** chama `GET /verify-token` para verificar se JWT ainda é válido
- **Logout forçado:** escuta evento `auth:logout` (disparado pela camada de API em 401/403)
- **Persistência:** `localStorage` (`adminToken`, `adminUser`)

### 2.4 Service Layer — `src/services/api.js`
- `getAuthHeaders()` injeta `Authorization: Bearer <token>` automaticamente
- `handleResponse()` trata 401/403 limpando localStorage e disparando `auth:logout`
- Classe customizada `ApiError` com `status` e `data`

---

## 3. Componentes do Admin

### 3.1 AdminPage (Página Principal) — `src/pages/admin/AdminPage.js`

**Estados gerenciados:**

| Estado | Tipo | Descrição |
|---|---|---|
| `inscricoes` | array | Lista completa de inscrições |
| `editing` | object/null | Inscrição sendo editada (abre EditModal) |
| `creating` | boolean | Controla abertura do CreateModal |
| `search` | string | Filtro de busca por texto |
| `mostrarApenasPagos` | boolean | Toggle para filtrar apenas pagos |
| `loading` / `error` | bool/string | Controle de loading e erros |
| `serverStatus` | object | Status do servidor backend |
| `vagasOpen` | boolean | Controla abertura do VagasModal |

**Funcionalidades implementadas:**

| Funcionalidade | Status | Detalhes |
|---|---|---|
| Listar inscrições | ✅ | Tabela completa com 13 colunas |
| Busca/filtro por texto | ✅ | Filtra por representante, parceiro, categoria ou ID |
| Filtro apenas pagos | ✅ | Toggle button "Pagos/Todos" |
| Editar inscrição | ✅ | Modal com todos os campos editáveis |
| Criar inscrição (admin) | ✅ | Modal dedicado, sem Mercado Pago |
| Excluir inscrição | ✅ | Com `window.confirm` de confirmação |
| Exportar Excel (todos) | ✅ | Gera `.xlsx` com todas as inscrições |
| Exportar Excel (pagos) | ✅ | Gera `.xlsx` apenas com `status=approved` |
| Vagas por categoria | ✅ | Modal com barras de progresso visual |
| Status do servidor | ✅ | Card com uptime, status DB, latência |
| Logout | ✅ | Com confirmação, limpa token/sessão |
| Badge de status | ✅ | 7 status visuais distintos |

**Status de pagamento suportados:**

| Status | Badge | Cor |
|---|---|---|
| `approved` | ✅ Aprovado | Verde |
| `metade_pago` | 💰 Metade Pago | Amarelo |
| `pending` / `pendente` | ⏳ Pendente | Azul |
| `rejected` / `rejeitado` | ❌ Rejeitado | Vermelho |
| `campeao` | 🏆 Campeão | Âmbar/Dourado |

**Colunas da tabela:**

ID, Representante, Celular, Parceiro, @ Rep., @ Parc., Tam. Rep., Tam. Parc., Categoria, Data, Status, Obs., Ações (editar/excluir)

**Destaque visual por linha:**
- `approved` → fundo verde sutil (`bg-green-900/10`)
- `campeao` → fundo âmbar sutil (`bg-amber-900/10`)

---

### 3.2 EditModal — `src/pages/admin/EditModal.js`

**Campos editáveis:**
- Representante, Parceiro, Celular, Categoria (select)
- Instagram Rep., Instagram Parc.
- CT Representante, CT Parceiro
- Uniforme Rep., Uniforme Parc. (select com opção "Personalizado" → input dinâmico)
- Status de Pagamento (5 opções: Pendente, Aprovado, Metade Pago, Rejeitado, Campeão)
- 2a inscrição Representante / Parceiro (checkboxes)
- Observação (textarea)

**Comportamento especial:**
- Marcar "2a inscrição" auto-preenche uniforme como "Segunda Inscrição"
- Uniforme "Personalizado" revela input de texto livre
- Loading state no botão "Salvar"

### 3.3 CreateModal — `src/pages/admin/CreateModal.js`

- Idêntico ao EditModal em campos
- Status padrão: `approved` (já marcado como pago)
- Validação: representante, parceiro e categoria obrigatórios
- Chama `POST /admin/inscricoes` (rota exclusiva do admin, sem Mercado Pago)
- Exibe erro inline no modal

### 3.4 ServerStatusCard — `src/pages/admin/ServerStatusCard.js`

- Mostra: status online/offline (dot animado), uptime formatado, status do banco + latência
- Botão de refresh com spinner
- Chama `GET /status` (rota pública)

### 3.5 VagasModal — `src/pages/admin/VagasModal.js`

**Capacidades hardcoded no frontend:**

| Categoria | Capacidade |
|---|---|
| Masculino Escolinha | 24 |
| Misto Escolinha | 24 |
| Todas as demais | 16 |

- Calcula totais e pagos por categoria a partir das inscrições já carregadas
- Barra de progresso colorida: verde (<70%), âmbar (70-89%), vermelho (≥90%)
- Rodapé com total geral e % de confirmados

---

## 4. Backend — Rotas Admin Protegidas

Todas protegidas com `authenticateToken` + `authorizeRoles(["admin"])`:

| Rota | Método | Descrição |
|---|---|---|
| `/inscricoes` | GET | Lista todas as inscrições (ORDER BY data DESC) |
| `/admin/inscricoes` | POST | Cria inscrição sem Mercado Pago |
| `/inscricao/:id` | PUT | Atualiza inscrição (todos os campos) |
| `/inscricao/:id` | DELETE | Exclui inscrição |
| `/categorias` | GET | Lista categorias com vagas |
| `/verify-token` | GET | Valida JWT |

### 4.1 Lógica de Vagas (Backend)

- **Criação admin:** Se status é `approved` ou `campeao`, ocupa vaga automaticamente
- **Atualização:** Detecta mudança de status e/ou categoria:
  - Aprovado → Não-aprovado = libera vaga
  - Não-aprovado → Aprovado = ocupa vaga
  - Mudança de categoria = libera da antiga + ocupa na nova
- **Exclusão:** Se status era `approved`/`campeao`, libera vaga
- Usa `GREATEST(0, ...)` para nunca ter vagas negativas

---

## 5. Banco de Dados (PostgreSQL)

### Tabela `inscricoes`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | SERIAL PK | Auto-incremento |
| `representante` | VARCHAR(200) | NOT NULL |
| `parceiro` | VARCHAR(200) | NOT NULL |
| `instagram_representante/parceiro` | VARCHAR(200) | |
| `uniforme_representante/parceiro` | VARCHAR(100) | |
| `categoria` | VARCHAR(100) | FK → categorias.nome |
| `ct_representante/parceiro` | VARCHAR(200) | |
| `celular` | VARCHAR(20) | |
| `status_pagamento` | VARCHAR(50) | default 'pending' |
| `preference_id` | VARCHAR(200) | Mercado Pago |
| `payment_id` | VARCHAR(200) | Mercado Pago |
| `external_reference` | VARCHAR(200) | Mercado Pago |
| `data_inscricao` | TIMESTAMP | default NOW() |
| `segunda_inscricao_rep` | BOOLEAN | default FALSE |
| `segunda_inscricao_parc` | BOOLEAN | default FALSE |

> **Nota:** O campo `observacao` é usado no código mas **NÃO está presente no `setup-dev-db.sql`**. Provável adição manual em produção ou via auto-setup.

### Tabela `categorias`

| Campo | Tipo |
|---|---|
| `nome` | VARCHAR(100) PK |
| `vagas_totais` | INTEGER (default 16) |
| `vagas_ocupadas` | INTEGER (default 0) |

### Tabela `payment_preferences`

| Campo | Tipo |
|---|---|
| `preference_id` | VARCHAR(200) PK |
| `external_reference` | VARCHAR(200) |
| `title` | VARCHAR(500) |
| `amount` | DECIMAL(10,2) |
| `status` | VARCHAR(50) |
| `created_at` | TIMESTAMP |
| `updated_at` | TIMESTAMP |
| `payment_id` | VARCHAR(200) |
| `payment_status_detail` | VARCHAR(200) |
| `transaction_amount` | DECIMAL(10,2) |
| `date_approved` | TIMESTAMP |
| `payer_email` | VARCHAR(300) |

---

## 6. Componentes UI Reutilizáveis — `src/Components/ui/index.js`

| Componente | Props | Uso no Admin |
|---|---|---|
| `Spinner` | size (sm/md/lg) | Loading states |
| `PageLoader` | message | Tela de carregamento inicial |
| `Badge` | variant (default/success/warning/danger/info/champion) | Status, categorias |
| `Card` | className | Containers de conteúdo |
| `Button` | variant/size/isLoading/disabled | Ações, submit |
| `Input` | label/error (forwardRef) | Formulários |
| `Select` | label/error (forwardRef) | Dropdowns |

---

## 7. Estilização

- **Componentes novos:** 100% Tailwind CSS (classes utilitárias inline)
- **Tema dark:** fundo escuro (`gray-950`, `surface`, `surface-light`), texto claro (`white`, `brand-200`)
- **Cores customizadas do Tailwind:** `brand-*`, `surface-*`, `surface-border` (definidas em `tailwind.config.js`)
- **CSS legado:** `src/styles/AdminPage.css` existe mas **NÃO é importado** pelos componentes novos — é dead code do design anterior

---

## 8. O que NÃO TEM / Limitações

| Item | Status |
|---|---|
| Paginação | ❌ Carrega TODAS as inscrições de uma vez |
| Ordenação de colunas | ❌ Apenas ordem fixa (data DESC) |
| Multi-select / ações em lote | ❌ Só operações individuais |
| Confirmação de e-mail / notificações | ❌ Não existe |
| Múltiplos admins / roles | ❌ Admin único via .env |
| Audit log / histórico de alterações | ❌ Só console.log no backend |
| Upload de imagens/documentos | ❌ |
| Dashboard com gráficos/analytics | ❌ Apenas contagem simples |
| Responsividade mobile completa | ⚠️ Parcial (tabela com scroll horizontal) |
| Dark/light mode toggle | ❌ Apenas dark |
| Refresh automático / real-time | ❌ Manual via botão "Atualizar" |
| Validação de campos no edit | ⚠️ Mínima (sem Zod, só checks obrigatórios no backend) |
| Exportar PDF | ❌ Apenas Excel (.xlsx) |
| Gestão de categorias pelo admin | ❌ Categorias são hardcoded/seed |
| Alterar capacidade de vagas | ❌ Só no banco direto |
| Reset de senha do admin | ❌ Só alterando .env + hash bcrypt |
| Sessão persistente entre abas | ⚠️ Via localStorage (compartilhada) |
| CSRF protection | ❌ Usa JWT (não cookies) — mitigado |
| Busca avançada (filtros combinados) | ❌ Apenas texto livre |

---

## 9. Segurança

| Mecanismo | Implementado |
|---|---|
| JWT com expiração (8h) | ✅ |
| bcrypt para hash de senha | ✅ |
| Rate limiting no login (5 tentativas, 15min lockout) | ✅ |
| CORS configurado | ✅ |
| Helmet (headers de segurança) | ✅ |
| Validação de role (`authorizeRoles`) | ✅ |
| Logout automático em 401/403 | ✅ |
| Verificação de token no mount | ✅ |
| Queries parametrizadas (SQL injection) | ✅ |
| Rate limiting genérico (express-rate-limit) | ❌ Apenas login |
| Input sanitization | ⚠️ Parcial |

---

## 10. Dependências Relevantes

**Frontend:** `xlsx` (exportação Excel), `react-router-dom` (rotas), `@microsoft/clarity` (analytics)

**Backend:** `express`, `pg` (PostgreSQL), `bcrypt`, `jsonwebtoken`, `helmet`, `cors`, `mercadopago`

---

## 11. Estrutura de Arquivos do Admin

```
src/
  pages/
    LoginPage.js              # Tela de login
    admin/
      AdminPage.js            # Página principal do painel
      CreateModal.js          # Modal de criação de inscrição
      EditModal.js            # Modal de edição de inscrição
      ServerStatusCard.js     # Card de status do servidor
      VagasModal.js           # Modal de vagas por categoria
  contexts/
    AuthContext.js             # Gerenciamento de autenticação
  services/
    api.js                    # Camada de comunicação com backend
  Components/
    ui/index.js               # Componentes reutilizáveis (Button, Input, Badge, etc.)
  styles/
    AdminPage.css             # CSS legado (não utilizado)
    LoginPage.css             # CSS legado (não utilizado)

backend/
  server.js                   # Todas as rotas (auth + admin + público + webhooks)
  setup-dev-db.sql            # Schema do banco para desenvolvimento
  .env                        # Variáveis de ambiente (credenciais, JWT, DB, MP)
```
