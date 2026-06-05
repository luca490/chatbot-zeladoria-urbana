const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const chatController = require('./controllers/chatController');
const ticketController = require('./controllers/ticketController');

const app = express();
const server = http.createServer(app);

// Configuração de CORS e middleware para parsing de requisições JSON
app.use(cors());
app.use(express.json());

// Inicialização do servidor Socket.io para comunicação em tempo real
const io = new Server(server, {
  maxHttpBufferSize: 1e8, // Limite máximo do buffer de 100MB para tráfego de imagens em Base64
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Definição das rotas REST para gerenciamento de chamados
app.get('/api/tickets', ticketController.getTickets);
app.get('/api/tickets/user/:phone', ticketController.getUserTickets);
app.put('/api/tickets/:id/status', ticketController.updateTicketStatus);
app.put('/api/tickets/:id/priority', ticketController.updateTicketPriority);

// Event listener para novas conexões WebSocket
io.on('connection', (socket) => {
  console.log('Novo usuário conectado:', socket.id);

  // Processamento e análise inteligente de mensagens de texto
  socket.on('chat_message', async (data) => {
    await chatController.handleChatMessage(socket, data, io);
  });

  // Transcrição e tratamento de mensagens de áudio
  socket.on('audio_message', async (data) => {
    await chatController.handleAudioMessage(socket, data, io);
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
