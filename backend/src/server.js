import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables for local development
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL);

async function loadRouters() {
    return {
        classProfilesRouter: (await import('./routes/class-profiles.js')).default,
        classesRouter: (await import('./routes/classes.js')).default,
        discordRouter: (await import('./routes/discord.js')).default,
        guildsRouter: (await import('./routes/guilds.js')).default,
        memberCommitmentsRouter: (await import('./routes/member-commitments.js')).default,
        memberParticipationsRouter: (await import('./routes/member-participations.js')).default,
        memberWarningsRouter: (await import('./routes/member-warnings.js')).default,
        membersRouter: (await import('./routes/members.js')).default,
        nodewarSessionsRouter: (await import('./routes/nodewar-sessions.js')).default,
        nodewarTemplatesRouter: (await import('./routes/nodewar-templates.js')).default,
        rolesRouter: (await import('./routes/roles.js')).default
    };
}

async function startServer() {
    const routers = await loadRouters();

    const app = express();
    app.use(cors());
    app.use(express.json());

    if (process.env.NODE_ENV === 'production') {
        const frontendPath = path.join(__dirname, '../../frontend/dist');
        app.use(express.static(frontendPath));
    }

    app.use('/api/classes', routers.classesRouter);
    app.use('/api/class-profiles', routers.classProfilesRouter);
    app.use('/api/members', routers.membersRouter);
    app.use('/api/member-commitments', routers.memberCommitmentsRouter);
    app.use('/api/member-participations', routers.memberParticipationsRouter);
    app.use('/api/member-warnings', routers.memberWarningsRouter);
    app.use('/api/guilds', routers.guildsRouter);
    app.use('/api/discord', routers.discordRouter);
    app.use('/api/nodewar-templates', routers.nodewarTemplatesRouter);
    app.use('/api/nodewar-sessions', routers.nodewarSessionsRouter);
    app.use('/api/roles', routers.rolesRouter);

    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'discord-node-war-bot'
        });
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        console.log(`📊 Status: http://localhost:${PORT}/api/status`);
        console.log(`📋 Canais: http://localhost:${PORT}/api/channels`);
        console.log(`🎮 NodeWar: POST http://localhost:${PORT}/api/nodewar`);
    });
}

// Start the server
startServer().catch(console.error);
