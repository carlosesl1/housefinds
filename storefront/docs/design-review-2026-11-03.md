# Housefinds — revisão de design, 03/11/2026

Revisão feita sobre produção (`6d9c23c`) e o `/shop` local. As correções ficam no branch local `codex/shop-redesign-local`. Sem push nem publicação. Não mudou preço, estoque, frete, pagamento ou pedidos.

## O que mudou

- **Tipografia.** Títulos em Inter com um trecho em Lora itálica (`.hf-accent`), em todas as telas da loja. O checkout continua só em Inter.
- **`/shop`.** Saíram a faixa de benefícios, a 2ª busca e o botão do banner. O banner ficou mais baixo, e "Not sure where to start?" passou para depois da primeira linha de produtos, só sem filtros ativos. O parâmetro `q` continua aceito na URL.
- **Cartões.** Saiu o selo "Options available". A contagem de um atributo composto agora diz "16 options", não "16 pack…". Imagem quadrada com `cover`, sem moldura dupla, e a mesma ação sublinhada em todas as listas.
- **Produto.** O botão principal fica ativo, leva à primeira opção que falta e diz quais faltam. As miniaturas perderam a legenda, e o contador virou "1 of 12". A entrega aparece uma vez, junto do preço, com link para `/shipping`.
- **Home.** As categorias viraram uma lista tipográfica, sem foto. `planHomeProducts` distribui produtos diferentes por seção e só repete para completar uma prateleira. O cartão do hero mostra a foto real do produto. A faixa de benefícios saiu.
- **Cabeçalho mobile.** Ao rolar, a busca recolhe em um ícone. A linha fica reservada no fluxo, então a página não desloca.
- **Carrinho.** Texto alinhado no estado vazio, `noindex` e título próprio em `/cart`. A gaveta e o carrinho repetem menos as promessas de entrega.

## Armadilhas encontradas

- **Título errado na aba.** O prefetch de links para `/shop` com outros parâmetros deixava o título de outra categoria após navegar. Esses links usam `prefetch={false}`; a mesma decisão já estava em `category-conversion.md`.
- **`scroll-padding-top` em elemento fixo.** Focar ou digitar em um campo do cabeçalho rolava a página. Os focos programáticos usam `preventScroll`, e o padding mobile baixou para 64 px.
- **Regra global de movimento reduzido.** A duração de 0,01 ms dava transição de `visibility` a todo elemento, e o campo ainda contava como oculto no instante do foco. A busca desliga essa transição.

## Pendências

- **Fotos de fornecedor.** Continuam com texto embutido ("Tinsol", "Punch Free Door Closer", "Application Scene", colagem "Plastic… 200/300/500ML"). Dependem de escolher ou produzir imagens.
- **Salto ao digitar no tablet e no desktop.** A página sobe cerca de 150 px ao digitar na busca do cabeçalho. O `scroll-padding-top` de 145 px ficou porque mantém visível o foco de teclado. Precisa de outra solução.

## Não verificado

iPhone ou Android reais (incluindo abrir o teclado ao tocar no ícone de busca), Safari, leitor de tela, pagamento real e Core Web Vitals.
