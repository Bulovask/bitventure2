'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Questao {
  id: number;
  nivel: number;
  tipo: string;
  enunciado: string;
  respostaCorreta: string;
  ativo: boolean;
  origem: string;
}

export default function QuestoesPagina() {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Questao | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    nivel: 1,
    tipo: 'BINARIO_DECIMAL',
    enunciado: '',
    respostaCorreta: '',
    ativo: true,
  });

  useEffect(() => {
    carregarQuestoes();
  }, []);

  const carregarQuestoes = async () => {
    setLoading(true);
    const res = await fetch('/api/professor/questoes');
    const data = await res.json();
    setQuestoes(data);
    setLoading(false);
  };

  const handleEdit = (questao: Questao) => {
    setEditando(questao);
    setFormData({
      nivel: questao.nivel,
      tipo: questao.tipo,
      enunciado: questao.enunciado,
      respostaCorreta: questao.respostaCorreta,
      ativo: questao.ativo,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta questão?')) return;
    
    const res = await fetch(`/api/professor/questoes/${id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Questão excluída!');
      carregarQuestoes();
    }
  };

  const handleToggleAtivo = async (questao: Questao) => {
    const res = await fetch(`/api/professor/questoes/${questao.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !questao.ativo }),
    });
    if (res.ok) {
      carregarQuestoes();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editando ? `/api/professor/questoes/${editando.id}` : '/api/professor/questoes';
    const method = editando ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert(editando ? 'Questão atualizada!' : 'Questão criada!');
      setShowForm(false);
      setEditando(null);
      setFormData({ nivel: 1, tipo: 'BINARIO_DECIMAL', enunciado: '', respostaCorreta: '', ativo: true });
      carregarQuestoes();
    }
  };

  if (loading && questoes.length === 0) return <div className="p-8 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">Gestão de Questões</h1>
          <div className="space-x-4">
            <button
              onClick={() => {
                setEditando(null);
                setFormData({ nivel: 1, tipo: 'BINARIO_DECIMAL', enunciado: '', respostaCorreta: '', ativo: true });
                setShowForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold transition-colors"
            >
              + Nova Questão
            </button>
            <Link href="/professor" className="text-blue-400 hover:underline">Voltar</Link>
          </div>
        </div>

        {showForm && (
          <div className="mb-12 bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">{editando ? 'Editar Questão' : 'Nova Questão'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nível</label>
                <select
                  value={formData.nivel}
                  onChange={(e) => setFormData({ ...formData, nivel: parseInt(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Nível 1 (Binário/Decimal)</option>
                  <option value={2}>Nível 2 (ASCII/Binário)</option>
                  <option value={3}>Nível 3 (Palavra/Binário)</option>
                  <option value={4}>Nível 4 (Palavra/Decimal)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo (Opcional)</label>
                <input
                  type="text"
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ex: BINARIO_DECIMAL"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Enunciado</label>
                <textarea
                  value={formData.enunciado}
                  onChange={(e) => setFormData({ ...formData, enunciado: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 h-24 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Resposta Correta</label>
                <input
                  type="text"
                  value={formData.respostaCorreta}
                  onChange={(e) => setFormData({ ...formData, respostaCorreta: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="ativo" className="text-sm font-medium">Questão Ativa</label>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-2 rounded font-bold transition-colors"
                >
                  {editando ? 'Salvar Alterações' : 'Criar Questão'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nível</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4 w-1/3">Enunciado</th>
                <th className="px-6 py-4">Resposta</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {questoes.map((q) => (
                <tr key={q.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 text-gray-400">#{q.id}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">Lvl {q.nivel}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">{q.tipo}</td>
                  <td className="px-6 py-4 truncate max-w-xs">{q.enunciado}</td>
                  <td className="px-6 py-4 text-green-400 font-bold">{q.respostaCorreta}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAtivo(q)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        q.ativo ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                      }`}
                    >
                      {q.ativo ? 'Ativa' : 'Inativa'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(q)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {questoes.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma questão cadastrada no banco.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
