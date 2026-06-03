"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Ticket as TicketIcon, LogOut, Activity, Clock, CheckCircle, Download, AlertTriangle } from "lucide-react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

import { cn } from "@/lib/utils";
import { getPriorityWeight } from "@/lib/ticketUtils";
import { useSocket } from "@/hooks/useSocket";
import { useTickets } from "@/hooks/useTickets";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TicketCard, Ticket } from "@/components/Admin/TicketCard";
import { TicketModal } from "@/components/Admin/TicketModal";

export default function AdminDashboard() {
  const { tickets, setTickets, loading, fetchTickets } = useTickets();
  const socket = useSocket(true);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  
  const [filterStatus, setFilterStatus] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("recentes");
  
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showAllReports, setShowAllReports] = useState(false);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editPriority, setEditPriority] = useState<string>("");

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Abre o modal de detalhes do chamado
  const openTicketModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowAllReports(false);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority || "Baixa");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
    } else {
      setLoginError(true);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    if (!socket) return;

    socket.on("new_ticket", (ticket: Ticket) => {
      setTickets(prev => [ticket, ...prev]);
    });

    socket.on("update_ticket", (updatedTicket: Ticket) => {
      setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    });

    socket.on("delete_ticket", (ticketId: string) => {
      setTickets(prev => prev.filter(t => t.id !== ticketId));
    });

    return () => {
      socket.off("new_ticket");
      socket.off("update_ticket");
      socket.off("delete_ticket");
    };
  }, [socket, setTickets]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/tickets/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const updatePriority = async (id: string, newPriority: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"}/api/tickets/${id}/priority`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority })
      });
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, priority: newPriority } : t));
      }
    } catch (err) {
      console.error("Erro ao atualizar prioridade:", err);
    }
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Chamados Diadema');

    worksheet.columns = [
      { header: 'Protocolo', key: 'protocol', width: 15 },
      { header: 'Nome do Cidadão', key: 'name', width: 25 },
      { header: 'Telefone', key: 'phone', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Prioridade', key: 'priority', width: 15 },
      { header: 'Nº de Relatos', key: 'report_count', width: 15 },
      { header: 'Resumo por IA', key: 'ai_summary', width: 60 },
      { header: 'Relatos Originais', key: 'original_reports', width: 80 },
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Hora', key: 'time', width: 15 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D1117' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    
    let rowIndex = 2;
    filteredTickets.forEach((t) => {
      const match = t.description.match(/\[RESUMO_IA\]([\s\S]*?)\[\/RESUMO_IA\]/);
      const aiSummary = match ? match[1].trim() : "Sem resumo";
      const cleanDescription = t.description.replace(/\[RESUMO_IA\][\s\S]*?\[\/RESUMO_IA\]\n?\n?/, "");
      
      const dateObj = new Date(t.created_at);

      worksheet.addRow({
        protocol: t.protocol,
        name: t.user_name,
        phone: t.user_phone,
        status: t.status,
        priority: t.priority || "Baixa",
        report_count: t.report_count || 1,
        ai_summary: aiSummary,
        original_reports: cleanDescription.replace(/--- Relato Adicional de /g, '\n--- Relato Adicional de '),
        date: dateObj.toLocaleDateString('pt-BR'),
        time: dateObj.toLocaleTimeString('pt-BR')
      });
      rowIndex++;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Chamados_Zeladoria_Diadema_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 w-full max-w-md shadow-lg space-y-6">
          <h1 className="text-2xl font-display font-bold text-white text-center">Acesso Restrito</h1>
          <p className="text-center text-[var(--color-muted)] text-sm mb-6">Por favor, insira a senha para continuar.</p>
          
          <div className="space-y-4">
            <div>
              <Input
                type="password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                placeholder="Digite a sua senha..."
                autoFocus
                className="text-center tracking-widest text-lg placeholder:text-sm placeholder:tracking-normal"
              />
              {loginError && <p className="text-red-500 text-sm mt-3 text-center">Senha incorreta.</p>}
            </div>
          </div>

          <Button type="submit" className="w-full py-3">
            Entrar no Painel
          </Button>
        </form>
      </div>
    );
  }

  let filteredTickets = tickets.filter(t => {
    const matchesStatus = filterStatus === "Todos" || t.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      t.protocol.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  filteredTickets.sort((a, b) => {
    if (sortOrder === "recentes") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === "antigos") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === "prioridade") {
      const pDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      if (pDiff !== 0) return pDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Desempate
    }
    return 0;
  });

  const stats = {
    total: tickets.length,
    aberto: tickets.filter(t => t.status === "Aberto").length,
    emAndamento: tickets.filter(t => t.status === "Em andamento").length,
    resolvido: tickets.filter(t => t.status === "Resolvido").length,
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-white">Zeladoria Diadema</h1>
            <p className="text-[var(--color-muted)]">Acompanhe e gerencie os chamados em tempo real.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              onClick={exportToExcel}
              className="bg-[#107C41]/20 text-[#107C41] hover:bg-[#107C41]/30 border border-[#107C41]/30"
            >
              <Download className="w-5 h-5 mr-2" /> Exportar para Excel
            </Button>
            <Button 
              variant="danger"
              onClick={() => { setIsAuthenticated(false); setPassword(""); }}
            >
              <LogOut className="w-5 h-5 mr-2" /> Sair
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => setFilterStatus("Todos")} className="text-left bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-white/20 transition-colors p-4 rounded-xl flex items-center gap-4 group cursor-pointer">
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-white group-hover:bg-white/10 transition-colors">
              <TicketIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[var(--color-muted)] text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </button>
          <button onClick={() => setFilterStatus("Aberto")} className="text-left bg-[var(--color-surface)] border border-red-500/30 hover:border-red-500/50 transition-colors p-4 rounded-xl flex items-center gap-4 group cursor-pointer">
            <div className="p-3 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500/20 transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-red-500/80 text-sm font-medium">Abertos</p>
              <p className="text-2xl font-bold text-white">{stats.aberto}</p>
            </div>
          </button>
          <button onClick={() => setFilterStatus("Em andamento")} className="text-left bg-[var(--color-surface)] border border-yellow-500/30 hover:border-yellow-500/50 transition-colors p-4 rounded-xl flex items-center gap-4 group cursor-pointer">
            <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-yellow-500/80 text-sm font-medium">Em Andamento</p>
              <p className="text-2xl font-bold text-white">{stats.emAndamento}</p>
            </div>
          </button>
          <button onClick={() => setFilterStatus("Resolvido")} className="text-left bg-[var(--color-surface)] border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/50 transition-colors p-4 rounded-xl flex items-center gap-4 group cursor-pointer">
            <div className="p-3 bg-[var(--color-accent)]/10 rounded-lg text-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/20 transition-colors">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[var(--color-accent)]/80 text-sm font-medium">Resolvidos</p>
              <p className="text-2xl font-bold text-white">{stats.resolvido}</p>
            </div>
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Input 
              icon={<Search className="w-5 h-5" />}
              type="text" 
              placeholder="Buscar por protocolo, nome ou relato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-black/40 border border-[var(--color-border)] rounded-lg p-1 overflow-x-auto w-full md:w-auto">
            {["Todos", "Aberto", "Em andamento", "Resolvido"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex-1 md:flex-none",
                  filterStatus === status 
                    ? "bg-[var(--color-surface)] text-white shadow-sm border border-[var(--color-border)]" 
                    : "text-[var(--color-muted)] hover:text-white hover:bg-white/5"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-black/50 border border-[var(--color-border)] text-[var(--color-muted)] hover:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer text-sm font-medium"
          >
            <option value="recentes">Mais Recentes</option>
            <option value="antigos">Mais Antigos</option>
            <option value="prioridade">Maior Prioridade</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[var(--color-muted)]">
            Carregando chamados...
          </div>
        ) : (
          <div className="grid gap-8">
            
            {filteredTickets.filter(t => t.priority === 'Urgente' && t.status !== 'Resolvido').length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg font-bold">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                  ATENÇÃO: CHAMADOS URGENTES REQUEREM AÇÃO IMEDIATA
                </div>
                <div className="grid gap-4">
                  <AnimatePresence>
                    {filteredTickets.filter(t => t.priority === 'Urgente' && t.status !== 'Resolvido').map((ticket) => (
                      <TicketCard 
                        key={ticket.id} 
                        ticket={ticket} 
                        onClick={openTicketModal} 
                        isUrgent={true} 
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              <AnimatePresence>
                {filteredTickets.filter(t => t.priority !== 'Urgente' || t.status === 'Resolvido').map((ticket) => (
                  <TicketCard 
                    key={ticket.id} 
                    ticket={ticket} 
                    onClick={openTicketModal} 
                  />
                ))}
              </AnimatePresence>
              
              {filteredTickets.length === 0 && (
                <div className="text-[var(--color-muted)] text-center py-16 border border-dashed border-[var(--color-border)] rounded-xl bg-black/10">
                  {searchTerm 
                    ? `Nenhum chamado encontrado para a busca "${searchTerm}".`
                    : `Nenhum chamado encontrado com o filtro "${filterStatus}".`
                  }
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <TicketModal 
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            showAllReports={showAllReports}
            setShowAllReports={setShowAllReports}
            editStatus={editStatus}
            setEditStatus={setEditStatus}
            editPriority={editPriority}
            setEditPriority={setEditPriority}
            onSave={() => {
              const statusChanged = editStatus !== selectedTicket.status;
              const priorityChanged = editPriority !== (selectedTicket.priority || "Baixa");
              
              if (statusChanged) updateStatus(selectedTicket.id, editStatus);
              if (priorityChanged) updatePriority(selectedTicket.id, editPriority);
              
              if (statusChanged) {
                showToast(`Status do chamado #${selectedTicket.protocol} mudou para ${editStatus}.`);
              } else if (priorityChanged) {
                showToast(`Prioridade do chamado #${selectedTicket.protocol} mudou para ${editPriority}.`);
              }

              setSelectedTicket(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-[60] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 font-medium text-white max-w-md ${
              toast.type === 'success' ? 'bg-[var(--color-surface)] border-[var(--color-accent)]/50' : 'bg-red-900 border-red-500/50'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            )}
            <p className="leading-relaxed">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
