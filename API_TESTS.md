# 🧪 Testes da API

Este arquivo contém exemplos de requisições para testar a API manualmente.

## Usando PowerShell

### 1. Testar Saúde do Servidor
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
```

### 2. Listar Todos os Times
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/teams" -Method Get
```

### 3. Listar Todos os Ciclos
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cycles" -Method Get
```

### 4. Buscar Ciclo Ativo
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/cycles/active" -Method Get
```

### 5. Criar um Novo Time
```powershell
$body = @{
    name = "Time Teste"
    description = "Time criado para teste"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/teams" -Method Post -Body $body -ContentType "application/json"
```

### 6. Criar uma Avaliação
```powershell
$body = @{
    team_id = 1
    user_id = 1
    cycle_id = 1
    answers = @{
        q1 = 5; q2 = 4; q3 = 5; q4 = 4
        q5 = 5; q6 = 4; q7 = 3; q8 = 4
        q9 = 4; q10 = 5; q11 = 3; q12 = 4
        q13 = 5; q14 = 4; q15 = 5; q16 = 4
        q17 = 5; q18 = 3; q19 = 4; q20 = 4
        q21 = 4; q22 = 5; q23 = 4; q24 = 5
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/evaluations" -Method Post -Body $body -ContentType "application/json"
```

### 7. Buscar Relatório Consolidado
```powershell
# Substitua 1 pelo ID do time e 1 pelo ID do ciclo
Invoke-RestMethod -Uri "http://localhost:3000/api/reports/team/1/cycle/1" -Method Get
```

### 8. Buscar Histórico de um Time
```powershell
# Substitua 1 pelo ID do time
Invoke-RestMethod -Uri "http://localhost:3000/api/reports/team/1/history" -Method Get
```

### 9. Dashboard Geral
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/reports/dashboard/current" -Method Get
```

---

## Usando cURL (Windows)

### 1. Testar Saúde
```bash
curl http://localhost:3000/api/health
```

### 2. Listar Times
```bash
curl http://localhost:3000/api/teams
```

### 3. Criar Avaliação
```bash
curl -X POST http://localhost:3000/api/evaluations ^
  -H "Content-Type: application/json" ^
  -d "{\"team_id\":1,\"user_id\":1,\"cycle_id\":1,\"answers\":{\"q1\":5,\"q2\":4,\"q3\":5,\"q4\":4,\"q5\":5,\"q6\":4,\"q7\":3,\"q8\":4,\"q9\":4,\"q10\":5,\"q11\":3,\"q12\":4,\"q13\":5,\"q14\":4,\"q15\":5,\"q16\":4,\"q17\":5,\"q18\":3,\"q19\":4,\"q20\":4,\"q21\":4,\"q22\":5,\"q23\":4,\"q24\":5}}"
```

---

## Usando Postman ou Insomnia

### Importar Coleção

Crie uma nova coleção com estas requisições:

**1. GET - Health Check**
- URL: `http://localhost:3000/api/health`
- Method: GET

**2. GET - Listar Times**
- URL: `http://localhost:3000/api/teams`
- Method: GET

**3. GET - Listar Ciclos**
- URL: `http://localhost:3000/api/cycles`
- Method: GET

**4. POST - Criar Avaliação**
- URL: `http://localhost:3000/api/evaluations`
- Method: POST
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "team_id": 1,
  "user_id": 1,
  "cycle_id": 1,
  "answers": {
    "q1": 5, "q2": 4, "q3": 5, "q4": 4,
    "q5": 5, "q6": 4, "q7": 3, "q8": 4,
    "q9": 4, "q10": 5, "q11": 3, "q12": 4,
    "q13": 5, "q14": 4, "q15": 5, "q16": 4,
    "q17": 5, "q18": 3, "q19": 4, "q20": 4,
    "q21": 4, "q22": 5, "q23": 4, "q24": 5
  }
}
```

**5. GET - Relatório Consolidado**
- URL: `http://localhost:3000/api/reports/team/1/cycle/1`
- Method: GET

**6. GET - Histórico do Time**
- URL: `http://localhost:3000/api/reports/team/1/history`
- Method: GET

**7. GET - Dashboard Geral**
- URL: `http://localhost:3000/api/reports/dashboard/current`
- Method: GET

---

## 🎯 Sequência de Testes Recomendada

1. **Verificar servidor está rodando**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/health"
   ```

2. **Verificar times carregados**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/teams"
   ```

3. **Verificar ciclo ativo**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/cycles/active"
   ```

4. **Criar avaliação de teste**
   ```powershell
   # Use o exemplo acima
   ```

5. **Ver resultado consolidado**
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:3000/api/reports/team/1/cycle/1"
   ```

---

## ✅ Respostas Esperadas

### Health Check
```json
{
  "status": "ok",
  "message": "Servidor funcionando!"
}
```

### Listar Times
```json
[
  {
    "id": 1,
    "name": "Condado",
    "description": "Time Condado",
    "created_at": "2025-12-02T...",
    "updated_at": "2025-12-02T..."
  },
  ...
]
```

### Criar Avaliação (Sucesso)
```json
{
  "message": "Avaliação salva com sucesso!",
  "evaluationId": 1
}
```

### Relatório Consolidado
```json
{
  "teamId": "1",
  "cycleId": "1",
  "evaluationCount": 1,
  "evaluators": ["João Silva"],
  "avgAnswers": { "q1": "5.00", "q2": "4.00", ... },
  "categoryScores": {
    "Práticas Kanban": { "score": "18.00", "percentage": "90.0" },
    ...
  },
  "totalScore": "105.00",
  "overallPercentage": "87.5",
  "maturityLevel": "Avançado",
  "maturityDescription": "Time maduro com boas práticas..."
}
```

---

## 🐛 Troubleshooting

### Erro 500 - Internal Server Error
- Verifique se o PostgreSQL está rodando
- Verifique se o banco foi inicializado
- Veja os logs do servidor no terminal

### Erro 404 - Not Found
- Verifique se a URL está correta
- Verifique se o servidor está rodando na porta 3000

### Erro de CORS
- Normal se estiver testando de outro domínio
- O CORS já está configurado no servidor

### Nenhum dado retornado
- Verifique se o banco foi inicializado
- Execute `npm run init-db` novamente
