'use client'
import Header from '@/components/Header/Header'
import TextEditorWithPrefix from '@/components/TextEditorWithPrefix/TextEditorWithPrefix'
import { classNames, numeroParaLetra } from '@/utils/auxiliars'
import Image from 'next/image'
import { useState } from 'react'
import { FaXmark } from 'react-icons/fa6'

class Option {
  public enunciado: string = 'Enunciado da alternativa'
  public id: string = `${Date.now()}`
}

class Questao {
  public id: string = `${Date.now()}`
  public enunciado: string = 'Enunciado da questão'
  public idItemCorreto: string | null = null
  public opcoes: FormData['questoes'][number]['opcoes'] = [new Option()]
}

interface FormData {
  titulo: string
  questoes: {
    id: string
    enunciado: string
    idItemCorreto: string | null
    opcoes: {
      id: string
      enunciado: string
    }[]
  }[]
}

const initialFormData = {
  titulo: 'Título do questionário',
  questoes: []
}

const Questions = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const handleAddQuestion = () => {
    setFormData(({ questoes, ...prevFormData }) => ({
      ...prevFormData,
      questoes: [...questoes, new Questao()]
    }))
  }

  const handleAddOption = (indexQuestao: number) => {
    setFormData(({ questoes, ...prevFormData }) => ({
      ...prevFormData,
      questoes: questoes.map(({ opcoes, ...questao }, index) => ({
        ...questao,
        opcoes: indexQuestao === index ? [...opcoes, new Option()] : opcoes
      }))
    }))
  }

  const handleChangeQuestao = (value: string, indexQuestao: number) => {
    setFormData(({ questoes, ...prevFormData }) => ({
      ...prevFormData,
      questoes: questoes.map(({ enunciado, ...questao }, index) => ({
        ...questao,
        enunciado: indexQuestao === index ? value : enunciado
      }))
    }))
  }

  const handleChangeTitulo = (value: string) => {
    setFormData((prevFormData) => ({ ...prevFormData, titulo: value }))
  }

  const handleChangeOption = (
    value: string,
    idOpcao: string,
    indexQuestao: number
  ) => {
    setFormData(({ questoes, ...prevFormData }) => ({
      ...prevFormData,
      questoes: questoes.map(({ opcoes, ...questao }, index) => ({
        ...questao,
        opcoes:
          indexQuestao === index
            ? opcoes.map((opcao) => ({
                ...opcao,
                enunciado: opcao.id === idOpcao ? value : opcao.enunciado
              }))
            : opcoes
      }))
    }))
  }

  const handleRemoveOption = (idOpcao: string, indexQuestao: number) => {
    setFormData(({ questoes, ...prevFormData }) => ({
      ...prevFormData,
      questoes: questoes.map(({ opcoes, ...questao }, index) => ({
        ...questao,
        idItemCorreto:
          idOpcao === questao.idItemCorreto ? null : questao.idItemCorreto,
        opcoes:
          indexQuestao === index
            ? opcoes.filter((opcao) => opcao.id !== idOpcao)
            : opcoes
      }))
    }))
  }

  const handleRemoveQuestao = (indexQuestao: number) => {
    setFormData(({ questoes, ...prevFormData }) => ({
      ...prevFormData,
      questoes: questoes.filter((_, index) => index !== indexQuestao)
    }))
  }

  const handleOpcaoCorreta = (idItemCorreto: string, indexQuestao: number) => {
    setFormData(({ questoes, ...prevFormData }) => ({
      ...prevFormData,
      questoes: questoes.map((questao, index) => ({
        ...questao,
        idItemCorreto:
          index === indexQuestao ? idItemCorreto : questao.idItemCorreto
      }))
    }))
  }

  return (
    <div className="flex flex-col gap-2">
      <Header
        title="Criar lista de questões"
        backPath="/questoes/lista-questionario"
        actions={{
          primaryAction: {
            title: 'Salvar',
            onClick: () => {}
          }
        }}
      />
      <div className="bg-gray-100 border border-gray-100 rounded-2xl space-y-4 p-6">
        <div className="max-w-5xl mx-auto bg-white border-2 border-gray-100 rounded-2xl space-y-4 shadow-md p-6">
          <div className="flex justify-between gap-2 w-full items-center">
            <TextEditorWithPrefix
              title={formData.titulo}
              handleChange={handleChangeTitulo}
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
        {formData.questoes.map((questao, indexQuestao) => (
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
                handleChange={(value) =>
                  handleChangeQuestao(value, indexQuestao)
                }
                type="QUESTAO_TITLE"
              />
              <div className="flex flex-col gap-3">
                {questao.opcoes.map((opcao, indexOption) => (
                  <div key={opcao.id} className="flex gap-2 items-center">
                    <input
                      name={questao.id}
                      checked={opcao.id === questao.idItemCorreto}
                      onChange={(e) =>
                        handleOpcaoCorreta(e.target.value, indexQuestao)
                      }
                      value={opcao.id}
                      type="radio"
                      className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-black checked:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                    />
                    <div
                      className={classNames(
                        questao.idItemCorreto === opcao.id
                          ? 'border-black'
                          : 'border-gray-100',
                        'flex-1 p-2.5 rounded-lg ring-1 ring-gray-100 shadow-md text-black hover:border-black duration-100 cursor-pointer'
                      )}
                    >
                      <TextEditorWithPrefix
                        prefix={
                          <span className="font-bold">
                            {numeroParaLetra(indexOption + 1)}){' '}
                          </span>
                        }
                        title={opcao.enunciado}
                        handleChange={(value) =>
                          handleChangeOption(value, opcao.id, indexQuestao)
                        }
                        type="OPCAO_TITLE"
                      />
                    </div>
                    {questao.opcoes.length > 1 && (
                      <button
                        onClick={() =>
                          handleRemoveOption(opcao.id, indexQuestao)
                        }
                      >
                        <FaXmark className="text-base cursor-pointer" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddOption(indexQuestao)}
                  className="p-1.5 gap-2 flex justify-center text-sm items-center text-gray-800 text-md border-gray-800 font-semibold border-2 cursor-pointer border-dashed w-full rounded-lg"
                >
                  Adicionar Alternativa
                </button>
                <button
                  onClick={() => handleRemoveQuestao(indexQuestao)}
                  className="p-1.5 gap-2 flex justify-center text-sm items-center text-red-600 text-md border-red-600 font-semibold border-2 cursor-pointer border-dashed w-full rounded-lg"
                >
                  Remover Questão
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleAddQuestion}
        className="p-1.5 text-base text-gray-800 border-gray-800 font-semibold border-2 cursor-pointer border-dashed w-full rounded-xl"
      >
        Adicionar questão
      </button>
    </div>
  )
}

export default Questions
