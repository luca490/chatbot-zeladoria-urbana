import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Filter, AlertTriangle, Users, Ticket as TicketIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStatusColor, getPriorityColor } from '@/lib/ticketUtils';
import { Ticket } from './TicketCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface TicketModalProps {
  ticket: Ticket;
  onClose: () => void;
  showAllReports: boolean;
  setShowAllReports: (show: boolean) => void;
  editStatus: string;
  setEditStatus: (status: string) => void;
  editPriority: string;
  setEditPriority: (priority: string) => void;
  onSave: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  ticket,
  onClose,
  showAllReports,
  setShowAllReports,
  editStatus,
  setEditStatus,
  editPriority,
  setEditPriority,
  onSave
}) => {
  
  // Lógica para separar o resumo da IA e os relatos individuais
  const match = ticket.description.match(/\[RESUMO_IA\]([\s\S]*?)\[\/RESUMO_IA\]/);
  const aiSummary = match ? match[1].trim() : null;
  const cleanDescription = ticket.description.replace(/\[RESUMO_IA\][\s\S]*?\[\/RESUMO_IA\]\n?\n?/, "");

  const parts = cleanDescription.split('\n\n--- Relato Adicional de ');
  const firstReport = parts[0];
  const additionalReports = parts.slice(1).map(p => '--- Relato Adicional de ' + p);
  const allReports = [firstReport, ...additionalReports];
  const reportsToShow = showAllReports ? allReports : allReports.slice(0, 3);

  const statusChanged = editStatus !== ticket.status;
  const priorityChanged = editPriority !== (ticket.priority || "Baixa");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Header do Modal */}
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between sticky top-0 bg-[var(--color-surface)] rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <TicketIcon className="text-[var(--color-accent)] w-6 h-6" />
              Chamado #{ticket.protocol}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-black/20 hover:bg-white/10 rounded-full transition-colors text-[var(--color-muted)] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/20 rounded-xl p-4 border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1 font-semibold flex items-center gap-1"><Calendar className="w-3 h-3"/> Abertura</p>
              <p className="text-white text-sm">{new Date(ticket.created_at).toLocaleString('pt-BR')}</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1 font-semibold flex items-center gap-1"><Filter className="w-3 h-3"/> Status</p>
              <Badge variantClasses={cn(getStatusColor(ticket.status), "mt-1")}>
                {ticket.status}
              </Badge>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1 font-semibold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Prioridade</p>
              <Badge variantClasses={cn(getPriorityColor(ticket.priority || "Baixa"), "mt-1")}>
                {ticket.priority || "Baixa"}
              </Badge>
            </div>
            <div className="bg-black/20 rounded-xl p-4 border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1 font-semibold flex items-center gap-1"><Users className="w-3 h-3"/> Ocorrências</p>
              <p className="text-white font-bold mt-1 text-lg">{ticket.report_count || 1}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2 border-b border-[var(--color-border)] pb-2">Relatos e Histórico</h3>
            <div className="space-y-4">
              {aiSummary && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5 mb-2 shadow-[0_0_15px_rgba(168,85,247,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <h4 className="text-purple-400 font-bold mb-2 flex items-center gap-2">
                    <span className="text-lg">✨</span> Resumo por IA
                  </h4>
                  <p className="text-purple-100/90 leading-relaxed font-medium relative z-10">{aiSummary}</p>
                </div>
              )}

              <div className="space-y-3">
                {reportsToShow.map((report, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-5 border border-white/5">
                    {idx === 0 && allReports.length > 1 && (
                      <div className="text-xs text-[var(--color-muted)] mb-2 font-bold uppercase tracking-wider">Relato Original</div>
                    )}
                    <p className="text-white/90 leading-relaxed whitespace-pre-wrap font-medium">{report}</p>
                  </div>
                ))}
                
                {allReports.length > 3 && !showAllReports && (
                  <button 
                    onClick={() => setShowAllReports(true)}
                    className="text-xs text-[var(--color-accent)] font-semibold mt-3 hover:bg-[var(--color-accent)]/20 transition-colors rounded-xl w-full text-center py-3 border border-[var(--color-accent)]/20 cursor-pointer flex items-center justify-center gap-1"
                  >
                    Ver mais {allReports.length - 3} relato{allReports.length - 3 > 1 ? 's' : ''}...
                  </button>
                )}
                
                {showAllReports && allReports.length > 3 && (
                  <button 
                    onClick={() => setShowAllReports(false)}
                    className="text-xs text-white/50 font-semibold mt-3 hover:bg-white/10 transition-colors rounded-xl w-full text-center py-3 border border-white/10 cursor-pointer flex items-center justify-center gap-1"
                  >
                    Ocultar relatos
                  </button>
                )}
              </div>
            </div>
          </div>

          {ticket.image_url && (
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Anexo</h3>
              <img src={ticket.image_url} alt="Anexo do chamado" className="rounded-xl border border-[var(--color-border)] max-w-full h-auto max-h-64 object-contain bg-black/40" />
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold text-white mb-2 border-b border-[var(--color-border)] pb-2">Dados de Contato</h3>
            <div className="flex gap-4">
              <div className="bg-black/20 rounded-xl p-4 border border-[var(--color-border)] flex-1">
                <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1 font-semibold">Nome</p>
                <p className="text-white">{ticket.user_name}</p>
              </div>
              <div className="bg-black/20 rounded-xl p-4 border border-[var(--color-border)] flex-1">
                <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider mb-1 font-semibold">Telefone / WhatsApp</p>
                <p className="text-white">{ticket.user_phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal com Gestão */}
        <div className="p-6 border-t border-[var(--color-border)] bg-black/20 rounded-b-2xl">
          <label className="block text-sm font-semibold text-white mb-2">Gestão do Chamado</label>
          <div className="flex gap-4">
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer font-medium"
            >
              <option value="Aberto">🔴 Status: Aberto</option>
              <option value="Em andamento">🟡 Status: Em andamento</option>
              <option value="Resolvido">🟢 Status: Resolvido</option>
            </select>

            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer font-medium"
            >
              <option value="Baixa">Prioridade: Baixa</option>
              <option value="Média">Prioridade: Média</option>
              <option value="Alta">Prioridade: Alta</option>
              <option value="Urgente">Prioridade: Urgente</option>
            </select>
          </div>
          
          {(statusChanged || priorityChanged) && (
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={onSave}>
                Salvar Alterações
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {
                  setEditStatus(ticket.status);
                  setEditPriority(ticket.priority || "Baixa");
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
          
          <p className="text-xs text-[var(--color-muted)] mt-3">
            * Alterar o status aqui disparará uma notificação automática para o WhatsApp do cidadão via n8n.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
