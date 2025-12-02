# 💼 Casos de Uso Práticos

## Cenário Real: Empresa com 9 Times Ágeis

### Contexto
Empresa de tecnologia com 9 times usando Kanban, que deseja:
- Avaliar maturidade ágil trimestralmente
- Comparar evolução de cada time
- Identificar áreas de melhoria
- Compartilhar boas práticas

---

## 📅 Cronograma Trimestral

### **Semana 1 do Trimestre**
Iniciar novo ciclo de avaliação

```sql
-- No banco de dados ou via API
UPDATE evaluation_cycles SET is_active = false;
INSERT INTO evaluation_cycles (name, start_date, end_date, is_active)
VALUES ('Q1 2026', '2026-01-01', '2026-03-31', true);
```

### **Semanas 2-11 do Trimestre**
Times trabalham normalmente, focando em melhorias

### **Semana 12 do Trimestre**
**Período de Avaliação**

1. **Segunda-feira**: Comunicado aos times
2. **Terça a Quinta**: Cada membro responde individualmente
3. **Sexta-feira**: Revisão dos resultados consolidados

---

## 👥 Exemplo: Time Condado

### **1. Cada Membro Faz sua Avaliação**

**João (Tech Lead)**
```
Acessa: http://localhost:3000
Clica: "Fazer Avaliação"
Seleciona: Time Condado
Nome: João Silva
Ciclo: Q4 2025
Responde 24 questões
Salva
```

**Maria (Desenvolvedora)**
```
Mesmos passos, mas com suas percepções
```

**Pedro (QA)**
```
Mesmos passos, mas com suas percepções
```

### **2. Resultado Consolidado**

Sistema calcula automaticamente a **média** das 3 avaliações:

**Exemplo de Resultado:**
```
Time: Condado
Ciclo: Q4 2025
Avaliadores: 3

Pontuação Total: 95.5 / 120 (79.6%)
Nível: Avançado

Por Categoria:
├── Práticas Kanban: 85%
├── Gestão de Fluxo: 82%
├── Métricas e Melhoria: 75%
├── Colaboração: 88%
├── Qualidade: 70%
└── Adaptação: 78%

Categoria Forte: Colaboração
Área de Melhoria: Qualidade
```

### **3. Análise e Ações**

**Reunião do Time (30 min)**
- Revisar resultado consolidado
- Discutir área de melhoria (Qualidade)
- Definir ações para próximo trimestre
- Comemorar pontos fortes

**Ações Definidas:**
```
✅ Aumentar cobertura de testes automatizados
✅ Implementar code review obrigatório
✅ Criar Definition of Done mais robusta
```

---

## 📊 Comparação Entre Times

### Dashboard Geral (Ciclo Atual)

```
┌─────────────┬───────────┬──────────────┐
│    Time     │ Score (%) │  Avaliações  │
├─────────────┼───────────┼──────────────┤
│ Wakanda     │   92.5%   │      8       │
│ Condado     │   79.6%   │      3       │
│ Gotham      │   76.3%   │      5       │
│ CTC         │   68.4%   │      4       │
│ Mordor      │   65.1%   │      6       │
│ Inovação    │   58.9%   │      2       │
└─────────────┴───────────┴──────────────┘
```

**Insights:**
- Wakanda está excelente! O que fazem de diferente?
- Inovação precisa de apoio urgente
- Mordor tem muitas avaliações mas score baixo

---

## 📈 Evolução Histórica - Time Condado

### Comparando 4 Trimestres

```
Q1 2025: 62.3% (Iniciante → Intermediário)
Q2 2025: 71.8% (Intermediário)
Q3 2025: 76.5% (Avançado)
Q4 2025: 79.6% (Avançado)

Evolução: +17.3% em 1 ano 🎉
```

**Gráfico de Tendência:**
```
100%│
    │                    ╱─────
 80%│            ╱──────
    │        ╱───
 60%│    ╱───
    │╱───
 40%│
    └────────────────────────────
     Q1    Q2    Q3    Q4
```

**Análise:**
- Crescimento consistente ✅
- Meta Q1 2026: atingir 85% (Otimizado)
- Manter foco em Qualidade

---

## 🎯 Casos de Uso Específicos

### **Caso 1: Novo Time Formado**

**Situação:** Time Castelini acabou de ser criado

**Ação:**
1. Fazer primeira avaliação como baseline
2. Resultado esperado: 40-60% (Iniciante)
3. Definir plano de desenvolvimento
4. Reavaliar em 3 meses

**Objetivo:** Evoluir 15-20% no primeiro ano

---

### **Caso 2: Time em Dificuldade**

**Situação:** Time Mordor está há 2 trimestres abaixo de 60%

**Ação:**
1. Ver resultado consolidado detalhado
2. Identificar categorias críticas
3. Realizar retrospectiva focada
4. Buscar apoio de coach ágil
5. Criar plano de melhoria de 90 dias
6. Reavaliar mensalmente

**Categorias que podem estar baixas:**
- Métricas e Melhoria
- Gestão de Fluxo
- Qualidade

---

### **Caso 3: Compartilhar Boas Práticas**

**Situação:** Time Wakanda tem 92% consistentemente

**Ação:**
1. Analisar suas práticas específicas
2. Organizar sessão de compartilhamento
3. Documentar processos
4. Mentoria para outros times
5. Reconhecimento público

**O que Wakanda faz bem:**
- Daily focado em fluxo
- Métricas visíveis para todos
- Retrospectivas efetivas
- WIP limits respeitados

---

## 🔄 Fluxo Completo - Do Início ao Fim

### **Mês 1 (Janeiro - Q1 2026)**

**Semana 1:**
```
Segunda: Admin cria ciclo Q1 2026
Terça: Comunicado aos times
Quarta-Sexta: Avaliações individuais
```

**Dados Coletados:**
- 9 times x média 5 avaliadores = 45 avaliações
- Todas salvas no banco PostgreSQL
- Disponíveis para análise imediata

### **Mês 2-3 (Fevereiro-Março)**

Times trabalham focando em melhorias identificadas

**Reuniões Mensais:**
- Acompanhar progresso das ações
- Ajustar estratégias se necessário

### **Mês 4 (Abril - Q2 2026)**

**Novo ciclo de avaliação:**
- Repetir processo
- Comparar com Q1 2026
- Ver evolução de cada time

---

## 📊 Relatórios para Diretoria

### **Relatório Executivo Trimestral**

```markdown
# Maturidade Ágil - Q4 2025

## Resumo Executivo
- 9 times avaliados
- 42 profissionais participaram
- Score médio geral: 73.2% (↑ 5.1% vs Q3)

## Destaques
✅ 3 times alcançaram nível "Avançado"
✅ Evolução positiva em 8 de 9 times
⚠️ 1 time requer atenção (Inovação)

## Categorias
Mais fortes:
1. Colaboração: 82%
2. Práticas Kanban: 78%

Precisam atenção:
1. Qualidade: 68%
2. Métricas: 71%

## Ações Recomendadas
1. Investir em treinamento de qualidade
2. Implementar ferramentas de métricas
3. Criar programa de mentoria
```

### **Dashboard Visual para Stakeholders**

Usar a funcionalidade "Dashboard Geral" do sistema:
```
http://localhost:3000
Clicar: "Dashboard Geral"
Imprimir: "Salvar como PDF"
```

Distribuir para:
- C-Level
- Gerentes de Produto
- Tech Leads
- RH

---

## 💡 Dicas de Uso

### **Para Avaliadores**

✅ **FAÇA:**
- Seja honesto nas respostas
- Base-se em fatos, não percepções
- Considere últimos 3 meses
- Complete em ambiente tranquilo

❌ **NÃO FAÇA:**
- Responder apressadamente
- Copiar respostas de outros
- Deixar perguntas em branco
- Avaliar com viés pessoal

### **Para Tech Leads**

✅ **FAÇA:**
- Comunique a importância
- Garanta que todos participem
- Reserve tempo na agenda
- Revise resultados com time
- Defina ações concretas

❌ **NÃO FAÇA:**
- Obrigar respostas específicas
- Julgar respostas individuais
- Ignorar resultados baixos
- Deixar sem acompanhamento

### **Para Gestores**

✅ **FAÇA:**
- Use dados para decisões
- Compare evolução, não apenas score absoluto
- Reconheça melhorias
- Invista em times com dificuldade
- Celebre sucessos

❌ **NÃO FAÇA:**
- Usar como ferramenta punitiva
- Comparar times injustamente
- Ignorar contexto específico
- Pressionar por números altos

---

## 🎓 Casos de Estudo

### **Case 1: Time que Evoluiu**

**Time:** Gotham  
**Período:** Jan-Dez 2025  
**Evolução:** 58% → 86% (+28%)

**O que fizeram:**
1. Implementaram quadro Kanban físico visível
2. Estabeleceram WIP limits rigorosos
3. Iniciaram daily focado em fluxo
4. Implementaram CI/CD
5. Criaram cultura de code review

**Resultado:**
- Cycle time reduzido 40%
- Qualidade aumentou significativamente
- Time mais engajado

### **Case 2: Time que Estagnou**

**Time:** Sustentação  
**Período:** Jan-Dez 2025  
**Evolução:** 65% → 67% (+2%)

**Problemas identificados:**
1. Falta de dedicação às melhorias
2. Muitas interrupções (suporte)
3. Sem tempo para retrospectivas
4. Métricas não acompanhadas

**Ações tomadas:**
1. Separar time de suporte vs desenvolvimento
2. Proteger tempo para melhorias
3. Implementar retrospectivas obrigatórias
4. Automatizar coleta de métricas

**Resultado esperado Q1 2026:** 75%

---

## 📞 Suporte e Dúvidas

### Problemas Técnicos
- Verificar SETUP.md
- Consultar API_TESTS.md
- Ver logs do servidor

### Dúvidas Metodológicas
- O que significa cada questão?
- Como interpretar resultados?
- Como definir ações de melhoria?

### Sugestões de Melhoria
- Novas funcionalidades
- Ajustes nas questões
- Relatórios adicionais

---

**Sistema desenvolvido para impulsionar a maturidade ágil de forma contínua e mensurável** 🚀
