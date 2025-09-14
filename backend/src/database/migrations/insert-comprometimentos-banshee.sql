-- SCRIPT PARA INSERIR COMPROMETIMENTOS DOS MEMBROS
-- Baseado na coluna "Comp." do arquivo nome_classe.md
-- Usando a tabela member_commitments existente
-- Data: 2025-09-14

-- INSERIR COMPROMETIMENTOS NA TABELA member_commitments
-- Estrutura: (id, member_id, committed_participations, actual_participations, notes)

INSERT INTO member_commitments (id, member_id, committed_participations, actual_participations, notes) VALUES

-- COMPROMETIMENTO NÍVEL 3 (máximo):
(1, 1, 3, 0, 'Akiria - Comprometimento máximo'),
(2, 2, 3, 0, 'Aoda11 - Comprometimento máximo'),
(3, 5, 3, 0, 'Blindolsky - Comprometimento máximo'),
(4, 6, 3, 0, 'Buscapeh - Comprometimento máximo'),
(5, 7, 3, 0, 'Challengers - Comprometimento máximo'),
(6, 8, 3, 0, 'Dagnun - Comprometimento máximo'),
(7, 10, 3, 0, 'Ezg - Comprometimento máximo'),
(8, 11, 3, 0, 'Fafnir - Comprometimento máximo'),
(9, 12, 3, 0, 'Ferretto - Comprometimento máximo'),
(10, 13, 3, 0, 'Geark - Comprometimento máximo'),
(11, 14, 3, 0, 'HrafnaFloki - Comprometimento máximo'),
(12, 15, 3, 0, 'Inklings - Comprometimento máximo'),
(13, 16, 3, 0, 'Kalict - Comprometimento máximo'),
(14, 17, 3, 0, 'Kalikuna - Comprometimento máximo'),
(15, 19, 3, 0, 'KoruLK - Comprometimento máximo'),
(16, 20, 3, 0, 'LeoKillerz - Comprometimento máximo'),
(17, 21, 3, 0, 'Lutteh - Comprometimento máximo'),
(18, 23, 3, 0, 'Morgoths - Comprometimento máximo'),
(19, 24, 3, 0, 'MuscleCar - Comprometimento máximo'),
(20, 25, 3, 0, 'OJeff - Comprometimento máximo'),
(21, 26, 3, 0, 'Paunacam - Comprometimento máximo'),
(22, 28, 3, 0, 'Recoptor - Comprometimento máximo'),
(23, 29, 3, 0, 'RednewKiil5634 - Comprometimento máximo'),
(24, 30, 3, 0, 'RodrigoZoldyck - Comprometimento máximo'),
(25, 33, 3, 0, 'Shamps - Comprometimento máximo'),
(26, 34, 3, 0, 'SilverLothus - Comprometimento máximo'),
(27, 35, 3, 0, 'Stegg - Comprometimento máximo'),
(28, 39, 3, 0, 'Unstoppabl3 - Comprometimento máximo'),
(29, 40, 3, 0, 'Urekmazino - Comprometimento máximo'),
(30, 41, 3, 0, 'Vatt - Comprometimento máximo'),
(31, 43, 3, 0, 'Zangetsu1 - Comprometimento máximo'),

-- COMPROMETIMENTO NÍVEL 2:
(32, 3, 2, 0, 'Aseo - Comprometimento médio'),
(33, 9, 2, 0, 'Duduzinn - Comprometimento médio'),
(34, 22, 2, 0, 'Machadovsk - Comprometimento médio'),
(35, 27, 2, 0, 'Pletz - Comprometimento médio'),
(36, 31, 2, 0, 'Sedmen - Comprometimento médio'),
(37, 38, 2, 0, 'UNFAIR - Comprometimento médio'),
(38, 42, 2, 0, 'Xebec - Comprometimento médio'),

-- COMPROMETIMENTO NÍVEL 1 (mínimo):
(39, 18, 1, 0, 'KingSize - Comprometimento mínimo'),
(40, 32, 1, 0, 'Sezenem - Comprometimento mínimo'),
(41, 36, 1, 0, 'Syorin - Comprometimento mínimo'),
(42, 37, 1, 0, 'Takakura - Comprometimento mínimo'),
(43, 44, 1, 0, 'ZaoH - Comprometimento mínimo');

-- Atualizar sequência para evitar conflitos futuros
SELECT setval('member_commitments_id_seq', (SELECT MAX(id) FROM member_commitments));
