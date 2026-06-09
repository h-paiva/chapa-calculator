import React, { useState } from "react";
import { Chapa } from "../types";
import { Settings, Info, Plus, Trash2 } from "lucide-react";

interface ChapaInputsProps {
  chapas: Chapa[];
  onAddChapa: (chapa: Chapa) => void;
  onRemoveChapa: (id: string) => void;
  kerf: number;
  setKerf: (val: number) => void;
  permitirRotacao: boolean;
  setPermitirRotacao: (val: boolean) => void;
}

export const ChapaInputs: React.FC<ChapaInputsProps> = ({
  chapas,
  onAddChapa,
  onRemoveChapa,
  kerf,
  setKerf,
  permitirRotacao,
  setPermitirRotacao,
}) => {
  const [nome, setNome] = useState("");
  const [largura, setLargura] = useState<number | "">("");
  const [comprimento, setComprimento] = useState<number | "">("");
  const [espessura, setEspessura] = useState<number | "">("");
  const [valor, setValor] = useState<number | "">("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nome.trim()) {
      setErrorMsg("O nome da chapa é obrigatório.");
      return;
    }
    if (!largura || largura <= 0) {
      setErrorMsg("Largura deve ser um valor positivo.");
      return;
    }
    if (!comprimento || comprimento <= 0) {
      setErrorMsg("Comprimento deve ser um valor positivo.");
      return;
    }
    if (!espessura || espessura <= 0) {
      setErrorMsg("Espessura deve ser um valor positivo.");
      return;
    }
    const numValor = valor === "" ? 0 : Number(valor);
    if (numValor < 0) {
      setErrorMsg("O preço unitário não pode ser negativo.");
      return;
    }

    onAddChapa({
      id: `ch_${Date.now()}`,
      nome: nome.trim(),
      largura,
      comprimento,
      espessura,
      valor: numValor,
    });

    setNome("");
    setLargura("");
    setComprimento("");
    setEspessura("");
    setValor("");
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60">
        <div className="p-1.5 bg-orange-950/40 text-orange-400 rounded-lg border border-orange-500/20">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-sans font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block"></span>
            Chapas Cadastradas
          </h2>
          <p className="text-[11px] text-slate-400">
            Cadastre os tamanhos e custos de chapas disponíveis
          </p>
        </div>
      </div>

      {/* Lista de Chapas */}
      <div className="space-y-2 max-h-[160px] overflow-y-auto scrollbar-thin">
        {chapas.length === 0 ? (
          <div className="py-6 px-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
            <p className="text-xs text-slate-500 font-medium">
              Nenhuma chapa cadastrada. Adicione uma chapa abaixo para começar.
            </p>
          </div>
        ) : (
          chapas.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800 rounded-xl animate-fade-in"
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{c.nome}</p>
                <p className="text-[10px] text-slate-400 font-semibold font-mono">
                  {c.largura}x{c.comprimento} cm &bull; Z: {c.espessura} cm &bull;{" "}
                  <span className="text-emerald-400">{formatCurrency(c.valor)}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveChapa(c.id)}
                className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Remover chapa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Formulário para Cadastrar Nova Chapa */}
      <form onSubmit={handleAdd} className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/80 space-y-3">
        <h3 className="text-xs font-bold text-slate-350 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 text-orange-500" /> Nova Chapa de Madeira
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome da chapa (ex: MDF Louro Freijó 15mm)"
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-semibold"
            />
          </div>

          <div className="relative">
            <input
              type="number"
              value={largura}
              onChange={(e) => setLargura(e.target.value === "" ? "" : parseFloat(e.target.value))}
              min="1"
              step="0.1"
              placeholder="Largura (X)"
              className="w-full px-3 py-1.5 pr-8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono font-semibold"
            />
            <span className="absolute right-2.5 top-1.5 text-[9px] text-slate-500 font-mono">cm</span>
          </div>

          <div className="relative">
            <input
              type="number"
              value={comprimento}
              onChange={(e) => setComprimento(e.target.value === "" ? "" : parseFloat(e.target.value))}
              min="1"
              step="0.1"
              placeholder="Comprimento (Y)"
              className="w-full px-3 py-1.5 pr-8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono font-semibold"
            />
            <span className="absolute right-2.5 top-1.5 text-[9px] text-slate-500 font-mono">cm</span>
          </div>

          <div className="relative">
            <input
              type="number"
              value={espessura}
              onChange={(e) => setEspessura(e.target.value === "" ? "" : parseFloat(e.target.value))}
              min="0.1"
              step="0.1"
              placeholder="Espessura (Z)"
              className="w-full px-3 py-1.5 pr-8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono font-semibold"
            />
            <span className="absolute right-2.5 top-1.5 text-[9px] text-slate-500 font-mono">cm</span>
          </div>

          <div className="relative">
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value === "" ? "" : parseFloat(e.target.value))}
              min="0"
              step="0.01"
              placeholder="Preço Unitário"
              className="w-full px-3 py-1.5 pr-8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono font-semibold"
            />
            <span className="absolute right-2.5 top-1.5 text-[10px] text-orange-400 font-semibold font-mono">R$</span>
          </div>
        </div>

        {errorMsg && (
          <p className="text-[10px] font-bold text-red-400 bg-red-950/20 border border-red-900 p-2 rounded-lg">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-950/20"
        >
          <Plus className="w-4 h-4" /> Cadastrar Chapa
        </button>
      </form>

      {/* Configurações Globais */}
      <div className="pt-4 border-t border-slate-800/80 space-y-4">
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
