# Housefinds — direção Ella, 25/09/2026

Evolução local da rodada `redesign-refined.md`, após o pedido de uma aparência mais moderna e a correção dos links de referência. Branch `codex/housefinds-composition`, baseada no frontend `headless-storefront`. Sem commit, push ou publicação. Tema WordPress preservado.

## Referências realmente examinadas

- [Ella — Industrial Tool / Home 15](https://new-ella-demo-07.myshopify.com/?preview_theme_id=141768589417): busca central, navegação explícita por categorias, imagens de produtos com presença e ações comerciais compreensíveis. Home examinada na abertura e nas seções de campanhas, categorias e produtos.
- [Ella — Dietary Supplement / Home 35](https://new-ella.myshopify.com/?fts=0&preview_theme_id=133104730210): títulos sem serifa mais firmes, fotos amplas e continuidade entre campanha e seleção de produtos. Abertura, categorias, vitrine e campanha examinadas no desktop; abertura também no celular.

O Shopify removeu a query após ativar a prévia, mas sua barra identificou os temas corretos. As versões padrão de moda e café vistas antes da correção não fundamentam esta entrega. Não foram transplantadas cores, promoções, selos ou páginas completas das referências.

## Decisões de composição

- Cabeçalho com logo, busca permanente e carrinho; segunda linha de categorias e Under £20 no desktop. No celular, logo e ações ficam acima da busca. Sugestões mostram nome e preço sem truncar os títulos como antes.
- Hero usa a cena de cozinha existente em largura total, com contraste, título Inter mais firme e duas ações diretas. A indicação de cena ilustrativa permanece. Logo abaixo, três produtos reais têm nomes e preços; a faixa usa rolagem nativa no celular.
- Ordem: abertura e achados → vitrine com abas → categorias → campanhas de cozinha e organização → produto escolhido → Under £20 → marca → rodapé. A seleção comercial chega antes das categorias maiores.
- Cartões de produto abertos, com preço estático legível e botão nativo para escolher opções. Nada de adicionar uma variação arbitrária ao carrinho.
- Categorias ganham fotografias maiores sobre fundo sálvia contínuo. Campanhas usam duas imagens amplas com informação abaixo. O destaque usa o nome real do produto como título principal, com utilidade, preço e ação próximos.
- Inter conduz títulos comerciais; Lora permanece em notas e momentos de marca. Rodapé carvão encerra a página com contraste. Transições e movimentos discretos existentes são preservados, incluindo a regra de movimento reduzido; não foi adicionada biblioteca de animação.
- Mesmas famílias tipográficas, paleta, fotografias, dados comerciais e integrações. Nenhuma mudança em regras de preço, estoque, frete, pagamento, pedido ou DSers.

## Verificação desta rodada

- `npm run build`: sucesso, TypeScript e 22 páginas estáticas. Testes obrigatórios: 12 PDP + 18 checkout + 29 home = 59 aprovados. Log: `output/playwright/ella/build-final.log`.
- A asserção de apresentação do destaque foi ajustada ao novo título; testes de dados comerciais mantidos. `git diff --check` aprovado.
- Home renderizada em 1440×1000, 768×1024, 390×844 e 320×720. Sem overflow horizontal do documento. Rolagens internas de produtos, abas e miniaturas são intencionais.
- Primeiro produto com preço aparece na primeira tela de 390×844. Âncora da vitrine termina abaixo do cabeçalho fixo. Ações da abertura cabem em 320 px.
- Menu final: foco inicial no fechamento, Shift+Tab envolve para Contact, Escape fecha e devolve foco ao acionador; fundo bloqueado durante a abertura e restaurado ao fechar.
- Busca `oil`: sugestões com nomes/preços; botão de envio abre quatro resultados. Abas por teclado mantêm um único painel selecionado.
- Catálogo: categoria Kitchen Tools, limite Under £10, ordenação crescente e limpeza de filtros conferidos; menus fecham na navegação e cabem no celular. Botão de opções abre a página real.
- Produto desktop/mobile: próxima imagem, ampliação, ArrowRight no visualizador e Escape com devolução de foco. Seleção Standard / 500ml / White → £9.15 e disponibilidade real.
- Carrinho real: duas unidades → £18.30; gaveta e página completa em desktop/mobile; decremento → uma unidade / £9.15. Item de teste removido e estado vazio confirmado. Nenhum pedido ou pagamento enviado.
- Console da aba de produção sem erros durante o roteiro final.

## Evidências e limites

- Prévia local: http://127.0.0.1:3001/
- Comparação: http://127.0.0.1:3002/ella/
- Imagens: `output/playwright/ella/`. Os arquivos `before-*` são da última versão local concluída (`refined`); `after-*` são desta compilação. Fotografias, produtos e dados equivalentes; texto do hero encurtado e seções reordenadas deliberadamente.
- Galeria inclui home desktop/mobile, categorias, vitrine, produto em destaque, catálogo, menu, opções, visualizador e carrinho. Capturas usam viewport emulada, não aparelho físico.
- Não verificados: aparelho físico, Safari, leitor de tela e pagamento real. Os testes de checkout são automatizados; não equivalem a uma compra concluída.
- Divergência preexistente entre importações duplicadas de alguns produtos continua fora do escopo visual. A regra de deduplicação e a ordem da API foram preservadas.
