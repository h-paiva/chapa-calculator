import React, { useState } from "react";
import { Peca } from "../types";
import { ListPlus, Trash2, Plus, RefreshCw, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PecaListProps {
  pecas: Peca[];
  onAddPeca: (peca: Omit<Peca, "id">) => void;
  onRemovePeca: (id: string) => void;
  onClearPecas: () => void;
  onLoadPreset: (presetName: string) => void;
  hoveredPieceId: string | null;
  setHoveredPieceId: (id: string | null) => void;
  chapaMaxW: number;
  chapaMaxL: number;
}

const PRESETS = [
  { name: "Armário de Banheiro", key: "banheiro" },
  { name: "Mesa de Escritório", key: "escritorio" },
  { name: "Estante de Livros", key: "estante" },
];

const LIGHT_PASTELS = [
  "#3b82f6", // Royal Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#6366f1", // Indigo
  "#a3e635", // Lime
  "#e11d48", // Rose
];

export const PecaList: React.FC<PecaListProps> = ({
  pecas,
  onAddPeca,
  onRemovePeca,
  onClearPecas,
  onLoadPreset,
  hoveredPieceId,
  setHoveredPieceId,
  chapaMaxW,
  chapaMaxL,
}) => {
  const [nome, setNome] = useState("");
  const [largura, setLargura] = useState<number | "">("");
  const [comprimento, setComprimento] = useState<number | "">("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [cor, setCor] = useState(LIGHT_PASTELS[0]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nome.trim()) {
      setErrorMsg("O nome da peça é obrigatório.");
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
    if (quantidade < 1) {
      setErrorMsg("A quantidade mínima é 1.");
      return;
    }

    // Verificar se excede dimensões da chapa em qualquer rotação
    const cabeNormal = largura <= chapaMaxW && comprimento <= chapaMaxL;
    const cabeRotacionada = comprimento <= chapaMaxW && largura <= chapaMaxL;

    if (!cabeNormal && !cabeRotacionada) {
      setErrorMsg(
        `Esta peça (${largura}x${comprimento} cm) é maior que a chapa configurada (${chapaMaxW}x${chapaMaxL} cm).`
      );
      return;
    }

    // Adicionar a peça válida
    onAddPeca({
      nome: nome.trim(),
      largura,
      comprimento,
      quantidade,
      cor,
    });

    // Resetar campos
    setNome("");
    setLargura("");
    setComprimento("");
    setQuantidade(1);

    // Mudar a cor para a próxima do array para gerar variação automática
    const currentIndex = LIGHT_PASTELS.indexOf(cor);
    const nextIndex = (currentIndex + 1) % LIGHT_PASTELS.length;
    setCor(LIGHT_PASTELS[nextIndex]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col h-full justify-between">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-3.5 mb-5 pb-3 border-b border-slate-800/60">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-950/40 text-orange-400 rounded-lg border border-orange-500/20">
              <ListPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block"></span>
                Peças Solicitadas
              </h2>
              <p className="text-[11px] text-slate-400">
                Adicione as peças que deseja cortar da chapa mestra
              </p>
            </div>
          </div>
          {pecas.length > 0 && (
            <button
              onClick={onClearPecas}
              className="text-[11px] text-red-400 hover:text-red-300 font-bold transition-all border border-red-950/80 px-2.5 py-1 rounded-lg hover:bg-red-950/30 cursor-pointer"
            >
              Remover Tudo
            </button>
          )}
        </div>

        {/* Modelos de Exemplo */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mr-1 flex items-center gap-1">
            Gabaritos de Exemplo:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => onLoadPreset(p.key)}
              className="text-[10px] font-bold bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-all border border-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3 h-3 text-slate-400" />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário de Adicionar Nova Peça */}
      <form onSubmit={handleAdd} className="mb-6 bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
        <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 text-orange-500" /> Cadastrar Novo Corte
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Identificação funcional (ex: Porta Superior)"
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-semibold"
            />
          </div>

          <div>
            <div className="relative">
              <input
                type="number"
                value={largura}
                onChange={(e) => setLargura(e.target.value === "" ? "" : parseFloat(e.target.value))}
                min="0.1"
                step="0.1"
                placeholder="Largura (X)"
                className="w-full px-3 py-1.5 pr-8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono font-semibold"
              />
              <span className="absolute right-2 top-1.5 text-[9px] text-slate-500 font-mono">cm</span>
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                type="number"
                value={comprimento}
                onChange={(e) => setComprimento(e.target.value === "" ? "" : parseFloat(e.target.value))}
                min="0.1"
                step="0.1"
                placeholder="Comprimento (Y)"
                className="w-full px-3 py-1.5 pr-8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono font-semibold"
              />
              <span className="absolute right-2 top-1.5 text-[9px] text-slate-500 font-mono">cm</span>
            </div>
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 mb-1 uppercase tracking-wider font-bold">Quantidade</label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono font-semibold"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 mb-1 uppercase tracking-wider font-bold">Cor de Identificação</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-7 h-7 rounded border-0 p-0 overflow-hidden cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 font-mono select-all uppercase">{cor}</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <p className="text-[10px] font-bold text-red-400 bg-red-950/20 border border-red-900 p-2 rounded-lg mb-3">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-950/20"
        >
          <Plus className="w-4 h-4" /> Incluir Peça na Demanda
        </button>
      </form>

      {/* Lista de Peças Rolável */}
      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        Peças Cadastradas ({pecas.length})
      </h3>

      <div className="flex-1 overflow-y-auto max-h-[220px] border border-slate-800 rounded-xl bg-slate-950/50 scrollbar-thin">
        {pecas.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Nenhuma peça incluída. Preencha os campos ou carregue um gabarito acima.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-850">
            <AnimatePresence initial={false}>
              {pecas.map((p) => {
                const isHovered = hoveredPieceId === p.id;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onMouseEnter={() => setHoveredPieceId(p.id)}
                    onMouseLeave={() => setHoveredPieceId(null)}
                    className={`flex items-center justify-between p-3.5 transition-all ${
                      isHovered ? "bg-slate-800/40" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Cor */}
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-white/20 shadow-sm"
                        style={{ backgroundColor: p.cor }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {p.nome}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold font-mono">
                          {p.largura}x{p.comprimento} cm &bull; Qtd:{" "}
                          <span className="font-bold text-orange-400">
                            {p.quantidade}x
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemovePeca(p.id)}
                      className="text-slate-500 hover:text-red-400 p-1.5 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Remover peça"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-4 text-[10px] text-slate-500 text-center leading-normal pt-2 border-t border-slate-800/50">
        Total acumulado:{" "}
        <span className="font-bold text-slate-300 font-mono">
          {pecas.reduce((acc, p) => acc + p.quantidade, 0)} peças de madeira cadastradas
        </span>
      </div>
    </div>
  );
};
