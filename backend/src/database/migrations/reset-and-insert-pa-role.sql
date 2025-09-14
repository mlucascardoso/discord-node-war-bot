-- SCRIPT PARA RESETAR DADOS E CRIAR ROLE PA
-- Data: 2025-09-14

-- 1. INSERIR NOVA ROLE PA
INSERT INTO roles (id, name, description, emoji, created_at) VALUES
(15, 'PA', 'Especialista em magia de área e suporte mágico', '🧙‍♂️', CURRENT_TIMESTAMP);

-- 2. RESETAR SEQUÊNCIAS PARA COMEÇAR DO 1
-- Para members: começar do 1
SELECT setval('members_id_seq', 0, true);

-- Para member_roles: começar do 1
SELECT setval('member_roles_id_seq', 0, true);

-- Para roles: atualizar para o próximo após 15
SELECT setval('roles_id_seq', 15, true);
