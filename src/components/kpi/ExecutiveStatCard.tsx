import React from 'react';

interface ExecutiveStatCardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  valueNode?: React.ReactNode;
  subtitleNode?: React.ReactNode;
}

export const ExecutiveStatCard: React.FC<ExecutiveStatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  valueNode, 
  subtitleNode 
}) => (
  <div className="p-5 rounded-2xl border border-cyan-400/40 bg-[#051520]/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-1 backdrop-blur-md">
    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">{title}</span>
    {valueNode ? valueNode : <div className="text-2xl font-black text-white font-mono">{value}</div>}
    {subtitleNode ? subtitleNode : <p className="text-xs text-slate-300 font-medium">{subtitle}</p>}
  </div>
);
