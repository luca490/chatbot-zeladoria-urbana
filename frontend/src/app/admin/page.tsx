"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Ticket as TicketIcon, LogOut, Activity, Clock, CheckCircle, Download, AlertTriangle, ArrowLeft, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { DiademaFlag } from "@/components/ui/DiademaFlag";
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
  const router = useRouter();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const currentAttr = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
      if (currentAttr) {
        setTheme(currentAttr);
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };
  
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

  // Atualiza estados locais e abre o modal de detalhes do chamado selecionado
  const openTicketModal = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowAllReports(false);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority || "Baixa");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(false);

    setTimeout(() => {
      if (password === "admin123") {
        setIsAuthenticated(true);
      } else {
        setLoginError(true);
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
      setIsLoggingIn(false);
    }, 800);
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
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Chamados_Zeladoria_Diadema_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredTickets = tickets.filter(t => {
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
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Critério de desempate por ordem cronológica decrescente
    }
    return 0;
  });

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.4 }
    },
    idle: { x: 0 }
  };

  const dashboardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const dashboardItemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const stats = {
    total: tickets.length,
    aberto: tickets.filter(t => t.status === "Aberto").length,
    emAndamento: tickets.filter(t => t.status === "Em andamento").length,
    resolvido: tickets.filter(t => t.status === "Resolvido").length,
  };

  const handleGoBackHome = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.push("/");
    }, 350);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Tem certeza que deseja sair?");
    if (!confirmLogout) return;

    setIsExiting(true);
    setTimeout(() => {
      setIsAuthenticated(false);
      setPassword("");
      setIsExiting(false);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden flex flex-col justify-between select-none">
      <motion.div
        animate={isExiting ? { opacity: 0, y: -15, filter: "blur(8px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col justify-between w-full h-full"
      >
        <div className="flex-1 w-full relative z-10 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="flex-1 flex items-center justify-center p-4 relative"
              >
                <div className="absolute top-4 right-4 z-50">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] hover:bg-[var(--color-border)]/20 transition-all flex items-center justify-center cursor-pointer shadow-md"
                    title={theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
                    aria-label="Alternar tema"
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4 text-[var(--color-foreground)]" /> : <Moon className="w-4 h-4 text-[var(--color-foreground)]" />}
                  </button>
                </div>

                <motion.form 
                  onSubmit={handleLogin} 
                  variants={shakeVariants}
                  animate={shakeError ? "shake" : "idle"}
                  className={cn(
                    "bg-[var(--color-surface)] border rounded-xl p-8 w-full max-w-md shadow-lg space-y-6 transition-all duration-300",
                    shakeError ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "border-[var(--color-border)]"
                  )}
                >
                  <div className="flex flex-col items-center gap-3">
                    <DiademaFlag className="w-12 h-8" />
                    <h1 className="text-2xl font-display font-bold text-[var(--color-foreground)] text-center">Acesso Restrito</h1>
                  </div>
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
                      {loginError && <p className="text-red-500 text-sm mt-3 text-center animate-pulse">Senha incorreta.</p>}
                    </div>
                  </div>

                  <Button type="submit" className="w-full py-3 flex items-center justify-center gap-2" disabled={isLoggingIn}>
                    {isLoggingIn ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </>
                    ) : (
                      "Entrar no Painel"
                    )}
                  </Button>
                  
                  <div className="relative flex items-center my-2">
                    <div className="flex-grow border-t border-[var(--color-border)]"></div>
                    <span className="flex-shrink mx-3 text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-wider">ou</span>
                    <div className="flex-grow border-t border-[var(--color-border)]"></div>
                  </div>

                  <a
                    href="/"
                    onClick={handleGoBackHome}
                    className="w-full py-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-border)]/20 rounded-xl text-center font-display text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para a Home
                  </a>
                </motion.form>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                variants={dashboardContainerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.98, y: -20 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8"
              >
                <motion.div variants={dashboardItemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <DiademaFlag className="w-12 h-8" />
                    <div>
                      <h1 className="text-4xl font-display font-bold text-[var(--color-foreground)]">Zeladoria Diadema</h1>
                      <p className="text-[var(--color-muted)]">Acompanhe e gerencie os chamados em tempo real.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto items-center">
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] hover:bg-[var(--color-border)]/20 transition-all flex items-center justify-center cursor-pointer shadow-md mr-2"
                      title={theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
                      aria-label="Alternar tema"
                    >
                      {theme === "dark" ? <Sun className="w-4 h-4 text-[var(--color-foreground)]" /> : <Moon className="w-4 h-4 text-[var(--color-foreground)]" />}
                    </button>
                    <Button 
                      onClick={exportToExcel}
                      className="bg-[#107C41]/20 text-[#107C41] hover:bg-[#107C41]/30 border border-[#107C41]/30"
                    >
                      <Download className="w-5 h-5 mr-2" /> Exportar para Excel
                    </Button>
                    <Button 
                      variant="danger"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-5 h-5 mr-2" /> Sair
                    </Button>
                  </div>
                </motion.div>

                <motion.div variants={dashboardItemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.button 
                    onClick={() => setFilterStatus("Todos")} 
                    whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.98 }}
                    className="text-left bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-foreground)]/40 transition-all p-4 rounded-xl flex items-center gap-4 group cursor-pointer w-full"
                  >
                    <div className="p-3 bg-black/5 dark:bg-white/5 border border-[var(--color-border)] text-[var(--color-foreground)] group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors rounded-lg">
                      <TicketIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[var(--color-muted)] text-sm font-medium">Total</p>
                      <p className="text-2xl font-bold text-[var(--color-foreground)]">{stats.total}</p>
                    </div>
                  </motion.button>
                  <motion.button 
                    onClick={() => setFilterStatus("Aberto")} 
                    whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(239,68,68,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    className="text-left bg-[var(--color-surface)] border border-red-500/30 hover:border-red-500/60 transition-all p-4 rounded-xl flex items-center gap-4 group cursor-pointer w-full"
                  >
                    <div className="p-3 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500/20 transition-colors">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-red-500/80 text-sm font-medium">Abertos</p>
                      <p className="text-2xl font-bold text-[var(--color-foreground)]">{stats.aberto}</p>
                    </div>
                  </motion.button>
                  <motion.button 
                    onClick={() => setFilterStatus("Em andamento")} 
                    whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(234,179,8,0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    className="text-left bg-[var(--color-surface)] border border-yellow-500/30 hover:border-yellow-500/60 transition-all p-4 rounded-xl flex items-center gap-4 group cursor-pointer w-full"
                  >
                    <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-yellow-500/80 text-sm font-medium">Em Andamento</p>
                      <p className="text-2xl font-bold text-[var(--color-foreground)]">{stats.emAndamento}</p>
                    </div>
                  </motion.button>
                  <motion.button 
                    onClick={() => setFilterStatus("Resolvido")} 
                    whileHover={{ scale: 1.03, boxShadow: "0 0 20px oklch(0.85 0.15 150 / 0.2)" }}
                    whileTap={{ scale: 0.98 }}
                    className="text-left bg-[var(--color-surface)] border border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]/60 transition-all p-4 rounded-xl flex items-center gap-4 group cursor-pointer w-full"
                  >
                    <div className="p-3 bg-[var(--color-accent)]/10 rounded-lg text-[var(--color-accent)] group-hover:bg-[var(--color-accent)]/20 transition-colors">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[var(--color-accent)]/80 text-sm font-medium">Resolvidos</p>
                      <p className="text-2xl font-bold text-[var(--color-foreground)]">{stats.resolvido}</p>
                    </div>
                  </motion.button>
                </motion.div>
                
                <motion.div variants={dashboardItemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative w-full md:w-96">
                    <Input 
                      icon={<Search className="w-5 h-5" />}
                      type="text" 
                      placeholder="Buscar por protocolo, nome ou relato..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex bg-black/5 dark:bg-black/40 border border-[var(--color-border)] rounded-lg p-1 overflow-x-auto w-full md:w-auto">
                    {["Todos", "Aberto", "Em andamento", "Resolvido"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex-1 md:flex-none",
                          filterStatus === status 
                            ? "bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm border border-[var(--color-border)]" 
                            : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-border)]/20"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-black/5 dark:bg-black/50 border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] cursor-pointer text-sm font-medium"
                  >
                    <option value="recentes">Mais Recentes</option>
                    <option value="antigos">Mais Antigos</option>
                    <option value="prioridade">Maior Prioridade</option>
                  </select>
                </motion.div>

                {loading ? (
                  <div className="flex items-center justify-center py-20 text-[var(--color-muted)]">
                    Carregando chamados...
                  </div>
                ) : (
                  <motion.div variants={dashboardItemVariants} layout className="grid gap-8">
                    {filteredTickets.filter(t => t.priority === 'Urgente' && t.status !== 'Resolvido').length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg font-bold">
                          <AlertTriangle className="w-5 h-5 animate-pulse" />
                          ATENÇÃO: CHAMADOS URGENTES REQUEREM AÇÃO IMEDIATA
                        </div>
                        <motion.div layout className="grid gap-4">
                          <AnimatePresence mode="popLayout">
                            {filteredTickets.filter(t => t.priority === 'Urgente' && t.status !== 'Resolvido').map((ticket) => (
                              <TicketCard 
                                key={ticket.id} 
                                ticket={ticket} 
                                onClick={openTicketModal} 
                                isUrgent={true} 
                              />
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {filteredTickets.filter(t => t.priority === 'Urgente' && t.status !== 'Resolvido').length > 0 && (
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-muted)]">Outros Chamados</h3>
                      )}
                      <motion.div layout className="grid gap-4">
                        <AnimatePresence mode="popLayout">
                          {filteredTickets.filter(t => t.priority !== 'Urgente' || t.status === 'Resolvido').map((ticket) => (
                            <TicketCard 
                              key={ticket.id} 
                              ticket={ticket} 
                              onClick={openTicketModal} 
                            />
                          ))}
                        </AnimatePresence>
                        
                        {filteredTickets.length === 0 && (
                          <motion.div layout className="text-[var(--color-muted)] text-center py-16 border border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-border)]/20">
                            {searchTerm 
                              ? `Nenhum chamado encontrado para a busca "${searchTerm}".`
                              : `Nenhum chamado encontrado com o filtro "${filterStatus}".`
                            }
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

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
            className={`fixed bottom-8 right-8 z-[60] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 font-medium text-white max-w-md bg-[var(--color-surface)] border-[var(--color-accent)]/50`}
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
            <p className="leading-relaxed">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
