-- INSERIR DADOS - CLASSES
INSERT INTO classes (id, name, created_at) VALUES
(1, 'Warrior', '2025-09-09T12:24:07.065Z'),
(2, 'Ranger', '2025-09-09T12:24:07.065Z'),
(3, 'Sorceress', '2025-09-09T12:24:07.065Z'),
(4, 'Berserker', '2025-09-09T12:24:07.065Z'),
(5, 'Tamer', '2025-09-09T12:24:07.065Z'),
(6, 'Musa', '2025-09-09T12:24:07.065Z'),
(7, 'Maehwa', '2025-09-09T12:24:07.065Z'),
(8, 'Valkyrie', '2025-09-09T12:24:07.065Z'),
(9, 'Kunoichi', '2025-09-09T12:24:07.065Z'),
(10, 'Ninja', '2025-09-09T12:24:07.065Z'),
(11, 'Wizard', '2025-09-09T12:24:07.065Z'),
(12, 'Witch', '2025-09-09T12:24:07.065Z'),
(13, 'Dark Knight', '2025-09-09T12:24:07.065Z'),
(14, 'Striker', '2025-09-09T12:24:07.065Z'),
(15, 'Mystic', '2025-09-09T12:24:07.065Z'),
(16, 'Lahn', '2025-09-09T12:24:07.065Z'),
(17, 'Archer', '2025-09-09T12:24:07.065Z'),
(18, 'Shai', '2025-09-09T12:24:07.065Z'),
(19, 'Guardian', '2025-09-09T12:24:07.065Z'),
(20, 'Hashashin', '2025-09-09T12:24:07.065Z'),
(21, 'Nova', '2025-09-09T12:24:07.065Z'),
(22, 'Sage', '2025-09-09T12:24:07.065Z'),
(23, 'Corsair', '2025-09-09T12:24:07.065Z'),
(24, 'Drakania', '2025-09-09T12:24:07.065Z'),
(25, 'Woosa', '2025-09-09T12:24:07.065Z'),
(26, 'Maegu', '2025-09-09T12:24:07.065Z'),
(27, 'Scholar', '2025-09-09T12:24:07.065Z'),
(28, 'Wukong', '2025-09-09T23:25:13.982Z'),
(29, 'Dosa', '2025-09-09T23:26:08.935Z');

-- INSERIR DADOS - CLASS_PROFILES
INSERT INTO class_profiles (id, profile, created_at) VALUES
(1, 'Sucessão', '2025-09-09T21:59:37.450Z'),
(2, 'Despertar', '2025-09-09T21:59:37.450Z'),
(3, 'Ascensão', '2025-09-09T21:59:37.450Z');

-- INSERIR DADOS - GUILDS
INSERT INTO guilds (id, name, created_at) VALUES
(1, 'BANSHEE', '2025-09-09T22:50:23.484Z');

-- INSERIR DADOS - ROLES
INSERT INTO roles (id, name, description, emoji, created_at) VALUES
(1, 'CALLER', 'Líder da batalha', '🎙️', '2025-09-09T02:27:28.114Z'),
(2, 'FLAME', 'Especialista em torres de fogo', '🔥', '2025-09-09T02:27:28.114Z'),
(3, 'HWACHA', 'Operador de hwacha', '🏹', '2025-09-09T02:27:28.114Z'),
(4, 'ELEFANTE', 'Piloto de elefante', '🐘', '2025-09-09T02:27:28.114Z'),
(5, 'BANDEIRA', 'Portador da bandeira', '🚩', '2025-09-09T02:27:28.114Z'),
(6, 'BOMBER', 'Especialista em bombas', '💥', '2025-09-09T02:27:28.114Z'),
(7, 'SHAI', 'Suporte e cura', '🥁', '2025-09-09T02:27:28.114Z'),
(8, 'RANGED', 'Combate à distância', '🏹', '2025-09-09T02:27:28.114Z'),
(9, 'FRONTLINE', 'Combate corpo a corpo', '⚔️', '2025-09-09T02:27:28.114Z'),
(10, 'WAITLIST', 'Lista de espera', '⏳', '2025-09-12T01:04:52.441Z'),
(11, 'STRIKER', 'Especialista em combate corpo a corpo', '🥊', '2025-09-13T12:00:00.000Z'),
(12, 'BLOCO', 'Especialista em bloqueio e defesa', '🧱', '2025-09-13T12:00:00.000Z'),
(13, 'DOSA', 'Especialista em suporte e controle', '🚬', '2025-09-13T12:00:00.000Z');

-- INSERIR DADOS - MEMBERS
INSERT INTO members (id, family_name, class_id, class_profile_id, level, ap, awakened_ap, dp, gearscore, is_active, created_at, updated_at, guild_id) VALUES
(2, 'Lutteh', 21, 1, 62, 391, 391, 444, 835.00, true, '2025-09-09T23:01:30.180Z', '2025-09-12T18:10:22.091Z', 1);

-- INSERIR DADOS - NODEWAR_TYPES
INSERT INTO nodewar_types (id, name, informative_text, tier, created_at) VALUES (1, 'Tier 1', 'NODE WAR\n🏰 NODE TIER 1 — 25 VAGAS\n\n✅ CANAIS PARA CONFIRMAR SUA PARTICIPAÇÃO\n(Balenos 1 / Serendia 1)\n\n⏰ O servidor onde acontecerá a guerra será anunciado às 20:45\n\n➡️ Todos os membros devem estar presentes no Discord até esse horário.\n\n🔁 Atenção: A partir das 20:00 está liberado o roubo de vaga.', 1, '2025-09-10T03:13:10.711Z');

-- INSERIR DADOS - NODEWAR_CONFIGS
INSERT INTO nodewar_configs (id, nodewar_type_id, bomber_slots, frontline_slots, ranged_slots, shai_slots, pa_slots, flag_slots, defense_slots, caller_slots, elephant_slots, striker_slots, bloco_slots, dosa_slots, waitlist, total_slots, created_at) VALUES
(1, 1, 2, 6, 7, 2, 0, 1, 3, 3, 1, 2, 2, 2, 9999, 25, '2025-09-10T03:17:51.919Z');

-- Atualizar sequências para evitar conflitos futuros
SELECT setval('classes_id_seq', (SELECT MAX(id) FROM classes));
SELECT setval('class_profiles_id_seq', (SELECT MAX(id) FROM class_profiles));
SELECT setval('guilds_id_seq', (SELECT MAX(id) FROM guilds));
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('members_id_seq', (SELECT MAX(id) FROM members));
SELECT setval('nodewar_types_id_seq', (SELECT MAX(id) FROM nodewar_types));
SELECT setval('nodewar_configs_id_seq', (SELECT MAX(id) FROM nodewar_configs));
