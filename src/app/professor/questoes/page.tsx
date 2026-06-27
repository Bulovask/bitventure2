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

const mapNivelParaTipos: Record<number, string[]> = {
  1: ['BINARIO_DECIMAL', 'DECIMAL_BINARIO'],
  2: ['BINARIO_ASCII', 'ASCII_BINARIO'],
  3: ['BINARIO_PALAVRA'],
  4: ['DECIMAL_PALAVRA'],
};

const instructions: Record<string, { enunciado: string; resposta: string; exemplo: string }> = {
  BINARIO_DECIMAL: {
    enunciado: 'Insira um número binário de 8 bits (ex: 00001010). Apenas zeros e uns.',
    resposta: 'Insira o valor decimal correspondente.',
    exemplo: 'Enunciado: "00001010" | Resposta: "10"'
  },
  DECIMAL_BINARIO: {
    enunciado: 'Insira um número decimal simples.',
    resposta: 'Insira o número correspondente em formato binário de 8 bits.',
    exemplo: 'Enunciado: "15" | Resposta: "00001111"'
  },
  BINARIO_ASCII: {
    enunciado: 'Insira o código binário de 8 bits correspondente a uma letra maiúscula.',
    resposta: 'Insira o caractere correspondente em formato de letra maiúscula simples.',
    exemplo: 'Enunciado: "01000001" | Resposta: "A"'
  },
  ASCII_BINARIO: {
    enunciado: 'Insira uma letra maiúscula simples (A-Z).',
    resposta: 'Insira o código binário de 8 bits correspondente a esta letra.',
    exemplo: 'Enunciado: "A" | Resposta: "01000001"'
  },
  BINARIO_PALAVRA: {
    enunciado: 'Insira códigos binários de 8 bits separados por espaço para cada caractere.',
    resposta: 'Insira a palavra decodificada correspondente (letras maiúsculas).',
    exemplo: 'Enunciado: "01010000 01001001 01000010 01001001 01000100" | Resposta: "PIBID"'
  },
  DECIMAL_PALAVRA: {
    enunciado: 'Insira códigos decimais separados por espaço para cada caractere.',
    resposta: 'Insira a palavra decodificada correspondente (letras maiúsculas).',
    exemplo: 'Enunciado: "80 73 66 73 68" | Resposta: "PIBID"'
  }
};

// Funções utilitárias para conversão automática em tempo real
const convertEnunciadoToResposta = (enunciado: string, tipo: string): string => {
  const cleanVal = enunciado.trim();
  if (!cleanVal) return '';

  try {
    switch (tipo) {
      case 'BINARIO_DECIMAL': {
        const clean = cleanVal.replace(/[^01]/g, '');
        if (!clean) return '';
        const dec = parseInt(clean, 2);
        return isNaN(dec) ? '' : dec.toString();
      }
      case 'DECIMAL_BINARIO': {
        const dec = parseInt(cleanVal, 10);
        if (isNaN(dec) || dec < 0) return '';
        return dec.toString(2).padStart(8, '0');
      }
      case 'BINARIO_ASCII': {
        const clean = cleanVal.replace(/[^01]/g, '');
        if (!clean) return '';
        const dec = parseInt(clean, 2);
        if (isNaN(dec) || dec < 0 || dec > 255) return '';
        return String.fromCharCode(dec).toUpperCase();
      }
      case 'ASCII_BINARIO': {
        if (cleanVal.length === 0) return '';
        const char = cleanVal.charAt(0).toUpperCase();
        return char.charCodeAt(0).toString(2).padStart(8, '0');
      }
      case 'BINARIO_PALAVRA': {
        const bytes = cleanVal.split(/\s+/);
        return bytes
          .map(byte => {
            const cleanByte = byte.replace(/[^01]/g, '');
            if (!cleanByte) return '';
            const dec = parseInt(cleanByte, 2);
            return isNaN(dec) || dec < 32 || dec > 255 ? '' : String.fromCharCode(dec).toUpperCase();
          })
          .join('');
      }
      case 'DECIMAL_PALAVRA': {
        const nums = cleanVal.split(/\s+/);
        return nums
          .map(num => {
            const dec = parseInt(num, 10);
            return isNaN(dec) || dec < 32 || dec > 255 ? '' : String.fromCharCode(dec).toUpperCase();
          })
          .join('');
      }
      default:
        return '';
    }
  } catch (e) {
    return '';
  }
};

const convertRespostaToEnunciado = (resposta: string, tipo: string): string => {
  const cleanVal = resposta.trim();
  if (!cleanVal) return '';

  try {
    switch (tipo) {
      case 'BINARIO_DECIMAL': {
        const dec = parseInt(cleanVal, 10);
        if (isNaN(dec) || dec < 0) return '';
        return dec.toString(2).padStart(8, '0');
      }
      case 'DECIMAL_BINARIO': {
        const clean = cleanVal.replace(/[^01]/g, '');
        if (!clean) return '';
        const dec = parseInt(clean, 2);
        return isNaN(dec) ? '' : dec.toString();
      }
      case 'BINARIO_ASCII': {
        if (cleanVal.length === 0) return '';
        const char = cleanVal.charAt(0).toUpperCase();
        return char.charCodeAt(0).toString(2).padStart(8, '0');
      }
      case 'ASCII_BINARIO': {
        const clean = cleanVal.replace(/[^01]/g, '');
        if (!clean) return '';
        const dec = parseInt(clean, 2);
        if (isNaN(dec) || dec < 0 || dec > 255) return '';
        return String.fromCharCode(dec).toUpperCase();
      }
      case 'BINARIO_PALAVRA': {
        return cleanVal
          .toUpperCase()
          .split('')
          .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
          .join(' ');
      }
      case 'DECIMAL_PALAVRA': {
        return cleanVal
          .toUpperCase()
          .split('')
          .map(char => char.charCodeAt(0).toString(10))
          .join(' ');
      }
      default:
        return '';
    }
  } catch (e) {
    return '';
  }
};

export default function QuestoesPagina() {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<Questao | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [sugestaoGerada, setSugestaoGerada] = useState(false);
  const [loadingSugestao, setLoadingSugestao] = useState(false);

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

  const handleNivelChange = (nivel: number) => {
    const tiposValidos = mapNivelParaTipos[nivel] || [];
    const novoTipo = tiposValidos[0] || 'BINARIO_DECIMAL';
    setFormData((prev) => ({
      ...prev,
      nivel,
      tipo: novoTipo,
      enunciado: '',
      respostaCorreta: '',
    }));
    setSugestaoGerada(false);
  };

  const handleTipoChange = (tipo: string) => {
    setFormData((prev) => ({
      ...prev,
      tipo,
      enunciado: '',
      respostaCorreta: '',
    }));
    setSugestaoGerada(false);
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
    setSugestaoGerada(false);
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

  const handleGerarSugestao = async () => {
    setLoadingSugestao(true);
    try {
      const res = await fetch(`/api/professor/questoes/sugerir?nivel=${formData.nivel}&tipo=${formData.tipo}`);
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          enunciado: data.enunciado,
          respostaCorreta: data.respostaCorreta
        }));
        setSugestaoGerada(true);
      } else {
        alert('Erro ao gerar sugestão.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar sugestão.');
    } finally {
      setLoadingSugestao(false);
    }
  };

  const handleDescartarSugestao = () => {
    setFormData(prev => ({
      ...prev,
      enunciado: '',
      respostaCorreta: ''
    }));
    setSugestaoGerada(false);
  };

  const handleEnunciadoChange = (val: string) => {
    if (val === '') {
      setFormData(prev => ({ ...prev, enunciado: '', respostaCorreta: '' }));
      return;
    }
    const calculatedResposta = convertEnunciadoToResposta(val, formData.tipo);
    setFormData(prev => ({
      ...prev,
      enunciado: val,
      respostaCorreta: calculatedResposta !== '' ? calculatedResposta : prev.respostaCorreta
    }));
  };

  const handleRespostaChange = (val: string) => {
    if (val === '') {
      setFormData(prev => ({ ...prev, respostaCorreta: '', enunciado: '' }));
      return;
    }
    const calculatedEnunciado = convertRespostaToEnunciado(val, formData.tipo);
    setFormData(prev => ({
      ...prev,
      respostaCorreta: val,
      enunciado: calculatedEnunciado !== '' ? calculatedEnunciado : prev.enunciado
    }));
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
      setSugestaoGerada(false);
      carregarQuestoes();
    }
  };

  if (loading && questoes.length === 0) return <div className="p-8 text-white">Carregando...</div>;

  const currentInstructions = instructions[formData.tipo] || { enunciado: '', resposta: '', exemplo: '' };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-yellow-400">Gestão de Questões</h1>
          <div className="space-x-4 flex items-center">
            <button
              onClick={() => {
                setEditando(null);
                setFormData({ nivel: 1, tipo: 'BINARIO_DECIMAL', enunciado: '', respostaCorreta: '', ativo: true });
                setSugestaoGerada(false);
                setShowForm(true);
              }}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-bold transition-colors cursor-pointer"
            >
              + Nova Questão
            </button>
            <Link href="/professor" className="text-blue-400 hover:underline">Voltar</Link>
          </div>
        </div>

        {showForm && (
          <div className="mb-12 bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-xl animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-3">
              <h2 className="text-2xl font-bold text-blue-400">{editando ? 'Editar Questão' : 'Nova Questão'}</h2>
              <button 
                type="button" 
                onClick={handleGerarSugestao}
                disabled={loadingSugestao}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loadingSugestao ? 'Gerando...' : '⚡ Gerar Sugestão de Questão'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nível</label>
                <select
                  value={formData.nivel}
                  onChange={(e) => handleNivelChange(parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Nível 1 (Binário / Decimal)</option>
                  <option value={2}>Nível 2 (ASCII / Binário)</option>
                  <option value={3}>Nível 3 (Palavra / Binário)</option>
                  <option value={4}>Nível 4 (Palavra / Decimal)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Questão</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                >
                  {(mapNivelParaTipos[formData.nivel] || []).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Box de Instruções baseada no Tipo */}
              <div className="md:col-span-2 bg-blue-950/20 border border-blue-900/40 p-4 rounded text-xs text-blue-300 font-mono">
                <p className="font-bold text-blue-400 mb-1">📋 GUIA DE FORMATO DO TIPO SELECIONADO:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Enunciado:</strong> {currentInstructions.enunciado}</li>
                  <li><strong>Resposta:</strong> {currentInstructions.resposta}</li>
                  <li><strong>Exemplo Prático:</strong> <code className="text-yellow-400 font-bold bg-zinc-950 px-1.5 py-0.5 rounded">{currentInstructions.exemplo}</code></li>
                </ul>
              </div>

              {sugestaoGerada && (
                <div className="md:col-span-2 bg-purple-950/20 border border-purple-900/40 p-3 rounded flex justify-between items-center text-xs text-purple-300 font-mono">
                  <span>💡 Sugestão automática carregada nos campos! Você pode editar, salvar ou descartar.</span>
                  <button 
                    type="button" 
                    onClick={handleDescartarSugestao}
                    className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                  >
                    Descartar Sugestão
                  </button>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Enunciado 
                  <span className="text-[10px] text-gray-400 ml-2 font-normal">(Sincroniza Resposta automaticamente)</span>
                </label>
                <textarea
                  value={formData.enunciado}
                  onChange={(e) => handleEnunciadoChange(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 h-24 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Insira o enunciado da questão..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                  Resposta Correta
                  <span className="text-[10px] text-gray-400 ml-2 font-normal">(Sincroniza Enunciado automaticamente)</span>
                </label>
                <input
                  type="text"
                  value={formData.respostaCorreta}
                  onChange={(e) => handleRespostaChange(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Insira a resposta correta esperada..."
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
                <label htmlFor="ativo" className="text-sm font-medium">Questão Ativa no Jogo</label>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4 mt-4 border-t border-gray-750 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setSugestaoGerada(false);
                  }}
                  className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-2 rounded font-bold transition-colors cursor-pointer"
                >
                  {editando ? 'Salvar Alterações' : 'Criar Questão'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-xl">
          <div className="p-4 bg-gray-750 border-b border-gray-750">
            <h3 className="font-bold text-gray-300">Questões Cadastradas ({questoes.length})</h3>
          </div>
          <div className="overflow-x-auto">
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
                    <td className="px-6 py-4 text-green-400 font-bold font-mono">{q.respostaCorreta}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleAtivo(q)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                          q.ativo ? 'bg-green-900 text-green-300 hover:bg-green-850' : 'bg-red-900 text-red-300 hover:bg-red-850'
                        }`}
                      >
                        {q.ativo ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 text-sm">
                      <button
                        onClick={() => handleEdit(q)}
                        className="text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
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
    </div>
  );
}
