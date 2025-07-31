'use client'
import Header from '@/components/Header/Header'
import TextEditorWithPrefix from '@/components/TextEditorWithPrefix/TextEditorWithPrefix'
import { classNames, numeroParaLetra } from '@/utils/auxiliars'
import { isEmpty } from 'lodash'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface FormData {
  titulo: string
  questoes: {
    id: string
    enunciado: string
    idItemCorreto: string
    opcoes: {
      id: string
      enunciado: string
    }[]
  }[]
}

const mockFormData: FormData = {
  titulo: 'Prova de Programação - 1º Bimestre',
  questoes: [
    {
      id: 'q1',
      enunciado: 'O que é uma variável em programação?',
      idItemCorreto: 'q1o1',
      opcoes: [
        {
          id: 'q1o1',
          enunciado: 'Um espaço na memória para armazenar valores'
        },
        { id: 'q1o2', enunciado: 'Um tipo de função' },
        { id: 'q1o3', enunciado: 'Um comando de repetição' },
        { id: 'q1o4', enunciado: 'Uma linguagem de programação' },
        { id: 'q1o5', enunciado: 'Um erro de sintaxe' }
      ]
    },
    {
      id: 'q2',
      enunciado:
        'Qual das alternativas representa corretamente uma estrutura de decisão em JavaScript?',
      idItemCorreto: 'q2o3',
      opcoes: [
        { id: 'q2o1', enunciado: 'for (x in y)' },
        { id: 'q2o2', enunciado: 'while x = 10' },
        { id: 'q2o3', enunciado: 'if (x > 10) { ... }' },
        { id: 'q2o4', enunciado: 'def funcao(x):' },
        { id: 'q2o5', enunciado: 'echo "x > 10"' }
      ]
    },
    {
      id: 'q3',
      enunciado: 'Qual é a saída do código: console.log(typeof null);',
      idItemCorreto: 'q3o2',
      opcoes: [
        { id: 'q3o1', enunciado: '"null"' },
        { id: 'q3o2', enunciado: '"object"' },
        { id: 'q3o3', enunciado: '"undefined"' },
        { id: 'q3o4', enunciado: '"boolean"' },
        { id: 'q3o5', enunciado: '"number"' }
      ]
    },
    {
      id: 'q4',
      enunciado:
        'Em qual das linguagens abaixo usamos "print()" para exibir algo na tela?',
      idItemCorreto: 'q4o3',
      opcoes: [
        { id: 'q4o1', enunciado: 'C' },
        { id: 'q4o2', enunciado: 'Java' },
        { id: 'q4o3', enunciado: 'Python' },
        { id: 'q4o4', enunciado: 'Assembly' },
        { id: 'q4o5', enunciado: 'HTML' }
      ]
    },
    {
      id: 'q5',
      enunciado: 'O que é um loop infinito?',
      idItemCorreto: 'q5o4',
      opcoes: [
        { id: 'q5o1', enunciado: 'Um tipo de estrutura condicional' },
        { id: 'q5o2', enunciado: 'Uma função que não retorna valor' },
        { id: 'q5o3', enunciado: 'Um erro de compilação' },
        {
          id: 'q5o4',
          enunciado: 'Um laço que nunca satisfaz a condição de parada'
        },
        { id: 'q5o5', enunciado: 'Um recurso para encerrar o programa' }
      ]
    }
  ]
}

const Questions = () => {
  const [mode, setMode] = useState<'RESPOSTA' | 'VISUALIZAR_RESPOSTA'>(
    'RESPOSTA'
  )

  console.log('mockFormData')
  console.log(mockFormData)

  const [respostas, setRespostas] = useState<Record<string, string>>({})

  const resetRespostas = () => {
    setRespostas(
      mockFormData.questoes.reduce<Record<string, string>>((acc, cur) => {
        acc[cur.id!] = ''
        return acc
      }, {})
    )
  }

  useEffect(() => {
    if (mockFormData) {
      resetRespostas()
    }
  }, [mockFormData])

  const isFormValid = !Object.values(respostas).some((resposta) =>
    isEmpty(resposta)
  )

  const handleChangeResposta = (idCadeira: string, idResposta: string) => {
    setRespostas((prevFormData) => ({
      ...prevFormData,
      [idCadeira]: idResposta
    }))
  }

  const handleChangeMode = (mode: 'RESPOSTA' | 'VISUALIZAR_RESPOSTA') => {
    setMode(mode)
  }

  const handleRefazer = () => {
    resetRespostas()
    handleChangeMode('RESPOSTA')
  }

  const acertos = mockFormData.questoes.reduce((acc, cur) => {
    if (cur.idItemCorreto === respostas[cur.id]) {
      return acc + 1
    }
    return acc
  }, 0)

  return (
    <div className="flex flex-col gap-2">
      <Header
        backPath="/questoes/lista-questionario"
        title="Responder questionário"
        actions={{
          primaryAction: {
            title: mode === 'VISUALIZAR_RESPOSTA' ? 'Refazer' : 'Ver respostas',
            disabled: !isFormValid,
            onClick: () =>
              mode === 'RESPOSTA'
                ? handleChangeMode('VISUALIZAR_RESPOSTA')
                : handleRefazer()
          }
        }}
      />
      <div className="bg-gray-100 border border-gray-100 rounded-2xl space-y-4 p-6">
        {mode === 'VISUALIZAR_RESPOSTA' && (
          <div className="max-w-5xl sticky top-0 z-10 mx-auto bg-white border-2 border-gray-100 rounded-2xl space-y-4 shadow-md p-6">
            <div className="flex justify-between gap-2 w-full items-center">
              <p className="font-bold text-xl">Resultado:</p>
              <span className="inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-sm font-medium text-gray-900 ring-2 ring-inset ring-gray-200">
                <p className="font-bold text-xl">
                  {acertos}/{mockFormData.questoes.length} Acertos
                </p>
              </span>
            </div>
          </div>
        )}
        <div className="max-w-5xl mx-auto bg-white border-2 border-gray-100 rounded-2xl space-y-4 shadow-md p-6">
          <div className="flex justify-between gap-2 w-full items-center">
            <TextEditorWithPrefix
              title={mockFormData.titulo}
              disabled
              handleChange={() => {}}
              type="QUESTIONARIO_TITLE"
            />
            <Image
              src={'/simple_logo.png'}
              width={500}
              className="w-20 h-auto self-center"
              quality={100}
              alt="logo"
              height={500}
            />
          </div>
        </div>
        {mockFormData.questoes.map((questao, indexQuestao) => (
          <div
            key={indexQuestao}
            className="max-w-5xl mx-auto bg-white border-2 border-gray-100 rounded-2xl space-y-4 shadow-md p-6"
          >
            <div className="flex flex-col gap-2">
              <TextEditorWithPrefix
                prefix={
                  <span className="font-bold">{indexQuestao + 1} - </span>
                }
                title={questao.enunciado}
                disabled
                handleChange={() => {}}
                type="QUESTAO_TITLE"
              />
              <div className="flex flex-col gap-3">
                {questao.opcoes.map((opcao, indexOption) => (
                  <div key={opcao.id} className={'flex gap-2 items-center'}>
                    <input
                      id={opcao.id}
                      name={questao.id}
                      checked={respostas[questao.id] === opcao.id}
                      onChange={(e) =>
                        handleChangeResposta(questao.id, opcao.id)
                      }
                      disabled={mode === 'VISUALIZAR_RESPOSTA'}
                      value={opcao.id}
                      type="radio"
                      className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-black checked:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                    />
                    <div
                      className={classNames(
                        questao.idItemCorreto === opcao.id &&
                          mode === 'VISUALIZAR_RESPOSTA'
                          ? 'ring-green-500 ring-3'
                          : '',
                        questao.idItemCorreto !== respostas[questao.id] &&
                          respostas[questao.id] === opcao.id &&
                          mode === 'VISUALIZAR_RESPOSTA'
                          ? 'ring-red-500 ring-3'
                          : '',
                        mode === 'VISUALIZAR_RESPOSTA' ? '' : 'ring-1',
                        'flex-1 p-2.5 rounded-lg ring-gray-100 shadow-md text-black'
                      )}
                    >
                      <label htmlFor={opcao.id} className="cursor-pointer">
                        <TextEditorWithPrefix
                          prefix={
                            <span className="font-bold">
                              {numeroParaLetra(indexOption + 1)}){' '}
                            </span>
                          }
                          disabled
                          title={opcao.enunciado}
                          handleChange={() => {}}
                          type="OPCAO_TITLE"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Questions
