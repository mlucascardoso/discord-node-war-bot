import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables for local development
dotenv.config({ path: '.env.local' });
import classProfilesRouter from './routes/class-profiles.js';
import classesRouter from './routes/classes.js';
import discordRouter from './routes/discord.js';
import guildsRouter from './routes/guilds.js';
import membersRouter from './routes/members.js';
import nodewarSessionsRouter from './routes/nodewar-sessions.js';
import nodewarTemplatesRouter from './routes/nodewar-templates.js';
import rolesRouter from './routes/roles.js';

const app = express();
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do frontend (produção)
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, '../../frontend/dist');
    app.use(express.static(frontendPath));
}
app.use('/api/classes', classesRouter);
app.use('/api/class-profiles', classProfilesRouter);
app.use('/api/members', membersRouter);
app.use('/api/guilds', guildsRouter);
app.use('/api/discord', discordRouter);
app.use('/api/nodewar-templates', nodewarTemplatesRouter);
app.use('/api/nodewar-sessions', nodewarSessionsRouter);
app.use('/api/roles', rolesRouter);

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'discord-node-war-bot'
    });
});

// TODO: Configurar frontend depois que o backend estiver funcionando

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}/api/status`);
    console.log(`📋 Canais: http://localhost:${PORT}/api/channels`);
    console.log(`🎮 NodeWar: POST http://localhost:${PORT}/api/nodewar`);
});
