'use client';

import { useState, useEffect } from 'react';

interface Transacao {
  id: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
}

interface Usuario {
  email: string;
  nome: string;
}

export default function Home() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [tela, setTela] = useState<'login' | 'cadastro' | 'dashboard'>('login');
  
  // Estados de inputs de Login / Cadastro
  const [emailInput, setEmailInput] = useState('');
  const [nomeInput, setNomeInput] = useState('');
  const [erro, setErro] = useState('');

  // Estados do Dashboard Financeiro
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [categoria, setCategoria] = useState('Geral');

  // Verificar se já existe usuário logado na sessão ao carregar
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('gestor_rita_usuario_atual');
    if (usuarioSalvo) {
      const user = JSON.parse(usuarioSalvo);
      setUsuarioLogado(user);
      carregarTransacoes(user.email);
      setTela('dashboard');
    }
  }, []);

  const carregarTransacoes = (email: string) => {
    const salvo = localStorage.getItem(`gestor_transacoes_${email}`);
    if (salvo) {
      try {
        setTransacoes(JSON.parse(salvo));
      } catch (e) {
        console.error(e);
      }
    } else {
      setTransacoes([]);
    }
  };

  const lidarComCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !nomeInput) {
      setErro('Preencha todos os campos.');
      return;
    }

    const usuariosCadastrados = JSON.parse(localStorage.getItem('gestor_rita_usuarios') || '[]');
    const existe = usuariosCadastrados.find((u: Usuario) => u.email === emailInput);

    if (existe) {
      setErro('Este e-mail já está cadastrado. Faça login.');
      return;
    }

    const novoUsuario: Usuario = { email: emailInput, nome: nomeInput };
    usuariosCadastrados.push(novoUsuario);
    localStorage.setItem('gestor_rita_usuarios', JSON.stringify(usuariosCadastrados));
    localStorage.setItem('gestor_rita_usuario_atual', JSON.stringify(novoUsuario));

    setUsuarioLogado(novoUsuario);
    carregarTransacoes(emailInput);
    setErro('');
    setEmailInput('');
    setNomeInput('');
    setTela('dashboard');
  };

  const lidarComLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      setErro('Digite o seu e-mail.');
      return;
    }

    const usuariosCadastrados = JSON.parse(localStorage.getItem('gestor_rita_usuarios') || '[]');
    const usuarioEncontrado = usuariosCadastrados.find((u: Usuario) => u.email === emailInput);

    if (!usuarioEncontrado) {
      const novoUsuario: Usuario = { email: emailInput, nome: emailInput.split('@')[0] };
      usuariosCadastrados.push(novoUsuario);
      localStorage.setItem('gestor_rita_usuarios', JSON.stringify(usuariosCadastrados));
      localStorage.setItem('gestor_rita_usuario_atual', JSON.stringify(novoUsuario));
      setUsuarioLogado(novoUsuario);
      carregarTransacoes(emailInput);
    } else {
      localStorage.setItem('gestor_rita_usuario_atual', JSON.stringify(usuarioEncontrado));
      setUsuarioLogado(usuarioEncontrado);
      carregarTransacoes(usuarioEncontrado.email);
    }

    setErro('');
    setEmailInput('');
    setNomeInput('');
    setTela('dashboard');
  };

  const fazerLogout = () => {
    localStorage.removeItem('gestor_rita_usuario_atual');
    setUsuarioLogado(null);
    setTransacoes([]);
    setTela('login');
  };

  const adicionarTransacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !usuarioLogado) return;

    const nova: Transacao = {
      id: Date.now().toString(),
      descricao,
      valor: parseFloat(valor),
      tipo,
      categoria,
    };

    const atualizadas = [nova, ...transacoes];
    setTransacoes(atualizadas);
    localStorage.setItem(`gestor_transacoes_${usuarioLogado.email}`, JSON.stringify(atualizadas));

    setDescricao('');
    setValor('');
  };

  const totalReceitas = transacoes
    .filter((t) => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);

  const totalDespesas = transacoes
    .filter((t) => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  const saldoAtual = totalReceitas - totalDespesas;

  // TELA DE LOGIN / AUTENTICAÇÃO
  if (tela === 'login' || tela === 'cadastro') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white text-3xl font-black rounded-2xl shadow-lg mb-4">
              R
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Gestor Pessoal Rita</h1>
            <p className="text-sm text-gray-500 mt-1">Sua liberdade e controle financeiro inteligente</p>
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
              {erro}
            </div>
          )}

          {tela === 'login' ? (
            <form onSubmit={lidarComLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">E-mail de Acesso</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-3 text-sm transition-colors shadow-md"
              >
                Entrar na Conta
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setTela('cadastro'); setErro(''); }}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Não tem uma conta? Criar novo usuário
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={lidarComCadastro} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Seu Nome</label>
                <input
                  type="text"
                  placeholder="Ex: Rita Maria"
                  value={nomeInput}
                  onChange={(e) => setNomeInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Seu E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl p-3 text-sm transition-colors shadow-md"
              >
                Cadastrar e Acessar
              </button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setTela('login'); setErro(''); }}
                  className="text-xs text-gray-700 hover:underline font-semibold"
                >
                  Já possui uma conta? Voltar para o Login
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    );
  }

  // TELA DO DASHBOARD FINANCEIRO (USUÁRIO LOGADO)
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 text-white text-xl font-black rounded-xl flex items-center justify-center shadow">
              R
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestor Pessoal Rita</h1>
              <p className="text-sm text-gray-500">Olá, <span className="font-semibold text-gray-700">{usuarioLogado?.nome || usuarioLogado?.email}</span>!</p>
            </div>
          </div>
          <button
            onClick={fazerLogout}
            className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-100"
          >
            Sair da Conta
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Saldo Atual</h2>
            <p className={`text-2xl font-extrabold mt-2 ${saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldoAtual.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Receitas do Mês</h2>
            <p className="text-2xl font-extrabold text-blue-600 mt-2">R$ {totalReceitas.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Despesas do Mês</h2>
            <p className="text-2xl font-extrabold text-red-600 mt-2">R$ {totalDespesas.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-md font-bold text-gray-800 mb-4">Novo Lançamento</h2>
          <form onSubmit={adicionarTransacao} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Descrição (ex: Supermercado)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Valor (R$)"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa')}
              className="border border-gray-300 rounded-xl p-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl p-3 text-sm transition-colors shadow-md"
            >
              Adicionar
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-md font-bold text-gray-800 mb-4">Lançamentos Recentes</h2>
          {transacoes.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">Nenhum lançamento cadastrado para este usuário ainda.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {transacoes.map((t) => (
                <li key={t.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{t.descricao}</p>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t.tipo}</span>
                  </div>
                  <span className={`font-bold ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {t.valor.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}




