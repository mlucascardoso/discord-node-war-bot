-- SCRIPT DE INSERT DAS ROLES DOS MEMBROS ATIVOS DA BANSHEE
-- Baseado nos dados de nome_classe.md
-- Data: 2025-09-14

-- INSERIR MEMBER_ROLES (relacionamento entre membros e suas funções)
-- Usando IDs específicos dos membros

-- BLOCO (🧱 BLOCO) - role_id: 13
INSERT INTO member_roles (id, member_id, role_id) VALUES
-- Akiria - BLOCO
(1, 1, 13),
-- Blindolsky - BLOCO
(2, 5, 13),
-- Challengers - BLOCO
(3, 7, 13),
-- Geark - BLOCO
(4, 13, 13),
-- Machadovsk - BLOCO
(5, 22, 13),
-- Morgoths - BLOCO
(6, 23, 13),
-- Unstoppabl3 - BLOCO
(7, 39, 13);

-- SHAI (🥁SHAI) - role_id: 7
INSERT INTO member_roles (id, member_id, role_id) VALUES
-- Aoda11 - SHAI
(8, 2, 7),
-- Ferretto - SHAI
(9, 12, 7),
-- Kalict - SHAI
(10, 16, 7),
-- MuscleCar - SHAI
(11, 24, 7),
-- SilverLothus - SHAI
(12, 34, 7);

-- PA (🧙‍♂️PA) - role_id: 15
INSERT INTO member_roles (id, member_id, role_id) VALUES
-- Aseo - PA
(13, 3, 15),
-- Urekmazino - PA
(14, 40, 15);

-- STRIKE (🥊STRIKE) - role_id: 12
INSERT INTO member_roles (id, member_id, role_id) VALUES
-- Bartor - STRIKE
(15, 4, 12),
-- Duduzinn - STRIKE
(16, 9, 12),
-- Fafnir - STRIKE
(17, 11, 12),
-- HrafnaFloki - STRIKE
(18, 14, 12),
-- Pletz - STRIKE
(19, 27, 12),
-- Sezenem - STRIKE
(20, 32, 12),
-- Xebec - STRIKE
(21, 42, 12);

-- RANGED (🏹RANGED) - role_id: 8
INSERT INTO member_roles (id, member_id, role_id) VALUES
-- Buscapeh - RANGED
(22, 6, 8),
-- LeoKillerz - RANGED
(23, 20, 8),
-- RednewKiil5634 - RANGED
(24, 29, 8),
-- Syorin - RANGED
(25, 36, 8);

-- DEFESA (🛡️DEFESA) - role_id: 11 (DEFENSE)
INSERT INTO member_roles (id, member_id, role_id) VALUES
-- Dagnun - DEFESA
(26, 8, 11),
-- Inklings - DEFESA
(27, 15, 11),
-- Kalikuna - DEFESA
(28, 17, 11),
-- Recoptor - DEFESA
(29, 28, 11),
-- ZaoH - DEFESA
(30, 44, 11);

-- FRONTLINE (⚔️FRONTLINE) - role_id: 9
INSERT INTO member_roles (id, member_id, role_id) VALUES
-- Ezg - FRONTLINE
(31, 10, 9),
-- Lutteh - FRONTLINE
(32, 21, 9),
-- Takakura - FRONTLINE
(33, 37, 9),
-- Vatt - FRONTLINE
(34, 41, 9);

-- BOMBER (💥BOMBER) - role_id: 6
INSERT INTO member_roles (id, member_id, role_id) VALUES
-- KingSize - BOMBER
(35, 18, 6),
-- OJeff - BOMBER
(36, 25, 6),
-- RodrigoZoldyck - BOMBER
(37, 30, 6),
-- Zangetsu1 - BOMBER
(38, 43, 6);

-- DOSA (🚬DOSA) - role_id: 14
INSERT INTO member_roles (id, member_id, role_id) VALUES
-- KoruLK - DOSA
(39, 19, 14),
-- Paunacam - DOSA
(40, 26, 14),
-- Sedmen - DOSA
(41, 31, 14),
-- Shamps - DOSA
(42, 33, 14),
-- Stegg - DOSA
(43, 35, 14),
-- UNFAIR - DOSA
(44, 38, 14);

-- Atualizar sequência para evitar conflitos futuros
SELECT setval('member_roles_id_seq', (SELECT MAX(id) FROM member_roles));
