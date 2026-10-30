'use client'

import { QuestaoDiscursiva as TipoQuestao } from '@/@types/AmbienteEstudo'
import Markdown from '../Markdown/Markdown'
import { classeCampo } from '../estilos'
import { PropsQuestao } from './tipos'

export function RubricaVisivel({ questao }: { questao: TipoQuestao }) {
  const total = questao.rubrica.reduce((soma, { pontos }) => soma + pontos, 0)
  return (
    <details open className="rounded-xl bg-gray-50 p-3 text-sm">
      <summary className="cursor-pointer font-semibold text-gray-900">
        Critérios de avaliação ({total} pontos)
      </summary>
      <ul className="mt-2 space-y-1.5">
        {questao.rubrica.map((criterio) => (
          <li key={criterio.id} className="flex gap-2">
            <span className="shrink-0 rounded bg-white px-1.5 font-bold ring-1 ring-gray-200">
              {criterio.pontos}
            </span>
            <Markdown conteudo={criterio.descricao} className="text-gray-700" />
          </li>
        ))}
      </ul>
    </details>
  )
}

export default function QuestaoDiscursiva({
  questao,
  resposta,
  aoResponder,
  modo
}: PropsQuestao<TipoQuestao>) {
  const texto = resposta?.tipo === 'DISCURSIVA' ? resposta.texto : ''
  const palavras = texto.trim() ? texto.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-3">
      <RubricaVisivel questao={questao} />
      <div>
        <textarea
          value={texto}
          onChange={(evento) =>
            aoResponder({ tipo: 'DISCURSIVA', texto: evento.target.value })
          }
          readOnly={modo !== 'RESPONDENDO'}
          rows={8}
          placeholder="Escreva sua resposta com suas palavras. Fórmulas podem ser escritas em LaTeX, como $x^2$."
          aria-label="Sua resposta"
          className={classeCampo}
        />
        <p className="mt-1 text-right text-xs text-gray-500">
          {palavras} palavra(s)
        </p>
      </div>
    </div>
  )
}
