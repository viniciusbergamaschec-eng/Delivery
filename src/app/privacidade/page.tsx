export const metadata = {
  title: 'Política de Privacidade',
}

export default function PoliticaPrivacidade() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 prose prose-sm">
        <h1 className="text-2xl font-bold mb-1">Política de Privacidade</h1>
        <p className="text-gray-400 text-xs mb-8">Última atualização: 29 de agosto de 2026</p>

        <p>
          Esta plataforma (&quot;Delivery&quot; ou &quot;nós&quot;) é operada por{' '}
          <strong>[RAZÃO SOCIAL — CNPJ 55.290.097/0001-06 — PREENCHER ANTES DE PUBLICAR]</strong>.
          Esta política explica quais dados coletamos, para quê, e quais são os direitos
          de quem usa a plataforma, em conformidade com a Lei Geral de Proteção de Dados
          (Lei nº 13.709/2018 — LGPD).
        </p>

        <h2>1. Quem somos e quem é responsável pelos dados</h2>
        <p>
          Somos os responsáveis pelo tratamento dos dados dos <strong>lojistas</strong> que
          se cadastram na plataforma (nome, e-mail, WhatsApp, dados da loja e de cobrança).
        </p>
        <p>
          Para os dados dos <strong>clientes finais</strong> que fazem pedidos pelo cardápio
          digital (nome, telefone, endereço), cada loja cadastrada é a responsável pelo
          tratamento (&quot;controladora&quot;) desses dados perante os próprios clientes — nós
          atuamos como operadores técnicos da infraestrutura que armazena essas informações
          em nome da loja.
        </p>

        <h2>2. Quais dados coletamos</h2>
        <p><strong>De quem cadastra uma loja (lojista):</strong></p>
        <ul>
          <li>Nome, e-mail e senha (autenticação)</li>
          <li>Nome da loja, WhatsApp, endereço e horário de funcionamento</li>
          <li>Dados de cobrança da assinatura, processados pelo gateway Asaas</li>
          <li>Opcionalmente: logo da loja e ID de Pixel do Meta (Facebook/Instagram Ads)</li>
        </ul>
        <p><strong>De quem faz um pedido no cardápio digital (cliente final):</strong></p>
        <ul>
          <li>Nome e telefone</li>
          <li>Endereço, quando o pedido é de entrega</li>
          <li>Itens do pedido e forma de pagamento escolhida</li>
        </ul>

        <h2>3. Para que usamos esses dados</h2>
        <ul>
          <li>Viabilizar o cadastro, login e funcionamento do cardápio digital de cada loja</li>
          <li>Processar o pedido e permitir que o cliente acompanhe seu status</li>
          <li>Cobrar a assinatura mensal do lojista pelo uso da plataforma</li>
          <li>
            Quando o lojista configura um Pixel do Meta, o navegador do cliente envia um
            evento anônimo de intenção de compra (&quot;Lead&quot;) diretamente para o Meta, para
            fins de mensuração de anúncios da própria loja — nós não temos acesso a esse
            evento nem o processamos em nossos servidores
          </li>
        </ul>

        <h2>4. Com quem compartilhamos dados</h2>
        <ul>
          <li><strong>Supabase</strong> (banco de dados e autenticação), com servidores fora do Brasil</li>
          <li><strong>Vercel</strong> (hospedagem da aplicação)</li>
          <li><strong>Asaas</strong> (processamento da cobrança de assinatura do lojista)</li>
          <li>
            <strong>Meta (Facebook/Instagram)</strong>, apenas quando o lojista opta por configurar
            um Pixel próprio — nesse caso o envio do evento é direto entre o navegador do
            cliente e o Meta, sem passar pelos nossos servidores
          </li>
          <li>O número de WhatsApp da loja recebe o pedido via link direto, fora da plataforma</li>
        </ul>
        <p>Não vendemos dados pessoais a terceiros.</p>

        <h2>5. Por quanto tempo guardamos os dados</h2>
        <p>
          Os dados de pedidos são mantidos enquanto a loja estiver ativa na plataforma, para
          fins de histórico e obrigações fiscais/contábeis do lojista. O cliente final pode
          solicitar a exclusão de seus dados de pedido diretamente à loja onde comprou.
        </p>

        <h2>6. Seus direitos</h2>
        <p>
          Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento.
          Lojistas podem editar ou excluir dados diretamente no painel administrativo. Clientes
          finais podem solicitar isso à loja onde fizeram o pedido, ou diretamente a nós pelo
          e-mail abaixo.
        </p>

        <h2>7. Contato</h2>
        <p>
          Dúvidas sobre esta política ou sobre seus dados:{' '}
          <a href="mailto:viniciusbergamaschec@gmail.com">viniciusbergamaschec@gmail.com</a>
        </p>
      </div>
    </main>
  )
}
