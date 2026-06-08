import { Chapa, Peca, SheetLayout, PackedPeca, FreeRect, PackingResult } from "../types";

/**
 * Heurística de Empacotamento 2D (Guillotine Cut BAF) para Chapas de Madeira
 */
export function otimizarCorte(
  chapa: Chapa,
  pecasOriginal: Peca[],
  kerf: number = 0.3, // espessura da serra em cm
  permitirRotacao: boolean = true
): PackingResult {
  const layouts: SheetLayout[] = [];
  const unpacked: PackingResult["unpacked"] = [];

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
  pecasOriginal.forEach((p) => {
    // Validar se a peça individual cabe em uma chapa vazia (mesmo que rotacionada)
    const cabeNormal = p.largura <= chapa.largura && p.comprimento <= chapa.comprimento;
    const cabeRotacionada = permitirRotacao && p.comprimento <= chapa.largura && p.largura <= chapa.comprimento;

    if (!cabeNormal && !cabeRotacionada) {
      unpacked.push({
        nome: p.nome,
        largura: p.largura,
        comprimento: p.comprimento,
        motivo: `Dimensões (${p.largura}x${p.comprimento} cm) excedem o tamanho máximo da chapa (${chapa.largura}x${chapa.comprimento} cm).`,
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
  // Peças maiores primeiro preenchem muito melhor o espaço
  demandas.sort((a, b) => b.w * b.l - a.w * a.l);

  let activeDemandas = [...demandas];
  let sheetIdCounter = 1;

  // Limite de segurança para evitar loops infinitos
  const MAX_SHEETS = 100;

  while (activeDemandas.length > 0 && sheetIdCounter <= MAX_SHEETS) {
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
          // Preferir orientação que deixe menos resíduos ou no mesmo critério
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
        // Decidiremos a direção do corte baseado no tamanho residual
        const remW = freeRect.w - p_w - kerf;
        const remL = freeRect.l - p_l - kerf;

        // Se a largura livre do resto for maior, cortamos verticalmente
        // Caso contrário, cortamos horizontalmente para maximizar blocos utilizáveis
        const splitHorizontal = remW <= remL;

        if (splitHorizontal) {
          // Sub-retângulo 1: Direita do corte
          const r1: FreeRect = {
            x: freeRect.x + p_w + kerf,
            y: freeRect.y,
            w: freeRect.w - p_w - kerf,
            l: p_l,
          };
          // Sub-retângulo 2: Abaixo do corte
          const r2: FreeRect = {
            x: freeRect.x,
            y: freeRect.y + p_l + kerf,
            w: freeRect.w,
            l: freeRect.l - p_l - kerf,
          };

          if (r1.w > 0.01 && r1.l > 0.01) freeRects.push(r1);
          if (r2.w > 0.01 && r2.l > 0.01) freeRects.push(r2);
        } else {
          // Sub-retângulo 1: Direita do corte
          const r1: FreeRect = {
            x: freeRect.x + p_w + kerf,
            y: freeRect.y,
            w: freeRect.w - p_w - kerf,
            l: freeRect.l,
          };
          // Sub-retângulo 2: Abaixo do corte
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
      // Mover o resto para unpacked por falta de espaço ou kerf apertado
      activeDemandas.forEach((item) => {
        unpacked.push({
          nome: item.nome,
          largura: item.w,
          comprimento: item.l,
          motivo: "Não pôde ser alocada devido a espaçamentos de corte (Kerf) ou fragmentação de chapas.",
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
      id: sheetIdCounter,
      packedPieces,
      freeSpaces: freeRects,
      aproveitamentoPct,
      areaUtilizada,
      areaLivre,
    });

    sheetIdCounter++;
    activeDemandas = remainingDemandasThisSheet;
  }

  // Se excedeu o limite máximo de chapas, descarregar o resto em unpacked
  if (activeDemandas.length > 0 && sheetIdCounter > MAX_SHEETS) {
    activeDemandas.forEach((item) => {
      unpacked.push({
        nome: item.nome,
        largura: item.w,
        comprimento: item.l,
        motivo: "Limite de chapas excedido (máximo de 100). Reduza a quantidade ou aumente a chapa.",
      });
    });
  }

  // 3. Montar o resultado consolidado
  const totalAreaChapa = chapa.largura * chapa.comprimento;
  const numChapasUsadas = layouts.length;
  const totalCost = numChapasUsadas * chapa.valor;

  let totalAreaPecas = 0;
  layouts.forEach((lay) => {
    totalAreaPecas += lay.areaUtilizada;
  });

  const totalAreaDisponivel = numChapasUsadas * totalAreaChapa;
  const aproveitamentoGeralPct = totalAreaDisponivel > 0
    ? Number(((totalAreaPecas / totalAreaDisponivel) * 100).toFixed(1))
    : 0;

  return {
    layouts,
    unpacked,
    totalSheets: numChapasUsadas,
    totalCost,
    totalAreaChapa,
    totalAreaPecas,
    aproveitamentoGeralPct,
  };
}
