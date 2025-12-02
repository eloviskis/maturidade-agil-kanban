# Guia de Deploy no Vercel

## Pré-requisitos

### 1. Banco de Dados PostgreSQL em Nuvem

O Vercel não hospeda bancos de dados. Você precisa usar um serviço externo:

**Opções Recomendadas:**
- **Neon** (https://neon.tech) - GRATUITO, PostgreSQL serverless
- **Supabase** (https://supabase.com) - GRATUITO, PostgreSQL + recursos extras
- **Railway** (https://railway.app) - PostgreSQL simples
- **Amazon RDS** - Pago, mais robusto

### 2. Criar Conta no Vercel
1. Acesse https://vercel.com
2. Faça login com GitHub
3. Autorize o Vercel a acessar seus repositórios

## Configuração do Banco de Dados

### Opção 1: Neon (Recomendado - Gratuito)

1. Acesse https://neon.tech e crie conta
2. Crie novo projeto "maturidade-agil"
3. Copie a connection string (formato: `postgresql://user:pass@host/dbname?sslmode=require`)
4. Execute o schema no banco:

```bash
# Baixe o schema
curl -o schema.sql https://raw.githubusercontent.com/eloviskis/maturidade-agil-kanban/main/database/schema.sql

# Execute no Neon (use a connection string do painel)
psql "sua-connection-string-do-neon" -f schema.sql
```

### Opção 2: Supabase

1. Acesse https://supabase.com
2. Crie novo projeto
3. Vá em "Database" → "Connection string" → "URI"
4. Use o SQL Editor do Supabase para executar o `schema.sql`

## Deploy no Vercel

### Via Interface Web (Mais Fácil)

1. Acesse https://vercel.com/new
2. Selecione o repositório `maturidade-agil-kanban`
3. Configure as variáveis de ambiente:
   - `DATABASE_URL` = sua connection string do banco
   - `JWT_SECRET` = uma string aleatória forte (ex: `minha-chave-super-secreta-2025`)
   - `NODE_ENV` = `production`
4. Clique em "Deploy"

### Via CLI (Linha de Comando)

```powershell
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Seguir prompts e adicionar variáveis de ambiente quando solicitado
```

## Configurar Variáveis de Ambiente

No painel do Vercel:
1. Vá no projeto → Settings → Environment Variables
2. Adicione:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | Production, Preview, Development |
| `JWT_SECRET` | `sua-chave-secreta-forte-aqui` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

## Inicializar Banco de Dados

Após deploy, você precisa popular o banco:

### Opção A: Executar schema direto no banco

```bash
# Se usar Neon/Supabase, copie o conteúdo de database/schema.sql
# e execute no SQL Editor deles
```

### Opção B: Conectar localmente e executar

```powershell
# Instalar dependências
npm install

# Criar arquivo .env.production
@"
DATABASE_URL=postgresql://sua-connection-string
JWT_SECRET=sua-chave-secreta
"@ | Out-File -FilePath .env.production -Encoding utf8

# Executar script de inicialização
$env:NODE_ENV="production"
node database/init.js
```

## Verificar Deploy

1. Acesse a URL fornecida pelo Vercel (ex: `maturidade-agil-kanban.vercel.app`)
2. Teste o endpoint de saúde: `https://seu-app.vercel.app/api/health`
3. Faça login com usuário padrão:
   - Email: `admin@example.com`
   - Senha: `admin123`

## Troubleshooting

### Erro: "connect ECONNREFUSED"
- Verifique se `DATABASE_URL` está configurado corretamente
- Certifique-se que o banco aceita conexões externas
- Adicione `?sslmode=require` na connection string

### Erro: "Cannot find module"
- Verifique se todas as dependências estão em `dependencies` (não em `devDependencies`)
- Execute `vercel --prod` novamente

### Erro: "Function timeout"
- Aumente timeout no `vercel.json` (plano gratuito: 10s, pago: 60s)
- Otimize queries SQL lentas

### Frontend não carrega
- Verifique se `frontend/app.js` tem a URL correta da API
- Pode precisar ajustar `API_BASE_URL` para `/api` (relativo)

## Comandos Úteis

```powershell
# Ver logs do deploy
vercel logs

# Redeploy
vercel --prod

# Remover deploy
vercel remove maturidade-agil-kanban

# Listar deploys
vercel ls
```

## Próximos Passos

1. **Domínio Personalizado**: Vá em Settings → Domains no Vercel
2. **SSL Automático**: Já configurado pelo Vercel
3. **CI/CD**: Configurado automaticamente - cada push no GitHub dispara novo deploy
4. **Monitoramento**: Use Vercel Analytics ou integre com Sentry

## Custos

- **Vercel**: Gratuito até 100GB bandwidth/mês
- **Neon**: Gratuito até 3GB storage
- **Supabase**: Gratuito até 500MB

## Importante ⚠️

- **NÃO** commite `.env` com credenciais reais
- Use variáveis de ambiente do Vercel
- Sempre use HTTPS em produção
- Altere senha do admin após primeiro login
- Configure backup do banco de dados

## Suporte

- Documentação Vercel: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Supabase Docs: https://supabase.com/docs
