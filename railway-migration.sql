-- Railway PostgreSQL Migration Script
-- Criado automaticamente a partir do schema Neon existente

-- Criar tabelas na ordem correta (respeitando foreign keys)

-- 1. Tabelas básicas (sem dependências)
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS class_profiles (
    id SERIAL PRIMARY KEY,
    profile VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS guilds (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    emoji VARCHAR,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nodewar_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    informative_text VARCHAR,
    tier INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabelas com foreign keys
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR NOT NULL,
    class_id INTEGER REFERENCES classes(id),
    class_profile_id INTEGER REFERENCES class_profiles(id),
    guild_id INTEGER REFERENCES guilds(id),
    level INTEGER,
    ap INTEGER,
    awakened_ap INTEGER,
    dp INTEGER,
    gearscore NUMERIC,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS member_roles (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nodewar_configs (
    id SERIAL PRIMARY KEY,
    nodewar_type_id INTEGER NOT NULL REFERENCES nodewar_types(id),
    bomber_slots INTEGER DEFAULT 0,
    frontline_slots INTEGER DEFAULT 0,
    ranged_slots INTEGER DEFAULT 0,
    shai_slots INTEGER DEFAULT 0,
    pa_slots INTEGER DEFAULT 0,
    flag_slots INTEGER DEFAULT 0,
    defense_slots INTEGER DEFAULT 0,
    caller_slots INTEGER DEFAULT 0,
    elephant_slots INTEGER DEFAULT 0,
    waitlist INTEGER DEFAULT 0,
    total_slots INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nodewar_sessions (
    id SERIAL PRIMARY KEY,
    nodewar_config_id INTEGER NOT NULL REFERENCES nodewar_configs(id),
    schedule TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nodewar_session_member_role (
    id SERIAL PRIMARY KEY,
    nodewar_session_id INTEGER NOT NULL REFERENCES nodewar_sessions(id),
    member_id INTEGER REFERENCES members(id),
    role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_members_guild_id ON members(guild_id);
CREATE INDEX IF NOT EXISTS idx_members_class_id ON members(class_id);
CREATE INDEX IF NOT EXISTS idx_member_roles_member_id ON member_roles(member_id);
CREATE INDEX IF NOT EXISTS idx_member_roles_role_id ON member_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_nodewar_sessions_config_id ON nodewar_sessions(nodewar_config_id);
CREATE INDEX IF NOT EXISTS idx_nodewar_session_member_role_session_id ON nodewar_session_member_role(nodewar_session_id);

-- Comentários das tabelas
COMMENT ON TABLE classes IS 'Classes do jogo Black Desert';
COMMENT ON TABLE class_profiles IS 'Perfis das classes (Sucessão, Despertar, Ascensão)';
COMMENT ON TABLE guilds IS 'Guildas do jogo';
COMMENT ON TABLE members IS 'Membros das guildas';
COMMENT ON TABLE roles IS 'Roles para NodeWar';
COMMENT ON TABLE nodewar_types IS 'Tipos de NodeWar';
COMMENT ON TABLE nodewar_configs IS 'Configurações de slots para cada tipo de NodeWar';
COMMENT ON TABLE nodewar_sessions IS 'Sessões de NodeWar agendadas';
COMMENT ON TABLE nodewar_session_member_role IS 'Participantes de cada sessão de NodeWar';
