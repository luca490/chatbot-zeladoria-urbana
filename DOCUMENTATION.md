# Documentação Técnica: Plataforma de Zeladoria Urbana (Diadema)

## 1. Visão Geral e Objetivo

O objetivo deste projeto foi desenvolver uma plataforma web de zeladoria urbana onde os cidadãos de Diadema possam registrar problemas da cidade (buracos, falta de luz, lixo acumulado, vazamentos, etc.) através de um chatbot inteligente. O sistema atua em duas frentes:
1. **Para o Cidadão:** Uma interface de chat acessível, direta e sem formulários burocráticos.
2. **Para a Prefeitura:** Um painel administrativo em tempo real para visualização, análise de urgência e atualização do status dos chamados.

Todo o projeto foi construído **exclusivamente com ferramentas e camadas gratuitas (free-tier)**, cumprindo com rigor as exigências propostas.

---

## 2. O Desafio Proposto

O desenvolvimento seguiu os requisitos de um desafio técnico para uma vaga de estágio na Prefeitura de Diadema, cujos critérios incluíam:
- **Landing Page:** Página simples de apresentação com acesso ao chatbot.
- **Chatbot:** Coletar nome, telefone, descrição, imagem, manter histórico e gerar protocolo.
- **Banco de Dados:** Salvar usuário, telefone, descrição, imagem, status e data de criação.
- **Painel Administrativo:** Tela para visualizar chamados, ver imagens e alterar status (Aberto, Em andamento, Resolvido).
- **Notificação:** Alertar o usuário via WhatsApp ou E-mail após mudança de status.
- **Tecnologias Obrigatórias:** Apenas ferramentas gratuitas. (Sugestões: Next.js, React, Node.js, Express, Supabase, Groq).
- **Diferenciais Esperados e Implementados:** Streaming de resposta, responsividade, dashboard, geolocalização, classificação por IA, WebSockets e automação com n8n.

---

## 3. Processo de Desenvolvimento e Lógica Utilizada

Durante o desenvolvimento, o foco principal foi construir uma arquitetura limpa, separando bem as responsabilidades do frontend e do backend, e garantindo que as lógicas escolhidas resolvessem problemas reais da infraestrutura pública. 

**Nota sobre o uso de IA no código:** Durante a construção, ferramentas de IA (como o Gemini) foram utilizadas pontualmente como apoio ao desenvolvimento, ajudando na geração de estruturas base (boilerplate), revisão de sintaxe e resolução de pequenos bugs. No entanto, toda a arquitetura, lógica de negócios, integrações de APIs complexas e decisões estruturais foram elaboradas manualmente com base em extensa pesquisa e leitura da documentação oficial de cada tecnologia.

---

## 4. Funcionalidades Principais: Como Funcionam e Por Que Foram Adicionadas

### 4.1. Restrição Geográfica (Apenas Diadema)
- **Por que foi adicionado?** Um sistema de zeladoria municipal só tem utilidade se os chamados pertencerem ao município em questão. Se um cidadão tentar relatar um problema em São Bernardo do Campo, a prefeitura de Diadema não terá jurisdição para atuar.
- **Como funciona:** O chatbot faz uma validação lógica cruzando a intenção do usuário ou as coordenadas enviadas com os limites de Diadema. Se o problema reportado for fora da cidade, o bot informa amigavelmente que o serviço é exclusivo para Diadema e não registra o chamado indevido no banco de dados.

### 4.2. Painel Administrativo e Escalonamento de Urgência
- **Por que foi adicionado?** O administrador precisa visualizar o que é mais crítico de relance para despachar equipes.
- **Como funciona:** O painel lista todos os chamados. Conforme a IA identifica duplicidades (vários relatos do mesmo problema), a prioridade do chamado sobe dinamicamente. Um buraco reportado 1 vez pode nascer com prioridade "Baixa", mas se reportado múltiplas vezes em um curto período, o sistema automaticamente eleva para **"Urgente"** e destaca visualmente a ocorrência no topo do dashboard. O painel também permite alteração do fluxo de trabalho (Aberto, Em andamento, Resolvido) e visualização de mapas.

### 4.3. Notificação via WhatsApp (n8n + CallMeBot)
- **Por que foi adicionado?** O cidadão precisa receber um feedback real do seu problema para criar confiança na gestão pública.
- **Como funciona e Limitação Atual:** Quando o administrador altera ou resolve um chamado, o backend dispara um webhook HTTP para o **n8n**. O n8n recebe os dados, formata a mensagem e a envia via WhatsApp para o telefone do cidadão. 
  - *Detalhe Técnico Importante:* Como a exigência era usar apenas ferramentas gratuitas, foi adotada a API do **CallMeBot**. Essa camada grátis tem uma limitação de segurança: só permite enviar mensagens para o próprio número do desenvolvedor (meu WhatsApp pessoal) ou números previamente autorizados por um PIN. Em um cenário de produção com o orçamento da prefeitura, bastaria trocar o *node* do CallMeBot no n8n pelo nó oficial do WhatsApp Business API para que qualquer número do Brasil recebesse as notificações instantaneamente.

### 4.4. Reconhecimento de Áudio (Speech-to-Text)
- **Por que foi adicionado?** Situações de zeladoria muitas vezes ocorrem na rua, no trânsito ou em emergências (ex: árvore caída em via pública) onde o cidadão não tem tempo, estabilidade ou segurança para digitar. Além disso, garante inclusão digital para pessoas com dificuldade de leitura/escrita.
- **Como funciona:** O áudio é gravado na interface e enviado ao backend, que utiliza o modelo de inteligência artificial Whisper (via Groq API) para transcrever a voz em texto de forma instantânea, injetando o relato no chat.

### 4.5. Triagem Inteligente
- **Por que foi adicionado?** Para evitar a duplicação de trabalho da equipe da prefeitura. Se 15 pessoas relatam o mesmo poste apagado na mesma rua, a equipe deve ver 1 problema prioritário na tela, e não 15 chamados soltos.
- **Como funciona:** A IA extrai o contexto e a localização em linguagem natural. Antes de inserir no banco de dados, o sistema cruza as coordenadas e o tipo de problema. Caso constate que é um problema já relatado, ele unifica as informações no banco.

### 4.6. Comunicação em Tempo Real (WebSockets)
- **Por que foi adicionado?** A prefeitura não pode perder tempo recarregando a página. Se um chamado entra, a tela precisa atualizar na hora.
- **Como funciona:** Integrado com `socket.io`. Assim que o chatbot salva um ticket novo ou uma atualização de urgência no Supabase, um broadcast é emitido para todos os administradores logados, atualizando a fila na mesma fração de segundo.

### 4.7. Resumos Gerados por IA (Consolidação)
- **Por que foi adicionado?** Quando um chamado se torna urgente e possui dezenas de relatos (ex: 20 moradores reclamando de uma mesma rua sem luz), o gestor público não tem tempo de ler os 20 relatos individuais para entender a situação completa.
- **Como funciona:** A IA entra em ação novamente no painel administrativo. Ela analisa todos os relatos vinculados àquele problema e gera um resumo único, direto e consolidado, acelerando o processo de despacho da equipe de reparo.

### 4.8. Responsividade e Design Mobile-First
- **Por que foi adicionado?** A imensa maioria dos cidadãos fará o registro de problemas através do smartphone, muitas vezes na própria rua.
- **Como funciona:** A interface da Landing Page e do Chatbot foi inteiramente construída com a abordagem *Mobile-First*, garantindo que a usabilidade seja perfeita e fluida em telas pequenas, com botões bem dimensionados para o toque (touch) e telas que se adaptam naturalmente até monitores desktop.

### 4.9. Exportação de Relatórios Administrativos (Excel)
- **Por que foi adicionado?** A gestão pública exige a geração de relatórios de métricas para transparência, fechamento de mês e auditoria de chamados resolvidos.
- **Como funciona:** O painel administrativo conta com uma funcionalidade de exportação de dados. O sistema compila os chamados e gera um arquivo `.xlsx` estruturado e formatado automaticamente para download instantâneo da equipe da prefeitura.

### 4.10. Feedback Visual e Micro-interações
- **Por que foi adicionado?** Para que o cidadão perceba que o sistema está respondendo aos seus comandos, evitando cliques duplos e ansiedade (ex: não saber se o bot travou ou está "pensando").
- **Como funciona:** Utilizando animações fluídas (como *Framer Motion*), foram criados os estados de "digitando...", transições suaves para mensagens que chegam e rolagem automática no chat. Isso torna a conversa mais orgânica, similar aos aplicativos de mensagem reais que o cidadão já está acostumado a usar.

---

## 5. Arquitetura do Sistema e Tecnologias

O projeto usa o padrão Monorepo com comunicação via REST e WebSockets.

### Frontend (Next.js, React, Tailwind CSS)
- Utiliza **React Hooks** (`useState`, `useEffect`, `useRef`) para gerenciar o estado complexo das mensagens e scroll automático.
- Foram isolados **Custom Hooks** (`useSocket` e `useTickets`) para limpar o código da interface e manter a responsabilidade única.

### Backend (Node.js, Express, Socket.io)
- Fornece as rotas da API, lida com processamento assíncrono de triagem, converte áudio, despacha os webhooks e mantém o canal WebSocket persistente.

### Banco de Dados (Supabase)
- PostgreSQL relacional usado no plano gratuito, gerenciando armazenamento seguro e persistente dos tickets e imagens dos cidadãos.

### Inteligência Artificial (Groq)
- Motor de LLM utilizando o modelo aberto *Mixtral-8x7b* para interpretação em baixíssima latência e *Whisper* para transcrição de áudio, operando sob a infraestrutura gratuita e ultra veloz do Groq.

---

## 6. Como Iniciar o Projeto

### Pré-requisitos (Variáveis de Ambiente)

No diretório `backend`, crie o arquivo `.env`:
- `PORT`: Porta do servidor (Padrão: 3333)
- `SUPABASE_URL`: Endpoint do projeto.
- `SUPABASE_KEY`: Chave anônima (anon_key).
- `GROQ_API_KEY`: Token da API.
- `N8N_WEBHOOK_URL`: URL do gatilho configurado no fluxo do n8n.

No diretório `frontend`, crie o arquivo `.env.local`:
- `NEXT_PUBLIC_BACKEND_URL`: Ex: `http://localhost:3333`

### Inicializando a Aplicação

1. **Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

2. **Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

Acesso: Landing Page (`http://localhost:3000`) e Painel Admin (`http://localhost:3000/admin`). A senha do admin é `admin123`.

---

## 7. Referências e Links Úteis

A lógica do sistema foi construída com ampla pesquisa nos seguintes materiais oficiais:
- [Requisitos e Diretrizes Oficiais do Next.js (App Router)](https://nextjs.org/docs)
- [React.dev: Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Express.js: API Routing and Middleware](https://expressjs.com/en/guide/routing.html)
- [Socket.io: Emitting events and Broadcasting](https://socket.io/docs/v4/tutorial/introduction)
- [Supabase: JavaScript Client Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Groq API Console & Text Generation Docs](https://console.groq.com/docs/quickstart)
- [OSM Foundation: API Nominatim / Reverse Geocoding](https://nominatim.org/release-docs/latest/api/Search/)
- [n8n: Core Webhook Nodes Integration](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [CallMeBot: Free API for WhatsApp Messages](https://www.callmebot.com/blog/free-api-whatsapp-messages/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
