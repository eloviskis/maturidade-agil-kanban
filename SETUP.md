# 🚀 Guia de Configuração Rápida

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Pré-requisitos Instalados?
- ✅ Node.js 16+ → [Download](https://nodejs.org/)
- ✅ PostgreSQL 12+ → [Download](https://www.postgresql.org/download/)

### 2️⃣ Configurar Banco de Dados

**Opção A: Usando pgAdmin (Interface Gráfica)**
1. Abra o pgAdmin
2. Clique com botão direito em "Databases"
3. Selecione "Create" → "Database"
4. Nome: `maturidade_agil`
5. Clique em "Save"

**Opção B: Usando Terminal**
```powershell
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco
CREATE DATABASE maturidade_agil;

# Sair
\q
```

### 3️⃣ Configurar Variáveis de Ambiente

Edite o arquivo `.env` e coloque sua senha do PostgreSQL:

```powershell
notepad .env
```

**Altere esta linha:**
```env
DB_PASSWORD=sua_senha_aqui
```

**Para sua senha real:**
```env
DB_PASSWORD=minha_senha_postgres
```

### 4️⃣ Instalar Dependências
```powershell
npm install
```

### 5️⃣ Inicializar Banco de Dados
```powershell
npm run init-db
```

**✅ Você deve ver:**
```
🔄 Conectando ao banco de dados...
📝 Executando script SQL...
✅ Banco de dados inicializado com sucesso!
```

### 6️⃣ Iniciar o Servidor
```powershell
npm run dev
```

**✅ Você deve ver:**
```
🚀 Servidor rodando em http://localhost:3000
📊 API disponível em http://localhost:3000/api
```

### 7️⃣ Acessar o Sistema
Abra seu navegador em: **http://localhost:3000**

---

## 🐛 Problemas Comuns

### ❌ Erro: "ECONNREFUSED" ou "connection refused"
**Causa:** PostgreSQL não está rodando

**Solução:**
```powershell
# Verificar se o PostgreSQL está rodando
Get-Service -Name postgresql*

# Se não estiver, iniciar o serviço
Start-Service postgresql-x64-15  # Ajuste a versão conforme instalada
```

---

### ❌ Erro: "password authentication failed"
**Causa:** Senha incorreta no arquivo `.env`

**Solução:**
1. Verifique a senha do PostgreSQL
2. Edite o arquivo `.env` com a senha correta
3. Tente novamente

---

### ❌ Erro: "database 'maturidade_agil' does not exist"
**Causa:** Banco de dados não foi criado

**Solução:**
```powershell
psql -U postgres
CREATE DATABASE maturidade_agil;
\q
npm run init-db
```

---

### ❌ Erro: "Port 3000 is already in use"
**Causa:** Porta 3000 já está em uso

**Solução:** Altere a porta no arquivo `.env`:
```env
PORT=3001
```

---

### ❌ Página não carrega times/ciclos
**Causa:** Servidor não está rodando ou banco não foi inicializado

**Solução:**
1. Verifique se o servidor está rodando (`npm run dev`)
2. Abra o console do navegador (F12) e veja se há erros
3. Verifique se o banco foi inicializado (`npm run init-db`)

---

## 📊 Testando o Sistema

### 1. Fazer uma Avaliação
1. Acesse http://localhost:3000
2. Clique em "📝 Fazer Avaliação"
3. Selecione um time (ex: Condado)
4. Digite seu nome
5. Selecione o ciclo ativo
6. Responda as 24 questões
7. Clique em "💾 Salvar Minha Avaliação"

### 2. Ver Resultado Consolidado
1. No menu principal, clique em "📊 Ver Resultado Consolidado"
2. Selecione o mesmo time
3. Selecione o mesmo ciclo
4. Clique em "📊 Carregar Relatório"
5. Veja a média consolidada com gráficos

### 3. Ver Evolução Histórica
1. Faça mais avaliações em ciclos diferentes
2. No menu principal, clique em "📈 Ver Evolução Histórica"
3. Selecione um time
4. Veja a evolução ao longo dos trimestres

---

## 🎯 Fluxo de Uso Recomendado

### Para Avaliações Trimestrais:

1. **Início do Trimestre:**
   - Crie um novo ciclo de avaliação via API ou direto no banco

2. **Durante o Trimestre:**
   - Cada membro do time faz sua avaliação individual
   - Sistema salva no banco de dados

3. **Fim do Trimestre:**
   - Veja o resultado consolidado do time
   - Exporte relatórios
   - Compare com trimestres anteriores

4. **Próximo Trimestre:**
   - Repita o processo
   - Acompanhe a evolução

---

## 🔧 Comandos Úteis

```powershell
# Instalar dependências
npm install

# Inicializar banco de dados
npm run init-db

# Iniciar servidor (desenvolvimento)
npm run dev

# Iniciar servidor (produção)
npm start

# Verificar status do PostgreSQL
Get-Service -Name postgresql*

# Acessar banco de dados
psql -U postgres -d maturidade_agil

# Ver tabelas do banco
psql -U postgres -d maturidade_agil -c "\dt"

# Limpar banco de dados (CUIDADO!)
psql -U postgres -c "DROP DATABASE maturidade_agil;"
psql -U postgres -c "CREATE DATABASE maturidade_agil;"
npm run init-db
```

---

## 📞 Precisa de Ajuda?

1. **Verifique o console do servidor** - Mostra erros detalhados
2. **Abra o console do navegador** (F12) - Veja erros do frontend
3. **Consulte o README.md** - Documentação completa
4. **Revise os logs** - Sempre há informações úteis

---

## ✅ Checklist de Funcionamento

- [ ] Node.js instalado
- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `maturidade_agil` criado
- [ ] Arquivo `.env` configurado com senha correta
- [ ] Dependências instaladas (`npm install`)
- [ ] Banco inicializado (`npm run init-db`)
- [ ] Servidor rodando (`npm run dev`)
- [ ] Página abre em http://localhost:3000
- [ ] Times aparecem no select
- [ ] Ciclos aparecem no select
- [ ] Consegue salvar uma avaliação
- [ ] Consegue ver resultado consolidado

---

**🎉 Tudo funcionando? Aproveite o sistema!**
