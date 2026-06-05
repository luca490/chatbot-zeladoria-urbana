import React from 'react';
import { cn } from '@/lib/utils';

export const DiademaFlag: React.FC<{ className?: string }> = ({ className = "w-8 h-5.5" }) => {
  return (
    <svg 
      viewBox="0 0 320 220" 
      className={cn("border border-white/10 rounded shadow-md shrink-0 select-none", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base azul celeste */}
      <rect width="320" height="220" fill="#0096D6" />
      
      {/* 4 Listras Brancas Horizontais */}
      <rect y="24.4" width="320" height="24.4" fill="#FFFFFF" />
      <rect y="73.3" width="320" height="24.4" fill="#FFFFFF" />
      <rect y="122.2" width="320" height="24.4" fill="#FFFFFF" />
      <rect y="171.1" width="320" height="24.4" fill="#FFFFFF" />
      
      {/* Cantão Branco (Cobre 4 listras de altura e 40% de largura) */}
      <rect x="0" y="0" width="128" height="97.7" fill="#FFFFFF" />
      
      {/* Brasão de Diadema Simplificado em Vetor */}
      <g transform="translate(24, 6) scale(0.68)">
        {/* Coroa Mural (Mural Crown) - Dourado */}
        <path d="M 40 25 L 45 15 L 52 15 L 54 20 L 61 20 L 63 15 L 70 15 L 72 20 L 79 20 L 81 15 L 88 15 L 93 25 Z" fill="#F59E0B" stroke="#000000" strokeWidth="1" strokeLinejoin="round" />
        <rect x="44" y="25" width="45" height="10" fill="#D97706" stroke="#000000" strokeWidth="1" />
        <rect x="49" y="35" width="35" height="5" fill="#B45309" stroke="#000000" strokeWidth="1" />
        
        {/* Contorno do Escudo */}
        <path d="M 38 40 L 95 40 L 95 75 C 95 95, 66 110, 66 110 C 66 110, 38 95, 38 75 Z" fill="#F3F4F6" stroke="#000000" strokeWidth="1.5" strokeLinejoin="round" />
        
        {/* Divisões Internas do Escudo */}
        {/* Quadrante Superior Esquerdo - Verde */}
        <path d="M 38.5 40.5 L 66 40.5 L 66 75 C 66 75, 61 80, 52 75 Z" fill="#10B981" />
        {/* Quadrante Superior Direito - Vermelho */}
        <path d="M 66 40.5 L 94.5 40.5 L 94.5 75 C 94.5 75, 89 80, 80 75 Z" fill="#EF4444" />
        {/* Quadrante Inferior - Azul escuro */}
        <path d="M 38.5 75 C 38.5 75, 38 75.5, 38.5 76 C 41 88, 66 109, 66 109 C 66 109, 91 88, 93.5 76 C 94 75.5, 93.5 75, 93.5 75 Z" fill="#1E40AF" />
        
        {/* Linhas de Contorno Interno */}
        <line x1="66" y1="40" x2="66" y2="75" stroke="#000000" strokeWidth="1.5" />
        <line x1="38" y1="75" x2="95" y2="75" stroke="#000000" strokeWidth="1.5" />
        
        {/* Símbolos dos Quadrantes */}
        {/* Verde: Balança e Roda Dentada (Prata) */}
        <circle cx="52" cy="58" r="4" fill="#FFFFFF" />
        <line x1="52" y1="50" x2="52" y2="66" stroke="#FFFFFF" strokeWidth="1.5" />
        
        {/* Vermelho: Leão Rampante (Dourado/Amarelo) */}
        <path d="M 76 65 C 76 60, 80 50, 83 50 C 85 50, 84 56, 82 58 L 84 66 L 78 66 Z" fill="#F59E0B" />
        
        {/* Azul: Três Torres de Prata */}
        <rect x="46" y="80" width="8" height="8" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
        <rect x="78" y="80" width="8" height="8" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
        <rect x="62" y="90" width="8" height="8" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
        
        {/* Listel com Nome da Cidade */}
        <path d="M 20 112 Q 66 125 112 112 L 108 120 Q 66 132 24 120 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
        <path d="M 20 112 L 12 120 L 24 120 Z M 112 112 L 120 120 L 108 120 Z" fill="#D1D5DB" stroke="#000000" strokeWidth="1" />
        
        {/* Texto do Listel: FLOREAT DIADEMA */}
        <path d="M 32 118 Q 66 126 100 118" id="listelTextPath" fill="none" />
        <text fontSize="5.5" fontWeight="bold" fill="#1E3A8A">
          <textPath href="#listelTextPath" startOffset="50%" textAnchor="middle">
            FLOREAT DIADEMA
          </textPath>
        </text>
      </g>
    </svg>
  );
};
