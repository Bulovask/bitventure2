import Link from 'next/link';

export default function ProfessorDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-400">Painel do Professor</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/professor/configuracao" 
            className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors border border-gray-700">
            <h2 className="text-2xl font-semibold mb-2 text-green-400">Configurações da Partida</h2>
            <p className="text-gray-400">Edite a quantidade de questões por nível e o tempo do botão parar.</p>
          </Link>

          <Link href="/professor/questoes" 
            className="p-6 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition-colors border border-gray-700">
            <h2 className="text-2xl font-semibold mb-2 text-yellow-400">Gestão de Questões</h2>
            <p className="text-gray-400">Adicione, edite, remova ou desative questões do banco de dados.</p>
          </Link>
        </div>

        <div className="mt-12">
           <Link href="/" className="text-blue-400 hover:underline">← Voltar para a Home</Link>
        </div>
      </div>
    </div>
  );
}
