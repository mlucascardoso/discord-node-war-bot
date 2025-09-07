# 🏗️ Arquitetura Frontend - Bot Banshee

## 📁 Estrutura de Pastas

```
frontend/src/
├── 🎨 components/           # Componentes React organizados
│   ├── Layout/             # Componentes de layout
│   │   ├── Header.jsx      # Cabeçalho da aplicação
│   │   ├── Sidebar.jsx     # Menu lateral
│   │   └── Layout.jsx      # Layout principal
│   ├── Pages/              # Páginas da aplicação
│   │   ├── WelcomePage.jsx # Página de boas-vindas
│   │   ├── BotStatusPage.jsx # Status do bot
│   │   ├── NodeWarPage.jsx # Interface Node War
│   │   └── SettingsPage.jsx # Configurações
│   └── UI/                 # Componentes de interface
│       └── AlertMessage.jsx # Componente de alertas
├── 🎭 theme/               # Configuração de tema
│   └── bansheeTheme.js     # Tema personalizado Banshee
├── 🔗 hooks/               # Hooks customizados
│   └── useApi.js           # Hook para chamadas de API
├── App.jsx                 # Componente principal
└── index.jsx               # Entry point
```

## 🧩 Componentes

### Layout Components

#### `Layout.jsx`
- **Responsabilidade**: Container principal da aplicação
- **Props**: `currentPage`, `onMenuClick`, `mobileOpen`, `onDrawerToggle`, `botStatus`, `currentPageTitle`, `children`
- **Funcionalidades**: 
  - Gerencia layout responsivo
  - Integra Header e Sidebar
  - Controla drawer mobile

#### `Header.jsx`
- **Responsabilidade**: Cabeçalho da aplicação
- **Props**: `currentPageTitle`, `onDrawerToggle`
- **Funcionalidades**:
  - Exibe título da página atual
  - Botão de menu para mobile
  - Avatar da guilda

#### `Sidebar.jsx`
- **Responsabilidade**: Menu lateral de navegação
- **Props**: `currentPage`, `onMenuClick`, `botStatus`
- **Funcionalidades**:
  - Lista de itens do menu
  - Status visual do bot
  - Logo da guilda Banshee

### Page Components

#### `WelcomePage.jsx`
- **Responsabilidade**: Página de boas-vindas
- **Funcionalidades**:
  - Apresentação da guilda
  - Cards com valores da Banshee
  - Design místico temático

#### `BotStatusPage.jsx`
- **Responsabilidade**: Monitoramento do bot
- **Props**: `botStatus`, `fetchBotStatus`
- **Funcionalidades**:
  - Status online/offline
  - Informações de conexão
  - Botão de atualização

#### `NodeWarPage.jsx`
- **Responsabilidade**: Interface para Node Wars
- **Props**: `channels`, `selectedChannel`, `setSelectedChannel`, `executeNodeWar`, `loading`, `fetchChannels`
- **Funcionalidades**:
  - Seleção de canal
  - Execução de batalhas
  - Interface de loading

#### `SettingsPage.jsx`
- **Responsabilidade**: Página de configurações
- **Funcionalidades**:
  - Placeholder para futuras configurações
  - Design consistente com o tema

### UI Components

#### `AlertMessage.jsx`
- **Responsabilidade**: Exibição de mensagens
- **Props**: `message`, `onClose`
- **Funcionalidades**:
  - Alertas de sucesso/erro
  - Auto-dismiss
  - Estilo personalizado

## 🎨 Theme System

### `bansheeTheme.js`
- **Responsabilidade**: Configuração do tema Material-UI
- **Características**:
  - Modo escuro por padrão
  - Cores místicas (roxo/rosa)
  - Tipografia personalizada
  - Paleta de cores completa

## 🔗 Hooks Customizados

### `useApi.js`
- **Responsabilidade**: Gerenciamento de chamadas de API
- **Funcionalidades**:
  - `fetchBotStatus()` - Status do bot
  - `fetchChannels()` - Lista de canais
  - `executeNodeWar(channelId)` - Execução de batalha
  - Auto-refresh de status (30s)
  - Estados de loading

## 🔄 Fluxo de Dados

```
App.jsx (Estado principal)
├── currentPage (string)
├── selectedChannel (string)
├── mobileOpen (boolean)
├── message (object)
└── useApi() hook
    ├── botStatus (object)
    ├── channels (array)
    ├── loading (boolean)
    └── API functions
```

## 📱 Responsividade

### Desktop (md+)
- Sidebar fixa (280px)
- Header com título
- Conteúdo principal ajustado

### Mobile (xs-sm)
- Sidebar como drawer
- Botão hambúrguer no header
- Layout stack vertical

## 🎯 Vantagens da Nova Arquitetura

### ✅ Manutenibilidade
- Componentes pequenos e focados
- Responsabilidades bem definidas
- Fácil localização de código

### ✅ Reutilização
- Componentes modulares
- Hooks customizados
- Theme centralizado

### ✅ Testabilidade
- Componentes isolados
- Props bem definidas
- Lógica separada da apresentação

### ✅ Performance
- Lazy loading possível
- Re-renders otimizados
- Hooks para lógica complexa

### ✅ Escalabilidade
- Estrutura extensível
- Padrões consistentes
- Separação de concerns

## 🚀 Próximos Passos

### Melhorias Possíveis
- [ ] Context API para estado global
- [ ] React Query para cache de dados
- [ ] Lazy loading de páginas
- [ ] Testes unitários
- [ ] Storybook para documentação
- [ ] Error boundaries
- [ ] Otimização de bundle

### Novos Componentes
- [ ] Loading skeletons
- [ ] Modal components
- [ ] Form components
- [ ] Chart components
- [ ] Notification system

---

**🌟 Resultado**: Código muito mais limpo, organizado e fácil de manter! 👻⚔️
