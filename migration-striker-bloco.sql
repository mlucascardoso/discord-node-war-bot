-- MIGRAÇÃO: Adicionar roles STRIKER e BLOCO + Atualizar waitlist para WAITLIST
-- Data: 2025-09-13

-- 1. Atualizar role waitlist para WAITLIST
UPDATE roles 
SET name = 'WAITLIST' 
WHERE name = 'waitlist';

-- 2. Adicionar novas roles STRIKER, BLOCO e DOSA
INSERT INTO roles (name, description, emoji, created_at) VALUES
('STRIKER', 'Especialista em combate corpo a corpo', '🥊', NOW()),
('BLOCO', 'Especialista em bloqueio e defesa', '🧱', NOW()),
('DOSA', 'Especialista em suporte e controle', '🚬', NOW());

-- 3. Adicionar colunas para slots das novas roles na tabela nodewar_configs
ALTER TABLE nodewar_configs 
ADD COLUMN IF NOT EXISTS striker_slots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bloco_slots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dosa_slots INTEGER DEFAULT 0;

-- 4. Atualizar configurações existentes para incluir slots das novas roles
UPDATE nodewar_configs 
SET striker_slots = 2, bloco_slots = 2, dosa_slots = 2 
WHERE id = 1;

-- 5. Atualizar sequência para evitar conflitos futuros
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

-- 4. Verificar as alterações
SELECT id, name, description, emoji FROM roles ORDER BY id;
