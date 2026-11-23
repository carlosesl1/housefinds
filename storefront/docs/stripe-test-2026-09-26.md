# Teste Stripe — 26/09/2026

## Resultado

Configuração local concluída. Pagamento e criação de pedido ainda **não executados**.

## Confirmado

- WooCommerce Stripe Gateway 11.0.0 com modo de teste ativo (`testmode=yes`).
- Conexão OAuth de teste conectada; conexão live desconectada. Conta reportou cobranças de teste habilitadas.
- Webhook de teste configurado, mas sem eventos de teste recebidos desde o início do monitoramento. Configuração não equivale a entrega verificada.
- Chave pública `pk_test_…` da mesma configuração adicionada somente a `.env.local`, ignorado pelo Git. Nenhuma chave secreta copiada para o storefront.
- Servidor Next dev em `http://127.0.0.1:3001`, usando o WooCommerce real em modo de teste.
- Produto 452, variação 456 (20 × 30cm), quantidade 1: adição ao carrinho retornou 201. Preço £11,90.
- Endereço fictício britânico aceito; atualização do cliente retornou 200; frete gratuito selecionado; total £11,90.
- Nenhum pedido criado: totais do WooCommerce permaneceram zero em todos os estados, inclusive rascunhos.

## Bloqueios observados

1. O script Stripe.js carregou, mas o iframe do cartão permaneceu em branco no navegador incorporado do Codex. Uma recarga controlada também falhou. Um formulário mínimo separado do Next/React reproduziu o mesmo comportamento. A URL pública do iframe respondeu HTTP 200 pela rede. A causa exata continua não determinada; verificar em navegador externo antes de alterar o checkout por hipótese.
2. Os webhooks de pedidos do DSers estão ativos. Foi solicitada confirmação sobre compra/pagamento automático no fornecedor. Nenhum webhook foi alterado. O teste deve aguardar confirmação de operação manual ou isolamento efetivo da integração; apenas pausar webhooks não impede consulta por API.
3. A variável pública Stripe da Vercel não foi alterada: o CLI não possui autenticação utilizável e o conector disponível não expõe escrita de variáveis. A configuração local não altera o site publicado.

## Continuação

- Confirmar isolamento do DSers antes de enviar qualquer pedido.
- Reabrir o checkout local em um navegador externo e verificar se os campos seguros carregam.
- Usar cartão fictício oficial da Stripe 4242 4242 4242 4242, validade futura e CVC de teste, somente enquanto frontend e backend estiverem ambos em modo de teste.
- Após a transação, verificar pedido, modo teste, transação Stripe, webhook recebido, confirmação e carrinho vazio. Não repetir uma tentativa com resultado incerto antes de consultar o pedido.
- Cancelar/reembolsar o pedido de teste conforme o resultado, usando o fluxo WooCommerce para reposição do estoque. Estoque inicial da variação 456: 76.
- Configurar a variável `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` no ambiente Vercel apropriado e fazer novo deploy para incorporá-la ao bundle. Não alternar para live como parte deste teste.
- 3DS, recusa, reembolso, e-mail recebido e entrega pelo DSers continuam sem validação.

## Evidência

- `output/stripe-test/checkout-test-fields-blocked.png`
- Logs locais em `output/stripe-test/dev-out.log` e `dev-error.log`.
- Diagnóstico mínimo em `output/stripe-test/probe.cjs` (ignorado pelo Git; servidor temporário encerrado).
- Nenhuma mudança na lógica comercial, código do checkout, frete, preços ou estoque. Nenhum build ou teste unitário repetido: a única configuração persistente foi o ambiente local.

## Referências oficiais

- https://woocommerce.com/document/stripe/customer-experience/testing/
- https://woocommerce.com/document/managing-orders/testing-orders/
- https://docs.stripe.com/testing
- https://raw.githubusercontent.com/woocommerce/woocommerce-gateway-stripe/11.0.0/includes/payment-methods/class-wc-stripe-upe-payment-gateway.php

