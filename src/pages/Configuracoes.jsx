import { useState } from 'react'
import { Database, Trash2, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { supabaseAtivo } from '../lib/supabase.js'
import { carregarExemplos, apagarTudo, temDados } from '../services/seed.js'

export default function Configuracoes() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [confirmar, setConfirmar] = useState(null) // 'exemplos' | 'apagar'

  const executar = () => {
    if (confirmar === 'exemplos') {
      carregarExemplos()
      toast.sucesso('Dados de exemplo carregados.')
    } else if (confirmar === 'apagar') {
      apagarTudo()
      toast.sucesso('Todos os dados foram apagados.')
    }
    setConfirmar(null)
    setTimeout(() => window.location.reload(), 400)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold text-preto">Configurações</h1>

      <div className="card flex items-center gap-3">
        <Logo size={56} />
        <div>
          <p className="font-extrabold text-preto">R&amp;R Ovos Caipiras</p>
          <p className="text-sm text-dourado-600">Qualidade direto do campo</p>
        </div>
      </div>

      <div className="card space-y-2 text-sm">
        <p className="text-[11px] font-bold uppercase tracking-wide text-preto/45">Dados da empresa</p>
        <Linha rotulo="Nome" valor="R&R Ovos Caipiras" />
        <Linha rotulo="Slogan" valor="Qualidade direto do campo" />
        <Linha rotulo="Logo" valor="public/logo.png" />
        <p className="pt-1 text-xs text-preto/40">
          A edição dos dados da empresa será liberada em uma próxima versão.
        </p>
      </div>

      <div className="card space-y-2 text-sm">
        <p className="text-[11px] font-bold uppercase tracking-wide text-preto/45">Conta</p>
        <Linha rotulo="Usuário" valor={user?.email} />
        <Linha rotulo="Perfil" valor="Administrador" />
        <Linha rotulo="Banco de dados" valor={supabaseAtivo ? 'Supabase (nuvem)' : 'Local (neste aparelho)'} />
      </div>

      {!supabaseAtivo && (
        <div className="card space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-preto/45">Dados de teste</p>
          <p className="text-xs text-preto/50">
            O banco na nuvem ainda não está conectado — os dados ficam neste aparelho. Use os
            botões abaixo para testar a interface.
          </p>
          <button onClick={() => setConfirmar('exemplos')} className="btn-ghost flex items-center justify-center gap-2">
            <Database size={16} /> {temDados() ? 'Recarregar dados de exemplo' : 'Carregar dados de exemplo'}
          </button>
          <button onClick={() => setConfirmar('apagar')} className="btn-danger flex items-center justify-center gap-2">
            <Trash2 size={16} /> Apagar todos os dados
          </button>
        </div>
      )}

      <div className="card">
        <p className="text-[11px] font-bold uppercase tracking-wide text-preto/45">Em breve</p>
        <p className="mt-1 text-xs text-preto/50">
          Estoque de ovos · Fornecedores · Contas a receber · Entregas · Recibo e impressão ·
          Múltiplos usuários e permissões.
        </p>
      </div>

      <button
        onClick={() => { logout(); navigate('/login', { replace: true }) }}
        className="btn-ghost flex items-center justify-center gap-2 text-alerta"
      >
        <LogOut size={16} /> Sair
      </button>

      <ConfirmDialog
        aberto={!!confirmar}
        titulo={confirmar === 'apagar' ? 'Apagar tudo' : 'Carregar exemplos'}
        mensagem={
          confirmar === 'apagar'
            ? 'Isso remove todos os clientes e pedidos deste aparelho. Não dá pra desfazer.'
            : 'Isso substitui os dados atuais por clientes e pedidos de exemplo.'
        }
        textoConfirmar={confirmar === 'apagar' ? 'Apagar tudo' : 'Carregar'}
        onConfirmar={executar}
        onCancelar={() => setConfirmar(null)}
      />
    </div>
  )
}

function Linha({ rotulo, valor }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-preto/55">{rotulo}</span>
      <span className="text-right font-semibold text-preto">{valor}</span>
    </div>
  )
}
