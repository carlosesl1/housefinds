# Housefinds — composição contemporânea, 25/09/2026

> A prévia atual está descrita em [redesign-refined.md](redesign-refined.md). Este documento preserva a evidência da rodada anterior.

## Escopo

Evolução autorizada da prévia local, após a pesquisa de lojas e temas Shopify. Branch `codex/housefinds-composition`, frontend em `storefront`, origem `headless-storefront`. Sem commit, push ou publicação. O tema WordPress da main não foi alterado.

Mantidos marfim, bege quente, sálvia, carvão, Lora e Inter; conteúdo comercial, fotografias e catálogo real. Nenhuma alteração nas regras de preço, estoque, frete, pagamento, pedidos ou integrações WooCommerce/DSers.

## Decisões

- O cabeçalho forma uma barra contínua ao rolar, sem mudar a altura dos controles. Busca e categorias mantêm posições familiares.
- O hero mantém o primeiro produto e fotografia da prévia anterior, mas ganha três seleções manuais com imagem, descrição, preço e destino sincronizados. Não há rotação automática.
- Categorias compactas antecedem a vitrine com abas por uso. As abas aceitam setas, Home e End, mantêm foco e expõem apenas o painel selecionado.
- Quatro produtos por linha no desktop, dois no celular; fotos abertas, preço legível e acesso às opções. A seta duplicada sobre a fotografia foi removida.
- A sequência passa de seleção de produtos para um achado em destaque, descobertas por ambiente, seleção por preço e critérios da loja. Cada bloco tem composição própria dentro dos mesmos alinhamentos.
- Catálogo, produto e carrinho compartilham tipografia, formas, superfícies e controles. Galeria, seleção obrigatória de variações e ação móvel continuam disponíveis.
- Movimento curto na troca de produto, imagens, entrada das seções e gavetas. Conteúdo permanece visível sem IntersectionObserver; regras globais de movimento reduzido continuam presentes. Sem biblioteca nova de animação.

## Referências examinadas

A inspeção visual da etapa de pesquisa foi reaproveitada; estes links não são indicação de migração para Shopify.

- [Wellina](https://themes.shopify.com/themes/pebble/presets/wellina), [demo](https://pebble-wellina.myshopify.com/): cabeçalho que muda ao rolar, abas comerciais e troca coordenada de imagem/texto. Não reproduzir cápsulas, contadores ou comparadores sem dados apropriados.
- [Impact / Cocoon](https://impact-theme-home.myshopify.com/): presença das fotografias e transição entre conteúdo de ambiente e produtos com preço.
- [Full Circle](https://fullcirclehome.com/): organização de utilidades domésticas pela tarefa que resolvem.

## Evidência e verificação desta rodada

- Build final aprovado, incluindo TypeScript, 22 páginas estáticas e os 59 checks obrigatórios (12 PDP, 18 checkout, 29 home). Log: `output/playwright/modern/build-final.log`.
- `npm run typecheck` também aprovado antes do último ajuste do atributo de rolagem; o TypeScript do build final cobre esse ajuste.
- Navegador Chromium: home inspecionada em 320×720, 390×844, 768×1024 e 1440×1000. Sem overflow horizontal do documento nas larguras medidas. A comparação da home usa viewports equivalentes de 1440×1000 e 390×844; capturas do navegador podem omitir a borda da barra de rolagem. A captura do carrinho desktop usa 1280×720.
- Hero: seleção Easier cooking atualizou foto, nome, destino e faixa real £3.12–£19.40. Abas: clique e ArrowRight trocaram para Space Saving, com aria-selected e foco coerentes.
- Menu móvel: abre, bloqueia rolagem de fundo, inicia no fechamento, Shift+Tab envolve para Contact, Escape fecha e retorna ao acionador. Busca: sugestões de door closer; Enter abriu a busca com três resultados.
- Filtros: Kitchen Tools mostrou quatro produtos; Under £10 aplicou o parâmetro; Clear all o removeu. Defeito reproduzido: menu de preço chegava a x=493 em viewport de 390. Após correção, limites x=20–355; selecionar faixa fechou o menu (zero details abertos). Dropdowns compartilham um grupo e fecham após navegação.
- Ordenação na versão compilada: Price: low to high atualizou URL e controle, fechou o menu e ordenou os dez preços mínimos de £1.84 a £27.05. A duplicação de importação preexistente permanece descrita no registro anterior.
- PDP: próxima foto, zoom, seta no visualizador, Escape e retorno de foco conferidos. A CTA móvel levou às opções. Standard / 500ml / White mostrou £9.15 e disponibilidade real.
- Carrinho real: adição confirmada, quantidade 2 = £18.30, gaveta e página completa em desktop/celular. Item usado no teste removido ao terminar. Carrinho vazio mantém checkout aria-disabled=true e tabIndex=-1. Nenhum pedido ou pagamento enviado.
- Revisão da versão compilada local e capturas finais sem indicadores de desenvolvimento. CSS de movimento reduzido revisado; preferência do sistema não foi emulada pelo navegador disponível.
- `git diff --check` aprovado com a configuração normal de fim de linha do repositório. A galeria local e os arquivos de imagem foram abertos e conferidos.

## Limites e entrega

Não verificados: Safari, aparelho físico/toque real, leitor de tela e pagamento real. A inconsistência anterior de produtos duplicados no catálogo WooCommerce segue registrada em `redesign-review.md`; suas regras não foram modificadas.

- Loja: <http://127.0.0.1:3001/>.
- Comparação e galeria: <http://127.0.0.1:3002/modern/>.
- Evidências em `output/playwright/modern/`, ignoradas pelo Git. “Antes” significa a prévia local imediatamente anterior; a galeria antiga preserva também a comparação com a versão original.
- Reiniciar loja: `npm run start -- --hostname 127.0.0.1 --port 3001` após um build. O processo precisa de rede para consultar o WooCommerce.
- Reiniciar galeria: `node output/playwright/serve-review.mjs`. Ambos os servidores escutam apenas em loopback.
