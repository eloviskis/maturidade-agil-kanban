-- Schema do banco de dados para sistema de avaliação de maturidade ágil

-- Tabela de times
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários/avaliadores
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'evaluator', -- evaluator, admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de ciclos de avaliação (trimestral)
CREATE TABLE IF NOT EXISTS evaluation_cycles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- Ex: "Q1 2024", "Q2 2024"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS evaluations (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cycle_id INTEGER NOT NULL REFERENCES evaluation_cycles(id) ON DELETE CASCADE,
    evaluation_type VARCHAR(20) DEFAULT 'kanban', -- 'kanban' (24 questões) ou 'jornada' (40 questões)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de respostas das questões
CREATE TABLE IF NOT EXISTS evaluation_answers (
    id SERIAL PRIMARY KEY,
    evaluation_id INTEGER NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL CHECK (question_number BETWEEN 1 AND 40),
    answer_value INTEGER NOT NULL CHECK (answer_value BETWEEN 1 AND 5),
    UNIQUE(evaluation_id, question_number)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_evaluations_team ON evaluations(team_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_cycle ON evaluations(cycle_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_user ON evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_answers_eval ON evaluation_answers(evaluation_id);

-- Inserir times padrão
INSERT INTO teams (name, description) VALUES
    ('Condado', 'Time Condado'),
    ('Gotham', 'Time Gotham'),
    ('Wakanda', 'Time Wakanda'),
    ('Mordor', 'Time Mordor'),
    ('Inovação', 'Time Inovação'),
    ('Sustentação', 'Time Sustentação'),
    ('Diretoria', 'Time Diretoria'),
    ('CTC', 'Time CTC'),
    ('Castelini', 'Time Castelini')
ON CONFLICT (name) DO NOTHING;

-- Inserir ciclos de 2026
INSERT INTO evaluation_cycles (name, start_date, end_date, description, is_active) VALUES
    ('Q1 2026', '2026-01-01', '2026-03-31', 'Primeiro trimestre de 2026', true),
    ('Q2 2026', '2026-04-01', '2026-06-30', 'Segundo trimestre de 2026', true),
    ('Q3 2026', '2026-07-01', '2026-09-30', 'Terceiro trimestre de 2026', true),
    ('Q4 2026', '2026-10-01', '2026-12-31', 'Quarto trimestre de 2026', true)
ON CONFLICT DO NOTHING;

-- Inserir usuário admin padrão (senha: Pwk8q12v@)
-- Hash bcrypt para 'Pwk8q12v@': $2a$10$u5QT3QahcjtK8SI6eBLPdO/sRPtn6W165PZexjQipuuhHuEzKKY6e
INSERT INTO users (name, email, password_hash, role) VALUES
    ('Administrador', 'admin@example.com', '$2a$10$u5QT3QahcjtK8SI6eBLPdO/sRPtn6W165PZexjQipuuhHuEzKKY6e', 'admin')
ON CONFLICT (email) DO NOTHING;
