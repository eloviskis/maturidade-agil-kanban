# 🚀 Sistema de Avaliação de Maturidade Ágil - Kanban

Sistema completo para avaliação de maturidade ágil com metodologia Kanban, incluindo backend Node.js, banco de dados PostgreSQL e interface web moderna.

## ✨ Funcionalidades

### 🎯 Principais Recursos
- ✅ **Avaliações Multi-Avaliador**: Múltiplos membros do time podem responder
- 📊 **Dashboard Consolidado**: Visualização da média do time
- 📈 **Histórico Temporal**: Acompanhe a evolução ao longo dos trimestres
- 🔄 **Comparativos**: Compare diferentes ciclos de avaliação
- 👥 **Gestão de Times**: Múltiplos times podem ser avaliados
- 🔐 **Autenticação**: Sistema de login seguro
- 📑 **Relatórios**: Exportação de dados e gráficos

### 📊 Categorias Avaliadas
1. **Práticas Kanban** - Quadro, WIP, Fluxo
2. **Gestão de Fluxo** - Cycle Time, Impedimentos, Classes de Serviço
3. **Métricas e Melhoria** - Throughput, Retrospectivas, CFD
4. **Colaboração** - Standups, Transparência, Alinhamento
5. **Qualidade** - DoD, CI/CD, Code Review, Dívida Técnica
6. **Adaptação** - Revisão de Práticas, Experimentação, Aprendizado

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **pg** - Cliente PostgreSQL
- **bcryptjs** - Criptografia de senhas
- **jsonwebtoken** - Autenticação JWT
- **cors** - Compartilhamento de recursos
- **dotenv** - Variáveis de ambiente

### Frontend
- **HTML5** - Estrutura
- **CSS3** - Estilização moderna
- **JavaScript (Vanilla)** - Lógica e interação
- **Chart.js** - Gráficos interativos

## 📋 Pré-requisitos

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn** (vem com Node.js)

## 🚀 Instalação e Configuração

### 1️⃣ Clonar o Repositório
```bash
cd "c:\Users\elovi\OneDrive\Área de Trabalho\Projetos - DEV\Maturidade Agil"
```

### 2️⃣ Instalar Dependências
```powershell
npm install
```

### 3️⃣ Configurar Banco de Dados

#### Criar o Banco de Dados
```sql
-- Conecte-se ao PostgreSQL
psql -U postgres

-- Crie o banco de dados
CREATE DATABASE maturidade_agil;
```

#### Configurar Variáveis de Ambiente
```powershell
# Copie o arquivo de exemplo
Copy-Item .env.example .env

# Edite o arquivo .env com suas credenciais
notepad .env
```

**Exemplo de `.env`:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=maturidade_agil
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres

PORT=3000
NODE_ENV=development

JWT_SECRET=chave_secreta_super_segura_mude_em_producao
JWT_EXPIRES_IN=7d
```

### 4️⃣ Inicializar o Banco de Dados
```powershell
npm run init-db
```

Este comando irá:
- ✅ Criar todas as tabelas necessárias
- ✅ Inserir os times padrão
- ✅ Criar o primeiro ciclo de avaliação
- ✅ Criar usuário admin padrão

### 5️⃣ Iniciar o Servidor
```powershell
# Modo desenvolvimento (com auto-reload)
npm run dev

# Modo produção
npm start
```

O servidor estará disponível em: **http://localhost:3000**

## 🎮 Como Usar

### 📝 Fazer uma Avaliação

1. Acesse **http://localhost:3000**
2. Clique em **"Fazer Avaliação"**
3. Selecione o time
4. Digite seu nome
5. Responda as 24 questões
6. Clique em **"Salvar Minha Avaliação"**

### 📊 Ver Resultados

1. Clique em **"Ver Resultado Consolidado"**
2. Selecione o time desejado
3. Visualize:
   - Pontuação média consolidada
   - Gráficos por categoria
   - Lista de avaliadores
   - Recomendações de melhoria

## 🔌 API REST

### Endpoints Principais

#### 🔐 Autenticação
```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

#### 👥 Times
```http
GET    /api/teams          # Listar todos
GET    /api/teams/:id      # Buscar por ID
POST   /api/teams          # Criar novo
PUT    /api/teams/:id      # Atualizar
DELETE /api/teams/:id      # Deletar
```

#### 🔄 Ciclos de Avaliação
```http
GET    /api/cycles               # Listar todos
GET    /api/cycles/active        # Buscar ciclo ativo
POST   /api/cycles               # Criar novo
PATCH  /api/cycles/:id/toggle    # Ativar/desativar
```

#### 📝 Avaliações
```http
POST   /api/evaluations                    # Criar avaliação
GET    /api/evaluations/team/:teamId       # Listar por time
GET    /api/evaluations/:id                # Buscar detalhes
DELETE /api/evaluations/:id                # Deletar
```

#### 📊 Relatórios
```http
GET /api/reports/team/:teamId/cycle/:cycleId       # Consolidado
GET /api/reports/team/:teamId/history              # Histórico
GET /api/reports/compare/:teamId/:c1Id/:c2Id       # Comparar ciclos
GET /api/reports/dashboard/current                 # Dashboard geral
```

### Exemplo de Requisição

```javascript
// Criar avaliação
const response = await fetch('http://localhost:3000/api/evaluations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        team_id: 1,
        user_id: 1,
        cycle_id: 1,
        answers: {
            q1: 5, q2: 4, q3: 5, q4: 3,
            q5: 4, q6: 5, q7: 3, q8: 4,
            q9: 4, q10: 5, q11: 3, q12: 4,
            q13: 5, q14: 4, q15: 5, q16: 4,
            q17: 5, q18: 4, q19: 5, q20: 4,
            q21: 4, q22: 5, q23: 4, q24: 5
        }
    })
});
```

## 📁 Estrutura do Projeto

```
maturidade-agil-kanban/
├── backend/
│   ├── routes/
│   │   ├── auth.js           # Autenticação e usuários
│   │   ├── teams.js          # CRUD de times
│   │   ├── cycles.js         # Gestão de ciclos
│   │   ├── evaluations.js    # CRUD de avaliações
│   │   └── reports.js        # Relatórios e análises
│   ├── db.js                 # Conexão com PostgreSQL
│   └── server.js             # Servidor Express
├── frontend/
│   └── index.html            # Interface web (será criada)
├── database/
│   ├── schema.sql            # Schema do banco
│   └── init.js               # Script de inicialização
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

## 🎨 Melhorias Implementadas

### Comparado com a Versão Original

✅ **Persistência em Banco de Dados**
- Dados salvos permanentemente no PostgreSQL
- Não depende mais de localStorage

✅ **Histórico Temporal**
- Acompanhe a evolução do time ao longo dos trimestres
- Compare ciclos diferentes
- Visualize tendências

✅ **API REST Completa**
- Endpoints documentados
- Fácil integração com outros sistemas

✅ **Gestão de Ciclos**
- Organize avaliações por períodos (trimestres)
- Múltiplos ciclos de avaliação

✅ **Autenticação**
- Login seguro com JWT
- Controle de acesso

✅ **Relatórios Avançados**
- Comparativos entre ciclos
- Dashboard consolidado
- Evolução histórica

## 🔧 Scripts Disponíveis

```powershell
# Instalar dependências
npm install

# Inicializar banco de dados
npm run init-db

# Iniciar servidor (produção)
npm start

# Iniciar servidor (desenvolvimento com auto-reload)
npm run dev
```

## 🐛 Troubleshooting

### Erro de Conexão com PostgreSQL

**Erro:** `ECONNREFUSED` ou `connection refused`

**Solução:**
1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Teste a conexão: `psql -U postgres -d maturidade_agil`

### Erro ao Inicializar o Banco

**Erro:** `database "maturidade_agil" does not exist`

**Solução:**
```sql
-- Criar o banco manualmente
psql -U postgres
CREATE DATABASE maturidade_agil;
\q
```

### Porta 3000 em Uso

**Erro:** `EADDRINUSE`

**Solução:**
```powershell
# Altere a porta no .env
PORT=3001
```

## 📊 Níveis de Maturidade

| Percentual | Nível | Descrição |
|------------|-------|-----------|
| 90-100% | **Otimizado** | Alta maturidade com melhoria contínua |
| 75-89% | **Avançado** | Práticas consolidadas e foco em otimização |
| 60-74% | **Intermediário** | Práticas estabelecidas com oportunidades |
| 40-59% | **Iniciante** | Implementação inicial, precisa de apoio |
| 0-39% | **Ad-hoc** | Início da jornada, requer treinamento |

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👤 Autor

Desenvolvido para auxiliar times ágeis na avaliação e melhoria contínua de suas práticas Kanban.

## 🔮 Próximas Funcionalidades

- [ ] Export para Excel
- [ ] Gráficos de tendência mais avançados
- [ ] Notificações por email
- [ ] Integração com Jira/Azure DevOps
- [ ] Mobile app
- [ ] Dashboard executivo
- [ ] Comparação entre times
- [ ] Metas e OKRs

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

**Feito com ❤️ para times ágeis**
