import { Chapa, Peca } from "../types";

export interface Preset {
  chapas: Chapa[];
  pecas: Peca[];
}

export const PRESET_DATA: Record<string, Preset> = {
  banheiro: {
    chapas: [
      {
        id: "ch_ban_1",
        nome: "MDF Branco 15mm",
        largura: 275,
        comprimento: 184,
        espessura: 1.5,
        valor: 245.0,
      },
    ],
    pecas: [
      { id: "ban_1", nome: "Lateral Gabinete", largura: 50, comprimento: 70, quantidade: 2, cor: "#3b82f6", chapaId: "ch_ban_1" },
      { id: "ban_2", nome: "Base Inferior", largura: 50, comprimento: 80, quantidade: 1, cor: "#10b981", chapaId: "ch_ban_1" },
      { id: "ban_3", nome: "Prateleira Interna", largura: 46, comprimento: 76.8, quantidade: 2, cor: "#f59e0b", chapaId: "ch_ban_1" },
      { id: "ban_4", nome: "Porta Basculante", largura: 39.5, comprimento: 79.5, quantidade: 2, cor: "#ef4444", chapaId: "ch_ban_1" },
      { id: "ban_5", nome: "Aparador Fundo", largura: 15, comprimento: 76.8, quantidade: 2, cor: "#8b5cf6", chapaId: "ch_ban_1" },
    ],
  },
  escritorio: {
    chapas: [
      {
        id: "ch_esc_1",
        nome: "MDF Amadeirado 25mm",
        largura: 275,
        comprimento: 184,
        espessura: 2.5,
        valor: 410.0,
      },
    ],
    pecas: [
      { id: "esc_1", nome: "Tampo Principal", largura: 80, comprimento: 160, quantidade: 1, cor: "#f97316", chapaId: "ch_esc_1" },
      { id: "esc_2", nome: "Pé de Apoio Lateral", largura: 74, comprimento: 78, quantidade: 2, cor: "#06b6d4", chapaId: "ch_esc_1" },
      { id: "esc_3", nome: "Aparador Central", largura: 40, comprimento: 140, quantidade: 1, cor: "#6366f1", chapaId: "ch_esc_1" },
      { id: "esc_4", nome: "Lateral Gaveteiro", largura: 52, comprimento: 65, quantidade: 2, cor: "#ef4444", chapaId: "ch_esc_1" },
      { id: "esc_5", nome: "Frente Gaveta Pequena", largura: 18, comprimento: 36, quantidade: 3, cor: "#14b8a6", chapaId: "ch_esc_1" },
    ],
  },
  estante: {
    chapas: [
      {
        id: "ch_est_1",
        nome: "MDF Noce Oro 18mm",
        largura: 275,
        comprimento: 184,
        espessura: 1.8,
        valor: 320.0,
      },
    ],
    pecas: [
      { id: "est_1", nome: "Lateral MDF", largura: 30, comprimento: 220, quantidade: 2, cor: "#8b5cf6", chapaId: "ch_est_1" },
      { id: "est_2", nome: "Base Superior/Inferior", largura: 30, comprimento: 90, quantidade: 2, cor: "#ef4444", chapaId: "ch_est_1" },
      { id: "est_3", nome: "Prateleiras Reguláveis", largura: 28, comprimento: 86.4, quantidade: 5, cor: "#3b82f6", chapaId: "ch_est_1" },
      { id: "est_4", nome: "Fundo Traseiro", largura: 89.4, comprimento: 218, quantidade: 1, cor: "#10b981", chapaId: "ch_est_1" },
    ],
  },
};
