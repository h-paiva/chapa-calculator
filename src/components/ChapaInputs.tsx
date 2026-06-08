import React from "react";
import { Chapa } from "../types";
import { Settings, Info, Ruler } from "lucide-react";

interface ChapaInputsProps {
  chapa: Chapa;
  setChapa: React.Dispatch<React.SetStateAction<Chapa>>;
  kerf: number;
  setKerf: (val: number) => void;
  permitirRotacao: boolean;
  setPermitirRotacao: (val: boolean) => void;
}

export const ChapaInputs: React.FC<ChapaInputsProps> = ({
  chapa,
  setChapa,
  kerf,
  setKerf,
  permitirRotacao,
  setPermitirRotacao,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Permitir floats para dimensões e valores
    const numVal = parseFloat(value) || 0;
    setChapa((prev) => ({
      ...prev,
      [name]: numVal,
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-800/60">
        <div className="p-1.5 bg-orange-950/40 text-orange-400 rounded-lg border border-orange-500/20">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-sans font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block"></span>
            Painel da Chapa Mestra
          </h2>
          <p className="text-[11px] text-slate-400">
            Define o tamanho e custo original da chapa de madeira
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {/* Largura */}
        <div className="relative">
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Largura (Eixo X)
          </label>
          <div className="relative text-zinc-100">
            <input
              type="number"
              name="largura"
              value={chapa.largura || ""}
              onChange={handleChange}
              min="1"
              step="0.1"
              className="w-full px-3 py-2 pr-10 text-xs font-semibold bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono placeholder-slate-700 transition-all"
              placeholder="ex: 275"
            />
            <span className="absolute right-3 top-2.5 text-[9px] text-slate-500 font-mono">
              cm
            </span>
          </div>
        </div>

        {/* Comprimento */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Comprimento (Eixo Y)
          </label>
          <div className="relative">
            <input
              type="number"
              name="comprimento"
              value={chapa.comprimento || ""}
              onChange={handleChange}
              min="1"
              step="0.1"
              className="w-full px-3 py-2 pr-10 text-xs font-semibold bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono placeholder-slate-700 transition-all"
              placeholder="ex: 184"
            />
            <span className="absolute right-3 top-2.5 text-[9px] text-slate-500 font-mono">
              cm
            </span>
          </div>
        </div>

        {/* Espessura/Altura */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
            Espessura (Z)
            <span className="group relative">
              <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
              <span className="hidden group-hover:block absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-1.5 p-2 bg-slate-950 text-white font-normal text-[10px] rounded-md shadow-xl w-48 text-center leading-normal border border-slate-800">
                Comumente chamada de espessura (MDF 15mm = 1.5 cm)
              </span>
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              name="espessura"
              value={chapa.espessura || ""}
              onChange={handleChange}
              min="0.1"
              step="0.1"
              className="w-full px-3 py-2 pr-10 text-xs font-semibold bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono placeholder-slate-700 transition-all"
              placeholder="ex: 1.5"
            />
            <span className="absolute right-3 top-2.5 text-[9px] text-slate-500 font-mono">
              cm
            </span>
          </div>
        </div>

        {/* Custo/Valor */}
        <div>
          <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Preço Unitário
          </label>
          <div className="relative">
            <input
              type="number"
              name="valor"
              value={chapa.valor || ""}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 pr-8 text-xs font-semibold bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono placeholder-slate-700 transition-all"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-2.5 text-[10px] text-orange-400 font-semibold font-mono">
              R$
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-4">
        {/* Serra (Kerf) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              Espessura do Disco (Kerf)
              <span className="group relative">
                <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
                <span className="hidden group-hover:block absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-1.5 p-2 bg-slate-950 text-white font-normal text-[10px] rounded-md shadow-xl w-52 text-center leading-normal border border-slate-800">
                  Espessura da serra que vira serragem. Padrão de marcenaria: 3mm (0.3 cm).
                </span>
              </span>
            </label>
            <span className="text-xs font-mono font-semibold text-orange-405 text-orange-450 text-orange-400">
              {kerf} cm
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={kerf}
            onChange={(e) => setKerf(parseFloat(e.target.value))}
            className="w-full accent-orange-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Permissão de rotação */}
        <label className="flex items-center gap-3 p-2.5 bg-slate-950/50 hover:bg-slate-950 border border-slate-800/80 rounded-xl cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={permitirRotacao}
            onChange={(e) => setPermitirRotacao(e.target.checked)}
            className="w-4 h-4 accent-orange-500 rounded border-slate-800 text-orange-500 focus:ring-orange-500 cursor-pointer"
          />
          <div className="text-left">
            <span className="block text-[11px] font-bold text-white leading-none">
              Otimizar Rotação de Peças (90°)
            </span>
            <span className="block text-[9px] text-slate-500 leading-normal mt-0.5">
              Gire as peças para obter o maior aproveitamento possível da chapa.
            </span>
          </div>
        </label>
      </div>
    </div>
  );
};
