# Housefinds — banner e ritmo de loja, 25/09/2026

Redesenho na branch `codex/housefinds-composition`, pasta `storefront`, preparado para integração em `headless-storefront`. A branch `main` contém o tema WordPress e permanece fora deste trabalho.

## Direção e composição

A referência esclareceu que a home precisava alternar formatos comerciais: uma abertura fotográfica, categorias, produtos, chamadas menores e banners largos. A abertura por abas da rodada anterior foi substituída por esse ritmo.

1. Banner claro com uma nova cena ilustrativa de cozinha, espaço livre à esquerda para a mensagem de marca, duas ações e acesso a um produto real com preço. Na tela larga, a imagem preserva a cena inteira; no celular, texto e fotografia se organizam verticalmente e o preço aparece ainda nessa abertura.
2. Faixa compacta com as informações comerciais já existentes: entrega UK, prazo estimado, devoluções elegíveis e pagamento por cartão.
3. Quatro categorias com imagens e destinos próprios. Categorias vazias não usam um produto de outra categoria como substituto.
4. Vitrine de quatro produtos no desktop e duas colunas no celular. As abas filtram por uso, preservando fotos, nomes, benefícios, preços e acesso às opções.
5. Dois banners com pesos diferentes: fotografia real da tábua em uso, levando à categoria Kitchen Tools, e Digital Spoon Scale com fotografia real, utilidade, preço e destino do produto.
6. Outra seleção com itens diferentes, elegíveis à coleção abaixo de £20. No celular, a faixa usa rolagem horizontal nativa e não amplia o documento.
7. Banner verde de organização com uma cena panorâmica: os objetos aparecem inteiros, com margem acima e abaixo. Abaixo de 900 px, texto e imagem se organizam verticalmente. Segue-se um rodapé claro e compacto, com navegação, contato e políticas preservados.

A paleta existente, Inter e Lora continuam. Lora aparece pontualmente; a hierarquia principal e os preços usam Inter. As superfícies abertas, alinhamentos, variação de tamanho e imagens fazem o trabalho visual. Transições de fotografia, foco e abas respeitam a preferência por movimento reduzido.

## Fotografias e dados

As fotografias da API pública WooCommerce foram examinadas visualmente. Alguns cards agora começam com alternativas mais limpas das mesmas galerias. `merchandising-images.ts` aponta somente para IDs de fotos que já pertencem ao produto, com fallback às fotos originais quando um ID não está disponível. A ordem da galeria e a imagem da variação na página de produto permanecem intactas.

O teste adicional cobre a seleção sem mutar a origem e o fallback quando a foto escolhida não existe. As cenas de ambiente do hero e do banner de organização foram geradas com image_gen a pedido do usuário e continuam identificadas como ilustrativas. Não substituem fotos do catálogo ou de variações. Os arquivos WebP têm aproximadamente 121 KiB e 144 KiB, respectivamente. Fotos de fornecedores que contêm texto continuam reais, inclusive no produto de entrada.

O catálogo, os preços, os estoques, os pedidos, o WooCommerce e o DSers não foram alterados. A regra compartilhada `isUnderTwentyProduct` mantém a exigência de que todas as variações estejam abaixo de £20. Não foram acrescentados descontos, avaliações, selos ou escassez.

## Evidência de verificação

- Build otimizado e TypeScript aprovados, com 22 páginas estáticas. Testes obrigatórios: 12 PDP, 18 checkout e 31 home, total de 61. Log: `output/playwright/merchandising/build-final.log`.
- Home examinada em 1440×1000, 768×1024, 390×844 e 320×720. Capturas e medidas de largura não mostraram overflow horizontal do documento. A rolagem interna das abas e da faixa de orçamento é deliberada.
- As abas funcionaram por clique e teclado. End selecionou Daily Helpers e moveu o foco; apenas um painel ficou ativo. Space Saving mostrou os dois produtos correspondentes e abriu a categoria real com dois resultados.
- A busca por oil retornou quatro produtos reais. O novo card abriu a página do Oil Spray Bottle.
- Galeria: avanço à Photo 2, abertura do zoom e fechamento por Escape. A seleção Standard / 500ml / White atualizou o preço para £9.15 e manteve disponibilidade e foto da opção.
- O carrinho estava vazio antes do teste. Foi incluída uma unidade da opção de £9.15. Drawer desktop/mobile e página completa mostraram item, opção e subtotal corretos. O item de teste foi removido e a página voltou ao estado Nothing here yet.
- Menu móvel: Shift+Tab do primeiro controle voltou ao último link; Escape fechou e devolveu o foco ao botão Open menu.
- A faixa de orçamento rolou de 0 para 338 px, enquanto o documento continuou com 375 px de conteúdo em viewport de 390 px. As ações principais do banner têm 44 px; o link do produto no banner, 54 px.
- Evidências da rodada anterior para filtros/ordenação e demais regras comerciais foram reutilizadas onde os componentes não mudaram. Nesta rodada, foram verificados novamente os cards compartilhados e os principais caminhos até categoria, produto e carrinho.

Limites: testes de viewport em navegador Chromium, sem aparelho físico, Safari, leitor de tela ou pagamento real. Nenhum pedido ou pagamento foi enviado.

## Revisão

- Loja: http://127.0.0.1:3001/
- Comparativo e galeria: http://127.0.0.1:3002/merchandising/
- Capturas: `output/playwright/merchandising/`.
- Antes = versão local imediatamente anterior, descrita em `redesign-structure.md`. Depois = esta rodada, com o mesmo catálogo; composição, ordem e fotografias de prévia selecionadas dentro das galerias foram alteradas.

## Referências

Referência principal: a imagem anexada pelo usuário nesta rodada, pela alternância entre banner inicial, categorias, vitrines e campanhas menores. A composição foi adaptada ao catálogo da Housefinds.

Referências comerciais examinadas em rodadas anteriores e reaproveitadas, sem nova alegação de pesquisa nesta rodada:

- [Ella Industrial Tool](https://new-ella-demo-07.myshopify.com/?preview_theme_id=141768589417): navegação comercial e proximidade entre categorias, produtos e ações.
- [Ella Dietary Supplement](https://new-ella.myshopify.com/?fts=0&preview_theme_id=133104730210): alternância de campanhas e seleções de produtos ao longo da home.
