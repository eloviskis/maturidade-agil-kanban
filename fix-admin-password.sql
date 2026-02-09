-- Atualizar senha do admin para o hash correto
-- Senha: Pwk8q12v@
UPDATE users 
SET password_hash = '$2a$10$Ac9xIhn58jotFVwkzFEbJe3Ol5cdaHcj3txayaRCrCtLE0/2iCwGy'
WHERE email = 'admin@example.com';

-- Verificar
SELECT id, name, email, role FROM users WHERE email = 'admin@example.com';
