-- Schema para tabela de membros da guilda
-- Black Desert Online Guild Management System

CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(50) NOT NULL UNIQUE,
    character_name VARCHAR(50) NOT NULL,
    class VARCHAR(30) NOT NULL,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 70),
    ap INTEGER NOT NULL CHECK (ap >= 0 AND ap <= 400),
    awakened_ap INTEGER NOT NULL CHECK (awakened_ap >= 0 AND awakened_ap <= 400),
    dp INTEGER NOT NULL CHECK (dp >= 0 AND dp <= 600),
    profile VARCHAR(20) NOT NULL CHECK (profile IN ('Despertar', 'Sucessão')),
    gearscore DECIMAL(10,2) GENERATED ALWAYS AS ((ap + awakened_ap) / 2.0 + dp) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_members_family_name ON members(family_name);
CREATE INDEX IF NOT EXISTS idx_members_class ON members(class);
CREATE INDEX IF NOT EXISTS idx_members_gearscore ON members(gearscore DESC);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais (membros exemplo)
INSERT INTO members (family_name, character_name, class, level, ap, awakened_ap, dp, profile) 
VALUES 
    ('Lutteh', 'Kelzyh', 'Guardian', 63, 391, 391, 444, 'Despertar'),
    ('Banshee', 'BansheeWarrior', 'Warrior', 65, 280, 285, 350, 'Sucessão')
ON CONFLICT (family_name) DO NOTHING;
