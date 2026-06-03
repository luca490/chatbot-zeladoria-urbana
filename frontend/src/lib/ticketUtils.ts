// Função para extrair um resumo curto e descritivo do chamado
export const getBriefDescription = (desc: string) => {
  const match = desc.match(/\[RESUMO_IA\]([\s\S]*?)\[\/RESUMO_IA\]/);
  return match ? match[1].trim() : desc.replace(/\n\n--- Relato Adicional.*/g, '...');
};

// Retorna as classes de cores baseadas no status
export const getStatusColor = (status: string) => {
  switch (status) {
    case "Aberto": return "bg-red-500/20 text-red-500 border-red-500/50";
    case "Em andamento": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    case "Resolvido": return "bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/50";
    default: return "bg-gray-500/20 text-gray-500 border-gray-500/50";
  }
};

// Retorna as classes de cores baseadas na prioridade
export const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "Urgente": return "text-red-500 bg-red-500/10 border-red-500/20";
    case "Alta": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "Média": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    default: return "text-blue-400 bg-blue-400/10 border-blue-400/20";
  }
};

// Retorna um peso (número) para usar na ordenação pela prioridade
export const getPriorityWeight = (priority?: string) => {
  switch (priority) {
    case "Urgente": return 4;
    case "Alta": return 3;
    case "Média": return 2;
    default: return 1;
  }
};
