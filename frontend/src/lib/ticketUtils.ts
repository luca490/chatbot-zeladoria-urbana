// Extrai o resumo gerado pela IA delimitado pelas tags [RESUMO_IA]
export const getBriefDescription = (desc: string) => {
  const match = desc.match(/\[RESUMO_IA\]([\s\S]*?)\[\/RESUMO_IA\]/);
  return match ? match[1].trim() : desc.replace(/\n\n--- Relato Adicional.*/g, '...');
};

// Retorna classes CSS de status com suporte a contraste dinâmico de tema
export const getStatusColor = (status: string) => {
  switch (status) {
    case "Aberto": return "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-500 border-red-500/30 dark:border-red-500/50";
    case "Em andamento": return "bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 border-yellow-500/30 dark:border-yellow-500/50";
    case "Resolvido": return "bg-[var(--color-accent)]/10 dark:bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/30 dark:border-[var(--color-accent)]/50";
    default: return "bg-gray-500/10 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30 dark:border-gray-500/50";
  }
};

// Retorna classes CSS de prioridade com cores semânticas diferenciadas
export const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "Urgente": return "text-red-600 dark:text-red-500 bg-red-500/10 border-red-500/20";
    case "Alta": return "text-orange-600 dark:text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "Média": return "text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    default: return "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20";
  }
};


// Retorna valor numérico para classificação e ordenação de prioridades
export const getPriorityWeight = (priority?: string) => {
  switch (priority) {
    case "Urgente": return 4;
    case "Alta": return 3;
    case "Média": return 2;
    default: return 1;
  }
};
