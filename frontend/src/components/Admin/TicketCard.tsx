import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBriefDescription, getStatusColor, getPriorityColor } from '@/lib/ticketUtils';
import { Badge } from '@/components/ui/Badge';

export type Ticket = {
  id: string;
  protocol: string;
  user_name: string;
  user_phone: string;
  description: string;
  status: string;
  image_url: string | null;
  created_at: string;
  priority?: string;
  report_count?: number;
};

interface TicketCardProps {
  ticket: Ticket;
  onClick: (ticket: Ticket) => void;
  isUrgent?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick, isUrgent = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      onClick={() => onClick(ticket)}
      className={cn(
        "border rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all cursor-pointer group",
        isUrgent
          ? "bg-red-500/5 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] border-2"
          : "bg-[var(--color-surface)] border-[var(--color-border)] shadow-md hover:border-[var(--color-accent)]/50"
      )}
    >
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm font-bold font-display text-[var(--color-foreground)] tracking-widest uppercase">
            #{ticket.protocol}
          </span>
          
          <Badge variantClasses={getStatusColor(ticket.status)}>
            {ticket.status}
          </Badge>
          
          <Badge 
            icon={<AlertTriangle className="w-3 h-3" />} 
            variantClasses={getPriorityColor(ticket.priority || "Baixa")}
          >
            {ticket.priority || "Baixa"}
          </Badge>
          
          {(ticket.report_count && ticket.report_count > 1) ? (
            <Badge 
              icon={<Users className="w-3 h-3" />}
              variantClasses="bg-purple-500/10 text-purple-400 border-purple-500/20"
            >
              {ticket.report_count} Relatos
            </Badge>
          ) : null}

          <span className="text-xs text-[var(--color-muted)] hidden md:block ml-auto">
            {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
          </span>
        </div>
        
        <p className="text-[var(--color-foreground)]/90 text-sm md:text-base leading-relaxed line-clamp-2 break-words">
          {getBriefDescription(ticket.description)}
        </p>
        
        <p className="text-[var(--color-muted)] text-sm truncate">
          Reportado por <strong className="text-[var(--color-foreground)]/70">{ticket.user_name}</strong>
          {ticket.report_count && ticket.report_count > 1 ? (
            <span> e mais {ticket.report_count - 1} pessoa{ticket.report_count - 1 > 1 ? 's' : ''}</span>
          ) : null}
        </p>
      </div>


      <div className={cn(
        "font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
        isUrgent ? "text-red-400" : "text-[var(--color-accent)] font-medium"
      )}>
        {isUrgent ? "Atender Agora →" : "Ver detalhes →"}
      </div>
    </motion.div>
  );
};
