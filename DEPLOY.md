# ☑️ Checklist de Deploy para Produção

## 🔒 Segurança

- [ ] **Alterar JWT_SECRET** no `.env` para um valor complexo
  ```env
  JWT_SECRET=gere_uma_chave_super_segura_com_64_caracteres_no_minimo
  ```
  Gerar: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

- [ ] **Senha forte para PostgreSQL** em produção

- [ ] **Atualizar CORS** no `backend/server.js` para domínio específico
  ```javascript
  app.use(cors({
    origin: 'https://seudominio.com',
    credentials: true
  }));
  ```

- [ ] **Remover usuário admin padrão** do `database/schema.sql`

- [ ] **Configurar HTTPS** (obrigatório em produção)

- [ ] **Rate limiting** para evitar abuso
  ```bash
  npm install express-rate-limit
  ```

- [ ] **Helmet.js** para headers de segurança
  ```bash
  npm install helmet
  ```

- [ ] **Validação de entrada** mais robusta (joi, express-validator)

---

## 🗄️ Banco de Dados

- [ ] **PostgreSQL** instalado e configurado

- [ ] **Backup automático** configurado
  ```bash
  # Crontab para backup diário
  0 2 * * * pg_dump -U postgres maturidade_agil > /backup/db_$(date +\%Y\%m\%d).sql
  ```

- [ ] **Retenção de backups** (manter últimos 30 dias)

- [ ] **Monitoramento** de espaço em disco

- [ ] **Connection pooling** configurado corretamente

- [ ] **Índices** verificados e otimizados

- [ ] **Vacuum/Analyze** agendado regularmente

---

## 🚀 Servidor

- [ ] **NODE_ENV=production** no `.env`

- [ ] **Process manager** (PM2, systemd)
  ```bash
  npm install -g pm2
  pm2 start backend/server.js --name maturidade-agil
  pm2 startup
  pm2 save
  ```

- [ ] **Reverse proxy** (Nginx, Apache)
  ```nginx
  server {
    listen 80;
    server_name seudominio.com;
    
    location / {
      proxy_pass http://localhost:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
  }
  ```

- [ ] **SSL/TLS** configurado (Let's Encrypt)
  ```bash
  certbot --nginx -d seudominio.com
  ```

- [ ] **Firewall** configurado
  ```bash
  # Permitir apenas portas necessárias
  ufw allow 22    # SSH
  ufw allow 80    # HTTP
  ufw allow 443   # HTTPS
  ufw enable
  ```

- [ ] **Monitoramento** de recursos (CPU, RAM, disco)

- [ ] **Logs** centralizados e rotativos
  ```bash
  npm install winston winston-daily-rotate-file
  ```

---

## 🔍 Monitoramento

- [ ] **Health check endpoint** funcionando
  ```
  GET /api/health
  ```

- [ ] **Uptime monitoring** (UptimeRobot, Pingdom)

- [ ] **Error tracking** (Sentry, Rollbar)
  ```bash
  npm install @sentry/node
  ```

- [ ] **Logs de aplicação** estruturados

- [ ] **Alertas** configurados (email, Slack, SMS)

- [ ] **Métricas** de performance (New Relic, Datadog)

---

## 🧪 Testes

- [ ] **Testes manuais** completos em ambiente de staging

- [ ] **Teste de carga** para validar capacidade
  ```bash
  npm install -g artillery
  artillery quick --count 100 --num 50 http://localhost:3000/api/health
  ```

- [ ] **Teste de integração** da API

- [ ] **Teste de recuperação** de desastres (restore backup)

---

## 📦 Deploy

- [ ] **Documentação** atualizada

- [ ] **Variáveis de ambiente** configuradas no servidor

- [ ] **Dependências** instaladas
  ```bash
  npm ci --production
  ```

- [ ] **Banco de dados** inicializado
  ```bash
  npm run init-db
  ```

- [ ] **Servidor** iniciado
  ```bash
  pm2 start backend/server.js
  ```

- [ ] **Smoke tests** executados

- [ ] **DNS** apontando para servidor

- [ ] **SSL** validado

---

## 📊 Pós-Deploy

- [ ] **Monitorar logs** nas primeiras horas

- [ ] **Verificar performance**

- [ ] **Testar todas as funcionalidades**
  - [ ] Criar avaliação
  - [ ] Ver resultado consolidado
  - [ ] Ver histórico
  - [ ] Dashboard geral

- [ ] **Comunicar** aos usuários

- [ ] **Coletar feedback** inicial

- [ ] **Documentar** problemas encontrados

---

## 🐳 Opção: Docker

Se preferir usar Docker:

### Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 3000

CMD ["node", "backend/server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: maturidade_agil
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: maturidade_agil
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  postgres_data:
```

**Checklist Docker:**
- [ ] `Dockerfile` criado
- [ ] `docker-compose.yml` criado
- [ ] `.dockerignore` criado
- [ ] Build testado: `docker-compose build`
- [ ] Containers iniciados: `docker-compose up -d`
- [ ] Logs verificados: `docker-compose logs -f`

---

## 🚀 Ambientes Recomendados

### Desenvolvimento (Local)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
JWT_SECRET=dev_secret_key
```

### Staging (Teste)
```env
NODE_ENV=staging
PORT=3000
DB_HOST=staging-db.internal
JWT_SECRET=staging_secret_key
```

### Produção
```env
NODE_ENV=production
PORT=3000
DB_HOST=prod-db.internal
JWT_SECRET=<chave-super-segura>
```

---

## 📈 Escalabilidade

### Opções Futuras

**Vertical Scaling:**
- [ ] Aumentar CPU/RAM do servidor
- [ ] Otimizar queries do banco
- [ ] Adicionar índices adicionais

**Horizontal Scaling:**
- [ ] Load balancer (Nginx, HAProxy)
- [ ] Múltiplas instâncias da aplicação
- [ ] Session store externo (Redis)
- [ ] Read replicas do PostgreSQL

**Cache:**
- [ ] Redis para cache de relatórios
- [ ] Cache de respostas HTTP (CDN)
- [ ] Cache de queries frequentes

---

## 🔧 Manutenção

### Tarefas Diárias
- [ ] Verificar logs de erro
- [ ] Monitorar uso de recursos
- [ ] Verificar backups

### Tarefas Semanais
- [ ] Revisar métricas de performance
- [ ] Analisar logs de acesso
- [ ] Verificar espaço em disco

### Tarefas Mensais
- [ ] Atualizar dependências
- [ ] Revisar segurança
- [ ] Testar restore de backup
- [ ] Limpar dados antigos (se aplicável)

### Tarefas Trimestrais
- [ ] Auditoria de segurança completa
- [ ] Revisão de arquitetura
- [ ] Planejamento de melhorias

---

## 📞 Contatos de Emergência

```
DBA: [nome] - [telefone] - [email]
DevOps: [nome] - [telefone] - [email]
Desenvolvedor: [nome] - [telefone] - [email]
```

---

## 🆘 Plano de Recuperação

### Servidor Fora do Ar
1. Verificar status: `systemctl status app` ou `pm2 status`
2. Ver logs: `pm2 logs` ou `journalctl -u app`
3. Reiniciar: `pm2 restart app`
4. Se persistir, verificar banco de dados

### Banco de Dados Corrompido
1. Parar aplicação
2. Restaurar último backup
3. Validar integridade
4. Reiniciar aplicação
5. Notificar usuários

### Performance Degradada
1. Verificar CPU/RAM
2. Analisar queries lentas
3. Verificar conexões abertas
4. Considerar escalar verticalmente
5. Adicionar cache se necessário

---

## ✅ Checklist Final

### Antes de Anunciar
- [ ] Todos os itens acima verificados
- [ ] Sistema testado end-to-end
- [ ] Backup validado e testado
- [ ] Monitoramento ativo
- [ ] Documentação para usuários pronta
- [ ] Suporte preparado para dúvidas
- [ ] Plano de rollback definido

### Após Anunciar
- [ ] Monitorar primeiras 24h intensivamente
- [ ] Coletar feedback dos usuários
- [ ] Resolver bugs críticos imediatamente
- [ ] Documentar lições aprendidas
- [ ] Celebrar o sucesso! 🎉

---

**Lembre-se: Segurança e backup são SEMPRE prioridade!**
