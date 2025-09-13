BEGIN;

UPDATE member_warnings 
SET warning_type = CASE 
    WHEN warning_type = 'absence' THEN 'falta'
    WHEN warning_type = 'behavior' THEN 'comportamento'
    WHEN warning_type = 'performance' THEN 'classe'
    WHEN warning_type = 'other' THEN 'comportamento'
    ELSE warning_type
END;

ALTER TABLE member_warnings DROP CONSTRAINT member_warnings_type_check;

ALTER TABLE member_warnings ADD CONSTRAINT member_warnings_type_check 
CHECK (warning_type IN ('falta', 'bot', 'classe', 'atraso', 'comportamento'));

DROP INDEX IF EXISTS idx_member_warnings_severity;

ALTER TABLE member_warnings DROP CONSTRAINT member_warnings_severity_check;

ALTER TABLE member_warnings DROP CONSTRAINT member_warnings_session_id_fkey;
ALTER TABLE member_warnings DROP CONSTRAINT member_warnings_issued_by_id_fkey;
ALTER TABLE member_warnings DROP CONSTRAINT member_warnings_resolved_by_id_fkey;

DROP INDEX IF EXISTS idx_member_warnings_session;
DROP INDEX IF EXISTS idx_member_warnings_issued_by;

DROP INDEX IF EXISTS idx_member_warnings_active;

ALTER TABLE member_warnings DROP CONSTRAINT member_warnings_resolution_check;

ALTER TABLE member_warnings DROP COLUMN severity;
ALTER TABLE member_warnings DROP COLUMN session_id;
ALTER TABLE member_warnings DROP COLUMN issued_by_id;
ALTER TABLE member_warnings DROP COLUMN resolved_by_id;
ALTER TABLE member_warnings DROP COLUMN is_active;
ALTER TABLE member_warnings DROP COLUMN resolved_at;
ALTER TABLE member_warnings DROP COLUMN resolution_notes;

COMMIT;
