import { Chapa, Peca, SheetLayout, PackedPeca, FreeRect, PackingResult } from "../types";

/**
 * Heurística de Empacotamento 2D (Guillotine Cut BAF) para Chapas de Madeira
 */
export function otimizarCorte(
  chapas: Chapa[],
  pecasOriginal: Peca[],
  kerf: number = 0.3, // espessura da serra em cm
  permitirRotacao: boolean = true
): PackingResult {
  const layouts: SheetLayout[] = [];
  const unpacked: PackingResult["unpacked"] = [];

  let globalSheetIdCounter = 1;
  let totalAreaChapaSum = 0;
  let totalAreaPecasSum = 0;
  let totalCostSum = 0;

  if (chapas.length === 0) {
    return {
      layouts: [],
      unpacked: pecasOriginal.map(p => ({
        nome: p.nome,
        largura: p.largura,
        comprimento: p.comprimento,
        motivo: "Nenhuma chapa cadastrada para este corte.",
      })),
      totalSheets: 0,
      totalCost: 0,
      totalAreaChapa: 0,
      totalAreaPecas: 0,
      aproveitamentoGeralPct: 0,
    };
  }

  // Para cada chapa cadastrada, rodamos o empacotamento
  chapas.forEach((chapa) => {
    const pecasParaEstaChapa = pecasOriginal.filter(p => p.chapaId === chapa.id);
    if (pecasParaEstaChapa.length === 0) return;

    // 1. Expandir as peças por quantidade
    interface ItemDemanda {
      id: string; // id original + index
      pecaId: string;
      nome: string;
      w: number; // largura original
      l: number; // comprimento original
      cor: string;
    }

    const demandas: ItemDemanda[] = [];
    pecasParaEstaChapa.forEach((p) => {
      // Validar se a peça individual cabe em uma chapa vazia (mesmo que rotacionada)
      const cabeNormal = p.largura <= chapa.largura && p.comprimento <= chapa.comprimento;
      const cabeRotacionada = permitirRotacao && p.comprimento <= chapa.largura && p.largura <= chapa.comprimento;

      if (!cabeNormal && !cabeRotacionada) {
        unpacked.push({
          nome: p.nome,
          largura: p.largura,
          comprimento: p.comprimento,
          motivo: `Dimensões (${p.largura}x${p.comprimento} cm) excedem o tamanho máximo da chapa "${chapa.nome}" (${chapa.largura}x${chapa.comprimento} cm).`,
        });
        return;
      }

      for (let i = 0; i < p.quantidade; i++) {
        demandas.push({
          id: `${p.id}_${i}`,
          pecaId: p.id,
          nome: p.nome,
          w: p.largura,
          l: p.comprimento,
          cor: p.cor,
        });
      }
    });

    // 2. Ordenar as demandas pela área decrescente (Heurística clássica de bin packing)
    demandas.sort((a, b) => b.w * b.l - a.w * a.l);

    let activeDemandas = [...demandas];
    let localSheetCounter = 1;
    const MAX_SHEETS_PER_CHAPA = 100;

    while (activeDemandas.length > 0 && localSheetCounter <= MAX_SHEETS_PER_CHAPA) {
      let freeRects: FreeRect[] = [
        { x: 0, y: 0, w: chapa.largura, l: chapa.comprimento },
      ];
      const packedPieces: PackedPeca[] = [];
      const remainingDemandasThisSheet: ItemDemanda[] = [];

      let packedAnyCount = 0;

      for (let i = 0; i < activeDemandas.length; i++) {
        const item = activeDemandas[i];
        let bestRectIndex = -1;
        let minWasteArea = Infinity;
        let useRotated = false;

        // Encontrar o melhor retângulo livre para esta peça
        for (let j = 0; j < freeRects.length; j++) {
          const r = freeRects[j];

          // Verificar se cabe sem rotação
          if (item.w <= r.w && item.l <= r.l) {
            const waste = r.w * r.l - item.w * item.l;
            if (waste < minWasteArea) {
              minWasteArea = waste;
              bestRectIndex = j;
              useRotated = false;
            }
          }

          // Verificar se cabe com rotação (se permitido)
          if (permitirRotacao && item.l <= r.w && item.w <= r.l) {
            const waste = r.w * r.l - item.w * item.l;
            if (waste < minWasteArea) {
              minWasteArea = waste;
              bestRectIndex = j;
              useRotated = true;
            }
          }
        }

        // Se encontrou um retângulo onde cabe, posicionar a peça e dividir o espaço
        if (bestRectIndex !== -1) {
          const freeRect = freeRects[bestRectIndex];
          const p_w = useRotated ? item.l : item.w;
          const p_l = useRotated ? item.w : item.l;

          // Registrar peça posicionada
          packedPieces.push({
            id: item.id,
            nome: item.nome,
            x: freeRect.x,
            y: freeRect.y,
            w: p_w,
            l: p_l,
            originalW: item.w,
            originalL: item.l,
            rotated: useRotated,
            cor: item.cor,
          });

          // Remover o retângulo livre que foi utilizado
          freeRects.splice(bestRectIndex, 1);

          // Dividir o retângulo restante (Guillotine cut)
          const remW = freeRect.w - p_w - kerf;
          const remL = freeRect.l - p_l - kerf;

          const splitHorizontal = remW <= remL;

          if (splitHorizontal) {
            const r1: FreeRect = {
              x: freeRect.x + p_w + kerf,
              y: freeRect.y,
              w: freeRect.w - p_w - kerf,
              l: p_l,
            };
            const r2: FreeRect = {
              x: freeRect.x,
              y: freeRect.y + p_l + kerf,
              w: freeRect.w,
              l: freeRect.l - p_l - kerf,
            };

            if (r1.w > 0.01 && r1.l > 0.01) freeRects.push(r1);
            if (r2.w > 0.01 && r2.l > 0.01) freeRects.push(r2);
          } else {
            const r1: FreeRect = {
              x: freeRect.x + p_w + kerf,
              y: freeRect.y,
              w: freeRect.w - p_w - kerf,
              l: freeRect.l,
            };
            const r2: FreeRect = {
              x: freeRect.x,
              y: freeRect.y + p_l + kerf,
              w: p_w,
              l: freeRect.l - p_l - kerf,
            };

            if (r1.w > 0.01 && r1.l > 0.01) freeRects.push(r1);
            if (r2.w > 0.01 && r2.l > 0.01) freeRects.push(r2);
          }

          packedAnyCount++;
        } else {
          // Não coube nesta chapa, fica para as próximas chapas
          remainingDemandasThisSheet.push(item);
        }
      }

      // Se criou uma chapa mas nenhuma peça coube nela, temos um problema de trava (segurança)
      if (packedAnyCount === 0) {
        activeDemandas.forEach((item) => {
          unpacked.push({
            nome: item.nome,
            largura: item.w,
            comprimento: item.l,
            motivo: `Não pôde ser alocada na chapa "${chapa.nome}" devido a espaçamentos de corte (Kerf) ou fragmentação de chapas.`,
          });
        });
        break;
      }

      // Calcular estatísticas da chapa atual
      const areaChapaTotal = chapa.largura * chapa.comprimento;
      const areaUtilizada = packedPieces.reduce((acc, p) => acc + p.w * p.l, 0);
      const areaLivre = areaChapaTotal - areaUtilizada;
      const aproveitamentoPct = Number(((areaUtilizada / areaChapaTotal) * 100).toFixed(1));

      layouts.push({
        id: globalSheetIdCounter,
        chapa: chapa,
        packedPieces,
        freeSpaces: freeRects,
        aproveitamentoPct,
        areaUtilizada,
        areaLivre,
      });

      totalAreaChapaSum += areaChapaTotal;
      totalAreaPecasSum += areaUtilizada;
      totalCostSum += chapa.valor;

      globalSheetIdCounter++;
      localSheetCounter++;
      activeDemandas = remainingDemandasThisSheet;
    }

    // Se excedeu o limite máximo de chapas, descarregar o resto em unpacked
    if (activeDemandas.length > 0 && localSheetCounter > MAX_SHEETS_PER_CHAPA) {
      activeDemandas.forEach((item) => {
        unpacked.push({
          nome: item.nome,
          largura: item.w,
          comprimento: item.l,
          motivo: `Limite de chapas excedido (máximo de 100) para a chapa "${chapa.nome}".`,
        });
      });
    }
  });

  // Para peças com chapaId inválido (ou seja, se a chapa correspondente não existir mais)
  const chapasIds = new Set(chapas.map(c => c.id));
  pecasOriginal.forEach(p => {
    if (!chapasIds.has(p.chapaId)) {
      unpacked.push({
        nome: p.nome,
        largura: p.largura,
        comprimento: p.comprimento,
        motivo: "Chapa associada não foi encontrada.",
      });
    }
  });

  const totalSheets = layouts.length;
  const aproveitamentoGeralPct = totalAreaChapaSum > 0
    ? Number(((totalAreaPecasSum / totalAreaChapaSum) * 100).toFixed(1))
    : 0;

  return {
    layouts,
    unpacked,
    totalSheets,
    totalCost: totalCostSum,
    totalAreaChapa: totalAreaChapaSum,
    totalAreaPecas: totalAreaPecasSum,
    aproveitamentoGeralPct,
  };
}
