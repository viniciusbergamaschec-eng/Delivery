export const metadata = {
  title: 'Termos de Uso',
}

export default function TermosDeUso() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 prose prose-sm">
        <h1 className="text-2xl font-bold mb-1">Termos de Uso</h1>
        <p className="text-gray-400 text-xs mb-8">Última atualização: 29 de agosto de 2026</p>

        <p>
          Estes Termos regulam o uso da plataforma Delivery, operada por{' '}
          <strong>VINICIUS BERGAMASCHE COSTA — CNPJ 55.290.097/0001-06</strong>{' '}
          (&quot;nós&quot;). Ao criar uma conta de lojista ou fazer um pedido pelo cardápio de uma
          loja cadastrada, você concorda com estes Termos.
        </p>

        <h2>1. O que é a plataforma</h2>
        <p>
          A Delivery é um sistema de cardápio digital multi-loja. Lojistas se cadastram,
          configuram seu cardápio e recebem pedidos de clientes finais via WhatsApp. A
          plataforma não processa pagamentos dos pedidos dos clientes finais — o pagamento
          é combinado diretamente entre o cliente e a loja (Pix, dinheiro ou cartão na
          entrega/retirada).
        </p>

        <h2>2. Cadastro do lojista</h2>
        <p>
          O lojista é responsável pela veracidade das informações cadastradas (nome da loja,
          endereço, cardápio, preços) e pelo atendimento aos pedidos recebidos. A plataforma
          não se responsabiliza pela qualidade dos produtos, prazos de entrega ou
          relacionamento comercial entre a loja e seus clientes.
        </p>

        <h2>3. Assinatura e cobrança</h2>
        <p>
          O uso da plataforma pelo lojista está sujeito ao pagamento de uma assinatura mensal,
          processada através do gateway de pagamento Asaas. O não pagamento pode resultar em
          suspensão do acesso ao painel administrativo, sem prejuízo dos pedidos já recebidos.
        </p>

        <h2>4. Uso aceitável</h2>
        <p>É vedado ao lojista:</p>
        <ul>
          <li>Cadastrar produtos ou serviços ilegais</li>
          <li>Usar a plataforma para fins fraudulentos ou de spam</li>
          <li>Tentar acessar dados de outras lojas ou burlar as proteções técnicas do sistema</li>
        </ul>
        <p>
          Violações podem resultar em suspensão ou cancelamento da conta, sem aviso prévio em
          casos de uso fraudulento.
        </p>

        <h2>5. Disponibilidade do serviço</h2>
        <p>
          Fazemos o possível para manter a plataforma disponível, mas não garantimos
          funcionamento ininterrupto. Não nos responsabilizamos por perdas decorrentes de
          indisponibilidade temporária, falhas de terceiros (Supabase, Vercel, Asaas, WhatsApp)
          ou casos fortuitos.
        </p>

        <h2>6. Dados pessoais</h2>
        <p>
          O tratamento de dados pessoais é descrito na nossa{' '}
          <a href="/privacidade">Política de Privacidade</a>.
        </p>

        <h2>7. Alterações destes Termos</h2>
        <p>
          Podemos atualizar estes Termos periodicamente. Mudanças relevantes serão comunicadas
          aos lojistas por e-mail ou aviso no painel administrativo.
        </p>

        <h2>8. Contato</h2>
        <p>
          <a href="mailto:viniciusbergamaschec@gmail.com">viniciusbergamaschec@gmail.com</a>
        </p>
      </div>
    </main>
  )
}
