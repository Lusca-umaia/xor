'use client'

import { LuMessagesSquare } from 'react-icons/lu'
import EstadoVazio from '@/components/AmbienteEstudo/EstadoVazio/EstadoVazio'

// No mobile, a lista (no layout) ocupa a tela; no desktop, este é o painel vazio.
export default function ChatsPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-lg">
        <EstadoVazio
          icone={<LuMessagesSquare />}
          titulo="Selecione um chat ou crie um novo"
          descricao="Cada chat tem seus próprios materiais de contexto e modo de resposta. Use um chat por assunto para manter as conversas organizadas."
        />
      </div>
    </div>
  )
}
