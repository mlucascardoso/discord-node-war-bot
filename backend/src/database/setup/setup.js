/* eslint-disable max-lines-per-function */
/**
 * Database setup script
 * Creates tables and initial data for the guild management system
 */

import dotenv from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupDatabase() {
    try {
        console.log('🚀 Setting up database...');

        // Create members table
        console.log('📋 Creating members table...');
        await sql`
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
            )
        `;

        // Create indexes
        console.log('🔍 Creating indexes...');
        await sql`CREATE INDEX IF NOT EXISTS idx_members_family_name ON members(family_name)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_members_class ON members(class)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_members_gearscore ON members(gearscore DESC)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at DESC)`;

        // Create trigger function
        console.log('⚡ Creating trigger function...');
        await sql`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql'
        `;

        // Create trigger
        await sql`
            DROP TRIGGER IF EXISTS update_members_updated_at ON members
        `;
        await sql`
            CREATE TRIGGER update_members_updated_at 
                BEFORE UPDATE ON members 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column()
        `;

        // Insert initial data
        console.log('📊 Inserting initial data...');
        await sql`
            INSERT INTO members (family_name, character_name, class, level, ap, awakened_ap, dp, profile) 
            VALUES 
                ('Lutteh', 'Kelzyh', 'Guardian', 63, 391, 391, 444, 'Despertar'),
                ('Banshee', 'BansheeWarrior', 'Warrior', 65, 280, 285, 350, 'Sucessão')
            ON CONFLICT (family_name) DO NOTHING
        `;

        console.log('✅ Database setup completed successfully!');

        // Test query
        const result = await sql`SELECT COUNT(*) as count FROM members`;
        console.log(`📊 Members in database: ${result.rows[0].count}`);
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    setupDatabase()
        .then(() => {
            console.log('🎉 Setup complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Setup failed:', error);
            process.exit(1);
        });
}

export { setupDatabase };
