-- Script para criar novos ciclos de avaliação
-- Execute este arquivo no PostgreSQL para adicionar novos ciclos

-- Desativar todos os ciclos existentes
UPDATE evaluation_cycles SET is_active = false;

-- Criar novo ciclo (Q1 2025)
INSERT INTO evaluation_cycles (name, start_date, end_date, description, is_active)
VALUES ('Q1 2025', '2025-01-01', '2025-03-31', 'Primeiro trimestre de 2025', true)
ON CONFLICT DO NOTHING;

-- Criar Q2 2025
INSERT INTO evaluation_cycles (name, start_date, end_date, description, is_active)
VALUES ('Q2 2025', '2025-04-01', '2025-06-30', 'Segundo trimestre de 2025', false)
ON CONFLICT DO NOTHING;

-- Criar Q3 2025
INSERT INTO evaluation_cycles (name, start_date, end_date, description, is_active)
VALUES ('Q3 2025', '2025-07-01', '2025-09-30', 'Terceiro trimestre de 2025', false)
ON CONFLICT DO NOTHING;

-- Criar Q4 2025 (atual)
INSERT INTO evaluation_cycles (name, start_date, end_date, description, is_active)
VALUES ('Q4 2025', '2025-10-01', '2025-12-31', 'Quarto trimestre de 2025', false)
ON CONFLICT DO NOTHING;

-- Ver todos os ciclos
SELECT * FROM evaluation_cycles ORDER BY start_date;
