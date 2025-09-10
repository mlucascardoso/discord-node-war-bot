import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

// Load environment variables for local development
dotenv.config({ path: '.env.local' });
import classProfilesRouter from './routes/class-profiles.js';
import classesRouter from './routes/classes.js';
import discordRouter from './routes/discord.js';
import guildsRouter from './routes/guilds.js';
import membersRouter from './routes/members.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/classes', classesRouter);
app.use('/api/class-profiles', classProfilesRouter);
app.use('/api/members', membersRouter);
app.use('/api/guilds', guildsRouter);
app.use('/api/discord', discordRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Status: http://localhost:${PORT}/api/status`);
    console.log(`📋 Canais: http://localhost:${PORT}/api/channels`);
    console.log(`🎮 NodeWar: POST http://localhost:${PORT}/api/nodewar`);
});
