# 📊 Arquitetura do Sistema

## Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  index.html  │  styles.css  │  app.js               │  │
│  │  Interface Web Responsiva com Chart.js               │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/HTTPS (REST API)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     API REST (Express)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  /api/auth        │  Autenticação JWT                │  │
│  │  /api/teams       │  CRUD de Times                   │  │
│  │  /api/cycles      │  Gestão de Ciclos                │  │
│  │  /api/evaluations │  CRUD de Avaliações              │  │
│  │  /api/reports     │  Relatórios e Análises           │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ pg (node-postgres)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  teams                │  evaluation_cycles           │  │
│  │  users                │  evaluations                 │  │
│  │  evaluation_answers   │                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Estrutura de Pastas

```
maturidade-agil-kanban/
│
├── 📁 backend/
│   ├── 📄 server.js              # Servidor Express principal
│   ├── 📄 db.js                  # Conexão PostgreSQL
│   └── 📁 routes/
│       ├── 📄 auth.js            # Autenticação (JWT)
│       ├── 📄 teams.js           # Gerenciar times
│       ├── 📄 cycles.js          # Ciclos de avaliação
│       ├── 📄 evaluations.js     # Avaliações individuais
│       └── 📄 reports.js         # Relatórios consolidados
│
├── 📁 frontend/
│   ├── 📄 index.html             # Interface principal
│   ├── 📄 styles.css             # Estilos modernos
│   └── 📄 app.js                 # Lógica e integração API
│
├── 📁 database/
│   ├── 📄 schema.sql             # Schema completo do DB
│   ├── 📄 init.js                # Script de inicialização
│   └── 📄 add_cycles.sql         # Helper para criar ciclos
│
├── 📁 .github/
│   └── 📄 copilot-instructions.md # Instruções do projeto
│
├── 📄 package.json               # Dependências Node.js
├── 📄 .env                       # Configurações (não versionado)
├── 📄 .env.example               # Exemplo de configuração
├── 📄 .gitignore                 # Arquivos ignorados
├── 📄 README.md                  # Documentação principal
├── 📄 SETUP.md                   # Guia de configuração
└── 📄 API_TESTS.md               # Testes da API
```

## Fluxo de Dados

### 1️⃣ Criação de Avaliação

```
Usuario (Frontend)
    ↓
Preenche 24 questões
    ↓
app.js coleta respostas
    ↓
POST /api/evaluations
    ↓
Backend valida dados
    ↓
Salva no PostgreSQL
    ├── evaluations (cabeçalho)
    └── evaluation_answers (24 respostas)
    ↓
Retorna sucesso
    ↓
Frontend mostra confirmação
```

### 2️⃣ Visualização Consolidada

```
Usuario seleciona Time + Ciclo
    ↓
GET /api/reports/team/:id/cycle/:id
    ↓
Backend busca todas avaliações
    ↓
Calcula médias por questão
    ↓
Agrupa por categoria
    ↓
Calcula métricas (score, %, nível)
    ↓
Retorna JSON consolidado
    ↓
Frontend renderiza:
    ├── Métricas
    ├── Gráficos (Chart.js)
    └── Recomendações
```

### 3️⃣ Histórico de Evolução

```
Usuario seleciona Time
    ↓
GET /api/reports/team/:id/history
    ↓
Backend busca todos os ciclos do time
    ↓
Para cada ciclo:
    ├── Calcula média geral
    └── Calcula por categoria
    ↓
Retorna array ordenado por data
    ↓
Frontend renderiza:
    ├── Timeline
    ├── Gráfico de evolução
    └── Comparação entre ciclos
```

## Modelo de Dados

### Relacionamentos

```
users (1) ──────┐
                ├──► (N) evaluations (N) ───► (1) teams
evaluation_cycles (1) ──┘                └─► (1) evaluation_cycles

evaluations (1) ───► (24) evaluation_answers
```

### Tabelas Principais

**teams**
- `id` (PK)
- `name` (unique)
- `description`
- `created_at`, `updated_at`

**users**
- `id` (PK)
- `name`
- `email` (unique)
- `password_hash`
- `role` (evaluator/admin)

**evaluation_cycles**
- `id` (PK)
- `name` (ex: "Q1 2025")
- `start_date`, `end_date`
- `is_active` (boolean)

**evaluations**
- `id` (PK)
- `team_id` (FK → teams)
- `user_id` (FK → users)
- `cycle_id` (FK → evaluation_cycles)
- `created_at`

**evaluation_answers**
- `id` (PK)
- `evaluation_id` (FK → evaluations)
- `question_number` (1-24)
- `answer_value` (1-5)

## API Endpoints

### 🔐 Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário |
| POST | `/api/auth/login` | Fazer login (JWT) |
| GET | `/api/auth/me` | Dados do usuário (requer token) |

### 👥 Times
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/teams` | Listar todos |
| GET | `/api/teams/:id` | Buscar por ID |
| POST | `/api/teams` | Criar novo |
| PUT | `/api/teams/:id` | Atualizar |
| DELETE | `/api/teams/:id` | Deletar |

### 🔄 Ciclos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/cycles` | Listar todos |
| GET | `/api/cycles/active` | Buscar ciclo ativo |
| POST | `/api/cycles` | Criar novo |
| PATCH | `/api/cycles/:id/toggle` | Ativar/desativar |

### 📝 Avaliações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/evaluations` | Criar avaliação |
| GET | `/api/evaluations/team/:id` | Listar por time |
| GET | `/api/evaluations/:id` | Buscar detalhes |
| DELETE | `/api/evaluations/:id` | Deletar |

### 📊 Relatórios
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/reports/team/:teamId/cycle/:cycleId` | Consolidado |
| GET | `/api/reports/team/:teamId/history` | Histórico |
| GET | `/api/reports/compare/:teamId/:c1/:c2` | Comparar ciclos |
| GET | `/api/reports/dashboard/current` | Dashboard geral |

## Tecnologias e Bibliotecas

### Backend
- **Node.js 16+** - Runtime JavaScript
- **Express 4.18** - Framework web minimalista
- **pg 8.11** - Cliente PostgreSQL nativo
- **bcryptjs 2.4** - Hash de senhas
- **jsonwebtoken 9.0** - Autenticação JWT
- **cors 2.8** - Cross-Origin Resource Sharing
- **dotenv 16.3** - Variáveis de ambiente

### Frontend
- **Vanilla JavaScript (ES6+)** - Sem frameworks
- **Chart.js 4.4** - Gráficos interativos
- **CSS3** - Gradientes, animações, grid, flexbox
- **HTML5** - Estrutura semântica

### Database
- **PostgreSQL 12+** - Banco relacional robusto
- **Índices** - Performance otimizada
- **Foreign Keys** - Integridade referencial
- **Triggers** - Timestamps automáticos

## Segurança

### Implementado
✅ Senhas criptografadas com bcrypt  
✅ Tokens JWT para autenticação  
✅ Validação de dados no backend  
✅ Prepared statements (SQL injection prevention)  
✅ CORS configurado  
✅ Variáveis de ambiente (.env)  

### Recomendado para Produção
⚠️ HTTPS obrigatório  
⚠️ Rate limiting  
⚠️ Validação mais robusta  
⚠️ Logs estruturados  
⚠️ Backup automático do banco  
⚠️ Monitoring e alertas  

## Performance

### Otimizações Implementadas
- Índices no banco de dados
- Consultas otimizadas com JOINs
- Connection pooling (pg Pool)
- Lazy loading de gráficos
- CSS minificado e otimizado

### Escalabilidade
- Arquitetura stateless (JWT)
- Fácil adicionar mais instâncias
- Banco separado do servidor
- Cache pode ser adicionado (Redis)

## Manutenção

### Backup do Banco
```powershell
# Backup completo
pg_dump -U postgres -d maturidade_agil -F c -f backup.dump

# Restaurar
pg_restore -U postgres -d maturidade_agil backup.dump
```

### Adicionar Novo Time
```sql
INSERT INTO teams (name, description) 
VALUES ('Novo Time', 'Descrição do time');
```

### Criar Novo Ciclo
```sql
-- Desativar ciclo atual
UPDATE evaluation_cycles SET is_active = false;

-- Criar novo ciclo
INSERT INTO evaluation_cycles (name, start_date, end_date, is_active)
VALUES ('Q1 2026', '2026-01-01', '2026-03-31', true);
```

## Logs e Monitoramento

### Logs do Servidor
O servidor imprime logs no console:
- ✅ Requisições recebidas
- ❌ Erros de conexão
- 🔄 Operações do banco

### Erros Comuns
| Erro | Causa | Solução |
|------|-------|---------|
| ECONNREFUSED | PostgreSQL offline | Iniciar PostgreSQL |
| 404 Not Found | Rota incorreta | Verificar endpoint |
| 500 Internal | Erro no banco | Verificar logs |
| CORS Error | Domínio não permitido | Ajustar CORS |

## Próximas Melhorias

### Funcionalidades
- [ ] Export Excel/CSV
- [ ] Dashboard executivo avançado
- [ ] Notificações por email
- [ ] Comparação entre times
- [ ] Metas e OKRs por time
- [ ] Relatórios personalizáveis
- [ ] Integração Slack/Teams

### Técnicas
- [ ] Testes automatizados (Jest)
- [ ] CI/CD (GitHub Actions)
- [ ] Docker containerization
- [ ] Rate limiting
- [ ] Cache com Redis
- [ ] Logs estruturados (Winston)
- [ ] Health checks avançados
- [ ] Migrations automáticas

---

**Documentação completa e atualizada em:** `README.md`, `SETUP.md`, `API_TESTS.md`
