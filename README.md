# Zeladoria Urbana - Diadema

**Desenvolvido por:** Lucas de Lima Oliveira  
**Curso:** 5º semestre de Tecnologia em Desenvolvimento de Software Multiplataforma (DSM)  
**Instituição:** FATEC Diadema  
**Objetivo:** Projeto prático desenvolvido como desafio técnico para a vaga de estágio na Prefeitura Municipal de Diadema.

---

## 🔗 Links de Acesso Rápido (Produção)
* **Página do Cidadão (Chatbot):** [https://chatbot-zeladoria-urbana.vercel.app/](https://chatbot-zeladoria-urbana.vercel.app/)
* **Painel Administrativo da Prefeitura:** [https://chatbot-zeladoria-urbana.vercel.app/admin](https://chatbot-zeladoria-urbana.vercel.app/admin) (Senha de acesso: `admin123`)

* **API Backend (Render):** [https://chatbot-zeladoria-urbana.onrender.com](https://chatbot-zeladoria-urbana.onrender.com)
  * ⚠️ *Nota importante:* Como o backend está hospedado no plano gratuito do Render, o servidor entra em modo de repouso (*cold start*) após alguns minutos de inatividade. Por conta disso, **o primeiro carregamento das chamadas ou o primeiro envio de mensagem no chatbot pode demorar cerca de 1 minuto para responder**, que é o tempo necessário para o contêiner do Render acordar e iniciar. Após essa ativação inicial, a comunicação ocorre de forma instantânea.

---

A plataforma **Zeladoria Diadema** é uma solução moderna e inteligente para a gestão de zeladoria urbana municipal. O sistema conecta o cidadão diretamente à prefeitura por meio de um assistente de conversação (chatbot) com IA, e provê uma fila de chamados interativa e em tempo real para a equipe administrativa da prefeitura.

Toda a infraestrutura foi desenvolvida aproveitando recursos gratuitos (*free-tier*) e tecnologias de alto desempenho.

---

## 🌟 O Ecossistema do Sistema

A plataforma funciona em duas frentes totalmente integradas:

### 💬 1. O Assistente do Cidadão (Chatbot)
Um fluxo de conversação simplificado e sem burocracias, onde o morador pode relatar ocorrências urbanas da sua rua.
* **Conversa por Áudio ou Texto**: Cidadãos podem digitar ou simplesmente enviar mensagens de voz, que são convertidas instantaneamente em texto (Speech-to-Text via Whisper).
* **Envio de Mídia**: Suporte para upload de fotos do problema no local.
* **Mapa de Ocorrências**: Permite anexar a geolocalização exata usando o GPS do celular ou buscando endereços com autocompletar integrado.
* **Acessibilidade Inclusiva**: O chatbot conta com chave de alternância de **Modo Claro e Modo Escuro**, otimizando a leitura sob luz solar direta ou em ambientes noturnos.

### 📊 2. O Painel Administrativo da Prefeitura
Uma central de comando em tempo real para controle e triagem de chamados.
* **WebSocket em Tempo Real**: Novos chamados e atualizações surgem na tela instantaneamente, sem necessidade de atualizar a página (*F5*).
* **Agrupamento de Ocorrências e Escalonamento**: A IA cruza dados de localização e categoria para agrupar problemas repetidos (evitando duplicidade de ordens de serviço) e escalona a prioridade (de "Baixa" até "Urgente") conforme o volume de moradores reportando a mesma situação.
* **Resumo de Chamados por IA**: Consolida múltiplos relatos sobre uma mesma área em um resumo direto para agilizar o despacho das equipes.
* **Exportação**: Geração de relatórios analíticos em planilhas Excel (`.xlsx`) em um clique.

---

## 🎨 Identidade Visual e Experiência do Usuário

A interface foi projetada para refletir a identidade municipal de Diadema:
* **Paleta de Cores**: Baseada na bandeira de Diadema, utilizando tons de azul-marinho, azul-celeste e branco em gradientes premium e transições suaves.
* **Micro-interações**: Animações de transição de tela, indicadores de digitação do robô e respostas fluidas construídas com *Framer Motion*.

---

## 🛠️ Tecnologias e Ferramentas Utilizadas

### Frontend
* **Framework:** Next.js (App Router) & React
* **Estilização:** Tailwind CSS v4 (Variáveis dinâmicas para modo claro/escuro)
* **Animações:** Framer Motion
* **Iconografia:** Lucide React

### Backend
* **Servidor:** Node.js com Express
* **Tempo Real:** Socket.io (WebSockets)
* **Processamento de Áudio:** Conversão base64 para arquivos de áudio webm

### Banco de Dados & Infraestrutura Cloud
* **Banco Relacional:** Supabase (PostgreSQL relacional)
* **Armazenamento:** Supabase Storage (armazenamento das fotos enviadas)

### Inteligência Artificial
* **Serviço de IA:** Groq API (Processamento em baixíssima latência)
* **Modelos:** *Llama-3.3-70b* (para classificação, validação de local e resumos) e *Whisper-large-v3* (para transcrição de áudio)

### Integração & Notificações
* **Automação:** n8n (Webhook HTTP)
* **WhatsApp:** CallMeBot API (dispara avisos em tempo real ao cidadão quando o status de seu protocolo muda)

---

## 🗺️ Arquitetura de Comunicação (API e WebSockets)

### Rotas HTTP (REST)
Método | Rota | Descrição | Escopo
--- | --- | --- | ---
**GET** | `/api/tickets` | Retorna todos os chamados salvos para o painel admin | Administrativo
**GET** | `/api/tickets/user/:phone` | Lista todos os chamados vinculados ao telefone do cidadão | Chatbot / Histórico
**PUT** | `/api/tickets/:id/status` | Altera a etapa de resolução (Aberto, Em andamento, Resolvido) | Administrativo
**PUT** | `/api/tickets/:id/priority` | Atualiza manualmente a gravidade da ocorrência | Administrativo

### Eventos WebSocket (Tempo Real)
Canal / Evento | Direção | Descrição
--- | --- | ---
`chat_message` | Cliente ➔ Servidor | Envia o relato de texto/localização e recebe a resposta inteligente da IA
`audio_message` | Cliente ➔ Servidor | Transmite o arquivo de áudio para transcrição via Whisper
`new_ticket` | Servidor ➔ Cliente | Atualiza os administradores com novos chamados recebidos
`update_ticket` | Servidor ➔ Cliente | Distribui alterações de status ou prioridade em tempo real
`delete_ticket` | Servidor ➔ Cliente | Sincroniza a remoção de chamados da fila ativa

---

## 📁 Estrutura Organizacional do Repositório

```
chatbot-zeladoria-urbana/
├── frontend/                     # Aplicação Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/            # Área do Administrador (Dashboard e Login)
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css       # Configuração do Tailwind CSS v4 e Variáveis de Tema
│   │   │   ├── layout.tsx        # Estrutura HTML e Script de Tema (Pre-render)
│   │   │   └── page.tsx          # Landing Page e Container do Chatbot
│   │   ├── components/
│   │   │   ├── Chatbot/
│   │   │   │   └── ChatbotWidget.tsx # Assistente de chat guiado
│   │   │   ├── Admin/
│   │   │   │   ├── TicketCard.tsx    # Card de listagem do chamado
│   │   │   │   └── TicketModal.tsx   # Visualizador de detalhes, fotos e mapas
│   │   │   └── ui/                   # Componentes base de interface
│   │   └── hooks/                    # Lógica de conexão (Sockets e Tickets)
└── backend/                      # Servidor Node.js
    └── src/
        ├── config/               # Conexões Supabase e Groq
        ├── controllers/          # Lógica do chat (IA e duplicidade) e chamados
        ├── services/             # Whisper, Llama e Webhooks (n8n)
        └── server.js             # Entrada do Servidor HTTP e Socket.io
```

---

## 🔐 Segurança
- Chaves de API armazenadas de forma segura em variáveis de ambiente (nunca expostas no código).
- Validação e proteção de rotas administrativas diretamente nas requisições do painel.

---

## 📋 Status dos Chamados
Status | Descrição
--- | ---
Aberto | Chamado recém-registrado pelo cidadão
Em andamento | Prefeitura em fase de análise ou execução do reparo
Resolvido | Problema solucionado com sucesso

---

## 📬 Notificações
Ao alterar o status de um chamado (ex: para "Resolvido"), os cidadãos vinculados recebem automaticamente uma mensagem no WhatsApp com o protocolo e a atualização.

---

> 📚 **Para mais informações:** Consulte a documentação técnica detalhada no arquivo [DOCUMENTATION.md](./DOCUMENTATION.md) para entender a fundo a arquitetura, hooks customizados, triagem de IA e fluxos do sistema.
