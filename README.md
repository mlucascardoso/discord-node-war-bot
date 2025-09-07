# 👻 Bot Banshee - Guardião Místico da Guilda

Um bot Discord personalizado para a **Guilda Banshee**, onde as almas perdidas encontram seu destino. O bot oferece uma interface web elegante e comandos místicos para gerenciar Node Wars e informações da guilda.

## 🌟 Funcionalidades

### 🎮 Interface Web
- **Dashboard**: Estatísticas e gráficos de gearscore dos membros
- **Gerenciamento de Membros**: CRUD completo com validação
- **Status do Bot**: Monitoramento em tempo real da conexão
- **Node War**: Interface para executar batalhas místicas
- **Menu Lateral**: Navegação intuitiva com tema Banshee

### ⚔️ Comandos Discord
- `/nodewar` - Invoca a agenda da Batalha Mística
- `/banshee` - Informações sobre a Guilda Banshee
- **Botões Interativos**: Sistema de inscrição para funções de combate

### 🔮 Tema Personalizado
- **Cores Místicas**: Roxo (#8B5CF6) e Rosa (#EC4899)
- **Emojis Temáticos**: 👻 💀 🔮 🌙 ⚔️
- **Mensagens Personalizadas**: Linguagem mística e imersiva

## 🚀 Configuração

### 1. Instalar Dependências
```bash
yarn install
# ou
npm install
```

### 2. Configurar Token do Discord
Crie um arquivo `.env` na raiz do projeto:
```env
DISCORD_TOKEN=seu_token_aqui
VITE_API_URL=http://localhost:3000
```

### 3. Obter Token do Discord
1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Vá para "Bot" e copie o token
4. Cole no arquivo `.env`

### 4. Configurar Banco de Dados (Vercel Postgres)

#### 4.1. Instalar Vercel CLI
```bash
npm install -g vercel
```

#### 4.2. Fazer Login no Vercel
```bash
vercel login
```

#### 4.3. Linkar o Projeto
```bash
vercel link
```

#### 4.4. Criar Banco de Dados
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique no seu projeto
3. Vá para **Storage** → **Create Database**
4. Escolha **Neon** (Serverless Postgres)
5. Nome: `banshee-db`
6. Plano: **Free** (500MB, suficiente para o projeto)
7. Clique em **Create Database**

#### 4.5. Conectar ao Projeto
1. No dashboard do banco, clique em **Connect Project**
2. Selecione seu projeto
3. Marque **Development** e **Production**
4. Confirme a conexão

#### 4.6. Baixar Variáveis de Ambiente
```bash
vercel env pull .env.local
```

#### 4.7. Executar Setup do Banco
```bash
node backend/src/database/setup.js
```

### 5. Estrutura do Banco de Dados

#### Tabela `members`
```sql
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(50) NOT NULL UNIQUE,
    character_name VARCHAR(50) NOT NULL,
    class VARCHAR(30) NOT NULL,
    level INTEGER CHECK (level >= 1 AND level <= 70),
    ap INTEGER CHECK (ap >= 0 AND ap <= 400),
    awakened_ap INTEGER CHECK (awakened_ap >= 0 AND awakened_ap <= 400),
    dp INTEGER CHECK (dp >= 0 AND dp <= 600),
    profile VARCHAR(20) CHECK (profile IN ('Despertar', 'Sucessão')),
    gearscore DECIMAL(10,2) GENERATED ALWAYS AS ((ap + awakened_ap) / 2.0 + dp) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Funcionalidades do Banco
- ✅ **Gearscore Calculado**: Fórmula `((AP + AP Despertar) / 2) + DP`
- ✅ **Validações**: Limites realistas para stats do BDO
- ✅ **Índices**: Performance otimizada para consultas
- ✅ **Triggers**: `updated_at` automático
- ✅ **Persistência**: Dados mantidos entre deploys

## 🏃‍♂️ Executar o Projeto

### Desenvolvimento (Frontend + Backend)
```bash
yarn dev
```

### Executar Separadamente
```bash
# Backend (API + Discord Bot)
yarn backend:dev

# Frontend (Interface Web)
yarn frontend:start

# Apenas Discord Bot
yarn backend:discord
```

### Produção
```bash
yarn build
yarn start
```

## 🏗️ Estrutura do Projeto

```
discord-node-war-bot/
├── 🎨 frontend/                    # Interface Web React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/            # Sidebar, Header
│   │   │   └── Pages/             # Dashboard, Members, Welcome
│   │   ├── api/                   # Clientes para APIs
│   │   │   └── members.js         # CRUD de membros
│   │   ├── App.jsx               # App principal com roteamento
│   │   └── main.jsx              # Entry point
│   ├── package.json
│   └── vite.config.js            # Configuração Vite
├── ⚙️ backend/                     # API + Discord Bot
│   ├── src/
│   │   ├── discord/              # Bot Discord
│   │   │   ├── client.js         # Cliente Discord
│   │   │   └── commands/         # Comandos do bot
│   │   │       └── node-war.js   # Sistema Node War
│   │   ├── api/                  # Lógica de negócio
│   │   │   └── members.js        # CRUD + validações
│   │   ├── database/             # Banco de dados
│   │   │   ├── schema.sql        # Schema PostgreSQL
│   │   │   └── setup.js          # Script de setup
│   │   ├── utils/                # Utilitários
│   │   │   ├── cors.js           # Headers CORS
│   │   │   ├── database.js       # Operações PostgreSQL
│   │   │   └── dataStore.js      # [DEPRECATED] Storage local
│   │   └── server.js             # Servidor Express local
│   └── package.json
├── 🚀 api/                        # Serverless Functions (Vercel)
│   ├── members/
│   │   ├── index.js              # GET /api/members
│   │   ├── create.js             # POST /api/members/create
│   │   ├── stats.js              # GET /api/members/stats
│   │   └── [id].js               # GET/PUT/DELETE /api/members/:id
│   ├── channels.js               # Discord channels
│   ├── nodewar.js                # Node war operations
│   └── status.js                 # Bot status
├── 📁 data/                       # [LOCAL] Dados temporários
│   └── members.json              # Cache local (desenvolvimento)
├── 🔧 Configuração
│   ├── .env                      # Variáveis básicas
│   ├── .env.local                # Variáveis do Vercel (auto-gerado)
│   ├── vercel.json               # Config deploy Vercel
│   └── package.json              # Scripts monorepo
└── 📚 Documentação
    └── README.md                 # Este arquivo
```

## 🎭 Personalização Banshee

### Identidade Visual
- **Logo**: 👻 BANSHEE
- **Motto**: "Onde as almas perdidas encontram seu destino"
- **Cores**: Gradientes místicos roxo/rosa
- **Tipografia**: Inter com pesos variados

### Funções de Combate
- 💀 **BOMBER** - Especialistas em explosivos
- 🏹 **RANGED** - Arqueiros de longo alcance  
- 🔮 **PA** - Magos de proteção
- 🛡️ **DEFESA** - Guardiões defensivos
- ⚔️ **FRONTLINE** - Guerreiros de linha de frente
- 🌙 **DO-SA** - Especialistas noturnos
- 🧱 **BLOCO** - Construtores estratégicos
- 🐘 **ELEFANTE** - Força bruta
- 👻 **STRIKER** - Assassinos místicos
- 🥁 **SHAI** - Suporte tático
- 📢 **CALLER** - Comandantes de batalha
- 🏴‍☠️ **BANDEIRA** - Porta-estandartes

## 🌙 Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev                    # Frontend + Backend
yarn backend:dev           # Backend com nodemon
yarn frontend:start        # Frontend React
yarn backend:discord       # Apenas Discord Bot

# Build
yarn frontend:build        # Build do frontend
yarn install:all          # Instalar todas as dependências

# Utilitários
yarn backend:start         # Servidor de produção
```

## 🔧 Tecnologias

### Frontend
- **React 18** com Hooks modernas
- **Material-UI (MUI)** com tema customizado Banshee
- **Vite** para build ultra-rápido
- **Recharts** para gráficos de gearscore
- **React Router** para navegação SPA

### Backend  
- **Node.js + Express** para API local
- **Discord.js v14** para bot personalizado
- **ES Modules** moderno
- **@vercel/postgres** para banco de dados
- **CORS** configurado para produção

### Banco de Dados
- **PostgreSQL** via Neon (Vercel)
- **Serverless** com auto-scaling
- **500MB** gratuitos (suficiente para milhares de membros)
- **Gearscore calculado** automaticamente
- **Triggers** para `updated_at`

### Deploy & DevOps
- **Vercel** para hospedagem serverless
- **Monorepo** com scripts organizados
- **Variáveis de ambiente** seguras
- **Hot reload** em desenvolvimento
- **Build otimizado** para produção

### Arquitetura
- **Serverless Functions** para API
- **Static Site Generation** para frontend
- **Persistent Storage** com PostgreSQL
- **CRUD completo** para gerenciamento
- **Real-time** Discord integration

## 📋 Status do Projeto

### ✅ Implementado
- **Frontend Completo**
  - Dashboard com gráficos de gearscore
  - Página de gerenciamento de membros
  - CRUD completo (Create, Read, Update, Delete)
  - Validação em tempo real
  - Interface responsiva com Material-UI
  
- **Backend Robusto**
  - API REST completa para membros
  - Validações de dados (AP ≤ 400, DP ≤ 600)
  - Cálculo automático de gearscore
  - Tratamento de erros em português
  - CORS configurado para produção

- **Banco de Dados**
  - PostgreSQL configurado (Neon/Vercel)
  - Schema otimizado com índices
  - Gearscore calculado automaticamente
  - Triggers para `updated_at`
  - Dados persistentes entre deploys

- **Deploy & DevOps**
  - Vercel configurado para monorepo
  - Serverless functions funcionais
  - Variáveis de ambiente seguras
  - Scripts de desenvolvimento organizados

### 🚧 Em Desenvolvimento
- **Integração PostgreSQL**
  - Migração das funções CRUD para usar banco
  - Testes de integração
  - Otimização de queries

### 🎯 Próximos Passos
- Finalizar migração para PostgreSQL
- Testes end-to-end
- Documentação de API
- Melhorias de performance

## 👻 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`  
3. Commit: `git commit -m 'Adiciona nova funcionalidade mística'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

**🌟 "A Banshee não é apenas uma guilda, é uma família de guerreiros místicos." 🌟**
