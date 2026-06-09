import React from "react";
import { Chapa, SheetLayout, Peca, PackingResult } from "../types";
import { Printer, ArrowLeft, Download, Info } from "lucide-react";

interface PrintReportProps {
  chapa: Chapa;
  pecas: Peca[];
  kerf: number;
  permitirRotacao: boolean;
  result: PackingResult;
  onClose: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({
  chapa,
  pecas,
  kerf,
  permitirRotacao,
  result,
  onClose,
}) => {
  const [printError, setPrintError] = React.useState<string | null>(null);

  const isInIframe = React.useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  const handlePrint = () => {
    try {
      window.print();
    } catch (err: any) {
      setPrintError(
        "Não foi possível abrir o diálogo de impressão de dentro do simulador integrado. Abra o aplicativo em uma nova aba para imprimir!"
      );
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const currentDate = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="fixed inset-0 z-50 bg-white text-zinc-900 overflow-y-auto p-4 md:p-8 print:p-0 font-sans print-report-container">
      {/* Alert about iFrame printing restriction */}
      {isInIframe && (
        <div className="max-w-4xl mx-auto mb-4 bg-orange-50 border border-orange-300 text-orange-950 rounded-xl p-4 text-xs font-medium print:hidden flex items-start gap-2.5">
          <Info className="w-4.5 h-4.5 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-orange-900 mb-1">
              Modo de Visualização Integrada (iFrame) Detectado:
            </strong>
            Os navegadores modernos impedem que o comando de impressão seja executado de dentro de painéis embutidos (iFrames) por motivos de segurança. 
            Para gerar seu PDF com sucesso, clique no botão <span className="font-bold underline">"Abrir em nova aba"</span> no canto superior direito da tela do AI Studio, acesse o relatório lá e imprima normalmente.
          </div>
        </div>
      )}

      {printError && (
        <div className="max-w-4xl mx-auto mb-4 bg-red-50 border border-red-350 text-red-900 rounded-xl p-4 text-xs font-bold leading-normal print:hidden">
          {printError}
        </div>
      )}

      {/* Dynamic Floating Action Banner for Web View Only */}
      <div className="max-w-4xl mx-auto mb-8 bg-zinc-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">
              Modo de Relatório / PDF de Produção
            </h3>
            <p className="text-[11px] text-zinc-400">
              Otimizado para impressoras e salvamento digital em PDF.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Imprimir ou Salvar PDF
          </button>
        </div>
      </div>

      {/* Main Report Page Structure */}
      <div className="max-w-4xl mx-auto bg-white p-2 md:p-6 print:p-0">
        
        {/* Header Block */}
        <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-5 mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">
              Chapa Calculator<span className="text-orange-600">Pro</span>
            </h1>
            <p className="text-xs text-zinc-500 font-semibold font-mono uppercase tracking-wider">
              Relatório de Corte e Produção de Marcenaria
            </p>
          </div>
          <div className="text-right text-xs text-zinc-500 font-mono">
            <p>Data: <strong>{currentDate}</strong></p>
            <p>Licença: <strong>Profissional</strong></p>
          </div>
        </div>

        {/* 1. Summary details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border border-zinc-200 rounded-xl p-4">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2 border-b pb-1">
              Especificações da Chapa
            </h3>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-zinc-100">
                  <td className="py-1 text-zinc-505">Largura (X):</td>
                  <td className="py-1 text-right font-bold text-zinc-900">{chapa.largura} cm</td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="py-1 text-zinc-505">Comprimento (Y):</td>
                  <td className="py-1 text-right font-bold text-zinc-900">{chapa.comprimento} cm</td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="py-1 text-zinc-550">Espessura (Z):</td>
                  <td className="py-1 text-right font-bold text-zinc-900">{chapa.espessura} cm</td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="py-1 text-zinc-505">Preço Unitário:</td>
                  <td className="py-1 text-right font-bold text-zinc-900">{formatCurrency(chapa.valor)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-zinc-505">Folga de Serra (Kerf):</td>
                  <td className="py-1 text-right font-bold text-zinc-900">{kerf} cm</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2 border-b pb-1">
              Resultados de Engenharia
            </h3>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-zinc-100">
                  <td className="py-1 text-zinc-505">Chapas Necessárias:</td>
                  <td className="py-1 text-right font-bold text-zinc-900">{result.totalSheets} placas</td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="py-1 text-zinc-505">Investimento em Matéria-Prima:</td>
                  <td className="py-1 text-right font-bold text-amber-900 font-mono text-[13px]">
                    {formatCurrency(result.totalCost)}
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="py-1 text-zinc-550">Aproveitamento Médio:</td>
                  <td className="py-1 text-right font-bold text-green-700">{result.aproveitamentoGeralPct}%</td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="py-1 text-zinc-505">Área de Cortes Úteis:</td>
                  <td className="py-1 text-right font-bold text-zinc-900">
                    {(result.totalAreaPecas / 10000).toFixed(2)} m²
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-zinc-505">Sobras Totais do Projeto:</td>
                  <td className="py-1 text-right font-bold text-zinc-650">
                    {(((result.totalAreaChapa * result.totalSheets) - result.totalAreaPecas) / 10000).toFixed(2)} m²
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. List of demanded pieces */}
        <div className="mb-8">
          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-3 leading-none">
            Relação Completa de Peças Cortadas
          </h3>
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-200">
                  <th className="p-3 font-bold text-zinc-700 uppercase">Item/Identificação</th>
                  <th className="p-3 font-bold text-zinc-700 uppercase text-center">Largura (X)</th>
                  <th className="p-3 font-bold text-zinc-700 uppercase text-center">Comprimento (Y)</th>
                  <th className="p-3 font-bold text-zinc-700 uppercase text-center">Quantidade</th>
                  <th className="p-3 font-bold text-zinc-700 uppercase text-center">Espessura</th>
                  <th className="p-3 font-bold text-zinc-700 uppercase text-right">Área Individual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {pecas.map((pec, index) => {
                  const areaPec = (pec.largura * pec.comprimento) / 10000;
                  return (
                    <tr key={index} className="hover:bg-zinc-50/50">
                      <td className="p-3 font-bold text-zinc-950 flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: pec.cor }}
                        />
                        {pec.nome}
                      </td>
                      <td className="p-3 text-center font-mono">{pec.largura} cm</td>
                      <td className="p-3 text-center font-mono">{pec.comprimento} cm</td>
                      <td className="p-3 text-center font-bold text-orange-660">{pec.quantidade}x</td>
                      <td className="p-3 text-center text-zinc-500 font-mono">{chapa.espessura} cm</td>
                      <td className="p-3 text-right font-mono text-zinc-600">{areaPec.toFixed(3)} m²</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Visual Layout Plates (High contrast light themes specifically optimized for PDF rendering and standard printer inks) */}
        <div className="page-break-before space-y-8">
          <div className="border-t-2 border-zinc-900 pt-5">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-2 leading-none">
              Mapas Geométricos de Posicionamento (Layout de Corte)
            </h3>
            <p className="text-[10px] text-zinc-500 mb-4">
              Cada retângulo representa a coordenada exata para posicionamento na serra de chapa.
            </p>
          </div>

          <div className="space-y-8">
            {result.layouts.map((lay) => (
              <div key={lay.id} className="border border-zinc-300 rounded-2xl p-4 bg-zinc-50/30 page-break-inside-avoid print-sheet-layout">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-zinc-900">
                    Plano de Corte - CHAPA #{lay.id}
                  </h4>
                  <div className="flex gap-4 text-[10px] font-mono text-zinc-500">
                    <span>Área Útil: {(lay.areaUtilizada / 10000).toFixed(2)} m²</span>
                    <span>Eficiência: <strong>{lay.aproveitamentoPct}%</strong></span>
                  </div>
                </div>

                {/* SVG Render strictly for paper printing (White wood color with bold black lines) */}
                <div className="bg-white p-3 rounded-xl border border-zinc-200">
                  <svg
                    viewBox={`0 0 ${chapa.largura} ${chapa.comprimento}`}
                    className="w-full h-auto"
                    style={{ maxHeight: "380px" }}
                  >
                    {/* The raw plate body style (Print friendly color) */}
                    <rect
                      width={chapa.largura}
                      height={chapa.comprimento}
                      fill="#fafafa"
                      stroke="#000000"
                      strokeWidth="2"
                    />

                    {/* Leftovers/Waste spaces */}
                    {lay.freeSpaces.map((space, sIdx) => (
                      <g key={sIdx}>
                        <rect
                          x={space.x}
                          y={space.y}
                          width={space.w}
                          height={space.l}
                          fill="#f4f4f5"
                          stroke="#a1a1aa"
                          strokeWidth="0.8"
                          strokeDasharray="4 4"
                        />
                        {space.w > 30 && space.l > 20 && (
                          <text
                            x={space.x + space.w / 2}
                            y={space.y + space.l / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#71717a"
                            fontSize={Math.max(4, Math.min(8, space.w / 9))}
                            className="font-mono font-bold"
                          >
                            Refugo
                          </text>
                        )}
                      </g>
                    ))}

                    {/* Positioned cut items with distinct patterns/labeling */}
                    {lay.packedPieces.map((p) => {
                      const showLabel = p.w >= 18 && p.l >= 12;
                      return (
                        <g key={p.id}>
                          {/* Print friendly light colors */}
                          <rect
                            x={p.x}
                            y={p.y}
                            width={p.w}
                            height={p.l}
                            fill="#ffffff"
                            stroke="#18181b"
                            strokeWidth="1.5"
                          />
                          
                          {/* Inner color badge border just to align with original colors */}
                          <line
                            x1={p.x + 1}
                            y1={p.y + 1}
                            x2={p.x + 1}
                            y2={p.y + p.l - 1}
                            stroke={p.cor}
                            strokeWidth="4"
                          />

                          {showLabel && (
                            <>
                              <text
                                x={p.x + p.w / 2}
                                y={p.y + p.l / 2 - 3}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#000000"
                                className="font-bold font-sans"
                                fontSize={Math.max(3.5, Math.min(8, p.w / 8.5))}
                              >
                                {p.nome}
                              </text>
                              <text
                                x={p.x + p.w / 2}
                                y={p.y + p.l / 2 + 5}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#27272a"
                                className="font-mono font-bold"
                                fontSize={Math.max(3, Math.min(6, p.w / 11))}
                              >
                                {p.w}x{p.l} cm
                              </text>
                            </>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Production agreement/notes area */}
        <div className="border-t-2 border-zinc-900 mt-12 pt-6 pb-12 print:pb-0 page-break-inside-avoid">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-[10px] font-black uppercase text-zinc-900 mb-2">
                Notas do Operador / Serra:
              </h4>
              <div className="border border-zinc-300 rounded-xl h-24 p-3 bg-zinc-50/30">
                <p className="text-[9px] text-zinc-400">Insira anotações do plano de corte furos, acabamentos ou fitas de borda...</p>
              </div>
            </div>
            <div className="flex flex-col justify-end items-end space-y-2">
              <div className="w-52 border-b border-zinc-900 h-8"></div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center w-52 leading-none">
                Assinatura Responsável
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Tailwind helper strictly for printing layout breaks on standard layout engines */}
      <style>{`
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            position: static !important;
            background-color: white !important;
            color: black !important;
          }
          .print-report-container {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            width: auto !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .page-break-before {
            page-break-before: always;
            break-before: always;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .print-sheet-layout {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .print-sheet-layout + .print-sheet-layout {
            page-break-before: always;
            break-before: always;
          }
          @page {
            size: auto;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
      `}</style>
    </div>
  );
};
