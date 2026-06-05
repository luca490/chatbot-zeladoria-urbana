const supabase = require('../config/supabase');
const groqService = require('../services/groqService');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');

const userSessions = new Map();

async function handleChatMessage(socket, data, io) {
  const { message, user, isInitial } = data;

  if (isInitial) {
    userSessions.set(socket.id, { history: [] });
    socket.emit('bot_response', {
      text: `Olá, ${user.name}! Sou o assistente do Zeladoria Diadema. Por favor, descreva qual o problema de zeladoria ou saúde pública (ex: vazamento, poste apagado, foco de dengue, zoonose/animal doente) e onde ele está. Se quiser, você também pode anexar uma foto!`,
      isStream: false
    });
    return;
  }

  const session = userSessions.get(socket.id) || { history: [] };
  session.history.push({ role: "user", content: message });

  socket.emit('bot_typing', true);

  const { data: openTickets } = await supabase.from('tickets').select('id, protocol, description, report_count').eq('status', 'Aberto');
  const openTicketsContext = JSON.stringify(openTickets || []);

  const aiResult = await groqService.analyzeWithAI(session.history, openTicketsContext);
  
  session.history.push({ role: "assistant", content: aiResult.resposta });
  userSessions.set(socket.id, session);

  if (aiResult.id_duplicado) {
    const existingTicket = (openTickets || []).find(t => t.id === aiResult.id_duplicado);
    if (existingTicket) {
      if (session.createdTicketId && session.createdTicketId !== existingTicket.id) {
        await supabase.from('tickets').delete().eq('id', session.createdTicketId);
        io.emit('delete_ticket', session.createdTicketId);
        session.createdTicketId = null;
        session.createdProtocol = null;
      }

      const newCount = (existingTicket.report_count || 1) + 1;
      
      let rawExistingDescription = existingTicket.description || "";
      rawExistingDescription = rawExistingDescription.replace(/\[RESUMO_IA\][\s\S]*?\[\/RESUMO_IA\]\n\n/, "");
      const userReport = aiResult.relato_usuario || message;
      const newDescriptionText = `\n\n--- Relato Adicional de ${user.name} (${user.phone}) ---\n${userReport}`;
      const allReportsText = rawExistingDescription + newDescriptionText;

      const aiSummary = await groqService.generateAISummary(allReportsText);
      const updatedDescription = `[RESUMO_IA]\n${aiSummary}\n[/RESUMO_IA]\n\n${allReportsText}`;

      const updates = { 
        report_count: newCount,
        description: updatedDescription
      };
      
      if (newCount >= 3) {
        updates.priority = 'Urgente';
      } else if (newCount == 2) {
        updates.priority = 'Alta';
      }

      const { data: updatedData } = await supabase.from('tickets').update(updates).eq('id', existingTicket.id).select();

      socket.emit('bot_typing', false);
      socket.emit('bot_response', {
        text: `${aiResult.resposta}\n\nJá tínhamos ciência desse problema (Protocolo associado: **${existingTicket.protocol}**). Acabamos de adicionar seu relato ao sistema para aumentar a prioridade da equipe!`,
        isStream: false
      });

      if (updatedData && updatedData.length > 0) {
        io.emit('update_ticket', updatedData[0]);
      }
      return;
    }
  }

  if (aiResult.criar_chamado) {
    const protocol = crypto.randomBytes(4).toString('hex').toUpperCase();

    const userReport = aiResult.relato_usuario || message;
    const initialReportText = `--- Relato Original de ${user.name} (${user.phone}) ---\n${userReport}`;
    const aiSummary = await groqService.generateAISummary(initialReportText);
    const finalDescription = `[RESUMO_IA]\n${aiSummary}\n[/RESUMO_IA]\n\n${initialReportText}`;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert([
        {
          protocol,
          user_name: user.name,
          user_phone: user.phone,
          description: finalDescription,
          status: 'Aberto',
          image_url: data.imageUrl || null
        }
      ])
      .select();

    socket.emit('bot_typing', false);

    if (error) {
      console.error("Erro ao salvar ticket:", error);
      socket.emit('bot_response', { text: 'Desculpe, ocorreu um erro interno ao registrar seu chamado. Tente novamente mais tarde.' });
      return;
    }

    socket.emit('bot_response', {
      text: `${aiResult.resposta}\n\nSeu protocolo é: **${protocol}**. Anote para acompanhar o chamado!`,
      isStream: false
    });

    if (ticket && ticket.length > 0) {
      session.createdTicketId = ticket[0].id;
      session.createdProtocol = protocol;
      io.emit('new_ticket', ticket[0]);
    }
  } else {
    socket.emit('bot_typing', false);
    socket.emit('bot_response', {
      text: aiResult.resposta,
      isStream: false
    });
  }
}

async function handleAudioMessage(socket, data, io) {
  try {
    socket.emit('bot_typing', true);

    const { audioBase64, user } = data;
    const base64Data = audioBase64.split(';base64,').pop();
    const tmpFilePath = path.join(os.tmpdir(), `audio_${Date.now()}.webm`);
    
    fs.writeFileSync(tmpFilePath, base64Data, { encoding: 'base64' });

    const audioStream = fs.createReadStream(tmpFilePath);
    const transcribedText = await groqService.transcribeAudio(audioStream);
    
    try {
      fs.unlinkSync(tmpFilePath);
    } catch (e) {
      console.error("Erro ao deletar arquivo de áudio temporário:", e);
    }

    if (!transcribedText || transcribedText.trim() === '') {
      socket.emit('bot_typing', false);
      socket.emit('bot_response', { text: "Não consegui entender o áudio. Por favor, tente gravar novamente." });
      return;
    }

    if (data.id) {
      socket.emit('audio_transcribed', { id: data.id, text: transcribedText });
    }

    const chatData = {
      message: transcribedText,
      user: user,
      isInitial: false
    };

    await handleChatMessage(socket, chatData, io);

  } catch (error) {
    console.error("Erro ao processar áudio:", error);
    socket.emit('bot_typing', false);
    socket.emit('bot_response', { text: "Ocorreu um erro ao processar seu áudio. Por favor, tente enviar por texto." });
  }
}

module.exports = {
  handleChatMessage,
  handleAudioMessage
};
