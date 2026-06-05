import { useState, useCallback } from 'react';
import { Ticket } from '@/components/Admin/TicketCard';

export function useTickets(phone?: string) {
  // Estado para gerenciar a lista de chamados e status de carregamento
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(() => {
    setLoading(true);
    const url = phone 
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/tickets/user/${encodeURIComponent(phone)}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/tickets`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setTickets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar chamados:", err);
        setLoading(false);
      });
  }, [phone]);

  return { tickets, setTickets, loading, fetchTickets };
}
