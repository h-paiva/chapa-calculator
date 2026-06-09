import React, { useState } from "react";
import { SheetLayout, PackedPeca } from "../types";
import { RotateCw, Layers } from "lucide-react";

interface VisualBoardProps {
  layouts: SheetLayout[];
  hoveredPieceId: string | null;
  setHoveredPieceId: (id: string | null) => void;
}

export const VisualBoard: React.FC<VisualBoardProps> = ({
  layouts,
  hoveredPieceId,
  setHoveredPieceId,
}) => {
  const [selectedSheetId, setSelectedSheetId] = useState<number>(1);
  const [hoveredInstanceId, setHoveredInstanceId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number; isRight: boolean; isBottom: boolean }>({
    x: 0,
    y: 0,
    isRight: false,
    isBottom: false,
  });

  if (layouts.length === 0) return null;

  // Garantir que a chapa selecionada existe
  const activeLayoutIndex = layouts.findIndex((l) => l.id === selectedSheetId);
  const activeLayout = activeLayoutIndex !== -1 ? layouts[activeLayoutIndex] : layouts[0];
  const chapa = activeLayout.chapa;

  // Coordenadas da peça selecionada para o detalhe interativo
  const activeHoveredPiece = activeLayout.packedPieces.find(
    (p) => p.id === hoveredInstanceId || p.id.split("_")[0] === hoveredPieceId
  );

  return (
    <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col h-full justify-between">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-800/60">
        <div>
          <h2 className="font-sans font-bold text-white text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 block"></span>
            Plano de Corte Otimizado
          </h2>
          <p className="text-[11px] text-slate-400">
            Disposição geométrica e encaixe otimizado dos cortes selecionados
          </p>
        </div>

        {/* Seleção de Chapas caso use mais de uma */}
        {layouts.length > 1 && (
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-850 self-start sm:self-auto scrollbar-none overflow-x-auto max-w-[280px] sm:max-w-md">
            {layouts.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedSheetId(l.id)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedSheetId === l.id
                    ? "bg-orange-600 text-white shadow-md shadow-orange-950/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
              >
                Plano #{l.id} ({l.chapa.nome} &bull; {l.aproveitamentoPct}%)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info da Chapa Ativa */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 mb-5 bg-slate-950/50 rounded-xl border border-slate-850/80">
        <div>
          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">
            Material/Chapa
          </span>
          <span className="text-[11px] font-bold text-white truncate block max-w-full">
            {chapa.nome}
          </span>
        </div>
        <div>
          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">
            Aproveitamento
          </span>
          <span className="text-xs font-black text-orange-400 font-mono">
            {activeLayout.aproveitamentoPct}%
          </span>
        </div>
        <div>
          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">
            Área Aproveitada
          </span>
          <span className="text-xs font-bold text-slate-300 font-mono">
            {(activeLayout.areaUtilizada / 10000).toFixed(2)} m²
          </span>
        </div>
        <div>
          <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-wider">
            Sobra Reutilizável
          </span>
          <span className="text-xs font-bold text-slate-450 text-slate-400 font-mono">
            {(activeLayout.areaLivre / 10000).toFixed(2)} m²
          </span>
        </div>
      </div>

      {/* Visual Map (Render SVG com Proporção Humana) */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div
          className="relative w-full max-w-2xl bg-slate-950 rounded-xl p-4 border border-slate-850 flex items-center justify-center"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setTooltipPos({
              x,
              y,
              isRight: x > rect.width * 0.55,
              isBottom: y > rect.height * 0.55,
            });
          }}
        >
          {/* SVG Map */}
          <svg
            viewBox={`0 0 ${chapa.largura} ${chapa.comprimento}`}
            className="w-full h-auto drop-shadow-lg rounded-lg overflow-hidden border border-slate-800"
            style={{ maxHeight: "450px" }}
          >
            {/* Definições para texturas */}
            <defs>
              <pattern
                id="sobra-padrao"
                width="15"
                height="15"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="15"
                  stroke="#334155"
                  strokeWidth="1.5"
                  className="stroke-slate-850"
                />
              </pattern>
            </defs>

            {/* Ficha Principal de Madeira */}
            <rect
              width={chapa.largura}
              height={chapa.comprimento}
              fill="#2e1a0c"
              stroke="#e28a42"
              strokeWidth="2"
            />

            {/* Desenhar Sobras / Áreas livres primeiro */}
            {activeLayout.freeSpaces.map((space, idx) => {
              const showText = space.w > 30 && space.l > 20;
              return (
                <g key={`empty-${idx}`}>
                  <rect
                    x={space.x}
                    y={space.y}
                    width={space.w}
                    height={space.l}
                    fill="url(#sobra-padrao)"
                    stroke="#475569"
                    strokeWidth="0.8"
                    strokeDasharray="4 4"
                  />
                  {showText && (
                    <text
                      x={space.x + space.w / 2}
                      y={space.y + space.l / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-slate-500 font-mono font-bold"
                      fontSize={Math.max(2.5, Math.min(6, space.w / 10))}
                    >
                      Refugo
                    </text>
                  )}
                </g>
              );
            })}

            {/* Desenhar Peças Posicionadas */}
            {activeLayout.packedPieces.map((p) => {
              // Verificar se esta peça está sob hover
              const basePecaId = p.id.split("_")[0];
              const isDirectHover = hoveredInstanceId === p.id;
              const isTableHover = hoveredPieceId === basePecaId;
              const isHovered = isDirectHover || isTableHover;

              const showText = p.w >= 20 && p.l >= 12;
              const showSize = p.w >= 30 && p.l >= 22;

              return (
                <g
                  key={p.id}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredInstanceId(p.id);
                    setHoveredPieceId(basePecaId);
                  }}
                  onMouseLeave={() => {
                    setHoveredInstanceId(null);
                    setHoveredPieceId(null);
                  }}
                >
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.w}
                    height={p.l}
                    fill={p.cor}
                    fillOpacity={isHovered ? 0.95 : 0.75}
                    stroke={isHovered ? "#ffffff" : p.cor}
                    strokeWidth={isHovered ? 2.5 : 0.8}
                    rx="1.5"
                    className="transition-all duration-150"
                  />

                  {/* Detalhes de Texto */}
                  {showText && (
                    <text
                      x={p.x + p.w / 2}
                      y={p.y + p.l / 2 - (showSize ? 3 : 0)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontWeight="700"
                      className="drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] fill-white pointer-events-none"
                      fontSize={Math.max(3, Math.min(8, p.w / 8))}
                    >
                      {p.nome}
                    </text>
                  )}

                  {showSize && (
                    <text
                      x={p.x + p.w / 2}
                      y={p.y + p.l / 2 + 5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#ffffff"
                      fontWeight="600"
                      className="drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.8)] fill-white/90 font-mono pointer-events-none"
                      fontSize={Math.max(2.5, Math.min(5.5, p.w / 11))}
                    >
                      {p.w}x{p.l} cm
                    </text>
                  )}

                  {/* Ícone de rotação se a peça foi rotacionada */}
                  {p.rotated && p.w >= 15 && p.l >= 15 && (
                    <g
                      transform={`translate(${p.x + p.w - 11}, ${p.y + p.l - 11})`}
                      className="opacity-90 pointer-events-none"
                    >
                      <rect width="8" height="8" rx="2" fill="none" />
                      <path
                        d="M2 4 C 2 2, 6 2, 6 4 M 6 3 L 6 5 L 4 5"
                        stroke="#ffffff"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip */}
          {activeHoveredPiece && hoveredInstanceId && (
            <div
              className="absolute z-50 pointer-events-none bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-2xl flex flex-col gap-1.5 text-slate-200 transition-all duration-75 ease-out select-none min-w-[160px] border border-orange-500/20"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                transform: `translate(${tooltipPos.isRight ? "-110%" : "15px"}, ${tooltipPos.isBottom ? "-110%" : "15px"})`,
              }}
            >
              <div className="flex items-center gap-2 border-b border-slate-800/80 pb-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm shrink-0"
                  style={{ backgroundColor: activeHoveredPiece.cor }}
                />
                <span className="text-xs font-bold text-white leading-tight truncate">
                  {activeHoveredPiece.nome}
                </span>
              </div>
              <div className="flex flex-col gap-1 font-mono text-[10px]">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 font-sans">Dimensões:</span>
                  <span className="text-slate-100 font-bold">
                    {activeHoveredPiece.originalW} x {activeHoveredPiece.originalL} cm
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 font-sans">Posição X:</span>
                  <span className="text-orange-400 font-bold">
                    {activeHoveredPiece.x.toFixed(1)} cm
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400 font-sans">Posição Y:</span>
                  <span className="text-orange-400 font-bold">
                    {activeHoveredPiece.y.toFixed(1)} cm
                  </span>
                </div>
              </div>
              {activeHoveredPiece.rotated && (
                <div className="text-[9px] text-orange-400 font-bold flex items-center gap-1 mt-1 border-t border-slate-800/60 pt-1">
                  <RotateCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} /> Rotacionado 90°
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informação sobre os eixos (X/Y) */}
        <div className="w-full flex items-center justify-between text-[10px] text-slate-500 mt-2 font-bold font-mono px-1 uppercase tracking-wider">
          <span>Sentido Horizontal X: {chapa.largura} cm &bull; {chapa.nome}</span>
          <span>Sentido Vertical Y: {chapa.comprimento} cm &bull; {chapa.nome}</span>
        </div>
      </div>

      {/* Caixa Interativa de Peça Ativa */}
      <div className="mt-5 p-3.5 bg-slate-950/40 rounded-xl border border-slate-850/80 min-h-[56px] flex items-center justify-between">
        {activeHoveredPiece ? (
          <div className="flex items-center justify-between w-full">
            <div>
              <span
                className="inline-block w-2.5 h-2.5 rounded-full mr-2 shadow-sm border border-white/20 animate-pulse"
                style={{ backgroundColor: activeHoveredPiece.cor }}
              />
              <span className="text-xs font-bold text-white">
                {activeHoveredPiece.nome}
              </span>
              <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md ml-2 text-slate-400 font-semibold font-mono">
                X: {activeHoveredPiece.x.toFixed(0)}cm | Y: {activeHoveredPiece.y.toFixed(0)}cm
              </span>
            </div>
            <div className="text-right text-xs font-mono font-bold text-slate-355 text-slate-300">
              <span>
                {activeHoveredPiece.originalW} x {activeHoveredPiece.originalL} cm
              </span>
              {activeHoveredPiece.rotated ? (
                <span className="text-orange-400 ml-2 font-sans font-bold flex items-center gap-0.5 inline-flex">
                  <RotateCw className="w-3.5 h-3.5" /> Rotacionado
                </span>
              ) : (
                <span className="text-slate-500 ml-2 font-sans">Sem rotação</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 text-center w-full">
            Passe o mouse ou toque nas peças da placa de madeira para analisar sua coordenadas.
          </p>
        )}
      </div>
    </div>
  );
};
