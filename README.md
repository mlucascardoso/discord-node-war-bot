# 👻 Bot Banshee - Guardião Místico da Guilda

Um bot Discord personalizado para a **Guilda Banshee**, onde as almas perdidas encontram seu destino. O bot oferece uma interface web elegante e comandos místicos para gerenciar Node Wars e informações da guilda.

## 🌟 Funcionalidades

### 🎮 Interface Web
- **Página de Boas-vindas**: Apresentação da guilda com tema místico
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
├── 🎨 frontend/           # Interface Web React
│   ├── src/
│   │   ├── App.jsx       # Aplicação principal com tema Banshee
│   │   └── index.jsx     # Entry point
│   └── package.json
├── ⚙️ backend/            # API + Discord Bot
│   ├── src/
│   │   ├── server.js     # Servidor Express
│   │   ├── discord.js    # Bot Discord personalizado
│   │   └── commands/
│   │       └── node-war.js  # Sistema de Node War
│   └── package.json
├── 🚀 api/               # Deploy Vercel
├── package.json          # Scripts principais
└── README.md
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
- **React 18** com Hooks
- **Material-UI** com tema customizado
- **Vite** para build rápido

### Backend  
- **Node.js + Express** para API
- **Discord.js v14** para bot
- **ES Modules** moderno

### Deploy
- **Vercel** para hospedagem
- **Variáveis de ambiente** seguras

## 👻 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`  
3. Commit: `git commit -m 'Adiciona nova funcionalidade mística'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

**🌟 "A Banshee não é apenas uma guilda, é uma família de guerreiros místicos." 🌟**
