# Discord Bot - Olá Mundo

Um bot simples do Discord que responde com "Olá mundo!" quando alguém escreve "olá" ou "ola" no chat.

## Configuração

1. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

2. **Configure o token do Discord:**
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione seu token do Discord:
   ```
   DISCORD_TOKEN=seu_token_aqui
   ```

3. **Como obter o token do Discord:**
   - Acesse [Discord Developer Portal](https://discord.com/developers/applications)
   - Crie uma nova aplicação
   - Vá para a seção "Bot"
   - Copie o token e cole no arquivo `.env`

## Executar o Bot

```bash
npm start
# ou
node src/index.js
```

## Funcionalidades

- ✅ Responde "Olá mundo! 🌍" quando alguém escreve "olá" ou "ola"
- ✅ Ignora mensagens de outros bots
- ✅ Imprime "Olá mundo! Bot está online!" no console quando conecta

## Estrutura do Projeto

```
discord-node-war-bot/
├── src/
│   └── index.js          # Código principal do bot
├── package.json          # Dependências e scripts
├── .env                  # Token do Discord (criar)
└── README.md            # Este arquivo
```
