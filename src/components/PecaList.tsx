import React, { useState, useEffect } from "react";
import { Peca, Chapa } from "../types";
import { ListPlus, Trash2, Plus, Layers, ArrowUpDown, X, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PecaListProps {
  pecas: Peca[];
  chapas: Chapa[];
  onAddPeca: (peca: Omit<Peca, "id">) => void;
  onRemovePeca: (id: string) => void;
  onClearPecas: () => void;
  onImportPecas: (pecas: Omit<Peca, "id">[]) => void;
  onLoadPreset: (presetName: string) => void;
  hoveredPieceId: string | null;
  setHoveredPieceId: (id: string | null) => void;
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
  chapas,
  onAddPeca,
  onRemovePeca,
  onClearPecas,
  onImportPecas,
  onLoadPreset,
  hoveredPieceId,
  setHoveredPieceId,
}) => {
  const [nome, setNome] = useState("");
  const [largura, setLargura] = useState<number | "">("");
  const [comprimento, setComprimento] = useState<number | "">("");
  const [quantidade, setQuantidade] = useState<number>(1);
  const [cor, setCor] = useState(LIGHT_PASTELS[0]);
  const [errorMsg, setErrorMsg] = useState("");

  const [selectedChapaId, setSelectedChapaId] = useState<string>("");

  // Estados para Importar / Exportar
  const [showImportExport, setShowImportExport] = useState(false);
  const [importText, setImportText] = useState("");
  const [modalErrors, setModalErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Sincronizar chapa selecionada quando as chapas mudam
  useEffect(() => {
    if (chapas.length > 0) {
      if (!selectedChapaId || !chapas.some((c) => c.id === selectedChapaId)) {
        setSelectedChapaId(chapas[0].id);
      }
    } else {
      setSelectedChapaId("");
    }
  }, [chapas, selectedChapaId]);

  const handleOpenImportExport = () => {
    // Gera o texto pré-formatado a partir da lista atual
    const exported = pecas
      .map((p) => `${p.nome}, ${p.largura}, ${p.comprimento}, ${p.quantidade}`)
      .join("\n");
    setImportText(exported);
    setModalErrors([]);
    setCopied(false);
    setShowImportExport(true);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(importText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProcessImport = () => {
    setModalErrors([]);
    const lines = importText.split("\n");
    const parsedPecas: Omit<Peca, "id">[] = [];
    const errors: string[] = [];

    const targetChapa = chapas.find((c) => c.id === selectedChapaId) || chapas[0];
    if (!targetChapa) {
      setModalErrors(["Você precisa cadastrar pelo menos uma chapa antes de importar peças."]);
      return;
    }

    let colorIndex = 0;

    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      // Ignorar linhas em branco ou comentários
      if (!cleanLine || cleanLine.startsWith("#") || cleanLine.startsWith("//")) {
        return;
      }

      // Dividir por vírgula ou ponto-e-vírgula
      const parts = cleanLine.split(/[,;]/);
      if (parts.length < 3) {
        errors.push(`Linha ${index + 1}: Formato inválido. Use "Nome, Largura, Comprimento, Quantidade"`);
        return;
      }

      const nomePeca = parts[0].trim();
      const largPeca = parseFloat(parts[1].trim());
      const compPeca = parseFloat(parts[2].trim());
      let qtdPeca = 1;

      if (parts[3]) {
        const parsedQtd = parseInt(parts[3].trim());
        if (!isNaN(parsedQtd)) {
          qtdPeca = parsedQtd;
        }
      }

      // Validações
      if (!nomePeca) {
        errors.push(`Linha ${index + 1}: O nome da peça é obrigatório.`);
        return;
      }
      if (isNaN(largPeca) || largPeca <= 0) {
        errors.push(`Linha ${index + 1}: Largura ("${parts[1]}") deve ser um valor positivo.`);
        return;
      }
      if (isNaN(compPeca) || compPeca <= 0) {
        errors.push(`Linha ${index + 1}: Comprimento ("${parts[2]}") deve ser um valor positivo.`);
        return;
      }
      if (qtdPeca < 1) {
        errors.push(`Linha ${index + 1}: A quantidade deve ser de pelo menos 1.`);
        return;
      }

      // Verificar se a peça cabe na chapa selecionada (em qualquer sentido)
      const cabeNormal = largPeca <= targetChapa.largura && compPeca <= targetChapa.comprimento;
      const cabeRotacionada = compPeca <= targetChapa.largura && largPeca <= targetChapa.comprimento;
      if (!cabeNormal && !cabeRotacionada) {
        errors.push(
          `Linha ${index + 1}: A peça "${nomePeca}" (${largPeca}x${compPeca} cm) é maior que a chapa selecionada "${targetChapa.nome}" (${targetChapa.largura}x${targetChapa.comprimento} cm).`
        );
        return;
      }

      const pecaColor = LIGHT_PASTELS[colorIndex % LIGHT_PASTELS.length];
      colorIndex++;

      parsedPecas.push({
        nome: nomePeca,
        largura: largPeca,
        comprimento: compPeca,
        quantidade: qtdPeca,
        cor: pecaColor,
        chapaId: targetChapa.id,
      });
    });

    if (errors.length > 0) {
      setModalErrors(errors);
      return;
    }

    // Limpa a lista atual de peças associadas à chapa selecionada e insere as novas
    // Para simplificar, adicionamos as novas à lista existente
    onImportPecas(parsedPecas);
    setShowImportExport(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (chapas.length === 0) {
      setErrorMsg("Você precisa cadastrar uma chapa antes de adicionar peças.");
      return;
    }

    const targetChapa = chapas.find((c) => c.id === selectedChapaId);
    if (!targetChapa) {
      setErrorMsg("Selecione uma chapa de destino válida.");
      return;
    }

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

    // Verificar se excede dimensões da chapa selecionada em qualquer rotação
    const cabeNormal = largura <= targetChapa.largura && comprimento <= targetChapa.comprimento;
    const cabeRotacionada = comprimento <= targetChapa.largura && largura <= targetChapa.comprimento;

    if (!cabeNormal && !cabeRotacionada) {
      setErrorMsg(
        `Esta peça (${largura}x${comprimento} cm) é maior que a chapa selecionada "${targetChapa.nome}" (${targetChapa.largura}x${targetChapa.comprimento} cm).`
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
      chapaId: selectedChapaId,
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
                Adicione as peças que deseja cortar nas chapas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenImportExport}
              disabled={chapas.length === 0}
              className="text-[11px] text-orange-400 hover:text-orange-300 font-bold transition-all border border-orange-950/80 px-2.5 py-1 rounded-lg hover:bg-orange-950/30 cursor-pointer flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpDown className="w-3.5 h-3.5" /> Importar/Exportar
            </button>
            {pecas.length > 0 && (
              <button
                type="button"
                onClick={onClearPecas}
                className="text-[11px] text-red-400 hover:text-red-300 font-bold transition-all border border-red-950/80 px-2.5 py-1 rounded-lg hover:bg-red-950/30 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
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

      {/* Travas de Chapas */}
      {chapas.length === 0 && (
        <div className="bg-red-950/40 border border-red-900/40 rounded-xl p-4 text-center mb-5">
          <p className="text-xs text-red-300 font-semibold leading-relaxed">
            Nenhuma chapa cadastrada!
          </p>
          <p className="text-[10px] text-red-400/80 mt-1">
            Cadastre pelo menos uma chapa no painel acima antes de prosseguir para associar seus cortes.
          </p>
        </div>
      )}

      {/* Formulário de Adicionar Nova Peça */}
      <form onSubmit={handleAdd} className="mb-6 bg-slate-950/50 rounded-xl p-4 border border-slate-800/80">
        <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 text-orange-500" /> Cadastrar Novo Corte
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Dropdown de Chapas (só exibe se houver mais de uma, se for uma só fica selecionada como default) */}
          {chapas.length > 0 && (
            <div className="md:col-span-2">
              <label className="block text-[9px] text-slate-400 mb-1 uppercase tracking-wider font-bold">
                Chapa de Destino
              </label>
              <select
                value={selectedChapaId}
                onChange={(e) => setSelectedChapaId(e.target.value)}
                disabled={chapas.length === 0}
                className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {chapas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.largura}x{c.comprimento} cm)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Identificação funcional (ex: Porta Superior)"
              disabled={chapas.length === 0}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={chapas.length === 0}
                className="w-full px-3 py-1.5 pr-8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                disabled={chapas.length === 0}
                className="w-full px-3 py-1.5 pr-8 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={chapas.length === 0}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-white font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[9px] text-slate-400 mb-1 uppercase tracking-wider font-bold">Cor de Identificação</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                disabled={chapas.length === 0}
                className="w-7 h-7 rounded border-0 p-0 overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          disabled={chapas.length === 0}
          className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-950/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                const matchedChapa = chapas.find((c) => c.id === p.chapaId);
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
                        <p className="text-[10px] text-slate-400 font-semibold font-mono truncate">
                          {p.largura}x{p.comprimento} cm &bull; Qtd:{" "}
                          <span className="font-bold text-orange-400">
                            {p.quantidade}x
                          </span>
                          {matchedChapa && ` &bull; ${matchedChapa.nome}`}
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

      {/* Modal de Importação/Exportação */}
      <AnimatePresence>
        {showImportExport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowImportExport(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Importar / Exportar Peças
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImportExport(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-3.5 space-y-1.5">
                  <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                    Como funciona:
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Insira uma peça por linha no formato: <strong>Nome, Largura, Comprimento, Quantidade</strong>. 
                    <br />
                    As peças serão vinculadas à chapa selecionada:{" "}
                    <strong>
                      {chapas.find((c) => c.id === selectedChapaId)?.nome || "Selecione uma chapa"}
                    </strong>.
                  </p>
                  <pre className="text-[9px] font-mono text-orange-450 bg-slate-950 p-2.5 rounded-lg border border-slate-900 leading-normal">
                    Porta Armário, 50, 70, 2&#10;Lateral MDF, 35.5, 120, 2&#10;Fundo Traseiro, 68, 120, 1
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Área de Texto
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyText}
                      className="text-[9px] font-bold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors border-0 bg-transparent"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-green-500" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copiar Texto
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Cole seu texto formatado aqui..."
                    className="w-full h-44 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono font-semibold focus:ring-1 focus:ring-orange-500 focus:outline-none scrollbar-thin resize-none"
                  />
                </div>

                {/* Exibição de erros */}
                {modalErrors.length > 0 && (
                  <div className="bg-red-950/30 border border-red-900 rounded-xl p-3.5 space-y-1">
                    <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-wide">
                      Erros de Validação ({modalErrors.length})
                    </h5>
                    <ul className="text-[9px] text-red-355 list-disc pl-4 space-y-0.5 max-h-[120px] overflow-y-auto font-medium">
                      {modalErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowImportExport(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-350 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProcessImport}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-orange-950/20 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Aplicar e Substituir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
