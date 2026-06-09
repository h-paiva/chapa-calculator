import React, { useState, useEffect, useMemo } from "react";
import { Chapa, Peca } from "./types";
import { ChapaInputs } from "./components/ChapaInputs";
import { PecaList } from "./components/PecaList";
import { OverviewStats } from "./components/OverviewStats";
import { VisualBoard } from "./components/VisualBoard";
import { PrintReport } from "./components/PrintReport";
import { otimizarCorte } from "./utils/packer";
import { PRESET_DATA } from "./utils/presets";
import { Hammer, Info, AlertCircle, Layers, Printer } from "lucide-react";

export default function App() {
  // 1. Estados principais com inicialização por Preset padrão caso local vazio
  const [chapas, setChapas] = useState<Chapa[]>(() => {
    const saved = localStorage.getItem("otm_chapas");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignorar erro
      }
    }
    return PRESET_DATA.banheiro.chapas;
  });

  const [pecas, setPecas] = useState<Peca[]>(() => {
    const saved = localStorage.getItem("otm_pecas");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignorar erro
      }
    }
    return PRESET_DATA.banheiro.pecas;
  });

  const [kerf, setKerf] = useState<number>(() => {
    const saved = localStorage.getItem("otm_kerf");
    return saved ? parseFloat(saved) : 0.3; // padrão de 3mm de corte de serra
  });

  const [permitirRotacao, setPermitirRotacao] = useState<boolean>(() => {
    const saved = localStorage.getItem("otm_rotacao");
    return saved ? saved === "true" : true;
  });

  const [hoveredPieceId, setHoveredPieceId] = useState<string | null>(null);
  const [isPrintView, setIsPrintView] = useState<boolean>(false);

  // Guardar estados no LocalStorage para persistência
  useEffect(() => {
    localStorage.setItem("otm_chapas", JSON.stringify(chapas));
  }, [chapas]);

  useEffect(() => {
    localStorage.setItem("otm_pecas", JSON.stringify(pecas));
  }, [pecas]);

  useEffect(() => {
    localStorage.setItem("otm_kerf", kerf.toString());
  }, [kerf]);

  useEffect(() => {
    localStorage.setItem("otm_rotacao", permitirRotacao.toString());
  }, [permitirRotacao]);

  // 2. Cálculo de otimização em tempo real via useMemo
  const result = useMemo(() => {
    return otimizarCorte(chapas, pecas, kerf, permitirRotacao);
  }, [chapas, pecas, kerf, permitirRotacao]);

  // 3. Ações de Chapas
  const handleAddChapa = (novaChapa: Chapa) => {
    setChapas((prev) => [...prev, novaChapa]);
  };

  const handleRemoveChapa = (id: string) => {
    setChapas((prev) => prev.filter((c) => c.id !== id));
    // Cascade delete pieces belonging to this chapa
    setPecas((prev) => prev.filter((p) => p.chapaId !== id));
  };

  // 4. Ações de Peças
  const handleAddPeca = (novaPeca: Omit<Peca, "id">) => {
    const id = `pc_${Date.now()}`;
    setPecas((prev) => [...prev, { ...novaPeca, id } as Peca]);
  };

  const handleRemovePeca = (id: string) => {
    setPecas((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearPecas = () => {
    setPecas([]);
  };

  const handleImportPecas = (novasPecas: Omit<Peca, "id">[]) => {
    const comIds = novasPecas.map((p, index) => ({
      ...p,
      id: `pc_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`
    })) as Peca[];
    setPecas((prev) => [...prev, ...comIds]);
  };

  const handleLoadPreset = (presetKey: string) => {
    const pData = PRESET_DATA[presetKey];
    if (pData) {
      setChapas(pData.chapas);
      setPecas(pData.pecas);
    }
  };

  const handleResetAll = () => {
    setChapas([]);
    setPecas([]);
  };

  if (isPrintView) {
    return (
      <PrintReport
        chapas={chapas}
        pecas={pecas}
        kerf={kerf}
        permitirRotacao={permitirRotacao}
        result={result}
        onClose={() => setIsPrintView(false)}
      />
    );
  }

  return (
    <div id="app-workspace" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-150 selection:bg-orange-500/30 selection:text-orange-300">
      {/* Top Header */}
      <header className="bg-slate-900/90 border-b border-slate-800/80 px-6 py-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-950/20">
              <Hammer className="w-5 h-5 text-zinc-100 animate-pulse" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-xl md:text-2xl text-white tracking-tight flex items-center gap-1.5 leading-tight">
                Chapa Calculator<span className="text-orange-500 underline decoration-2 underline-offset-4">Pro</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Cálculo inteligente de aproveitamento de chapas de madeira
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPrintView(true)}
              className="text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-950/25 flex items-center gap-1.5 cursor-pointer border border-orange-500/20"
            >
              <Printer className="w-3.5 h-3.5" /> Gerar PDF / Relatório
            </button>
            <button
              onClick={() => handleLoadPreset("banheiro")}
              className="text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 px-3.5 py-2 rounded-xl border border-slate-750 transition-colors cursor-pointer"
            >
              Exemplo
            </button>
            <button
              onClick={handleResetAll}
              className="text-xs font-semibold bg-red-950/40 text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3.5 py-2 rounded-xl border border-red-900/30 transition-colors cursor-pointer"
            >
              Resetar Tudo
            </button>
            <span className="hidden md:inline-flex text-[10px] font-mono text-slate-400 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800/50">
              Fórmula: First-Fit Decreasing
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        
        {/* KPI Row (Bento Style summary) */}
        <OverviewStats result={result} />

        {/* Layout Grid Secundário */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Lado Esquerdo: Parâmetros e Peças (Col 5) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Chapa Master Card */}
            <ChapaInputs
              chapas={chapas}
              onAddChapa={handleAddChapa}
              onRemoveChapa={handleRemoveChapa}
              kerf={kerf}
              setKerf={setKerf}
              permitirRotacao={permitirRotacao}
              setPermitirRotacao={setPermitirRotacao}
            />

            {/* Lista de Peças e Demanda */}
            <PecaList
              pecas={pecas}
              chapas={chapas}
              onAddPeca={handleAddPeca}
              onRemovePeca={handleRemovePeca}
              onClearPecas={handleClearPecas}
              onImportPecas={handleImportPecas}
              onLoadPreset={handleLoadPreset}
              hoveredPieceId={hoveredPieceId}
              setHoveredPieceId={setHoveredPieceId}
            />

          </div>

          {/* Lado Direito: Resultados Visuais e Alertas (Col 7) */}
          <div className="lg:col-span-7 space-y-5 lg:sticky lg:top-[90px]">
            
            {/* Alerta de Peças Não Encaixadas se Houver */}
            {result.unpacked.length > 0 && (
              <div className="bg-red-950/40 border border-red-850 rounded-2xl p-4 flex gap-3 text-red-200">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h4 className="text-xs font-bold text-red-350">
                    Cortes não encaixados ({result.unpacked.length})
                  </h4>
                  <p className="text-[11px] text-red-400 leading-normal mt-0.5">
                    As seguintes peças não puderam ser incluídas no layout:
                  </p>
                  <ul className="list-disc pl-4 text-[10px] text-red-355 font-medium space-y-0.5 mt-2">
                    {result.unpacked.map((un, index) => (
                      <li key={index}>
                        <strong>{un.nome}</strong> ({un.largura}x{un.comprimento} cm): {un.motivo}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Visual Board Layout Map */}
            {result.layouts.length > 0 ? (
              <VisualBoard
                layouts={result.layouts}
                hoveredPieceId={hoveredPieceId}
                setHoveredPieceId={setHoveredPieceId}
              />
            ) : (
              <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-12 text-center shadow-md">
                <Layers className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Aguardando dados de corte</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-normal">
                  Inclua cortes necessários na coluna da esquerda para gerar a simulação automática da distribuição geométrica.
                </p>
              </div>
            )}

            {/* Guia de Ajuda de Uso Rápido */}
            <div className="bg-slate-900/30 rounded-2xl border border-slate-800/80 p-5 shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800/60">
                <Info className="w-4 h-4 text-orange-500" /> Dicas de Carpintaria & Marcenaria
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-[11px] text-slate-400 leading-normal">
                  <span className="block font-semibold text-slate-200 mb-1">
                    Espessura da Lâmina (Kerf)
                  </span>
                  No corte físico, a serra consome madeira na forma de serragem (ex: 3 mm). Nosso sistema desconta essa margem automaticamente para garantir precisão absoluta.
                </div>
                <div className="text-[11px] text-slate-400 leading-normal">
                  <span className="block font-semibold text-slate-200 mb-1">
                    Sentido do Veio (Rotação)
                  </span>
                  Se estiver usando mdf amadeirado, desative a rotação de 90° para que as estampas fiquem todas alinhadas de forma profissional na montagem.
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-6 mt-12 text-center text-xs text-slate-500 font-medium">
        <p>&copy; 2026 Chapa Calculator Pro &bull; Desenvolvido com Bento Grid Dashboard UI.</p>
      </footer>
    </div>
  );
}
