# Chapa Calculator Pro 2.0 🛠️📐

O **Chapa Calculator Pro 2.0** é um sistema inteligente de planejamento e otimização geométrica bidimensional (2D Bin Packing) voltado para marcenarias, carpintarias e indústrias de móveis. O software simula e gera o melhor plano de corte físico de chapas retangulares (como MDF, MDP, acrílico ou vidro) a partir de uma lista de demandas de corte inserida pelo usuário, reduzindo drasticamente o desperdício de matéria-prima.

---

## 1. Necessidade de Negócio e Valor Agregado

No setor moveleiro e de manufatura, a madeira e placas de MDF representam uma parcela significativa do custo de fabricação. O corte manual ou sem planejamento adequado gera diversos problemas operacionais e financeiros:

* **Desperdício de Material (Refugo):** Sobras pequenas e irregulares que não podem ser aproveitadas, resultando em perda direta de capital.
* **Erros de Medição:** Falta de previsão física sobre onde cada peça será cortada, levando a retrabalhos e perda de materiais.
* **Desconsideração do Kerf (Espessura da Serra):** Cada corte de serra consome fisicamente cerca de 2mm a 4mm de material na forma de pó/serragem. Se não for planejado geometricamente, as últimas peças cortadas ficarão menores do que o especificado.
* **Orientação Estética (Veio da Madeira):** Chapas amadeiradas possuem padrões visuais (veios) que exigem alinhamento. A rotação indiscriminada de peças arruína a estética do móvel final.
* **Orçamentação Imprecisa:** Dificuldade em estimar exatamente quantas chapas inteiras de MDF serão consumidas em um projeto antes de comprá-las.

O **Chapa Calculator Pro 2.5** resolve esses desafios ao computar a distribuição ideal e fornecer planos gráficos interativos com precisão milimétrica.

---

## 2. Principais Funcionalidades

* **Otimização Automática em Lote:** Otimiza instantaneamente múltiplas peças em múltiplas chapas simultaneamente.
* **Cálculo de Desconto de Lâmina (Kerf):** Ajuste fino da espessura da serra física (padrão de 3mm) descontado dinamicamente no espaço livre.
* **Restrição de Rotação por Fibra/Veio:** Habilite ou desabilite a rotação de 90° das peças para preservar o sentido estético do veio da madeira.
* **Visualização SVG Interativa de Alta Fidelidade:**
  - Placa de madeira simulada fielmente com suas proporções de largura e comprimento.
  - Hover sincronizado: ao passar o mouse sobre um item na lista de peças ou sobre o bloco do mapa visual, ambos se destacam mutuamente.
  - **Tooltip Flutuante de Precisão:** Mostra instantaneamente as informações do corte (nome, dimensões originais, status de rotação) e suas coordenadas cartesianas exatas (**posição X e Y** a partir do ponto zero da chapa).
* **Importação e Exportação Rápida:** Área de texto que aceita formatação simples (CSV) para colar listas de corte exportadas de softwares CAD/Sketchup ou planilhas Excel.
* **Gabaritos / Presets Embutidos:** Exemplos reais pré-carregados (como armário de banheiro, estante de livros, mesa de escritório) para testes rápidos e demonstrações de capacidade.
* **Relatório e Modo de Impressão:** Geração de página otimizada para impressão física (PDF ou folha A4) para ser levada diretamente à bancada de corte do marceneiro na fábrica.
* **Persistência de Dados Local:** Salva o estado atual das chapas, peças cadastradas e opções de rotação/serra no `localStorage` do navegador para evitar perda de dados em atualizações acidentais.

---

## 3. Detalhamento Técnico e Algoritmo de Distribuição

### Heurística de Empacotamento: *Guillotine Cut - Best-Area-Fit (BAF) com First-Fit Decreasing (FFD)*

O problema de dispor retângulos menores dentro de um retângulo maior sem sobreposição é classificado como NP-difícil. O sistema resolve isso em tempo real utilizando uma combinação de heurísticas clássicas de geometria computacional:

1. **Ordenação de Demanda (FFD - First-Fit Decreasing):**
   Antes de iniciar o empacotamento, a lista de peças é multiplicada pelas respectivas quantidades e ordenada de forma decrescente pela **área total da peça** ($Largura \times Comprimento$). Isso garante que os maiores componentes (laterais de armários, tampos de mesas) sejam alocados primeiro, enquanto as peças menores preenchem as lacunas residuais.

2. **Corte Guilhotina (Guillotine Split):**
   Toda chapa de madeira começa como um único grande espaço retangular livre. Quando uma peça é alocada em um retângulo livre, ela sempre se posiciona no canto inferior esquerdo dele ($x, y$). O espaço restante deste retângulo é então subdividido em dois retângulos livres menores através de um corte "guilhotina" (uma linha reta de ponta a ponta do bloco livre), que pode ser feito horizontalmente ou verticalmente.
   
   A escolha da direção do corte baseia-se na minimização do desperdício de fragmentação (gerando sub-retângulos com dimensões mais úteis para as próximas peças).

3. **Desconto Dinâmico de Kerf:**
   Durante o processo de subdivisão do retângulo livre, a espessura da lâmina de corte (`kerf`) é subtraída das coordenadas de origem do novo retângulo livre:
   $$\text{Novo Espaço } X = x_{atual} + largura_{peça} + \text{kerf}$$
   $$\text{Novo Espaço } Y = y_{atual} + comprimento_{peça} + \text{kerf}$$
   Isso impossibilita sobreposições físicas causadas pela espessura do disco de serra.

4. **Best-Area-Fit (BAF):**
   Para cada peça, o algoritmo examina todos os retângulos livres disponíveis na chapa ativa e seleciona aquele que resulta na menor sobra de área residual após acomodar a peça. Caso a rotação esteja habilitada, o algoritmo testa ambas as orientações (normal e 90° rotacionada) e adota a que melhor preencher o espaço livre.

5. **Transbordamento Multichapas (Multi-bin Packing):**
   Se uma peça não couber em nenhum espaço livre restante da chapa atual, o algoritmo automaticamente abre uma nova folha de chapa idêntica e continua o processo até alocar todas as peças possíveis. Peças que excedem a dimensão física máxima da chapa cadastrada são isoladas e listadas como "Não Encaixadas", com justificativa legível.

---

## 4. Tecnologias Utilizadas

* **React 19 & TypeScript:** Estrutura base de componentes tipados de alta escalabilidade.
* **Vite:** Ferramenta de build extremamente veloz para bundling de assets e hot-reload no desenvolvimento.
* **Tailwind CSS:** Utilitários CSS modernos para layout responsivo, cores escuras premium da paleta Slate e efeitos de profundidade visual.
* **Lucide React:** Conjunto de ícones vetoriais modernos.
* **Framer Motion:** Biblioteca para micro-animações de entrada e saída na lista de peças e modais.
* **Vetorização SVG Dinâmica:** O plano de corte não usa canvas pixelizado ou imagens. Ele renderiza caminhos vetoriais nativos `<svg>` diretamente na árvore do DOM, assegurando nitidez e zoom infinito sem perda de definição.

---

## 5. Como Executar o Projeto Localmente

### Pré-requisitos
* **Node.js** (versão 18 ou superior)
* **npm** ou **yarn**

### Instalação
1. Clone o repositório ou navegue até a pasta do projeto:
   ```bash
   cd c:\Projetos\chapa-calculator
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```

4. Acesse o projeto no navegador pelo endereço padrão:
   [http://localhost:3000](http://localhost:3000)

### Geração de Build para Produção
Para compilar e otimizar a aplicação para distribuição em produção (gerando os arquivos estáticos prontos na pasta `docs/`):
```bash
npm run build
```
O build estático gerado pode ser hospedado facilmente no GitHub Pages, Vercel ou Netlify.
