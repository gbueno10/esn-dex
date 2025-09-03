import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Termos de Serviço</h1>
          <p className="text-gray-600 mt-2">Última atualização: 3 de setembro de 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Acceptance */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
            <p className="text-gray-700 leading-relaxed">
              Ao acessar e usar o ESN Dex (doravante &quot;Aplicação&quot;, &quot;Serviço&quot; ou &quot;Plataforma&quot;), 
              você concorda integralmente com estes Termos de Serviço. Se você não concorda 
              com qualquer parte destes termos, não deve usar nossa aplicação.
            </p>
          </section>

          {/* Description */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              O ESN Dex é uma plataforma social gamificada para estudantes Erasmus que oferece:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Sistema de challenges e desafios sociais</li>
              <li>Perfis de estudantes ESN</li>
              <li>Funcionalidades de networking</li>
              <li>Sistema de pontuação e gamificação</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Isenção de Responsabilidade</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-medium">⚠️ IMPORTANTE: LEIA ATENTAMENTE</p>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong>3.1 Uso por Sua Conta e Risco:</strong> Você usa esta aplicação por sua própria 
                conta e risco. O desenvolvedor não se responsabiliza por qualquer dano, perda ou 
                consequência decorrente do uso da plataforma.
              </p>
              <p className="leading-relaxed">
                <strong>3.2 Challenges e Atividades:</strong> Os challenges e desafios propostos pela 
                aplicação são puramente recreativos. O desenvolvedor não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Acidentes ou lesões durante a realização de challenges</li>
                <li>Consequências sociais, académicas ou pessoais dos desafios</li>
                <li>Comportamentos inadequados entre usuários</li>
                <li>Decisões tomadas com base nas informações da plataforma</li>
              </ul>
              <p className="leading-relaxed">
                <strong>3.3 Conteúdo de Terceiros:</strong> A plataforma pode conter conteúdo gerado 
                por usuários. O desenvolvedor não controla nem se responsabiliza por este conteúdo.
              </p>
            </div>
          </section>

          {/* User Responsibility */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Responsabilidades do Usuário</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">Ao usar a aplicação, você se compromete a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Usar a plataforma de forma responsável e legal</li>
                <li>Não compartilhar conteúdo ofensivo, ilegal ou inadequado</li>
                <li>Respeitar outros usuários e suas informações pessoais</li>
                <li>Não usar a plataforma para atividades ilegais ou prejudiciais</li>
                <li>Assumir total responsabilidade por suas ações e decisões</li>
                <li>Verificar a legalidade e segurança dos challenges antes de realizá-los</li>
              </ul>
            </div>
          </section>

          {/* Data and Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Dados e Privacidade</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong>5.1 Coleta de Dados:</strong> A aplicação coleta informações básicas de perfil 
                e progresso de challenges para funcionalidade da plataforma.
              </p>
              <p className="leading-relaxed">
                <strong>5.2 Uso de Dados:</strong> Os dados são usados exclusivamente para operação 
                da plataforma. Não vendemos ou compartilhamos dados pessoais com terceiros.
              </p>
              <p className="leading-relaxed">
                <strong>5.3 Segurança:</strong> Embora implementemos medidas de segurança, você 
                reconhece que nenhum sistema é 100% seguro.
              </p>
            </div>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitações do Serviço</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed font-medium">
                O serviço é fornecido &quot;como está&quot; sem garantias de qualquer tipo. O desenvolvedor 
                não garante que:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>A aplicação estará sempre disponível ou livre de erros</li>
                <li>As informações sejam precisas ou atualizadas</li>
                <li>O serviço atenda às suas necessidades específicas</li>
                <li>Problemas técnicos serão corrigidos imediatamente</li>
              </ul>
            </div>
          </section>

          {/* Liability Limitation */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium">🚨 CLÁUSULA DE LIMITAÇÃO MÁXIMA</p>
            </div>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed font-medium">
                EM NENHUMA CIRCUNSTÂNCIA O DESENVOLVEDOR, SEUS AFILIADOS, DIRETORES, FUNCIONÁRIOS 
                OU AGENTES SERÃO RESPONSÁVEIS POR:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Danos diretos, indiretos, incidentais, especiais ou consequenciais</li>
                <li>Perda de lucros, dados, uso ou outras perdas intangíveis</li>
                <li>Danos resultantes do uso ou incapacidade de usar a aplicação</li>
                <li>Condutas de terceiros na plataforma</li>
                <li>Acesso não autorizado ou alteração de suas transmissões ou dados</li>
                <li>Qualquer questão relacionada à aplicação</li>
              </ul>
              <p className="leading-relaxed font-medium">
                ESTA LIMITAÇÃO SE APLICA INDEPENDENTEMENTE DA TEORIA LEGAL (CONTRATO, DELITO OU OUTRO) 
                E MESMO QUE O DESENVOLVEDOR TENHA SIDO AVISADO DA POSSIBILIDADE DE TAIS DANOS.
              </p>
            </div>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Indenização</h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed font-medium">
                Você concorda em indenizar, defender e isentar o desenvolvedor de qualquer 
                reivindicação, dano, obrigação, perda, responsabilidade, custo ou dívida, 
                e despesa (incluindo honorários advocatícios) decorrente de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Seu uso da aplicação</li>
                <li>Violação destes Termos de Serviço</li>
                <li>Violação de qualquer direito de terceiros</li>
                <li>Seu comportamento na plataforma</li>
                <li>Participação em challenges ou atividades sugeridas</li>
              </ul>
            </div>
          </section>

          {/* Age Restriction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Restrição de Idade</h2>
            <p className="text-gray-700 leading-relaxed">
              Esta aplicação é destinada a usuários com 18 anos ou mais. Usuários menores de 18 
              anos devem ter permissão dos pais ou responsáveis e usam a plataforma sob supervisão 
              e responsabilidade dos mesmos.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Modificações dos Termos</h2>
            <p className="text-gray-700 leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Mudanças 
              entrarão em vigor imediatamente após a publicação. O uso continuado da aplicação 
              constitui aceitação dos termos modificados.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Encerramento</h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos suspender ou encerrar seu acesso à aplicação a qualquer momento, por qualquer 
              motivo, sem aviso prévio. Estes termos permanecerão em vigor mesmo após o encerramento.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Lei Aplicável</h2>
            <p className="text-gray-700 leading-relaxed">
              Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida 
              nos tribunais competentes do Brasil.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contato</h2>
            <p className="text-gray-700 leading-relaxed">
              Para questões sobre estes termos, entre em contato através da aplicação ou pelos 
              canais oficiais do ESN.
            </p>
          </section>

          {/* Acceptance Confirmation */}
          <section className="border-t pt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                ✅ Ao usar esta aplicação, você confirma que leu, entendeu e concorda com todos 
                os termos acima descritos.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
