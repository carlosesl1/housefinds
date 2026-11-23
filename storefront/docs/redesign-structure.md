# Housefinds — reestruturação da home, 25/09/2026

Rodada solicitada após a versão documentada em `redesign-ella.md`: liberdade explícita para mudar a estrutura. Alterações apenas locais, na branch existente `codex/housefinds-composition`; nenhuma publicação, push ou mudança no tema WordPress.

## Diagnóstico e direção

A home ainda separava a experiência em banner, faixa de pequenos produtos, grade, categorias e mais campanhas. O comprador via partes repetidas do catálogo em blocos com pouca relação. A mudança reúne ambiente, categoria e produtos em uma abertura que permite explorar por uso sem sair da página.

- Uma introdução breve antecede quatro seleções: Kitchen Tools, Space Saving, Daily Helpers e Smart Entry. As abas trocam a cena ilustrativa e os produtos reais em conjunto; a contagem vem da mesma regra de categorias do catálogo. Cada cena e o link View all abrem uma lista real. Categorias sem produtos não geram abas vazias.
- O primeiro conjunto usa duas opções lado a lado, com fotografia, nome, benefício, preço e acesso às opções. As cenas não se passam por fotografias dos produtos: a identificação de imagem ilustrativa permanece.
- A antiga faixa de três miniaturas, a grade isolada, a seção separada de categorias e os banners repetidos foram absorvidos nessa abertura. A página segue para uma seleção real abaixo de £20, em vez de outra campanha sem produtos.
- O destaque agora apresenta o produto com duas fotografias existentes, benefícios da curadoria já usada na página de produto, preço e ação. Lora cria contraste pontual com Inter, sem uma sequência de títulos editoriais.
- A seção final mantém a proposta da marca e acrescenta um caminho direto para About. Busca, navegação global, atendimento e políticas continuam disponíveis.
- No celular, o título mantém duas linhas mesmo em 320 px. O link de categoria repetido acima dos produtos foi retirado, mantendo a cena clicável. A faixa Under £20 usa rolagem horizontal nativa, sem bloquear a rolagem vertical da página.

## Limites preservados

Mesmas cores, famílias tipográficas, fotos e produtos reais. Nenhuma alteração em preço, estoque, frete, pagamento, pedidos, WooCommerce ou DSers. A seleção Under £20 usa `isUnderTwentyProduct`, que exige que todas as variações estejam abaixo do limite. Não foram criados selos, descontos, escassez, reviews ou promessas.

O conteúdo de comércio permanece no servidor; o componente cliente recebe os painéis React e mantém somente o estado das abas. Foram reutilizados ProductCard, as categorias, os preços, o conteúdo do produto e as regras de acessibilidade existentes. Sem nova dependência.

## Verificação

- Build otimizado, TypeScript e 60 testes obrigatórios: 12 PDP, 18 checkout e 30 home. Evidência: `output/playwright/restructure/build-final.log`.
- Teste adicional cobre a ligação entre seleções, produtos e categorias, incluindo catálogo vazio. A asserção antiga da sequência de componentes foi atualizada à nova composição; os testes de preço e operações comerciais foram preservados.
- Home renderizada em 1440×1000, 768×1024, 390×844 e 320×720. Sem overflow horizontal do documento; rolagem interna de abas e seleção por orçamento é deliberada.
- Abas por clique, ArrowRight, Home e End; foco acompanha a seleção e somente um painel fica ativo. As quatro categorias mostraram dados correspondentes.
- Cena de Space Saving abriu o catálogo real com dois produtos. O destaque abriu Digital Spoon Scale. O link de orçamento abriu a coleção Under £20.
- Evidência válida da rodada anterior reaproveitada para menu, busca, filtros, ordenação, galeria, opções e carrinho. Esses componentes e suas regras não mudaram nesta rodada. As rotas de acesso a partir da nova home foram verificadas novamente.
- Em 390×844, preços em y≈747 e ações completas até y≈814, ambas com 44 px de altura. A rolagem da seleção Under £20 foi de 0 a 300 px enquanto o documento permaneceu sem overflow horizontal. Console sem erros no roteiro final.
- `git diff --check` aprovado com as configurações do repositório.

## Revisão local

- Loja: http://127.0.0.1:3001/
- Antes/depois: http://127.0.0.1:3002/restructure/
- Capturas em `output/playwright/restructure/`. Antes = última versão Ella concluída; depois = esta composição. Mesmo catálogo e mesmas imagens; produtos aparecem em posições diferentes por causa da nova organização.
- Limites de validação: viewports emuladas, sem aparelho físico, Safari, leitor de tela ou pagamento real. Nenhum pedido enviado.
- Referências reaproveitadas da inspeção anterior: [Ella Industrial Tool](https://new-ella-demo-07.myshopify.com/?preview_theme_id=141768589417), pela clareza comercial; [Ella Dietary Supplement](https://new-ella.myshopify.com/?fts=0&preview_theme_id=133104730210), pela ligação entre campanhas e produtos. A composição foi desenvolvida para o catálogo da Housefinds.
