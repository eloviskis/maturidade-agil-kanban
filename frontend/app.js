// Configuração da API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Estado global da aplicação
const app = {
    currentUser: null,
    teams: [],
    cycles: [],
    charts: {},
    
    // Inicialização
    async init() {
        await this.loadTeams();
        await this.loadCycles();
    },

    // Carregar times
    async loadTeams() {
        try {
            const response = await fetch(`${API_BASE_URL}/teams`);
            this.teams = await response.json();
            this.populateTeamSelects();
        } catch (error) {
            console.error('Erro ao carregar times:', error);
            this.showError('Erro ao carregar times. Verifique se o servidor está rodando.');
        }
    },

    // Carregar ciclos
    async loadCycles() {
        try {
            const response = await fetch(`${API_BASE_URL}/cycles`);
            this.cycles = await response.json();
            this.populateCycleSelects();
        } catch (error) {
            console.error('Erro ao carregar ciclos:', error);
        }
    },

    // Popular selects de times
    populateTeamSelects() {
        const selects = ['teamSelect', 'viewTeamSelect', 'historyTeamSelect'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">-- Selecione um time --</option>';
                this.teams.forEach(team => {
                    const option = document.createElement('option');
                    option.value = team.id;
                    option.textContent = team.name;
                    select.appendChild(option);
                });
            }
        });
    },

    // Popular selects de ciclos
    populateCycleSelects() {
        const selects = ['cycleSelect', 'viewCycleSelect'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.innerHTML = '<option value="">-- Selecione um ciclo --</option>';
                this.cycles.forEach(cycle => {
                    const option = document.createElement('option');
                    option.value = cycle.id;
                    option.textContent = `${cycle.name} ${cycle.is_active ? '(Ativo)' : ''}`;
                    select.appendChild(option);
                });
            }
        });
    },

    // Mostrar formulário de avaliação
    async showEvaluationForm() {
        this.hideAllSections();
        document.getElementById('evaluationSection').style.display = 'block';
        await this.renderQuestions();
    },

    // Renderizar questões
    async renderQuestions() {
        const container = document.getElementById('questionsContainer');
        container.innerHTML = '';

        const questions = this.getQuestions();
        
        questions.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'category';
            categoryDiv.innerHTML = `
                <div class="category-title">${category.icon} ${category.title}</div>
            `;

            category.questions.forEach(q => {
                const questionDiv = document.createElement('div');
                questionDiv.className = 'question';
                questionDiv.setAttribute('data-question', q.id);
                
                questionDiv.innerHTML = `
                    <div class="question-text">${q.id}. ${q.text}</div>
                    <div class="options">
                        ${this.createOptions(q.id)}
                    </div>
                `;
                
                categoryDiv.appendChild(questionDiv);
            });

            container.appendChild(categoryDiv);
        });

        // Adicionar event listeners
        this.addQuestionEventListeners();
    },

    // Criar opções de resposta
    createOptions(questionId) {
        const options = [
            { value: 5, label: 'Concordo Totalmente' },
            { value: 4, label: 'Concordo' },
            { value: 3, label: 'Neutro' },
            { value: 2, label: 'Discordo' },
            { value: 1, label: 'Discordo Totalmente' }
        ];

        return options.map(opt => `
            <div class="option">
                <input type="radio" id="q${questionId}-${opt.value}" name="q${questionId}" value="${opt.value}">
                <label for="q${questionId}-${opt.value}">${opt.label}</label>
            </div>
        `).join('');
    },

    // Event listeners para questões
    addQuestionEventListeners() {
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const questionElement = this.closest('.question');
                if (questionElement.classList.contains('unanswered')) {
                    questionElement.classList.remove('unanswered');
                    const errorMsg = document.getElementById('errorMessage');
                    if (document.querySelectorAll('.question.unanswered').length === 0) {
                        errorMsg.style.display = 'none';
                    }
                }
            });
        });
    },

    // Submeter avaliação
    async submitEvaluation() {
        const teamId = document.getElementById('teamSelect').value;
        const evaluatorName = document.getElementById('evaluatorName').value.trim();
        const cycleId = document.getElementById('cycleSelect').value;
        const errorMsg = document.getElementById('errorMessage');

        // Limpar erros anteriores
        document.querySelectorAll('.question').forEach(q => q.classList.remove('unanswered'));
        errorMsg.style.display = 'none';

        // Validações
        if (!teamId) {
            errorMsg.textContent = '⚠️ Por favor, selecione o time.';
            errorMsg.style.display = 'block';
            document.getElementById('teamSelect').focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!evaluatorName) {
            errorMsg.textContent = '⚠️ Por favor, insira seu nome.';
            errorMsg.style.display = 'block';
            document.getElementById('evaluatorName').focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!cycleId) {
            errorMsg.textContent = '⚠️ Por favor, selecione o ciclo de avaliação.';
            errorMsg.style.display = 'block';
            document.getElementById('cycleSelect').focus();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Coletar respostas
        const answers = {};
        let unanswered = [];

        for (let i = 1; i <= 24; i++) {
            const radio = document.querySelector(`input[name="q${i}"]:checked`);
            if (!radio) {
                unanswered.push(i);
                const questionElement = document.querySelector(`[data-question="${i}"]`);
                if (questionElement) {
                    questionElement.classList.add('unanswered');
                }
            } else {
                answers[`q${i}`] = parseInt(radio.value);
            }
        }

        if (unanswered.length > 0) {
            errorMsg.textContent = `⚠️ Por favor, responda ${unanswered.length === 1 ? 'a questão' : 'as questões'} ${unanswered.join(', ')}.`;
            errorMsg.style.display = 'block';
            const firstUnanswered = document.querySelector('.question.unanswered');
            if (firstUnanswered) {
                firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Primeiro, criar ou buscar o usuário
        let userId;
        try {
            const userResponse = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: evaluatorName,
                    email: `${evaluatorName.toLowerCase().replace(/\s+/g, '.')}@temp.com`,
                    password: 'temp123'
                })
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                userId = userData.id;
            } else {
                // Usuário já existe, fazer login
                const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: `${evaluatorName.toLowerCase().replace(/\s+/g, '.')}@temp.com`,
                        password: 'temp123'
                    })
                });
                
                if (loginResponse.ok) {
                    const loginData = await loginResponse.json();
                    userId = loginData.user.id;
                } else {
                    throw new Error('Erro ao autenticar usuário');
                }
            }
        } catch (error) {
            console.error('Erro na autenticação:', error);
            // Usar ID temporário
            userId = 1;
        }

        // Salvar avaliação
        try {
            const response = await fetch(`${API_BASE_URL}/evaluations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    team_id: parseInt(teamId),
                    user_id: userId,
                    cycle_id: parseInt(cycleId),
                    answers
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(`✅ Avaliação salva com sucesso!\n\nAvaliador: ${evaluatorName}\nTime: ${this.teams.find(t => t.id == teamId)?.name}\nCiclo: ${this.cycles.find(c => c.id == cycleId)?.name}`);
                
                // Resetar formulário
                document.getElementById('evaluatorName').value = '';
                document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
                
                // Perguntar se quer ver resultado
                if (confirm('Deseja ver o resultado consolidado do time?')) {
                    document.getElementById('viewTeamSelect').value = teamId;
                    document.getElementById('viewCycleSelect').value = cycleId;
                    this.showConsolidatedView();
                    await this.loadConsolidatedReport();
                }
            } else {
                throw new Error('Erro ao salvar avaliação');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            errorMsg.textContent = '❌ Erro ao salvar avaliação. Verifique se o servidor está rodando.';
            errorMsg.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    // Mostrar visualização consolidada
    showConsolidatedView() {
        this.hideAllSections();
        document.getElementById('consolidatedSection').style.display = 'block';
    },

    // Atualizar ciclos para visualização
    async updateCyclesForView() {
        // Aqui poderia filtrar ciclos por time se necessário
        // Por enquanto, apenas carrega todos os ciclos
    },

    // Carregar relatório consolidado
    async loadConsolidatedReport() {
        const teamId = document.getElementById('viewTeamSelect').value;
        const cycleId = document.getElementById('viewCycleSelect').value;
        const reportContainer = document.getElementById('consolidatedReport');

        if (!teamId || !cycleId) {
            reportContainer.innerHTML = '<div class="info-box"><p>Selecione um time e um ciclo para ver o relatório.</p></div>';
            return;
        }

        reportContainer.innerHTML = '<div class="loading">Carregando relatório</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/reports/team/${teamId}/cycle/${cycleId}`);
            
            if (!response.ok) {
                throw new Error('Nenhuma avaliação encontrada');
            }

            const data = await response.json();
            this.renderConsolidatedReport(data);

        } catch (error) {
            console.error('Erro ao carregar relatório:', error);
            reportContainer.innerHTML = `
                <div class="error-message" style="display: block;">
                    ❌ Nenhuma avaliação encontrada para este time e ciclo.
                </div>
            `;
        }
    },

    // Renderizar relatório consolidado
    renderConsolidatedReport(data) {
        const team = this.teams.find(t => t.id == data.teamId);
        const cycle = this.cycles.find(c => c.id == data.cycleId);
        const container = document.getElementById('consolidatedReport');

        const html = `
            <div class="dashboard-header">
                <h2>📈 Dashboard Consolidado</h2>
                <div style="font-size: 1.5em; font-weight: 600; margin-top: 10px;">${team?.name}</div>
                <div style="font-size: 1.2em; margin-top: 5px; opacity: 0.9;">${cycle?.name}</div>
                <div style="font-size: 1em; margin-top: 10px;">${data.evaluationCount} ${data.evaluationCount === 1 ? 'pessoa avaliou' : 'pessoas avaliaram'}</div>
                <div class="export-buttons">
                    <button class="btn-export" onclick="window.print()">🖨️ Imprimir/PDF</button>
                </div>
            </div>

            <div class="maturity-level">
                <h3>Nível de Maturidade</h3>
                <div class="level">${data.maturityLevel}</div>
                <div class="description">${data.maturityDescription}</div>
            </div>

            <div class="metrics-grid">
                <div class="metric-card">
                    <h3>Pontuação Total</h3>
                    <div class="metric-value">${data.totalScore}</div>
                    <div class="metric-label">de 120 pontos</div>
                </div>
                <div class="metric-card">
                    <h3>Percentual Geral</h3>
                    <div class="metric-value">${data.overallPercentage}%</div>
                    <div class="metric-label">de aproveitamento</div>
                </div>
                <div class="metric-card">
                    <h3>Avaliadores</h3>
                    <div class="metric-value">${data.evaluationCount}</div>
                    <div class="metric-label">participaram</div>
                </div>
            </div>

            <div class="charts-section">
                <div class="chart-container">
                    <h3>📊 Pontuação por Categoria</h3>
                    <canvas id="categoryChart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>🎯 Radar de Maturidade</h3>
                    <canvas id="radarChart"></canvas>
                </div>
            </div>

            <div class="evaluators-list">
                <h3>👥 Avaliadores que Participaram</h3>
                <ul>
                    ${data.evaluators.map(name => `<li>${name}</li>`).join('')}
                </ul>
            </div>
        `;

        container.innerHTML = html;

        // Renderizar gráficos
        this.renderCharts(data.categoryScores);
    },

    // Renderizar gráficos
    renderCharts(categoryScores) {
        // Destruir gráficos anteriores
        if (this.charts.category) this.charts.category.destroy();
        if (this.charts.radar) this.charts.radar.destroy();

        const categories = Object.keys(categoryScores);
        const percentages = categories.map(cat => parseFloat(categoryScores[cat].percentage));

        // Gráfico de barras
        const ctxCategory = document.getElementById('categoryChart');
        if (ctxCategory) {
            this.charts.category = new Chart(ctxCategory, {
                type: 'bar',
                data: {
                    labels: categories,
                    datasets: [{
                        label: 'Pontuação (%)',
                        data: percentages,
                        backgroundColor: [
                            'rgba(102, 126, 234, 0.8)',
                            'rgba(118, 75, 162, 0.8)',
                            'rgba(240, 147, 251, 0.8)',
                            'rgba(245, 87, 108, 0.8)',
                            'rgba(17, 153, 142, 0.8)',
                            'rgba(56, 239, 125, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { callback: value => value + '%' }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }

        // Gráfico radar
        const ctxRadar = document.getElementById('radarChart');
        if (ctxRadar) {
            this.charts.radar = new Chart(ctxRadar, {
                type: 'radar',
                data: {
                    labels: categories,
                    datasets: [{
                        label: 'Nível Atual',
                        data: percentages,
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2
                    }, {
                        label: 'Meta (100%)',
                        data: [100, 100, 100, 100, 100, 100],
                        backgroundColor: 'rgba(56, 239, 125, 0.1)',
                        borderColor: 'rgba(56, 239, 125, 1)',
                        borderWidth: 1,
                        borderDash: [5, 5],
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { callback: value => value + '%' }
                        }
                    }
                }
            });
        }
    },

    // Mostrar visualização de histórico
    showHistoryView() {
        this.hideAllSections();
        document.getElementById('historySection').style.display = 'block';
    },

    // Carregar histórico
    async loadHistory() {
        const teamId = document.getElementById('historyTeamSelect').value;
        const reportContainer = document.getElementById('historyReport');

        if (!teamId) {
            reportContainer.innerHTML = '<div class="info-box"><p>Selecione um time para ver o histórico.</p></div>';
            return;
        }

        reportContainer.innerHTML = '<div class="loading">Carregando histórico</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/reports/team/${teamId}/history`);
            
            if (!response.ok) {
                throw new Error('Nenhum histórico encontrado');
            }

            const data = await response.json();
            this.renderHistory(data);

        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            reportContainer.innerHTML = `
                <div class="error-message" style="display: block;">
                    ❌ Nenhum histórico encontrado para este time.
                </div>
            `;
        }
    },

    // Renderizar histórico
    renderHistory(data) {
        const team = this.teams.find(t => t.id == data.teamId);
        const container = document.getElementById('historyReport');

        let html = `
            <div class="dashboard-header">
                <h2>📈 Evolução Histórica</h2>
                <div style="font-size: 1.5em; font-weight: 600; margin-top: 10px;">${team?.name}</div>
            </div>

            <div class="chart-container">
                <h3>📊 Evolução do Percentual Geral</h3>
                <canvas id="evolutionChart"></canvas>
            </div>

            <div class="history-timeline">
                <h3 style="margin-bottom: 20px; color: #333;">📅 Detalhes por Ciclo</h3>
        `;

        data.history.forEach(item => {
            html += `
                <div class="timeline-item">
                    <h4>${item.cycleName}</h4>
                    <div class="date">${new Date(item.startDate).toLocaleDateString('pt-BR')} - ${new Date(item.endDate).toLocaleDateString('pt-BR')}</div>
                    <div class="metrics-grid" style="margin-top: 20px;">
                        <div class="metric-card">
                            <h3>Pontuação</h3>
                            <div class="metric-value" style="font-size: 2em;">${item.totalScore}</div>
                            <div class="metric-label">de 120 pontos</div>
                        </div>
                        <div class="metric-card">
                            <h3>Percentual</h3>
                            <div class="metric-value" style="font-size: 2em;">${item.overallPercentage}%</div>
                            <div class="metric-label">aproveitamento</div>
                        </div>
                        <div class="metric-card">
                            <h3>Avaliações</h3>
                            <div class="metric-value" style="font-size: 2em;">${item.evaluationCount}</div>
                            <div class="metric-label">realizadas</div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Renderizar gráfico de evolução
        this.renderEvolutionChart(data.history);
    },

    // Renderizar gráfico de evolução
    renderEvolutionChart(history) {
        if (this.charts.evolution) this.charts.evolution.destroy();

        const ctx = document.getElementById('evolutionChart');
        if (!ctx) return;

        const labels = history.map(h => h.cycleName);
        const scores = history.map(h => parseFloat(h.overallPercentage));

        this.charts.evolution = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Percentual Geral (%)',
                    data: scores,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { callback: value => value + '%' }
                    }
                }
            }
        });
    },

    // Mostrar dashboard geral
    async showDashboard() {
        this.hideAllSections();
        document.getElementById('dashboardSection').style.display = 'block';
        await this.loadDashboard();
    },

    // Carregar dashboard
    async loadDashboard() {
        const container = document.getElementById('dashboardReport');
        container.innerHTML = '<div class="loading">Carregando dashboard</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/reports/dashboard/current`);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar dashboard');
            }

            const data = await response.json();
            this.renderDashboard(data);

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            container.innerHTML = `
                <div class="error-message" style="display: block;">
                    ❌ Erro ao carregar dashboard. Verifique se existe um ciclo ativo.
                </div>
            `;
        }
    },

    // Renderizar dashboard
    renderDashboard(data) {
        const container = document.getElementById('dashboardReport');

        let html = `
            <div class="dashboard-header">
                <h2>🎯 Dashboard Geral</h2>
                <div style="font-size: 1.3em; margin-top: 10px; opacity: 0.9;">${data.cycleName}</div>
            </div>

            <div class="teams-grid">
        `;

        data.teams.forEach(team => {
            const percentage = parseFloat(team.avgPercentage);
            let color = '#dc3545';
            if (percentage >= 75) color = '#28a745';
            else if (percentage >= 60) color = '#ffc107';
            else if (percentage >= 40) color = '#fd7e14';

            html += `
                <div class="team-card" onclick="app.viewTeamFromDashboard(${team.id}, ${data.cycleId})">
                    <h4>${team.name}</h4>
                    <div class="team-score" style="color: ${color};">${team.avgPercentage}%</div>
                    <div class="team-info">
                        ${team.evaluationCount} ${team.evaluationCount === 1 ? 'avaliação' : 'avaliações'}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    },

    // Ver time do dashboard
    async viewTeamFromDashboard(teamId, cycleId) {
        document.getElementById('viewTeamSelect').value = teamId;
        document.getElementById('viewCycleSelect').value = cycleId;
        this.showConsolidatedView();
        await this.loadConsolidatedReport();
    },

    // Voltar ao menu
    backToMenu() {
        this.hideAllSections();
        document.getElementById('mainMenu').style.display = 'block';
    },

    // Esconder todas as seções
    hideAllSections() {
        document.getElementById('mainMenu').style.display = 'none';
        document.getElementById('evaluationSection').style.display = 'none';
        document.getElementById('consolidatedSection').style.display = 'none';
        document.getElementById('historySection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'none';
    },

    // Mostrar erro
    showError(message) {
        alert(message);
    },

    // Questões do formulário
    getQuestions() {
        return [
            {
                icon: '📋',
                title: 'Práticas Kanban',
                questions: [
                    { id: 1, text: 'O time possui um quadro Kanban visível e atualizado com todas as etapas do fluxo de trabalho' },
                    { id: 2, text: 'O time estabelece e respeita os limites de WIP (Work In Progress) para cada coluna do quadro' },
                    { id: 3, text: 'O fluxo de trabalho no quadro Kanban reflete com precisão o processo real do time' },
                    { id: 4, text: 'O time realiza reuniões de reposição (replenishment) regulares para priorizar o backlog' }
                ]
            },
            {
                icon: '🌊',
                title: 'Gestão de Fluxo',
                questions: [
                    { id: 5, text: 'O time monitora e analisa o tempo de ciclo (cycle time) das tarefas regularmente' },
                    { id: 6, text: 'O time identifica e remove impedimentos que bloqueiam o fluxo de trabalho rapidamente' },
                    { id: 7, text: 'O time utiliza classes de serviço para diferenciar tipos de trabalho e suas prioridades' },
                    { id: 8, text: 'O time possui políticas explícitas para quando puxar novo trabalho' }
                ]
            },
            {
                icon: '📊',
                title: 'Métricas e Melhoria Contínua',
                questions: [
                    { id: 9, text: 'O time coleta e analisa métricas de throughput (vazão) regularmente' },
                    { id: 10, text: 'O time realiza retrospectivas regulares para identificar oportunidades de melhoria' },
                    { id: 11, text: 'O time utiliza diagramas de fluxo cumulativo (CFD) para visualizar tendências' },
                    { id: 12, text: 'As melhorias identificadas são implementadas e seus resultados são medidos' }
                ]
            },
            {
                icon: '👥',
                title: 'Colaboração e Comunicação',
                questions: [
                    { id: 13, text: 'O time realiza daily standups focados no fluxo de trabalho e não em status individual' },
                    { id: 14, text: 'Há transparência total sobre o trabalho em andamento para todos os membros do time' },
                    { id: 15, text: 'O time colabora ativamente para desbloquear itens parados ou com problemas' },
                    { id: 16, text: 'Existe um bom alinhamento entre o time e os stakeholders sobre prioridades' }
                ]
            },
            {
                icon: '⚙️',
                title: 'Qualidade e Práticas Técnicas',
                questions: [
                    { id: 17, text: 'O time possui definição clara de "pronto" (Definition of Done) para cada item' },
                    { id: 18, text: 'O time pratica integração contínua e testes automatizados' },
                    { id: 19, text: 'Code reviews são realizados como parte do fluxo de trabalho' },
                    { id: 20, text: 'O time trata a dívida técnica de forma proativa e sistemática' }
                ]
            },
            {
                icon: '🔄',
                title: 'Adaptação e Evolução',
                questions: [
                    { id: 21, text: 'O time revisa e ajusta os limites de WIP baseado em dados e experiência' },
                    { id: 22, text: 'O processo Kanban é revisado e evoluído regularmente com base em feedback' },
                    { id: 23, text: 'O time experimenta com novas práticas e ferramentas para melhorar o fluxo' },
                    { id: 24, text: 'O time possui cultura de aprendizado contínuo e compartilhamento de conhecimento' }
                ]
            }
        ];
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
