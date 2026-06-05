"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, ArrowUpRight, Wrench, Lightbulb, Droplet, Trash2, AlertTriangle, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import ChatbotWidget from "@/components/Chatbot/ChatbotWidget";
import { DiademaFlag } from "@/components/ui/DiademaFlag";
import { cn } from "@/lib/utils";

const ChatbotLogo = ({ eyeOffset }: { eyeOffset: { x: number; y: number } }) => {
  // Fator de deslocamento das pupilas para animação do olhar seguindo o cursor
  const pupilX = eyeOffset.x * 5;
  const pupilY = eyeOffset.y * 5;

  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto mb-2 sm:mb-4 flex items-center justify-center z-10 select-none shrink-0">
      {/* Elemento de iluminação traseira (glow effect) */}
      <div className="absolute w-28 h-28 sm:w-34 sm:h-34 bg-[var(--color-accent)]/10 rounded-full blur-xl pointer-events-none"></div>

      {/* Anéis ornamentais rotativos com animações infinitas */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border border-dashed border-[var(--color-accent)]/20 rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 sm:inset-3 border border-dotted border-black/10 dark:border-white/10 rounded-full pointer-events-none"
      />

      {/* Ícones flutuantes indicando as categorias de atendimento */}
      <motion.div
        className="absolute top-1 left-4 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]"
        animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.25 }}
      >
        <div className="bg-white/90 dark:bg-black/90 border border-orange-500/20 dark:border-orange-500/30 p-1.5 sm:p-2 rounded-full flex items-center justify-center shadow-lg transition-colors hover:border-orange-500/80 cursor-default" title="Vias e Buracos">
          <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
        </div>
      </motion.div>

      <motion.div
        className="absolute -top-3 left-1/2 -translate-x-1/2 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        whileHover={{ scale: 1.25 }}
      >
        <div className="bg-white/90 dark:bg-black/90 border border-yellow-500/20 dark:border-yellow-500/30 p-1.5 sm:p-2 rounded-full flex items-center justify-center shadow-lg transition-colors hover:border-yellow-500/80 cursor-default" title="Iluminação Pública">
          <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-1 right-4 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]"
        animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        whileHover={{ scale: 1.25 }}
      >
        <div className="bg-white/90 dark:bg-black/90 border border-blue-500/20 dark:border-blue-500/30 p-1.5 sm:p-2 rounded-full flex items-center justify-center shadow-lg transition-colors hover:border-blue-500/80 cursor-default" title="Água e Vazamentos">
          <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-16 -left-4 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        animate={{ y: [0, -4, 0], scale: [1, 1.03, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        whileHover={{ scale: 1.25 }}
      >
        <div className="bg-white/90 dark:bg-black/90 border border-emerald-500/20 dark:border-emerald-500/30 p-1.5 sm:p-2 rounded-full flex items-center justify-center shadow-lg transition-colors hover:border-emerald-500/80 cursor-default" title="Descarte e Lixo">
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-16 -right-4 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
        animate={{ y: [0, -7, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        whileHover={{ scale: 1.25 }}
      >
        <div className="bg-white/90 dark:bg-black/90 border border-[var(--color-accent)]/20 dark:border-[var(--color-accent)]/30 p-1.5 sm:p-2 rounded-full flex items-center justify-center shadow-lg transition-colors hover:border-[var(--color-accent)]/80 cursor-default" title="Outras Ocorrências">
          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-accent)]" />
        </div>
      </motion.div>

      {/* Cabeça e máscara do robô com efeitos de refração */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-black/5 dark:from-black/80 to-white/30 dark:to-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full p-3 sm:p-4 flex flex-col items-center justify-center shadow-2xl overflow-hidden"
      >
        {/* Gradiente decorativo superior */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 dark:from-white/5 to-transparent -skew-y-12"></div>

        {/* Elemento simulando headset decorativo */}
        <div className="absolute -inset-1 border-t-4 border-l-4 border-r-4 border-[var(--color-accent)]/30 rounded-full rotate-45 pointer-events-none"></div>

        {/* Olhos com máscara de corte para movimentação da pupila */}
        <div className="flex gap-3 sm:gap-4 mb-2 sm:mb-3 relative z-10">
          {/* Olho esquerdo */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/5 dark:bg-black/60 border border-[var(--color-accent)]/20 dark:border-[var(--color-accent)]/30 flex items-center justify-center relative overflow-hidden">
            <motion.div
              style={{ x: pupilX, y: pupilY }}
              className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent)]"
            />
          </div>
          {/* Olho direito */}
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/5 dark:bg-black/60 border border-[var(--color-accent)]/20 dark:border-[var(--color-accent)]/30 flex items-center justify-center relative overflow-hidden">
            <motion.div
              style={{ x: pupilX, y: pupilY }}
              className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_12px_var(--color-accent)]"
            />
          </div>
        </div>

        {/* SVG vetorial simulando boca */}
        <svg className="w-7 h-2 sm:w-8 sm:h-3 text-[var(--color-accent)] filter drop-shadow-[0_0_4px_var(--color-accent)]" viewBox="0 0 100 30" fill="none">
          <path d="M10,10 Q50,32 90,10" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<"landing" | "chat">("landing");
  const [isExiting, setIsExiting] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Recuperação do tema armazenado no localStorage ou detecção do atributo data-theme
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Mapeamento normalizado (-1 a 1) do ponteiro do mouse para interação visual do avatar
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setEyeOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleNavigateToAdmin = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.push("/admin");
    }, 350);
  };

  return (
    <main className="h-screen w-screen max-h-screen overflow-hidden bg-transparent relative flex flex-col justify-between select-none">
      <motion.div
        animate={isExiting ? { opacity: 0, y: -15, filter: "blur(8px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col justify-between w-full h-full"
      >
        {/* Cabeçalho superior global */}
        <header className="container mx-auto px-6 py-4 flex justify-between items-center relative z-30 shrink-0">
          <div 
            onClick={() => {
              if (view === "chat") {
                const confirmBack = window.confirm("Essa ação fará você voltar para a tela inicial. Tem certeza que você deseja isso?");
                if (confirmBack) {
                  setView("landing");
                }
              }
            }}
            className={cn("flex items-center gap-3", view === "chat" && "cursor-pointer hover:opacity-80 transition-opacity")}
            title={view === "chat" ? "Voltar ao início" : undefined}
          >
            <DiademaFlag className="w-9 h-6" />
            <span className="text-sm font-display font-bold text-[var(--color-foreground)] tracking-wide">
              Zeladoria Diadema
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Alternador de tema dinâmico (modo escuro / modo claro) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] hover:bg-[var(--color-border)]/20 transition-all flex items-center justify-center cursor-pointer"
              title={theme === "dark" ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
              aria-label="Alternar tema"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[var(--color-foreground)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--color-foreground)]" />
              )}
            </button>

            {view === "landing" && (
              <a
                href="/admin"
                onClick={handleNavigateToAdmin}
                className="text-xs font-semibold text-[var(--color-foreground)]/80 hover:text-[var(--color-foreground)] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl px-4 py-2 flex items-center gap-2"
              >
                Painel Admin
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </header>

        {/* Contêiner principal com transição de layout compartilhada */}
        <div className="flex-1 w-full max-w-6xl mx-auto px-6 py-4 relative z-10 grid grid-cols-1 grid-rows-1 items-center justify-center overflow-visible">
          <AnimatePresence>
            {view === "landing" ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="col-start-1 row-start-1 w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6"
              >
                <ChatbotLogo eyeOffset={eyeOffset} />

                <div className="space-y-3 sm:space-y-4 w-full">
                  <motion.h1
                    layoutId="main-title"
                    transition={{ type: "spring", damping: 28, stiffness: 150 }}
                    className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-[var(--color-foreground)] tracking-tight leading-[1.15] text-balance text-center"
                  >
                    Diadema, <br />
                    <span className="text-[var(--color-accent)]">nossa prioridade.</span>
                  </motion.h1>
                  <motion.p
                    layoutId="main-desc"
                    transition={{ type: "spring", damping: 28, stiffness: 150 }}
                    className="text-xs sm:text-sm md:text-base text-[var(--color-muted)] max-w-md mx-auto leading-relaxed text-balance text-center px-2"
                  >
                    Reporte buracos, problemas de iluminação, vazamentos e lixo de forma rápida através do nosso assistente inteligente. A zeladoria urbana nunca foi tão transparente.
                  </motion.p>
                </div>

                {/* Acionador para abertura do chatbot */}
                <div className="pt-1 sm:pt-2 flex justify-center w-full">
                  <motion.button
                    onClick={() => setView("chat")}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 30px oklch(0.68 0.22 245 / 0.35)" 
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="group relative px-6 py-3.5 sm:px-8 sm:py-4 bg-[var(--color-accent)] text-white font-display font-bold text-sm sm:text-base rounded-2xl transition-all overflow-hidden flex items-center gap-2.5 cursor-pointer shadow-[0_4px_20px_oklch(0.68_0.22_245_/_0.2)]"
                  >
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></span>
                    <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                    Registrar Problema
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -20 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="col-start-1 row-start-1 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Títulos e descrições do portal de zeladoria */}
                <div className="space-y-6 text-left hidden lg:block">
                  <motion.h1
                    layoutId="main-title"
                    transition={{ type: "spring", damping: 28, stiffness: 150 }}
                    className="text-5xl lg:text-7xl font-display font-bold text-[var(--color-foreground)] leading-[1.1] tracking-tight text-balance text-left"
                  >
                    Diadema, <br />
                    <span className="text-[var(--color-accent)]">nossa prioridade.</span>
                  </motion.h1>
                  <motion.p
                    layoutId="main-desc"
                    transition={{ type: "spring", damping: 28, stiffness: 150 }}
                    className="text-base sm:text-lg text-[var(--color-muted)] max-w-lg leading-relaxed text-balance text-left"
                  >
                    Reporte buracos, problemas de iluminação, vazamentos e lixo de forma rápida através do nosso assistente inteligente. A zeladoria urbana nunca foi tão transparente.
                  </motion.p>
                </div>

                {/* Interface conversacional do chatbot widget */}
                <motion.div
                  initial={{ opacity: 0, x: 80, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 80, scale: 0.95 }}
                  transition={{ type: "spring", damping: 28, stiffness: 120, delay: 0.05 }}
                  className="w-full max-w-xl lg:w-full mx-auto relative"
                >
                  <div className="relative z-20">
                    <ChatbotWidget onBack={() => setView("landing")} />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--color-accent)]/20 to-transparent blur-2xl -z-10 rounded-3xl pointer-events-none"></div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rodapé institucional com direitos autorais */}
        <footer className="container mx-auto px-6 py-4 text-center text-[10px] text-[var(--color-muted)]/40 relative z-30 border-t border-white/5 shrink-0">
          &copy; {new Date().getFullYear()} Zeladoria Diadema - Prefeitura Municipal de Diadema. Todos os direitos reservados.
        </footer>
      </motion.div>
    </main>
  );
}
