const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const chatController = require('./controllers/chatController');
const ticketController = require('./controllers/ticketController');

const app = express();
const server = http.createServer(app);

// Libera o CORS pra não dar erro no front e prepara o Express pra entender JSON
app.use(cors());
app.use(express.json());

// Prepara o Socket.io pra conseguir receber e mandar mensagens em tempo real sem precisar de F5
const io = new Server(server, {
  maxHttpBufferSize: 1e8, // Aumenta o limite para 100MB para aceitar fotos de celular (Base64)
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Rotas HTTP da API REST
app.get('/api/tickets', ticketController.getTickets);
app.get('/api/tickets/user/:phone', ticketController.getUserTickets);
app.put('/api/tickets/:id/status', ticketController.updateTicketStatus);
app.put('/api/tickets/:id/priority', ticketController.updateTicketPriority);

// Toda vez que alguém entra na página, essa conexão é disparada
io.on('connection', (socket) => {
  console.log('Novo usuário conectado:', socket.id);

  // Repassa a mensagem pro controller que vai falar com a IA e decidir o que fazer
  socket.on('chat_message', async (data) => {
    await chatController.handleChatMessage(socket, data, io);
  });

  // Repassa a mensagem de áudio para ser transcrita e tratada pela IA
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
