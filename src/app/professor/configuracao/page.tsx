'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ConfigPagina() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    qtdNivel1: 0,
    qtdNivel2: 0,
    qtdNivel3: 0,
    qtdNivel4: 0,
    tempoParadaMs: 0,
    tempoNivel1: 30,
    tempoNivel2: 45,
    tempoNivel3: 60,
    tempoNivel4: 90,
  });

  useEffect(() => {
    fetch('/api/professor/configuracao')
      .then((res) => res.json())
      .then((data) => {
        setConfig({
          qtdNivel1: data.qtdNivel1,
          qtdNivel2: data.qtdNivel2,
          qtdNivel3: data.qtdNivel3,
          qtdNivel4: data.qtdNivel4,
          tempoParadaMs: data.tempoParadaMs,
          tempoNivel1: data.tempoNivel1 ?? 30,
          tempoNivel2: data.tempoNivel2 ?? 45,
          tempoNivel3: data.tempoNivel3 ?? 60,
          tempoNivel4: data.tempoNivel4 ?? 90,
        });
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: parseInt(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/professor/configuracao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        alert('Configurações salvas com sucesso!');
        router.push('/professor');
      } else {
        alert('Erro ao salvar configurações.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-green-400">Configurações da Partida</h1>
          <Link href="/professor" className="text-blue-400 hover:underline">Voltar</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Qtd Questões Nível 1</label>
              <input
                type="number"
                name="qtdNivel1"
                value={config.qtdNivel1}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tempo Nível 1 (Segundos)</label>
              <input
                type="number"
                name="tempoNivel1"
                value={config.tempoNivel1}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Qtd Questões Nível 2</label>
              <input
                type="number"
                name="qtdNivel2"
                value={config.qtdNivel2}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tempo Nível 2 (Segundos)</label>
              <input
                type="number"
                name="tempoNivel2"
                value={config.tempoNivel2}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Qtd Questões Nível 3</label>
              <input
                type="number"
                name="qtdNivel3"
                value={config.qtdNivel3}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tempo Nível 3 (Segundos)</label>
              <input
                type="number"
                name="tempoNivel3"
                value={config.tempoNivel3}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Qtd Questões Nível 4</label>
              <input
                type="number"
                name="qtdNivel4"
                value={config.qtdNivel4}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tempo Nível 4 (Segundos)</label>
              <input
                type="number"
                name="tempoNivel4"
                value={config.tempoNivel4}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tempo Botão Parar (Segundos)</label>
            <input
              type="number"
              name="tempoParadaMs"
              value={config.tempoParadaMs / 1000}
              onChange={(e) => setConfig(prev => ({ ...prev, tempoParadaMs: (parseInt(e.target.value) || 0) * 1000 }))}
              className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}
