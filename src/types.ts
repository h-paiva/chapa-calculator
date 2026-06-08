export interface Chapa {
  largura: number; // in cm
  comprimento: number; // in cm
  espessura: number; // in cm
  valor: number; // cost in BRL
}

export interface Peca {
  id: string;
  nome: string;
  largura: number; // in cm
  comprimento: number; // in cm
  quantidade: number;
  cor: string; // Tailwind color or hex
}

export interface PackedPeca {
  id: string;
  nome: string;
  x: number;
  y: number;
  w: number;
  l: number;
  originalW: number;
  originalL: number;
  rotated: boolean;
  cor: string;
}

export interface FreeRect {
  x: number;
  y: number;
  w: number;
  l: number;
}

export interface SheetLayout {
  id: number;
  packedPieces: PackedPeca[];
  freeSpaces: FreeRect[];
  aproveitamentoPct: number; // percentage of sheet area used by pieces
  areaUtilizada: number; // in cm²
  areaLivre: number; // in cm²
}

export interface PackingResult {
  layouts: SheetLayout[];
  unpacked: {
    nome: string;
    largura: number;
    comprimento: number;
    motivo: string;
  }[];
  totalSheets: number;
  totalCost: number;
  totalAreaChapa: number;
  totalAreaPecas: number;
  aproveitamentoGeralPct: number;
}
