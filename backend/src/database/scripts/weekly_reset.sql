-- Script simples para reset semanal manual
-- Zera os contadores de participações atuais mantendo o histórico

-- Tabela para logs do sistema (se não existir)
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs (action);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs (created_at);

-- Função para executar o reset semanal
CREATE OR REPLACE FUNCTION execute_weekly_reset()
RETURNS TABLE(
    members_reset INTEGER,
    reset_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    affected_rows INTEGER;
    reset_time TIMESTAMP WITH TIME ZONE;
    total_participations_before BIGINT;
    members_with_participations_before INTEGER;
BEGIN
    reset_time := CURRENT_TIMESTAMP;
    
    -- Capturar estatísticas antes do reset
    SELECT 
        SUM(actual_participations),
        COUNT(CASE WHEN actual_participations > 0 THEN 1 END)
    INTO total_participations_before, members_with_participations_before
    FROM member_commitments;
    
    -- Reset dos comprometimentos: zerar participações atuais
    UPDATE member_commitments 
    SET 
        actual_participations = 0,
        updated_at = reset_time;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    -- Log do reset
    INSERT INTO system_logs (action, details, created_at)
    VALUES (
        'weekly_reset',
        json_build_object(
            'reset_timestamp', reset_time,
            'members_reset', affected_rows,
            'total_participations_before', total_participations_before,
            'members_with_participations_before', members_with_participations_before
        ),
        reset_time
    );
    
    -- Retorna informações do reset
    RETURN QUERY SELECT affected_rows, reset_time;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas antes do reset
CREATE OR REPLACE FUNCTION get_reset_preview()
RETURNS TABLE(
    total_members INTEGER,
    members_with_participations INTEGER,
    total_actual_participations BIGINT,
    avg_participations NUMERIC
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        COUNT(*)::INTEGER as total_members,
        COUNT(CASE WHEN actual_participations > 0 THEN 1 END)::INTEGER as members_with_participations,
        SUM(actual_participations) as total_actual_participations,
        ROUND(AVG(actual_participations), 2) as avg_participations
    FROM member_commitments;
END;
$$ LANGUAGE plpgsql;

-- Função para obter histórico de resets
CREATE OR REPLACE FUNCTION get_reset_history(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    id INTEGER,
    reset_timestamp TIMESTAMP WITH TIME ZONE,
    members_reset INTEGER,
    total_participations_before BIGINT,
    members_with_participations_before INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        sl.id,
        (sl.details->>'reset_timestamp')::TIMESTAMP WITH TIME ZONE as reset_timestamp,
        (sl.details->>'members_reset')::INTEGER as members_reset,
        (sl.details->>'total_participations_before')::BIGINT as total_participations_before,
        (sl.details->>'members_with_participations_before')::INTEGER as members_with_participations_before,
        sl.created_at
    FROM system_logs sl
    WHERE sl.action = 'weekly_reset'
    ORDER BY sl.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Função para obter desempenho por membro
CREATE OR REPLACE FUNCTION get_member_performance()
RETURNS TABLE(
    member_id INTEGER,
    member_name TEXT,
    committed_participations INTEGER,
    actual_participations INTEGER,
    completion_percentage NUMERIC,
    performance_status TEXT,
    last_updated TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        mc.member_id,
        m.family_name::TEXT as member_name,
        mc.committed_participations,
        mc.actual_participations,
        CASE 
            WHEN mc.committed_participations = 0 THEN 0
            ELSE ROUND((mc.actual_participations::NUMERIC / mc.committed_participations::NUMERIC) * 100, 1)
        END as completion_percentage,
        CASE 
            WHEN mc.actual_participations = 0 THEN 'não_participou'::TEXT
            WHEN mc.actual_participations >= mc.committed_participations THEN 'completo'::TEXT
            ELSE 'parcial'::TEXT
        END as performance_status,
        mc.updated_at as last_updated
    FROM member_commitments mc
    INNER JOIN members m ON mc.member_id = m.id
    ORDER BY 
        CASE 
            WHEN mc.actual_participations >= mc.committed_participations THEN 1
            WHEN mc.actual_participations > 0 THEN 2
            ELSE 3
        END,
        mc.actual_participations DESC,
        m.family_name ASC;
END;
$$ LANGUAGE plpgsql;
