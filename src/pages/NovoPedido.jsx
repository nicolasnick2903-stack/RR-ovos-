import { useNavigate } from 'react-router-dom'
import PedidoForm from '../components/PedidoForm.jsx'
import { criarPedido } from '../services/pedidos.js'
import { useToast } from '../hooks/useToast.jsx'

export default function NovoPedido() {
  const navigate = useNavigate()
  const toast = useToast()

  const salvar = async (dados) => {
    await criarPedido(dados)
    toast.sucesso('Pedido registrado com sucesso!')
    navigate('/pedidos')
  }

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-xl font-extrabold text-preto">Novo Pedido</h1>
        <p className="text-sm text-preto/50">Registre uma venda de ovos</p>
      </div>
      <div className="card">
        <PedidoForm onSubmit={salvar} onCancelar={() => navigate(-1)} />
      </div>
    </div>
  )
}
