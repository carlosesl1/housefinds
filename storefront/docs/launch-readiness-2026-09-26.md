# Housefinds — auditoria técnica para lançamento

Data: 26/09/2026. Escopo: storefront publicado, código da versão integrada, WordPress/WooCommerce via WPVibe, Stripe conectado ao WooCommerce, indicadores DSers e DNS público.

## Conclusão

A estrutura de catálogo, carrinho e entrega funciona, mas a loja ainda não está pronta para receber pedidos pelo novo storefront. O bloqueio imediato é o formulário de pagamento: a versão publicada não tem uma chave pública Stripe efetiva no frontend. O domínio comercial também não exibe a loja nova.

Nenhuma configuração, produto, preço ou estoque foi alterado. Não foram criados pedidos, pagamentos, reembolsos ou mensagens. Foi criado somente um carrinho de visitante com dados fictícios para verificar entrega; o único item foi removido ao terminar. Não houve commit ou publicação nesta auditoria.

## 1. Corrigir antes de aceitar pedidos

| Prioridade | Evidência observada | Ação necessária | Critério de conclusão |
|---|---|---|---|
| P0 — pagamento | Em produção, produto selecionado e entrega confirmada chegam à etapa Payment, que mostra `Card payments are temporarily unavailable`. Nenhum campo de cartão é montado. | Configurar `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` na Vercel, no ambiente correto, com a chave pública da mesma conta/modo do WooCommerce; fazer novo build/deploy. Nunca usar chave secreta nessa variável. | Stripe Elements carrega e o ciclo de pagamento é validado em ambiente de teste, conforme seção 2. |
| P1 — domínio comercial | `https://housefindsstore.com/` responde 200, mas mostra `Hello world!` e a mensagem padrão do WordPress. A loja nova está em `https://housefinds-storefront.vercel.app/`. O sitemap aponta para o domínio Vercel. | Definir e conectar o domínio público ao Next.js, preservando um endereço próprio para o backend WooCommerce. Atualizar a URL do backend, URLs públicas, integrações, webhooks, retorno de pagamento e sitemap conforme a arquitetura escolhida. | Domínio oficial abre o Next.js por HTTPS e catálogo, carrinho, pagamento e callbacks continuam chegando ao WooCommerce. |
| P1 — suporte e e-mails | O endereço divulgado é `contact@housefindsstore.com`. As consultas DNS não retornaram MX nem TXT no domínio; `_dmarc` retornou NXDOMAIN. O remetente configurado no WooCommerce é uma conta Gmail pessoal. | Configurar a caixa de suporte, MX, remetente autenticado e SPF/DKIM/DMARC de acordo com o provedor. Validar envio transacional e recebimento de respostas. | Recebimento real em suporte e entrega de mensagens de pedido, pagamento e reembolso confirmados. |
| P1 — identificação do vendedor | `/terms` exibe `Seller address not yet configured in the storefront`. Rua e código postal da loja também estão vazios no WooCommerce. | Preencher nome legal e endereço reais no storefront e no backend; número de registro quando aplicável. | Aviso removido por configuração verdadeira e dados consistentes no site/e-mails. |

### Diagnóstico exato do pagamento

- A reprodução usou Stainless Steel Cutting Board, opção 20 × 30 cm, £11.90, com frete £0.00 e total £11.90.
- O mesmo bloqueio foi observado em desktop e mobile.
- `components/checkout/stripe-card-form.tsx:72` lê `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`; a mensagem reproduzida é retornada na linha 206 quando essa chave é vazia/indisponível para um carrinho que exige pagamento.
- A conta Stripe no backend está conectada em modo live, com `charges_enabled=true`, `payouts_enabled=true`, pagamentos por cartão ativos e sem requisitos cadastrais pendentes reportados. Portanto, conexão do gateway no WordPress não é o mesmo que configuração do formulário Next.js.
- Não foi consultado nem exibido valor de chave secreta. Não foi alterado modo de pagamento.

### Cuidados com a mudança do domínio

Hoje `WOOCOMMERCE_URL` usa `https://housefindsstore.com`. O webhook Stripe também usa esse domínio e a conexão DSers foi criada contra esse backend. Apenas trocar o DNS principal para a Vercel pode interromper esses serviços. Uma possibilidade é manter WooCommerce em subdomínio próprio e usar o domínio principal para a loja, após preparar e validar a migração. Outra é definir um subdomínio público para a loja. A escolha e a migração não foram executadas.

## 2. Homologações ainda necessárias

### Pagamento e pós-compra

O WooCommerce reportou zero pedidos em todos os estados, inclusive rascunhos. Não existe evidência de pedido concluído nessa instalação.

O webhook live Stripe está configurado e habilitado, mas o plugin informa que não recebeu eventos live desde o início da monitoração em 12/09/2026. Com zero pedidos, isso **não prova que o webhook esteja quebrado**; comprova apenas que seu funcionamento com vendas ainda não foi demonstrado. A conexão e o webhook de teste não estão configurados no gateway consultado.

Preparar um ambiente de homologação separado, com Stripe em modo de teste e proteção para não enviar pedidos de teste ao fornecedor. Validar:

1. Cartão aprovado, recusado e autenticação 3DS.
2. Pedido criado uma única vez e status coerente no WooCommerce.
3. Webhook recebido e transição de status correta mesmo se o comprador fechar a página.
4. Confirmação, número, itens, total e acesso posterior ao pedido.
5. Reserva/baixa de estoque, reembolso e recuperação após erro de rede.
6. E-mails de cliente/lojista, conteúdo e links de retorno.

O Stripe está em conta brasileira com liquidação padrão BRL, enquanto a loja vende em GBP. Isso não é, por si só, incompatibilidade: validar cobrança em GBP, conversão, recebimento e identificação na fatura. O descritor atual reportado é `NOIR DIGITAL`, diferente da marca Housefinds; revisar a identificação para o cliente. Não foi dada conclusão fiscal nesta auditoria.

### DSers, estoque e rastreamento

Confirmado:

- Chave DSers com permissão read/write e último acesso registrado em 25/09/2026.
- Cinco webhooks DSers ativos: criação/atualização/exclusão de pedidos e atualização/exclusão de produtos.
- Três ações antigas de entrega de webhook falharam em 12/09. Os indicadores sanitizados não permitiram atribuir uma causa específica; não se conclui que a integração atual esteja quebrada.
- Plugin Housefinds Order Bridge ativo e namespace de rastreamento registrado.

Ainda falta validar no DSers: vínculo de cada produto/variação ao fornecedor, método/custo de envio ao Reino Unido, sincronização de disponibilidade/preço, recebimento do pedido pago, fluxo de pagamento ao fornecedor e retorno do código de rastreamento ao WooCommerce e ao cliente.

O Order Bridge instalado informa versão 0.2.0; a cópia no repositório é 0.3.0. Comparar e alinhar a instalação antes da homologação do rastreamento. Não foi presumido que o arquivo do Git já esteja instalado no WordPress. Nenhum pedido real existente foi acessado; a contagem reportada é zero.

## 3. O que já foi verificado

| Área | Evidência |
|---|---|
| Catálogo | 11 produtos publicados no WooCommerce, incluindo uma importação duplicada de LED; o código do storefront possui deduplicação. Todos os pais consultados são compráveis e têm preço. |
| Variações | 100 registros de variação no banco, incluindo o produto duplicado; nenhum sem preço. Existem variações indisponíveis, portanto sua exclusão/bloqueio deve permanecer na homologação. |
| Compra por opção | Seleção 20 × 30 cm alterou o preço para £11.90; carrinho recebeu a opção correta. |
| Sessão e carrinho | Adição, permanência entre páginas e remoção verificadas na versão pública. Carrinho final vazio. |
| Consulta de pedido | Número inexistente com e-mail fictício retornou `We could not match that order number and email address.`; nenhum dado de pedido foi exposto. O caminho de sucesso depende de um pedido de teste. |
| Entrega | País de venda GB, moeda GBP, zona GB e frete grátis ativo sem valor mínimo. A zona residual não tem método. Endereço fictício britânico calculou frete gratuito no checkout real. |
| Guest checkout | Habilitado no WooCommerce e disponível na interface. |
| Proteções no código | Checkout Next.js verifica moeda, total real, endereço, entrega e limite abaixo de £135 no servidor; não repete automaticamente POST de pagamento. Isto é leitura do código e evidência dos testes prévios, não uma transação real. |
| Infraestrutura WordPress | HTTPS ativo, erros públicos ocultos, debug desligado, chamadas HTTP externas OK, WP-Cron respondeu 200. |
| Agendamentos | 762 ações completas, 15 pendentes agendadas no futuro e 4 falhas antigas; nenhuma fila vencida apareceu na consulta. |
| Indexação | robots e sitemap públicos respondem 200; checkout, carrinho, busca, confirmação e rastreamento estão excluídos pelo robots. Conferir novamente após domínio definitivo. |

## 4. Manutenção e decisões pendentes

- WooCommerce instalado 11.1.0, com atualização 11.1.2 anunciada pelo próprio WordPress. WPVibe e três outros plugins também reportam atualização. Atualizar com backup e validação; nenhuma atualização foi aplicada.
- GitHub Actions permanece bloqueado pela cobrança/limite da conta, como confirmado na publicação anterior. O build local e 61 testes prévios passaram; não equivalem a pagamento real. A Vercel publicou normalmente.
- Backup da hospedagem, restauração e alertas de disponibilidade/erros não puderam ser comprovados pelos acessos usados. Exigir uma evidência de restauração, não apenas existência de um plugin.
- Há eventos básicos de funil no dataLayer/logs da Vercel, mas não um sistema analítico durável comprovado. É melhoria de operação, sem impedir a primeira compra.
- Cálculo de impostos no WooCommerce está desativado. O requisito do projeto registra a revisão de VAT como pendente. Definir o tratamento comercial/fiscal correto antes de configurar taxas; esta auditoria não resolve esse tema e não alterou preços ou tributos.
- Confirmar processo real de devolução gratuita, endereço de devolução, atendimento e prazo de fornecimento. O texto do site não comprova a capacidade operacional.

## Ordem recomendada

1. Configurar chave pública Stripe e infraestrutura de homologação.
2. Resolver domínio/backend, e-mail e identificação do vendedor.
3. Executar os cenários de pagamento, pedido, e-mail, DSers e rastreamento em teste.
4. Revisar manutenção, backups e alertas; então liberar a operação comercial.

## Evidências e limites

Capturas locais:

- `output/launch-audit/checkout-payment-blocked-desktop.png`
- `output/launch-audit/checkout-payment-blocked-mobile.png`
- `output/launch-audit/primary-domain-wordpress.png`

Não foram testados pagamento real, 3DS real, reembolso, compra no fornecedor, envio de e-mail, entrega física, restauração de backup ou aparelhos físicos. Testar o formulário até a etapa de pagamento não comprova o restante do ciclo. A auditoria não alterou a loja.

Documentação primária consultada:

- [WooCommerce — webhooks do Stripe](https://woocommerce.com/document/stripe/setup-and-configuration/stripe-webhooks/): configuração distinta de modo live e teste.
- [WooCommerce — pedidos de teste](https://woocommerce.com/document/managing-orders/testing-orders/): pedidos de teste podem acionar e-mails e integrações; precisam de ambiente e tratamento apropriados.
- [DSers — conexão com WooCommerce](https://help.dsers.com/woocommerce-connection-guide-website-verification-authorization-webhook-setup/): autorização/API e webhooks da conexão.
- [DSers — sincronização de pedidos](https://help.dsers.com/order-syncing-how-to-synchronize-your-store-orders/): pedido precisa ser confirmado no fluxo DSers, além de existir no WooCommerce.
- [Stripe — moedas](https://docs.stripe.com/currencies): moeda de cobrança e moeda de liquidação são conceitos distintos.
