# Zeladoria Urbana Diadema

**Desenvolvido por:** Lucas de Lima Oliveira  
**Curso:** 5º semestre de DSM na FATEC Diadema  
**Objetivo:** Desafio para a vaga de estágio na Prefeitura de Diadema.

---

Plataforma inteligente de zeladoria urbana, permitindo que cidadãos registrem problemas da cidade via chatbot integrado a Inteligência Artificial. A plataforma conta com um painel administrativo em tempo real para gestão de chamados e notificações automáticas aos cidadãos via WhatsApp (n8n).

## 🚀 Funcionalidades Principais

### 🤖 Chatbot Inteligente (IA)
- **Triagem Automática:** A Inteligência Artificial entende a linguagem natural do cidadão, interpretando a gravidade e a intenção do relato.
- **Identificação de Duplicidade:** Se o cidadão relatar um problema já existente no sistema (ex: buraco na mesma rua), a IA não cria um novo chamado; ela anexa o relato ao chamado existente, aumentando o número de ocorrências.
- **Resumos Gerados por IA:** Para chamados com múltiplos relatos, a IA consolida todas as informações em um único resumo direto.

### 🎙️ Acessibilidade e Inclusão
- **Reconhecimento de Áudio (Speech-to-Text):** Cidadãos com dificuldade de digitação ou que preferem praticidade podem gravar áudios. O modelo Whisper (via Groq) transcreve o áudio com alta precisão e injeta no fluxo do chat.

### 📍 Geolocalização Dinâmica
- **Mapa Interativo Integrado:** O cidadão pode enviar sua localização enviando coordenadas GPS ou através de uma busca interativa integrada à API Nominatim/OpenStreetMap.
- **Restrição Geográfica:** O sistema analisa a localização e recusa amigavelmente chamados que não pertençam à cidade de Diadema.
- **Opções Rápidas:** Sugestão de pontos de referência da cidade de Diadema (Prefeitura, Terminal, Hospitais).

### 🛠️ Painel Administrativo em Tempo Real
- **Acesso Restrito:** A senha padrão para acessar `/admin` é `admin123`.
- **WebSocket em Tempo Real:** Chamados criados ou atualizados pelos cidadãos aparecem instantaneamente na tela do painel.
- **Priorização Dinâmica:** Chamados escalonam automaticamente (de "Baixa" até "Urgente") com base no volume de pessoas que reportam o mesmo problema na região.
- **Exportação:** Opção de exportação total dos dados em planilha Excel (`.xlsx`).

### 📱 UI Responsiva e Fluida
- **Mobile-First:** Interface inteiramente pensada para o uso no celular, cenário padrão para cidadãos na rua.
- **Micro-interações:** Animações e estados de "digitando..." utilizando Framer Motion para guiar o cidadão de forma clara e orgânica.

### 🔔 Notificações Automáticas via n8n
- **Atualização de Status:** Ao mover um chamado de "Aberto" para "Resolvido", o sistema dispara o webhook para o n8n notificar os cidadãos vinculados ao problema pelo WhatsApp. *(Nota: Por exigência do desafio de utilizar apenas ferramentas gratuitas, a automação usa a API do CallMeBot, que restringe o envio temporariamente a números autorizados/desenvolvedor).*

---

> **📚 Documentação Completa:** Para detalhes aprofundados sobre arquitetura, custom hooks, lógica de desenvolvimento e fontes de pesquisa, consulte o arquivo [DOCUMENTATION.md](./DOCUMENTATION.md).

---

## 💻 Configuração e Instalação

### 1. Variáveis de Ambiente (`.env`)
No diretório `backend`, crie um arquivo `.env` exatamente com o seguinte formato:
```env
PORT=3333
SUPABASE_URL=https://<SUA_URL_DO_SUPABASE>.supabase.co
SUPABASE_KEY=<SUA_CHAVE_DO_SUPABASE>

GROQ_API_KEY=<SUA_CHAVE_DO_GROQ>
N8N_WEBHOOK_URL=<SUA_URL_DO_WEBHOOK_N8N>
```
> Obs: No diretório `frontend`, existe também um arquivo com `NEXT_PUBLIC_BACKEND_URL=http://localhost:3333`.

### 2. Executando o Projeto
Abra **dois** terminais no VSCode:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

### 3. Acessos Rápidos
- **Página do Cidadão:** `http://localhost:3000`
- **Painel da Prefeitura:** `http://localhost:3000/admin` (Senha: `admin123`)
