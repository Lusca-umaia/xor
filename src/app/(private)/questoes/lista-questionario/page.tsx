'use client'
import Header from '@/components/Header/Header'
import { useRouter } from 'next/navigation'

const questoes = [
  {
    id: 'q001',
    nome: 'Introdução à Programação'
  },
  {
    id: 'q002',
    nome: 'Derivadas e Aplicações'
  },
  {
    id: 'q003',
    nome: 'Leis de Newton'
  },
  {
    id: 'q004',
    nome: 'Estruturas de Dados'
  },
  {
    id: 'q005',
    nome: 'Integrais Definidas'
  },
  {
    id: 'q006',
    nome: 'Lógica de Predicados'
  },
  {
    id: 'q007',
    nome: 'Algoritmos de Ordenação'
  },
  {
    id: 'q008',
    nome: 'Probabilidade e Estatística'
  }
]

const ListaQuestoes = () => {
  const router = useRouter()

  return (
    <div>
      <Header
        title={`Selecione a questão desejada!`}
        actions={{
          primaryAction: {
            title: 'Criar questionário',
            onClick: () => router.push('/questoes/criar-questionario')
          }
        }}
      />
      <div className="space-y-4">
        <div className="col-span-4 flex flex-col gap-4">
          <div className="grid grid-cols-4 justify-end gap-4">
            {questoes.map((module) => (
              <div
                key={module.nome}
                className="bg-white border flex flex-col gap-4 border-gray-100 rounded-2xl shadow-lg p-6"
              >
                <div className="flex text-center flex-col gap-2">
                  <h3 className="text-lg font-bold leading-none tracking-tight">
                    {module.nome}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    router.push('/questoes/responder-questionario')
                  }
                  className="w-full mt-auto rounded-xl block mx-auto bg-white px-3.5 py-3.5 cursor-pointer text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Responder questionário
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListaQuestoes
