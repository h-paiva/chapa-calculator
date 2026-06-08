import React from "react";
import { PackingResult } from "../types";
import { Coins, Activity, Maximize2 } from "lucide-react";

interface OverviewStatsProps {
  result: PackingResult;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ result }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const formattedCost = formatCurrency(result.totalCost);

  // Calcula área em m² para facilitar a escala humana
  const areaChapasM2 = (result.totalAreaChapa * result.totalSheets) / 10000;
  const areaPecasM2 = result.totalAreaPecas / 10000;
  const areaSobradaM2 = areaChapasM2 - areaPecasM2;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Custo total */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-start justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Investimento Estimado
          </p>
          <p className="text-2xl font-black font-sans text-emerald-400 tracking-tight">
            {formattedCost}
          </p>
          <p className="text-[10px] text-slate-500 leading-normal">
            Preço integral de {result.totalSheets} {result.totalSheets === 1 ? "chapa utillizada" : "chapas utilizadas"}.
          </p>
        </div>
        <div className="p-3 bg-emerald-950/40 text-emerald-400 rounded-xl border border-emerald-500/10">
          <Coins className="w-5 h-5" />
        </div>
      </div>

      {/* Quantidade de Chapas Necessárias */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex items-start justify-between relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total de Chapas
          </p>
          <p className="text-2xl font-black font-sans text-sky-400 tracking-tight">
            {result.totalSheets} <span className="text-xs font-normal text-slate-500 uppercase">unidades</span>
          </p>
          <p className="text-[10px] text-slate-500 leading-normal">
            Divisão otimizada com sobras aproveitáveis.
          </p>
        </div>
        <div className="p-3 bg-sky-950/40 text-sky-400 rounded-xl border border-sky-500/10">
          <Maximize2 className="w-5 h-5" />
        </div>
      </div>

      {/* Aproveitamento Geral */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Aproveitamento Mestre
            </p>
            <p className="text-2xl font-black font-sans text-orange-450 text-orange-400 tracking-tight">
              {result.aproveitamentoGeralPct}%
            </p>
          </div>
          <div className="p-3 bg-orange-950/40 text-orange-400 rounded-xl border border-orange-500/10">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Barra de aproveitamentos */}
        <div className="space-y-1">
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.min(100, result.aproveitamentoGeralPct)}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-500 font-bold font-mono">
            <span>ÚTIL: {areaPecasM2.toFixed(2)} m²</span>
            <span>SOBRA: {Math.max(0, areaSobradaM2).toFixed(2)} m²</span>
          </div>
        </div>
      </div>
    </div>
  );
};
