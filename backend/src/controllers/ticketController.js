const supabase = require('../config/supabase');
const webhookService = require('../services/webhookService');

async function getTickets(req, res) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
}

async function getUserTickets(req, res) {
  const { phone } = req.params;
  const decodedPhone = decodeURIComponent(phone);

  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_phone', decodedPhone)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
}

async function updateTicketStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: error.message });

  if (data && data.length > 0) {
    await webhookService.notifyStatusChange(data[0]);
  }

  return res.json(data[0]);
}

async function updateTicketPriority(req, res) {
  const { id } = req.params;
  const { priority } = req.body;

  const { data, error } = await supabase
    .from('tickets')
    .update({ priority })
    .eq('id', id)
    .select();

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data[0]);
}

module.exports = {
  getTickets,
  getUserTickets,
  updateTicketStatus,
  updateTicketPriority
};
