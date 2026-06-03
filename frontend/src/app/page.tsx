import ChatbotWidget from "@/components/Chatbot/ChatbotWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] relative overflow-hidden flex flex-col justify-center">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)] to-transparent opacity-20"></div>
      <div className="absolute -top-[500px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-[var(--color-accent)] rounded-full blur-[150px] opacity-5 pointer-events-none"></div>

      <div className="container mx-auto px-4 lg:px-8 py-12 relative z-10 grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
        <div className="space-y-8">
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-[1.1] tracking-tight text-balance">
            Diadema, <br />
            <span className="text-[var(--color-accent)]">nossa prioridade.</span>
          </h1>
          <p className="text-lg text-[var(--color-muted)] max-w-lg leading-relaxed text-balance">
            Reporte buracos, problemas de iluminação, vazamentos e lixo de forma rápida através do nosso assistente inteligente. A zeladoria urbana nunca foi tão transparente.
          </p>
        </div>

        <div className="relative">
          {/* O componente principal do chat fica posicionado com z-index alto para ficar sobre os efeitos */}
          <div className="relative z-20">
            <ChatbotWidget />
          </div>

          {/* Efeito de brilho que fica atrás do widget do chat */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--color-accent)]/20 to-transparent blur-2xl -z-10 rounded-3xl"></div>
        </div>
      </div>
    </main>
  );
}
