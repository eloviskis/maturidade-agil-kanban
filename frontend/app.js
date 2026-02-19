// Configuração da API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Estado global da aplicação
const app = {
    currentUser: null,
    adminToken: null,
    teams: [],
    cycles: [],
    charts: {},
    currentEvaluationType: 'kanban', // 'kanban' ou 'jornada'
    currentViewType: 'kanban', // 'kanban' ou 'jornada'
    currentAdminTab: 'evaluations',
    
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
        this.currentEvaluationType = 'kanban'; // Resetar para kanban
        this.updateEvaluationTypeButtons();
        await this.renderQuestions();
    },

    // Alternar tipo de avaliação
    switchEvaluationType(type) {
        this.currentEvaluationType = type;
        this.updateEvaluationTypeButtons();
        this.renderQuestions();
        // Mostrar/ocultar info boxes
        const jornadaInfo = document.getElementById('jornadaInfoBox');
        const kanbanInfo = document.getElementById('kanbanInfoBox');
        if (jornadaInfo) {
            jornadaInfo.style.display = type === 'jornada' ? 'block' : 'none';
        }
        if (kanbanInfo) {
            kanbanInfo.style.display = type === 'kanban' ? 'block' : 'none';
        }
    },

    // Atualizar botões de tipo de avaliação
    updateEvaluationTypeButtons() {
        const buttons = document.querySelectorAll('#evaluationSection .btn-type');
        buttons.forEach(btn => {
            if (btn.dataset.type === this.currentEvaluationType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    // Alternar tipo de visualização
    switchViewType(type) {
        this.currentViewType = type;
        this.updateViewTypeButtons();
        this.loadConsolidatedReport();
    },

    // Atualizar botões de tipo de visualização
    updateViewTypeButtons() {
        const buttons = document.querySelectorAll('#consolidatedSection .btn-type');
        buttons.forEach(btn => {
            if (btn.dataset.type === this.currentViewType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    // Renderizar questões
    async renderQuestions() {
        const container = document.getElementById('questionsContainer');
        container.innerHTML = '';

        const questions = this.currentEvaluationType === 'kanban' 
            ? this.getQuestions() 
            : this.getJornadaAgilQuestions();
        
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
                
                const tooltipHtml = q.tooltip ? `<span class="tooltip-icon" data-tooltip="${q.tooltip.replace(/"/g, '&quot;')}">💡</span>` : '';
                
                questionDiv.innerHTML = `
                    <div class="question-text">
                        ${q.id}. ${q.text} ${tooltipHtml}
                    </div>
                    <div class="options">
                        ${this.createOptions(q.id, q.buttonTooltips)}
                    </div>
                `;
                
                categoryDiv.appendChild(questionDiv);
            });

            container.appendChild(categoryDiv);
        });

        // Adicionar event listeners
        this.addQuestionEventListeners();
        this.initTooltips();
    },

    // Inicializar tooltips com posicionamento fixo
    initTooltips() {
        let tooltipBox = document.getElementById('tooltipBox');
        if (!tooltipBox) {
            tooltipBox = document.createElement('div');
            tooltipBox.id = 'tooltipBox';
            tooltipBox.className = 'tooltip-box';
            document.body.appendChild(tooltipBox);
        }

        const positionTooltip = (rect) => {
            let top = rect.bottom + 8;
            let left = rect.left - 140;
            if (left < 10) left = 10;
            if (left + 320 > window.innerWidth) left = window.innerWidth - 330;
            if (top + 100 > window.innerHeight) {
                top = rect.top - tooltipBox.offsetHeight - 8;
            }
            tooltipBox.style.top = top + 'px';
            tooltipBox.style.left = left + 'px';
        };

        document.querySelectorAll('.tooltip-icon').forEach(icon => {
            icon.addEventListener('mouseenter', (e) => {
                const text = e.target.getAttribute('data-tooltip');
                tooltipBox.textContent = text;
                tooltipBox.classList.add('visible');
                positionTooltip(e.target.getBoundingClientRect());
            });

            icon.addEventListener('mouseleave', () => {
                tooltipBox.classList.remove('visible');
            });
        });

        document.querySelectorAll('label[data-btn-tooltip]').forEach(label => {
            label.addEventListener('mouseenter', (e) => {
                const text = e.target.getAttribute('data-btn-tooltip');
                tooltipBox.textContent = text;
                tooltipBox.classList.add('visible');
                positionTooltip(e.target.getBoundingClientRect());
            });

            label.addEventListener('mouseleave', () => {
                tooltipBox.classList.remove('visible');
            });
        });
    },

    // Criar opções de resposta
    createOptions(questionId, buttonTooltips = {}) {
        const options = [
            { value: 5, label: 'Concordo Totalmente' },
            { value: 4, label: 'Concordo' },
            { value: 3, label: 'Neutro' },
            { value: 2, label: 'Discordo' },
            { value: 1, label: 'Discordo Totalmente' }
        ];

        return options.map(opt => {
            const btnTip = buttonTooltips && buttonTooltips[opt.value]
                ? ` data-btn-tooltip="${buttonTooltips[opt.value].replace(/"/g, '&quot;')}"`
                : '';
            return `
            <div class="option">
                <input type="radio" id="q${questionId}-${opt.value}" name="q${questionId}" value="${opt.value}">
                <label for="q${questionId}-${opt.value}"${btnTip}>${opt.label}</label>
            </div>
        `;
        }).join('');
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
        const totalQuestions = this.currentEvaluationType === 'kanban' ? 24 : 34;

        for (let i = 1; i <= totalQuestions; i++) {
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
                    evaluation_type: this.currentEvaluationType,
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
        this.currentViewType = 'kanban'; // Resetar para kanban
        this.updateViewTypeButtons();
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
            const response = await fetch(`${API_BASE_URL}/reports/team/${teamId}/cycle/${cycleId}?type=${this.currentViewType}`);
            
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
        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminPanelSection').style.display = 'none';
    },

    // Mostrar erro
    showError(message) {
        alert(message);
    },

    // ==================== ÁREA ADMIN ====================

    // Mostrar login admin
    showAdminLogin() {
        this.hideAllSections();
        document.getElementById('adminLoginSection').style.display = 'block';
        document.getElementById('adminLoginError').style.display = 'none';
    },

    // Login admin
    async adminLogin() {
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        const errorMsg = document.getElementById('adminLoginError');

        errorMsg.style.display = 'none';

        if (!email || !password) {
            errorMsg.textContent = '⚠️ Preencha email e senha';
            errorMsg.style.display = 'block';
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Credenciais inválidas');
            }

            const data = await response.json();
            this.adminToken = data.token;
            this.currentUser = data.user;

            // Mostrar painel admin
            this.showAdminPanel();
        } catch (error) {
            console.error('Erro no login:', error);
            errorMsg.textContent = '❌ Email ou senha incorretos';
            errorMsg.style.display = 'block';
        }
    },

    // Logout admin
    adminLogout() {
        this.adminToken = null;
        this.currentUser = null;
        this.backToMenu();
    },

    // Mostrar painel admin
    async showAdminPanel() {
        this.hideAllSections();
        document.getElementById('adminPanelSection').style.display = 'block';
        
        // Popular selects
        this.populateAdminSelects();
        
        // Carregar tab ativa
        this.showAdminTab(this.currentAdminTab);
    },

    // Popular selects admin
    populateAdminSelects() {
        const teamSelect = document.getElementById('adminParticipationTeam');
        const cycleSelect = document.getElementById('adminParticipationCycle');
        
        if (teamSelect) {
            teamSelect.innerHTML = '<option value="">-- Selecione um time --</option>';
            this.teams.forEach(team => {
                const option = document.createElement('option');
                option.value = team.id;
                option.textContent = team.name;
                teamSelect.appendChild(option);
            });
        }
        
        if (cycleSelect) {
            cycleSelect.innerHTML = '<option value="">-- Selecione um ciclo --</option>';
            this.cycles.forEach(cycle => {
                const option = document.createElement('option');
                option.value = cycle.id;
                option.textContent = cycle.name;
                cycleSelect.appendChild(option);
            });
        }
    },

    // Mostrar tab admin
    async showAdminTab(tabName) {
        this.currentAdminTab = tabName;
        
        // Atualizar botões
        document.querySelectorAll('.admin-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        event?.target?.classList.add('active');
        
        // Esconder todas as tabs
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        
        // Mostrar tab selecionada
        const tabContent = document.getElementById(`adminTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
        if (tabContent) {
            tabContent.style.display = 'block';
        }
        
        // Carregar dados
        if (tabName === 'evaluations') {
            await this.loadAdminEvaluations();
        } else if (tabName === 'stats') {
            await this.loadAdminStats();
        }
    },

    // Carregar avaliações (admin)
    async loadAdminEvaluations() {
        const container = document.getElementById('adminEvaluationsList');
        container.innerHTML = '<div class="loading">Carregando avaliações...</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/admin/evaluations`, {
                headers: { 'Authorization': `Bearer ${this.adminToken}` }
            });

            if (!response.ok) throw new Error('Erro ao carregar');

            const evaluations = await response.json();

            if (evaluations.length === 0) {
                container.innerHTML = '<div class="info-box"><p>Nenhuma avaliação encontrada.</p></div>';
                return;
            }

            let html = `
                <div class="admin-evaluations-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Time</th>
                                <th>Ciclo</th>
                                <th>Avaliador</th>
                                <th>Tipo</th>
                                <th>Respostas</th>
                                <th>Data</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            evaluations.forEach(ev => {
                const date = new Date(ev.created_at).toLocaleString('pt-BR');
                html += `
                    <tr>
                        <td>${ev.id}</td>
                        <td>${ev.team_name}</td>
                        <td>${ev.cycle_name}</td>
                        <td>${ev.user_name}</td>
                        <td>${ev.evaluation_type === 'kanban' ? '📋 Kanban' : '🧭 Jornada'}</td>
                        <td>${ev.answers_count}</td>
                        <td>${date}</td>
                        <td>
                            <button class="btn-delete-small" onclick="app.adminDeleteEvaluation(${ev.id})">🗑️</button>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            container.innerHTML = html;
        } catch (error) {
            console.error('Erro:', error);
            container.innerHTML = '<div class="error-message" style="display: block;">❌ Erro ao carregar avaliações</div>';
        }
    },

    // Deletar avaliação específica
    async adminDeleteEvaluation(id) {
        if (!confirm('⚠️ Tem certeza que deseja deletar esta avaliação?\n\nEsta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/evaluations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.adminToken}` }
            });

            if (!response.ok) throw new Error('Erro ao deletar');

            alert('✅ Avaliação deletada com sucesso!');
            await this.loadAdminEvaluations();
        } catch (error) {
            console.error('Erro:', error);
            alert('❌ Erro ao deletar avaliação');
        }
    },

    // Zerar todas as avaliações
    async adminDeleteAllEvaluations() {
        const confirmation = prompt(
            '⚠️⚠️⚠️ ATENÇÃO! ⚠️⚠️⚠️\n\n' +
            'Você está prestes a DELETAR TODAS AS AVALIAÇÕES do banco de dados.\n\n' +
            'Esta ação é IRREVERSÍVEL e apagará:\n' +
            '- Todas as avaliações de todos os times\n' +
            '- Todas as respostas\n' +
            '- Todo o histórico\n\n' +
            'Digite "ZERAR TUDO" para confirmar:'
        );

        if (confirmation !== 'ZERAR TUDO') {
            alert('❌ Operação cancelada');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/admin/evaluations`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.adminToken}` }
            });

            if (!response.ok) throw new Error('Erro ao zerar');

            alert('✅ Todas as avaliações foram deletadas com sucesso!');
            await this.loadAdminEvaluations();
        } catch (error) {
            console.error('Erro:', error);
            alert('❌ Erro ao zerar avaliações');
        }
    },

    // Carregar participação
    async loadAdminParticipation() {
        const teamId = document.getElementById('adminParticipationTeam').value;
        const cycleId = document.getElementById('adminParticipationCycle').value;
        const type = document.getElementById('adminParticipationType').value;
        const container = document.getElementById('adminParticipationReport');

        if (!teamId || !cycleId) {
            container.innerHTML = '<div class="info-box"><p>Selecione time e ciclo</p></div>';
            return;
        }

        container.innerHTML = '<div class="loading">Carregando...</div>';

        try {
            const url = `${API_BASE_URL}/admin/participation/${teamId}/${cycleId}${type ? `?type=${type}` : ''}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${this.adminToken}` }
            });

            if (!response.ok) throw new Error('Erro ao carregar');

            const data = await response.json();

            let html = `
                <div class="dashboard-header">
                    <h3>👥 Relatório de Participação</h3>
                    <div style="font-size: 1.5em; margin-top: 10px;">${data.team.name}</div>
                    <div style="font-size: 1.2em; margin-top: 5px;">${data.cycle.name}</div>
                    <div style="font-size: 1em; margin-top: 10px;">
                        ${data.totalEvaluations} ${data.totalEvaluations === 1 ? 'pessoa avaliou' : 'pessoas avaliaram'}
                    </div>
                </div>
            `;

            if (data.evaluations.length === 0) {
                html += '<div class="info-box"><p>Nenhuma avaliação encontrada</p></div>';
            } else {
                html += `
                    <div class="admin-evaluations-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Avaliador</th>
                                    <th>Email</th>
                                    <th>Tipo</th>
                                    <th>Respostas</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                data.evaluations.forEach(ev => {
                    const date = new Date(ev.created_at).toLocaleString('pt-BR');
                    html += `
                        <tr>
                            <td>${ev.evaluator_name}</td>
                            <td>${ev.evaluator_email}</td>
                            <td>${ev.evaluation_type === 'kanban' ? '📋 Kanban' : '🧭 Jornada'}</td>
                            <td>${ev.answers_count}</td>
                            <td>${date}</td>
                        </tr>
                    `;
                });

                html += `
                            </tbody>
                        </table>
                    </div>
                `;
            }

            container.innerHTML = html;
        } catch (error) {
            console.error('Erro:', error);
            container.innerHTML = '<div class="error-message" style="display: block;">❌ Erro ao carregar participação</div>';
        }
    },

    // Carregar estatísticas
    async loadAdminStats() {
        const container = document.getElementById('adminStatsReport');
        container.innerHTML = '<div class="loading">Carregando estatísticas...</div>';

        try {
            const response = await fetch(`${API_BASE_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${this.adminToken}` }
            });

            if (!response.ok) throw new Error('Erro ao carregar');

            const stats = await response.json();

            const html = `
                <div class="dashboard-header">
                    <h3>📊 Estatísticas Gerais</h3>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${stats.total_evaluations || 0}</div>
                        <div class="stat-label">Total de Avaliações</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.teams_evaluated || 0}</div>
                        <div class="stat-label">Times Avaliados</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.unique_evaluators || 0}</div>
                        <div class="stat-label">Avaliadores Únicos</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.cycles_used || 0}</div>
                        <div class="stat-label">Ciclos Utilizados</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.kanban_count || 0}</div>
                        <div class="stat-label">Avaliações Kanban</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.jornada_count || 0}</div>
                        <div class="stat-label">Avaliações Jornada</div>
                    </div>
                </div>
            `;

            container.innerHTML = html;
        } catch (error) {
            console.error('Erro:', error);
            container.innerHTML = '<div class="error-message" style="display: block;">❌ Erro ao carregar estatísticas</div>';
        }
    },

    // ==================== FIM ÁREA ADMIN ====================

    // Questões do formulário
    getQuestions() {
        return [
            {
                icon: '📋',
                title: 'Práticas Kanban',
                questions: [
                    { 
                        id: 1, 
                        text: 'O time possui um quadro Kanban visível e atualizado com todas as etapas do fluxo de trabalho',
                        tooltip: 'Quadro visível é a base do Kanban. Se ninguém olha ou não reflete a realidade, vira decoração inútil.'
                    },
                    { 
                        id: 2, 
                        text: 'O time estabelece e respeita os limites de WIP (Work In Progress) para cada coluna do quadro',
                        tooltip: 'WIP limitado força foco e finalização. Sem limite, vira bagunça com tudo começado e nada terminado.'
                    },
                    { 
                        id: 3, 
                        text: 'O fluxo de trabalho no quadro Kanban reflete com precisão o processo real do time',
                        tooltip: 'Quadro que não reflete a realidade é mentira visual. Precisa ser o espelho do que realmente acontece.'
                    },
                    { 
                        id: 4, 
                        text: 'O time realiza reuniões de reposição (replenishment) regulares para priorizar o backlog',
                        tooltip: 'Replenishment evita time parado sem trabalho ou pegando coisa errada. É sobre ter sempre a coisa certa pra fazer.'
                    }
                ]
            },
            {
                icon: '🌊',
                title: 'Gestão de Fluxo',
                questions: [
                    { 
                        id: 5, 
                        text: 'O time monitora e analisa o tempo de ciclo (cycle time) das tarefas regularmente',
                        tooltip: 'Cycle time mostra quanto tempo leva pra entregar. Monitorar isso ajuda a prever e melhorar.'
                    },
                    { 
                        id: 6, 
                        text: 'O time identifica e remove impedimentos que bloqueiam o fluxo de trabalho rapidamente',
                        tooltip: 'Impedimento ignorado é dinheiro perdido. Quanto mais rápido resolve, mais rápido entrega valor.'
                    },
                    { 
                        id: 7, 
                        text: 'O time utiliza classes de serviço para diferenciar tipos de trabalho e suas prioridades',
                        tooltip: 'Nem tudo é urgente, mas algumas coisas são. Classes de serviço ajudam a tratar cada tipo do jeito certo.'
                    },
                    { 
                        id: 8, 
                        text: 'O time possui políticas explícitas para quando puxar novo trabalho',
                        tooltip: 'Política clara evita gente pegando trabalho na hora errada. Todo mundo sabe quando pode puxar mais coisa.'
                    }
                ]
            },
            {
                icon: '📊',
                title: 'Métricas e Melhoria Contínua',
                questions: [
                    { 
                        id: 9, 
                        text: 'O time coleta e analisa métricas de throughput (vazão) regularmente',
                        tooltip: 'Throughput é quantas coisas você entrega. Medir isso mostra se tá melhorando ou piorando.'
                    },
                    { 
                        id: 10, 
                        text: 'O time realiza retrospectivas regulares para identificar oportunidades de melhoria',
                        tooltip: 'Retro não é reclamação, é melhoria. Parar pra pensar no que pode ser melhor faz você evoluir de verdade.'
                    },
                    { 
                        id: 11, 
                        text: 'O time utiliza diagramas de fluxo cumulativo (CFD) para visualizar tendências',
                        tooltip: 'CFD é raio-x do fluxo. Mostra gargalos, acúmulos e problemas que você não vê só olhando o quadro.'
                    },
                    { 
                        id: 12, 
                        text: 'As melhorias identificadas são implementadas e seus resultados são medidos',
                        tooltip: 'Melhoria sem implementação é papo furado. E sem medir, você não sabe se funcionou ou foi perda de tempo.'
                    }
                ]
            },
            {
                icon: '👥',
                title: 'Colaboração e Comunicação',
                questions: [
                    { 
                        id: 13, 
                        text: 'O time realiza daily standups focados no fluxo de trabalho e não em status individual',
                        tooltip: 'Daily boa foca no trabalho, não nas pessoas. É sobre desbloquear e fazer fluir, não reportar pra chefe.'
                    },
                    { 
                        id: 14, 
                        text: 'Há transparência total sobre o trabalho em andamento para todos os membros do time',
                        tooltip: 'Transparência elimina surpresas e permite ajuda mútua. Esconder trabalho só gera problema depois.'
                    },
                    { 
                        id: 15, 
                        text: 'O time colabora ativamente para desbloquear itens parados ou com problemas',
                        tooltip: 'Item parado é desperdício. Time que se ajuda desbloqueia rápido e entrega mais.'
                    },
                    { 
                        id: 16, 
                        text: 'Existe um bom alinhamento entre o time e os stakeholders sobre prioridades',
                        tooltip: 'Trabalhar na coisa errada é o maior desperdício. Alinhamento garante que você tá fazendo o que importa.'
                    }
                ]
            },
            {
                icon: '⚙️',
                title: 'Qualidade e Práticas Técnicas',
                questions: [
                    { 
                        id: 17, 
                        text: 'O time possui definição clara de "pronto" (Definition of Done) para cada item',
                        tooltip: 'DoD evita "99% pronto". Todo mundo sabe exatamente o que precisa pra considerar algo realmente terminado.'
                    },
                    { 
                        id: 18, 
                        text: 'O time pratica integração contínua e testes automatizados',
                        tooltip: 'CI e testes automatizados pegam bugs cedo. Quanto antes descobrir, mais barato é consertar.'
                    },
                    { 
                        id: 19, 
                        text: 'Code reviews são realizados como parte do fluxo de trabalho',
                        tooltip: 'Code review espalha conhecimento e melhora qualidade. Não é inspeção, é aprendizado colaborativo.'
                    },
                    { 
                        id: 20, 
                        text: 'O time trata a dívida técnica de forma proativa e sistemática',
                        tooltip: 'Dívida técnica ignorada vira juros altos depois. Tratar com seriedade evita código podre que trava tudo.'
                    }
                ]
            },
            {
                icon: '🔄',
                title: 'Adaptação e Evolução',
                questions: [
                    { 
                        id: 21, 
                        text: 'O time revisa e ajusta os limites de WIP baseado em dados e experiência',
                        tooltip: 'WIP não é dogma, é experimento. Ajustar baseado em dados faz o fluxo melhorar constantemente.'
                    },
                    { 
                        id: 22, 
                        text: 'O processo Kanban é revisado e evoluído regularmente com base em feedback',
                        tooltip: 'Processo engessado envelhece mal. Evoluir com base em feedback mantém relevância e eficácia.'
                    },
                    { 
                        id: 23, 
                        text: 'O time experimenta com novas práticas e ferramentas para melhorar o fluxo',
                        tooltip: 'Experimentar é aprender. Times que testam coisas novas descobrem jeitos melhores de trabalhar.'
                    },
                    { 
                        id: 24, 
                        text: 'O time possui cultura de aprendizado contínuo e compartilhamento de conhecimento',
                        tooltip: 'Conhecimento guardado é conhecimento desperdiçado. Compartilhar faz o time todo evoluir junto.'
                    }
                ]
            }
        ];
    },

    // Questões da Jornada Ágil (34 questões)
    getJornadaAgilQuestions() {
        return [
            {
                icon: '🔹',
                title: 'Dinâmica da Equipe',
                questions: [
                    { 
                        id: 1, 
                        text: 'Mentalidade Ágil: A equipe compreende, acredita e pratica os valores e princípios ágeis no dia a dia, buscando aprendizado, adaptação e melhoria contínua',
                        tooltip: 'Isso mostra se a galera realmente abraçou o ágil ou se é só papo. Times com mentalidade ágil de verdade se adaptam mais rápido e entregam melhor.',
                        buttonTooltips: {
                            1: 'Ainda não fazendo ou sendo "Ágil".',
                            2: 'Aplicando mecanismo de uma metodologia que suporta o "Ágil" como Scrum, Kanban, SAFe, etc.',
                            3: '80% do time sabe explicar o trabalho e benefícios do "Ágil", de uma metodologia ágil e acredita em seus benefícios. O time faz e/ou sugere melhorias frequentemente.',
                            4: 'A equipe trabalha de forma ágil.',
                            5: 'Busca ativamente novas formas de trabalhar de maneira cada vez mais ágil.'
                        }
                    },
                    { 
                        id: 2, 
                        text: 'Moral da Equipe: Há bom nível de engajamento, satisfação, confiança e bem-estar das pessoas que compõem a equipe',
                        tooltip: 'Time feliz produz mais e melhor. Se a moral tá baixa, a produtividade despenca. É sobre cuidar das pessoas primeiro.',
                        buttonTooltips: {
                            1: 'Ocorrências regulares de comportamentos onde um culpa o outro, aponta dedos, negação, raiva, facada nas costas, agressividade, etc. Resistência ativa às mudanças. As pessoas querem sair ou não gostam do ambiente de trabalho da equipe.',
                            2: 'Ainda há elementos do estágio anterior, porém já se vê um progresso constante para mudanças de tais comportamentos. Problemas estão sendo endereçados e há um sentimento geral de melhoria na moral da equipe.',
                            3: 'Na maioria dos casos, as pessoas se dão bem e estão felizes no trabalho.',
                            4: 'As pessoas, em geral, trabalham felizes, são engajadas, produtivas e gostam de trabalhar juntas.',
                            5: 'A maioria das pessoas da equipe sentem que elas estão em um dos melhores times que já trabalharam. São felizes por virem trabalhar e aceitar novos desafios.'
                        }
                    },
                    { 
                        id: 3, 
                        text: 'Trabalho em Equipe: A equipe demonstra colaboração, confiança mútua, ajuda entre os membros e senso de responsabilidade coletiva pelos resultados',
                        tooltip: 'Aqui você vê se é um time de verdade ou só um bando de pessoas trabalhando junto. Colaboração genuína faz toda diferença.',
                        buttonTooltips: {
                            1: 'Não existe.',
                            2: 'O trabalho em equipe está melhorando.',
                            3: 'Ao menos 70% da opção "Ideal" acontece.',
                            4: 'Ao menos 80% da opção "Ideal" acontece.',
                            5: 'Cada indivíduo e entre os membros do time acreditam que todos têm as habilidades necessárias para desempenhar sua função, possuem integridade, desejam ver o time vencedor, ajudam e trabalham para que isso aconteça. Há cumplicidade entre toda a equipe.'
                        }
                    },
                    { 
                        id: 4, 
                        text: 'Estágios de Desenvolvimento (Tuckman): A equipe apresenta maturidade e estabilidade em termos de formação, conflitos, alinhamento e performance consistente',
                        tooltip: 'Times passam por fases: formação, conflito, normalização e performance. Quanto mais maduro, mais eficiente e menos drama.',
                        buttonTooltips: {
                            1: 'Formação: a equipe acabou de ser formada, com membros entrando ou saindo.',
                            2: 'Tempestade: a equipe está começando a entender como trabalhar junta e apresenta uma quantidade maior de conflitos.',
                            3: 'Normalidade: a equipe já trabalha bem em conjunto e está caminhando para uma alta performance.',
                            4: 'Está com boa performance de maneira consistente por ao menos 8 semanas.',
                            5: 'Está com boa performance de maneira consistente por ao menos 6 meses.'
                        }
                    },
                    { 
                        id: 5, 
                        text: 'Ritmo Sustentável: A equipe trabalha de forma equilibrada e sustentável ao longo do tempo, evitando sobrecarga contínua e desgaste',
                        tooltip: 'Maratona não é sprint. Ritmo sustentável evita burnout e mantém qualidade. Correria constante queima o time.',
                        buttonTooltips: {
                            1: 'As pessoas estão cansadas, irritadas, esgotadas e/ou trabalhando em horas extras de forma regular. Essa situação ainda é considerada normal.',
                            2: 'Há um reconhecimento de que o ritmo de trabalho não é sustentável, e passos para melhorar a situação já estão sendo dados.',
                            3: 'Há consenso de que a equipe está trabalhando próximo de um ritmo sustentável, apesar de ainda existirem alguns picos de trabalho pesado de forma inconsistente.',
                            4: 'A equipe tem suporte da empresa para trabalhar em um ritmo sustentável. Há consenso de que isso já acontece em ao menos 80% dos casos de maneira consistente.',
                            5: 'A empresa e a equipe atuam de forma ativa para garantir que o time continue trabalhando em um ritmo sustentável de maneira perene.'
                        }
                    },
                    { 
                        id: 6, 
                        text: 'Acordo de Trabalho: A equipe possui acordos claros, explícitos e compartilhados sobre como trabalhar, colaborar, tomar decisões e manter o ritmo saudável',
                        tooltip: 'Combinados claros fazem todo mundo saber o que esperar. Evita conflito e deixa o trabalho fluir melhor.',
                        buttonTooltips: {
                            1: 'Não existe.',
                            2: 'Algumas normas de atuação do time são reconhecidas, mas nunca foram escritas ou formalmente acordadas pela equipe.',
                            3: 'Há um acordo de trabalho documentado, acordado pela equipe e claramente visível em uma área pública. O acordo é mantido atualizado.',
                            4: 'O acordo é seguido pela equipe e inclui elementos sobre seus processos, trabalho em equipe e manutenção do ritmo de trabalho.',
                            5: 'O acordo é seguido de forma natural; exceções são identificadas rapidamente e devidamente endereçadas.'
                        }
                    }
                ]
            },
            {
                icon: '🏢',
                title: 'Ambiente da Equipe',
                questions: [
                    { 
                        id: 7, 
                        text: 'Tamanho da Equipe: O tamanho da equipe favorece comunicação eficaz, colaboração e entrega contínua de valor',
                        tooltip: 'Nem muito grande(muita gente, pouca comunicação) nem muito pequeno (falta skill). O ideal é entre 5-9 pessoas.'
                    },
                    { 
                        id: 8, 
                        text: 'Dedicação da Equipe: Os membros possuem foco e dedicação à equipe e ao fluxo de trabalho, evitando multitarefa excessiva entre times ou projetos',
                        tooltip: 'Multitarefa extrema mata produtividade. Pessoas dedicadas ao time entregam mais e com mais qualidade.'
                    },
                    { 
                        id: 9, 
                        text: 'Continuidade da Equipe: A composição da equipe é estável ao longo do tempo, favorecendo aprendizado coletivo e melhoria contínua',
                        tooltip: 'Time que fica junto aprende junto e evolui junto. Rotatividade alta prejudica evolução e conhecimento.'
                    },
                    { 
                        id: 10, 
                        text: 'Multifuncionalidade: A equipe possui, internamente, todas as habilidades necessárias para entregar valor de ponta a ponta, com compartilhamento de conhecimento',
                        tooltip: 'Time autônomo não depende de outros times pra entregar. Compartilhar conhecimento evita gargalos e "donos" de código.'
                    },
                    { 
                        id: 11, 
                        text: 'Local de Trabalho/Proximidade: A configuração física ou virtual favorece comunicação rápida, colaboração e resolução eficiente de problemas',
                        tooltip: 'Seja remoto ou presencial, o importante é facilitar conversa rápida. Comunicação travada = trabalho travado.'
                    }
                ]
            },
            {
                icon: '🎯',
                title: 'Organização e Cultura',
                questions: [
                    { 
                        id: 12, 
                        text: 'Auto-organização: A equipe possui autonomia para decidir como organizar o trabalho, assumir demandas, colaborar e entregar valor',
                        tooltip: 'Time que se auto-organiza é mais engajado e toma melhores decisões. Microgerenciamento mata criatividade e ownership.'
                    },
                    { 
                        id: 13, 
                        text: 'Gestão de Impedimentos: Impedimentos são identificados, comunicados, analisados e resolvidos de forma consistente e sistêmica',
                        tooltip: 'Impedimento não resolvido vira bloqueio. Aqui se vê se a empresa ajuda o time ou só cobra resultado.'
                    }
                ]
            },
            {
                icon: '⚙️',
                title: 'Mecânica dos Processos Ágeis',
                questions: [
                    { 
                        id: 14, 
                        text: 'Reunião Diária: A equipe utiliza reuniões diárias para inspecionar o fluxo de trabalho, alinhar prioridades, identificar bloqueios e tomar ações rápidas',
                        tooltip: 'Daily eficaz é rápida e focada no trabalho, não em status report. Serve pra desbloquear, não pra controlar.'
                    },
                    { 
                        id: 15, 
                        text: 'Retrospectiva e Kaizen: A equipe possui momentos estruturados para refletir sobre processos, relações e resultados, implementando melhorias contínuas',
                        tooltip: 'Retro não é pra reclamar e esquecer. É pra identificar problemas e resolver de verdade. Melhoria contínua na veia.'
                    },
                    { 
                        id: 16, 
                        text: 'Trabalho Orientado a Valor: O trabalho da equipe é orientado à entrega de valor para usuários ou stakeholders',
                        tooltip: 'Não adianta trabalhar muito se não gera valor. Foco no que importa pro usuário final, não em features bonitas.'
                    },
                    { 
                        id: 17, 
                        text: 'Previsibilidade e Compromisso: A equipe compreende sua capacidade real de entrega, utiliza dados históricos ou métricas de fluxo e assume compromissos realistas',
                        tooltip: 'Prometer com base em dados é melhor que "achismo". Previsibilidade gera confiança e evita frustração.'
                    },
                    { 
                        id: 18, 
                        text: 'Acompanhamento do Trabalho (WIP): A equipe acompanha o progresso do trabalho em andamento, tornando-o visível e utilizando essas informações para melhorar o fluxo',
                        tooltip: 'Visibilidade do trabalho ajuda a identificar gargalos e distribuir melhor as tarefas. Quadro não é decoração.'
                    },
                    { 
                        id: 19, 
                        text: 'Revisão e Feedback: A equipe revisa entregas concluídas com stakeholders de forma frequente, coletando feedback e ajustando expectativas',
                        tooltip: 'Feedback cedo evita trabalho jogado fora. Quanto antes mostrar, mais rápido corrige o rumo se precisar.'
                    }
                ]
            },
            {
                icon: '📦',
                title: 'Produto',
                questions: [
                    { 
                        id: 20, 
                        text: 'Previsibilidade de Entrega: A equipe mede e melhora continuamente o tempo entre o início e a conclusão do trabalho, aumentando confiabilidade das entregas',
                        tooltip: 'Saber quanto tempo leva pra entregar algo ajuda a planejar melhor e não prometer o impossível.'
                    },
                    { 
                        id: 21, 
                        text: 'Estratégia de Produto (Nível Estratégico): Há alinhamento entre visão estratégica de produto e o trabalho realizado pela equipe',
                        tooltip: 'Time trabalhando sem saber o porquê é como remar sem direção. Alinhamento estratégico dá propósito ao trabalho.'
                    },
                    { 
                        id: 22, 
                        text: 'Gestão de Produto (Nível da Equipe): Existe um papel claro responsável por priorizar demandas, maximizar valor, esclarecer requisitos e aceitar entregas',
                        tooltip: 'Alguém precisa decidir o que é mais importante. PO claro evita time perdido com coisa errada.'
                    },
                    { 
                        id: 23, 
                        text: 'Tempo de Ciclo: A equipe tem capacidade de reduzir o tempo total entre a concepção de uma demanda e sua disponibilização para uso real',
                        tooltip: 'Quanto mais rápido da ideia ao usuário usando, mais rápido você aprende e ajusta. Velocidade gera aprendizado.'
                    },
                    { 
                        id: 24, 
                        text: 'Visão do Produto: Existe uma visão clara, compartilhada e compreendida do produto, orientando decisões e prioridades',
                        tooltip: 'Visão clara é como bússola do time. Todo mundo sabe pra onde tá indo e por quê.'
                    }
                ]
            },
            {
                icon: '✅',
                title: 'Qualidade dos Itens de Trabalho',
                questions: [
                    { 
                        id: 25, 
                        text: 'Qualidade e Clareza: Os itens de trabalho são claros, bem definidos, pequenos o suficiente e compreensíveis antes de entrarem no fluxo',
                        tooltip: 'Tarefa confusa gera retrabalho. Item claro e pequeno é mais fácil de estimar, fazer e validar.'
                    },
                    { 
                        id: 26, 
                        text: 'Políticas de Entrada: A equipe possui critérios claros que determinam quando um item está pronto para iniciar o trabalho',
                        tooltip: 'Critérios de entrada evitam começar trabalho mal definido. Se não tá pronto pra começar, não começa.'
                    },
                    { 
                        id: 27, 
                        text: 'Políticas de Conclusão (Definition of Done): A equipe possui critérios claros e compartilhados que definem quando um trabalho é considerado concluído',
                        tooltip: 'Definition of Done evita "99% pronto". Todo mundo sabe quando algo tá realmente terminado.'
                    },
                    { 
                        id: 28, 
                        text: 'Tamanho dos Itens: Os itens de trabalho são fatiados de forma adequada para permitir entrega frequente e aprendizado rápido',
                        tooltip: 'Item grande demora e trava. Fatiar em pedaços menores permite entregar valor mais cedo e validar rápido.'
                    },
                    { 
                        id: 29, 
                        text: 'Replenishment e Preparação: A equipe possui práticas regulares para revisar, priorizar e preparar novos itens antes de entrarem no fluxo',
                        tooltip: 'Preparar trabalho com antecedência evita time parado esperando definição. Backlog grooming é importante!'
                    }
                ]
            },
            {
                icon: '🔧',
                title: 'Fluxo e Engenharia',
                questions: [
                    { 
                        id: 30, 
                        text: 'Gestão do Fluxo (WIP): A equipe limita trabalho em progresso, promove foco e melhora continuamente o fluxo de entrega',
                        tooltip: 'Fazer menos coisas ao mesmo tempo faz você terminar mais rápido. WIP limitado = foco = entrega.'
                    },
                    { 
                        id: 31, 
                        text: 'Tempo de Teste: Testes acontecem próximos ao desenvolvimento, reduzindo riscos e retrabalho',
                        tooltip: 'Quanto mais cedo testar, mais barato é corrigir. Bug descoberto tarde custa caro pra consertar.'
                    },
                    { 
                        id: 32, 
                        text: 'Revisão de Código e Qualidade Técnica: Revisões de código e testes são práticas consistentes e colaborativas dentro da equipe',
                        tooltip: 'Code review não é pegadinha, é aprendizado mútuo. Melhora código e espalha conhecimento no time.'
                    },
                    { 
                        id: 33, 
                        text: 'Testes Coordenados (Holístico): Há coordenação entre diferentes tipos de teste para garantir qualidade do produto',
                        tooltip: 'Teste unitário, integração, E2E... cada um tem seu papel. Coordenar eles garante qualidade de ponta a ponta.'
                    },
                    { 
                        id: 34, 
                        text: 'Excelência Técnica Sustentável: Práticas técnicas são parte da cultura da equipe, suportando evolução contínua do produto e do fluxo',
                        tooltip: 'Excelência técnica não é luxo, é necessidade. Código bom hoje facilita mudança amanhã. Invista nisso.'
                    }
                ]
            }
        ];
    }
};

// Inicializar app quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
