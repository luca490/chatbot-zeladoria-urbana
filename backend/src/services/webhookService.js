async function notifyStatusChange(ticket) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log("Aviso: N8N_WEBHOOK_URL não configurada. Simulando webhook para log. Chamado:", ticket.protocol, ticket.status);
    return;
  }
  
  const recipients = [
    { name: ticket.user_name, phone: ticket.user_phone }
  ];

  if (ticket.description) {
    const regex = /--- Relato Adicional de (.*?) \((.*?)\) ---/g;
    let match;
    while ((match = regex.exec(ticket.description)) !== null) {
      const name = match[1].trim();
      const phone = match[2].trim();
      
      if (!recipients.some(r => r.phone === phone)) {
        recipients.push({ name, phone });
      }
    }
  }

  try {
    for (const recipient of recipients) {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'status_changed',
          protocol: ticket.protocol,
          name: recipient.name,
          phone: recipient.phone,
          new_status: ticket.status,
          description: ticket.description,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log(`[n8n] Notificação enviada -> Protocolo: ${ticket.protocol} | Cidadão: ${recipient.name}`);
      } else {
        console.error(`[n8n] Erro na resposta para ${recipient.name}:`, response.statusText);
      }
    }
  } catch (error) {
    console.error("[n8n] Falha ao se conectar com o webhook:", error.message);
  }
}

module.exports = {
  notifyStatusChange
};
