# Housefinds — refinamento da composição, 25/09/2026

Evolução local solicitada após a prévia descrita em `redesign-modern.md`. A branch segue `codex/housefinds-composition`, baseada no frontend `headless-storefront`. Sem commit, push ou publicação. O tema WordPress não foi alterado.

## O que mudou

- Cabeçalho em uma linha no desktop, com logo, navegação, busca e carrinho no mesmo alinhamento. A moldura arredondada separada foi removida.
- Abertura sobre superfície aberta, com a cena de cozinha já existente e indicação explícita de imagem ilustrativa. As fotografias de produtos reais passaram para uma faixa independente com nome, preço e destino direto.
- Três produtos simultâneos no desktop; faixa com rolagem nativa no celular. A versão anterior escondia dois dos três produtos atrás dos seletores do hero.
- Categorias compactas, seguidas da vitrine por uso. Cozinha e organização antecedem o produto em destaque, em composições horizontais mais curtas; linhas repetidas de benefícios e ícones foram removidas.
- Destaque de produto em faixa verde contínua e mais compacta. Imagens e controles de catálogo, produto e carrinho compartilham formas e alinhamentos.
- Preservados Lora, Inter, marfim, bege, sálvia, carvão, dados comerciais, fotografias originais e integrações WooCommerce/DSers. Nenhuma alteração em preço, estoque, frete, pagamento ou pedidos.

## Evidência desta rodada

- Build e TypeScript aprovados, com 59 verificações obrigatórias: 12 PDP, 18 checkout e 29 home. Log: `output/playwright/refined/build-final.log`.
- O teste de apresentação de benefícios foi atualizado para a retirada deliberada das linhas redundantes; os testes de dados e limites comerciais permanecem intactos.
- Home inspecionada em 320×720, 390×844, 768×1024 e 1440×1000. Sem overflow horizontal do documento. A faixa de produtos e as abas têm rolagem interna intencional.
- Em 320 px, as duas ações da abertura ficaram na mesma linha, mantendo áreas de toque; primeiro produto em y≈648. Em 390 px, produto, nome e preço aparecem na primeira tela.
- Busca por `door closer`: sugestões, Enter e página com três resultados. Dropdown cabe dentro do desktop.
- Abas por teclado: ArrowRight de Kitchen Tools seleciona Space Saving, com foco e apenas um painel visível.
- Menu mobile: foco inicial no fechamento, Shift+Tab envolve para Contact, Escape fecha, retorna ao acionador e restaura a rolagem de fundo.
- Categorias abrem listas reais. Filtro Under £10 mantém parâmetros na URL; limpar filtros retorna ao catálogo; menus fecham após navegação. Popup mobile entre x=20 e x=355 em viewport de 390.
- Ordenação Price: low to high conferida na versão compilada: mínimos de £1.84 a £27.05. Permanece a divergência de importações duplicadas preexistente documentada na rodada anterior; não foi alterada nesta tarefa visual.
- PDP desktop/mobile: próxima foto, ampliação, ArrowRight no visualizador e Escape com restauração de foco. Variação Standard / 500ml / White mostrou £9.15 e disponibilidade real.
- Carrinho real: adição, incremento para duas unidades e total £18.30. Gaveta e página completa inspecionadas. Item usado no teste removido; página vazia confirmada. Nenhum pedido ou pagamento enviado.

## Referências reutilizadas

Inspeção visual anterior reaproveitada: [Wellina](https://themes.shopify.com/themes/pebble/presets/wellina), pelas abas comerciais e movimento discreto; [Impact / Cocoon](https://impact-theme-home.myshopify.com/), pela relação entre ambiente e produtos; [Full Circle](https://fullcirclehome.com/), pela organização por utilidade. Sem nova pesquisa ampla ou troca de stack.

## Entrega e limites

Prévia: http://127.0.0.1:3001/ . Comparação: http://127.0.0.1:3002/refined/ . Evidências em `output/playwright/refined/`, ignoradas pelo Git. Antes significa a prévia local imediatamente anterior; capturas equivalentes em desktop e celular. A imagem contextual já existia no site e foi recomposta; não se trata de uma fotografia exata de um SKU.

Não verificados: aparelho físico e toque real, Safari, leitor de tela e pagamento real. Movimento reduzido preservado por CSS, sem emulação da preferência do sistema. As verificações de galeria, filtros e comércio foram reaproveitadas após a última correção exclusiva de rolagem da faixa da home, pois seus arquivos e comportamentos não mudaram.

## Correção final de foco

Defeito reproduzido na faixa mobile: Tab para o terceiro produto deixava o link entre x=291 e x=560, com viewport útil de 375 px. O encaixe obrigatório de rolagem prendia a faixa no segundo item. Após remover esse encaixe e manter a rolagem nativa, o mesmo fluxo mostrou o terceiro produto entre x=86 e x=355, totalmente visível e com contorno de foco. Build final repetido apenas após essa alteração e aprovado. Seções de descoberta mobile também inspecionadas após a correção.

Console da sessão compilada: nenhum erro reportado pelo navegador durante os fluxos conferidos. Comparações desktop/mobile e alternador da galeria local abertos e verificados. `git diff --check` aprovado. Os servidores escutam apenas em loopback; comandos de reinício permanecem os mesmos da rodada anterior, com a galeria atual em `/refined/`.
